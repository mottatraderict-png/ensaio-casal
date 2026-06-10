import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-password');
  return auth === process.env.ADMIN_PASSWORD;
}

// GET single order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ order: data });
}

// PATCH - update status or upload previews or release download
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  const supabase = getAdminClient();

  // Upload preview photos
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const photos = formData.getAll('previews') as File[];

    if (photos.length === 0) {
      return NextResponse.json({ error: 'Nenhuma foto enviada' }, { status: 400 });
    }

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('preview_photos')
      .eq('id', params.id)
      .single();

    if (fetchError) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });

    const existingPreviews = order.preview_photos || [];
    const newPreviews = [];

    // Upload previews. We store both the watermarked URL (for display) and clean URL (for delivery)
    for (const photo of photos) {
      const buffer = await photo.arrayBuffer();
      const ext = photo.name.split('.').pop() || 'jpg';
      const photoId = uuidv4();

      // Upload clean version (for final delivery)
      const cleanPath = `orders/${params.id}/previews/clean/${photoId}.${ext}`;
      await supabase.storage.from('ensaio-photos').upload(cleanPath, buffer, { contentType: photo.type });
      const { data: cleanUrl } = supabase.storage.from('ensaio-photos').getPublicUrl(cleanPath);

      // Upload watermarked version (client sees this)
      // NOTE: For actual watermarking, process the image server-side with sharp/jimp
      // For now, we store the same file in preview path - Claude Code will add watermark processing
      const previewPath = `orders/${params.id}/previews/watermarked/${photoId}.${ext}`;
      await supabase.storage.from('ensaio-photos').upload(previewPath, buffer, { contentType: photo.type });
      const { data: previewUrl } = supabase.storage.from('ensaio-photos').getPublicUrl(previewPath);

      newPreviews.push({
        id: photoId,
        url: previewUrl.publicUrl,         // watermarked - shown to client
        clean_url: cleanUrl.publicUrl,      // clean - released after payment
        filename: photo.name,
        selected: false,
      });
    }

    const allPreviews = [...existingPreviews, ...newPreviews];

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        preview_photos: allPreviews,
        status: 'preview_sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ success: true, count: newPreviews.length });
  }

  // JSON update (status change, release download, etc.)
  const body = await req.json();

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.status) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;

  // Release download: set status to paid
  if (body.action === 'release_download') {
    updateData.status = 'paid';
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

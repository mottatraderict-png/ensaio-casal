import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60;

function generateOrderNumber(): string {
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${dd}${mm}${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const packageType = formData.get('package') as string;
    const refsRaw = formData.get('refs') as string;
    const referenceIds = JSON.parse(refsRaw);
    const photos = formData.getAll('photos') as File[];

    if (!name || !whatsapp || !packageType || photos.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    // Upload client photos to Supabase Storage
    const uploadedPhotos = [];
    for (const photo of photos) {
      const buffer = await photo.arrayBuffer();
      const ext = photo.name.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      const path = `orders/${orderId}/client/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('ensaio-photos')
        .upload(path, buffer, { contentType: photo.type });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('ensaio-photos')
        .getPublicUrl(path);

      uploadedPhotos.push({
        id: uuidv4(),
        url: urlData.publicUrl,
        filename: photo.name,
      });
    }

    // Insert order in database
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        client_name: name,
        whatsapp: whatsapp,
        package_type: packageType,
        reference_ids: referenceIds,
        client_photos: uploadedPhotos,
        preview_photos: [],
        selected_photo_ids: [],
        status: 'pending',
      });

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'Erro ao salvar pedido' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderNumber, orderId });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  // Check admin auth via header
  return NextResponse.json({ error: 'Use /api/admin/orders' }, { status: 403 });
}

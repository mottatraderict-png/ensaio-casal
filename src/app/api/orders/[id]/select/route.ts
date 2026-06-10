import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { selectedIds } = body;

    if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json({ error: 'Selecione ao menos uma foto' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('preview_photos, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (order.status !== 'preview_sent') {
      return NextResponse.json({ error: 'Este pedido não está aguardando seleção' }, { status: 400 });
    }

    // Mark selected photos
    const updatedPreviews = (order.preview_photos || []).map((photo: { id: string; selected: boolean }) => ({
      ...photo,
      selected: selectedIds.includes(photo.id),
    }));

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        preview_photos: updatedPreviews,
        selected_photo_ids: selectedIds,
        status: 'selected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

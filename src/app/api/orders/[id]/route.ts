import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, client_name, status, preview_photos, selected_photo_ids, package_type, created_at')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  // Hide clean_url unless order is paid
  const isPaid = data.status === 'paid' || data.status === 'delivered';
  const safeOrder = {
    ...data,
    preview_photos: (data.preview_photos || []).map((p: { id: string; url: string; clean_url: string; filename: string; selected: boolean }) => ({
      id: p.id,
      url: p.url, // watermarked
      clean_url: isPaid ? p.clean_url : null, // only expose clean URL after payment
      filename: p.filename,
      selected: p.selected,
    })),
  };

  return NextResponse.json({ order: safeOrder });
}

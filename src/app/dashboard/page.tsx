'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Order, REFERENCE_PHOTOS } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Aguardando',
  in_production: '🎨 Produzindo',
  preview_sent: '👁 Prévia enviada',
  selected: '✅ Fotos escolhidas',
  paid: '💰 Pago',
  delivered: '📦 Entregue',
};

const STATUS_NEXT: Record<string, string> = {
  pending: 'in_production',
  in_production: 'preview_sent',
  preview_sent: 'selected',
  selected: 'paid',
  paid: 'delivered',
};

export default function DashboardPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [copyMsg, setCopyMsg] = useState('');

  async function login() {
    setLoading(true);
    const res = await fetch('/api/admin/orders', {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setAuthed(true);
    } else {
      alert('Senha incorreta');
    }
    setLoading(false);
  }

  async function refreshOrders() {
    const res = await fetch('/api/admin/orders', {
      headers: { 'x-admin-password': password },
    });
    const data = await res.json();
    setOrders(data.orders);
  }

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ status }),
    });
    await refreshOrders();
    if (selectedOrder?.id === orderId) {
      const updated = orders.find((o) => o.id === orderId);
      if (updated) setSelectedOrder({ ...updated, status: status as Order['status'] });
    }
  }

  async function releaseDownload(orderId: string) {
    if (!confirm('Liberar download para este cliente?')) return;
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ action: 'release_download' }),
    });
    await refreshOrders();
    alert('Download liberado! ✅');
  }

  async function uploadPreviews(orderId: string) {
    if (previewFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    previewFiles.forEach((f) => formData.append('previews', f));
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'x-admin-password': password },
      body: formData,
    });
    setPreviewFiles([]);
    await refreshOrders();
    alert(`${previewFiles.length} prévia(s) enviada(s)! ✅`);
    setUploading(false);
  }

  function copyOrderLink(orderId: string) {
    const url = `${window.location.origin}/order/${orderId}`;
    navigator.clipboard.writeText(url);
    setCopyMsg(orderId);
    setTimeout(() => setCopyMsg(''), 2000);
  }

  function downloadClientPhotos(order: Order) {
    order.client_photos.forEach((photo) => {
      const a = document.createElement('a');
      a.href = photo.url;
      a.download = photo.filename;
      a.target = '_blank';
      a.click();
    });
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div className="card-dark" style={{ padding: 40, width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <Image src="/logo/logo.png" alt="Logo" width={56} height={56} style={{ objectFit: 'contain', margin: '0 auto 20px' }} />
          <h1 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 28 }}>Imagem Art — Gestão de Pedidos</p>
          <input
            className="input-field"
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            style={{ marginBottom: 16 }}
          />
          <button className="btn-primary" style={{ width: '100%' }} onClick={login} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-dark)', display: 'flex' }}>
      {/* Sidebar - order list */}
      <aside style={{
        width: 340,
        borderRight: '1px solid rgba(201,103,122,0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(201,103,122,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Image src="/logo/logo.png" alt="Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
            <div>
              <div className="font-serif" style={{ fontSize: 16, fontWeight: 700 }}>Dashboard</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{orders.length} pedidos total</div>
            </div>
            <button
              onClick={refreshOrders}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 18 }}
              title="Atualizar"
            >↻</button>
          </div>
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(201,103,122,0.3)',
              color: 'var(--color-text)',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <option value="all">Todos os pedidos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredOrders.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>
              Nenhum pedido encontrado
            </div>
          )}
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(201,103,122,0.08)',
                cursor: 'pointer',
                background: selectedOrder?.id === order.id ? 'rgba(201,103,122,0.08)' : 'transparent',
                borderLeft: selectedOrder?.id === order.id ? '3px solid var(--color-rose)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{order.client_name}</p>
                  <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>#{order.order_number} · {order.whatsapp}</p>
                </div>
                <span style={{
                  fontSize: 10,
                  background: 'rgba(201,103,122,0.15)',
                  color: 'var(--color-rose)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                  {order.package_type} · {order.client_photos?.length || 0} foto(s) · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 24px' }}>
        {!selectedOrder ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--color-muted)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              <p>Selecione um pedido para gerenciar</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Order header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              <div>
                <h1 className="font-serif" style={{ fontSize: 26 }}>{selectedOrder.client_name}</h1>
                <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                  Pedido #{selectedOrder.order_number} · {selectedOrder.package_type} · {selectedOrder.whatsapp}
                </p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn-outline"
                  style={{ fontSize: 13, padding: '8px 18px' }}
                  onClick={() => copyOrderLink(selectedOrder.id)}
                >
                  {copyMsg === selectedOrder.id ? '✅ Copiado!' : '🔗 Link do pedido'}
                </button>
                <button
                  style={{
                    background: 'rgba(100,200,150,0.15)',
                    color: '#64c896',
                    border: '1px solid rgba(100,200,150,0.3)',
                    borderRadius: 50,
                    padding: '8px 18px',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => window.open(`https://wa.me/55${selectedOrder.whatsapp.replace(/\D/g, '')}`, '_blank')}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            {/* Status control */}
            <div className="card-dark" style={{ padding: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>Status do pedido</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => updateStatus(selectedOrder.id, val)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: `1.5px solid ${selectedOrder.status === val ? 'var(--color-rose)' : 'rgba(201,103,122,0.2)'}`,
                      background: selectedOrder.status === val ? 'rgba(201,103,122,0.15)' : 'transparent',
                      color: selectedOrder.status === val ? 'var(--color-rose)' : 'var(--color-muted)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Client photos */}
              <div className="card-dark" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>📸 Fotos do Cliente</p>
                  <button
                    style={{
                      background: 'rgba(100,150,255,0.15)',
                      color: '#6496ff',
                      border: '1px solid rgba(100,150,255,0.3)',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => downloadClientPhotos(selectedOrder)}
                  >
                    ⬇ Baixar tudo
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {selectedOrder.client_photos?.map((photo) => (
                    <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.url}
                        alt=""
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* References chosen */}
              <div className="card-dark" style={{ padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🎨 Modelos Escolhidos</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                  {selectedOrder.reference_ids?.map((refId) => {
                    const ref = REFERENCE_PHOTOS.find((r) => r.id === refId);
                    if (!ref) return null;
                    return (
                      <div key={refId} style={{ position: 'relative' }}>
                        <img
                          src={ref.url}
                          alt={ref.label}
                          style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'rgba(0,0,0,0.7)',
                          padding: '4px',
                          fontSize: 9,
                          color: 'white',
                          textAlign: 'center',
                          borderRadius: '0 0 8px 8px',
                        }}>
                          {ref.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upload previews */}
            <div className="card-dark" style={{ padding: 20, marginTop: 24 }}>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>🖼 Enviar Prévias</p>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, marginBottom: 16 }}>
                As imagens enviadas aqui aparecerão <strong style={{ color: 'var(--color-rose)' }}>com sua logo</strong> sobreposta para o cliente escolher.
                A versão limpa ficará guardada para entregar após o pagamento.
              </p>
              <div
                className="upload-zone"
                style={{ marginBottom: 16 }}
                onClick={() => document.getElementById('preview-upload')?.click()}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Clique para selecionar as prévias</p>
                <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>JPG ou PNG — sem limite de quantidade</p>
                <input
                  id="preview-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files) setPreviewFiles(Array.from(e.target.files));
                  }}
                />
              </div>
              {previewFiles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: 'var(--color-muted)', fontSize: 13, marginBottom: 8 }}>{previewFiles.length} arquivo(s) selecionado(s)</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {previewFiles.map((f, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(f)}
                        alt=""
                        style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <button
                className="btn-primary"
                disabled={previewFiles.length === 0 || uploading}
                onClick={() => uploadPreviews(selectedOrder.id)}
              >
                {uploading ? 'Enviando...' : `📤 Enviar ${previewFiles.length > 0 ? previewFiles.length : ''} Prévia(s)`}
              </button>
            </div>

            {/* Preview photos sent */}
            {selectedOrder.preview_photos?.length > 0 && (
              <div className="card-dark" style={{ padding: 20, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                      🖼 Prévias Enviadas ({selectedOrder.preview_photos.length})
                    </p>
                    {selectedOrder.selected_photo_ids?.length > 0 && (
                      <p style={{ color: 'var(--color-gold)', fontSize: 13 }}>
                        ✅ Cliente escolheu {selectedOrder.selected_photo_ids.length} foto(s)
                      </p>
                    )}
                  </div>
                  {selectedOrder.status === 'selected' && (
                    <button
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #64c896, #3da870)', fontSize: 13, padding: '8px 20px' }}
                      onClick={() => releaseDownload(selectedOrder.id)}
                    >
                      💰 Liberar Download
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {selectedOrder.preview_photos.map((photo) => {
                    const isChosen = selectedOrder.selected_photo_ids?.includes(photo.id);
                    return (
                      <div key={photo.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                        <img
                          src={photo.url}
                          alt=""
                          style={{
                            width: '100%',
                            aspectRatio: '4/5',
                            objectFit: 'cover',
                            display: 'block',
                            filter: isChosen ? 'none' : 'grayscale(0.3)',
                          }}
                        />
                        {isChosen && (
                          <div style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'var(--color-gold)',
                            borderRadius: '50%',
                            width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12,
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

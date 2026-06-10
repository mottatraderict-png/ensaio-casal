'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Order } from '@/types';

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setSelectedIds(data.order.selected_photo_ids || []);
          if (data.order.status === 'selected' || data.order.status === 'paid' || data.order.status === 'delivered') {
            setSubmitted(true);
          }
        } else {
          setError('Pedido não encontrado.');
        }
      })
      .catch(() => setError('Erro ao carregar pedido.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleConfirm() {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Erro ao confirmar seleção');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-dark)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💕</div>
          <p style={{ color: 'var(--color-muted)' }}>Carregando seu pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-dark)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
          <p style={{ color: 'var(--color-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const previews = order?.preview_photos || [];
  const isPaid = order?.status === 'paid' || order?.status === 'delivered';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-dark)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(201,103,122,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <Image src="/logo/logo.png" alt="Imagem Art" width={40} height={40} style={{ objectFit: 'contain' }} />
        <div>
          <div className="font-serif" style={{ fontSize: 18, fontWeight: 700 }}>Imagem Art</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Ensaio com IA</div>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Order info */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 className="font-serif" style={{ fontSize: 26 }}>
              Olá, {order?.client_name?.split(' ')[0]}! 💕
            </h1>
            <span className="status-badge" style={{
              background: 'rgba(201,103,122,0.15)',
              color: 'var(--color-rose)',
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
            }}>
              Pedido #{order?.order_number}
            </span>
          </div>
        </div>

        {/* No previews yet */}
        {previews.length === 0 && order?.status === 'pending' && (
          <div className="card-dark" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 12 }}>Seu ensaio está sendo produzido</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
              Estamos criando suas fotos personalizadas com muito carinho.<br />
              Em breve enviaremos uma prévia aqui e no seu WhatsApp!
            </p>
          </div>
        )}

        {/* Previews to select */}
        {previews.length > 0 && !submitted && !isPaid && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 8 }}>
                Escolha suas fotos favoritas ✨
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                Selecione as fotos que você mais amou. Depois que confirmar, vamos finalizar e enviar em alta qualidade!
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 14,
              marginBottom: 32,
            }}>
              {previews.map((photo) => {
                const isSelected = selectedIds.includes(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`preview-photo-card ${isSelected ? 'selected-preview' : ''}`}
                    onClick={() => toggleSelect(photo.id)}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Selection overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: isSelected ? 'rgba(201,169,110,0.15)' : 'transparent',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      padding: 10,
                    }}>
                      <div style={{
                        width: 28, height: 28,
                        borderRadius: '50%',
                        background: isSelected ? 'var(--color-gold)' : 'rgba(0,0,0,0.5)',
                        border: `2px solid ${isSelected ? 'var(--color-gold)' : 'rgba(255,255,255,0.4)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirm button */}
            <div style={{
              position: 'sticky', bottom: 16,
              background: 'var(--color-dark)',
              padding: '16px 0',
              borderTop: '1px solid rgba(201,103,122,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{selectedIds.length}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: 14 }}> foto(s) selecionada(s)</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ minWidth: 200 }}
                  disabled={selectedIds.length === 0 || submitting}
                  onClick={handleConfirm}
                >
                  {submitting ? 'Confirmando...' : '✅ Confirmar Seleção'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Already selected - waiting payment */}
        {submitted && !isPaid && (
          <div className="card-dark" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 12 }}>Seleção confirmada!</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
              Você escolheu <strong style={{ color: 'var(--color-rose)' }}>{selectedIds.length} foto(s)</strong>.<br />
              Vamos entrar em contato pelo WhatsApp para combinar o pagamento e liberar as imagens em alta qualidade! 💕
            </p>
          </div>
        )}

        {/* Paid - download available */}
        {isPaid && (
          <div>
            <div className="card-dark" style={{ padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 8 }}>Suas fotos estão prontas!</h2>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Clique em cada foto para baixar em alta qualidade</p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 14,
            }}>
              {previews
                .filter((p) => order?.selected_photo_ids?.includes(p.id))
                .map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.clean_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <div className="preview-photo-card" style={{ border: '2px solid var(--color-gold)' }}>
                      <img
                        src={photo.clean_url}
                        alt=""
                        style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '20px 12px 12px',
                        textAlign: 'center',
                      }}>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>⬇ Baixar</span>
                      </div>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

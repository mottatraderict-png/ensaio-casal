'use client';

import { useState } from 'react';
import Image from 'next/image';
import { REFERENCE_PHOTOS, PACKAGES } from '@/types';

type Step = 'package' | 'references' | 'photos' | 'info' | 'success';

export default function HomePage() {
  const [step, setStep] = useState<Step>('package');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [clientPhotos, setClientPhotos] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const currentPackage = PACKAGES.find((p) => p.id === selectedPackage);
  const maxRefs = selectedPackage === 'basico' ? 2 : selectedPackage === 'romantico' ? 4 : 15;

  function toggleRef(id: string) {
    setSelectedRefs((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= maxRefs) return prev;
      return [...prev, id];
    });
  }

  function handleFileChange(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setClientPhotos((prev) => [...prev, ...arr].slice(0, 10));
  }

  function removePhoto(idx: number) {
    setClientPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function formatWhatsApp(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit() {
    if (!name || !whatsapp || clientPhotos.length === 0 || selectedRefs.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('whatsapp', whatsapp);
      formData.append('package', selectedPackage);
      formData.append('refs', JSON.stringify(selectedRefs));
      clientPhotos.forEach((f) => formData.append('photos', f));

      const res = await fetch('/api/orders', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.orderNumber) {
        setOrderNumber(data.orderNumber);
        setStep('success');
      } else {
        alert('Erro ao criar pedido. Tente novamente.');
      }
    } catch {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const progressSteps: Step[] = ['package', 'references', 'photos', 'info'];
  const progressIdx = progressSteps.indexOf(step);

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
        <Image src="/logo/logo.png" alt="Imagem Art" width={44} height={44} style={{ objectFit: 'contain' }} />
        <div>
          <div className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
            Imagem Art
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Ensaio com Inteligência Artificial
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>
        {step !== 'success' && (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 13, color: 'var(--color-rose)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
                💕 Dia dos Namorados 2025
              </div>
              <h1 className="font-serif gradient-text" style={{ fontSize: 'clamp(28px, 6vw, 42px)', lineHeight: 1.2, marginBottom: 16 }}>
                Seu Ensaio Personalizado<br />com Inteligência Artificial
              </h1>
              <p style={{ color: 'var(--color-muted)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
                Fotos únicas e deslumbrantes do seu casal, criadas com IA a partir das suas próprias fotos.
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
              {progressSteps.map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= progressIdx ? 'var(--color-rose)' : 'rgba(201,103,122,0.15)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </>
        )}

        {/* STEP 1: Package */}
        {step === 'package' && (
          <div className="animate-fadeInUp">
            <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Escolha seu Pacote</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
              Selecione quantas fotos você quer receber do ensaio
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 16,
                    border: `2px solid ${selectedPackage === pkg.id ? 'var(--color-rose)' : pkg.highlight ? 'rgba(201,103,122,0.3)' : 'rgba(201,103,122,0.15)'}`,
                    background: selectedPackage === pkg.id ? 'rgba(201,103,122,0.1)' : pkg.highlight ? 'rgba(201,103,122,0.05)' : 'var(--color-dark-card)',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {pkg.highlight && (
                    <div style={{
                      position: 'absolute', top: -10, left: 20,
                      background: 'linear-gradient(135deg, var(--color-rose), var(--color-deep-rose))',
                      color: 'white', fontSize: 11, padding: '3px 12px', borderRadius: 20,
                      fontWeight: 700, letterSpacing: '0.5px',
                    }}>
                      MAIS POPULAR
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>{pkg.name}</span>
                      <span style={{ background: 'rgba(201,103,122,0.15)', color: 'var(--color-rose)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {pkg.photos} fotos
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 4 }}>{pkg.description}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div className="gradient-text font-serif" style={{ fontSize: 26, fontWeight: 700 }}>{pkg.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 32 }}
              disabled={!selectedPackage}
              onClick={() => setStep('references')}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 2: References */}
        {step === 'references' && (
          <div className="animate-fadeInUp">
            <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Escolha os Modelos</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 6, fontSize: 14 }}>
              Selecione até <strong style={{ color: 'var(--color-rose)' }}>{maxRefs} modelos</strong> de pose/estilo que mais combinam com vocês
            </p>
            <div style={{ marginBottom: 20 }}>
              <span style={{
                background: selectedRefs.length > 0 ? 'rgba(201,103,122,0.15)' : 'rgba(255,255,255,0.05)',
                color: selectedRefs.length > 0 ? 'var(--color-rose)' : 'var(--color-muted)',
                padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              }}>
                {selectedRefs.length}/{maxRefs} selecionados
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
            }}>
              {REFERENCE_PHOTOS.map((photo) => {
                const isSelected = selectedRefs.includes(photo.id);
                const isDisabled = !isSelected && selectedRefs.length >= maxRefs;
                return (
                  <div
                    key={photo.id}
                    className={`ref-photo-card ${isSelected ? 'selected' : ''}`}
                    style={{ opacity: isDisabled ? 0.4 : 1 }}
                    onClick={() => !isDisabled && toggleRef(photo.id)}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.label}
                      width={200}
                      height={250}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div className="check-badge">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                      padding: '20px 8px 8px',
                    }}>
                      <p style={{ color: 'white', fontSize: 11, fontWeight: 500, textAlign: 'center' }}>{photo.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-outline" onClick={() => setStep('package')}>← Voltar</button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={selectedRefs.length === 0}
                onClick={() => setStep('photos')}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Upload photos */}
        {step === 'photos' && (
          <div className="animate-fadeInUp">
            <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Fotos do Casal</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
              Envie de 2 a 10 fotos do casal. Quanto mais fotos, melhor o resultado! Recomendamos fotos com boa iluminação e rosto bem visível.
            </p>

            {/* Upload zone */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Clique ou arraste as fotos aqui</p>
              <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>JPG, PNG até 10MB cada • máximo 10 fotos</p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </div>

            {/* Preview uploaded */}
            {clientPhotos.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: 'var(--color-muted)', fontSize: 13, marginBottom: 12 }}>
                  {clientPhotos.length} foto(s) selecionada(s)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {clientPhotos.map((file, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, display: 'block' }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 22, height: 22,
                          background: 'var(--color-deep-rose)', border: 'none', borderRadius: '50%',
                          color: 'white', cursor: 'pointer', fontSize: 12, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-outline" onClick={() => setStep('references')}>← Voltar</button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={clientPhotos.length < 1}
                onClick={() => setStep('info')}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Info */}
        {step === 'info' && (
          <div className="animate-fadeInUp">
            <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Seus Dados</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
              Informe seus dados para que possamos enviar a prévia das fotos por WhatsApp.
            </p>

            {/* Summary */}
            <div className="card-dark" style={{ padding: '16px 20px', marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 8 }}>Resumo do pedido</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-serif" style={{ fontSize: 18, fontWeight: 700 }}>Pacote {currentPackage?.name}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: 13, marginLeft: 10 }}>
                    {selectedRefs.length} modelo(s) • {clientPhotos.length} foto(s) enviada(s)
                  </span>
                </div>
                <span className="gradient-text font-serif" style={{ fontSize: 22, fontWeight: 700 }}>{currentPackage?.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-muted)' }}>
                  Nome completo *
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Ex: Ana e Carlos Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-muted)' }}>
                  WhatsApp *
                </label>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="(44) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-outline" onClick={() => setStep('photos')}>← Voltar</button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={!name || whatsapp.length < 14 || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Enviando...' : '💕 Gerar Meu Pedido'}
              </button>
            </div>

            <p style={{ color: 'var(--color-muted)', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
              🔒 Seus dados e fotos são usados exclusivamente para criar seu ensaio
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="animate-fadeInUp" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>💕</div>
            <h2 className="font-serif gradient-text" style={{ fontSize: 32, marginBottom: 16 }}>
              Pedido Criado!
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 15, marginBottom: 8 }}>
              Seu pedido foi recebido com sucesso.
            </p>
            <div className="card-dark" style={{ padding: '16px 24px', display: 'inline-block', margin: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>Número do pedido</p>
              <p className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-rose)' }}>#{orderNumber}</p>
            </div>
            <p style={{ color: 'var(--color-text)', fontSize: 15, maxWidth: 400, margin: '0 auto 24px' }}>
              Em breve entraremos em contato pelo WhatsApp com a prévia do seu ensaio para você escolher as favoritas! 🌹
            </p>
            <div className="card-dark" style={{ padding: 20, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
              <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Próximos passos:</p>
              {[
                'Vamos produzir seu ensaio personalizado',
                'Você receberá uma prévia pelo WhatsApp',
                'Escolha suas fotos favoritas',
                'Após confirmação, enviamos em alta qualidade',
              ].map((text, i) => (
                <div key={i} className="step-item" style={{ marginBottom: 10 }}>
                  <div className="step-number">{i + 1}</div>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

# 💕 Ensaio do Casal com IA — Dia dos Namorados

Sistema completo de pedidos para ensaio fotográfico com IA. Construído com Next.js 14 + Supabase + Vercel.

---

## 🗂 Estrutura do Projeto

```
ensaio-casal/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Página do cliente (formulário de pedido)
│   │   ├── order/[id]/page.tsx         # Página do pedido (cliente escolhe fotos)
│   │   ├── dashboard/page.tsx          # Dashboard do admin
│   │   └── api/
│   │       ├── orders/route.ts         # POST: criar pedido
│   │       ├── orders/[id]/route.ts    # GET: detalhes do pedido (público)
│   │       ├── orders/[id]/select/route.ts  # POST: cliente confirma seleção
│   │       └── admin/
│   │           ├── orders/route.ts          # GET: listar todos (admin)
│   │           └── orders/[id]/route.ts     # GET/PATCH: gerenciar pedido
│   ├── types/index.ts                  # Tipos e dados das fotos de referência
│   └── lib/supabase.ts                 # Cliente Supabase
├── public/
│   ├── logo/logo.png                   # Sua logo (aparece nas prévias)
│   └── references/                     # Fotos de referência (ref-01 a ref-15)
└── supabase-schema.sql                 # Schema do banco de dados
```

---

## 🚀 Setup Passo a Passo

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase-schema.sql`
3. Vá em **Storage > New bucket**:
   - Nome: `ensaio-photos`
   - Public: ✅ ligado
4. Copie as chaves: **Project Settings > API**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha no frontend!)

### 2. Variáveis de Ambiente

Crie `.env.local` baseado em `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ADMIN_PASSWORD=suasenhaforte123
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

### 3. Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Ou conecte o repositório pelo painel da Vercel e adicione as variáveis de ambiente lá.

### 4. (Opcional) Adicionar Marca d'Água nas Prévias

O código atual faz upload da foto limpa em ambos os caminhos. Para adicionar a logo como watermark de verdade, o Claude Code deve implementar na função `uploadPreviews` em `src/app/api/admin/orders/[id]/route.ts` usando `sharp`:

```typescript
import sharp from 'sharp';

// Processar watermark
const logoBuffer = await fs.readFile('./public/logo/logo.png');
const watermarked = await sharp(buffer)
  .composite([{
    input: logoBuffer,
    gravity: 'center',
    blend: 'over',
  }])
  .toBuffer();
// Upload 'watermarked' para o caminho de preview
// Upload 'buffer' (original) para o caminho clean
```

---

## 📱 Fluxo Completo

### Cliente:
1. Acessa o link → escolhe pacote
2. Seleciona fotos de referência (estilo desejado)
3. Faz upload das fotos do casal
4. Preenche nome e WhatsApp
5. Clica "Gerar Meu Pedido" → recebe número do pedido

### Gabriel (Dashboard `/dashboard`):
1. Vê o pedido na lista
2. Baixa as fotos do cliente
3. Produz o ensaio com IA
4. Envia as prévias (com logo) pela dashboard
5. Copia o link do pedido e manda pelo WhatsApp
6. Cliente abre o link, escolhe as favoritas, clica "Confirmar Seleção"
7. Gabriel vê quais foram escolhidas na dashboard
8. Recebe o pagamento
9. Clica **"Liberar Download"** → cliente pode baixar as versões sem marca d'água

---

## 🔗 URLs

| URL | Descrição |
|-----|-----------|
| `/` | Página de pedido para o cliente |
| `/order/[id]` | Página de seleção de fotos do cliente |
| `/dashboard` | Dashboard admin (protegida por senha) |

---

## 📦 Pacotes

| Pacote | Fotos | Referências | Preço |
|--------|-------|-------------|-------|
| Básico | 5 | 2 modelos | R$ 47 |
| Romântico | 10 | 4 modelos | R$ 77 |
| Completo | 20 | Todos | R$ 127 |

> Ajuste os preços em `src/types/index.ts` → constante `PACKAGES`

---

## 🛠 Desenvolvimento Local

```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

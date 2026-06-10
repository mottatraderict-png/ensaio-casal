export type OrderStatus =
  | 'pending'       // cliente acabou de criar
  | 'in_production' // gabriel está produzindo
  | 'preview_sent'  // prévia enviada, aguardando escolha
  | 'selected'      // cliente escolheu as fotos
  | 'paid'          // pago, liberado para download
  | 'delivered';    // entregue

export interface Order {
  id: string;
  order_number: string;
  client_name: string;
  whatsapp: string;
  package_type: string;
  reference_ids: string[]; // IDs das fotos referência escolhidas
  client_photos: ClientPhoto[];
  preview_photos: PreviewPhoto[];
  selected_photo_ids: string[]; // IDs que o cliente escolheu
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ClientPhoto {
  id: string;
  url: string;
  filename: string;
}

export interface PreviewPhoto {
  id: string;
  url: string;        // URL com watermark/logo
  clean_url: string;  // URL limpa (sem watermark) para entrega
  filename: string;
  selected: boolean;
}

export interface ReferencePhoto {
  id: string;
  filename: string;
  url: string;
  label: string;
}

export const REFERENCE_PHOTOS: ReferencePhoto[] = [
  { id: 'ref-01', filename: 'ref-01.jpg', url: '/references/ref-01.jpg', label: 'Pôr do Sol Romântico' },
  { id: 'ref-02', filename: 'ref-02.jpg', url: '/references/ref-02.jpg', label: 'Abraço Aconchegante' },
  { id: 'ref-03', filename: 'ref-03.jpg', url: '/references/ref-03.jpg', label: 'Passeio no Parque' },
  { id: 'ref-04', filename: 'ref-04.jpg', url: '/references/ref-04.jpg', label: 'Carregando nos Braços' },
  { id: 'ref-05', filename: 'ref-05.png', url: '/references/ref-05.png', label: 'Surpresa nos Olhos' },
  { id: 'ref-06', filename: 'ref-06.png', url: '/references/ref-06.png', label: 'Chapéus na Floresta' },
  { id: 'ref-07', filename: 'ref-07.png', url: '/references/ref-07.png', label: 'Dia dos Namorados' },
  { id: 'ref-08', filename: 'ref-08.png', url: '/references/ref-08.png', label: 'Piquenique em Família' },
  { id: 'ref-09', filename: 'ref-09.png', url: '/references/ref-09.png', label: 'Inverno Aconchegante' },
  { id: 'ref-10', filename: 'ref-10.png', url: '/references/ref-10.png', label: 'Romance com Rosas' },
  { id: 'ref-11', filename: 'ref-11.png', url: '/references/ref-11.png', label: 'Tarde de Balões' },
  { id: 'ref-12', filename: 'ref-12.png', url: '/references/ref-12.png', label: 'Piquenique no Campo' },
  { id: 'ref-13', filename: 'ref-13.png', url: '/references/ref-13.png', label: 'Dançando na Natureza' },
  { id: 'ref-14', filename: 'ref-14.png', url: '/references/ref-14.png', label: 'Estilo Parisiense' },
  { id: 'ref-15', filename: 'ref-15.png', url: '/references/ref-15.png', label: 'Pijama Match' },
];

export const PACKAGES = [
  {
    id: 'basico',
    name: 'Básico',
    photos: 5,
    price: 'R$ 47',
    description: '5 fotos editadas + 2 modelos de referência',
    highlight: false,
  },
  {
    id: 'romantico',
    name: 'Romântico',
    photos: 10,
    price: 'R$ 77',
    description: '10 fotos editadas + 4 modelos de referência',
    highlight: true,
  },
  {
    id: 'completo',
    name: 'Completo',
    photos: 20,
    price: 'R$ 127',
    description: '20 fotos editadas + todos os modelos disponíveis',
    highlight: false,
  },
];

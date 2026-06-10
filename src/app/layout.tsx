import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ensaio do Casal com IA — Dia dos Namorados',
  description: 'Crie um ensaio fotográfico personalizado com Inteligência Artificial. Fotos únicas do seu casal para o Dia dos Namorados.',
  openGraph: {
    title: 'Ensaio do Casal com IA',
    description: 'Fotos únicas para o Dia dos Namorados com Inteligência Artificial',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

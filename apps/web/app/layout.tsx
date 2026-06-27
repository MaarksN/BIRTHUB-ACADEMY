import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { AppHeader } from './_components/AppHeader';

export const metadata: Metadata = {
  title: 'Inside Sales com IA e Automação',
  description: 'Plataforma educacional full-stack para Inside Sales, IA e automação comercial.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
          <AppHeader />
          <main id="conteudo">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

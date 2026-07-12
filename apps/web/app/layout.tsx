import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inside Sales com IA e Automação',
  description: 'Plataforma educacional full-stack para Inside Sales, IA e automação comercial.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
        <header className="topbar">
          <a href="/" className="brand">Birthub Academy</a>
          <nav aria-label="Navegação principal">
            <a href="/admin">Admin</a>
            <a href="/laboratorio-ia">Laboratório IA</a>
            <a href="/automacoes">Automações</a>
            <a href="/login">Login</a>
          </nav>
        </header>
        <main id="conteudo">{children}</main>
      </body>
    </html>
  );
}

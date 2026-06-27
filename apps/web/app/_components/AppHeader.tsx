'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export function AppHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const leave = async () => {
    await logout();
    router.replace('/login');
  };
  return (
    <header className="topbar">
      <a href="/" className="brand">Inside Sales IA</a>
      <nav aria-label="Navegação principal">
        {user?.roles.some((role) => role === 'ADMIN' || role === 'OWNER') ? <a href="/admin">Admin</a> : null}
        {user ? <a href="/laboratorio-ia">Laboratório IA</a> : null}
        {user ? <a href="/automacoes">Automações</a> : null}
        {!loading && !user ? <a href="/login">Login</a> : null}
        {user ? <button className="link-button" type="button" onClick={() => void leave()}>Sair</button> : null}
      </nav>
    </header>
  );
}


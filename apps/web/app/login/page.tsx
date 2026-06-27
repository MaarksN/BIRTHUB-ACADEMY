'use client';

import { getApiUrl } from '../../lib/api';

export default function LoginPage() {
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Acesso</p>
      <h1>Entrar na plataforma</h1>
      <form className="login-form" action={`${getApiUrl()}/auth/login`} method="post">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" defaultValue="admin@inside.local" required />
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" defaultValue="InsideSales#2026" required minLength={8} />
        <label htmlFor="tenantSlug">Tenant</label>
        <input id="tenantSlug" name="tenantSlug" defaultValue="default" required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

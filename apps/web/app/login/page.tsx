'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          tenantSlug: form.get('tenantSlug'),
        }),
      });
      await refresh();
      router.replace(new URLSearchParams(window.location.search).get('next') || '/');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível entrar');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Acesso</p>
      <h1>Entrar na plataforma</h1>
      <form className="login-form" onSubmit={(event) => void submit(event)}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" defaultValue="aluno@inside.local" required />
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" required minLength={8} />
        <label htmlFor="tenantSlug">Organização</label>
        <input id="tenantSlug" name="tenantSlug" defaultValue="default" required />
        {error ? <p className="status-error" role="alert">{error}</p> : null}
        <button type="submit" disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}

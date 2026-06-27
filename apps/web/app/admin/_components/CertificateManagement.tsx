'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '../../../lib/api';

interface Certificate { id: string; userId: string; code: string; issuedAt: string; status: string }

export function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<Certificate[]>('/admin/certificates').then(setCertificates)
      .catch((cause) => setMessage(cause instanceof ApiError ? cause.message : 'Falha ao carregar certificados'))
      .finally(() => setLoading(false));
  }, []);
  const revoke = async (id: string) => {
    const reason = reasons[id]?.trim();
    if (!reason || reason.length < 3) { setMessage('Informe o motivo da revogação.'); return; }
    try {
      await apiFetch(`/admin/certificates/${id}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) });
      setCertificates((items) => items.map((item) => item.id === id ? { ...item, status: 'REVOKED' } : item));
      setMessage('Certificado revogado e auditado.');
    } catch (cause) {
      setMessage(cause instanceof ApiError ? cause.message : 'Falha ao revogar certificado');
    }
  };
  if (loading) return <p>Carregando certificados…</p>;
  return <section className="content-block"><h2>Certificados emitidos</h2>{message ? <p role="status">{message}</p> : null}
    <table><thead><tr><th>Usuário</th><th>Código</th><th>Emissão</th><th>Status</th><th>Revogação</th></tr></thead><tbody>
      {certificates.map((item) => <tr key={item.id}><td>{item.userId}</td><td><code>{item.code}</code></td><td>{new Date(item.issuedAt).toLocaleDateString('pt-BR')}</td><td>{item.status}</td><td>
        {item.status === 'VALID' ? <><input aria-label={`Motivo para ${item.code}`} value={reasons[item.id] ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} /><button onClick={() => void revoke(item.id)}>Revogar</button></> : '—'}
      </td></tr>)}
      {!certificates.length ? <tr><td colSpan={5}>Nenhum certificado emitido.</td></tr> : null}
    </tbody></table>
  </section>;
}


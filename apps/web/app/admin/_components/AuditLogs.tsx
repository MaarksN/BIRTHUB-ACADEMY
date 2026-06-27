'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '../../../lib/api';

interface AuditLog { id: string; actorId?: string; action: string; entity: string; entityId?: string; createdAt: string; metadata: unknown }

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<AuditLog[]>('/admin/audit-logs').then(setLogs)
      .catch((cause) => setError(cause instanceof ApiError ? cause.message : 'Falha ao carregar auditoria'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <p>Carregando logs…</p>;
  return <section className="content-block"><h2>Logs de auditoria e segurança</h2>{error ? <p role="alert">{error}</p> : null}
    <table><thead><tr><th>Ator</th><th>Ação</th><th>Entidade</th><th>Data</th><th>Detalhes</th></tr></thead><tbody>
      {logs.map((log) => <tr key={log.id}><td>{log.actorId ?? 'Sistema'}</td><td>{log.action}</td><td>{log.entity} ({log.entityId ?? '—'})</td><td>{new Date(log.createdAt).toLocaleString('pt-BR')}</td><td><pre>{JSON.stringify(log.metadata)}</pre></td></tr>)}
      {!logs.length ? <tr><td colSpan={5}>Nenhum log registrado.</td></tr> : null}
    </tbody></table>
  </section>;
}

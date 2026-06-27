'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '../../../lib/api';

interface Submission {
  id: string;
  userId: string;
  activityId?: string;
  projectId?: string;
  challengeId?: string;
  createdAt: string;
  status: string;
  score?: number;
}

export function Moderation() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<Submission[]>('/admin/submissions').then(setSubmissions)
      .catch((cause) => setMessage(cause instanceof ApiError ? cause.message : 'Falha ao carregar submissões'))
      .finally(() => setLoading(false));
  }, []);
  const review = async (id: string, status: 'APPROVED' | 'REJECTED', score?: number) => {
    try {
      await apiFetch(`/admin/submissions/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, score, note: status === 'APPROVED' ? 'Entrega aprovada.' : 'Entrega requer revisão.', rubricScores: [] }),
      });
      setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status, score } : item));
      setMessage('Revisão registrada na trilha de auditoria.');
    } catch (cause) {
      setMessage(cause instanceof ApiError ? cause.message : 'Falha ao revisar submissão');
    }
  };
  if (loading) return <p>Carregando submissões…</p>;
  return <section className="content-block"><h2>Avaliação de entregas</h2>{message ? <p role="status">{message}</p> : null}
    <table><thead><tr><th>Usuário</th><th>Entrega</th><th>Data</th><th>Status</th><th>Nota</th><th>Ações</th></tr></thead><tbody>
      {submissions.map((item) => <tr key={item.id}><td>{item.userId}</td><td>{item.activityId ?? item.projectId ?? item.challengeId}</td>
        <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td><td>{item.status}</td><td>{item.score ?? '—'}</td>
        <td><button onClick={() => void review(item.id, 'APPROVED', 100)}>Aprovar</button>{' '}<button onClick={() => void review(item.id, 'REJECTED')}>Rejeitar</button></td></tr>)}
      {!submissions.length ? <tr><td colSpan={6}>Nenhuma submissão pendente.</td></tr> : null}
    </tbody></table>
  </section>;
}


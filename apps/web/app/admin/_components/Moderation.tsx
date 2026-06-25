'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../../../lib/api';

export function Moderation() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiUrl()}/admin/submissions?tenantId=default`)
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReview = async (id: string, status: string, score?: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, score }),
      });
      if (res.ok) {
        alert('Submissão revisada!');
        // Refresh list
        setSubmissions(submissions.map(s => s.id === id ? { ...s, status, score } : s));
      }
    } catch {
      alert('Erro ao revisar.');
    }
  };

  if (loading) return <p>Carregando submissões...</p>;

  return (
    <section className="content-block">
      <h2>Moderar a Comunidade (Atividades)</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário ID</th>
            <th>Atividade ID</th>
            <th>Data</th>
            <th>Status</th>
            <th>Pontuação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.userId}</td>
              <td>{sub.activityId || sub.projectId || 'N/A'}</td>
              <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
              <td><span className={`badge badge-${sub.status}`}>{sub.status}</span></td>
              <td>{sub.score ?? '-'}</td>
              <td>
                <button className="btn-small" onClick={() => handleReview(sub.id, 'approved', 100)}>Aprovar</button>
                <button className="btn-small btn-danger" style={{ marginLeft: '4px' }} onClick={() => handleReview(sub.id, 'rejected')}>Rejeitar</button>
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>Nenhuma submissão pendente.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

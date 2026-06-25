'use client';

import { useState, useEffect } from 'react';

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3333/admin/audit-logs?tenantId=default')
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando logs...</p>;

  return (
    <section className="content-block">
      <h2>Logs de Auditoria e Segurança</h2>
      <table>
        <thead>
          <tr>
            <th>Ator ID</th>
            <th>Ação</th>
            <th>Entidade</th>
            <th>Data</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.actorId || 'Sistema'}</td>
              <td><strong>{log.action}</strong></td>
              <td>{log.entity} ({log.entityId || '-'})</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td><pre style={{ fontSize: '10px' }}>{JSON.stringify(log.metadata)}</pre></td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum log registrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

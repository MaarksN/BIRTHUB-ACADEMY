'use client';

import { useState, useEffect } from 'react';

export function CertificateManagement() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3333/admin/certificates?tenantId=default')
      .then((res) => res.json())
      .then((data) => {
        setCertificates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar este certificado?')) return;
    try {
      const res = await fetch(`http://localhost:3333/admin/certificates/${id}/revoke`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Certificado revogado.');
        setCertificates(certificates.map(c => c.id === id ? { ...c, status: 'REVOKED' } : c));
      }
    } catch {
      alert('Erro ao revogar.');
    }
  };

  if (loading) return <p>Carregando certificados...</p>;

  return (
    <section className="content-block">
      <h2>Revisar Atividades e Emitir Certificados</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário ID</th>
            <th>Código</th>
            <th>Emissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.userId}</td>
              <td><code>{cert.code}</code></td>
              <td>{new Date(cert.issuedAt).toLocaleDateString()}</td>
              <td><span className={`badge badge-${cert.status.toLowerCase()}`}>{cert.status}</span></td>
              <td>
                {cert.status === 'VALID' && (
                  <button className="btn-small btn-danger" onClick={() => handleRevoke(cert.id)}>Revogar</button>
                )}
              </td>
            </tr>
          ))}
          {certificates.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum certificado emitido.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

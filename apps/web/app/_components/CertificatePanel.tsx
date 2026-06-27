'use client';

import { useEffect, useState } from 'react';
import { courseData } from '@inside/content';
import { apiFetch, ApiError } from '../../lib/api';

interface Eligibility { eligible: boolean; missing: string[] }
interface Certificate { id: string; code: string; status: string }

export function CertificatePanel() {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    apiFetch<Eligibility>(`/me/certificates/eligibility?courseId=${courseData.id}`).then(setEligibility).catch(() => setEligibility(null));
  }, []);
  const issue = async () => {
    try {
      const issued = await apiFetch<Certificate>('/me/certificates', { method: 'POST', body: JSON.stringify({ courseId: courseData.id }) });
      setCertificate(issued); setMessage('Certificado emitido com PDF seguro.');
    } catch (cause) { setMessage(cause instanceof ApiError ? cause.message : 'Falha ao emitir certificado'); }
  };
  return <section className="content-block"><h2>Certificado</h2>
    {!eligibility ? <p>Elegibilidade indisponível.</p> : eligibility.eligible ? <button onClick={() => void issue()}>Emitir certificado</button> : <><p>Ainda não elegível:</p><ul>{eligibility.missing.map((item) => <li key={item}>{item}</li>)}</ul></>}
    {message ? <p role="status">{message}</p> : null}
    {certificate ? <p><a href={`/certificado/${certificate.code}`}>Verificar certificado {certificate.code}</a></p> : null}
  </section>;
}


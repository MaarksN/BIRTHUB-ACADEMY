import { getApiUrl } from '../../../lib/api';

interface Verification { valid: boolean; status: string; code: string; studentName?: string; course?: string; issuedAt?: string; revocationReason?: string }

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = await fetch(`${getApiUrl()}/certificates/verify/${encodeURIComponent(code)}`, { cache: 'no-store' });
  const verification = await response.json() as Verification;
  return <div className="page-shell reader certificate">
    <p className="eyebrow">Validação pública</p><h1>{verification.valid ? 'Certificado válido' : 'Certificado inválido ou revogado'}</h1>
    <p>Código: {verification.code}</p><p>Status: {verification.status}</p>
    {verification.studentName ? <p>Aluno: {verification.studentName}</p> : null}
    {verification.course ? <p>Curso: {verification.course}</p> : null}
    {verification.issuedAt ? <p>Emissão: {new Date(verification.issuedAt).toLocaleDateString('pt-BR')}</p> : null}
    {verification.revocationReason ? <p>Motivo da revogação: {verification.revocationReason}</p> : null}
  </div>;
}

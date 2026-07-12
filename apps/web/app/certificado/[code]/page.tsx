export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const valid = code.startsWith('ISIA-');
  return (
    <div className="page-shell reader certificate">
      <p className="eyebrow">Validação pública</p>
      <h1>Certificado {valid ? 'válido' : 'não encontrado'}</h1>
      <p>Código: {code}</p>
      <p>Esta página representa a rota pública do frontend. A validação canônica deve consultar o backend em <code>/certificates/verify/{code}</code>.</p>
    </div>
  );
}

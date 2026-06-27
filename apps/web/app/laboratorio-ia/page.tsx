'use client';

import { useState } from 'react';
import { promptTemplateData } from '@inside/content';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface AiResult { response: string; remainingToday: number; stored: boolean }

export default function AiLabPage() {
  const { user, loading } = useAuth({ required: true });
  const [prompt, setPrompt] = useState(promptTemplateData[0]?.template ?? 'Defina objetivo, contexto, formato, fontes e cuidados de LGPD para esta tarefa comercial.');
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const run = async () => {
    try {
      setRunning(true); setError('');
      setResult(await apiFetch<AiResult>('/ai-lab/run', { method: 'POST', body: JSON.stringify({ mode: 'simulated', prompt, consentToStore: consent }) }));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Falha ao executar simulação');
    } finally { setRunning(false); }
  };
  if (loading || !user) return <div className="page-shell"><p>Validando sessão…</p></div>;
  return <div className="page-shell reader">
    <p className="eyebrow">Laboratório educacional de IA</p><h1>IA com limites e consentimento</h1>
    <label htmlFor="prompt">Prompt</label><textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={10} />
    <label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Autorizar armazenamento do conteúdo redigido</label>
    <div className="actions"><button disabled={running || prompt.length < 20} onClick={() => void run()}>{running ? 'Processando…' : 'Executar simulação'}</button></div>
    {error ? <p role="alert" className="status-error">{error}</p> : null}
    {result ? <output className="result">{result.response}<br />Limite restante hoje: {result.remainingToday}</output> : null}
  </div>;
}


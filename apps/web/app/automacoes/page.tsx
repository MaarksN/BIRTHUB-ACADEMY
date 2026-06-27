'use client';

import { useMemo, useState } from 'react';
import { automationTemplateData } from '@inside/content';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface Simulation { id: string; valid: boolean; logs: string[] }

export default function AutomationsPage() {
  const { user, loading } = useAuth({ required: true });
  const [selectedId, setSelectedId] = useState(automationTemplateData[0]?.id ?? '');
  const [result, setResult] = useState<Simulation | null>(null);
  const [error, setError] = useState('');
  const template = useMemo(() => automationTemplateData.find((item) => item.id === selectedId) ?? automationTemplateData[0], [selectedId]);
  if (loading || !user) return <div className="page-shell"><p>Validando sessão…</p></div>;
  if (!template) return <div className="page-shell"><h1>Nenhum template disponível</h1></div>;
  const simulate = async () => {
    try {
      setResult(await apiFetch<Simulation>('/automations/simulate', { method: 'POST', body: JSON.stringify({
        title: template.title, mode: '[SIMULACAO]', trigger: template.trigger, conditions: template.conditions,
        actions: template.actions, errorHandling: template.errorHandling,
      }) })); setError('');
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Falha ao simular automação'); }
  };
  return <div className="page-shell reader"><p className="eyebrow">Construtor educacional de automações</p><h1>Simulação persistida</h1>
    <label htmlFor="template">Template</label><select id="template" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{automationTemplateData.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
    <section className="content-block"><h2>{template.title}</h2><ol><li>Gatilho: {template.trigger}</li>{template.conditions.map((condition) => <li key={condition}>Condição: {condition}</li>)}</ol></section>
    <button onClick={() => void simulate()}>Executar simulação</button>
    {error ? <p className="status-error" role="alert">{error}</p> : null}
    {result ? <output className="result">Job {result.id}: {result.logs.join(' → ')}</output> : null}
  </div>;
}

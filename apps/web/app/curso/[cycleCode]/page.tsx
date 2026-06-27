'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { findCycle } from '@inside/content';
import { apiFetch, ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

export default function CyclePage() {
  const { cycleCode } = useParams<{ cycleCode: string }>();
  const cycle = findCycle(cycleCode);
  const { user, loading } = useAuth({ required: true });
  const [delivery, setDelivery] = useState('');
  const [message, setMessage] = useState('');
  if (!cycle) return <div className="page-shell"><h1>Ciclo não encontrado</h1></div>;
  if (loading || !user) return <div className="page-shell"><p>Validando sessão…</p></div>;
  const submitActivity = async () => {
    try {
      await apiFetch(`/activities/${cycle.activity.id}/submissions`, { method: 'POST', body: JSON.stringify({ payload: { response: delivery }, files: [] }) });
      setMessage('Atividade enviada e registrada.');
    } catch (cause) { setMessage(cause instanceof ApiError ? cause.message : 'Falha ao enviar atividade'); }
  };
  const complete = async () => {
    try { await apiFetch(`/cycles/${cycle.id}/complete`, { method: 'POST' }); setMessage('Ciclo concluído.'); }
    catch (cause) { setMessage(cause instanceof ApiError ? cause.message : 'Requisitos do ciclo ainda não atendidos'); }
  };
  return <div className="page-shell reader"><p className="eyebrow">Ciclo {cycle.code}</p><h1>{cycle.title}</h1><p className="lead">{cycle.description}</p>
    {cycle.lessonBlocks.map((block) => <section key={block.id} className="content-block"><h2>{block.title}</h2><p>{block.body}</p></section>)}
    <section className="content-block"><h2>Atividade obrigatória</h2><h3>{cycle.activity.title}</h3><p>{cycle.activity.objective}</p>
      <label htmlFor="delivery">Sua entrega</label><textarea id="delivery" rows={8} value={delivery} onChange={(event) => setDelivery(event.target.value)} />
      <button disabled={delivery.trim().length < 10} onClick={() => void submitActivity()}>Enviar atividade</button>
    </section>
    {message ? <p role="status">{message}</p> : null}
    <nav className="actions" aria-label="Ações do ciclo"><a className="button" href={`/quiz/${cycle.code}`}>Iniciar quiz</a><button onClick={() => void complete()}>Concluir ciclo</button><a className="button button-secondary" href="/">Voltar</a></nav>
  </div>;
}


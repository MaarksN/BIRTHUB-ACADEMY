'use client';

import { useEffect, useState } from 'react';
import { courseData } from '@inside/content';
import { apiFetch, ApiError } from '../../lib/api';

interface Submission { id: string; projectId?: string; challengeId?: string; status: string; score?: number }

export function Deliverables() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const load = () => apiFetch<Submission[]>('/me/submissions').then(setSubmissions).catch(() => setSubmissions([]));
  useEffect(() => { void load(); }, []);
  const submit = async (kind: 'project' | 'challenge', id: string) => {
    try {
      const path = kind === 'project' ? `/projects/${id}/submissions` : `/final-challenge/${id}/submissions`;
      await apiFetch(path, { method: 'POST', body: JSON.stringify({ payload: { response: answers[id] }, files: [] }) });
      setMessage('Entrega registrada.');
      await load();
    } catch (cause) { setMessage(cause instanceof ApiError ? cause.message : 'Falha ao enviar entrega'); }
  };
  return <section className="content-block"><h2>Projetos e desafio final</h2>{message ? <p role="status">{message}</p> : null}
    {courseData.projects.map((project) => {
      const existing = submissions.find((item) => item.projectId === project.id);
      return <div key={project.id}><h3>{project.title}</h3><p>Status: {existing?.status ?? 'não enviado'} {existing?.score === undefined ? '' : `— nota ${existing.score}`}</p>
        <textarea aria-label={`Entrega: ${project.title}`} value={answers[project.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [project.id]: event.target.value }))} />
        <button disabled={(answers[project.id]?.trim().length ?? 0) < 10} onClick={() => void submit('project', project.id)}>Enviar projeto</button></div>;
    })}
    <div><h3>{courseData.finalChallenge.title}</h3><p>Status: {submissions.find((item) => item.challengeId === courseData.finalChallenge.id)?.status ?? 'não enviado'}</p>
      <textarea aria-label="Entrega do desafio final" value={answers[courseData.finalChallenge.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [courseData.finalChallenge.id]: event.target.value }))} />
      <button disabled={(answers[courseData.finalChallenge.id]?.trim().length ?? 0) < 10} onClick={() => void submit('challenge', courseData.finalChallenge.id)}>Enviar desafio final</button>
    </div>
  </section>;
}


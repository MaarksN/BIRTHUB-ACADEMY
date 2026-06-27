'use client';

import { useEffect, useState } from 'react';
import { courseData, flattenCycles } from '@inside/content';
import { apiFetch, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Deliverables } from './_components/Deliverables';
import { CertificatePanel } from './_components/CertificatePanel';

interface Progress {
  completedCycles: string[];
  unlockedCycles: string[];
  pendingCycles: string[];
  percentage: number;
  totalCycles: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth({ required: true });
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setLoading(true);
      setProgress(await apiFetch<Progress>('/me/progress'));
      setError('');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Falha ao carregar progresso');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user) void load(); }, [user]);
  const enroll = async () => {
    await apiFetch(`/courses/${courseData.id}/enroll`, { method: 'POST' });
    await load();
  };
  if (authLoading || !user) return <div className="page-shell"><p>Validando sessão…</p></div>;
  if (loading) return <div className="page-shell"><p>Carregando seu progresso…</p></div>;
  const cycles = flattenCycles();
  return (
    <div className="page-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Painel de {user.name}</p>
          <h1>{courseData.title}</h1>
          {error ? <><p className="status-error" role="alert">{error}</p><button onClick={() => void enroll()}>Matricular-se</button></> : <p>Seu progresso é calculado pelo servidor e permanece entre sessões.</p>}
        </div>
        <div className="progress-box" aria-label="Resumo de progresso">
          <strong>{progress?.percentage ?? 0}%</strong>
          <span>{progress?.completedCycles.length ?? 0}/{cycles.length} ciclos concluídos</span>
        </div>
      </section>
      <section className="metric-grid" aria-label="Métricas do curso">
        <article><strong>{courseData.modules.length}</strong><span>módulos</span></article>
        <article><strong>{cycles.length}</strong><span>ciclos</span></article>
        <article><strong>{progress?.unlockedCycles.length ?? 0}</strong><span>ciclos desbloqueados</span></article>
        <article><strong>70%</strong><span>aprovação mínima</span></article>
      </section>
      <section className="module-list" aria-label="Trilha do curso">
        {courseData.modules.map((module) => (
          <article className="module-row" key={module.id}>
            <h2>Módulo {module.code}: {module.title}</h2>
            <ol>
              {module.cycles.map((cycle) => {
                const unlocked = progress?.unlockedCycles.includes(cycle.code) ?? false;
                return <li key={cycle.id}>
                  {unlocked ? <a href={`/curso/${cycle.code}`}>{cycle.code} - {cycle.title}</a> : <span>{cycle.code} - {cycle.title} (bloqueado)</span>}
                  <span>{cycle.estimatedMinutes} min</span>
                </li>;
              })}
            </ol>
          </article>
        ))}
      </section>
      <Deliverables />
      <CertificatePanel />
    </div>
  );
}

'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError } from '../../lib/api';

interface ExcellenceItem {
  id: string;
  number: string;
  title: string;
  slug: string;
  category: string;
  priority: 'P1.5' | 'P2' | 'P3';
  status: string;
  outcomes: string[];
  metrics: string[];
  acceptanceCriteria: string[];
  updatedAt: string;
}

interface ExcellenceItemsResponse {
  total: number;
  items: ExcellenceItem[];
}

interface RoadmapPhase {
  id: string;
  title: string;
  priority: ExcellenceItem['priority'];
  objective: string;
  items: ExcellenceItem[];
}

interface RoadmapResponse {
  phases: RoadmapPhase[];
  readiness: {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  };
}

interface Competency {
  id: string;
  title: string;
  description: string;
  level: string;
  evidence: string[];
  relatedCycles: string[];
}

interface CompetenciesResponse {
  total: number;
  competencies: Competency[];
}

interface Pillar {
  id: string;
  title: string;
  purpose: string;
  items: string[];
  successMetrics: string[];
}

interface PillarsResponse {
  total: number;
  pillars: Pillar[];
}

interface LearningPlanResponse {
  id: string;
  goal: string;
  intensity: string;
  weeklyHours: number;
  milestones: Array<{ week: number; title: string; tasks: string[] }>;
  recommendedFocus: string[];
}

interface TutorResponse {
  id: string;
  answer: string;
  nextQuestions: string[];
  riskFlags: string[];
  remainingToday: number;
  stored: boolean;
  fallbackUsed: boolean;
}

interface SupportTicketResponse {
  id: string;
  subject: string;
  severity: string;
  status: string;
  sla: string;
}

type LoadState = 'loading' | 'success' | 'empty' | 'error';
type ActionState<T> = { loading: boolean; error: string; data: T | null };

const priorities = ['P1.5', 'P2', 'P3'] as const;

const initialAction = <T,>(): ActionState<T> => ({ loading: false, error: '', data: null });

const getErrorMessage = (cause: unknown, fallback: string) => {
  if (cause instanceof ApiError) return cause.status === 401 ? 'Entre na plataforma para executar esta ação.' : cause.message;
  return fallback;
};

export default function ExcelenciaPage() {
  const [items, setItems] = useState<ExcellenceItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [planState, setPlanState] = useState<ActionState<LearningPlanResponse>>(initialAction<LearningPlanResponse>());
  const [tutorState, setTutorState] = useState<ActionState<TutorResponse>>(initialAction<TutorResponse>());
  const [ticketState, setTicketState] = useState<ActionState<SupportTicketResponse>>(initialAction<SupportTicketResponse>());

  const loadData = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');
    try {
      const [itemsResponse, roadmapResponse, competenciesResponse, pillarsResponse] = await Promise.all([
        apiFetch<ExcellenceItemsResponse>('/excellence/items'),
        apiFetch<RoadmapResponse>('/excellence/roadmap'),
        apiFetch<CompetenciesResponse>('/excellence/competencies'),
        apiFetch<PillarsResponse>('/excellence/pillars'),
      ]);
      setItems(itemsResponse.items);
      setRoadmap(roadmapResponse);
      setCompetencies(competenciesResponse.competencies);
      setPillars(pillarsResponse.pillars);
      setLoadState(itemsResponse.items.length > 0 ? 'success' : 'empty');
    } catch (cause) {
      setLoadError(getErrorMessage(cause, 'Falha ao carregar plano de excelência'));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const grouped = useMemo<Record<ExcellenceItem['priority'], ExcellenceItem[]>>(() => {
    return items.reduce<Record<ExcellenceItem['priority'], ExcellenceItem[]>>((acc, item) => {
      acc[item.priority].push(item);
      return acc;
    }, { 'P1.5': [], P2: [], P3: [] });
  }, [items]);

  const submitPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPlanState({ loading: true, error: '', data: null });
    try {
      const response = await apiFetch<LearningPlanResponse>('/excellence/learning-plan', {
        method: 'POST',
        body: JSON.stringify({
          goal: String(form.get('goal') ?? ''),
          weeklyHours: Number(form.get('weeklyHours') ?? 5),
          currentLevel: String(form.get('currentLevel') ?? 'beginner'),
          focusCompetencies: competencies.slice(0, 2).map((competency) => competency.id),
        }),
      });
      setPlanState({ loading: false, error: '', data: response });
    } catch (cause) {
      setPlanState({ loading: false, error: getErrorMessage(cause, 'Falha ao gerar plano'), data: null });
    }
  };

  const submitTutor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTutorState({ loading: true, error: '', data: null });
    try {
      const response = await apiFetch<TutorResponse>('/excellence/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({
          mode: String(form.get('mode') ?? 'socratic'),
          prompt: String(form.get('prompt') ?? ''),
          cycleCode: String(form.get('cycleCode') ?? '') || undefined,
          consentToStore: form.get('consentToStore') === 'on',
          allowAssessmentAnswer: false,
        }),
      });
      setTutorState({ loading: false, error: '', data: response });
    } catch (cause) {
      setTutorState({ loading: false, error: getErrorMessage(cause, 'Falha ao acionar tutor'), data: null });
    }
  };

  const submitTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTicketState({ loading: true, error: '', data: null });
    try {
      const response = await apiFetch<SupportTicketResponse>('/excellence/support-ticket', {
        method: 'POST',
        body: JSON.stringify({
          category: String(form.get('category') ?? 'technical'),
          subject: String(form.get('subject') ?? ''),
          description: String(form.get('description') ?? ''),
          severity: String(form.get('severity') ?? 'normal'),
        }),
      });
      setTicketState({ loading: false, error: '', data: response });
    } catch (cause) {
      setTicketState({ loading: false, error: getErrorMessage(cause, 'Falha ao abrir ticket'), data: null });
    }
  };

  if (loadState === 'loading') {
    return (
      <main className="page-shell" aria-busy="true">
        <section className="hero-band">
          <div>
            <p className="eyebrow">Birthub Academy Premium</p>
            <h1>Plano dos 35 itens de escola digital de ponta</h1>
            <p className="lead" role="status">Carregando catálogo de excelência educacional...</p>
          </div>
          <div className="progress-box" aria-label="Carregando itens de excelência">
            <strong>...</strong>
            <span>itens</span>
          </div>
        </section>
      </main>
    );
  }

  if (loadState === 'error') {
    return (
      <main className="page-shell">
        <section className="hero-band">
          <div>
            <p className="eyebrow">Birthub Academy Premium</p>
            <h1>Plano dos 35 itens de escola digital de ponta</h1>
            <p className="status-error" role="alert">{loadError}</p>
            <div className="actions">
              <button type="button" onClick={() => void loadData()}>Tentar novamente</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Birthub Academy Premium</p>
          <h1>Plano dos 35 itens de escola digital de ponta</h1>
          <p className="lead">
            Catálogo operacional para pedagogia, IA educacional, carreira, acessibilidade, analytics,
            governança e laboratórios práticos.
          </p>
        </div>
        <div className="progress-box" aria-label="Resumo dos itens de excelência">
          <strong>{items.length}</strong>
          <span>{roadmap?.readiness.pending ?? items.length} pendentes</span>
        </div>
      </section>

      {loadState === 'empty' ? (
        <section className="module-row">
          <h2>Catálogo vazio</h2>
          <p>Nenhum item de excelência foi publicado para o tenant público.</p>
          <div className="actions">
            <button type="button" onClick={() => void loadData()}>Recarregar</button>
          </div>
        </section>
      ) : (
        <>
          <section className="metric-grid" aria-label="Indicadores do plano de excelência">
            {priorities.map((priority) => (
              <article key={priority}>
                <span>Prioridade {priority}</span>
                <strong>{grouped[priority].length}</strong>
              </article>
            ))}
            <article>
              <span>Competências</span>
              <strong>{competencies.length}</strong>
            </article>
          </section>

          <div className="two-col">
            <section className="module-row" aria-labelledby="item-11">
              <h2 id="item-11">Item 11</h2>
              <p>{items.find((item) => item.number === '11')?.title ?? 'Motor pedagógico de excelência'}</p>
              <p>{items.find((item) => item.number === '11')?.status ?? 'planned'}</p>
            </section>
            <section className="module-row" aria-labelledby="item-35">
              <h2 id="item-35">Item 35</h2>
              <p>{items.find((item) => item.number === '35')?.title ?? 'Laboratórios práticos e simulações'}</p>
              <p>{items.find((item) => item.number === '35')?.status ?? 'planned'}</p>
            </section>
          </div>

          {priorities.map((priority) => (
            <section className="module-row" key={priority} aria-labelledby={`priority-${priority}`}>
              <h2 id={`priority-${priority}`}>Prioridade {priority}</h2>
              <ol>
                {grouped[priority].map((item) => (
                  <li key={item.slug}>
                    <span>{item.number}. {item.title}</span>
                    <span>{item.category}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <section className="module-row" aria-labelledby="roadmap-heading">
            <h2 id="roadmap-heading">Roadmap</h2>
            <div className="two-col">
              {(roadmap?.phases ?? []).map((phase) => (
                <article key={phase.id}>
                  <h3>{phase.title}</h3>
                  <p>{phase.objective}</p>
                  <strong>{phase.items.length} itens</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="module-row" aria-labelledby="pillars-heading">
            <h2 id="pillars-heading">Pilares</h2>
            <ol>
              {pillars.map((pillar) => (
                <li key={pillar.id}>
                  <span>{pillar.title}</span>
                  <span>{pillar.successMetrics.slice(0, 2).join(', ')}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="two-col" aria-label="Ações de excelência">
            <form className="module-row" onSubmit={(event) => void submitPlan(event)}>
              <h2>Plano de estudo</h2>
              <label htmlFor="goal">Meta</label>
              <input id="goal" name="goal" minLength={5} maxLength={300} required defaultValue="Concluir os laboratórios práticos com portfólio revisado" />
              <label htmlFor="weeklyHours">Horas por semana</label>
              <input id="weeklyHours" name="weeklyHours" type="number" min={1} max={40} required defaultValue={6} />
              <label htmlFor="currentLevel">Nível atual</label>
              <select id="currentLevel" name="currentLevel" defaultValue="beginner">
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
              <div className="actions">
                <button type="submit" disabled={planState.loading}>{planState.loading ? 'Gerando...' : 'Gerar plano'}</button>
              </div>
              {planState.error ? <p className="status-error" role="alert">{planState.error}</p> : null}
              {planState.data ? (
                <output className="result">
                  <strong>{planState.data.intensity}</strong>
                  <span> {planState.data.weeklyHours}h/semana - {planState.data.milestones.length} marcos</span>
                </output>
              ) : null}
            </form>

            <form className="module-row" onSubmit={(event) => void submitTutor(event)}>
              <h2>Tutor IA</h2>
              <label htmlFor="mode">Modo</label>
              <select id="mode" name="mode" defaultValue="socratic">
                <option value="socratic">Socrático</option>
                <option value="explain">Explicação</option>
                <option value="practice">Prática</option>
                <option value="review">Revisão</option>
                <option value="career">Carreira</option>
              </select>
              <label htmlFor="cycleCode">Ciclo</label>
              <input id="cycleCode" name="cycleCode" placeholder="3.1" />
              <label htmlFor="prompt">Dúvida</label>
              <textarea id="prompt" name="prompt" minLength={10} maxLength={5000} required defaultValue="Como preparo uma evidência prática para o item 35 sem copiar resposta final?" />
              <label className="inline-check">
                <input name="consentToStore" type="checkbox" /> Armazenar prompt redigido para histórico
              </label>
              <div className="actions">
                <button type="submit" disabled={tutorState.loading}>{tutorState.loading ? 'Respondendo...' : 'Consultar tutor'}</button>
              </div>
              {tutorState.error ? <p className="status-error" role="alert">{tutorState.error}</p> : null}
              {tutorState.data ? (
                <output className="result">
                  <strong>{tutorState.data.fallbackUsed ? 'Fallback local' : 'Tutor local'}</strong>
                  <p>{tutorState.data.answer}</p>
                </output>
              ) : null}
            </form>
          </section>

          <form className="module-row" onSubmit={(event) => void submitTicket(event)}>
            <h2>Suporte</h2>
            <div className="two-col">
              <div>
                <label htmlFor="category">Categoria</label>
                <select id="category" name="category" defaultValue="technical">
                  <option value="technical">Técnico</option>
                  <option value="course">Curso</option>
                  <option value="certificate">Certificado</option>
                  <option value="career">Carreira</option>
                  <option value="community">Comunidade</option>
                </select>
              </div>
              <div>
                <label htmlFor="severity">Severidade</label>
                <select id="severity" name="severity" defaultValue="normal">
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>
            <label htmlFor="subject">Assunto</label>
            <input id="subject" name="subject" minLength={5} maxLength={160} required defaultValue="Laboratório prático não carregou" />
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" minLength={10} maxLength={5000} required defaultValue="Preciso de ajuda para acessar a simulação prática do item 35." />
            <div className="actions">
              <button type="submit" disabled={ticketState.loading}>{ticketState.loading ? 'Abrindo...' : 'Abrir ticket'}</button>
            </div>
            {ticketState.error ? <p className="status-error" role="alert">{ticketState.error}</p> : null}
            {ticketState.data ? (
              <output className="status-success">
                Ticket {ticketState.data.id} aberto com SLA de {ticketState.data.sla}.
              </output>
            ) : null}
          </form>
        </>
      )}
    </main>
  );
}

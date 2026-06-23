import { courseData, flattenCycles } from '@inside/content';

export default function DashboardPage() {
  const cycles = flattenCycles();
  const completed = 0;
  return (
    <div className="page-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Painel do aluno</p>
          <h1>{courseData.title}</h1>
          <p>Comece pelo ciclo 1.1. A progressão real é controlada pelo backend: atividade entregue, quiz aprovado e ciclo anterior concluído.</p>
        </div>
        <div className="progress-box" aria-label="Resumo de progresso">
          <strong>{completed}/{cycles.length}</strong>
          <span>ciclos concluídos</span>
        </div>
      </section>
      <section className="metric-grid" aria-label="Métricas do curso">
        <article><strong>7</strong><span>módulos</span></article>
        <article><strong>37</strong><span>ciclos</span></article>
        <article><strong>740</strong><span>questões</span></article>
        <article><strong>70%</strong><span>aprovação mínima</span></article>
      </section>
      <section className="module-list" aria-label="Trilha do curso">
        {courseData.modules.map((module) => (
          <article className="module-row" key={module.id}>
            <h2>Módulo {module.code}: {module.title}</h2>
            <ol>
              {module.cycles.map((cycle) => (
                <li key={cycle.id}>
                  <a href={`/curso/${cycle.code}`}>{cycle.code} - {cycle.title}</a>
                  <span>{cycle.estimatedMinutes} min</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>
  );
}

import { findCycle } from '@inside/content';
import { notFound } from 'next/navigation';

export default async function CyclePage({ params }: { params: Promise<{ cycleCode: string }> }) {
  const { cycleCode } = await params;
  const cycle = findCycle(cycleCode);
  if (!cycle) notFound();
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Ciclo {cycle.code}</p>
      <h1>{cycle.title}</h1>
      <p className="lead">{cycle.description}</p>
      <section className="two-col">
        <div>
          <h2>Objetivos</h2>
          <ul>{cycle.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
        </div>
        <div>
          <h2>Condição de desbloqueio</h2>
          <p>{cycle.unlockCondition}</p>
        </div>
      </section>
      {cycle.lessonBlocks.map((block) => (
        <section key={block.id} className="content-block">
          <h2>{block.title}</h2>
          <p>{block.body}</p>
        </section>
      ))}
      <section className="content-block">
        <h2>Atividade obrigatória</h2>
        <h3>{cycle.activity.title}</h3>
        <p>{cycle.activity.objective}</p>
        <ul>{cycle.activity.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul>
      </section>
      <nav className="actions" aria-label="Ações do ciclo">
        <a className="button" href={`/quiz/${cycle.code}`}>Iniciar quiz</a>
        <a className="button button-secondary" href="/">Voltar ao painel</a>
      </nav>
    </div>
  );
}

import { drawQuizQuestions, findCycle } from '@inside/content';
import { notFound } from 'next/navigation';

export default async function QuizPage({ params }: { params: Promise<{ cycleCode: string }> }) {
  const { cycleCode } = await params;
  const cycle = findCycle(cycleCode);
  if (!cycle) notFound();
  const questions = drawQuizQuestions(cycle.code, 'preview-static-attempt');
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Quiz do ciclo {cycle.code}</p>
      <h1>{cycle.title}</h1>
      <p>Prévia educacional: em produção, o sorteio é feito no backend e a resposta correta não é enviada ao navegador.</p>
      <form className="quiz-form">
        {questions.map((question, index) => (
          <fieldset key={question.id}>
            <legend>{index + 1}. {question.prompt}</legend>
            {question.options.map((option) => (
              <label key={option.id}>
                <input type="radio" name={question.id} value={option.id} /> {option.id}. {option.text}
              </label>
            ))}
          </fieldset>
        ))}
        <button type="submit">Enviar tentativa demonstrativa</button>
      </form>
    </div>
  );
}

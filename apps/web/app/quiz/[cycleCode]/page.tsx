'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { findCycle } from '@inside/content';
import { apiFetch, ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

interface SafeQuestion { id: string; prompt: string; options: Array<{ id: string; text: string }> }
interface Attempt { id: string; questions: SafeQuestion[]; attemptNumber: number; maxAttempts: number }
interface Result { score: number; passed: boolean }

export default function QuizPage() {
  const params = useParams<{ cycleCode: string }>();
  const cycle = findCycle(params.cycleCode);
  const { user, loading } = useAuth({ required: true });
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  if (!cycle) return <div className="page-shell"><h1>Ciclo não encontrado</h1></div>;
  if (loading || !user) return <div className="page-shell"><p>Validando sessão…</p></div>;
  const start = async () => {
    try { setAttempt(await apiFetch<Attempt>(`/quizzes/${cycle.quiz.id}/attempts`, { method: 'POST' })); setError(''); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Falha ao iniciar quiz'); }
  };
  const answer = async (questionId: string, selectedOptionId: string) => {
    if (!attempt) return;
    setAnswers((current) => ({ ...current, [questionId]: selectedOptionId }));
    try { await apiFetch(`/quiz-attempts/${attempt.id}/answers`, { method: 'POST', body: JSON.stringify({ questionId, selectedOptionId }) }); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Falha ao salvar resposta'); }
  };
  const submit = async () => {
    if (!attempt) return;
    try { setResult(await apiFetch<Result>(`/quiz-attempts/${attempt.id}/submit`, { method: 'POST' })); setError(''); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Falha ao enviar tentativa'); }
  };
  return <div className="page-shell reader"><p className="eyebrow">Quiz do ciclo {cycle.code}</p><h1>{cycle.title}</h1>
    {!attempt ? <button onClick={() => void start()}>Iniciar tentativa</button> : <form className="quiz-form" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <p>Tentativa {attempt.attemptNumber} de {attempt.maxAttempts}</p>
      {attempt.questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.prompt}</legend>
        {question.options.map((option) => <label key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} disabled={Boolean(result)} onChange={() => void answer(question.id, option.id)} /> {option.text}</label>)}
      </fieldset>)}
      <button type="submit" disabled={Boolean(result) || Object.keys(answers).length !== attempt.questions.length}>Enviar tentativa</button>
    </form>}
    {error ? <p className="status-error" role="alert">{error}</p> : null}
    {result ? <p className={result.passed ? 'status-success' : 'status-error'}>Nota: {result.score}% — {result.passed ? 'Aprovado' : 'Reprovado; tente novamente se ainda houver tentativas.'}</p> : null}
  </div>;
}


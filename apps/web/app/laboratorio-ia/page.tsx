'use client';

import { useState } from 'react';
import { promptTemplateData } from '@inside/content';

export default function AiLabPage() {
  const [prompt, setPrompt] = useState(promptTemplateData[0]?.template ?? '');
  const [response, setResponse] = useState('');
  function simulate() {
    const score = Math.min(100, 30 + (prompt.includes('contexto') ? 20 : 0) + (prompt.includes('formato') ? 20 : 0) + (prompt.includes('fontes') ? 15 : 0) + (prompt.includes('LGPD') ? 15 : 0));
    setResponse(`[SIMULACAO] Qualidade estimada do prompt: ${score}/100. Revise objetivo, dados permitidos, formato de saída, fontes, incertezas e aprovação humana.`);
  }
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Laboratório educacional de IA</p>
      <h1>Modo simulado, sem chave externa</h1>
      <label htmlFor="prompt">Prompt</label>
      <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={10} />
      <div className="actions">
        <button type="button" onClick={simulate}>Avaliar prompt</button>
      </div>
      {response ? <output className="result">{response}</output> : null}
    </div>
  );
}

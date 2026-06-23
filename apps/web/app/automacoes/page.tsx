'use client';

import { useMemo, useState } from 'react';
import { automationTemplateData, validateAutomationFlow } from '@inside/content';

export default function AutomationsPage() {
  const [selectedId, setSelectedId] = useState(automationTemplateData[0]?.id ?? '');
  const template = useMemo(() => automationTemplateData.find((item) => item.id === selectedId) ?? automationTemplateData[0], [selectedId]);
  if (!template) {
    return (
      <div className="page-shell reader">
        <p className="eyebrow">Construtor educacional de automações</p>
        <h1>Nenhum template disponível</h1>
        <p>A biblioteca ainda não possui fluxos para simulação.</p>
      </div>
    );
  }
  const validation = validateAutomationFlow(template);
  const json = JSON.stringify(template, null, 2);
  return (
    <div className="page-shell reader">
      <p className="eyebrow">Construtor educacional de automações</p>
      <h1>Templates em modo [SIMULACAO]</h1>
      <label htmlFor="template">Template</label>
      <select id="template" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        {automationTemplateData.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <section className="two-col">
        <div>
          <h2>Visão textual acessível</h2>
          <ol>
            <li>Gatilho: {template.trigger}</li>
            {template.conditions.map((condition) => <li key={condition}>Condição: {condition}</li>)}
            {template.actions.map((action) => <li key={action.label}>Ação: {action.label}</li>)}
          </ol>
        </div>
        <div>
          <h2>Validação</h2>
          <p>{validation.valid ? 'Fluxo válido para simulação educacional.' : validation.issues.join(', ')}</p>
        </div>
      </section>
      <label htmlFor="json">Exportação JSON</label>
      <textarea id="json" readOnly value={json} rows={14} />
    </div>
  );
}

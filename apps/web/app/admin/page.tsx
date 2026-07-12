import { automationTemplateData, courseData, flattenCycles, questionData } from '@inside/content';

export default function AdminPage() {
  const cycles = flattenCycles();
  return (
    <div className="page-shell">
      <p className="eyebrow">Painel administrativo</p>
      <h1>Operação do curso</h1>
      <section className="metric-grid">
        <article><strong>{courseData.modules.length}</strong><span>módulos</span></article>
        <article><strong>{cycles.length}</strong><span>ciclos</span></article>
        <article><strong>{questionData.length}</strong><span>questões</span></article>
        <article><strong>{automationTemplateData.length}</strong><span>templates</span></article>
      </section>
      <section className="content-block">
        <h2>Fila editorial e auditoria</h2>
        <table>
          <thead><tr><th>Módulo</th><th>Ciclos</th><th>Status</th></tr></thead>
          <tbody>
            {courseData.modules.map((module) => (
              <tr key={module.id}>
                <td>{module.code} - {module.title}</td>
                <td>{module.cycles.length}</td>
                <td>Importado e validado por script</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

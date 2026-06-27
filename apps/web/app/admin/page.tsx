'use client';

import { useState } from 'react';
import { automationTemplateData, courseData, flattenCycles, questionData } from '@inside/content';
import { UserManagement } from './_components/UserManagement';
import { Moderation } from './_components/Moderation';
import { CertificateManagement } from './_components/CertificateManagement';
import { AuditLogs } from './_components/AuditLogs';
import { useAuth } from '../../lib/auth';

export default function AdminPage() {
  const { user, loading, authorized } = useAuth({ required: true, roles: ['ADMIN', 'OWNER'] });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'certificates' | 'logs'>('overview');
  const cycles = flattenCycles();

  if (loading || !user || !authorized) return <div className="page-shell"><p>Validando permissão administrativa…</p></div>;

  return (
    <div className="page-shell">
      <p className="eyebrow">Painel administrativo</p>
      <h1>Operação do curso</h1>

      <nav className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('overview')} style={{ fontWeight: activeTab === 'overview' ? 'bold' : 'normal', background: activeTab === 'overview' ? '#f0f0f0' : 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#333' }}>Visão Geral</button>
        <button onClick={() => setActiveTab('users')} style={{ fontWeight: activeTab === 'users' ? 'bold' : 'normal', background: activeTab === 'users' ? '#f0f0f0' : 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#333' }}>Usuários</button>
        <button onClick={() => setActiveTab('moderation')} style={{ fontWeight: activeTab === 'moderation' ? 'bold' : 'normal', background: activeTab === 'moderation' ? '#f0f0f0' : 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#333' }}>Moderação</button>
        <button onClick={() => setActiveTab('certificates')} style={{ fontWeight: activeTab === 'certificates' ? 'bold' : 'normal', background: activeTab === 'certificates' ? '#f0f0f0' : 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#333' }}>Certificados</button>
        <button onClick={() => setActiveTab('logs')} style={{ fontWeight: activeTab === 'logs' ? 'bold' : 'normal', background: activeTab === 'logs' ? '#f0f0f0' : 'none', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#333' }}>Audit Logs</button>
      </nav>

      {activeTab === 'overview' && (
        <>
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
        </>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'moderation' && <Moderation />}
      {activeTab === 'certificates' && <CertificateManagement />}
      {activeTab === 'logs' && <AuditLogs />}
    </div>
  );
}

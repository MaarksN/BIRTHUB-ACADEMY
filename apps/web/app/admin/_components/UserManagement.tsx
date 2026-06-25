'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../../../lib/api';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiUrl()}/admin/users?tenantId=default`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        alert('Cargo atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar cargo.');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <section className="content-block">
      <h2>Gerenciar Usuários e Permissões (RBAC)</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  defaultValue={user.role || 'STUDENT'}
                  className="admin-select"
                  onChange={(e) => (user.newRole = e.target.value)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="EVALUATOR">EVALUATOR</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </td>
              <td>
                <button
                  className="btn-small"
                  onClick={() => handleUpdateRole(user.id, user.newRole || user.role || 'STUDENT')}
                >
                  Salvar
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>Nenhum usuário encontrado (Banco de dados pode estar vazio).</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

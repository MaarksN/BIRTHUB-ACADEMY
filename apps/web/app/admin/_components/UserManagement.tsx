'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '../../../lib/api';
import type { Role } from '../../../lib/auth';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  memberships: Array<{ role: { code: Role; name: string } }>;
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<AdminUser[]>('/admin/users')
      .then((data) => { setUsers(data); setRoles(Object.fromEntries(data.map((user) => [user.id, user.memberships[0]?.role.code ?? 'STUDENT']))); })
      .catch((cause) => setMessage(cause instanceof ApiError ? cause.message : 'Falha ao carregar usuários'))
      .finally(() => setLoading(false));
  }, []);
  const updateRole = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: roles[userId] }) });
      setMessage('Papel atualizado com sucesso.');
    } catch (cause) {
      setMessage(cause instanceof ApiError ? cause.message : 'Falha ao atualizar papel');
    }
  };
  if (loading) return <p>Carregando usuários…</p>;
  return <section className="content-block">
    <h2>Usuários e permissões</h2>
    {message ? <p role="status">{message}</p> : null}
    <table><thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Ação</th></tr></thead><tbody>
      {users.map((user) => <tr key={user.id}>
        <td>{user.name}</td><td>{user.email}</td><td>
          <select value={roles[user.id] ?? 'STUDENT'} onChange={(event) => setRoles((current) => ({ ...current, [user.id]: event.target.value as Role }))}>
            {(['OWNER', 'ADMIN', 'INSTRUCTOR', 'EVALUATOR', 'STUDENT'] as Role[]).map((role) => <option key={role}>{role}</option>)}
          </select>
        </td><td><button onClick={() => void updateRole(user.id)}>Salvar</button></td>
      </tr>)}
      {!users.length ? <tr><td colSpan={4}>Nenhum usuário encontrado.</td></tr> : null}
    </tbody></table>
  </section>;
}


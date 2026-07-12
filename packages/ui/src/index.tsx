import type { ReactNode } from 'react';

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'danger' }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="empty-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

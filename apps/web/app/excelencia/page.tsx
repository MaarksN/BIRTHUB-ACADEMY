'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError } from '../../lib/api';

interface ExcellenceItem {
  number: string;
  title: string;
  slug: string;
  category: string;
  priority: 'P0' | 'P1' | 'P1.5' | 'P2' | 'P3';
}

interface ExcellenceItemsResponse {
  total: number;
  items: ExcellenceItem[];
}

export default function ExcelenciaPage() {
  const [items, setItems] = useState<ExcellenceItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiFetch<ExcellenceItemsResponse>('/excellence/items')
      .then((response) => {
        setItems(response.items);
        setError('');
      })
      .catch((cause) => {
        setError(cause instanceof ApiError ? cause.message : 'Falha ao carregar plano de excelência');
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    return items.reduce<Record<ExcellenceItem['priority'], ExcellenceItem[]>>((acc, item) => {
      acc[item.priority].push(item);
      return acc;
    }, { P0: [], P1: [], 'P1.5': [], P2: [], P3: [] });
  }, [items]);

  if (loading) {
    return (
      <main className="page-shell">
        <p>Carregando excelência educacional…</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Birthub Academy Premium</p>
          <h1>Plano dos 35 itens de escola digital de ponta</h1>
          <p>
            Esta página consolida pedagogia, IA educacional, comunidade, carreira,
            acessibilidade, analytics, governança, B2B e growth.
          </p>
          {error ? <p className="status-error" role="alert">{error}</p> : null}
        </div>
        <div className="progress-box" aria-label="Resumo dos itens de excelência">
          <strong>{items.length}</strong>
          <span>itens mapeados</span>
        </div>
      </section>

      {(['P0', 'P1', 'P1.5', 'P2', 'P3'] as const).map((priority) => (
        <section className="module-list" key={priority} aria-labelledby={`priority-${priority}`}>
          <h2 id={`priority-${priority}`}>Prioridade {priority}</h2>
          <ol>
            {(grouped[priority] ?? []).map((item) => (
              <li key={item.slug}>
                <span>
                  {item.number}. {item.title}
                </span>
                <span>{item.category}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="module-row">
        <h2>Como validar</h2>
        <p>
          Rode `pnpm tsx scripts/validate-excellence-pack.ts` e depois execute
          typecheck, lint, testes e build no monorepo.
        </p>
      </section>
    </main>
  );
}

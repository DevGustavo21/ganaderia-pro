'use client';

import { useMemo, useState } from 'react';
import { GP } from '@/lib/theme';
import { Icon } from './Icon';
import {
  StatusBadge, AnimalAvatar, Pill, MetricChip, SearchInput, Button,
} from './ui';
import styles from './InventoryScreen.module.css';

const EMPTY_METRICS = { activos: 0, hembras: 0, machos: 0, pesoTotal: 0, salidas: 0, total: 0 };

export const InventoryScreen = ({
  finca,
  animals = [],
  metrics = EMPTY_METRICS,
  loading = false,
  canCreate = false,
  onOpenAnimal,
  onNewAnimal,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('todos');

  const filtered = useMemo(() => animals.filter(a => {
    if (filter !== 'todos' && a.estado !== filter) return false;
    if (query && !(`${a.arete} ${a.nombre} ${a.raza}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  }), [animals, filter, query]);

  const filterOpts = [
    { key: 'todos',      label: 'Todos',      count: animals.length },
    { key: 'activo',     label: 'Activo',     count: animals.filter(a => a.estado === 'activo').length },
    { key: 'vendido',    label: 'Vendido',    count: animals.filter(a => a.estado === 'vendido').length },
    { key: 'muerto',     label: 'Muerto',     count: animals.filter(a => a.estado === 'muerto').length },
    { key: 'robado',     label: 'Robado',     count: animals.filter(a => a.estado === 'robado').length },
    { key: 'trasladado', label: 'Trasladado', count: animals.filter(a => a.estado === 'trasladado').length },
  ];

  const hasAnimals = animals.length > 0;

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <div className={styles.crumb}>
            <Icon name="leaf" size={13} color={GP.green} /> {finca.nombre}
          </div>
          <h1 className={styles.title}>Inventario</h1>
          <p className={styles.subtitle}>
            {metrics.activos} animales activos · {animals.length} en total
          </p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            onClick={onNewAnimal}
            icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}
            style={{ flexShrink: 0 }}
            className={styles.headCta}
          >
            Registrar animal
          </Button>
        )}
      </header>

      <section className={styles.metrics}>
        <MetricChip label="Activos"     value={metrics.activos}                          sub="cab." accent={GP.green} />
        <MetricChip label="Hembras"     value={metrics.hembras}                          sub="cab." accent={GP.greenMid} />
        <MetricChip label="Peso total"  value={(metrics.pesoTotal / 1000).toFixed(1)}    sub="ton"  accent={GP.amber} />
        <MetricChip label="Salidas"     value={metrics.salidas}                          sub="cab." accent={GP.red} />
      </section>

      <section className={styles.toolbar}>
        <div className={styles.search}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por arete, nombre o raza" />
        </div>
        <div className={`${styles.filters} gp-no-scrollbar`}>
          {filterOpts.map(o => (
            <Pill key={o.key} size="sm" active={filter === o.key} onClick={() => setFilter(o.key)}>
              {o.label} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {o.count}</span>
            </Pill>
          ))}
        </div>
      </section>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Cargando…</div>
        </div>
      ) : !hasAnimals ? (
        <div className={styles.empty}>
          <Icon name="cow" size={32} color={GP.textSec} />
          <div className={styles.emptyTitle}>Aún no hay animales</div>
          <div className={styles.emptyHint}>
            {canCreate
              ? 'Empieza registrando tu primer animal en esta finca.'
              : 'Tu rol es de lectura. Puedes consultar el inventario cuando el equipo agregue animales.'}
          </div>
          {canCreate && (
            <Button
              variant="primary"
              onClick={onNewAnimal}
              icon={<Icon name="plus" size={16} color="#fff" strokeWidth={2.2} />}
              style={{ marginTop: 12 }}
            >
              Registrar primer animal
            </Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="search" size={32} color={GP.textSec} />
          <div className={styles.emptyTitle}>Sin resultados</div>
          <div className={styles.emptyHint}>No encontramos animales con esos criterios.</div>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filtered.map(a => (
            <li key={a.id}>
              <button type="button" onClick={() => onOpenAnimal(a)} className={styles.card}>
                <AnimalAvatar animal={a} size={48} />
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardArete}>{a.arete}</span>
                    <StatusBadge status={a.estado} />
                  </div>
                  <div className={styles.cardName}>{a.nombre || 'Sin nombre'}</div>
                  <div className={styles.cardSub}>
                    <span>{a.categoria}</span>
                    <span className={styles.dotSep} />
                    <span>{a.raza}</span>
                  </div>
                </div>
                <Icon name="chevR" size={16} color={GP.textSec} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeFarm } from '@/lib/normalize';

const STORAGE_KEY = 'gp.activeFincaId';

const FincaContext = createContext({
  finca: null,
  fincas: [],
  user: null,
  setFincaId: () => {},
  clearFinca: () => {},
  ready: false,
});

export const FincaProvider = ({ initialFarms = [], user = null, children }) => {
  const fincas = useMemo(() => initialFarms.map(normalizeFarm), [initialFarms]);

  const [fincaId, setFincaIdState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && fincas.some(f => f.id === saved)) {
        setFincaIdState(saved);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, [fincas]);

  const setFincaId = useCallback((id) => {
    setFincaIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const clearFinca = useCallback(() => setFincaId(null), [setFincaId]);
  const finca = fincaId ? fincas.find(f => f.id === fincaId) || null : null;

  return (
    <FincaContext.Provider value={{ finca, fincas, user, setFincaId, clearFinca, ready }}>
      {children}
    </FincaContext.Provider>
  );
};

export const useFinca = () => useContext(FincaContext);

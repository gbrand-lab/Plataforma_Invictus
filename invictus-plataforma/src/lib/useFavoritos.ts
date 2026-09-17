'use client';

import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'invictus:favoritos';

/**
 * Favoritos do visitante, persistidos no navegador.
 * Quando houver área logada, troque o corpo deste hook por chamadas à API —
 * a assinatura ({ favoritos, alternar, isFavorito }) não precisa mudar.
 */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) setFavoritos(new Set(JSON.parse(bruto) as string[]));
    } catch {
      /* modo privado ou storage bloqueado: segue sem persistência */
    }
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify([...favoritos]));
    } catch {
      /* idem */
    }
  }, [favoritos, pronto]);

  const alternar = useCallback((id: string) => {
    setFavoritos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }, []);

  const isFavorito = useCallback((id: string) => favoritos.has(id), [favoritos]);

  return { favoritos, alternar, isFavorito, pronto };
}

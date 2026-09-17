'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useFavoritos } from './useFavoritos';

type FavoritosCtx = ReturnType<typeof useFavoritos>;

const Ctx = createContext<FavoritosCtx | null>(null);

/**
 * Estado global de favoritos.
 * Evita prop drilling e mantém o contador do header em sincronia com os cards.
 */
export function FavoritosProvider({ children }: { children: ReactNode }) {
  const valor = useFavoritos();
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useFavoritosCtx(): FavoritosCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFavoritosCtx precisa estar dentro de <FavoritosProvider>');
  return ctx;
}

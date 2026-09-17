import type { Config } from 'tailwindcss';

/**
 * Design system Invictus.
 * O laranja é cor de ação (CTA, tags, estados ativos) — nunca cor de fundo de seção.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#121316',        // preto/grafite principal
        ink2: '#54565C',       // texto secundário
        muted: '#8A8B90',      // texto de apoio
        line: '#E6E2DB',       // hairline quente
        ground: '#FAF9F6',     // off-white de fundo
        wash: '#FDF1E7',       // laranja lavado (fundos de ícone/tag)
        brand: '#ED6A1F',      // laranja Invictus
        brandDeep: '#C9500F',  // laranja de hover/pressed
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        float: '0 1px 2px rgba(18,19,22,.05), 0 14px 34px -18px rgba(18,19,22,.22)',
        lift: '0 2px 6px rgba(18,19,22,.05), 0 18px 40px -22px rgba(18,19,22,.28)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      transitionTimingFunction: {
        invictus: 'cubic-bezier(.2,.7,.3,1)',
      },
    },
  },
  plugins: [],
};

export default config;

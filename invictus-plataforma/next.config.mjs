// Next.js usa eval() no HMR do modo dev — 'unsafe-eval' fica restrito a esse ambiente.
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
  "connect-src 'self' https://nominatim.openstreetmap.org",
  "frame-src https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Formatos modernos pedidos no briefing (AVIF/WebP) com fallback automático.
    formats: ['image/avif', 'image/webp'],
    // Libere aqui o domínio do CDN/bucket onde as fotos reais da Invictus vão ficar.
    remotePatterns: [
      // { protocol: 'https', hostname: 'cdn.invictusimoveis.com.br' },
      { protocol: 'https', hostname: 'picsum.photos' }, // só para fotos de teste — remover quando entrar o CDN real
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { MetadataRoute } from 'next';
import { CONFIG } from '@/lib/config';
import { publicados } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = CONFIG.siteUrl;

  const fixas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/imoveis`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/imoveis?finalidade=venda`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/imoveis?finalidade=aluguel`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/imoveis?finalidade=repasse`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/menu`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/anunciar`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const lista = await publicados();
  const imoveis: MetadataRoute.Sitemap = lista.map((i) => ({
    url: `${base}/imovel/${i.slug}`,
    lastModified: new Date(i.publicadoEm),
    changeFrequency: 'weekly',
    priority: i.destaque ? 0.9 : 0.7,
  }));

  return [...fixas, ...imoveis];
}

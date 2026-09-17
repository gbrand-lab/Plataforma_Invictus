# Plataforma Invictus

Portal imobiliário da **Imobiliária Invictus** — busca, catálogo filtrável, página de imóvel com conversão por WhatsApp e cadastro de imóveis pela rede de corretores parceiros.

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · lucide-react.

---

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção (gera as páginas de imóvel estáticas)
npm start          # sobe o build
npm run typecheck  # tsc --noEmit
```

Copie `.env.example` para `.env.local` e ajuste:

```
NEXT_PUBLIC_WHATSAPP=5598999990000        # somente dígitos, com DDI + DDD
NEXT_PUBLIC_SITE_URL=https://invictusimoveis.com.br
```

---

## As três coisas que você provavelmente quer mudar primeiro

### 1. WhatsApp, telefone, e-mail e redes

`src/lib/config.ts` — ponto único. Todo CTA da plataforma sai daqui, inclusive a mensagem automática da página do imóvel.

### 2. Fotos dos imóveis

Hoje cada imóvel usa composições arquitetônicas geradas em SVG (`src/lib/scenes.ts`), embutidas como data URI — zero request, zero dependência externa.

Para usar fotografia real, troque o array `imagens` do imóvel em `src/lib/data.ts`:

```ts
imagens: [
  '/imoveis/inv-1042/01.webp',
  '/imoveis/inv-1042/02.webp',
  // ou URLs do CDN liberado em next.config.mjs
],
```

O componente `<Foto>` (`src/components/ui/Foto.tsx`) detecta sozinho: data URI vira `<img>`, caminho/URL vira `next/image` com lazy loading e AVIF/WebP. **Nada além desse array precisa mudar.** Para domínio externo, libere o host em `next.config.mjs` → `images.remotePatterns`.

### 3. Catálogo vindo de API/banco

`src/lib/data.ts` é o único arquivo que conhece os dados. Nenhum componente importa catálogo direto — todos recebem por props. Para plugar backend, mantenha o contrato de `src/lib/types.ts` (`Imovel`) e troque as funções:

| Função              | Onde é usada                          |
| ------------------- | ------------------------------------- |
| `publicados()`      | home, listagem, favoritos             |
| `destaques(n)`      | seção "Imóveis selecionados para você" |
| `recentes(n)`       | seção "Novidades na Invictus"          |
| `getImovel(slug)`   | rota `/imovel/[slug]`                  |
| `slugsPublicados()` | `generateStaticParams` e sitemap       |
| `filtrar(lista, f)` | listagem                               |
| `semelhantes(...)`  | "Você também pode gostar"              |

O formulário da Rede Invictus está pronto no front: em `PropertySubmission.tsx`, a função `enviar()` tem o ponto marcado com `TODO` para o `POST /api/imoveis` com `status: 'pending'`.

---

## Estrutura

```
src/
  app/
    layout.tsx                 fontes auto-hospedadas, header, footer, provider de favoritos
    page.tsx                   home (Experiência A)
    imoveis/page.tsx           listagem com filtros
    imovel/[slug]/page.tsx     página do imóvel (Experiência B) — SSG + Schema.org
    anunciar/page.tsx          cadastro da Rede Invictus
    favoritos/                 imóveis salvos
    sitemap.ts, robots.ts      SEO
    politica-de-privacidade/, termos-de-uso/
  components/
    Header · Footer · HeroSearch · SearchBar · CategoryCard
    PropertyCard · PropertyGrid · PropertyListing
    PropertyGallery · PropertyDetails · PropertyFeatures · PropertyLocation
    ContactCard · WhatsAppCTA · FilterBar · FilterDrawer
    Testimonials · BrokerNetwork · PropertySubmission
    ui/                        Btn, Tag, Campo, Foto, Reveal, Skeleton, SectionHead, Specs, Toast
  lib/
    types.ts                   contrato de domínio (Imovel, Filtro, StatusImovel…)
    config.ts                  contatos e helpers de WhatsApp
    data.ts                    catálogo demonstrativo + filtros + similares
    urlFiltros.ts              filtro <-> querystring
    scenes.ts                  imagens demonstrativas em SVG
    format.ts                  moeda, número, data, classes
    useFavoritos.ts            persistência no navegador
    favoritos-context.tsx      estado compartilhado
  fonts/                       Archivo e Fraunces em woff2 (self-hosted)
```

---

## Decisões que valem saber

**Filtros na URL.** O estado da busca vive na querystring (`/imoveis?finalidade=venda&bairro=Calhau`). O link é compartilhável, o botão voltar funciona e a página é indexável por combinação de filtro.

**Páginas de imóvel estáticas.** `generateStaticParams` gera uma página por imóvel no build — carregamento instantâneo e HTML completo para o Google. Com backend, troque por ISR (`revalidate`) para não precisar de novo build a cada anúncio.

**SEO.** URL amigável (`/imovel/apartamento-jardim-renascenca-3-quartos`), `title`/`description` por imóvel, Open Graph, canonical, `RealEstateListing` do Schema.org, sitemap e robots automáticos.

**Localização aproximada.** Cada imóvel tem `localizacaoAproximada`. Quando true, o mapa mostra só o raio e o Schema.org publica o bairro no lugar do endereço. O mapa é um SVG esquemático — para mapa real, troque o `<svg>` em `PropertyLocation.tsx` por um embed usando `lat`/`lng`, mantendo essa regra.

**Aprovação obrigatória.** Anúncio de corretor nunca é publicado direto: entra como `pending` e a tela de confirmação exibe "aguardando aprovação da Invictus".

**Favoritos.** Ficam no `localStorage` do visitante. Quando existir área logada, troque o corpo de `useFavoritos.ts` por chamadas à API — a assinatura do hook não muda.

**Fontes auto-hospedadas.** Archivo + Fraunces em woff2 dentro do projeto, via `next/font/local`. Sem request ao Google Fonts: melhor LCP e um problema a menos de LGPD.

**Acessibilidade.** Foco visível, `aria-label` nos controles de ícone, `aria-pressed` nos toggles, diálogos com `role="dialog"` e fechamento por Esc, e `prefers-reduced-motion` respeitado.

---

## O que ainda não existe

- Painel administrativo (o contrato de dados já prevê: `status`, `destaque`, `naChave`, `visualizacoes`)
- Upload real de imagens — hoje o preview do formulário usa `URL.createObjectURL`
- Autenticação de corretores
- Integração do lead com CRM

Build verificado: `next build` sem erros, 13 páginas de imóvel pré-renderizadas, ~119 kB de JS no primeiro carregamento.

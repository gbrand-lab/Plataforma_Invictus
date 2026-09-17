/**
 * IMAGENS DEMONSTRATIVAS
 * ----------------------
 * Enquanto o acervo fotográfico da Invictus não entra, cada imóvel usa
 * composições arquitetônicas geradas em SVG (data URI, zero request).
 *
 * PARA TROCAR POR FOTOGRAFIA REAL: em `src/lib/data.ts`, substitua o campo
 * `imagens` de cada imóvel por caminhos/URLs — ex.: ['/imoveis/inv-1042/01.webp', ...]
 * ou URLs do CDN liberado em `next.config.mjs`. O componente <Foto> detecta
 * automaticamente e passa a usar next/image com lazy loading e AVIF/WebP.
 * Nada além desse array precisa mudar.
 */

const P = {
  skyTop: '#DCE3E8',
  skyBot: '#F1EFEA',
  duskTop: '#39414C',
  duskBot: '#C7A183',
  concrete: '#DBD6CE',
  concrete2: '#C8C2B8',
  concrete3: '#B2ABA0',
  dark: '#7C776F',
  darker: '#5C5850',
  glass: '#9DAFBB',
  glass2: '#8296A4',
  glass3: '#697C8A',
  green: '#B9C0AC',
  green2: '#A2AB95',
  ground: '#CFC9BF',
  asphalt: '#B4B1AC',
  wood: '#C6A67E',
  water: '#8FA8B4',
  accent: '#ED6A1F',
  white: '#F6F4F0',
};

function rng(seed: number): () => number {
  let t = seed * 1831565813 + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200;
const H = 800;

function shell(defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${body}</svg>`;
}

const skyDefs = (id: string, a: string, b: string): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const grain = `<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="over"/></filter>`;
const grainRect = `<rect width="${W}" height="${H}" filter="url(#gr)" fill="none"/><rect width="${W}" height="${H}" fill="#000" opacity="0.02"/>`;

/* ---------------------------------------------------------------- fachada */
function facade(seed: number): string {
  const r = rng(seed);
  const bases = ['#DBD6CE', '#D2CDC4', '#E1DBD1'];
  const base = bases[Math.floor(r() * bases.length)];
  const cols = 4 + Math.floor(r() * 3);      // 4 a 6 eixos
  const floors = 5 + Math.floor(r() * 2);    // 5 ou 6 pavimentos
  const varandas = r() > 0.45;
  const M = 70;                               // margem lateral
  const largura = W - M * 2;
  const passo = largura / cols;
  const fh = (H - 60) / floors;              // altura do pavimento
  const jw = passo * 0.62;                   // largura do vão
  const jh = fh * 0.58;

  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += `<rect x="${M}" y="60" width="${largura}" height="${H - 60}" fill="${base}"/>`;
  for (let i = 0; i <= cols; i++) {
    const x = M + i * passo - 12;
    o += `<rect x="${x}" y="60" width="24" height="${H - 60}" fill="${P.concrete2}"/>`;
    o += `<rect x="${x + 24}" y="60" width="5" height="${H - 60}" fill="#00000010"/>`;
  }
  for (let f = 0; f < floors; f++) {
    const y = 84 + f * fh;
    for (let i = 0; i < cols; i++) {
      const x = M + i * passo + (passo - jw) / 2;
      const tint = [P.glass, P.glass2, P.glass3][Math.floor(r() * 3)];
      o += `<rect x="${x}" y="${y}" width="${jw}" height="${jh}" fill="${tint}"/>`;
      o += `<path d="M${x} ${y + jh} L${x + jw} ${y} L${x + jw} ${y + jh * 0.3} L${x + jw * 0.4} ${y + jh} Z" fill="#FFFFFF" opacity="0.17"/>`;
      if (r() > 0.93) o += `<rect x="${x}" y="${y}" width="${jw}" height="${jh}" fill="${P.accent}" opacity="0.16"/>`;
      o += `<rect x="${x}" y="${y}" width="${jw}" height="${jh}" fill="none" stroke="${P.darker}" stroke-width="1.5" opacity="0.3"/>`;
      if (varandas && f % 2 === 1) {
        o += `<rect x="${x}" y="${y + jh * 0.52}" width="${jw}" height="${jh * 0.48}" fill="${P.glass}" opacity="0.4"/>`;
        o += `<rect x="${x}" y="${y + jh * 0.52}" width="${jw}" height="${jh * 0.48}" fill="none" stroke="${P.white}" stroke-width="2"/>`;
      }
    }
    o += `<rect x="${M}" y="${y + jh}" width="${largura}" height="14" fill="${P.white}"/>`;
    o += `<rect x="${M}" y="${y + jh + 14}" width="${largura}" height="5" fill="#00000016"/>`;
  }
  o += `<rect x="${M}" y="60" width="${largura}" height="${H - 60}" fill="url(#vig)" opacity="0.5"/>`;
  o += grainRect;
  return shell(
    skyDefs('sky', P.skyTop, P.skyBot) +
      `<linearGradient id="vig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.25"/><stop offset="1" stop-color="#2A2823" stop-opacity="0.18"/></linearGradient>` +
      grain,
    o
  );
}

/* ------------------------------------------------------------------ torre */
function tower(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  // nuvem discreta
  o += `<ellipse cx="900" cy="160" rx="230" ry="52" fill="#FFFFFF" opacity="0.45"/><ellipse cx="760" cy="190" rx="150" ry="38" fill="#FFFFFF" opacity="0.3"/>`;
  // blocos de fundo
  o += `<rect x="60" y="330" width="210" height="400" fill="${P.concrete3}" opacity="0.75"/>`;
  o += `<rect x="940" y="290" width="230" height="440" fill="${P.concrete3}" opacity="0.7"/>`;
  for (let i = 0; i < 24; i++) {
    o += `<rect x="${80 + (i % 4) * 48}" y="${356 + Math.floor(i / 4) * 58}" width="32" height="38" fill="${P.glass3}" opacity="0.5"/>`;
    o += `<rect x="${962 + (i % 4) * 52}" y="${316 + Math.floor(i / 4) * 62}" width="34" height="40" fill="${P.glass3}" opacity="0.45"/>`;
  }
  // torre principal
  const tx = 350;
  o += `<rect x="${tx}" y="130" width="500" height="600" fill="${P.concrete}"/>`;
  o += `<rect x="${tx + 500}" y="150" width="60" height="580" fill="${P.concrete2}"/>`;
  o += `<path d="M${tx} 130 L${tx + 500} 130 L${tx + 560} 150 L${tx + 560} 160 L${tx} 160 Z" fill="${P.white}"/>`;
  for (let f = 0; f < 9; f++) {
    const y = 176 + f * 62;
    for (let i = 0; i < 5; i++) {
      const x = tx + 22 + i * 93;
      const tint = [P.glass, P.glass2, P.glass3][Math.floor(r() * 3)];
      o += `<rect x="${x}" y="${y}" width="72" height="40" fill="${tint}"/>`;
      if (r() > 0.88) o += `<rect x="${x}" y="${y}" width="72" height="40" fill="${P.accent}" opacity="0.25"/>`;
    }
    o += `<rect x="${tx}" y="${y + 40}" width="500" height="9" fill="${P.white}"/>`;
    o += `<rect x="${tx}" y="${y + 49}" width="500" height="3" fill="#00000014"/>`;
  }
  // base / terreo
  o += `<rect x="${tx - 60}" y="640" width="620" height="90" fill="${P.white}"/>`;
  o += `<rect x="${tx - 60}" y="662" width="620" height="46" fill="${P.glass2}" opacity="0.7"/>`;
  o += `<rect x="${tx + 220}" y="662" width="60" height="68" fill="${P.accent}" opacity="0.85"/>`;
  // solo
  o += `<rect x="0" y="730" width="${W}" height="70" fill="${P.ground}"/>`;
  o += `<rect x="0" y="730" width="${W}" height="8" fill="#00000010"/>`;
  // vegetação
  for (let i = 0; i < 7; i++) {
    const x = 90 + i * 165 + r() * 30;
    o += `<ellipse cx="${x}" cy="${700}" rx="42" ry="34" fill="${P.green2}"/><rect x="${x - 3}" y="700" width="6" height="34" fill="${P.darker}" opacity="0.55"/>`;
  }
  o += grainRect;
  return shell(skyDefs('sky', P.skyTop, '#F3F1EC') + grain, o);
}

/* --------------------------------------------------------------- interior */
function interior(seed: number): string {
  const r = rng(seed);
  const parede = ['#E7E2DB', '#E2DED6', '#EAE6DF', '#DFDAD2'][Math.floor(r() * 4)];
  const sofa = ['#B2ABA0', '#A8A79F', '#B9BDB0', '#AFA79A'][Math.floor(r() * 4)];
  let o = `<rect width="${W}" height="${H}" fill="#EDE9E3"/>`;
  // parede de fundo + janela
  o += `<rect x="0" y="0" width="${W}" height="620" fill="${parede}"/>`;
  o += `<rect x="120" y="70" width="640" height="470" fill="url(#win)"/>`;
  o += `<rect x="120" y="70" width="640" height="470" fill="none" stroke="${P.darker}" stroke-width="7" opacity="0.65"/>`;
  o += `<rect x="437" y="70" width="8" height="470" fill="${P.darker}" opacity="0.65"/>`;
  // silhueta urbana na janela
  o += `<rect x="150" y="330" width="90" height="210" fill="${P.glass3}" opacity="0.35"/>`;
  o += `<rect x="270" y="280" width="120" height="260" fill="${P.glass3}" opacity="0.28"/>`;
  o += `<rect x="470" y="350" width="110" height="190" fill="${P.glass3}" opacity="0.3"/>`;
  o += `<rect x="610" y="300" width="120" height="240" fill="${P.glass3}" opacity="0.25"/>`;
  // feixe de luz
  o += `<path d="M120 540 L760 540 L960 800 L60 800 Z" fill="#FFFFFF" opacity="0.28"/>`;
  // piso
  o += `<rect x="0" y="560" width="${W}" height="240" fill="#D8D1C6"/>`;
  for (let i = 0; i < 10; i++) o += `<rect x="0" y="${576 + i * 26}" width="${W}" height="1.5" fill="#00000010"/>`;
  // tapete
  o += `<path d="M200 690 L980 690 L1060 800 L120 800 Z" fill="#C4BBAE"/>`;
  // sofá
  o += `<rect x="250" y="560" width="440" height="120" rx="14" fill="${sofa}"/>`;
  o += `<rect x="262" y="548" width="416" height="52" rx="12" fill="${P.dark}"/>`;
  o += `<rect x="300" y="556" width="90" height="42" rx="10" fill="${P.accent}" opacity="0.75"/>`;
  o += `<rect x="404" y="556" width="90" height="42" rx="10" fill="${P.white}" opacity="0.8"/>`;
  o += `<rect x="262" y="680" width="20" height="26" fill="${P.darker}"/><rect x="658" y="680" width="20" height="26" fill="${P.darker}"/>`;
  // mesa de centro
  o += `<ellipse cx="800" cy="690" rx="120" ry="34" fill="${P.wood}"/><rect x="790" y="690" width="20" height="46" fill="${P.darker}"/>`;
  o += `<rect x="770" y="668" width="54" height="14" rx="4" fill="${P.white}"/>`;
  // planta
  o += `<rect x="980" y="620" width="72" height="90" rx="8" fill="${P.concrete2}"/>`;
  o += `<path d="M1016 620 C 960 560, 990 500, 1016 470 C 1044 500, 1072 560, 1016 620 Z" fill="${P.green2}"/>`;
  // luminária
  o += `<rect x="878" y="0" width="4" height="180" fill="${P.darker}"/><path d="M840 180 L920 180 L900 230 L860 230 Z" fill="${P.darker}"/>`;
  o += `<ellipse cx="880" cy="252" rx="28" ry="12" fill="${P.accent}" opacity="${0.25 + r() * 0.15}"/>`;
  o += grainRect;
  return shell(
    `<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBD7DF"/><stop offset="1" stop-color="#EDE6DA"/></linearGradient>` + grain,
    o
  );
}

/* -------------------------------------------------------------- loteamento */
function terrain(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += `<circle cx="960" cy="180" r="58" fill="${P.accent}" opacity="0.25"/>`;
  o += `<rect x="0" y="300" width="${W}" height="500" fill="${P.green}"/>`;
  o += `<rect x="0" y="300" width="${W}" height="10" fill="#00000010"/>`;
  // vegetação de fundo
  for (let i = 0; i < 14; i++) {
    const x = i * 90 + r() * 40;
    o += `<ellipse cx="${x}" cy="${296}" rx="52" ry="26" fill="${P.green2}" opacity="0.8"/>`;
  }
  // via em perspectiva
  o += `<path d="M540 300 L660 300 L980 800 L140 800 Z" fill="${P.asphalt}"/>`;
  for (let i = 0; i < 7; i++) {
    const t = i / 7;
    const y = 320 + t * t * 470;
    const w = 8 + t * 26;
    const cx = 600 + (t * t * 22);
    o += `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${10 + t * 34}" fill="${P.white}" opacity="0.8"/>`;
  }
  // quadras / lotes
  const lines = [
    'M540 306 L60 800', 'M600 306 L400 800', 'M660 306 L1060 800',
  ];
  for (const d of lines) o += `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.55"/>`;
  for (let i = 0; i < 6; i++) {
    const t = (i + 1) / 7;
    const y = 310 + t * t * 470;
    o += `<path d="M${60 + (1 - t) * 420} ${y} L${1140 - (1 - t) * 460} ${y}" stroke="#FFFFFF" stroke-width="${1.5 + t * 2.5}" opacity="0.4"/>`;
  }
  // marcos / estacas
  for (let i = 0; i < 5; i++) {
    const x = 140 + i * 40 + r() * 20;
    const y = 700 + i * 12;
    o += `<rect x="${x}" y="${y - 46}" width="7" height="46" fill="${P.white}"/><rect x="${x}" y="${y - 46}" width="7" height="14" fill="${P.accent}"/>`;
  }
  // placa
  o += `<rect x="820" y="470" width="230" height="120" rx="8" fill="${P.white}"/><rect x="820" y="470" width="230" height="120" rx="8" fill="none" stroke="${P.darker}" stroke-width="3" opacity="0.4"/>`;
  o += `<rect x="846" y="500" width="120" height="12" rx="6" fill="${P.darker}" opacity="0.55"/>`;
  o += `<rect x="846" y="524" width="178" height="10" rx="5" fill="${P.dark}" opacity="0.4"/>`;
  o += `<rect x="846" y="548" width="90" height="18" rx="4" fill="${P.accent}"/>`;
  o += `<rect x="912" y="590" width="10" height="90" fill="${P.darker}" opacity="0.6"/><rect x="948" y="590" width="10" height="90" fill="${P.darker}" opacity="0.6"/>`;
  // palmeiras
  for (let i = 0; i < 3; i++) {
    const x = 200 + i * 90;
    o += `<rect x="${x}" y="420" width="9" height="200" fill="${P.darker}" opacity="0.6"/>`;
    o += `<path d="M${x + 4} 420 C ${x - 60} 400, ${x - 70} 440, ${x - 76} 452 M${x + 4} 420 C ${x + 68} 400, ${x + 78} 440, ${x + 84} 452 M${x + 4} 420 C ${x - 30} 372, ${x - 10} 356, ${x + 4} 350 M${x + 4} 420 C ${x + 44} 380, ${x + 56} 392, ${x + 62} 400" stroke="${P.green2}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  }
  o += grainRect;
  return shell(skyDefs('sky', '#CFDCE4', '#EFEADF') + grain, o);
}

/* ------------------------------------------------------------------- casa */
function house(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += `<rect x="0" y="600" width="${W}" height="200" fill="${P.green}"/>`;
  o += `<rect x="0" y="700" width="${W}" height="100" fill="${P.asphalt}"/>`;
  // muro
  o += `<rect x="0" y="520" width="${W}" height="90" fill="${P.concrete2}"/>`;
  // volume principal
  o += `<rect x="200" y="200" width="560" height="330" fill="${P.white}"/>`;
  o += `<rect x="760" y="300" width="280" height="230" fill="${P.concrete}"/>`;
  o += `<rect x="180" y="184" width="880" height="22" fill="${P.concrete3}"/>`;
  // janelões
  for (let i = 0; i < 3; i++) {
    const x = 236 + i * 172;
    o += `<rect x="${x}" y="240" width="136" height="110" fill="${P.glass2}"/>`;
    o += `<path d="M${x} 350 L${x + 136} 240 L${x + 136} 268 L${x + 48} 350 Z" fill="#FFFFFF" opacity="0.2"/>`;
    o += `<rect x="${x}" y="240" width="136" height="110" fill="none" stroke="${P.darker}" stroke-width="3" opacity="0.4"/>`;
  }
  // sacada
  o += `<rect x="216" y="360" width="528" height="12" fill="${P.concrete3}"/>`;
  for (let i = 0; i < 22; i++) o += `<rect x="${224 + i * 24}" y="${316}" width="3" height="44" fill="${P.darker}" opacity="0.35"/>`;
  // térreo envidraçado
  o += `<rect x="230" y="400" width="480" height="120" fill="${P.glass}"/>`;
  o += `<rect x="230" y="400" width="480" height="120" fill="none" stroke="${P.darker}" stroke-width="3" opacity="0.35"/>`;
  o += `<rect x="470" y="400" width="6" height="120" fill="${P.darker}" opacity="0.35"/>`;
  // garagem
  o += `<rect x="800" y="360" width="200" height="160" fill="${P.concrete2}"/>`;
  for (let i = 0; i < 9; i++) o += `<rect x="800" y="${366 + i * 17}" width="200" height="9" fill="#00000012"/>`;
  // portão + faixa laranja
  o += `<rect x="486" y="520" width="120" height="90" fill="${P.darker}" opacity="0.8"/>`;
  o += `<rect x="486" y="520" width="120" height="10" fill="${P.accent}"/>`;
  // vegetação
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 250 + r() * 40;
    o += `<ellipse cx="${x}" cy="${580}" rx="56" ry="40" fill="${P.green2}"/>`;
    o += `<rect x="${x - 4}" y="580" width="8" height="34" fill="${P.darker}" opacity="0.5"/>`;
  }
  o += `<rect x="0" y="694" width="${W}" height="6" fill="#00000012"/>`;
  o += grainRect;
  return shell(skyDefs('sky', '#D3DEE6', '#F0ECE4') + grain, o);
}

/* ------------------------------------------------------------------ lazer */
function pool(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#E3DED5"/>`;
  // deck
  o += `<rect x="0" y="0" width="${W}" height="${H}" fill="${P.concrete}"/>`;
  for (let i = 0; i < 26; i++) o += `<rect x="0" y="${i * 32}" width="${W}" height="1.5" fill="#00000010"/>`;
  // piscina
  o += `<rect x="180" y="180" width="700" height="420" rx="10" fill="url(#wat)"/>`;
  o += `<rect x="180" y="180" width="700" height="420" rx="10" fill="none" stroke="${P.white}" stroke-width="12"/>`;
  for (let i = 0; i < 9; i++) {
    const y = 220 + i * 44;
    o += `<path d="M${210 + r() * 60} ${y} q 60 -12 120 0 t 120 0 t 120 0 t 120 0" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="${0.18 + r() * 0.2}"/>`;
  }
  // borda molhada
  o += `<rect x="150" y="150" width="760" height="480" rx="14" fill="none" stroke="${P.concrete2}" stroke-width="4" opacity="0.8"/>`;
  // espreguiçadeiras
  for (let i = 0; i < 3; i++) {
    const y = 200 + i * 150;
    o += `<rect x="940" y="${y}" width="170" height="52" rx="10" fill="${P.white}"/>`;
    o += `<path d="M940 ${y} L1000 ${y - 40} L1030 ${y - 28} L1000 ${y} Z" fill="${P.white}"/>`;
    o += `<rect x="962" y="${y + 12}" width="126" height="12" rx="6" fill="${P.concrete2}"/>`;
  }
  // guarda-sol
  o += `<path d="M1020 90 L1160 90 L1090 30 Z" fill="${P.accent}" opacity="0.85"/><rect x="1086" y="90" width="8" height="80" fill="${P.darker}" opacity="0.7"/>`;
  // pergolado
  o += `<rect x="40" y="60" width="80" height="520" fill="${P.wood}" opacity="0.75"/>`;
  for (let i = 0; i < 12; i++) o += `<rect x="40" y="${70 + i * 44}" width="200" height="12" fill="${P.wood}" opacity="0.55"/>`;
  // vegetação
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 190;
    o += `<ellipse cx="${x}" cy="720" rx="70" ry="46" fill="${P.green2}" opacity="0.9"/>`;
  }
  o += grainRect;
  return shell(
    `<linearGradient id="wat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93B3C0"/><stop offset="1" stop-color="#6F97A8"/></linearGradient>` + grain,
    o
  );
}

/* ------------------------------------------------------------- comercial */
function office(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += `<rect x="120" y="90" width="440" height="640" fill="${P.glass3}"/>`;
  o += `<rect x="560" y="150" width="70" height="580" fill="${P.concrete2}"/>`;
  o += `<rect x="660" y="220" width="420" height="510" fill="${P.glass2}" opacity="0.85"/>`;
  for (let f = 0; f < 16; f++) {
    o += `<rect x="120" y="${96 + f * 40}" width="440" height="4" fill="${P.white}" opacity="0.55"/>`;
  }
  for (let c = 0; c < 8; c++) {
    o += `<rect x="${124 + c * 55}" y="90" width="4" height="640" fill="${P.white}" opacity="0.3"/>`;
  }
  // reflexo diagonal
  o += `<path d="M120 730 L560 90 L560 300 L300 730 Z" fill="#FFFFFF" opacity="0.13"/>`;
  for (let f = 0; f < 12; f++) {
    o += `<rect x="666" y="${230 + f * 42}" width="408" height="5" fill="${P.white}" opacity="0.4"/>`;
    if (r() > 0.8) o += `<rect x="${680 + Math.floor(r() * 6) * 66}" y="${234 + f * 42}" width="60" height="34" fill="${P.accent}" opacity="0.2"/>`;
  }
  // base
  o += `<rect x="60" y="660" width="1080" height="70" fill="${P.white}"/>`;
  o += `<rect x="60" y="678" width="1080" height="38" fill="${P.glass}" opacity="0.6"/>`;
  o += `<rect x="520" y="678" width="90" height="52" fill="${P.accent}" opacity="0.8"/>`;
  o += `<rect x="0" y="730" width="${W}" height="70" fill="${P.asphalt}"/>`;
  o += `<rect x="0" y="730" width="${W}" height="6" fill="#00000014"/>`;
  o += grainRect;
  return shell(skyDefs('sky', '#C9D6E0', '#EDEAE3') + grain, o);
}

/* --------------------------------------------------------------- beira-mar */
function aerial(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  o += `<circle cx="220" cy="150" r="46" fill="${P.accent}" opacity="0.3"/>`;
  o += `<rect x="0" y="360" width="${W}" height="180" fill="${P.water}"/>`;
  for (let i = 0; i < 22; i++) {
    const y = 372 + r() * 160;
    o += `<path d="M${r() * W} ${y} q 30 -6 60 0" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="${0.2 + r() * 0.3}"/>`;
  }
  // areia
  o += `<path d="M0 520 Q 300 560 620 540 T 1200 560 L1200 620 L0 620 Z" fill="#E0D5C2"/>`;
  // skyline
  const hs = [200, 300, 250, 360, 210, 320, 280, 380, 240, 300];
  for (let i = 0; i < 10; i++) {
    const x = 40 + i * 118;
    const h = hs[i] + r() * 40;
    o += `<rect x="${x}" y="${600 - h}" width="96" height="${h}" fill="${i % 2 ? P.concrete : P.concrete2}"/>`;
    for (let f = 0; f < Math.floor(h / 34); f++) {
      for (let c = 0; c < 3; c++) {
        const on = r() > 0.82;
        o += `<rect x="${x + 12 + c * 26}" y="${610 - h + f * 34}" width="16" height="20" fill="${on ? P.accent : P.glass3}" opacity="${on ? 0.55 : 0.45}"/>`;
      }
    }
  }
  o += `<rect x="0" y="600" width="${W}" height="200" fill="${P.ground}"/>`;
  o += `<rect x="0" y="600" width="${W}" height="7" fill="#00000012"/>`;
  for (let i = 0; i < 8; i++) {
    const x = 70 + i * 150;
    o += `<rect x="${x}" y="640" width="8" height="120" fill="${P.darker}" opacity="0.55"/>`;
    o += `<path d="M${x + 4} 640 C ${x - 50} 620, ${x - 58} 656, ${x - 62} 668 M${x + 4} 640 C ${x + 58} 620, ${x + 66} 656, ${x + 70} 668 M${x + 4} 640 C ${x - 24} 598, ${x - 6} 584, ${x + 4} 580" stroke="${P.green2}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }
  o += grainRect;
  return shell(skyDefs('sky', '#BFD2DE', '#F0E9DC') + grain, o);
}

/* ----------------------------------------------------------------- cozinha */
function kitchen(seed: number): string {
  const r = rng(seed);
  const parede = ['#E2DCD3', '#E6E1D8', '#DDD8CF'][Math.floor(r() * 3)];
  let o = `<rect width="${W}" height="${H}" fill="#E9E4DC"/>`;
  o += `<rect x="0" y="0" width="${W}" height="560" fill="${parede}"/>`;
  // armários superiores
  o += `<rect x="80" y="90" width="640" height="200" fill="${P.white}"/>`;
  for (let i = 0; i < 4; i++) o += `<rect x="${80 + i * 160}" y="90" width="4" height="200" fill="#00000012"/>`;
  o += `<rect x="120" y="272" width="80" height="6" rx="3" fill="${P.dark}"/><rect x="280" y="272" width="80" height="6" rx="3" fill="${P.dark}"/><rect x="440" y="272" width="80" height="6" rx="3" fill="${P.dark}"/><rect x="600" y="272" width="80" height="6" rx="3" fill="${P.dark}"/>`;
  // coifa
  o += `<path d="M760 90 L1000 90 L960 210 L800 210 Z" fill="${P.concrete3}"/><rect x="800" y="210" width="160" height="16" fill="${P.darker}" opacity="0.6"/>`;
  // backsplash
  o += `<rect x="80" y="290" width="920" height="150" fill="#D9D2C7"/>`;
  for (let i = 0; i < 14; i++) o += `<rect x="${80 + i * 66}" y="290" width="2" height="150" fill="#00000010"/>`;
  o += `<rect x="80" y="362" width="920" height="2" fill="#00000010"/>`;
  // bancada
  o += `<rect x="60" y="440" width="960" height="26" rx="4" fill="${P.darker}"/>`;
  o += `<rect x="80" y="466" width="640" height="180" fill="${P.concrete}"/>`;
  o += `<rect x="80" y="466" width="640" height="6" fill="#00000012"/>`;
  // ilha gourmet
  o += `<rect x="700" y="520" width="420" height="30" rx="5" fill="${P.darker}"/>`;
  o += `<rect x="720" y="550" width="380" height="180" fill="${P.wood}"/>`;
  for (let i = 0; i < 4; i++) o += `<rect x="${740 + i * 95}" y="550" width="3" height="180" fill="#00000018"/>`;
  // banquetas
  for (let i = 0; i < 3; i++) {
    const x = 770 + i * 130;
    o += `<rect x="${x}" y="620" width="76" height="20" rx="10" fill="${P.concrete3}"/><rect x="${x + 32}" y="640" width="12" height="90" fill="${P.darker}" opacity="0.7"/><rect x="${x + 10}" y="726" width="56" height="8" rx="4" fill="${P.darker}" opacity="0.6"/>`;
  }
  // detalhes
  o += `<rect x="140" y="396" width="70" height="44" rx="6" fill="${P.accent}" opacity="0.8"/>`;
  o += `<path d="M330 440 v-52 a26 26 0 0 1 52 0 v18" stroke="${P.darker}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  o += `<ellipse cx="560" cy="430" rx="52" ry="12" fill="${P.green2}"/><path d="M560 430 C 520 380, 540 350, 560 336 C 584 354, 602 386, 560 430 Z" fill="${P.green2}"/>`;
  o += `<rect x="0" y="646" width="${W}" height="154" fill="#D5CEC3"/>`;
  for (let i = 0; i < 6; i++) o += `<rect x="0" y="${660 + i * 26}" width="${W}" height="1.5" fill="#00000010"/>`;
  o += grainRect;
  return shell(grain, o);
}

/* ------------------------------------------------------------------ planta */
function plan(seed: number): string {
  let o = `<rect width="${W}" height="${H}" fill="#F4F1EB"/>`;
  for (let i = 0; i < 40; i++) o += `<rect x="${i * 32}" y="0" width="1" height="${H}" fill="#00000008"/>`;
  for (let i = 0; i < 26; i++) o += `<rect x="0" y="${i * 32}" width="${W}" height="1" fill="#00000008"/>`;
  const wall = (x: number, y: number, w: number, h: number): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${P.darker}" stroke-width="9"/>`;
  o += wall(180, 120, 840, 560);
  o += wall(180, 120, 380, 280);
  o += wall(560, 120, 240, 280);
  o += wall(800, 120, 220, 180);
  o += wall(180, 400, 300, 280);
  o += wall(480, 400, 540, 280);
  // aberturas
  o += `<rect x="330" y="396" width="90" height="9" fill="#F4F1EB"/><rect x="556" y="240" width="9" height="80" fill="#F4F1EB"/><rect x="796" y="480" width="9" height="90" fill="#F4F1EB"/>`;
  // mobiliário esquemático
  o += `<rect x="240" y="180" width="180" height="130" rx="6" fill="${P.concrete2}" opacity="0.7"/>`;
  o += `<rect x="610" y="180" width="140" height="110" rx="6" fill="${P.concrete2}" opacity="0.7"/>`;
  o += `<rect x="540" y="450" width="260" height="170" rx="8" fill="${P.accent}" opacity="0.18"/>`;
  o += `<circle cx="900" cy="200" r="52" fill="${P.glass}" opacity="0.5"/>`;
  o += `<rect x="230" y="470" width="180" height="120" rx="6" fill="${P.concrete2}" opacity="0.6"/>`;
  // cotas
  o += `<path d="M180 720 L1020 720" stroke="${P.accent}" stroke-width="3"/><path d="M180 706 L180 734 M1020 706 L1020 734" stroke="${P.accent}" stroke-width="3"/>`;
  o += `<path d="M120 120 L120 680" stroke="${P.accent}" stroke-width="3"/><path d="M106 120 L134 120 M106 680 L134 680" stroke="${P.accent}" stroke-width="3"/>`;
  o += grainRect;
  return shell(grain, o);
}

/* ------------------------------------------------------- ambientes extras */
const pick = (r: () => number, arr: readonly string[]): string => arr[Math.floor(r() * arr.length)];
const PAREDE = ['#E7E2DB', '#E3DED6', '#EBE7E0', '#DED9D1'];
const PISO = ['#D8D1C6', '#CEC6B9', '#DCD5C9', '#C6A67E'];
const TECIDO = ['#B9C0AC', '#C4BBAE', '#9DAFBB', '#BFB4A6'];

/* quarto */
function bedroom(seed: number): string {
  const r = rng(seed);
  const parede = pick(r, PAREDE);
  const piso = pick(r, PISO);
  const tecido = pick(r, TECIDO);
  let o = `<rect width="${W}" height="${H}" fill="${parede}"/>`;
  o += `<rect x="0" y="560" width="${W}" height="240" fill="${piso}"/>`;
  for (let i = 0; i < 8; i++) o += `<rect x="0" y="${576 + i * 30}" width="${W}" height="1.5" fill="#00000010"/>`;
  // janela lateral + luz
  o += `<rect x="60" y="120" width="240" height="360" fill="url(#winb)"/>`;
  o += `<rect x="60" y="120" width="240" height="360" fill="none" stroke="${P.darker}" stroke-width="6" opacity="0.6"/>`;
  o += `<rect x="176" y="120" width="6" height="360" fill="${P.darker}" opacity="0.6"/>`;
  o += `<path d="M60 480 L300 480 L470 800 L0 800 Z" fill="#FFFFFF" opacity="0.22"/>`;
  // cortina
  o += `<rect x="300" y="96" width="70" height="400" fill="${P.white}" opacity="0.9"/>`;
  // cabeceira
  o += `<rect x="430" y="180" width="500" height="300" rx="10" fill="${P.wood}" opacity="0.85"/>`;
  for (let i = 0; i < 6; i++) o += `<rect x="${446 + i * 82}" y="196" width="66" height="268" rx="8" fill="#00000010"/>`;
  // cama
  o += `<rect x="400" y="470" width="560" height="60" rx="10" fill="${P.white}"/>`;
  o += `<rect x="400" y="530" width="560" height="130" rx="8" fill="${tecido}"/>`;
  o += `<rect x="400" y="530" width="560" height="26" fill="#FFFFFF" opacity="0.55"/>`;
  o += `<rect x="440" y="428" width="180" height="58" rx="12" fill="${P.white}"/>`;
  o += `<rect x="650" y="428" width="180" height="58" rx="12" fill="${P.white}"/>`;
  o += `<rect x="520" y="596" width="340" height="44" rx="8" fill="${P.accent}" opacity="0.55"/>`;
  o += `<rect x="412" y="660" width="24" height="34" fill="${P.darker}" opacity="0.55"/><rect x="928" y="660" width="24" height="34" fill="${P.darker}" opacity="0.55"/>`;
  // criados-mudos + luminárias
  for (const x of [970, 330]) {
    if (x > 900) {
      o += `<rect x="${x}" y="520" width="130" height="120" rx="8" fill="${P.wood}"/>`;
      o += `<rect x="${x + 20}" y="552" width="90" height="6" rx="3" fill="${P.darker}" opacity="0.5"/>`;
      o += `<rect x="${x + 52}" y="440" width="26" height="80" fill="${P.darker}" opacity="0.6"/>`;
      o += `<path d="M${x + 26} 440 L${x + 104} 440 L${x + 88} 388 L${x + 42} 388 Z" fill="${P.white}"/>`;
    }
  }
  // planta
  o += `<rect x="1080" y="600" width="76" height="86" rx="8" fill="${P.concrete2}"/>`;
  o += `<path d="M1118 600 C 1058 540, 1090 476, 1118 446 C 1148 478, 1176 540, 1118 600 Z" fill="${P.green2}"/>`;
  o += grainRect;
  return shell(`<linearGradient id="winb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D6DE"/><stop offset="1" stop-color="#EFE8DB"/></linearGradient>` + grain, o);
}

/* banheiro / suíte */
function bathroom(seed: number): string {
  const r = rng(seed);
  const tom = pick(r, ['#DDD7CD', '#D6D2CA', '#E2DCD2']);
  let o = `<rect width="${W}" height="${H}" fill="${tom}"/>`;
  // revestimento
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 12; x++) {
      o += `<rect x="${x * 100 + (y % 2 ? 50 : 0) - 50}" y="${y * 70}" width="98" height="68" fill="none" stroke="#00000010" stroke-width="2"/>`;
    }
  }
  o += `<rect x="0" y="640" width="${W}" height="160" fill="#C9C3B9"/>`;
  // bancada + cuba
  o += `<rect x="90" y="440" width="520" height="28" rx="4" fill="${P.darker}"/>`;
  o += `<rect x="110" y="468" width="480" height="150" fill="${P.wood}" opacity="0.9"/>`;
  o += `<rect x="110" y="468" width="480" height="6" fill="#00000015"/>`;
  o += `<rect x="250" y="404" width="200" height="42" rx="8" fill="${P.white}"/>`;
  o += `<path d="M330 404 v-58 a22 22 0 0 1 44 0 v14" stroke="${P.darker}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  // espelho
  o += `<rect x="150" y="110" width="400" height="270" rx="6" fill="${P.glass}" opacity="0.6"/>`;
  o += `<rect x="150" y="110" width="400" height="270" rx="6" fill="none" stroke="${P.white}" stroke-width="8"/>`;
  o += `<path d="M150 380 L550 110 L550 180 L300 380 Z" fill="#FFFFFF" opacity="0.22"/>`;
  // nicho com toque laranja
  o += `<rect x="640" y="250" width="120" height="70" fill="${P.accent}" opacity="0.2"/>`;
  o += `<rect x="662" y="262" width="34" height="46" rx="6" fill="${P.white}"/>`;
  // box de vidro
  o += `<rect x="800" y="80" width="360" height="640" fill="${P.glass}" opacity="0.28"/>`;
  o += `<rect x="800" y="80" width="360" height="640" fill="none" stroke="${P.darker}" stroke-width="7" opacity="0.55"/>`;
  o += `<rect x="965" y="80" width="6" height="640" fill="${P.darker}" opacity="0.45"/>`;
  o += `<rect x="880" y="140" width="200" height="16" rx="6" fill="${P.white}"/>`;
  o += `<rect x="972" y="156" width="12" height="40" fill="${P.white}"/>`;
  for (let i = 0; i < 12; i++) o += `<rect x="${900 + (i % 6) * 30}" y="${210 + Math.floor(i / 6) * 40}" width="3" height="26" fill="#FFFFFF" opacity="0.5"/>`;
  // toalha
  o += `<rect x="640" y="440" width="90" height="200" rx="8" fill="${P.white}"/>`;
  o += `<rect x="632" y="428" width="106" height="18" rx="8" fill="${P.concrete3}"/>`;
  o += grainRect;
  return shell(grain, o);
}

/* varanda gourmet */
function balcony(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#skyv)"/>`;
  // vista
  o += `<rect x="0" y="360" width="${W}" height="120" fill="${P.water}" opacity="0.75"/>`;
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 135, h = 120 + r() * 140;
    o += `<rect x="${x}" y="${480 - h}" width="86" height="${h}" fill="${P.concrete3}" opacity="0.55"/>`;
  }
  // teto / pergolado
  o += `<rect x="0" y="0" width="${W}" height="90" fill="${P.white}"/>`;
  for (let i = 0; i < 14; i++) o += `<rect x="${i * 88}" y="90" width="44" height="14" fill="${P.wood}" opacity="0.7"/>`;
  // piso
  o += `<rect x="0" y="560" width="${W}" height="240" fill="${P.concrete}"/>`;
  for (let i = 0; i < 9; i++) o += `<rect x="${i * 140}" y="560" width="3" height="240" fill="#00000010"/>`;
  // guarda-corpo de vidro
  o += `<rect x="0" y="380" width="${W}" height="190" fill="#FFFFFF" opacity="0.18"/>`;
  o += `<rect x="0" y="374" width="${W}" height="12" fill="${P.darker}" opacity="0.55"/>`;
  o += `<rect x="0" y="560" width="${W}" height="12" fill="${P.darker}" opacity="0.4"/>`;
  for (let i = 0; i < 7; i++) o += `<rect x="${i * 200 + 60}" y="374" width="7" height="196" fill="${P.darker}" opacity="0.35"/>`;
  // churrasqueira embutida
  o += `<rect x="860" y="330" width="300" height="240" fill="${P.concrete2}"/>`;
  o += `<rect x="890" y="380" width="240" height="120" fill="${P.darker}" opacity="0.75"/>`;
  o += `<rect x="906" y="430" width="208" height="10" fill="${P.accent}" opacity="0.8"/>`;
  o += `<rect x="860" y="306" width="300" height="26" fill="${P.darker}"/>`;
  // mesa e cadeiras
  o += `<ellipse cx="420" cy="640" rx="190" ry="52" fill="${P.wood}"/>`;
  o += `<rect x="410" y="640" width="22" height="86" fill="${P.darker}" opacity="0.7"/><rect x="356" y="722" width="130" height="10" rx="5" fill="${P.darker}" opacity="0.6"/>`;
  for (const cx of [200, 660]) {
    o += `<rect x="${cx - 44}" y="560" width="88" height="24" rx="10" fill="${P.concrete3}"/>`;
    o += `<rect x="${cx - 40}" y="584" width="80" height="96" rx="8" fill="${P.concrete3}" opacity="0.85"/>`;
  }
  o += `<rect x="360" y="596" width="110" height="20" rx="6" fill="${P.white}"/>`;
  // vaso
  o += `<rect x="80" y="600" width="90" height="110" rx="8" fill="${P.concrete2}"/>`;
  o += `<path d="M125 600 C 56 528, 92 452, 125 418 C 160 454, 196 528, 125 600 Z" fill="${P.green2}"/>`;
  o += grainRect;
  return shell(skyDefs('skyv', '#BFD1DD', '#EFE7DA') + grain, o);
}

/* hall de entrada / lobby */
function lobby(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#E6E1D9"/>`;
  o += `<rect x="0" y="0" width="${W}" height="120" fill="${P.white}"/>`;
  // fachada envidraçada ao fundo
  o += `<rect x="360" y="120" width="500" height="500" fill="url(#glz)"/>`;
  o += `<rect x="360" y="120" width="500" height="500" fill="none" stroke="${P.darker}" stroke-width="8" opacity="0.55"/>`;
  o += `<rect x="606" y="120" width="8" height="500" fill="${P.darker}" opacity="0.5"/>`;
  o += `<rect x="360" y="360" width="500" height="8" fill="${P.darker}" opacity="0.35"/>`;
  // painel ripado
  o += `<rect x="0" y="120" width="330" height="500" fill="${P.wood}" opacity="0.85"/>`;
  for (let i = 0; i < 14; i++) o += `<rect x="${12 + i * 24}" y="120" width="10" height="500" fill="#00000012"/>`;
  o += `<rect x="890" y="120" width="310" height="500" fill="${P.concrete2}"/>`;
  o += `<rect x="930" y="200" width="230" height="120" fill="${P.accent}" opacity="0.18"/>`;
  o += `<rect x="962" y="238" width="166" height="16" rx="8" fill="${P.darker}" opacity="0.5"/>`;
  // piso polido + reflexo
  o += `<rect x="0" y="620" width="${W}" height="180" fill="#D9D3C8"/>`;
  o += `<rect x="380" y="620" width="460" height="180" fill="#FFFFFF" opacity="0.2"/>`;
  // balcão de recepção
  o += `<rect x="700" y="470" width="380" height="150" rx="6" fill="${P.darker}"/>`;
  o += `<rect x="700" y="452" width="380" height="24" rx="6" fill="${P.white}"/>`;
  o += `<rect x="740" y="500" width="120" height="8" rx="4" fill="${P.accent}" opacity="0.8"/>`;
  // poltronas
  for (const x of [120, 320]) {
    o += `<rect x="${x}" y="500" width="150" height="46" rx="14" fill="${P.concrete3}"/>`;
    o += `<rect x="${x + 6}" y="464" width="138" height="48" rx="14" fill="${P.dark}"/>`;
    o += `<rect x="${x + 16}" y="546" width="16" height="34" fill="${P.darker}" opacity="0.6"/><rect x="${x + 118}" y="546" width="16" height="34" fill="${P.darker}" opacity="0.6"/>`;
  }
  o += `<ellipse cx="290" cy="592" rx="150" ry="26" fill="${P.concrete3}" opacity="0.4"/>`;
  // pendentes
  for (let i = 0; i < 3; i++) {
    const x = 460 + i * 150, len = 120 + r() * 80;
    o += `<rect x="${x}" y="0" width="4" height="${len}" fill="${P.darker}" opacity="0.6"/>`;
    o += `<circle cx="${x + 2}" cy="${len + 18}" r="18" fill="${P.accent}" opacity="0.7"/>`;
  }
  o += grainRect;
  return shell(`<linearGradient id="glz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6D5DE"/><stop offset="1" stop-color="#E9E2D6"/></linearGradient>` + grain, o);
}

/* academia */
function gym(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#E4E0D8"/>`;
  o += `<rect x="0" y="120" width="${W}" height="420" fill="${P.glass}" opacity="0.35"/>`;
  o += `<rect x="0" y="120" width="${W}" height="10" fill="${P.darker}" opacity="0.3"/>`;
  for (let i = 0; i < 6; i++) o += `<rect x="${i * 200 + 40}" y="130" width="8" height="410" fill="${P.white}" opacity="0.7"/>`;
  o += `<rect x="0" y="540" width="${W}" height="260" fill="#CFC9BE"/>`;
  for (let i = 0; i < 60; i++) o += `<circle cx="${r() * W}" cy="${560 + r() * 230}" r="2.5" fill="#00000010"/>`;
  // esteiras
  for (let i = 0; i < 3; i++) {
    const x = 90 + i * 300;
    o += `<path d="M${x} 640 L${x + 200} 640 L${x + 230} 700 L${x - 30} 700 Z" fill="${P.darker}" opacity="0.8"/>`;
    o += `<rect x="${x + 150}" y="470" width="14" height="180" fill="${P.dark}"/>`;
    o += `<rect x="${x + 96}" y="440" width="130" height="60" rx="8" fill="${P.concrete3}"/>`;
    o += `<rect x="${x + 112}" y="456" width="98" height="28" rx="4" fill="${P.accent}" opacity="0.55"/>`;
    o += `<rect x="${x + 60}" y="500" width="120" height="10" rx="5" fill="${P.dark}"/>`;
  }
  // rack de halteres
  o += `<rect x="960" y="520" width="220" height="26" rx="6" fill="${P.darker}"/>`;
  o += `<rect x="960" y="600" width="220" height="26" rx="6" fill="${P.darker}"/>`;
  o += `<rect x="980" y="546" width="16" height="54" fill="${P.dark}"/><rect x="1144" y="546" width="16" height="54" fill="${P.dark}"/>`;
  for (let i = 0; i < 4; i++) {
    o += `<rect x="${984 + i * 48}" y="496" width="40" height="24" rx="8" fill="${P.dark}"/>`;
    o += `<rect x="${984 + i * 48}" y="576" width="40" height="24" rx="8" fill="${P.concrete3}"/>`;
  }
  o += grainRect;
  return shell(grain, o);
}

/* salão de festas */
function party(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#E9E4DB"/>`;
  o += `<rect x="0" y="0" width="${W}" height="130" fill="${P.white}"/>`;
  o += `<rect x="0" y="130" width="${W}" height="440" fill="#E2DCD2"/>`;
  // painel ripado
  o += `<rect x="60" y="170" width="420" height="330" fill="${P.wood}" opacity="0.8"/>`;
  for (let i = 0; i < 16; i++) o += `<rect x="${72 + i * 26}" y="170" width="10" height="330" fill="#00000012"/>`;
  // janelão
  o += `<rect x="560" y="170" width="580" height="330" fill="${P.glass}" opacity="0.45"/>`;
  o += `<rect x="560" y="170" width="580" height="330" fill="none" stroke="${P.darker}" stroke-width="7" opacity="0.5"/>`;
  o += `<rect x="850" y="170" width="7" height="330" fill="${P.darker}" opacity="0.45"/>`;
  // piso
  o += `<rect x="0" y="570" width="${W}" height="230" fill="#D6CFC4"/>`;
  for (let i = 0; i < 8; i++) o += `<rect x="0" y="${590 + i * 28}" width="${W}" height="1.5" fill="#00000010"/>`;
  // mesa longa
  o += `<rect x="180" y="560" width="840" height="34" rx="8" fill="${P.wood}"/>`;
  o += `<rect x="180" y="594" width="840" height="10" fill="#00000018"/>`;
  o += `<rect x="230" y="604" width="20" height="90" fill="${P.darker}" opacity="0.6"/><rect x="950" y="604" width="20" height="90" fill="${P.darker}" opacity="0.6"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 230 + i * 140;
    o += `<rect x="${x}" y="500" width="90" height="62" rx="10" fill="${P.concrete3}"/>`;
    o += `<rect x="${x + 6}" y="470" width="78" height="40" rx="10" fill="${P.dark}"/>`;
  }
  // arranjos
  for (let i = 0; i < 4; i++) {
    const x = 300 + i * 200;
    o += `<rect x="${x}" y="524" width="30" height="36" rx="4" fill="${P.white}"/>`;
    o += `<ellipse cx="${x + 15}" cy="512" rx="30" ry="18" fill="${P.green2}"/>`;
  }
  // buffet
  o += `<rect x="60" y="500" width="120" height="140" fill="${P.concrete2}"/>`;
  o += `<rect x="60" y="492" width="120" height="16" fill="${P.darker}"/>`;
  // pendentes
  for (let i = 0; i < 5; i++) {
    const x = 250 + i * 170, len = 150 + r() * 60;
    o += `<rect x="${x}" y="0" width="4" height="${len}" fill="${P.darker}" opacity="0.55"/>`;
    o += `<path d="M${x - 26} ${len + 46} L${x + 30} ${len + 46} L${x + 18} ${len} L${x - 14} ${len} Z" fill="${P.accent}" opacity="0.75"/>`;
  }
  o += grainRect;
  return shell(grain, o);
}

/* playground */
function playground(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#skyp)"/>`;
  o += `<rect x="0" y="380" width="${W}" height="420" fill="${P.green}"/>`;
  o += `<ellipse cx="600" cy="620" rx="520" ry="170" fill="#D9CBB0"/>`;
  for (let i = 0; i < 12; i++) o += `<ellipse cx="${100 + i * 95}" cy="${372}" rx="58" ry="26" fill="${P.green2}" opacity="0.85"/>`;
  // escorregador
  o += `<rect x="760" y="300" width="180" height="20" fill="${P.wood}"/>`;
  o += `<rect x="770" y="320" width="16" height="220" fill="${P.darker}" opacity="0.65"/><rect x="912" y="320" width="16" height="220" fill="${P.darker}" opacity="0.65"/>`;
  o += `<path d="M940 320 L1080 540 L1030 540 L900 340 Z" fill="${P.accent}" opacity="0.8"/>`;
  o += `<path d="M760 320 L700 540 L748 540 L800 340 Z" fill="${P.concrete3}"/>`;
  o += `<path d="M740 300 L960 300 L850 230 Z" fill="${P.accent}" opacity="0.55"/>`;
  // balanço
  o += `<path d="M180 540 L300 280 L520 280 L400 540" stroke="${P.darker}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  o += `<rect x="290" y="272" width="240" height="14" rx="6" fill="${P.darker}" opacity="0.7"/>`;
  for (const x of [340, 450]) {
    o += `<rect x="${x}" y="286" width="4" height="170" fill="${P.darker}" opacity="0.6"/>`;
    o += `<rect x="${x - 32}" y="452" width="70" height="14" rx="6" fill="${P.wood}"/>`;
  }
  // gangorra e bancos
  o += `<path d="M560 520 L720 470" stroke="${P.concrete3}" stroke-width="16" stroke-linecap="round"/>`;
  o += `<rect x="632" y="510" width="16" height="44" fill="${P.darker}" opacity="0.6"/>`;
  o += `<rect x="120" y="640" width="200" height="16" rx="6" fill="${P.wood}"/><rect x="140" y="656" width="14" height="46" fill="${P.darker}" opacity="0.6"/><rect x="286" y="656" width="14" height="46" fill="${P.darker}" opacity="0.6"/>`;
  o += grainRect;
  return shell(skyDefs('skyp', '#CBDCE6', '#F0EADD') + grain, o);
}

/* garagem / estacionamento */
function garage(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#D6D2CA"/>`;
  o += `<rect x="0" y="0" width="${W}" height="240" fill="#C9C5BD"/>`;
  // luminárias no teto
  for (let i = 0; i < 4; i++) o += `<rect x="${120 + i * 280}" y="60" width="180" height="16" rx="6" fill="${P.white}"/>`;
  o += `<rect x="0" y="228" width="${W}" height="12" fill="#00000012"/>`;
  // piso
  o += `<rect x="0" y="400" width="${W}" height="400" fill="#C2BDB4"/>`;
  o += `<rect x="0" y="400" width="${W}" height="8" fill="#00000012"/>`;
  // vagas demarcadas
  for (let i = 0; i < 5; i++) {
    const x = -60 + i * 300;
    o += `<path d="M${x} 800 L${x + 190} 440" stroke="#FFFFFF" stroke-width="8" opacity="0.7"/>`;
  }
  o += `<path d="M0 560 L1200 560" stroke="#FFFFFF" stroke-width="6" opacity="0.4"/>`;
  o += `<rect x="120" y="470" width="160" height="26" rx="4" fill="${P.accent}" opacity="0.75"/>`;
  // pilares
  for (const x of [60, 620, 1100]) {
    o += `<rect x="${x}" y="180" width="70" height="330" fill="${P.concrete2}"/>`;
    o += `<rect x="${x}" y="440" width="70" height="26" fill="${P.accent}" opacity="0.7"/>`;
  }
  // carros esquemáticos
  for (let i = 0; i < 2; i++) {
    const x = 320 + i * 430, y = 520 + i * 40;
    o += `<path d="M${x} ${y} q 40 -70 130 -70 h 110 q 80 0 120 70 z" fill="${i ? P.dark : P.concrete3}"/>`;
    o += `<rect x="${x - 10}" y="${y}" width="390" height="56" rx="16" fill="${i ? P.dark : P.concrete3}"/>`;
    o += `<path d="M${x + 60} ${y - 8} q 30 -44 90 -44 h 70 q 56 0 84 44 z" fill="${P.glass2}" opacity="0.8"/>`;
    o += `<circle cx="${x + 70}" cy="${y + 56}" r="26" fill="${P.darker}"/><circle cx="${x + 300}" cy="${y + 56}" r="26" fill="${P.darker}"/>`;
  }
  o += grainRect;
  return shell(grain, o);
}

/* fachada noturna */
function nightfacade(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#skyn)"/>`;
  for (let i = 0; i < 40; i++) o += `<circle cx="${r() * W}" cy="${r() * 300}" r="${r() * 1.4 + .4}" fill="#FFFFFF" opacity="${r() * .5 + .2}"/>`;
  // volumes
  o += `<rect x="90" y="330" width="220" height="400" fill="#2C3138"/>`;
  o += `<rect x="900" y="290" width="230" height="440" fill="#2C3138"/>`;
  const tx = 340;
  o += `<rect x="${tx}" y="150" width="520" height="580" fill="#343A42"/>`;
  o += `<rect x="${tx}" y="150" width="520" height="16" fill="#434A53"/>`;
  for (let f = 0; f < 9; f++) {
    const y = 186 + f * 60;
    for (let i = 0; i < 5; i++) {
      const x = tx + 24 + i * 97;
      const on = r() > 0.32;
      o += `<rect x="${x}" y="${y}" width="72" height="38" fill="${on ? '#F2C089' : '#3E454E'}" opacity="${on ? 0.9 : 1}"/>`;
      if (on && r() > 0.7) o += `<rect x="${x}" y="${y}" width="72" height="38" fill="${P.accent}" opacity="0.35"/>`;
    }
    o += `<rect x="${tx}" y="${y + 38}" width="520" height="9" fill="#454C55"/>`;
  }
  for (let i = 0; i < 26; i++) {
    o += `<rect x="${110 + (i % 4) * 52}" y="${356 + Math.floor(i / 4) * 58}" width="34" height="30" fill="${r() > .45 ? '#E9BC8B' : '#3A4049'}" opacity=".85"/>`;
    o += `<rect x="${920 + (i % 4) * 54}" y="${316 + Math.floor(i / 4) * 60}" width="36" height="32" fill="${r() > .5 ? '#E9BC8B' : '#3A4049'}" opacity=".8"/>`;
  }
  // térreo iluminado
  o += `<rect x="${tx - 70}" y="640" width="660" height="90" fill="#3E454E"/>`;
  o += `<rect x="${tx - 50}" y="662" width="620" height="52" fill="#F5CE9E" opacity="0.75"/>`;
  o += `<rect x="${tx + 230}" y="662" width="70" height="68" fill="${P.accent}" opacity="0.9"/>`;
  // calçada + luz
  o += `<rect x="0" y="730" width="${W}" height="70" fill="#262B31"/>`;
  o += `<ellipse cx="600" cy="740" rx="420" ry="34" fill="#F5CE9E" opacity="0.16"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 100 + i * 210;
    o += `<rect x="${x}" y="640" width="6" height="100" fill="#1F242A"/><circle cx="${x + 3}" cy="634" r="9" fill="#F7D6A8" opacity="0.9"/>`;
  }
  o += grainRect;
  return shell(skyDefs('skyn', '#141A22', '#3C4653') + grain, o);
}

/* sala comercial vazia */
function officeInterior(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="#E8E5DE"/>`;
  // forro modulado
  o += `<rect x="0" y="0" width="${W}" height="170" fill="#EFEDE7"/>`;
  for (let i = 0; i < 9; i++) o += `<rect x="${i * 140}" y="0" width="2" height="170" fill="#00000010"/>`;
  for (let i = 0; i < 4; i++) o += `<rect x="${130 + i * 290}" y="52" width="190" height="22" rx="3" fill="${P.white}"/>`;
  o += `<rect x="0" y="170" width="${W}" height="8" fill="#00000012"/>`;
  // fita de janelas
  o += `<rect x="80" y="210" width="1040" height="330" fill="url(#glzo)"/>`;
  o += `<rect x="80" y="210" width="1040" height="330" fill="none" stroke="${P.darker}" stroke-width="8" opacity="0.5"/>`;
  for (let i = 1; i < 5; i++) o += `<rect x="${80 + i * 208}" y="210" width="8" height="330" fill="${P.darker}" opacity="0.45"/>`;
  // skyline discreto
  for (let i = 0; i < 8; i++) {
    const x = 110 + i * 128, h = 80 + r() * 140;
    o += `<rect x="${x}" y="${540 - h}" width="72" height="${h}" fill="${P.glass3}" opacity="0.3"/>`;
  }
  // piso elevado
  o += `<rect x="0" y="600" width="${W}" height="200" fill="#D5D0C6"/>`;
  for (let i = 0; i < 7; i++) o += `<rect x="${i * 180}" y="600" width="2.5" height="200" fill="#00000012"/>`;
  for (let i = 0; i < 3; i++) o += `<rect x="0" y="${640 + i * 56}" width="${W}" height="2.5" fill="#00000010"/>`;
  o += `<rect x="0" y="540" width="${W}" height="62" fill="#DEDAD2"/>`;
  o += `<rect x="0" y="586" width="${W}" height="14" fill="${P.concrete3}" opacity="0.5"/>`;
  // pilar + caixa técnica
  o += `<rect x="900" y="178" width="90" height="422" fill="${P.concrete2}"/>`;
  o += `<rect x="924" y="380" width="42" height="60" rx="4" fill="${P.accent}" opacity="0.35"/>`;
  o += grainRect;
  return shell(`<linearGradient id="glzo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4D4DE"/><stop offset="1" stop-color="#EDE7DA"/></linearGradient>` + grain, o);
}

/* portaria do loteamento */
function entrance(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#skye)"/>`;
  o += `<rect x="0" y="470" width="${W}" height="330" fill="${P.green}"/>`;
  // pórtico
  o += `<rect x="180" y="180" width="840" height="90" fill="${P.white}"/>`;
  o += `<rect x="180" y="270" width="840" height="14" fill="#00000014"/>`;
  o += `<rect x="180" y="180" width="90" height="420" fill="${P.concrete2}"/>`;
  o += `<rect x="930" y="180" width="90" height="420" fill="${P.concrete2}"/>`;
  o += `<rect x="180" y="180" width="90" height="24" fill="${P.accent}"/>`;
  o += `<rect x="930" y="180" width="90" height="24" fill="${P.accent}"/>`;
  o += `<rect x="420" y="206" width="360" height="18" rx="9" fill="${P.darker}" opacity="0.55"/>`;
  o += `<rect x="500" y="236" width="200" height="12" rx="6" fill="${P.dark}" opacity="0.45"/>`;
  // guarita
  o += `<rect x="1020" y="330" width="160" height="230" fill="${P.white}"/>`;
  o += `<rect x="1040" y="366" width="120" height="110" fill="${P.glass2}" opacity="0.8"/>`;
  o += `<rect x="1020" y="312" width="160" height="22" fill="${P.concrete3}"/>`;
  // muro
  o += `<rect x="0" y="420" width="180" height="180" fill="${P.concrete}"/>`;
  o += `<rect x="0" y="420" width="180" height="14" fill="${P.concrete3}"/>`;
  // via + cancela
  o += `<path d="M300 600 L900 600 L1080 800 L120 800 Z" fill="${P.asphalt}"/>`;
  for (let i = 0; i < 4; i++) o += `<rect x="${560 + i * 6}" y="${620 + i * 44}" width="${26 + i * 8}" height="${16 + i * 5}" fill="${P.white}" opacity="0.8"/>`;
  o += `<rect x="880" y="560" width="230" height="12" rx="6" fill="${P.accent}"/>`;
  for (let i = 0; i < 5; i++) o += `<rect x="${896 + i * 44}" y="560" width="18" height="12" fill="${P.white}"/>`;
  o += `<rect x="864" y="540" width="22" height="70" fill="${P.darker}" opacity="0.7"/>`;
  // vegetação
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 260 + r() * 40;
    o += `<ellipse cx="${x}" cy="530" rx="60" ry="40" fill="${P.green2}"/>`;
  }
  o += grainRect;
  return shell(skyDefs('skye', '#C9DAE5', '#F1EADD') + grain, o);
}

/* rua do loteamento */
function street(seed: number): string {
  const r = rng(seed);
  let o = `<rect width="${W}" height="${H}" fill="url(#skys)"/>`;
  o += `<rect x="0" y="430" width="${W}" height="370" fill="${P.green}"/>`;
  // casas ao fundo
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 210, h = 120 + r() * 60;
    o += `<rect x="${x}" y="${430 - h}" width="170" height="${h}" fill="${i % 2 ? P.white : P.concrete}"/>`;
    o += `<path d="M${x - 14} ${430 - h} L${x + 184} ${430 - h} L${x + 85} ${430 - h - 44} Z" fill="${P.concrete3}"/>`;
    o += `<rect x="${x + 28}" y="${466 - h}" width="50" height="40" fill="${P.glass2}" opacity="0.8"/>`;
    o += `<rect x="${x + 100}" y="${466 - h}" width="50" height="40" fill="${P.glass2}" opacity="0.8"/>`;
  }
  // calçadas + via
  o += `<path d="M420 430 L780 430 L1140 800 L60 800 Z" fill="${P.asphalt}"/>`;
  o += `<path d="M420 430 L380 430 L60 800 L-40 800 Z" fill="${P.concrete2}"/>`;
  o += `<path d="M780 430 L820 430 L1250 800 L1140 800 Z" fill="${P.concrete2}"/>`;
  for (let i = 0; i < 6; i++) {
    const t = i / 6, y = 450 + t * t * 340, w = 10 + t * 34;
    o += `<rect x="${594 - w / 2 + t * 10}" y="${y}" width="${w}" height="${14 + t * 40}" fill="${P.white}" opacity="0.85"/>`;
  }
  // postes
  for (let i = 0; i < 4; i++) {
    const t = i / 4, x = 340 - t * 300, y = 470 + t * 240;
    o += `<rect x="${x}" y="${y - 190 - t * 60}" width="${8 + t * 6}" height="${190 + t * 60}" fill="${P.darker}" opacity="0.6"/>`;
    o += `<rect x="${x - 30}" y="${y - 196 - t * 60}" width="${44 + t * 14}" height="10" rx="5" fill="${P.darker}" opacity="0.6"/>`;
  }
  // árvores
  for (let i = 0; i < 4; i++) {
    const t = i / 4, x = 900 + t * 240, y = 500 + t * 220;
    o += `<rect x="${x}" y="${y}" width="${10 + t * 8}" height="${90 + t * 60}" fill="${P.darker}" opacity="0.55"/>`;
    o += `<ellipse cx="${x + 5}" cy="${y - 10}" rx="${56 + t * 30}" ry="${42 + t * 20}" fill="${P.green2}"/>`;
  }
  o += grainRect;
  return shell(skyDefs('skys', '#CBDBE6', '#F0EADE') + grain, o);
}

const SCENES = {
  facade, tower, interior, terrain, house, pool, office, aerial, kitchen, plan,
  bedroom, bathroom, balcony, lobby, gym, party, playground, garage, nightfacade,
  officeInterior, entrance, street,
};

const cache = new Map<string, string>();

export type SceneName = keyof typeof SCENES;

/** Devolve um data URI SVG para o cenário pedido. */
export function scene(name: SceneName, seed = 1): string {
  const key = name + ':' + seed;
  const hit = cache.get(key);
  if (hit) return hit;
  const fn = SCENES[name] ?? facade;
  const uri: string = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fn(seed));
  cache.set(key, uri);
  return uri;
}

export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

import { ElectionData, ElectionEvent, CandidateHistory, RelatedEvent, Timeframe, CandidateMarket, HistoryPoint, GovernorState } from '../types/polymarket';

export const BRAZIL_GOVERNOR_STATES: GovernorState[] = [
  { uf: 'SP', name: 'São Paulo', slug: 'so-paulo-governor-election-winner', region: 'Sudeste', title: 'São Paulo' },
  { uf: 'RJ', name: 'Rio de Janeiro', slug: 'rio-de-janeiro-governor-election-winner-20260608202949176', region: 'Sudeste', title: 'Rio de Janeiro' },
  { uf: 'MG', name: 'Minas Gerais', slug: 'minas-gerais-governor-election-winner', region: 'Sudeste', title: 'Minas Gerais' },
  { uf: 'BA', name: 'Bahia', slug: 'bahia-governor-election-winner', region: 'Nordeste', title: 'Bahia' },
  { uf: 'PR', name: 'Paraná', slug: 'parana-governor-election-winner-20260608205118343', region: 'Sul', title: 'Paraná' },
  { uf: 'RS', name: 'Rio Grande do Sul', slug: 'rio-grande-do-sul-governor-election-winner', region: 'Sul', title: 'Rio Grande do Sul' },
  { uf: 'SC', name: 'Santa Catarina', slug: 'santa-catarina-governor-election-winner-20260609164309743', region: 'Sul', title: 'Santa Catarina' },
  { uf: 'CE', name: 'Ceará', slug: 'cear-governor-election-winner', region: 'Nordeste', title: 'Ceará' },
  { uf: 'GO', name: 'Goiás', slug: 'goias-governor-election-winner-20260609165823163', region: 'Centro-Oeste', title: 'Goiás' },
  { uf: 'PE', name: 'Pernambuco', slug: 'pernambuco-governor-election-winner-20260709143134925', region: 'Nordeste', title: 'Pernambuco' },
  { uf: 'MA', name: 'Maranhão', slug: 'maranhao-governor-election-winner-20260611182113297', region: 'Nordeste', title: 'Maranhão' },
  { uf: 'PB', name: 'Paraíba', slug: 'paraiba-governor-election-winner-20260611183326566', region: 'Nordeste', title: 'Paraíba' },
  { uf: 'PA', name: 'Pará', slug: 'para-governor-election-winner-20260609154623298', region: 'Norte', title: 'Pará' },
  { uf: 'ES', name: 'Espírito Santo', slug: 'espirito-santo-governor-election-winner-20260611183840001', region: 'Sudeste', title: 'Espírito Santo' },
  { uf: 'PI', name: 'Piauí', slug: 'piaui-governor-election-winner', region: 'Nordeste', title: 'Piauí' },
  { uf: 'DF', name: 'Distrito Federal', slug: 'federal-district-governor-election-winner', region: 'Centro-Oeste', title: 'Distrito Federal' },
  { uf: 'AM', name: 'Amazonas', slug: 'amazonas-governor-election-winner', region: 'Norte', title: 'Amazonas' },
  { uf: 'SE', name: 'Sergipe', slug: 'sergipe-governor-election-winner', region: 'Nordeste', title: 'Sergipe' },
  { uf: 'MT', name: 'Mato Grosso', slug: 'mato-grosso-governor-election-winner', region: 'Centro-Oeste', title: 'Mato Grosso' },
  { uf: 'RN', name: 'Rio Grande do Norte', slug: 'rio-grande-do-norte-governor-election-winner', region: 'Nordeste', title: 'Rio Grande do Norte' },
  { uf: 'AL', name: 'Alagoas', slug: 'alagoas-governor-election-winner', region: 'Nordeste', title: 'Alagoas' },
  { uf: 'AC', name: 'Acre', slug: 'acre-governor-election-winner', region: 'Norte', title: 'Acre' },
  { uf: 'TO', name: 'Tocantins', slug: 'tocantins-governor-election-winner', region: 'Norte', title: 'Tocantins' },
  { uf: 'AP', name: 'Amapá', slug: 'amapa-governor-election-winner', region: 'Norte', title: 'Amapá' },
  { uf: 'RO', name: 'Rondônia', slug: 'rondonia-governor-election-winner', region: 'Norte', title: 'Rondônia' },
  { uf: 'MS', name: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul-governor-election-winner', region: 'Centro-Oeste', title: 'Mato Grosso do Sul' },
  { uf: 'RR', name: 'Roraima', slug: 'roraima-governor-election-winner', region: 'Norte', title: 'Roraima' },
];

function isBackendAvailable(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  // If hosted on GitHub Pages or opened as static file, there is no Node/Express server
  if (host.endsWith('github.io') || window.location.protocol === 'file:') {
    return false;
  }
  return true;
}

/**
 * Service to fetch real data from Polymarket via local proxy or direct fallback.
 */
export async function fetchElectionData(slug: string = 'brazil-presidential-election'): Promise<ElectionData> {
  if (isBackendAvailable()) {
    try {
      const res = await fetch(`/api/polymarket/election?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through to direct fetch
    }
  }

  // Direct Polymarket Gamma API (CORS is open on Gamma)
  const directRes = await fetch(`https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`);
  if (!directRes.ok) throw new Error('Falha ao comunicar com os servidores da Polymarket');
  const data = await directRes.json();
  const event = data[0];

    const seenMarketIds = new Set<string>();
    const markets = [];
    for (const m of event.markets || []) {
      if (!m || !m.id || seenMarketIds.has(m.id)) continue;

      // Filter out Polymarket placeholder slots (e.g. "Placeholder 1", "Person O") and inactive zero-volume dummy tokens
      const candidateRaw = (m.groupItemTitle || m.question || '').trim();
      const isPlaceholder = 
        /placeholder(\s+\d+)?/i.test(candidateRaw) ||
        /^person\s+[a-z]/i.test(candidateRaw) ||
        (m.active === false && (!m.volume || parseFloat(m.volume) === 0) && /other/i.test(candidateRaw));

      if (isPlaceholder) continue;

      seenMarketIds.add(m.id);

      let yesPrice = 0;
      let noPrice = 0;
      if (m.outcomePrices) {
        try {
          const parsed = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          yesPrice = parseFloat(parsed[0]) || 0;
          noPrice = parseFloat(parsed[1]) || 0;
        } catch {}
      }
      let clobTokenIds: string[] = [];
      if (m.clobTokenIds) {
        try {
          clobTokenIds = typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : m.clobTokenIds;
        } catch {}
      }

      markets.push({
        id: m.id,
        conditionId: m.conditionId,
        question: m.question,
        candidate: m.groupItemTitle || m.question.replace(/^Will\s+/i, '').replace(/\s+win.*$/i, '').trim(),
        slug: m.slug,
        yesPrice,
        percentage: parseFloat((yesPrice * 100).toFixed(2)),
        noPrice,
        volume: parseFloat(m.volume) || 0,
        liquidity: parseFloat(m.liquidity) || 0,
        image: m.image || event.image,
        icon: m.icon || event.icon,
        yesTokenId: clobTokenIds[0] || null,
        noTokenId: clobTokenIds[1] || null,
        lastPrice: m.lastPrice,
      });
    }

    return {
      source: 'live',
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        image: event.image,
        icon: event.icon,
        volume: event.volume,
        volume24hr: event.volume24hr,
        volume1wk: event.volume1wk,
        volume1mo: event.volume1mo,
        liquidity: event.liquidity,
        openInterest: event.openInterest,
        active: event.active,
        closed: event.closed,
        updatedAt: event.updatedAt,
      },
      markets,
      timestamp: Date.now(),
    };
}

/**
 * Fetch real historical price fluctuations for a candidate's token
 */
export async function fetchCandidateHistory(
  tokenId: string,
  timeframe: Timeframe
): Promise<CandidateHistory> {
  let interval = 'all';
  let fidelity = '1440';

  if (timeframe === '24h') {
    interval = '1d';
    fidelity = '1';
  } else if (timeframe === '7d') {
    interval = 'all';
    fidelity = '60';
  } else if (timeframe === '30d') {
    interval = 'all';
    fidelity = '60';
  } else {
    interval = 'all';
    fidelity = '1440';
  }

  if (isBackendAvailable()) {
    try {
      const res = await fetch(
        `/api/polymarket/history?market=${encodeURIComponent(tokenId)}&interval=${interval}&fidelity=${fidelity}`
      );
      if (res.ok) {
        const data = await res.json();
        let history: HistoryPoint[] = data.history || [];

        const nowSec = Math.floor(Date.now() / 1000);
        if (timeframe === '7d') {
          history = history.filter((p) => p.t >= nowSec - 7 * 86400);
        } else if (timeframe === '30d') {
          history = history.filter((p) => p.t >= nowSec - 30 * 86400);
        }

        return {
          market: tokenId,
          interval,
          fidelity,
          history,
          timestamp: Date.now(),
        };
      }
    } catch {
      // Fall through to direct fetch
    }
  }

  // Direct CLOB API fetch (CORS is open)
  try {
    const directUrl = `https://clob.polymarket.com/prices-history?market=${encodeURIComponent(
      tokenId
    )}&interval=${interval}&fidelity=${fidelity}`;
    const directRes = await fetch(directUrl);
    if (!directRes.ok) throw new Error('Falha ao obter histórico de preços');
    const directData = await directRes.json();
    let history: HistoryPoint[] = directData.history || [];

    const nowSec = Math.floor(Date.now() / 1000);
    if (timeframe === '7d') {
      history = history.filter((p) => p.t >= nowSec - 7 * 86400);
    } else if (timeframe === '30d') {
      history = history.filter((p) => p.t >= nowSec - 30 * 86400);
    }

    return {
      market: tokenId,
      interval,
      fidelity,
      history,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn('Direct CLOB API fetch failed:', err);
    return {
      market: tokenId,
      interval,
      fidelity,
      history: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * Fetch related Brazilian political events from Polymarket
 */
export async function fetchRelatedEvents(): Promise<RelatedEvent[]> {
  if (isBackendAvailable()) {
    try {
      const res = await fetch('/api/polymarket/related-events');
      if (res.ok) {
        const data = await res.json();
        return data.events || [];
      }
    } catch {
      // Fall through to direct fetch
    }
  }

  try {
    const directRes = await fetch('https://gamma-api.polymarket.com/events?tag_slug=brazil&limit=25');
    if (!directRes.ok) return [];
    const raw = await directRes.json();
    return (raw || []).map((ev: any) => ({
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      volume: ev.volume || 0,
      liquidity: ev.liquidity || 0,
      image: ev.image,
      active: ev.active,
      closed: ev.closed,
      endDate: ev.endDate,
      marketsCount: (ev.markets || []).length,
    }));
  } catch {
    return [];
  }
}

/**
 * Exports election snapshot report to CSV with Portuguese format and UTF-8 BOM
 */
export function exportElectionCSV(markets: CandidateMarket[], event: ElectionEvent): void {
  const dateStr = new Date().toISOString();
  const formatBRL = (num: number) => num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const headers = [
    'Posição',
    'Candidato',
    'Probabilidade (%)',
    'Preço Cotação Sim (USD)',
    'Preço Cotação Não (USD)',
    'Volume Negociado (USD)',
    'Liquidez (USD)',
    'ID Contrato Polymarket',
    'Data da Consulta'
  ];

  const sorted = [...markets].sort((a, b) => b.percentage - a.percentage);

  const rows = sorted.map((m, index) => [
    (index + 1).toString(),
    `"${m.candidate.replace(/"/g, '""')}"`,
    m.percentage.toFixed(2).replace('.', ','),
    m.yesPrice.toFixed(4).replace('.', ','),
    m.noPrice.toFixed(4).replace('.', ','),
    `"${formatBRL(m.volume)}"`,
    `"${formatBRL(m.liquidity)}"`,
    m.id,
    dateStr
  ]);

  const csvRows = [
    `# Relatório Oficial Polymarket - Eleição Presidencial Brasil 2026`,
    `# Fonte: Polymarket Gamma API (Mercado: ${event.title})`,
    `# Critério de Resolução: TSE (Tribunal Superior Eleitoral)`,
    `# Volume Total do Mercado: $${formatBRL(event.volume)} USD`,
    `# Data de Geração: ${new Date().toLocaleString('pt-BR')}`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `polymarket_presidencia_brasil_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports detailed historical fluctuation data for a specific candidate
 */
export function exportCandidateHistoryCSV(
  candidateName: string,
  history: HistoryPoint[]
): void {
  const headers = ['Data e Hora (UTC)', 'Timestamp Unix', 'Probabilidade (%)', 'Preço Sim (USD)'];
  const rows = history.map((pt) => {
    const d = new Date(pt.t * 1000).toISOString();
    const pct = (pt.p * 100).toFixed(2).replace('.', ',');
    const price = pt.p.toFixed(4).replace('.', ',');
    return [d, pt.t.toString(), pct, price];
  });

  const csvRows = [
    `# Histórico de Flutuações - ${candidateName}`,
    `# Fonte: Polymarket CLOB API`,
    `# Total de Registros: ${history.length}`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `historico_flutuacoes_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

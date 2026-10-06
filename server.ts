import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : null;
// Dev server MUST run on port 3000 in AI Studio. Cloud Run sets PORT=8080 which is reserved for Nginx.
const PORT = portFromArg || (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000));
const isProd = process.env.NODE_ENV === 'production';

// Cache structure
const cache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
}

function setCached(key: string, data: any, ttlSeconds: number) {
  cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

// Proxy endpoint for Brazil Presidential or Governor Election
app.get('/api/polymarket/election', async (req, res) => {
  const slug = (req.query.slug as string) || 'brazil-presidential-election';
  const cacheKey = `election_${slug}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ source: 'cache', ...cached });
  }

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gamma API responded with ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Event not found in Polymarket Gamma API');
    }

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
      try {
        if (m.outcomePrices) {
          const parsed = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          yesPrice = parseFloat(parsed[0]) || 0;
          noPrice = parseFloat(parsed[1]) || 0;
        }
      } catch {
        // ignore parse errors
      }

      let clobTokenIds: string[] = [];
      try {
        if (m.clobTokenIds) {
          clobTokenIds = typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : m.clobTokenIds;
        }
      } catch {
        // ignore
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

    const payload = {
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

    setCached(cacheKey, payload, 15); // 15 seconds cache
    return res.json({ source: 'live', ...payload });
  } catch (error: any) {
    console.error('Error fetching Polymarket election:', error);
    if (cached) {
      return res.json({ source: 'stale_cache', ...cached });
    }
    return res.status(502).json({ error: error.message || 'Failed to fetch from Polymarket' });
  }
});

// Proxy endpoint for historical prices via CLOB API
app.get('/api/polymarket/history', async (req, res) => {
  const { market, interval = 'all', fidelity = '1440' } = req.query;

  if (!market || typeof market !== 'string') {
    return res.status(400).json({ error: 'Missing market token parameter' });
  }

  const cacheKey = `hist_${market}_${interval}_${fidelity}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ source: 'cache', ...cached });
  }

  try {
    const url = `https://clob.polymarket.com/prices-history?market=${encodeURIComponent(
      market
    )}&interval=${encodeURIComponent(interval as string)}&fidelity=${encodeURIComponent(
      fidelity as string
    )}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CLOB API responded with ${response.status}`);
    }

    const data = await response.json();
    const payload = {
      market,
      interval,
      fidelity,
      history: data.history || [],
      timestamp: Date.now(),
    };

    setCached(cacheKey, payload, 60); // 1 minute cache for history
    return res.json({ source: 'live', ...payload });
  } catch (error: any) {
    console.error(`Error fetching history for token ${market}:`, error);
    if (cached) {
      return res.json({ source: 'stale_cache', ...cached });
    }
    return res.status(502).json({ error: error.message || 'Failed to fetch price history' });
  }
});

// Proxy endpoint for other Brazilian political markets
app.get('/api/polymarket/related-events', async (_req, res) => {
  const cacheKey = 'related_brazil_events';
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ source: 'cache', ...cached });
  }

  try {
    const response = await fetch('https://gamma-api.polymarket.com/events?tag_slug=brazil&limit=25', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gamma API responded with ${response.status}`);
    }

    const data = await response.json();
    const payload = {
      events: (data || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        volume: ev.volume,
        liquidity: ev.liquidity,
        image: ev.image,
        active: ev.active,
        closed: ev.closed,
        endDate: ev.endDate,
        marketsCount: (ev.markets || []).length,
      })),
      timestamp: Date.now(),
    };

    setCached(cacheKey, payload, 300); // 5 minutes cache
    return res.json({ source: 'live', ...payload });
  } catch (error: any) {
    console.error('Error fetching related events:', error);
    return res.status(502).json({ error: error.message });
  }
});

// CSV Export Endpoint
app.get('/api/polymarket/export-csv', async (_req, res) => {
  try {
    const response = await fetch(
      'https://gamma-api.polymarket.com/events?slug=brazil-presidential-election',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'application/json',
        },
      }
    );
    const data = await response.json();
    const event = data[0];
    const rows = [
      ['Candidato', 'Probabilidade (%)', 'Preço Sim (USD)', 'Preço Não (USD)', 'Volume Total (USD)', 'ID Mercado', 'Data Extração UTC'],
    ];

    const now = new Date().toISOString();
    for (const m of event.markets || []) {
      let yesPrice = 0;
      let noPrice = 0;
      if (m.outcomePrices) {
        try {
          const parsed = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          yesPrice = parseFloat(parsed[0]) || 0;
          noPrice = parseFloat(parsed[1]) || 0;
        } catch {}
      }
      const candidate = m.groupItemTitle || m.question;
      const pct = (yesPrice * 100).toFixed(2);
      const vol = parseFloat(m.volume || 0).toFixed(2);
      rows.push([
        `"${candidate.replace(/"/g, '""')}"`,
        pct,
        yesPrice.toFixed(4),
        noPrice.toFixed(4),
        vol,
        m.id,
        now,
      ]);
    }

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="polymarket_brasil_presidencia_2026.csv"');
    return res.send('\uFEFF' + csvContent); // Add UTF-8 BOM for Excel compatibility in Brazil
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao gerar CSV: ' + error.message });
  }
});

// Proxy endpoint for official TSE Vote Counting (Resultados TSE) - Eleições 2026
// Usa exclusivamente os arquivos oficiais de divulgação do TSE. Nenhum resultado 2026 é inventado/local.
app.get('/api/tse/apuracao', async (req, res) => {
  const cargo = ((req.query.cargo as string) || '1').trim();
  const uf = ((req.query.uf as string) || (cargo === '1' ? 'br' : 'sp')).toLowerCase().trim();
  const turno = ((req.query.turno as string) || '1').trim() === '2' ? '2' : '1';
  const modo = (req.query.modo as string) || 'auto';

  const cargoPadded = cargo.padStart(4, '0');
  const base = 'https://resultados.tse.jus.br';
  const configUrls = [
    `${base}/oficial/comum/config/ele-c.json`,
    `${base}/oficial/ele2026/comum/config/ele-c.json`,
  ];

  try {
    // 1. Descobrir código oficial no EA11 (ele-c.json)
    const configCacheKey = 'tse_2026_ele_c_config';
    let config = getCached(configCacheKey);

    if (!config || modo === 'live_force') {
      for (const cfgUrl of configUrls) {
        try {
          const configResponse = await fetch(cfgUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 MonitorEleitoralBR/2.0',
              Accept: 'application/json',
            },
          });

          if (configResponse.ok) {
            config = await configResponse.json();
            setCached(configCacheKey, config, 60); // Cache do arquivo de config por 60s
            break;
          }
        } catch (err: any) {
          console.warn(`[TSE Proxy] Falha ao consultar ${cfgUrl}:`, err.message);
        }
      }
    }

    let eleicao = '';
    if (config) {
      const elections: any[] = [];
      const walk = (value: any) => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) {
          value.forEach(walk);
          return;
        }
        if (value.cd && value.nm && value.t && (value.cdt2 !== undefined || value.sqele)) {
          elections.push(value);
        }
        Object.values(value).forEach(walk);
      };
      walk(config);

      const federal = elections.find((e) => /Eleição (Geral|Ordinária) Federal/i.test(String(e.nm)) && String(e.t) === '1');
      const estadual = elections.find((e) => /Eleição (Geral|Ordinária) Estadual/i.test(String(e.nm)) && String(e.t) === '1');
      const baseElection = cargo === '1' ? federal : estadual;
      eleicao = turno === '2' ? String(baseElection?.cdt2 || '') : String(baseElection?.cd || '');
    }

    // Se a consulta da configuração falhar ou o código não for encontrado, usa a convenção oficial 2026 do TSE
    if (!eleicao) {
      eleicao = cargo === '1' ? (turno === '2' ? '6258' : '6257') : (turno === '2' ? '6260' : '6259');
    }

    const cacheKey = `tse_2026_${eleicao}_${uf}_${cargo}_${turno}`;
    const cached = getCached(cacheKey);
    if (cached && modo !== 'live_force') {
      return res.json({ sucesso: true, fonte: 'cache', eleicao, turno, dados: cached });
    }

    // 2. URLs candidatas oficiais do TSE (priorizando -u.json unificado de acordo com EA20)
    const urlsToTry = [
      `${base}/oficial/ele2026/${eleicao}/dados/${uf}/${uf}-c${cargoPadded}-e00${eleicao}-u.json`,
      `${base}/oficial/ele2026/${eleicao}/dados/${uf}/${uf}-c${cargoPadded}-e${eleicao}-u.json`,
      `${base}/oficial/ele2026/${eleicao}/dados-simplificados/${uf}/${uf}-c${cargoPadded}-e00${eleicao}-r.json`,
    ];

    let rawData: any = null;
    let successfulUrl = '';

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 MonitorEleitoralBR/2.0',
            Accept: 'application/json',
          },
        });
        if (response.ok) {
          rawData = await response.json();
          successfulUrl = url;
          break;
        }
      } catch {
        // Tenta próxima URL candidata
      }
    }

    if (rawData) {
      setCached(cacheKey, rawData, 15); // Cache oficial de 15 segundos
      return res.json({
        sucesso: true,
        status: 'available',
        fonte: 'tse_live',
        eleicao,
        turno,
        url: successfulUrl,
        dados: rawData,
      });
    }

    return res.json({
      sucesso: false,
      status: 'unavailable',
      motivo: 'aguardando_apuracao_tse',
      mensagem: 'O arquivo oficial de totalização do TSE ainda não foi disponibilizado para esta abrangência. O painel permanecerá sem números fictícios.',
      eleicao,
      turno,
      url: urlsToTry[0],
    });
  } catch (error: any) {
    console.warn('[TSE Proxy] Falha ao consultar divulgação oficial:', error.message);
    return res.json({
      sucesso: false,
      status: 'unavailable',
      motivo: 'tse_indisponivel',
      mensagem: 'Dados oficiais temporariamente indisponíveis. Tentaremos novamente automaticamente.',
      configUrl: configUrls[0],
    });
  }
});

// Proxy endpoint para apuração oficial dos países na Zona ZZ (Exterior) - Eleições 2026
app.get('/api/tse/exterior/paises', async (req, res) => {
  const turno = ((req.query.turno as string) || '1').trim() === '2' ? '2' : '1';
  const eleicao = turno === '2' ? '6258' : '6257';
  const cacheKey = `tse_2026_exterior_paises_${turno}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ sucesso: true, fonte: 'cache', paises: cached });
  }

  const base = 'https://resultados.tse.jus.br';
  // Mapeamento oficial dos postos/municípios eleitorais do exterior aos países monitorados
  const paisesConfig: { id: string; pais: string; munCodes: string[] }[] = [
    { id: 'NZ', pais: 'Nova Zelândia', munCodes: ['30805'] }, // Wellington
    { id: 'AU', pais: 'Austrália', munCodes: ['30562', '29491'] }, // Sydney, Camberra
    { id: 'KR', pais: 'Coreia do Sul', munCodes: ['30538'] }, // Seul
    { id: 'SG', pais: 'Singapura', munCodes: ['29548'] }, // Singapura
    { id: 'JP', pais: 'Japão', munCodes: ['30627', '30198', '29742'] }, // Tóquio, Nagóia, Hamamatsu
    { id: 'FR', pais: 'França', munCodes: ['30287'] }, // Paris
    { id: 'DE', pais: 'Alemanha', munCodes: ['29386', '29696', '30180'] }, // Berlim, Frankfurt, Munique
    { id: 'GB', pais: 'Reino Unido', munCodes: ['29971'] }, // Londres
    { id: 'IT', pais: 'Itália', munCodes: ['30449', '30120'] }, // Roma, Milão
    { id: 'PT', pais: 'Portugal', munCodes: ['29955', '30341', '30961'] }, // Lisboa, Porto, Faro
    { id: 'US', pais: 'Estados Unidos', munCodes: ['30112', '30228', '29416', '99490'] }, // Miami, NY, Boston, Orlando
  ];

  try {
    const fetchMun = async (mun: string) => {
      const url = `${base}/oficial/ele2026/${eleicao}/dados/zz/zz${mun}-c0001-e00${eleicao}-u.json`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 MonitorEleitoralBR/2.0' } });
      if (!r.ok) return null;
      return r.json();
    };

    const results = await Promise.all(
      paisesConfig.map(async (pc) => {
        const munDataList = (await Promise.all(pc.munCodes.map(fetchMun))).filter(Boolean);
        if (munDataList.length === 0) {
          return {
            id: pc.id,
            pais: pc.pais,
            totalValidos: 0,
            statusApuracao: 'Aguardando publicação oficial do TSE',
            candidatos: [],
          };
        }

        let totalValidos = 0;
        const candVotes: Record<string, { n: string; nm: string; nmCompleto: string; cc: string; vap: number }> = {};

        for (const data of munDataList) {
          const vv = parseInt(data.v?.vv || '0', 10);
          totalValidos += vv;

          data.carg?.[0]?.agr?.forEach((agr: any) => {
            agr.par?.forEach((par: any) => {
              par.cand?.forEach((c: any) => {
                const key = c.n;
                const vap = parseInt(c.vap || '0', 10);
                if (!candVotes[key]) {
                  candVotes[key] = {
                    n: c.n,
                    nm: c.nmu || c.nm,
                    nmCompleto: c.nm,
                    cc: agr.nm || par.sg || '',
                    vap: 0,
                  };
                }
                candVotes[key].vap += vap;
              });
            });
          });
        }

        const sortedCands = Object.values(candVotes)
          .map((c) => ({
            ...c,
            pvap: totalValidos > 0 ? (c.vap / totalValidos) * 100 : 0,
          }))
          .sort((a, b) => b.vap - a.vap);

        return {
          id: pc.id,
          pais: pc.pais,
          totalValidos,
          statusApuracao: totalValidos > 0 ? 'Totalizado' : 'Aguardando publicação oficial do TSE',
          candidatos: sortedCands,
          vencedor: sortedCands[0]?.nm || '',
        };
      })
    );

    setCached(cacheKey, results, 60); // Cache por 60 segundos
    return res.json({ sucesso: true, fonte: 'tse_live', paises: results });
  } catch (err: any) {
    console.warn('[TSE Proxy] Falha ao consultar países do exterior:', err.message);
    return res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// Vite or Static Serving
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);

  // Dev HTML middleware: ensures live TypeScript compilation in dev mode while index.html remains static for GitHub Pages
  app.use('*', async (req, res, next) => {
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) {
      return next();
    }
    try {
      const templatePath = fs.existsSync(path.resolve(__dirname, 'index.template.html'))
        ? path.resolve(__dirname, 'index.template.html')
        : path.resolve(__dirname, 'index.html');
      let html = fs.readFileSync(templatePath, 'utf-8');
      if (!html.includes('/src/main.tsx')) {
        html = html.replace(
          /<script\s+type="module"\s+crossorigin\s+src="\.?\/assets\/index\.js"><\/script>/i,
          '<script type="module" src="/src/main.tsx"></script>'
        );
        html = html.replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href="\.?\/assets\/index\.css">/i, '');
      }
      const transformed = await vite.transformIndexHtml(req.originalUrl, html);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
    } catch (e) {
      next(e);
    }
  });
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (prod=${isProd})`);
});

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
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

// Vite or Static Serving
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  // Dev HTML middleware: ensures live TypeScript compilation in dev mode while index.html remains static for GitHub Pages
  app.use('*', async (req, res, next) => {
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) {
      return next();
    }
    try {
      let html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      // If index.html points to pre-bundled assets, swap to live /src/main.tsx for dev HMR
      html = html.replace(
        /<script type="module" crossorigin src="\.?\/assets\/index\.js"><\/script>/,
        '<script type="module" src="/src/main.tsx"></script>'
      );
      html = html.replace(/<link rel="stylesheet" crossorigin href="\.?\/assets\/index\.css">/, '');
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

import React, { useState, useEffect } from 'react';
import { CandidateMarket, HistoryPoint, Timeframe } from '../types/polymarket';
import { fetchCandidateHistory, exportCandidateHistoryCSV } from '../services/polymarketService';
import { X, Download, TrendingUp, TrendingDown, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

interface CandidateModalProps {
  candidate: CandidateMarket | null;
  onClose: () => void;
  isDark: boolean;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  isDark,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidate || !candidate.yesTokenId) return;
    let isCancelled = false;
    setLoading(true);

    fetchCandidateHistory(candidate.yesTokenId, timeframe)
      .then((res) => {
        if (!isCancelled) setHistory(res.history);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [candidate, timeframe]);

  if (!candidate) return null;

  const formatUSD = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const prices = history.map((h) => h.p * 100);
  const minPrice = prices.length ? Math.min(...prices).toFixed(2) : '0';
  const maxPrice = prices.length ? Math.max(...prices).toFixed(2) : '0';
  const firstPrice = prices.length ? prices[0] : 0;
  const lastPrice = prices.length ? prices[prices.length - 1] : 0;
  const netChange = (lastPrice - firstPrice).toFixed(2);
  const isPositive = lastPrice >= firstPrice;

  // Mini SVG Line Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const pad = { top: 15, right: 20, bottom: 30, left: 45 };
  const innerW = svgWidth - pad.left - pad.right;
  const innerH = svgHeight - pad.top - pad.bottom;

  let pathD = '';
  if (history.length > 1) {
    const minVal = 0;
    const maxVal = Math.max(100, Math.ceil(Math.max(...prices, 10) / 10) * 10);
    const range = maxVal - minVal || 1;

    history.forEach((pt, i) => {
      const x = pad.left + (i / (history.length - 1)) * innerW;
      const y = pad.top + innerH - ((pt.p * 100 - minVal) / range) * innerH;
      if (i === 0) pathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            {candidate.image && (
              <img
                src={candidate.image}
                alt={candidate.candidate}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50"
                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
              />
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {candidate.candidate}
              </h2>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Contrato Polymarket ID: {candidate.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-mono block">Probabilidade</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {candidate.percentage.toFixed(2)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-mono block">Cotação Sim</span>
            <span className="text-lg font-bold font-mono text-neutral-200 tabular-nums">
              ${candidate.yesPrice.toFixed(3)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-mono block">Cotação Não</span>
            <span className="text-lg font-bold font-mono text-neutral-200 tabular-nums">
              ${candidate.noPrice.toFixed(3)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-mono block">Volume Acumulado</span>
            <span className="text-lg font-bold font-mono text-neutral-200 tabular-nums">
              ${(candidate.volume / 1_000_000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Chart Timeframe Controls */}
        <div className="flex items-center justify-between mb-3 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-300">
              Histórico de Flutuações
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg border text-xs font-mono bg-neutral-950 border-neutral-800">
            {(['24h', '7d', '30d', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeframe === tf ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Chart SVG */}
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 relative">
          {history.length > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[220px]">
              {/* Grid line */}
              <line
                x1={pad.left}
                y1={pad.top + innerH / 2}
                x2={svgWidth - pad.right}
                y2={pad.top + innerH / 2}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              {/* Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-500 font-mono">
              Carregando dados históricos do contrato...
            </div>
          )}

          {/* Stats below chart */}
          <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-neutral-800/80 mt-2 text-neutral-400">
            <div>
              Mín: <span className="text-neutral-200 font-bold">{minPrice}%</span>
            </div>
            <div>
              Máx: <span className="text-neutral-200 font-bold">{maxPrice}%</span>
            </div>
            <div className="flex items-center gap-1">
              Variação:
              <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? `+${netChange}%` : `${netChange}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Information Callout */}
        <div className="mt-4 p-3 rounded-xl bg-neutral-950/30 border border-neutral-800/80 text-xs text-neutral-400 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-200">Critério de Liquidação Oficial TSE:</span> O contrato resolve para &quot;Sim&quot; se {candidate.candidate} for proclamado vencedor da eleição presidencial de 2026 pelo Tribunal Superior Eleitoral (TSE). Inclui eventual segundo turno.
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-neutral-800">
          <button
            onClick={() => exportCandidateHistoryCSV(candidate.candidate, history)}
            disabled={history.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Série Histórica CSV</span>
          </button>

          <a
            href={`https://polymarket.com/market/${candidate.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-colors"
          >
            <span>Ver no Polymarket</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

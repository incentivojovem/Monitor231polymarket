import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CandidateMarket, HistoryPoint, Timeframe } from '../types/polymarket';
import { fetchCandidateHistory, exportCandidateHistoryCSV } from '../services/polymarketService';
import { Download, RefreshCw, Calendar, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface InteractiveChartProps {
  markets: CandidateMarket[];
  isDark: boolean;
  selectedCandidate: CandidateMarket | null;
  onSelectCandidate: (candidate: CandidateMarket) => void;
}

const CANDIDATE_COLORS = [
  '#10B981', // Emerald
  '#0EA5E9', // Sky
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  markets,
  isDark,
  selectedCandidate,
  onSelectCandidate,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Top candidates available for comparison
  const topCandidates = useMemo(() => {
    return [...markets].sort((a, b) => b.percentage - a.percentage).slice(0, 6);
  }, [markets]);

  // Which candidates are currently enabled in the multi-series view
  const [activeCandidateIds, setActiveCandidateIds] = useState<string[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryPoint[]>>({});

  // Initialize active candidates when markets load
  useEffect(() => {
    if (topCandidates.length > 0) {
      setActiveCandidateIds((prev) => {
        if (prev.length > 0) return Array.from(new Set(prev));
        return Array.from(new Set(topCandidates.slice(0, 2).map((c) => c.id)));
      });
    }
  }, [topCandidates]);

  // If user selects a candidate from outside, ensure they are active without duplicates
  useEffect(() => {
    if (selectedCandidate) {
      setActiveCandidateIds((prev) => {
        if (prev.includes(selectedCandidate.id)) return prev;
        return Array.from(new Set([...prev, selectedCandidate.id]));
      });
    }
  }, [selectedCandidate]);

  // Unique active candidate IDs
  const uniqueActiveIds = useMemo(() => Array.from(new Set(activeCandidateIds)), [activeCandidateIds]);

  // Fetch histories for all active candidates
  useEffect(() => {
    let isCancelled = false;

    async function loadHistories() {
      if (uniqueActiveIds.length === 0) return;
      setLoading(true);
      setError(null);

      try {
        const promises = uniqueActiveIds.map(async (id) => {
          const cand = markets.find((m) => m.id === id);
          if (!cand || !cand.yesTokenId) return null;
          const res = await fetchCandidateHistory(cand.yesTokenId, timeframe);
          return { id, history: res.history };
        });

        const results = await Promise.all(promises);
        if (isCancelled) return;

        const newMap: Record<string, HistoryPoint[]> = {};
        for (const item of results) {
          if (item) {
            newMap[item.id] = item.history;
          }
        }
        setHistoryMap(newMap);
      } catch (err: any) {
        if (!isCancelled) {
          setError('Não foi possível carregar o histórico de flutuação de alguns candidatos.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadHistories();
    return () => {
      isCancelled = true;
    };
  }, [uniqueActiveIds, timeframe, markets]);

  const toggleCandidate = (id: string) => {
    setActiveCandidateIds((prev) => {
      const unique = Array.from(new Set(prev));
      if (unique.includes(id)) {
        if (unique.length === 1) return unique; // Keep at least one
        return unique.filter((item) => item !== id);
      } else {
        return [...unique, id];
      }
    });
  };

  // Hover state for tooltips
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Unified timeline calculation
  const chartData = useMemo(() => {
    // Gather all timestamps from loaded histories
    const allTimestampsSet = new Set<number>();
    activeCandidateIds.forEach((id) => {
      const hist = historyMap[id] || [];
      hist.forEach((pt) => allTimestampsSet.add(pt.t));
    });

    const timestamps = Array.from(allTimestampsSet).sort((a, b) => a - b);
    if (timestamps.length === 0) return null;

    // Resample / forward-fill each candidate
    const points = timestamps.map((t) => {
      const entry: { t: number; values: Record<string, number> } = { t, values: {} };
      uniqueActiveIds.forEach((id) => {
        const hist = historyMap[id] || [];
        // Find closest point on or before t
        let lastVal = 0;
        for (let i = 0; i < hist.length; i++) {
          if (hist[i].t <= t) {
            lastVal = hist[i].p * 100;
          } else {
            break;
          }
        }
        entry.values[id] = lastVal;
      });
      return entry;
    });

    return points;
  }, [historyMap, uniqueActiveIds]);

  // SVG Chart Geometry
  const width = 900;
  const height = 360;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max and Min values for Y Axis
  const { maxY, minY } = useMemo(() => {
    let max = 60;
    let min = 0;
    if (chartData && chartData.length > 0) {
      chartData.forEach((pt) => {
        Object.values(pt.values).forEach((val) => {
          if (val > max) max = Math.min(100, Math.ceil(val / 10) * 10);
        });
      });
    }
    return { maxY: Math.max(max, 50), minY: 0 };
  }, [chartData]);

  // Scaler functions
  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left;
    return padding.left + (index / (total - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxY - minY || 1;
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padding.top + innerHeight - ((clamped - minY) / range) * innerHeight;
  };

  // Build SVG Path strings for each active candidate
  const candidatePaths = useMemo(() => {
    if (!chartData || chartData.length === 0) return {};
    const paths: Record<string, string> = {};

    uniqueActiveIds.forEach((id) => {
      let d = '';
      chartData.forEach((pt, idx) => {
        const x = getX(idx, chartData.length);
        const val = pt.values[id] ?? 0;
        const y = getY(val);
        if (idx === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      paths[id] = d;
    });

    return paths;
  }, [chartData, activeCandidateIds, maxY, minY]);

  // Handle pointer hover on chart
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartData || chartData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * width;
    const graphX = relativeX - padding.left;
    const ratio = Math.max(0, Math.min(1, graphX / innerWidth));
    const index = Math.round(ratio * (chartData.length - 1));
    setHoverIndex(index);
  };

  const hoveredData = hoverIndex !== null && chartData ? chartData[hoverIndex] : null;

  // Selected candidate stats for period
  const primaryCandidateId = selectedCandidate?.id || activeCandidateIds[0];
  const primaryCandidate = markets.find((m) => m.id === primaryCandidateId);
  const primaryHistory = historyMap[primaryCandidateId] || [];

  const stats = useMemo(() => {
    if (primaryHistory.length === 0) return null;
    const prices = primaryHistory.map((h) => h.p * 100);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      current: last.toFixed(2),
      change: change.toFixed(2),
      isPositive: change >= 0,
    };
  }, [primaryHistory]);

  const handleExportHistory = () => {
    if (primaryCandidate && primaryHistory.length > 0) {
      exportCandidateHistoryCSV(primaryCandidate.candidate, primaryHistory);
    }
  };

  return (
    <section className={`p-4 sm:p-6 rounded-2xl border transition-colors mb-8 ${
      isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
    }`}>
      {/* Chart Header: Title & Timeframe Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Flutuação Histórica de Porcentagem
            </h2>
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Comparativo oficial de cotações temporais via CLOB API da Polymarket.
          </p>
        </div>

        {/* Timeframe Button Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg border text-xs font-mono font-medium bg-neutral-900/60 border-neutral-800">
            {(['24h', '7d', '30d', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? (isDark ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-neutral-950 shadow-sm font-bold')
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tf === '24h' ? '24h' : tf === '7d' ? '7 Dias' : tf === '30d' ? '30 Dias' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Export series button */}
          <button
            onClick={handleExportHistory}
            disabled={!primaryCandidate || primaryHistory.length === 0}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
              isDark 
                ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200' 
                : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
            }`}
            title="Baixar histórico do candidato ativo em CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV Série</span>
          </button>
        </div>
      </div>

      {/* Candidate Series Toggles */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-neutral-800/60">
        <span className="text-xs text-neutral-500 font-mono mr-1">Comparar:</span>
        {topCandidates.map((c, i) => {
          const isActive = uniqueActiveIds.includes(c.id);
          const color = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length];

          return (
            <button
              key={`toggle-${c.id}-${i}`}
              onClick={() => toggleCandidate(c.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? 'border-neutral-600 bg-neutral-800/90 text-white shadow-sm'
                  : 'border-neutral-800/60 bg-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: isActive ? color : '#525252' }}
              />
              <span className="truncate max-w-[130px]">{c.candidate}</span>
              <span className="font-mono text-[11px] opacity-80 tabular-nums">
                {c.percentage.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        {chartData && chartData.length > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[380px] overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          >
            {/* Grid Lines & Y-Axis Labels */}
            {[0, 25, 50, 75, 100].filter((val) => val <= maxY).map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-neutral-500 tabular-nums"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Candidate Lines */}
            {uniqueActiveIds.map((id) => {
              const candIndex = topCandidates.findIndex((c) => c.id === id);
              const color = CANDIDATE_COLORS[candIndex % CANDIDATE_COLORS.length] || '#10B981';
              const pathD = candidatePaths[id];
              if (!pathD) return null;

              return (
                <g key={`series-${id}`}>
                  {/* Subtle Glow */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="0.15"
                  />
                  {/* Main Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Hover Crosshair & Tooltip */}
            {hoverIndex !== null && hoveredData && (
              <g>
                {/* Vertical Crosshair Line */}
                <line
                  x1={getX(hoverIndex, chartData.length)}
                  y1={padding.top}
                  x2={getX(hoverIndex, chartData.length)}
                  y2={height - padding.bottom}
                  stroke={isDark ? '#e5e5e5' : '#404040'}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Circles on each candidate line */}
                {uniqueActiveIds.map((id) => {
                  const candIndex = topCandidates.findIndex((c) => c.id === id);
                  const color = CANDIDATE_COLORS[candIndex % CANDIDATE_COLORS.length] || '#10B981';
                  const val = hoveredData.values[id] ?? 0;
                  const cx = getX(hoverIndex, chartData.length);
                  const cy = getY(val);

                  return (
                    <circle
                      key={`circle-${id}`}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={color}
                      stroke={isDark ? '#0a0a0a' : '#ffffff'}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}

            {/* X-Axis Date markers */}
            {chartData.length > 0 && (
              <g>
                {/* Start Date */}
                <text
                  x={padding.left}
                  y={height - 12}
                  textAnchor="start"
                  className="text-[10px] font-mono fill-neutral-500"
                >
                  {new Date(chartData[0].t * 1000).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </text>

                {/* Middle Date */}
                {chartData.length > 2 && (
                  <text
                    x={padding.left + innerWidth / 2}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-neutral-500"
                  >
                    {new Date(chartData[Math.floor(chartData.length / 2)].t * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </text>
                )}

                {/* End Date */}
                <text
                  x={width - padding.right}
                  y={height - 12}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-neutral-500"
                >
                  {new Date(chartData[chartData.length - 1].t * 1000).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: timeframe === '24h' ? '2-digit' : undefined,
                    minute: timeframe === '24h' ? '2-digit' : undefined,
                  })}
                </text>
              </g>
            )}
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-emerald-500" />
            <p>Carregando dados históricos da Polymarket...</p>
          </div>
        )}

        {/* Floating Tooltip Box */}
        {hoveredData && (
          <div
            className={`absolute top-2 right-4 p-3 rounded-xl border shadow-xl backdrop-blur-md pointer-events-none transition-all ${
              isDark ? 'bg-neutral-950/95 border-neutral-700 text-neutral-100' : 'bg-white/95 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="text-[11px] font-mono text-neutral-400 border-b border-neutral-800 pb-1 mb-2">
              {new Date(hoveredData.t * 1000).toLocaleString('pt-BR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
            <div className="space-y-1.5">
              {uniqueActiveIds.map((id) => {
                const c = markets.find((m) => m.id === id);
                if (!c) return null;
                const candIndex = topCandidates.findIndex((item) => item.id === id);
                const color = CANDIDATE_COLORS[candIndex % CANDIDATE_COLORS.length];
                const val = hoveredData.values[id] ?? 0;

                return (
                  <div key={`tooltip-${id}`} className="flex items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate">{c.candidate}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color }}>
                      {val.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fluctuation Summary Metrics */}
      {stats && primaryCandidate && (
        <div className="mt-6 pt-4 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800">
            <span className="text-neutral-500 block mb-0.5">Candidato em Destaque</span>
            <span className="font-bold text-sm text-neutral-100 truncate block">
              {primaryCandidate.candidate}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800">
            <span className="text-neutral-500 block mb-0.5">Variação no Período</span>
            <span className={`font-bold text-sm flex items-center gap-1 tabular-nums ${
              stats.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {stats.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {stats.isPositive ? `+${stats.change}%` : `${stats.change}%`}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800">
            <span className="text-neutral-500 block mb-0.5">Máxima no Período</span>
            <span className="font-bold text-sm text-neutral-100 tabular-nums">
              {stats.max}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800">
            <span className="text-neutral-500 block mb-0.5">Mínima no Período</span>
            <span className="font-bold text-sm text-neutral-100 tabular-nums">
              {stats.min}%
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

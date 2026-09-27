import React, { useState } from 'react';
import { CandidateMarket } from '../types/polymarket';
import { Search, ArrowUpDown, ChevronRight, BarChart3, User, Sparkles } from 'lucide-react';

interface CandidateLeaderboardProps {
  markets: CandidateMarket[];
  isDark: boolean;
  onSelectCandidate: (candidate: CandidateMarket) => void;
  selectedCandidateId: string | null;
}

export const CandidateLeaderboard: React.FC<CandidateLeaderboardProps> = ({
  markets,
  isDark,
  onSelectCandidate,
  selectedCandidateId,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'percentage' | 'volume' | 'name'>('percentage');

  // Filter candidates
  const filtered = markets.filter((m) =>
    m.candidate.toLowerCase().includes(search.toLowerCase()) ||
    m.question.toLowerCase().includes(search.toLowerCase())
  );

  // Sort candidates
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'percentage') return b.percentage - a.percentage;
    if (sortBy === 'volume') return b.volume - a.volume;
    return a.candidate.localeCompare(b.candidate);
  });

  const formatUSD = (val: number) => {
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    }
    if (val >= 1_000) {
      return `$${(val / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`;
    }
    return `$${val.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  };

  const getOddsMultiplier = (pct: number) => {
    if (pct <= 0) return '—';
    const mult = 100 / pct;
    return `${mult.toFixed(2)}x`;
  };

  return (
    <section className="py-6 sm:py-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>Probabilidades em Tempo Real</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-neutral-800 text-neutral-300">
              {markets.length} candidatos listados
            </span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Porcentagem implícita calculada diretamente a partir do preço das cotas de liquidação TSE ($0,00 a $1,00 USD).
          </p>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar candidato..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-100 focus:border-emerald-500'
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-emerald-600'
              }`}
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg border text-xs font-medium shrink-0 bg-neutral-900/40 border-neutral-800">
            <button
              onClick={() => setSortBy('percentage')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortBy === 'percentage'
                  ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-white text-neutral-900 shadow-sm font-semibold')
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Probabilidade
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortBy === 'volume'
                  ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-white text-neutral-900 shadow-sm font-semibold')
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortBy === 'name'
                  ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-white text-neutral-900 shadow-sm font-semibold')
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Nome
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Candidate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sorted.map((candidate, idx) => {
          const isSelected = selectedCandidateId === candidate.id;
          const isTop2 = candidate.percentage >= 10;
          
          return (
            <div
              key={`${candidate.id}-${idx}`}
              onClick={() => onSelectCandidate(candidate)}
              className={`group relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg'
                  : isDark
                    ? 'bg-neutral-900/50 hover:bg-neutral-800/80 border-neutral-800/90'
                    : 'bg-white hover:bg-neutral-50/90 border-neutral-200 shadow-sm'
              }`}
            >
              {/* Top row: Rank, Avatar, Candidate Name */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-mono font-bold w-5 text-center ${
                  idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-neutral-300' : 'text-neutral-500'
                }`}>
                  #{idx + 1}
                </span>

                {/* Candidate Image */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-neutral-700 bg-neutral-800 flex items-center justify-center">
                  {candidate.image ? (
                    <img
                      src={candidate.image}
                      alt={candidate.candidate}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                {/* Candidate Name & Question */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-bold truncate group-hover:text-emerald-400 transition-colors">
                      {candidate.candidate}
                    </h3>
                    {idx === 0 && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                        Favorito
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate font-mono">
                    Vol: {formatUSD(candidate.volume)}
                  </p>
                </div>
              </div>

              {/* Middle row: Big Percentage & Implied Multiplier */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums text-emerald-400">
                    {candidate.percentage > 0 ? `${candidate.percentage.toFixed(2)}%` : '< 0.05%'}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    Cotação Sim: ${candidate.yesPrice.toFixed(3)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-medium text-neutral-400">
                    Retorno Implícito
                  </div>
                  <div className="text-sm font-bold font-mono text-neutral-200">
                    {getOddsMultiplier(candidate.percentage)}
                  </div>
                </div>
              </div>

              {/* Probability Visual Bar */}
              <div className="w-full bg-neutral-800/80 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    idx === 0
                      ? 'bg-emerald-500'
                      : idx === 1
                        ? 'bg-sky-500'
                        : 'bg-neutral-500'
                  }`}
                  style={{ width: `${Math.max(candidate.percentage, 1)}%` }}
                />
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60 text-neutral-400 group-hover:text-neutral-200">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Ver flutuações
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <p className="text-sm text-neutral-400">
            Nenhum candidato encontrado para o termo &ldquo;{search}&rdquo;.
          </p>
        </div>
      )}
    </section>
  );
};

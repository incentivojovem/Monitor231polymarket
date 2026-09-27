import React, { useState } from 'react';
import { CandidateMarket, ElectionEvent } from '../types/polymarket';
import { exportElectionCSV } from '../services/polymarketService';
import { Download, ArrowUpDown, Search, ExternalLink, BarChart2 } from 'lucide-react';

interface FluctuationHistoryTableProps {
  markets: CandidateMarket[];
  event: ElectionEvent;
  isDark: boolean;
  onSelectCandidate: (candidate: CandidateMarket) => void;
}

export const FluctuationHistoryTable: React.FC<FluctuationHistoryTableProps> = ({
  markets,
  event,
  isDark,
  onSelectCandidate,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'percentage' | 'volume' | 'liquidity' | 'candidate'>('percentage');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: 'percentage' | 'volume' | 'liquidity' | 'candidate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = markets.filter(
    (m) =>
      m.candidate.toLowerCase().includes(search.toLowerCase()) ||
      m.id.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === 'percentage') diff = a.percentage - b.percentage;
    else if (sortField === 'volume') diff = a.volume - b.volume;
    else if (sortField === 'liquidity') diff = a.liquidity - b.liquidity;
    else diff = a.candidate.localeCompare(b.candidate);
    return sortAsc ? diff : -diff;
  });

  const formatUSD = (num: number) => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <section className={`p-4 sm:p-6 rounded-2xl border transition-colors mb-8 ${
      isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
    }`}>
      {/* Table Header: Controls and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Histórico Detalhado &amp; Livro de Ordens
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Tabela completa de todas as posições contratadas com atualização em tempo real e exportação analítica.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nome ou ID..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none font-mono ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-100 focus:border-emerald-500'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-emerald-600'
              }`}
            />
          </div>

          {/* Export Full Table CSV Button */}
          <button
            onClick={() => exportElectionCSV(markets, event)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
            }`}
            title="Exportar todos os dados para planilha CSV (formato Brasil/Excel)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* High-Density Responsive Table Container */}
      <div className="w-full overflow-x-auto border rounded-xl border-neutral-800/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b font-mono uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-neutral-950/80 text-neutral-400 border-neutral-800' : 'bg-neutral-100/90 text-neutral-600 border-neutral-200'
            }`}>
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th
                onClick={() => handleSort('candidate')}
                className="py-3 px-4 cursor-pointer hover:text-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Candidato</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('percentage')}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Probabilidade (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">Preço Sim (USD)</th>
              <th className="py-3 px-4 text-right hidden md:table-cell">Preço Não (USD)</th>
              <th
                onClick={() => handleSort('volume')}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume Operado</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('liquidity')}
                className="py-3 px-4 text-right hidden lg:table-cell cursor-pointer hover:text-neutral-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Liquidez</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center w-20">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono">
            {sorted.map((m, idx) => (
              <tr
                key={`${m.id}-${idx}`}
                onClick={() => onSelectCandidate(m)}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-neutral-800/50 text-neutral-300'
                    : 'hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                {/* Pos */}
                <td className="py-3 px-3 text-center text-neutral-500 font-bold">
                  {idx + 1}
                </td>

                {/* Candidate Info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    {m.image && (
                      <img
                        src={m.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-neutral-700"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                    )}
                    <span className="font-sans font-semibold text-neutral-100 truncate max-w-[200px]">
                      {m.candidate}
                    </span>
                  </div>
                </td>

                {/* Percentage */}
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-sm text-emerald-400 tabular-nums">
                    {m.percentage > 0 ? `${m.percentage.toFixed(2)}%` : '< 0.05%'}
                  </span>
                </td>

                {/* Preço Sim */}
                <td className="py-3 px-4 text-right hidden sm:table-cell text-neutral-300 tabular-nums">
                  ${m.yesPrice.toFixed(4)}
                </td>

                {/* Preço Não */}
                <td className="py-3 px-4 text-right hidden md:table-cell text-neutral-400 tabular-nums">
                  ${m.noPrice.toFixed(4)}
                </td>

                {/* Volume */}
                <td className="py-3 px-4 text-right font-medium text-neutral-200 tabular-nums">
                  ${formatUSD(m.volume)}
                </td>

                {/* Liquidity */}
                <td className="py-3 px-4 text-right hidden lg:table-cell text-neutral-400 tabular-nums">
                  ${formatUSD(m.liquidity)}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectCandidate(m)}
                    className={`p-1.5 rounded transition-colors ${
                      isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600'
                    }`}
                    title="Ver gráfico detalhado deste candidato"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono">
          Nenhum registro coincide com o filtro informado.
        </div>
      )}
    </section>
  );
};

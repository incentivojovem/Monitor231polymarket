import React from 'react';
import { RefreshCw, Download, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onExportCSV: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  isAutoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onExportCSV,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full transition-colors border-b ${
      isDark 
        ? 'bg-neutral-950/95 border-neutral-800/80 backdrop-blur-md text-neutral-100' 
        : 'bg-white/95 border-neutral-200/80 backdrop-blur-md text-neutral-900'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand Wordmark (Strict single line, no wrapping) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Feed Polymarket conectado" />
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('overview');
            }}
            className="text-xs sm:text-sm md:text-base font-bold tracking-tight uppercase hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
          >
            <span className="inline sm:hidden">Monitor BR</span>
            <span className="hidden sm:inline">Monitor Eleitoral BR</span>
          </a>
          <span className="hidden xl:inline text-[11px] text-neutral-500 font-mono tracking-tight whitespace-nowrap shrink-0">
            · Polymarket
          </span>
        </div>

        {/* Zone 2: Navigation Links (Abbreviated, single line, no linebreaks) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-xs sm:text-sm font-medium shrink-0">
          <button
            onClick={() => onSelectSection('overview')}
            className={`transition-colors py-1 px-1 whitespace-nowrap shrink-0 ${
              activeSection === 'overview'
                ? (isDark ? 'text-white border-b-2 border-emerald-500 font-semibold' : 'text-neutral-950 border-b-2 border-emerald-600 font-semibold')
                : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900')
            }`}
          >
            Candidatos
          </button>
          <button
            onClick={() => onSelectSection('charts')}
            className={`transition-colors py-1 px-1 whitespace-nowrap shrink-0 ${
              activeSection === 'charts'
                ? (isDark ? 'text-white border-b-2 border-emerald-500 font-semibold' : 'text-neutral-950 border-b-2 border-emerald-600 font-semibold')
                : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900')
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => onSelectSection('history')}
            className={`transition-colors py-1 px-1 whitespace-nowrap shrink-0 ${
              activeSection === 'history'
                ? (isDark ? 'text-white border-b-2 border-emerald-500 font-semibold' : 'text-neutral-950 border-b-2 border-emerald-600 font-semibold')
                : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900')
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => onSelectSection('related')}
            className={`transition-colors py-1 px-1 whitespace-nowrap shrink-0 ${
              activeSection === 'related'
                ? (isDark ? 'text-white border-b-2 border-emerald-500 font-semibold' : 'text-neutral-950 border-b-2 border-emerald-600 font-semibold')
                : (isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900')
            }`}
          >
            Mercados
          </button>
          <button
            onClick={() => onSelectSection('tse_apuracao')}
            className={`transition-all py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold text-xs ${
              activeSection === 'tse_apuracao'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                : (isDark
                    ? 'bg-neutral-800/90 text-emerald-400 border border-emerald-500/30 hover:bg-neutral-800 hover:text-emerald-300'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100')
            }`}
            title="Apuração Oficial em Tempo Real de todos os cargos via API Aberta do TSE"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Apuração TSE</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-black/20">
              Ao Vivo
            </span>
          </button>
        </nav>

        {/* Zone 3: Interactive Controls (Strict single line, shrink-0) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Timestamp (only on large displays) */}
          {lastUpdated && (
            <span className="hidden 2xl:inline text-[11px] text-neutral-400 font-mono whitespace-nowrap shrink-0">
              {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}

          {/* Live / Paused Status Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isAutoRefresh
                ? (isDark ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/70' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                : (isDark ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-100 text-neutral-500 border border-neutral-200')
            }`}
            title={isAutoRefresh ? 'Atualização automática ativa (20s)' : 'Atualização automática pausada'}
          >
            {isAutoRefresh ? 'AO VIVO' : 'PAUSA'}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
              isDark
                ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
            title="Atualizar dados agora"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Theme Toggle (Dark/Light) */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
              isDark
                ? 'hover:bg-neutral-800 text-neutral-300 hover:text-amber-300'
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-amber-600'
            }`}
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-neutral-100 text-neutral-950 hover:bg-white'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
            title="Exportar dados em CSV"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Exportar</span>
            <span>CSV</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar (Abbreviated, 1 line) */}
      <div className={`md:hidden flex items-center justify-around border-t py-1.5 px-2 text-xs font-medium ${
        isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-white'
      }`}>
        <button
          onClick={() => onSelectSection('overview')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'overview'
              ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-neutral-100 text-neutral-950 font-semibold')
              : (isDark ? 'text-neutral-400' : 'text-neutral-600')
          }`}
        >
          Candidatos
        </button>
        <button
          onClick={() => onSelectSection('charts')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'charts'
              ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-neutral-100 text-neutral-950 font-semibold')
              : (isDark ? 'text-neutral-400' : 'text-neutral-600')
          }`}
        >
          Gráficos
        </button>
        <button
          onClick={() => onSelectSection('history')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'history'
              ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-neutral-100 text-neutral-950 font-semibold')
              : (isDark ? 'text-neutral-400' : 'text-neutral-600')
          }`}
        >
          Histórico
        </button>
        <button
          onClick={() => onSelectSection('related')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'related'
              ? (isDark ? 'bg-neutral-800 text-white font-semibold' : 'bg-neutral-100 text-neutral-950 font-semibold')
              : (isDark ? 'text-neutral-400' : 'text-neutral-600')
          }`}
        >
          Mercados
        </button>
        <button
          onClick={() => onSelectSection('tse_apuracao')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 font-semibold ${
            activeSection === 'tse_apuracao'
              ? 'bg-emerald-500 text-neutral-950 shadow-sm'
              : (isDark ? 'text-emerald-400' : 'text-emerald-700')
          }`}
        >
          Apuração TSE
        </button>
      </div>
    </header>
  );
};

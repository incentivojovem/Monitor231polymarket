import React from 'react';
import { ElectionEvent, CandidateMarket, OfficeType } from '../types/polymarket';
import { TrendingUp, DollarSign, Activity, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';

interface ElectionHeroProps {
  event: ElectionEvent;
  markets: CandidateMarket[];
  isDark: boolean;
  onOpenRules: () => void;
  officeType?: OfficeType;
  stateName?: string;
}

export const ElectionHero: React.FC<ElectionHeroProps> = ({
  event,
  markets,
  isDark,
  onOpenRules,
  officeType = 'president',
  stateName,
}) => {
  const sorted = [...markets].sort((a, b) => b.percentage - a.percentage);
  const leader = sorted[0];
  const second = sorted[1];
  const spread = leader && second ? (leader.percentage - second.percentage).toFixed(2) : '0';

  const formatUSD = (num?: number) => {
    if (!num) return '$0';
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}K`;
    }
    return `$${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Days until October 4, 2026
  const electionDate = new Date('2026-10-04T08:00:00-03:00');
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((electionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const displayTitle = officeType === 'governor' 
    ? `Cotação e Probabilidade · Governo de ${stateName || 'Estado'}`
    : 'Cotação e Probabilidade Presidencial';

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${
      isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50/80 border-neutral-200'
    }`}>
      {/* Background Image Scrim */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url('/src/assets/images/brasil_election_hero_1790527274804.jpg')` }}
      />
      
      <div className="relative p-6 sm:p-8">
        
        {/* Upper Breadcrumb / Context */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-3 font-mono">
          <span>Mercados Preditivos</span>
          <span aria-hidden="true">·</span>
          <span>América Latina</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-500 font-medium">
            {officeType === 'governor' ? `Eleições Estaduais 2026 · ${stateName}` : 'Eleições Oficiais Brasil 2026'}
          </span>
          <span aria-hidden="true">·</span>
          <span>Resolução Oficial TSE</span>
        </div>

        {/* Title and Top Narrative */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {displayTitle}
            </h1>
            <p className={`mt-2 text-sm sm:text-base leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Dados em tempo real extraídos via API pública do maior livro de ordens preditivo global (<span className="font-semibold text-emerald-400">Polymarket</span>). 
              Cotações auditáveis baseadas em apostas financeiras reais com resolução contratual ancorada no Tribunal Superior Eleitoral (TSE).
            </p>
          </div>

          {/* Quick Resolution Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRules}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-2 border transition-colors ${
                isDark 
                  ? 'border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200' 
                  : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Regras de Liquidação TSE</span>
            </button>
            <a
              href={`https://polymarket.com/event/${event.slug}`}
              target="_blank"
              rel="noreferrer noopener"
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                  : 'border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Ver contrato original na Polymarket"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* High-Impact Stat Grid (Single-Elevation, Tabular figures) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Stat 1: Volume Total */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Volume Total Operado</span>
              <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {formatUSD(event.volume)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              24h: <span className="font-mono text-neutral-400">{formatUSD(event.volume24hr)}</span>
            </div>
          </div>

          {/* Stat 2: Liquidez Ativa */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Liquidez no Livro</span>
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums">
              {formatUSD(event.liquidity)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Open Interest: <span className="font-mono text-neutral-400">{formatUSD(event.openInterest)}</span>
            </div>
          </div>

          {/* Stat 3: Liderança & Margem */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Líder Atual</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {leader ? leader.candidate : '--'}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-bold">{leader ? `${leader.percentage}%` : '0%'}</span>
              <span>· Vantagem: +{spread}%</span>
            </div>
          </div>

          {/* Stat 4: Dias para a Eleição */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>1º Turno TSE</span>
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums text-amber-400">
              {diffDays} dias
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Data: <span className="font-mono text-neutral-400">04/10/2026</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

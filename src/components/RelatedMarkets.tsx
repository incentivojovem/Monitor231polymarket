import React from 'react';
import { RelatedEvent } from '../types/polymarket';
import { ExternalLink, Layers, ArrowUpRight } from 'lucide-react';

interface RelatedMarketsProps {
  events: RelatedEvent[];
  isDark: boolean;
}

export const RelatedMarkets: React.FC<RelatedMarketsProps> = ({ events, isDark }) => {
  const formatUSD = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  // Filter out the main presidential election since it's already shown at the top
  const secondary = events.filter((e) => e.slug !== 'brazil-presidential-election');

  return (
    <section className={`p-4 sm:p-6 rounded-2xl border transition-colors mb-8 ${
      isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
    }`}>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <span>Outros Mercados Preditivos do Brasil</span>
        </h2>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Contratos complementares abertos na Polymarket relacionados ao cenário político e institucional brasileiro.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {secondary.slice(0, 9).map((event, idx) => (
          <a
            key={`related-${event.id}-${idx}`}
            href={`https://polymarket.com/event/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group p-4 rounded-xl border transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-neutral-950/60 hover:bg-neutral-800/80 border-neutral-800/90'
                : 'bg-neutral-50 hover:bg-white border-neutral-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mb-2">
                <span>{event.active ? 'Ativo' : 'Encerrado'}</span>
                <span>Vol: {formatUSD(event.volume)}</span>
              </div>
              <h3 className="text-sm font-bold leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                {event.title}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-neutral-200">
              <span>{event.marketsCount} submercados</span>
              <span className="flex items-center gap-1 text-emerald-400">
                Acessar <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { OfficeType, GovernorState } from '../types/polymarket';
import { BRAZIL_GOVERNOR_STATES } from '../services/polymarketService';
import { Landmark, Building2, MapPin, ChevronDown } from 'lucide-react';

interface OfficeSelectorProps {
  officeType: OfficeType;
  onChangeOfficeType: (type: OfficeType) => void;
  selectedStateUf: string;
  onSelectStateUf: (uf: string) => void;
  isDark: boolean;
  isLoading: boolean;
}

export const OfficeSelector: React.FC<OfficeSelectorProps> = ({
  officeType,
  onChangeOfficeType,
  selectedStateUf,
  onSelectStateUf,
  isDark,
  isLoading,
}) => {
  const currentState = BRAZIL_GOVERNOR_STATES.find((s) => s.uf === selectedStateUf) || BRAZIL_GOVERNOR_STATES[0];

  // Top states by volume / relevance for quick access chips
  const quickStates = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'CE', 'GO', 'PE'];

  return (
    <div className={`border-b transition-colors ${
      isDark ? 'bg-neutral-900/80 border-neutral-800/90' : 'bg-white border-neutral-200 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Segmented Toggle: Presidente vs Governador */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950/20 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 shrink-0 w-fit">
            <button
              onClick={() => onChangeOfficeType('president')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                officeType === 'president'
                  ? (isDark 
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm' 
                      : 'bg-emerald-600 text-white shadow-sm')
                  : (isDark 
                      ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Presidente da República</span>
            </button>

            <button
              onClick={() => onChangeOfficeType('governor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                officeType === 'governor'
                  ? (isDark 
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm' 
                      : 'bg-emerald-600 text-white shadow-sm')
                  : (isDark 
                      ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Governador de Estado</span>
            </button>
          </div>

          {/* Secondary Control: When Governor is chosen, show State selector */}
          {officeType === 'governor' && (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono shrink-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Estado:</span>
              </div>

              {/* State Dropdown Selector */}
              <div className="relative shrink-0">
                <select
                  value={selectedStateUf}
                  onChange={(e) => onSelectStateUf(e.target.value)}
                  disabled={isLoading}
                  className={`appearance-none text-xs sm:text-sm font-semibold py-1.5 pl-3 pr-8 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-100 hover:border-neutral-600 focus:border-emerald-500'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 hover:border-neutral-400 focus:border-emerald-600'
                  }`}
                >
                  <optgroup label="Sudeste">
                    {BRAZIL_GOVERNOR_STATES.filter((s) => s.region === 'Sudeste').map((s) => (
                      <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sul">
                    {BRAZIL_GOVERNOR_STATES.filter((s) => s.region === 'Sul').map((s) => (
                      <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Nordeste">
                    {BRAZIL_GOVERNOR_STATES.filter((s) => s.region === 'Nordeste').map((s) => (
                      <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Centro-Oeste">
                    {BRAZIL_GOVERNOR_STATES.filter((s) => s.region === 'Centro-Oeste').map((s) => (
                      <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Norte">
                    {BRAZIL_GOVERNOR_STATES.filter((s) => s.region === 'Norte').map((s) => (
                      <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
              </div>

              {/* Quick Pills for Most Active States */}
              <div className="hidden xl:flex items-center gap-1 overflow-x-auto py-0.5">
                {quickStates.map((uf) => {
                  const isCurrent = uf === selectedStateUf;
                  return (
                    <button
                      key={uf}
                      onClick={() => onSelectStateUf(uf)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                        isCurrent
                          ? (isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/80 font-bold' : 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold')
                          : (isDark ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100')
                      }`}
                    >
                      {uf}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Context Label (When President is selected) */}
          {officeType === 'president' && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Eleição Nacional · Resolução Tribunal Superior Eleitoral (TSE)</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

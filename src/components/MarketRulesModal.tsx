import React from 'react';
import { X, ShieldCheck, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface MarketRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const MarketRulesModal: React.FC<MarketRulesModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold tracking-tight">
              Regras Contratuais &amp; Metodologia TSE
            </h2>
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

        <div className="mt-4 space-y-4 text-xs sm:text-sm leading-relaxed text-neutral-300">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h3 className="font-semibold text-neutral-100 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Como a Porcentagem é Calculada?
            </h3>
            <p className="text-neutral-400">
              Na Polymarket, cada contrato é negociado entre $0,00 e $1,00 USD. O preço reflete a probabilidade implícita ponderada pelo capital coletivo dos negociadores. Por exemplo, uma cota de $0,572 equivale a 57,2% de chance estimada pelo mercado.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h3 className="font-semibold text-neutral-100 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Fonte Oficial de Liquidação (TSE)
            </h3>
            <p className="text-neutral-400">
              O mercado resolve oficialmente com base no candidato proclamado vencedor da Eleição Presidencial de 2026 pelo <strong>Tribunal Superior Eleitoral (TSE)</strong>, incluindo eventual 2º turno. O link de referência oficial é <a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">dadosabertos.tse.jus.br</a>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h3 className="font-semibold text-neutral-100 mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Garantia Anti-Alucinação de Dados
            </h3>
            <p className="text-neutral-400">
              Este painel consome estritamente as APIs públicas da Polymarket (Gamma API e CLOB API). Nenhuma probabilidade, variação ou estatística é inventada, gerada por modelos de linguagem ou simulada por algoritmos de polling fictícios.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

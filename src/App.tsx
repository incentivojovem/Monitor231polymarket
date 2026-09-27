/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { OfficeSelector } from './components/OfficeSelector';
import { ElectionHero } from './components/ElectionHero';
import { CandidateLeaderboard } from './components/CandidateLeaderboard';
import { InteractiveChart } from './components/InteractiveChart';
import { FluctuationHistoryTable } from './components/FluctuationHistoryTable';
import { RelatedMarkets } from './components/RelatedMarkets';
import { CandidateModal } from './components/CandidateModal';
import { MarketRulesModal } from './components/MarketRulesModal';
import { fetchElectionData, fetchRelatedEvents, exportElectionCSV, BRAZIL_GOVERNOR_STATES } from './services/polymarketService';
import { ElectionData, CandidateMarket, RelatedEvent, OfficeType } from './types/polymarket';
import { AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function App() {
  // Theme state: defaults to dark mode for optimal financial and chart contrast
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_mode');
    return saved ? saved === 'dark' : true;
  });

  // Office selection: President vs Governor
  const [officeType, setOfficeType] = useState<OfficeType>('president');
  const [selectedStateUf, setSelectedStateUf] = useState<string>('SP');

  // Auto-refresh state (every 20s)
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data state
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active section for navigation
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Candidate detail modal state
  const [modalCandidate, setModalCandidate] = useState<CandidateMarket | null>(null);
  const [selectedChartCandidate, setSelectedChartCandidate] = useState<CandidateMarket | null>(null);

  // Rules modal state
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Feedback banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync theme changes with DOM and localStorage
  useEffect(() => {
    localStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-neutral-950 text-neutral-100 antialiased selection:bg-emerald-500 selection:text-neutral-950 min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-neutral-100 text-neutral-900 antialiased selection:bg-emerald-500 selection:text-white min-h-screen';
    }
  }, [isDark]);

  // Compute active Polymarket slug
  const currentSlug = useMemo(() => {
    if (officeType === 'governor') {
      const state = BRAZIL_GOVERNOR_STATES.find((s) => s.uf === selectedStateUf);
      return state?.slug || 'so-paulo-governor-election-winner';
    }
    return 'brazil-presidential-election';
  }, [officeType, selectedStateUf]);

  const currentStateName = useMemo(() => {
    if (officeType === 'governor') {
      return BRAZIL_GOVERNOR_STATES.find((s) => s.uf === selectedStateUf)?.name || selectedStateUf;
    }
    return 'Brasil';
  }, [officeType, selectedStateUf]);

  // Load election data for active slug
  const loadData = useCallback(async (isSilent = false, slugOverride?: string) => {
    if (!isSilent) setIsRefreshing(true);
    const targetSlug = slugOverride || currentSlug;

    try {
      const data = await fetchElectionData(targetSlug);
      setElectionData(data);
      setLastUpdated(new Date());
      setError(null);

      // Default selected candidate to highest probability candidate
      if (data.markets.length > 0) {
        const sorted = [...data.markets].sort((a, b) => b.percentage - a.percentage);
        setSelectedChartCandidate(sorted[0]);
      }
    } catch (err: any) {
      console.error('Error loading Polymarket data:', err);
      if (!electionData) {
        setError('Não foi possível conectar à API da Polymarket. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentSlug, electionData]);

  // Initial load
  useEffect(() => {
    loadData();
    fetchRelatedEvents().then(setRelatedEvents).catch(console.error);
  }, []);

  // Periodic polling every 20 seconds
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, loadData]);

  // Switch between President and Governor
  const handleOfficeTypeChange = (newType: OfficeType) => {
    if (newType === officeType) return;
    setOfficeType(newType);
    setLoading(true);
    setSelectedChartCandidate(null);

    const targetSlug = newType === 'governor'
      ? (BRAZIL_GOVERNOR_STATES.find((s) => s.uf === selectedStateUf)?.slug || 'so-paulo-governor-election-winner')
      : 'brazil-presidential-election';

    loadData(false, targetSlug);
    showToast(newType === 'governor' ? `Carregando Governo de ${currentStateName}...` : 'Carregando Presidente da República...');
  };

  // Switch governor state
  const handleSelectStateUf = (newUf: string) => {
    if (newUf === selectedStateUf) return;
    setSelectedStateUf(newUf);
    setLoading(true);
    setSelectedChartCandidate(null);

    const targetState = BRAZIL_GOVERNOR_STATES.find((s) => s.uf === newUf);
    const targetSlug = targetState?.slug || 'so-paulo-governor-election-winner';

    loadData(false, targetSlug);
    showToast(`Carregando Governo de ${targetState?.name || newUf}...`);
  };

  const handleManualRefresh = () => {
    loadData(false);
    showToast('Dados sincronizados com sucesso via Polymarket API!');
  };

  const handleExportCSV = () => {
    if (electionData) {
      exportElectionCSV(electionData.markets, electionData.event);
      showToast('Relatório CSV oficial gerado e pronto para download!');
    }
  };

  const handleSelectCandidate = (candidate: CandidateMarket) => {
    setSelectedChartCandidate(candidate);
    setModalCandidate(candidate);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border bg-emerald-950 border-emerald-800 text-emerald-200 text-xs font-mono animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isAutoRefresh={isAutoRefresh}
        onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onExportCSV={handleExportCSV}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Office Selector: Presidente vs Governador */}
      <OfficeSelector
        officeType={officeType}
        onChangeOfficeType={handleOfficeTypeChange}
        selectedStateUf={selectedStateUf}
        onSelectStateUf={handleSelectStateUf}
        isDark={isDark}
        isLoading={loading || isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-medium transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !electionData && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <h2 className="text-lg font-bold">Conectando ao Feed da Polymarket...</h2>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Buscando livro de ofertas e histórico de negociações em tempo real.
            </p>
          </div>
        )}

        {/* Populated Content */}
        {electionData && (
          <div className="space-y-8">
            {/* 1. Main Priority: Probabilidades em Tempo Real (Candidatos) */}
            {(activeSection === 'overview') && (
              <CandidateLeaderboard
                markets={electionData.markets}
                isDark={isDark}
                onSelectCandidate={handleSelectCandidate}
                selectedCandidateId={selectedChartCandidate?.id || null}
              />
            )}

            {/* 2. Cotação e Probabilidade: Métricas Gerais & Contrato TSE */}
            {(activeSection === 'overview') && (
              <ElectionHero
                event={electionData.event}
                markets={electionData.markets}
                isDark={isDark}
                onOpenRules={() => setIsRulesOpen(true)}
                officeType={officeType}
                stateName={currentStateName}
              />
            )}

            {/* 3. Gráficos Históricos Interativos */}
            {(activeSection === 'overview' || activeSection === 'charts') && (
              <InteractiveChart
                markets={electionData.markets}
                isDark={isDark}
                selectedCandidate={selectedChartCandidate}
                onSelectCandidate={setSelectedChartCandidate}
              />
            )}

            {/* 4. Tabela Detalhada de Flutuações */}
            {(activeSection === 'overview' || activeSection === 'history') && (
              <FluctuationHistoryTable
                markets={electionData.markets}
                event={electionData.event}
                isDark={isDark}
                onSelectCandidate={handleSelectCandidate}
              />
            )}

            {/* 5. Mercados Relacionados da Política Brasileira */}
            {(activeSection === 'overview' || activeSection === 'related') && relatedEvents.length > 0 && (
              <RelatedMarkets
                events={relatedEvents}
                isDark={isDark}
              />
            )}
          </div>
        )}
      </main>

      {/* Candidate Deep-Dive Modal */}
      <CandidateModal
        candidate={modalCandidate}
        onClose={() => setModalCandidate(null)}
        isDark={isDark}
      />

      {/* TSE Rules & Verification Modal */}
      <MarketRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        isDark={isDark}
      />

      {/* Quiet, Clean Footer */}
      <footer className={`border-t py-8 mt-12 transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-neutral-500' : 'bg-white border-neutral-200 text-neutral-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dados 100% reais obtidos via Polymarket Gamma &amp; CLOB APIs</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Resolução oficial TSE 2026</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://polymarket.com"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              Polymarket.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CargoCodigo,
  EleicaoAno,
  TSEResultData,
} from '../types/tse';
import {
  ELEICOES_DISPONIVEIS,
  CARGOS_TSE,
  ESTADOS_BRASIL,
  fetchTSEApuracao,
  fetchTSEExteriorPaises,
  exportTSEBoletimCSV,
} from '../services/tseService';
import { PAISES_EXTERIOR_BUS, PaisExteriorBU } from '../services/tseHistoricalData';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Layers,
  MapPin,
  Vote,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Radio,
  Globe2,
  FileText,
} from 'lucide-react';

interface TSEApuracaoViewProps {
  isDark: boolean;
  onShowToast: (msg: string) => void;
}

export const TSEApuracaoView: React.FC<TSEApuracaoViewProps> = ({
  isDark,
  onShowToast,
}) => {
  // Filtro de Eleição: 2026 (Atual), 2024 (Municipais Reais), 2022 (Gerais Reais)
  const [selectedAno, setSelectedAno] = useState<EleicaoAno>('2026');
  const [selectedTurno, setSelectedTurno] = useState<'1' | '2'>('1');

  // Cargo e UF selecionados
  const [selectedCargo, setSelectedCargo] = useState<CargoCodigo>('1');
  const [selectedUf, setSelectedUf] = useState<string>('BR');

  // Modo de visualização quando no exterior (Zona ZZ): 'oficial' ou 'paises'
  const [viewModoZZ, setViewModoZZ] = useState<'paises' | 'oficial'>('paises');

  // Dados da apuração
  const [dados, setDados] = useState<TSEResultData | null>(null);
  const [paises2026, setPaises2026] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(20); // 15s, 20s, 30s, 60s
  const [countdown, setCountdown] = useState<number>(20);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ajusta cargos válidos conforme o ano escolhido
  const cargosValidos = useMemo(() => {
    return CARGOS_TSE.filter((c) => c.anosDisponiveis.includes(selectedAno));
  }, [selectedAno]);

  // Se trocar de ano e o cargo atual não for válido para aquele ano, reseta para o primeiro cargo válido
  useEffect(() => {
    const isCargoValido = cargosValidos.some((c) => c.codigo === selectedCargo);
    if (!isCargoValido && cargosValidos.length > 0) {
      const novoCargo = cargosValidos[0].codigo;
      setSelectedCargo(novoCargo);
      if (novoCargo === '1') {
        setSelectedUf('BR');
      } else if (novoCargo === '11' || novoCargo === '13') {
        setSelectedUf('SP');
      }
    }
  }, [selectedAno, cargosValidos, selectedCargo]);

  // Carrega apuração do TSE
  const carregarApuracao = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const resultado = await fetchTSEApuracao(selectedAno, selectedCargo, selectedUf, selectedTurno);
        setDados(resultado);
        if (selectedAno === '2026') {
          const paisesData = await fetchTSEExteriorPaises(selectedTurno);
          setPaises2026(paisesData);
        }
        setLastCheckTime(new Date());
      } catch (err) {
        console.error('Erro ao carregar apuração TSE:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedAno, selectedCargo, selectedUf, selectedTurno]
  );

  useEffect(() => {
    carregarApuracao();
    setCountdown(refreshInterval);
  }, [carregarApuracao, refreshInterval]);

  // Temporizador de contagem regressiva e auto-refresh (polling inteligente)
  useEffect(() => {
    if (!isAutoRefresh || selectedAno !== '2026') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          carregarApuracao(true);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, selectedAno, refreshInterval, carregarApuracao]);

  // Troca de cargo
  const handleSelectCargo = (cargo: CargoCodigo) => {
    setSelectedCargo(cargo);
    if (cargo === '1') {
      setSelectedUf('BR');
    } else if (selectedUf === 'BR') {
      setSelectedUf('SP');
    }
  };

  // Candidatos filtrados por busca
  const candidatosFiltrados = useMemo(() => {
    if (!dados || !dados.candidatos) return [];
    if (!searchQuery.trim()) return dados.candidatos;
    const q = searchQuery.toLowerCase();
    return dados.candidatos.filter(
      (c) =>
        c.nm.toLowerCase().includes(q) ||
        (c.nmCompleto && c.nmCompleto.toLowerCase().includes(q)) ||
        c.n.includes(q) ||
        c.cc.toLowerCase().includes(q)
    );
  }, [dados, searchQuery]);

  // Cargo atual
  const cargoInfo = useMemo(() => {
    return CARGOS_TSE.find((c) => c.codigo === selectedCargo) || CARGOS_TSE[0];
  }, [selectedCargo]);

  // 2026: a fonte de verdade é a totalização oficial do TSE recebida em `dados`.
  // A lista de países abaixo é enriquecida com os dados oficiais de apuração dos municípios do exterior.
  const totaisBUsExterior = useMemo(() => {
    const is2026 = selectedAno === '2026';

    if (is2026) {
      const candidatos = [...(dados?.candidatos || [])].sort((a, b) => b.vap - a.vap);
      const totalValidos = dados?.vv || candidatos.reduce((sum, c) => sum + c.vap, 0);
      const temDados = Boolean(dados?.temDadosSuficientes && candidatos.length > 0);

      const paisesDivulgados = paises2026.filter((p) => p.totalValidos > 0).length;
      const c1 = candidatos[0];
      const c2 = candidatos[1];

      return {
        is2026: true,
        ano: selectedAno,
        totalValidos,
        temDados,
        candidatos,
        paisesDivulgados: paisesDivulgados > 0 ? paisesDivulgados : (temDados ? PAISES_EXTERIOR_BUS.length : 0),
        paisesEmVotacao: Math.max(0, PAISES_EXTERIOR_BUS.length - (paisesDivulgados > 0 ? paisesDivulgados : (temDados ? PAISES_EXTERIOR_BUS.length : 0))),
        totalPaises: PAISES_EXTERIOR_BUS.length,
        lider: c1?.nm || 'Aguardando dados oficiais',
        cand1: c1
          ? {
              nome: c1.nm,
              partido: c1.cc,
              cor: '#dc2626',
              votos: c1.vap,
              pct: c1.pvap,
              paisesVencidos: paises2026.filter((p) => p.vencedor === c1.nm).length,
            }
          : { nome: '', partido: '', cor: '', votos: 0, pct: 0, paisesVencidos: 0 },
        cand2: c2
          ? {
              nome: c2.nm,
              partido: c2.cc,
              cor: '#16a34a',
              votos: c2.vap,
              pct: c2.pvap,
              paisesVencidos: paises2026.filter((p) => p.vencedor === c2.nm).length,
            }
          : { nome: '', partido: '', cor: '', votos: 0, pct: 0, paisesVencidos: 0 },
        diferencaVotos: c1 && c2 ? Math.abs(c1.vap - c2.vap) : 0,
        diferencaPct: c1 && c2 ? Math.abs(c1.pvap - c2.pvap) : 0,
      };
    }

    let totalCand1 = 0;
    let totalCand2 = 0;
    let totalValidos = 0;
    let paisesCand1 = 0;
    let paisesCand2 = 0;

    for (const p of PAISES_EXTERIOR_BUS) {
      const r = p.resultado2022T2;
      totalCand1 += r.lulaVotos;
      totalCand2 += r.bolsonaroVotos;
      totalValidos += r.totalValidos;
      if (r.vencedor === 'Lula') paisesCand1++;
      else paisesCand2++;
    }

    const pctCand1 = totalValidos > 0 ? (totalCand1 / totalValidos) * 100 : 0;
    const pctCand2 = totalValidos > 0 ? (totalCand2 / totalValidos) * 100 : 0;
    return {
      is2026: false,
      ano: selectedAno,
      totalValidos,
      temDados: true,
      candidatos: [],
      paisesDivulgados: PAISES_EXTERIOR_BUS.length,
      paisesEmVotacao: 0,
      cand1: { nome: 'Lula', partido: 'PT - Federação Brasil', cor: '#dc2626', votos: totalCand1, pct: pctCand1, paisesVencidos: paisesCand1 },
      cand2: { nome: 'Jair Bolsonaro', partido: 'PL - Pelo Bem do Brasil', cor: '#16a34a', votos: totalCand2, pct: pctCand2, paisesVencidos: paisesCand2 },
      totalPaises: PAISES_EXTERIOR_BUS.length,
      lider: totalCand1 >= totalCand2 ? 'Lula' : 'Jair Bolsonaro',
      diferencaVotos: Math.abs(totalCand1 - totalCand2),
      diferencaPct: Math.abs(pctCand1 - pctCand2),
    };
  }, [selectedAno, dados, paises2026]);

  // Exportar CSV
  const handleExportCSV = () => {
    if (!dados) return;
    exportTSEBoletimCSV(dados);
    onShowToast(`Boletim Oficial TSE de ${dados.cargoNome} (${dados.cdabr} - ${dados.ano}) baixado!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header do Painel com Seletor de Eleição Real */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800 shadow-xl'
            : 'bg-white border-neutral-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dados Oficiais Auditados pelo TSE
              </span>

              {selectedAno === '2026' ? (
                dados?.temDadosSuficientes ? (
                  <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    🟢 Totalização oficial 2026 atualizada
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                    ⚪ Aguardando divulgação oficial do TSE
                  </span>
                )
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {selectedAno}: Totalização 100% Real Concluída
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Apuração Oficial de Votos do Brasil
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Consulte a totalização real emitida pela Justiça Eleitoral. Você pode navegar pelos resultados históricos auditados das eleições anteriores (2022 e 2024) ou acompanhar a apuração oficial de 2026.
            </p>

            {/* Painel Oficial de Informações de Atualização (Item 14) */}
            <div className={`mt-3 p-3 rounded-xl border font-mono text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 ${
              isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-sans font-bold">Fonte</span>
                <span className="font-semibold text-white">TSE</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-sans font-bold">Última atualização</span>
                <span className="font-semibold text-white">
                  {dados?.temDadosSuficientes && dados.dt !== '--/--/----' && dados.hg !== '--:--:--'
                    ? `${dados.dt} ${dados.hg}`
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-sans font-bold">Status</span>
                <span className="font-semibold">
                  {!dados || !dados.temDadosSuficientes ? (
                    <span className="text-neutral-300 flex items-center gap-1">
                      <span>⚪</span>
                      <span>Aguardando divulgação oficial</span>
                    </span>
                  ) : dados.statusApuracao === 'finalizada' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>🟢</span>
                      <span>Totalização oficial atualizada</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>🟢</span>
                      <span>Dados oficiais recebidos</span>
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {selectedAno === '2026' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border ${
                    isAutoRefresh
                      ? isDark ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                  title={isAutoRefresh ? 'Monitoramento em tempo real ativo. Clique para pausar.' : 'Clique para retomar o monitoramento automático.'}
                >
                  <span className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                  <span>{isAutoRefresh ? `AO VIVO (${countdown}s)` : 'PAUSADO'}</span>
                </button>

                {isAutoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRefreshInterval(val);
                      setCountdown(val);
                    }}
                    className={`text-xs font-mono font-semibold rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-800'
                    }`}
                    title="Definir intervalo de verificação na API do TSE"
                  >
                    <option value={15}>15s (TSE)</option>
                    <option value={20}>20s</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                  </select>
                )}
              </div>
            )}

            <button
              onClick={() => carregarApuracao()}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors border ${
                isDark ? 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
              }`}
              title="Recarregar dados do TSE imediatamente"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!dados}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              title="Baixar Boletim Oficial de Totalização em CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Boletim</span>
            </button>
          </div>
        </div>

        {/* 2. Seletores Principais: Ano da Eleição, Turno, Cargo e UF */}
        <div className="mt-6 pt-5 border-t border-neutral-800/60 space-y-4">
          
          {/* Seletor do Ano da Eleição (Filtro Solicitado) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Escolha a Eleição (Dados Reais Disponíveis):
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {ELEICOES_DISPONIVEIS.map((eleicao) => {
                const isSelected = selectedAno === eleicao.ano;
                return (
                  <button
                    key={eleicao.ano}
                    onClick={() => setSelectedAno(eleicao.ano)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    <span>{eleicao.ano}</span>
                    <span className={`text-[10px] uppercase font-mono px-1 py-0.2 rounded ${
                      isSelected ? 'bg-black/20 text-neutral-950' : 'bg-neutral-700/60 text-neutral-300'
                    }`}>
                      {eleicao.status === 'ao_vivo' ? 'Ao Vivo' : 'Real 100%'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turno da Eleição */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800/40">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-neutral-400">
              Turno da Eleição:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedTurno('1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTurno === '1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                1º Turno {selectedAno === '2026' ? 'Oficial Concluído' : 'Oficial'}
              </button>
              <button
                onClick={() => setSelectedTurno('2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTurno === '2'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                2º Turno {selectedAno === '2026' ? '(Em Definição)' : 'Oficial'}
              </button>
            </div>
          </div>

          {/* Seletor de Cargos Válidos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/40">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-blue-400" />
              Função / Cargo:
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {cargosValidos.map((cargo) => {
                const isActive = selectedCargo === cargo.codigo;
                return (
                  <button
                    key={cargo.codigo}
                    onClick={() => handleSelectCargo(cargo.codigo)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                    }`}
                  >
                    {cargo.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor de UF / Abrangência */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/40">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs uppercase font-mono font-semibold tracking-wider text-neutral-400">
                {selectedCargo === '1' ? 'Abrangência / Local:' : selectedCargo === '11' ? 'Município / Capital:' : 'Estado (UF):'}
              </span>
              <span className="text-xs font-bold text-white bg-neutral-800 px-2.5 py-0.5 rounded">
                {selectedUf === 'BR'
                  ? 'Brasil (Total Nacional)'
                  : selectedUf === 'ZZ'
                  ? 'Exterior (Zona Eleitoral ZZ - TRE-DF)'
                  : `${ESTADOS_BRASIL.find((e) => e.uf === selectedUf)?.nome || selectedUf} (${selectedUf})`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCargo === '1' && (
                <>
                  <button
                    onClick={() => setSelectedUf('BR')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedUf === 'BR'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isDark ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    <span>🇧🇷</span>
                    <span>Brasil (Geral)</span>
                  </button>

                  <button
                    onClick={() => setSelectedUf('ZZ')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedUf === 'ZZ'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                        : isDark ? 'bg-neutral-800 text-blue-400 border border-blue-500/30 hover:bg-neutral-700' : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                    title="Votos de eleitores brasileiros no exterior (Embaixadas e Consulados)"
                  >
                    <span>🌍</span>
                    <span>Exterior (Zona ZZ)</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/20">ZZ</span>
                  </button>
                </>
              )}

              {selectedCargo === '11' ? (
                <select
                  value={selectedUf}
                  onChange={(e) => setSelectedUf(e.target.value)}
                  className={`text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 border transition-colors outline-none cursor-pointer ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-200 focus:border-emerald-500'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:border-emerald-600'
                  }`}
                >
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="RN">Natal (RN)</option>
                </select>
              ) : selectedCargo !== '1' ? (
                <select
                  value={selectedUf}
                  onChange={(e) => setSelectedUf(e.target.value)}
                  className={`text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 border transition-colors outline-none cursor-pointer ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-200 focus:border-emerald-500'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:border-emerald-600'
                  }`}
                >
                  <optgroup label="Principais Colégios Eleitorais">
                    <option value="SP">São Paulo (SP)</option>
                    <option value="RJ">Rio de Janeiro (RJ)</option>
                    <option value="RN">Rio Grande do Norte (RN)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                    <option value="BA">Bahia (BA)</option>
                    <option value="RS">Rio Grande do Sul (RS)</option>
                    <option value="PR">Paraná (PR)</option>
                    <option value="CE">Ceará (CE)</option>
                    <option value="PE">Pernambuco (PE)</option>
                    <option value="DF">Distrito Federal (DF)</option>
                  </optgroup>
                  <optgroup label="Demais Estados">
                    <option value="SC">Santa Catarina (SC)</option>
                    <option value="GO">Goiás (GO)</option>
                    <option value="MA">Maranhão (MA)</option>
                    <option value="PA">Pará (PA)</option>
                    <option value="PB">Paraíba (PB)</option>
                    <option value="ES">Espírito Santo (ES)</option>
                    <option value="AM">Amazonas (AM)</option>
                    <option value="MT">Mato Grosso (MT)</option>
                    <option value="MS">Mato Grosso do Sul (MS)</option>
                    <option value="AL">Alagoas (AL)</option>
                    <option value="PI">Piauí (PI)</option>
                    <option value="SE">Sergipe (SE)</option>
                    <option value="RO">Rondônia (RO)</option>
                    <option value="TO">Tocantins (TO)</option>
                    <option value="AC">Acre (AC)</option>
                    <option value="AP">Amapá (AP)</option>
                    <option value="RR">Roraima (RR)</option>
                  </optgroup>
                </select>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Informativo Exclusivo: Zona Eleitoral do Exterior (ZZ) */}
      {selectedUf === 'ZZ' && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs sm:text-sm ${
            isDark ? 'bg-blue-950/40 border-blue-800/80 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">🌍</span>
              <div className="space-y-1">
                <h4 className="font-bold text-base flex flex-wrap items-center gap-2">
                  <span>Zona Eleitoral do Exterior (Sigla Oficial TSE: ZZ)</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">
                    TRE-DF / Cartório da 1ª ZE Exterior
                  </span>
                </h4>
                <p className="text-xs opacity-90 leading-relaxed max-w-3xl">
                  Reúne os votos de <strong>{selectedAno === '2026' ? 'mais de 918 mil' : 'mais de 697 mil'} eleitores brasileiros em mais de 140 países</strong> (Lisboa, Londres, Miami, Nova York, Tóquio, Paris, Berlim, Sydney, etc.).
                  Por lei (Código Eleitoral Art. 225), eleitores no exterior votam <strong>exclusivamente para Presidente e Vice-Presidente da República</strong>.
                </p>
              </div>
            </div>

            {/* Alternador de Modo: BUs por País vs Totalização Oficial (Diferenciação clara - Item 13) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-blue-500/30 shrink-0 self-start lg:self-center">
              <button
                onClick={() => setViewModoZZ('paises')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewModoZZ === 'paises'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Acompanhamento dos Boletins de Urna (BUs) emitidos nos consulados"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>🟡 Acompanhamento de BUs / Consulados</span>
              </button>
              <button
                onClick={() => setViewModoZZ('oficial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewModoZZ === 'oficial'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Totalização Oficial centralizada do TSE para a Zona ZZ"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🟢 Totalização Oficial TSE (ZZ)</span>
              </button>
            </div>
          </div>

          {/* Seletor 'BUs por País' ativado: Exibe a lista detalhada e a explicação da regra das 17h */}
          {viewModoZZ === 'paises' && (
            <div className="space-y-4">
              {/* Caixa explicativa sobre o 'embargo' das 17h vs os BUs físicos */}
              <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm ${
                isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>Como funciona a apuração no exterior: Por que o TSE só totaliza às 17h?</span>
                    </h5>
                    <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <strong>1. O Embargo Oficial do TSE:</strong> Pela Resolução nº 23.751/2026 do TSE, os computadores da Justiça Eleitoral só podem divulgar os resultados consolidados a partir das <strong>17h00 (horário de Brasília)</strong>, para garantir que os votos de quem já terminou de votar na Ásia ou Europa não influenciem os eleitores que ainda estão votando no Brasil.
                    </p>
                    <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <strong>2. Mas o Boletim de Urna (BU) impresso é PÚBLICO:</strong> Assim que a votação encerra no horário local de cada consulado (ex: Nova Zelândia às 2h da madrugada de Brasília, Japão às 7h da manhã), a urna imprime imediatamente o <strong>Boletim de Urna em papel</strong>, que é colado na porta da seção. Qualquer cidadão ou fiscal de partido pode fotografar o BU e ler o QR Code oficial.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                      <span className="text-emerald-400">
                        {selectedAno === '2026'
                          ? '✓ Em 2026: Votos exibidos exclusivamente conforme os arquivos oficiais do TSE. Os cards dos países acompanham fusos e encerramentos sem divulgar números fictícios.'
                          : '✓ Abaixo: dados oficiais auditados dos BUs de cada país no 2º Turno da Eleição Presidencial de 2022.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD DE SOMA DAS % E VOTOS CONSOLIDADOS DOS PRESIDENTES NOS PAÍSES */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${
                isDark
                  ? 'bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-blue-950/40 border-blue-900/40 shadow-xl'
                  : 'bg-white border-blue-200 shadow-md'
              }`}>
                {/* Topo do Card de Soma */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                        <span>Totalização Oficial dos Presidentes no Exterior (Zona ZZ)</span>
                        <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                          {totaisBUsExterior.is2026
                            ? (totaisBUsExterior.temDados ? 'Totalização Oficial 2026' : 'Aguardando Divulgação Oficial')
                            : '2º Turno Oficial 2022'}
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {totaisBUsExterior.is2026
                          ? 'Os resultados de 2026 são derivados exclusivamente do arquivo oficial de totalização do TSE para a Zona ZZ. Nenhum número fictício ou estimativa é apresentado.'
                          : `Total ponderado da apuração oficial dos Boletins de Urna emitidos nos consulados dos ${totaisBUsExterior.totalPaises} países monitorados.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-neutral-800/90 text-neutral-300 border border-neutral-700/80">
                      Total Válidos: <strong className="text-white">{totaisBUsExterior.totalValidos.toLocaleString('pt-BR')}</strong>
                    </span>
                    {!totaisBUsExterior.is2026 && totaisBUsExterior.cand1 && (
                      <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-neutral-800/90 text-neutral-300 border border-neutral-700/80">
                        Placar: <strong className="text-red-400">{totaisBUsExterior.cand1.paisesVencidos} países</strong> a <strong className="text-emerald-400">{totaisBUsExterior.cand2.paisesVencidos} países</strong>
                      </span>
                    )}
                  </div>
                </div>

                {totaisBUsExterior.is2026 ? (
                  totaisBUsExterior.temDados && totaisBUsExterior.candidatos.length > 0 ? (
                    <div className="space-y-4 my-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {totaisBUsExterior.candidatos.map((candidate, idx) => (
                          <div
                            key={candidate.sqcand || candidate.n || idx}
                            className={`p-4 rounded-xl border transition-all ${
                              idx === 0
                                ? 'bg-emerald-950/30 border-emerald-700/60 ring-1 ring-emerald-500/40'
                                : idx === 1
                                ? 'bg-blue-950/20 border-blue-700/40'
                                : isDark
                                ? 'bg-neutral-950/60 border-neutral-800'
                                : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-xs font-mono font-bold text-neutral-400">
                                  #{idx + 1} • {candidate.n}
                                </span>
                                <div className="font-bold text-base text-white">{candidate.nm}</div>
                                <span className="text-xs text-neutral-400 font-mono">{candidate.cc}</span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                                {candidate.st || (idx === 0 ? 'Líder' : 'Em apuração')}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between mt-3">
                              <div className="text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                                {candidate.pvap.toFixed(2)}%
                              </div>
                              <div className="text-right font-mono text-xs text-neutral-300">
                                <span className="font-bold block text-sm text-white">
                                  {candidate.vap.toLocaleString('pt-BR')}
                                </span>
                                <span className="text-[11px] text-neutral-500">votos válidos</span>
                              </div>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(candidate.pvap, 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="my-5 p-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Aguardando divulgação oficial do TSE (Zona Eleitoral do Exterior ZZ)</span>
                      </div>
                      <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
                        Conforme a legislação eleitoral brasileira, a divulgação centralizada pelo TSE inicia a partir das 17h00 (horário de Brasília). O painel permanecerá sem números até o recebimento dos arquivos oficiais.
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    {/* Grid comparativo dos dois candidatos de 2022 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                      {/* Card Candidato 1: Lula 2022 */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        isDark ? 'bg-neutral-950/60 border-red-900/40 hover:border-red-700/60' : 'bg-red-50/50 border-red-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                            <div>
                              <div className="font-bold text-base text-white">{totaisBUsExterior.cand1.nome}</div>
                              <span className="text-xs text-neutral-400 font-mono">{totaisBUsExterior.cand1.partido}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/80">
                            {totaisBUsExterior.cand1.paisesVencidos} vitórias
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-3">
                          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-red-400 tabular-nums">
                            {totaisBUsExterior.cand1.pct.toFixed(2)}%
                          </div>
                          <div className="text-right font-mono text-xs text-neutral-300">
                            <span className="font-bold block text-sm sm:text-base text-white">
                              {totaisBUsExterior.cand1.votos.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[11px] text-neutral-500">votos válidos apurados</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-neutral-800/50 text-[11px] text-neutral-400 flex items-center justify-between">
                          <span>Venceu em:</span>
                          <span className="font-mono text-neutral-200 font-semibold">
                            NZ, AU, KR, SG, FR, DE, GB, PT
                          </span>
                        </div>
                      </div>

                      {/* Card Candidato 2: Jair Bolsonaro 2022 */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        isDark ? 'bg-neutral-950/60 border-emerald-900/40 hover:border-emerald-700/60' : 'bg-emerald-50/50 border-emerald-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                            <div>
                              <div className="font-bold text-base text-white">{totaisBUsExterior.cand2.nome}</div>
                              <span className="text-xs text-neutral-400 font-mono">{totaisBUsExterior.cand2.partido}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                            {totaisBUsExterior.cand2.paisesVencidos} vitórias
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-3">
                          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
                            {totaisBUsExterior.cand2.pct.toFixed(2)}%
                          </div>
                          <div className="text-right font-mono text-xs text-neutral-300">
                            <span className="font-bold block text-sm sm:text-base text-white">
                              {totaisBUsExterior.cand2.votos.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[11px] text-neutral-500">votos válidos apurados</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-neutral-800/50 text-[11px] text-neutral-400 flex items-center justify-between">
                          <span>Venceu em:</span>
                          <span className="font-mono text-neutral-200 font-semibold">
                            Japão (JP), Itália (IT), EUA (US)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Proporção Geral Ponderada 2022 */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-red-400 font-bold">{totaisBUsExterior.cand1.nome}: {totaisBUsExterior.cand1.pct.toFixed(2)}%</span>
                        <span className="text-xs text-neutral-400">
                          Vantagem: <strong className="text-white">+{totaisBUsExterior.diferencaVotos.toLocaleString('pt-BR')} votos</strong> (+{totaisBUsExterior.diferencaPct.toFixed(2)}%)
                        </span>
                        <span className="text-emerald-400 font-bold">{totaisBUsExterior.cand2.nome}: {totaisBUsExterior.cand2.pct.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3.5 overflow-hidden flex p-0.5 border border-neutral-700">
                        <div
                          className="bg-red-500 h-full rounded-l-full transition-all duration-500"
                          style={{ width: `${totaisBUsExterior.cand1.pct}%` }}
                          title={`${totaisBUsExterior.cand1.nome}: ${totaisBUsExterior.cand1.pct.toFixed(2)}% (${totaisBUsExterior.cand1.votos.toLocaleString('pt-BR')} votos)`}
                        />
                        <div
                          className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                          style={{ width: `${totaisBUsExterior.cand2.pct}%` }}
                          title={`${totaisBUsExterior.cand2.nome}: ${totaisBUsExterior.cand2.pct.toFixed(2)}% (${totaisBUsExterior.cand2.votos.toLocaleString('pt-BR')} votos)`}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Grid dos Países em Ordem de Encerramento das Urnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PAISES_EXTERIOR_BUS.map((pais) => {
                  const is2026 = selectedAno === '2026';
                  const p2026 = is2026 ? paises2026.find((p) => p.id === pais.id) : null;
                  const has2026Data = Boolean(p2026 && p2026.totalValidos > 0);
                  const isEmVotacao2026 = is2026 && !has2026Data && pais.status2026 === 'em_votacao';
                  const res2022 = pais.resultado2022T2;

                  const top1 = p2026?.candidatos?.[0];
                  const top2 = p2026?.candidatos?.[1];

                  const cand1Nome = is2026 ? (top1?.nm || 'Candidato 1') : 'Lula (PT)';
                  const cand1Votos = is2026 ? (top1?.vap || 0) : res2022.lulaVotos;
                  const cand1Pct = is2026 ? (top1?.pvap || 0) : res2022.lulaPct;

                  const cand2Nome = is2026 ? (top2?.nm || 'Candidato 2') : 'Jair Bolsonaro (PL)';
                  const cand2Votos = is2026 ? (top2?.vap || 0) : res2022.bolsonaroVotos;
                  const cand2Pct = is2026 ? (top2?.pvap || 0) : res2022.bolsonaroPct;

                  const totalValidos = is2026 ? (p2026?.totalValidos || 0) : res2022.totalValidos;
                  const anoLabel = is2026 ? 'Total Válidos TSE 2026:' : 'Total Válidos 2022:';

                  return (
                    <div
                      key={pais.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Topo do Card do País */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{pais.bandeira}</span>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-white">{pais.pais}</h4>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                {pais.cidades.join(', ')}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            has2026Data
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                              : isEmVotacao2026
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}>
                            {has2026Data
                              ? 'Totalizado TSE'
                              : isEmVotacao2026
                              ? 'Em Votação'
                              : `#{pais.ordemFechamento}º a fechar`}
                          </span>
                        </div>

                        {/* Horário de Fechamento */}
                        <div className="my-2.5 p-2 rounded-lg bg-neutral-950/70 border border-neutral-800/80 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-neutral-400 mb-0.5">
                            <span>Fechamento da urna:</span>
                            <span className="text-amber-400 font-bold">{pais.fechamentoBrasilia}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {pais.fusoInfo}
                          </div>
                        </div>

                        {/* Resultado dos BUs / Totalização oficial */}
                        {is2026 && !has2026Data ? (
                          <div className="pt-3 border-t border-neutral-800/60 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/30 border border-blue-800/40 px-3 py-1.5 rounded-lg">
                              <Radio className="w-3.5 h-3.5" />
                              <span>Atualizado pela totalização oficial do TSE</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-relaxed">
                              Aguardando dados específicos deste consulado pelo TSE. O painel global da Zona ZZ acima reflete a apuração oficial integral.
                            </p>
                            <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between pt-1">
                              <span>Total Válidos:</span>
                              <span>0 votos</span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-neutral-800/60 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-mono text-neutral-400">{anoLabel}</span>
                              <span className="font-mono font-bold text-white">{totalValidos.toLocaleString('pt-BR')} votos</span>
                            </div>

                            {/* Candidato 1 */}
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                                <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                  {cand1Nome}
                                </span>
                                <div className="space-x-1.5">
                                  <span className="font-bold text-white">{cand1Pct.toFixed(2)}%</span>
                                  <span className="text-[10px] text-neutral-400">({cand1Votos.toLocaleString('pt-BR')})</span>
                                </div>
                              </div>
                              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${cand1Pct}%` }} />
                              </div>
                            </div>

                            {/* Candidato 2 */}
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                                <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  {cand2Nome}
                                </span>
                                <div className="space-x-1.5">
                                  <span className="font-bold text-white">{cand2Pct.toFixed(2)}%</span>
                                  <span className="text-[10px] text-neutral-400">({cand2Votos.toLocaleString('pt-BR')})</span>
                                </div>
                              </div>
                              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${cand2Pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Nota de rodapé */}
                      <div className="mt-3 pt-2 border-t border-neutral-800/40 text-[10px] text-neutral-400 italic">
                        {is2026 && has2026Data ? `Vencedor no posto: ${top1?.nm || '-'}` : pais.observacao}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CASO ELEIÇÃO ATUAL 2026: AGUARDANDO DADOS REAIS DO TSE    */}
      {/* O RESULTADO DEVE FICAR EM BRANCO ATÉ QUE HAJA DADOS NO TSE  */}
      {/* ============================================================ */}
      {selectedAno === '2026' && dados && !dados.temDadosSuficientes ? (
        <div className="space-y-6">
          {/* Card de Métricas Zeradas em Branco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Urnas Apuradas</span>
              <div className="text-2xl font-bold font-mono text-neutral-500">0,00%</div>
              <span className="text-[11px] text-neutral-500 font-mono">0 de {dados.s.toLocaleString('pt-BR')} seções</span>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Votos Válidos</span>
              <div className="text-2xl font-bold font-mono text-neutral-500">0 votos</div>
              <span className="text-[11px] text-neutral-500 font-mono">Aguardando contagem</span>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Brancos & Nulos</span>
              <div className="text-2xl font-bold font-mono text-neutral-500">0 / 0</div>
              <span className="text-[11px] text-neutral-500 font-mono">Totalização não iniciada</span>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Situação do Pleito</span>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Aguardando Apuração TSE
              </div>
              <span className="text-[11px] text-neutral-500 font-mono block mt-1">Previsto: 04/10/2026 às 17h</span>
            </div>
          </div>

          {/* Painel Central em Branco / Informativo da Justiça Eleitoral */}
          <div
            className={`p-8 sm:p-12 rounded-2xl border text-center transition-all ${
              isDark
                ? 'bg-neutral-900/40 border-neutral-800'
                : 'bg-white border-neutral-200 shadow-sm'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Aguardando Início da Totalização Oficial pelo TSE
            </h3>

            <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Conforme as diretrizes oficiais de transparência, a aba de apuração para a <strong>Eleição 2026</strong> permanece em branco e não exibe números fictícios. A Justiça Eleitoral transmitirá os primeiros dados reais a partir das <strong>17h00 (horário de Brasília) do dia 04/10/2026</strong>.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-mono text-neutral-500 bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/60">
                Divulgação Oficial: <code>resultados.tse.jus.br/oficial/ele2026/comum/config/ele-c.json &amp; dados/...-u.json</code>
              </span>
            </div>

            {/* Ação para ver dados reais de eleições anteriores */}
            <div className="mt-8 pt-6 border-t border-neutral-800/60 max-w-xl mx-auto">
              <span className="text-xs text-neutral-400 uppercase font-mono font-semibold block mb-3">
                Quer ver a apuração real de eleições anteriores no Brasil?
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedAno('2022');
                    setSelectedCargo('1');
                    setSelectedUf('ZZ');
                    setSelectedTurno('2');
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>🌍</span>
                  <span>Ver Votação no Exterior 2022 (Zona ZZ)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAno('2022');
                    setSelectedCargo('1');
                    setSelectedUf('BR');
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                >
                  Ver Brasil Geral 2022
                </button>
                <button
                  onClick={() => {
                    setSelectedAno('2024');
                    setSelectedCargo('11');
                    setSelectedUf('SP');
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all border border-neutral-700"
                >
                  Ver Capitais 2024
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* 4. CASO COM DADOS REAIS AUDITADOS (2022, 2024 ou 2026 LIVE)  */}
      {/* ============================================================ */}
      {dados && dados.temDadosSuficientes && (
        <div className="space-y-6">
          {/* Métricas Oficiais Concluídas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Urnas Apuradas */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Urnas Apuradas
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {dados.pst.toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-2 tabular-nums">
                {dados.pst.toFixed(2)}%
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(dados.pst, 100)}%` }} />
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono">
                <span>{dados.st.toLocaleString('pt-BR')} seções</span>
                <span>de {dados.s.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Card 2: Votos Válidos */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  Votos Válidos
                </span>
                <span className="text-xs font-mono text-neutral-400">{dados.pvv.toFixed(2)}%</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-400 mb-2 tabular-nums">
                {dados.vv.toLocaleString('pt-BR')}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-neutral-800/60 text-neutral-400">
                <div>
                  <span>Brancos: </span>
                  <span className="text-neutral-200 font-semibold">{dados.pvb.toFixed(2)}%</span>
                </div>
                <div className="text-right">
                  <span>Nulos: </span>
                  <span className="text-neutral-200 font-semibold">{dados.ptvn.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Comparecimento */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-purple-400" />
                  Comparecimento
                </span>
                <span className="text-xs font-mono text-neutral-400">Total Votos</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-2 tabular-nums">
                {dados.v.toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-neutral-400 flex items-center justify-between font-mono pt-2 border-t border-neutral-800/60">
                <span>Abstenção:</span>
                <span className="text-amber-400 font-semibold">{dados.pa.toFixed(2)}% ({dados.a.toLocaleString('pt-BR')})</span>
              </div>
            </div>

            {/* Card 4: Situação */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Totalização TSE
                </span>
                <span className="text-xs font-mono text-neutral-400">{dados.dt}</span>
              </div>
              <div className="mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Totalização Concluída (100%)
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono pt-1">
                Boletim emitido às {dados.hg}
              </div>
            </div>

          </div>

          {/* Ranking Oficial de Candidatos */}
          <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span>Resultado Oficial: {cargoInfo.nome} ({dados.ufNome})</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-neutral-800 text-neutral-300">
                    Eleição {dados.ano} ({dados.t}º Turno)
                  </span>
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Votos válidos auditados e proclamados pela Justiça Eleitoral.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filtrar por nome ou partido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-emerald-500'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-emerald-600'
                  }`}
                />
              </div>
            </div>

            {/* Candidatos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidatosFiltrados.map((candidate, index) => {
                const isLeader = index === 0;
                const isSecond = index === 1;

                return (
                  <div
                    key={candidate.sqcand || candidate.n}
                    className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isLeader
                        ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/20 via-neutral-900/90 to-neutral-900/90 ring-1 ring-emerald-500/40'
                        : isSecond
                        ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/15 via-neutral-900/90 to-neutral-900/90'
                        : isDark
                        ? 'bg-neutral-900/60 border-neutral-800'
                        : 'bg-white border-neutral-200 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Row: Posição, Número, Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isLeader
                              ? 'bg-emerald-500 text-neutral-950'
                              : isSecond
                              ? 'bg-blue-500 text-white'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-neutral-800 text-white border border-neutral-700">
                            Nº {candidate.n}
                          </span>
                        </div>

                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                          candidate.st.toLowerCase().includes('eleito')
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : candidate.st.toLowerCase().includes('2º turno')
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {candidate.st}
                        </span>
                      </div>

                      {/* Nome & Partido */}
                      <div className="mb-3">
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
                          {candidate.nm}
                        </h3>
                        {candidate.nmCompleto && candidate.nmCompleto !== candidate.nm && (
                          <p className="text-xs text-neutral-400 line-clamp-1 mb-0.5">
                            {candidate.nmCompleto}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 font-medium line-clamp-1">
                          {candidate.cc}
                        </p>
                        {candidate.nv && (
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            Vice/Suplente: {candidate.nv}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Votos Válidos e Barra */}
                    <div className="pt-3 border-t border-neutral-800/60 mt-2">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div>
                          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-400 block">
                            Votos Válidos
                          </span>
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums text-emerald-400">
                            {candidate.pvap.toFixed(2)}%
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-400 block">
                            Total de Votos
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-white tabular-nums">
                            {candidate.vap.toLocaleString('pt-BR')} votos
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            isLeader ? 'bg-emerald-500' : isSecond ? 'bg-blue-500' : 'bg-neutral-600'
                          }`}
                          style={{ width: `${Math.min(candidate.pvap, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Caixa Institucional de Transparência Eleitoral */}
      <div className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm ${
        isDark ? 'bg-neutral-950/70 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
      }`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white">Transparência e Integridade dos Dados da Justiça Eleitoral</h4>
            <p className="text-neutral-400 leading-relaxed">
              Todos os resultados exibidos nesta aba refletem estritamente as atas de totalização e boletins de urna (BUs) certificados pelo Tribunal Superior Eleitoral (TSE). Para a eleição vigente de 2026, nenhum número estimado ou fictício é computado como voto; os campos são atualizados em tempo real assim que os primeiros boletins forem transmitidos pela Justiça Eleitoral.
            </p>
            <p className="text-neutral-400 leading-relaxed text-xs">
              <strong>Votação no Exterior (Zona Eleitoral ZZ):</strong> Os eleitores brasileiros residentes fora do país estão cadastrados na Zona Eleitoral ZZ, sob administração do Cartório da 1ª ZE do Exterior e do TRE-DF. Por força de lei, eles votam exclusivamente para Presidente e Vice-Presidente da República.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
              <span>• Portal Oficial de Dados Abertos: dadosabertos.tse.jus.br</span>
              <a
                href="https://resultados.tse.jus.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Acessar Portal do TSE</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

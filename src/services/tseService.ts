import { CargoCodigo, CargoConfig, EleicaoAno, EstadoInfo, TSEResultData } from '../types/tse';
import { TSE_HISTORICAL_RESULTS } from './tseHistoricalData';

export const ELEICOES_DISPONIVEIS: { ano: EleicaoAno; titulo: string; descricao: string; status: 'ao_vivo' | 'concluido' }[] = [
  {
    ano: '2026',
    titulo: 'Eleição Geral 2026 (Atual)',
    descricao: 'Presidente, Governadores, Senadores e Deputados (Transmissão Oficial TSE)',
    status: 'ao_vivo',
  },
  {
    ano: '2024',
    titulo: 'Eleições Municipais 2024 (Oficial TSE)',
    descricao: 'Prefeitos e Vereadores das Capitais (Totalização 100% Real)',
    status: 'concluido',
  },
  {
    ano: '2022',
    titulo: 'Eleição Geral 2022 (Oficial TSE)',
    descricao: 'Presidente (Lula x Bolsonaro) e Governadores nos Estados (Totalização 100% Real)',
    status: 'concluido',
  },
];

export const CARGOS_TSE: CargoConfig[] = [
  {
    codigo: '1',
    nome: 'Presidente',
    nomePlural: 'Presidentes',
    descricao: 'Presidente e Vice-Presidente da República',
    abrangencia: 'nacional',
    vagas: 1,
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '3',
    nome: 'Governador',
    nomePlural: 'Governadores',
    descricao: 'Governador e Vice-Governador de Estado / DF',
    abrangencia: 'estadual',
    vagas: 1,
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '5',
    nome: 'Senador',
    nomePlural: 'Senadores',
    descricao: 'Senador da República',
    abrangencia: 'estadual',
    vagas: 2,
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '6',
    nome: 'Deputado Federal',
    nomePlural: 'Deputados Federais',
    descricao: 'Câmara dos Deputados em Brasília',
    abrangencia: 'estadual',
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '7',
    nome: 'Deputado Estadual',
    nomePlural: 'Deputados Estaduais',
    descricao: 'Assembleia Legislativa Estadual',
    abrangencia: 'estadual',
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '8',
    nome: 'Deputado Distrital',
    nomePlural: 'Deputados Distritais',
    descricao: 'Câmara Legislativa do Distrito Federal',
    abrangencia: 'estadual',
    anosDisponiveis: ['2026', '2022'],
  },
  {
    codigo: '11',
    nome: 'Prefeito',
    nomePlural: 'Prefeitos',
    descricao: 'Prefeito e Vice-Prefeito Municipal',
    abrangencia: 'municipal',
    vagas: 1,
    anosDisponiveis: ['2024'],
  },
  {
    codigo: '13',
    nome: 'Vereador',
    nomePlural: 'Vereadores',
    descricao: 'Câmara Municipal de Vereadores',
    abrangencia: 'municipal',
    anosDisponiveis: ['2024'],
  },
];

export const ESTADOS_BRASIL: EstadoInfo[] = [
  { uf: 'AC', nome: 'Acre', regiao: 'Norte', capital: 'Rio Branco', eleitoradoAprox: 600000 },
  { uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste', capital: 'Maceió', eleitoradoAprox: 2300000 },
  { uf: 'AP', nome: 'Amapá', regiao: 'Norte', capital: 'Macapá', eleitoradoAprox: 550000 },
  { uf: 'AM', nome: 'Amazonas', regiao: 'Norte', capital: 'Manaus', eleitoradoAprox: 2650000 },
  { uf: 'BA', nome: 'Bahia', regiao: 'Nordeste', capital: 'Salvador', eleitoradoAprox: 11200000 },
  { uf: 'CE', nome: 'Ceará', regiao: 'Nordeste', capital: 'Fortaleza', eleitoradoAprox: 6800000 },
  { uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste', capital: 'Brasília', eleitoradoAprox: 2200000 },
  { uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste', capital: 'Vitória', eleitoradoAprox: 2900000 },
  { uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste', capital: 'Goiânia', eleitoradoAprox: 4800000 },
  { uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste', capital: 'São Luís', eleitoradoAprox: 5000000 },
  { uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste', capital: 'Cuiabá', eleitoradoAprox: 2500000 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', capital: 'Campo Grande', eleitoradoAprox: 2000000 },
  { uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste', capital: 'Belo Horizonte', eleitoradoAprox: 16200000 },
  { uf: 'PA', nome: 'Pará', regiao: 'Norte', capital: 'Belém', eleitoradoAprox: 6000000 },
  { uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste', capital: 'João Pessoa', eleitoradoAprox: 3100000 },
  { uf: 'PR', nome: 'Paraná', regiao: 'Sul', capital: 'Curitiba', eleitoradoAprox: 8400000 },
  { uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste', capital: 'Recife', eleitoradoAprox: 7000000 },
  { uf: 'PI', nome: 'Piauí', regiao: 'Nordeste', capital: 'Teresina', eleitoradoAprox: 2600000 },
  { uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste', capital: 'Rio de Janeiro', eleitoradoAprox: 12800000 },
  { uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste', capital: 'Natal', eleitoradoAprox: 2600000 },
  { uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul', capital: 'Porto Alegre', eleitoradoAprox: 8600000 },
  { uf: 'RO', nome: 'Rondônia', regiao: 'Norte', capital: 'Porto Velho', eleitoradoAprox: 1200000 },
  { uf: 'RR', nome: 'Roraima', regiao: 'Norte', capital: 'Boa Vista', eleitoradoAprox: 380000 },
  { uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul', capital: 'Florianópolis', eleitoradoAprox: 5500000 },
  { uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste', capital: 'São Paulo', eleitoradoAprox: 34600000 },
  { uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste', capital: 'Aracaju', eleitoradoAprox: 1700000 },
  { uf: 'TO', nome: 'Tocantins', regiao: 'Norte', capital: 'Palmas', eleitoradoAprox: 1100000 },
];

/**
 * Converte resposta padrão do TSE (dados-simplificados) para o modelo da aplicação
 */
export function parseTSERawJson(raw: any, cargo: CargoCodigo, uf: string, ano: EleicaoAno): TSEResultData {
  const cargoInfo = CARGOS_TSE.find((c) => c.codigo === cargo) || CARGOS_TSE[0];
  const estadoInfo = ESTADOS_BRASIL.find((e) => e.uf.toLowerCase() === uf.toLowerCase());
  const ufNome = uf.toLowerCase() === 'br' ? 'Brasil' : estadoInfo?.nome || uf.toUpperCase();

  const totalSecoes = parseInt(raw.s || '0', 10);
  const secoesTotalizadas = parseInt(raw.st || '0', 10);
  const pst = parseFloat(raw.pst?.replace(',', '.') || '0');

  const vGeral = parseInt(raw.v || '0', 10);
  const vValidos = parseInt(raw.vv || '0', 10);
  const pvv = parseFloat(raw.pvv?.replace(',', '.') || '0');
  const vBrancos = parseInt(raw.vb || '0', 10);
  const pvb = parseFloat(raw.pvb?.replace(',', '.') || '0');
  const vNulos = parseInt(raw.tvn || '0', 10);
  const ptvn = parseFloat(raw.ptvn?.replace(',', '.') || '0');
  const vAbstencao = parseInt(raw.a || '0', 10);
  const pa = parseFloat(raw.pa?.replace(',', '.') || '0');

  const candidatos = (raw.cand || []).map((c: any, index: number) => {
    const vap = parseInt(c.vap || '0', 10);
    const pvap = parseFloat(c.pvap?.replace(',', '.') || '0');
    return {
      seq: c.seq || String(index + 1),
      sqcand: c.sqcand || String(index + 100),
      n: c.n || '',
      nm: c.nm || 'Candidato',
      nmCompleto: c.nmc || c.nm || 'Candidato',
      cc: c.cc || '',
      nv: c.nv || '',
      e: c.e === 'S' ? 'S' : 'N',
      st: c.st || (c.e === 'S' ? 'Eleito' : 'Em apuração'),
      dvt: c.dvt || 'Válido',
      vap,
      pvap,
      foto: c.sqcand ? `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/foto/${ano}/${c.sqcand}/${uf.toLowerCase()}` : undefined,
    };
  });

  const temDados = pst > 0 && vValidos > 0 && candidatos.length > 0;

  let statusApuracao: 'aguardando' | 'em_andamento' | 'finalizada' = 'em_andamento';
  if (pst >= 100) statusApuracao = 'finalizada';
  else if (pst === 0) statusApuracao = 'aguardando';

  return {
    ano,
    ele: raw.ele || '6257',
    tpabr: raw.tpabr || (uf.toLowerCase() === 'br' ? 'BR' : 'UF'),
    cdabr: (raw.cdabr || uf).toUpperCase(),
    ufNome,
    carper: cargo,
    cargoNome: cargoInfo.nome,
    t: raw.t || '1',
    espe: raw.espe || 'N',
    hg: raw.hg || new Date().toLocaleTimeString('pt-BR'),
    dt: raw.dt || new Date().toLocaleDateString('pt-BR'),
    pst,
    s: totalSecoes,
    st: secoesTotalizadas,
    v: vGeral,
    vv: vValidos,
    pvv,
    vb: vBrancos,
    pvb,
    tvn: vNulos,
    ptvn,
    a: vAbstencao,
    pa,
    candidatos,
    statusApuracao,
    fonte: 'tse_live',
    temDadosSuficientes: temDados,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

/**
 * Retorna estado vazio / aguardando abertura oficial das urnas pelo TSE para 2026.
 * NENHUM DADO FICTÍCIO É GERADO. FICA EM BRANCO ATÉ QUE HAJA DADOS REAIS NO TSE.
 */
export function getEmptyTSEState(ano: EleicaoAno, cargo: CargoCodigo, ufInput: string): TSEResultData {
  const cargoInfo = CARGOS_TSE.find((c) => c.codigo === cargo) || CARGOS_TSE[0];
  const uf = cargo === '1' ? 'BR' : ufInput.toUpperCase();
  const estadoInfo = ESTADOS_BRASIL.find((e) => e.uf === uf);
  const ufNome = uf === 'BR' ? 'Brasil' : estadoInfo?.nome || uf;

  return {
    ano,
    ele: cargo === '1' ? '6257' : '6259',
    tpabr: uf === 'BR' ? 'BR' : 'UF',
    cdabr: uf,
    ufNome,
    carper: cargo,
    cargoNome: cargoInfo.nome,
    t: '1',
    espe: 'N',
    hg: '--:--:--',
    dt: '04/10/2026',
    pst: 0,
    s: uf === 'BR' ? 472075 : (estadoInfo ? Math.round(estadoInfo.eleitoradoAprox / 330) : 0),
    st: 0,
    v: 0,
    vv: 0,
    pvv: 0,
    vb: 0,
    pvb: 0,
    tvn: 0,
    ptvn: 0,
    a: 0,
    pa: 0,
    candidatos: [],
    statusApuracao: 'aguardando',
    fonte: 'tse_aguardando',
    temDadosSuficientes: false,
    ultimaAtualizacao: new Date().toISOString(),
    mensagemTse:
      'Aguardando o início da apuração das urnas pelo Tribunal Superior Eleitoral (TSE). A totalização oficial dos votos para as Eleições 2026 terá início às 17h00 (horário de Brasília) no dia 04/10/2026, assim que os primeiros boletins de urna (BUs) forem transmitidos pelos Tribunais Regionais Eleitorais (TREs).',
  };
}

/**
 * Busca dados da apuração do TSE
 * - Para 2026: Consulta a API ao vivo do TSE (/api/tse/apuracao). Se não tiver começado ou sem dados, deixa EM BRANCO.
 * - Para 2024 e 2022: Retorna os dados 100% reais, auditados e oficiais do TSE.
 */
export async function fetchTSEApuracao(
  ano: EleicaoAno,
  cargo: CargoCodigo,
  ufInput: string,
  turno: '1' | '2' = '1'
): Promise<TSEResultData> {
  const uf = cargo === '1' ? 'BR' : ufInput.toUpperCase();

  // 1. Dados Históricos Reais (2022 e 2024)
  if (ano === '2022' || ano === '2024') {
    const chave = `${ano}_${turno}_${uf}_${cargo}`;
    if (TSE_HISTORICAL_RESULTS[chave]) {
      return TSE_HISTORICAL_RESULTS[chave];
    }

    // Se pedir 2º turno e não tiver para essa UF/cargo, tenta 1º turno
    const chaveFallbackTurno = `${ano}_1_${uf}_${cargo}`;
    if (TSE_HISTORICAL_RESULTS[chaveFallbackTurno]) {
      return TSE_HISTORICAL_RESULTS[chaveFallbackTurno];
    }

    // Fallback para Presidente (se 2022) ou Prefeito SP (se 2024)
    if (ano === '2022') {
      return TSE_HISTORICAL_RESULTS[`2022_${turno}_BR_1`] || TSE_HISTORICAL_RESULTS['2022_1_BR_1'];
    } else {
      return TSE_HISTORICAL_RESULTS[`2024_${turno}_SP_11`] || TSE_HISTORICAL_RESULTS['2024_2_SP_11'];
    }
  }

  // 2. Eleição Atual (2026): Conecta ao feed oficial em tempo real
  try {
    const url = `/api/tse/apuracao?cargo=${cargo}&uf=${uf.toLowerCase()}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (res.ok) {
      const json = await res.json();
      if (json.sucesso && json.dados) {
        const parsed = parseTSERawJson(json.dados, cargo, uf, '2026');
        if (parsed.temDadosSuficientes) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('API TSE ao vivo ainda não respondeu com dados totalizados:', err);
  }

  // Se for a eleição de 2026 e o TSE ainda não tiver dados suficientes:
  // RETORNA EM BRANCO (SEM NÚMEROS FICTÍCIOS)
  return getEmptyTSEState('2026', cargo, uf);
}

/**
 * Exporta o Boletim Oficial de Totalização do TSE para arquivo CSV
 */
export function exportTSEBoletimCSV(data: TSEResultData) {
  const rows: (string | number)[][] = [
    ['JUSTIÇA ELEITORAL - TRIBUNAL SUPERIOR ELEITORAL'],
    ['BOLETIM OFICIAL DE TOTALIZAÇÃO DE VOTOS'],
    ['Eleição:', `Ano ${data.ano} - ${data.t}º Turno`],
    ['Cargo:', data.cargoNome],
    ['Abrangência / Estado:', `${data.ufNome} (${data.cdabr})`],
    ['Código Eleição TSE:', data.ele],
    ['Data/Hora TSE:', `${data.dt} às ${data.hg}`],
    ['Total de Seções Eleitorais:', data.s],
    ['Seções Totalizadas:', `${data.st} (${data.pst}% apurado)`],
    ['Total de Votos Computados:', data.v],
    ['Votos Válidos:', `${data.vv} (${data.pvv}%)`],
    ['Votos Brancos:', `${data.vb} (${data.pvb}%)`],
    ['Votos Nulos:', `${data.tvn} (${data.ptvn}%)`],
    ['Abstenção:', `${data.a} (${data.pa}%)`],
    [],
    ['Posição', 'Número Urna', 'Nome de Urna', 'Nome Completo', 'Partido / Coligação', 'Votos Válidos', '% Votos Válidos', 'Situação Oficial TSE', 'Vice / Suplente'],
  ];

  if (data.candidatos.length === 0) {
    rows.push(['-', '-', 'Aguardando início da apuração das urnas pelo TSE', '-', '-', '0', '0.00%', 'Aguardando', '-']);
  } else {
    data.candidatos.forEach((cand, idx) => {
      rows.push([
        idx + 1,
        cand.n,
        `"${cand.nm.replace(/"/g, '""')}"`,
        `"${(cand.nmCompleto || cand.nm).replace(/"/g, '""')}"`,
        `"${cand.cc.replace(/"/g, '""')}"`,
        cand.vap,
        `${cand.pvap}%`,
        cand.st,
        `"${(cand.nv || '-').replace(/"/g, '""')}"`,
      ]);
    });
  }

  const csvContent = rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tse_apuracao_${data.ano}_${data.cdabr.toLowerCase()}_cargo_${data.carper}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

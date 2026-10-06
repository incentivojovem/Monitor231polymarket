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
  { uf: 'ZZ', nome: 'Exterior (Zona Eleitoral ZZ - TRE-DF)', regiao: 'Exterior', capital: 'Embaixadas e Consulados', eleitoradoAprox: 918876 },
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
 * Converte resposta padrão do TSE (tanto -u.json unificado quanto dados-simplificados -r.json)
 * para o modelo da aplicação
 */
export function parseTSERawJson(raw: any, cargo: CargoCodigo, uf: string, ano: EleicaoAno): TSEResultData {
  const cargoInfo = CARGOS_TSE.find((c) => c.codigo === cargo) || CARGOS_TSE[0];
  const estadoInfo = ESTADOS_BRASIL.find((e) => e.uf.toLowerCase() === uf.toLowerCase());
  const ufNome = uf.toLowerCase() === 'br' ? 'Brasil' : estadoInfo?.nome || uf.toUpperCase();

  const cargItem = Array.isArray(raw.carg) ? raw.carg[0] : null;

  // 1. Seções eleitorais (suporta objeto do -u.json ou campos diretos do -r.json)
  const isSObj = typeof raw.s === 'object' && raw.s !== null;
  const isCargSObj = typeof cargItem?.s === 'object' && cargItem?.s !== null;

  const totalSecoes = parseInt(
    (isSObj ? raw.s.ts || raw.s.s : raw.s) ||
    (isCargSObj ? cargItem?.s.ts || cargItem?.s.s : cargItem?.s) ||
    '0',
    10
  );

  const secoesTotalizadas = parseInt(
    (isSObj ? raw.s.st : raw.st) ||
    (isCargSObj ? cargItem?.s.st : cargItem?.st) ||
    '0',
    10
  );

  const pstRaw =
    (isSObj ? raw.s.pst : raw.pst) ||
    (isCargSObj ? cargItem?.s.pst : cargItem?.pst) ||
    '0';
  const pst = parseFloat(String(pstRaw).replace(',', '.'));

  // 2. Votos apurados (suporta objeto v do -u.json ou campos planos do -r.json)
  const isVObj = typeof raw.v === 'object' && raw.v !== null;
  const isCargVObj = typeof cargItem?.v === 'object' && cargItem?.v !== null;

  const vGeral = parseInt(
    (isVObj ? raw.v.tv || raw.v.v : raw.v) ||
    (isCargVObj ? cargItem?.v.tv || cargItem?.v.v : cargItem?.v) ||
    '0',
    10
  );

  const vValidos = parseInt(
    (isVObj ? raw.v.vv || raw.v.vvc : raw.vv) ||
    (isCargVObj ? cargItem?.v.vv || cargItem?.v.vvc : cargItem?.vv) ||
    '0',
    10
  );

  const pvvRaw =
    (isVObj ? raw.v.pvvc || raw.v.pvv : raw.pvv) ||
    (isCargVObj ? cargItem?.v.pvvc || cargItem?.v.pvv : cargItem?.pvv) ||
    '0';
  const pvv = parseFloat(String(pvvRaw).replace(',', '.'));

  const vBrancos = parseInt(
    (isVObj ? raw.v.vb : raw.vb) ||
    (isCargVObj ? cargItem?.v.vb : cargItem?.vb) ||
    '0',
    10
  );

  const pvbRaw =
    (isVObj ? raw.v.pvb : raw.pvb) ||
    (isCargVObj ? cargItem?.v.pvb : cargItem?.pvb) ||
    '0';
  const pvb = parseFloat(String(pvbRaw).replace(',', '.'));

  const vNulos = parseInt(
    (isVObj ? raw.v.tvn || raw.v.vn : raw.tvn) ||
    (isCargVObj ? cargItem?.v.tvn || cargItem?.v.vn : cargItem?.tvn) ||
    '0',
    10
  );

  const ptvnRaw =
    (isVObj ? raw.v.ptvn : raw.ptvn) ||
    (isCargVObj ? cargItem?.v.ptvn : cargItem?.ptvn) ||
    '0';
  const ptvn = parseFloat(String(ptvnRaw).replace(',', '.'));

  // 3. Eleitorado e abstenção (objeto raw.e no -u.json)
  const isEObj = typeof raw.e === 'object' && raw.e !== null;
  const vAbstencao = parseInt(
    (isEObj ? raw.e.a : raw.a) ||
    cargItem?.a ||
    '0',
    10
  );

  const paRaw =
    (isEObj ? raw.e.pa : raw.pa) ||
    cargItem?.pa ||
    '0';
  const pa = parseFloat(String(paRaw).replace(',', '.'));

  // 4. Candidatos (suporta tanto a árvore de agregação/partido do -u.json quanto o array plano do -r.json)
  const rawCands: any[] = [];
  if (Array.isArray(raw.cand) && raw.cand.length > 0) {
    rawCands.push(...raw.cand);
  } else if (cargItem && Array.isArray(cargItem.cand) && cargItem.cand.length > 0) {
    rawCands.push(...cargItem.cand);
  } else if (cargItem && Array.isArray(cargItem.agr)) {
    for (const agr of cargItem.agr) {
      if (Array.isArray(agr.par)) {
        for (const par of agr.par) {
          if (Array.isArray(par.cand)) {
            for (const c of par.cand) {
              const vice = c.vs && c.vs[0] ? (c.vs[0].nmu || c.vs[0].nm) : '';
              rawCands.push({
                ...c,
                n: c.n || '',
                nm: c.nmu || c.nm || 'Candidato',
                nmCompleto: c.nm || c.nmu || 'Candidato',
                cc: c.cc || agr.nm || par.sg || '',
                sg: par.sg,
                nv: vice || c.nv || '',
                e: c.e === 's' || c.e === 'S' ? 'S' : 'N',
                st: c.st || (c.e === 's' || c.e === 'S' ? 'Eleito' : 'Em apuração'),
                vap: c.vap,
                pvap: c.pvap,
              });
            }
          }
        }
      }
    }
  }

  const candidatos = rawCands.map((c: any, index: number) => {
    const vap = parseInt(c.vap || '0', 10);
    const pvap = parseFloat(String(c.pvap || '0').replace(',', '.'));
    const eleitoStatus: 'S' | 'N' = c.e === 'S' || c.e === 's' ? 'S' : 'N';
    return {
      seq: c.seq || String(index + 1),
      sqcand: c.sqcand || String(index + 100),
      n: c.n || '',
      nm: c.nm || c.nmu || 'Candidato',
      nmCompleto: c.nmCompleto || c.nmc || c.nm || 'Candidato',
      cc: c.cc || '',
      nv: c.nv || '',
      e: eleitoStatus,
      st: c.st || (eleitoStatus === 'S' ? 'Eleito' : 'Em apuração'),
      dvt: c.dvt || 'Válido',
      vap,
      pvap,
      foto: c.sqcand ? `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/foto/${ano}/${c.sqcand}/${uf.toLowerCase()}` : undefined,
    };
  });

  // Ordena os candidatos por número de votos válidos (decrescente)
  candidatos.sort((a, b) => b.vap - a.vap);

  const temDados = pst > 0 && candidatos.length > 0;

  let statusApuracao: 'aguardando' | 'em_andamento' | 'finalizada' = 'em_andamento';
  if (pst >= 100) statusApuracao = 'finalizada';
  else if (pst === 0) statusApuracao = 'aguardando';

  return {
    ano,
    ele: raw.ele || '',
    tpabr: raw.tpabr || (uf.toLowerCase() === 'br' ? 'BR' : 'UF'),
    cdabr: (raw.cdabr || uf).toUpperCase(),
    ufNome,
    carper: cargo,
    cargoNome: cargoInfo.nome,
    t: raw.t || '1',
    espe: raw.espe || 'N',
    hg: raw.hg || '--:--:--',
    dt: raw.dt || '--/--/----',
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
  const uf = ufInput ? ufInput.toUpperCase() : (cargo === '1' ? 'BR' : 'SP');
  const estadoInfo = ESTADOS_BRASIL.find((e) => e.uf === uf);
  const ufNome = uf === 'BR' ? 'Brasil' : uf === 'ZZ' ? 'Exterior (Zona Eleitoral ZZ - TRE-DF)' : estadoInfo?.nome || uf;
  const isExterior = uf === 'ZZ';

  return {
    ano,
    ele: '',
    tpabr: uf === 'BR' ? 'BR' : uf === 'ZZ' ? 'ZZ' : 'UF',
    cdabr: uf,
    ufNome,
    carper: cargo,
    cargoNome: cargoInfo.nome,
    t: '1',
    espe: 'N',
    hg: '--:--:--',
    dt: '--/--/----',
    pst: 0,
    s: 0,
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
    mensagemTse: isExterior
      ? 'Aguardando a transmissão dos Boletins de Urna (BUs) das Embaixadas e Consulados brasileiros no exterior pelo Cartório da 1ª Zona Eleitoral do Exterior (TRE-DF/TSE). Devido aos fusos horários, a votação na Nova Zelândia, Austrália, Japão e Coreia do Sul encerra antes do fechamento das urnas no Brasil.'
      : 'Aguardando o início da apuração das urnas pelo Tribunal Superior Eleitoral (TSE). A totalização oficial dos votos para as Eleições 2026 terá início às 17h00 (horário de Brasília) no dia 04/10/2026, assim que os primeiros boletins de urna (BUs) forem transmitidos pelos Tribunais Regionais Eleitorais (TREs).',
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
  const uf = ufInput ? ufInput.toUpperCase() : (cargo === '1' ? 'BR' : 'SP');

  // Dados históricos permanecem somente para eleições encerradas.
  if (ano === '2022' || ano === '2024') {
    const chave = `${ano}_${turno}_${uf}_${cargo}`;
    if (TSE_HISTORICAL_RESULTS[chave]) return TSE_HISTORICAL_RESULTS[chave];

    const chaveFallbackTurno = `${ano}_1_${uf}_${cargo}`;
    if (TSE_HISTORICAL_RESULTS[chaveFallbackTurno]) return TSE_HISTORICAL_RESULTS[chaveFallbackTurno];

    if (uf === 'ZZ') {
      return TSE_HISTORICAL_RESULTS['2022_2_ZZ_1'] || TSE_HISTORICAL_RESULTS['2022_1_ZZ_1'];
    }

    if (ano === '2022') {
      return TSE_HISTORICAL_RESULTS[`2022_${turno}_BR_1`] || TSE_HISTORICAL_RESULTS['2022_1_BR_1'];
    }
    return TSE_HISTORICAL_RESULTS[`2024_${turno}_SP_11`] || TSE_HISTORICAL_RESULTS['2024_2_SP_11'];
  }

  // 2026 NUNCA usa dados históricos/fixos. A única fonte é o feed oficial do TSE.
  try {
    const url = `/api/tse/apuracao?cargo=${encodeURIComponent(cargo)}&uf=${encodeURIComponent(uf.toLowerCase())}&turno=${turno}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (res.ok) {
      const json = await res.json();
      if (json.sucesso && json.dados) {
        // Um JSON oficial existente é válido mesmo que ainda tenha 0 votos.
        return parseTSERawJson(json.dados, cargo, uf, '2026');
      }
    }
  } catch (err) {
    console.warn('Falha ao consultar o feed oficial TSE 2026:', err);
  }

  // Sem feed oficial: estado vazio, sem números inventados e sem fallback de 2026.
  return getEmptyTSEState('2026', cargo, uf);
}

/**
 * Consulta resultados dos países no exterior (Zona ZZ) apurados oficialmente pelo TSE
 */
export async function fetchTSEExteriorPaises(turno: '1' | '2' = '1') {
  try {
    const res = await fetch(`/api/tse/exterior/paises?turno=${turno}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.sucesso && Array.isArray(json.paises)) {
        return json.paises;
      }
    }
  } catch (err) {
    console.warn('Falha ao consultar países do exterior:', err);
  }
  return [];
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

export type EleicaoAno = '2026' | '2024' | '2022';
export type CargoCodigo = '1' | '3' | '5' | '6' | '7' | '8' | '11' | '13';

export interface CargoConfig {
  codigo: CargoCodigo;
  nome: string;
  nomePlural: string;
  descricao: string;
  abrangencia: 'nacional' | 'estadual' | 'municipal';
  vagas?: number;
  anosDisponiveis: EleicaoAno[];
}

export interface TSECandidate {
  seq: string;            // Posição no ranking de votos ("1", "2"...)
  sqcand: string;         // Sequencial TSE do candidato
  n: string;              // Número na urna ("13", "22", "10", "44"...)
  nm: string;             // Nome de urna do candidato
  nmCompleto?: string;    // Nome completo oficial
  cc: string;             // Coligação / Partido ("PL", "PT - FE BRASIL", etc.)
  nv?: string;            // Nome do vice ou 1º suplente
  e: 'S' | 'N';           // Eleito ("S" ou "N")
  st: string;             // Situação do candidato ("Eleito", "2º turno", "Não eleito", "Suplente", "Em apuração")
  dvt: string;            // Destinação do voto ("Válido", "Anulado sub judice", etc.)
  vap: number;            // Quantidade de votos apurados
  pvap: number;           // Percentual de votos válidos apurados (ex: 48.5)
  foto?: string;          // Foto oficial do candidato se disponível
  corPartido?: string;    // Cor temática para UI
}

export interface TSEResultData {
  ano: EleicaoAno;        // '2026', '2024', '2022'
  ele: string;            // Código oficial da eleição no TSE
  tpabr: 'BR' | 'UF' | 'MU'; // Tipo de abrangência
  cdabr: string;          // Sigla do Estado, 'BR' ou Código Município
  ufNome: string;         // Nome amigável ("Brasil", "São Paulo", etc.)
  carper: CargoCodigo;    // Código do cargo
  cargoNome: string;      // Nome do cargo ("Presidente", "Governador", etc.)
  t: string;              // Turno ("1" ou "2")
  espe: string;           // "N"
  hg: string;             // Hora de geração oficial no TSE
  dt: string;             // Data de geração oficial no TSE
  pst: number;            // Percentual de seções totalizadas/apuradas
  s: number;              // Total geral de seções eleitorais
  st: number;             // Seções totalizadas até o momento
  v: number;              // Total de votos computados
  vv: number;             // Votos válidos
  pvv: number;            // Percentual de votos válidos
  vb: number;             // Votos brancos
  pvb: number;            // Percentual de votos brancos
  tvn: number;            // Votos nulos
  ptvn: number;           // Percentual de votos nulos
  a: number;              // Total de abstenções
  pa: number;             // Percentual de abstenção
  candidatos: TSECandidate[];
  statusApuracao: 'aguardando' | 'em_andamento' | 'finalizada';
  situacaoTurno?: 'em_andamento' | 'segundo_turno' | 'eleito_primeiro_turno' | 'eleito';
  fonte: 'tse_live' | 'tse_oficial_historico' | 'tse_aguardando';
  temDadosSuficientes: boolean;
  ultimaAtualizacao: string;
  mensagemTse?: string;
}

export interface EstadoInfo {
  uf: string;
  nome: string;
  regiao: string;
  capital: string;
  eleitoradoAprox: number;
}

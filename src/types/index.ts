// Interface para cheques
export interface Cheque {
  banco: string;
  agencia: string;
  numeroCheque: string;
  nomeCliente: string;
  valor: number;
  dataVencimento?: string; // Para cheques predatados
}

export interface CashFlowEntry {
  dinheiro: number;
  fundoCaixa: number;
  cartao: number;
  cartaoLink: number;
  clienteCartaoLink: string;
  parcelasCartaoLink: number;
  boletos: number;
  clienteBoletos: string;
  parcelasBoletos: number;
  pixMaquininha: number;
  pixConta: number;
  cliente1Nome: string;
  cliente1Valor: number;
  cliente2Nome: string;
  cliente2Valor: number;
  cliente3Nome: string;
  cliente3Valor: number;
  
  // Novos campos para PIX Conta - múltiplos clientes
  pixContaClientes: { nome: string; valor: number }[];
  
  // Novos campos solicitados
  cheque: number;
  cheques: Cheque[];
  outros: number;
}

// Interface para múltiplas devoluções
export interface Devolucao {
  cpf: string;
  valor: number;
  incluidoNoMovimento: boolean;
}

// Interface para múltiplos envios de correios
export interface EnvioCorreios {
  tipo: '' | 'PAC' | 'SEDEX';
  estado: string;
  cliente: string;
  valor: number;
  incluidoNoMovimento: boolean;
}

// Interface para envios via transportadora
export interface EnvioTransportadora {
  nomeCliente: string;
  estado: string;
  peso: number;
  quantidade: number;
  valor: number;
}

export interface CashFlowExit {
  descontos: number;
  saida: number;
  justificativaSaida: string;
  justificativaCompra: string;
  valorCompra: number;
  justificativaSaidaDinheiro: string;
  valorSaidaDinheiro: number;
  
  // Crédito/Devolução - Múltiplas devoluções
  devolucoes: Devolucao[];
  
  // Correios/Frete - Múltiplos envios
  enviosCorreios: EnvioCorreios[];
  
  // Transportadora - Múltiplos envios
  enviosTransportadora: EnvioTransportadora[];
  
  valesFuncionarios: { nome: string; valor: number }[];
  valesIncluidosNoMovimento: boolean;
  puxadorNome: string;
  puxadorPorcentagem: number;
  puxadorValor: number;
  
  // Múltiplos clientes do puxador
  puxadorClientes: { nome: string; valor: number }[];
  
  // Campos legados para compatibilidade
  creditoDevolucao: number;
  cpfCreditoDevolucao: string;
  creditoDevolucaoIncluido: boolean;
  correiosFrete: number;
  correiosTipo: string;
  correiosEstado: string;
  correiosClientes: string[];
}

// Interface para cancelamentos
export interface Cancelamento {
  id: string;
  numeroPedido: string;
  horaCancelamento: string;
  vendedor: string;
  numeroNovoPedido: string;
  motivo: string;
  valor: number;
  assinaturaGerente: string;
  data: string;
}

export interface CashFlowData {
  entries: CashFlowEntry;
  exits: CashFlowExit;
  total: number;
  date: string;
  cancelamentos?: Cancelamento[];
}

// Interface para configurações da empresa
export interface CompanyConfig {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    site: string;
  };
  pix: {
    chave: string;
    tipo: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
    banco: string;
    agencia: string;
    conta: string;
  };
  personalizacao: {
    corPrimaria: string;
    corSecundaria: string;
    logo: string;
    favicon: string;
  };
  configuracao: {
    moeda: string;
    fusoHorario: string;
    formatoData: string;
    formatoHora: string;
  };
}

// Interface para cobrança PIX
export interface PixCobranca {
  id: string;
  txid: string;
  valor: number;
  chave: string;
  descricao: string;
  status: 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP';
  qrCode: string;
  qrCodeImage: string;
  dataCriacao: string;
  dataExpiracao: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
  };
}
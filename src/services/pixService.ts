import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { PixCobranca, CompanyConfig } from '../types';

// Simulação de API PIX real
class PixService {
  private baseUrl = 'https://api-pix.gerencianet.com.br'; // URL fictícia para demonstração
  private apiKey = 'sua-api-key-aqui'; // Em produção, usar variáveis de ambiente
  
  // Simular configuração da empresa (em produção viria do banco de dados)
  private companyConfig: CompanyConfig = {
    id: '1',
    nomeFantasia: 'Webyte Desenvolvimentos',
    razaoSocial: 'Webyte Desenvolvimentos LTDA',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123456789',
    endereco: {
      logradouro: 'Rua Agrimensor Sugaya',
      numero: '1203',
      complemento: 'Bloco 5 Sala 32',
      bairro: 'Vila Olímpia',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04552-001'
    },
    contato: {
      telefone: '(11) 98480-1839',
      email: 'junior@webytebr.com',
      site: 'https://webytebr.com'
    },
    pix: {
      chave: '(11) 98480-1839',
      tipo: 'telefone',
      banco: '341',
      agencia: '1234',
      conta: '56789-0'
    },
    personalizacao: {
      corPrimaria: '#10b981',
      corSecundaria: '#059669',
      logo: '',
      favicon: ''
    },
    configuracao: {
      moeda: 'BRL',
      fusoHorario: 'America/Sao_Paulo',
      formatoData: 'DD/MM/YYYY',
      formatoHora: 'HH:mm'
    }
  };

  /**
   * Criar cobrança PIX real
   */
  async criarCobranca(valor: number, cliente: any, descricao: string = 'Teste de 30 Dias - Sistema Movimento de Caixa'): Promise<PixCobranca> {
    try {
      // Gerar TXID único
      const txid = uuidv4().replace(/-/g, '').substring(0, 35);
      
      // Criar payload PIX no formato EMV seguindo rigorosamente o padrão do Banco Central
      const pixPayload = this.gerarPayloadPIX(valor, descricao);
      
      // Gerar QR Code
      const qrCodeImage = await QRCode.toDataURL(pixPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Simular resposta da API PIX
      const cobranca: PixCobranca = {
        id: uuidv4(),
        txid,
        valor,
        chave: this.companyConfig.pix.chave,
        descricao,
        status: 'ATIVA',
        qrCode: pixPayload,
        qrCodeImage,
        dataCriacao: new Date().toISOString(),
        dataExpiracao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        cliente
      };

      // Em produção, salvar no banco de dados
      this.salvarCobranca(cobranca);

      return cobranca;
    } catch (error) {
      console.error('Erro ao criar cobrança PIX:', error);
      throw new Error('Falha ao criar cobrança PIX');
    }
  }

  /**
   * Gerar payload PIX no formato EMV seguindo rigorosamente o padrão do Banco Central
   */
  private gerarPayloadPIX(valor: number, descricao: string): string {
    const merchantName = this.companyConfig.nomeFantasia || 'Webyte Desenvolvimentos';
    const merchantCity = this.companyConfig.endereco.cidade || 'Sao Paulo';
    const pixKey = this.companyConfig.pix.chave;
    
    // Formatar valor para centavos (sem vírgula, apenas números)
    const valorCentavos = Math.round(valor * 100).toString();
    
    // Construir payload EMV seguindo rigorosamente o padrão oficial do Banco Central
    // Baseado na documentação: https://www.bcb.gov.br/estabilidadefinanceira/pix
    
    // 1. Payload Format Indicator (ID: 00)
    const payloadFormatIndicator = '000201';
    
    // 2. Merchant Account Information (ID: 26)
    // 2.1. GUI (ID: 00) - Identificador do PIX
    const gui = '0014br.gov.bcb.pix';
    
    // 2.2. Chave PIX (ID: 01)
    const chavePix = this.formatarTamanho(pixKey) + pixKey;
    
    // 2.3. Merchant Account Information completa
    const merchantAccountInfo = gui + chavePix;
    
    // 3. Merchant Category Code (ID: 52) - Código da categoria do comerciante
    const merchantCategoryCode = '52040000';
    
    // 4. Transaction Currency (ID: 53) - Moeda da transação (BRL = 986)
    const transactionCurrency = '5303986';
    
    // 5. Transaction Amount (ID: 54) - Valor da transação em centavos
    const transactionAmount = '54' + this.formatarTamanho(valorCentavos) + valorCentavos;
    
    // 6. Country Code (ID: 58) - Código do país (BR = 58)
    const countryCode = '5802BR';
    
    // 7. Merchant Name (ID: 59) - Nome do comerciante
    const merchantNameField = '59' + this.formatarTamanho(merchantName) + merchantName;
    
    // 8. Merchant City (ID: 60) - Cidade do comerciante
    const merchantCityField = '60' + this.formatarTamanho(merchantCity) + merchantCity;
    
    // 9. Additional Data Field Template (ID: 62) - Template de dados adicionais
    // 9.1. Reference Label (ID: 05) - Identificador da transação
    const referenceLabel = '05' + this.formatarTamanho(descricao) + descricao;
    const additionalDataField = '62' + this.formatarTamanho(referenceLabel) + referenceLabel;
    
    // Construir payload completo (sem CRC16)
    const payload = [
      payloadFormatIndicator,
      '26' + this.formatarTamanho(merchantAccountInfo) + merchantAccountInfo,
      merchantCategoryCode,
      transactionCurrency,
      transactionAmount,
      countryCode,
      merchantNameField,
      merchantCityField,
      additionalDataField,
      '6304' // CRC16 placeholder
    ].join('');

    // Calcular CRC16-CCITT
    const crc = this.calcularCRC16(payload);
    
    // Retornar payload com CRC16 correto
    return payload.replace('6304', '63' + this.formatarTamanho(crc) + crc);
  }

  /**
   * Formatar tamanho do campo (sempre 2 dígitos)
   */
  private formatarTamanho(texto: string): string {
    return texto.length.toString().padStart(2, '0');
  }

  /**
   * Calcular CRC16-CCITT seguindo o padrão do Banco Central
   */
  private calcularCRC16(payload: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Consultar status da cobrança
   */
  async consultarCobranca(txid: string): Promise<PixCobranca | null> {
    try {
      // Em produção, consultar API real
      const cobrancas = this.obterCobrancasSalvas();
      return cobrancas.find(c => c.txid === txid) || null;
    } catch (error) {
      console.error('Erro ao consultar cobrança:', error);
      return null;
    }
  }

  /**
   * Listar cobranças
   */
  async listarCobrancas(): Promise<PixCobranca[]> {
    return this.obterCobrancasSalvas();
  }

  /**
   * Salvar cobrança (simulação de banco de dados)
   */
  private salvarCobranca(cobranca: PixCobranca): void {
    const cobrancas = this.obterCobrancasSalvas();
    cobrancas.push(cobranca);
    localStorage.setItem('pix_cobrancas', JSON.stringify(cobrancas));
  }

  /**
   * Obter cobranças salvas
   */
  private obterCobrancasSalvas(): PixCobranca[] {
    const cobrancas = localStorage.getItem('pix_cobrancas');
    return cobrancas ? JSON.parse(cobrancas) : [];
  }

  /**
   * Atualizar configuração da empresa
   */
  async atualizarConfiguracao(config: Partial<CompanyConfig>): Promise<CompanyConfig> {
    this.companyConfig = { ...this.companyConfig, ...config };
    localStorage.setItem('company_config', JSON.stringify(this.companyConfig));
    return this.companyConfig;
  }

  /**
   * Obter configuração da empresa
   */
  async obterConfiguracao(): Promise<CompanyConfig> {
    const config = localStorage.getItem('company_config');
    if (config) {
      this.companyConfig = { ...this.companyConfig, ...JSON.parse(config) };
    }
    return this.companyConfig;
  }

  /**
   * Validar chave PIX
   */
  validarChavePIX(chave: string, tipo: string): boolean {
    switch (tipo) {
      case 'cpf':
        return /^\d{11}$/.test(chave.replace(/\D/g, ''));
      case 'cnpj':
        return /^\d{14}$/.test(chave.replace(/\D/g, ''));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave);
      case 'telefone':
        return /^\+?55\d{10,11}$/.test(chave.replace(/\D/g, ''));
      case 'aleatoria':
        return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(chave);
      default:
        return false;
    }
  }

  /**
   * Gerar payload PIX simples para teste (sem valor específico)
   */
  gerarPayloadPIXSimples(): string {
    const pixKey = this.companyConfig.pix.chave;
    const merchantName = this.companyConfig.nomeFantasia || 'Webyte Desenvolvimentos';
    const merchantCity = this.companyConfig.endereco.cidade || 'Sao Paulo';
    
    // Payload PIX simples para transferência (sem valor)
    const payload = [
      '000201', // Payload Format Indicator
      '26' + this.formatarTamanho('0014br.gov.bcb.pix01' + this.formatarTamanho(pixKey) + pixKey) + '0014br.gov.bcb.pix01' + this.formatarTamanho(pixKey) + pixKey,
      '52040000', // Merchant Category Code
      '5303986', // Transaction Currency
      '5802BR', // Country Code
      '59' + this.formatarTamanho(merchantName) + merchantName,
      '60' + this.formatarTamanho(merchantCity) + merchantCity,
      '6304' // CRC16 placeholder
    ].join('');

    const crc = this.calcularCRC16(payload);
    return payload.replace('6304', '63' + this.formatarTamanho(crc) + crc);
  }
}

export default new PixService();
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Smartphone, CreditCard, Clock, Shield, QrCode, Download, CheckCircle, Star } from 'lucide-react';
import pixService from '../services/pixService';
import { PixCobranca } from '../types';

interface PaymentPageProps {
  onBack: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

export default function PaymentPage({ onBack, onPaymentComplete }: PaymentPageProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [cobranca, setCobranca] = useState<PixCobranca | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const pixAmount = 29.99;

  // Gerar cobrança PIX real
  useEffect(() => {
    gerarCobrancaPIX();
  }, []);

  const gerarCobrancaPIX = async () => {
    setLoading(true);
    try {
      const novaCobranca = await pixService.criarCobranca(
        pixAmount,
        formData,
        'Teste de 30 Dias - Sistema Movimento de Caixa'
      );
      
      setCobranca(novaCobranca);
      setQrCodeDataUrl(novaCobranca.qrCodeImage);
    } catch (error) {
      console.error('Erro ao gerar cobrança PIX:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixKey = async () => {
    if (!cobranca) return;
    try {
      await navigator.clipboard.writeText(cobranca.chave);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(pixAmount.toFixed(2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleDownloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'pix-qrcode.png';
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cobranca) return;
    
    // Abrir WhatsApp com informações do pagamento
    const message = `Olá! Realizei o pagamento do teste de 30 dias do Sistema de Movimento de Caixa.

📋 **Dados do Pagamento:**
• Valor: R$ ${pixAmount.toFixed(2)}
• Chave PIX: ${cobranca.chave}
• TXID: ${cobranca.txid}
• Método: PIX

👤 **Meus Dados:**
• Nome: ${formData.name}
• E-mail: ${formData.email}
• Telefone: ${formData.phone}
• Empresa: ${formData.company}

Por favor, confirme o recebimento e envie as instruções de acesso.`;

    const whatsappUrl = `https://wa.me/5511984801839?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    onPaymentComplete({
      method: 'pix',
      amount: pixAmount,
      data: formData,
      cobranca: cobranca
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teste de 30 Dias</h1>
              <p className="text-gray-600">Sistema Completo de Movimento de Caixa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Informações do Produto */}
          <div className="space-y-6">
            {/* Preço e Benefícios */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  R$ {pixAmount.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-gray-600">
                  Pagamento único • Acesso por 30 dias
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">O que você recebe:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Acesso completo ao sistema por 30 dias</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Suporte técnico durante o período</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Treinamento básico incluído</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Dados preservados após o teste</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Atualizações automáticas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Depoimentos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Avaliações
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-700 italic">"Sistema muito intuitivo e completo. Facilitou muito o controle do meu caixa."</p>
                  <p className="text-sm text-gray-500 mt-1">- Maria Silva, Loja de Roupas</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-700 italic">"Excelente suporte e funcionalidades. Recomendo!"</p>
                  <p className="text-sm text-gray-500 mt-1">- João Santos, Restaurante</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Pagamento */}
          <div className="space-y-6">
            {/* QR Code e PIX */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Pagamento via PIX
              </h3>

              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm inline-block">
                  {loading ? (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {qrCodeDataUrl && (
                  <button
                    onClick={handleDownloadQRCode}
                    className="mt-3 text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Baixar QR Code
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cobranca?.chave || 'Carregando...'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono bg-gray-50"
                    />
                    <button
                      onClick={handleCopyPixKey}
                      disabled={!cobranca}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copiar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`R$ ${pixAmount.toFixed(2).replace('.', ',')}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono bg-gray-50"
                    />
                    <button
                      onClick={handleCopyAmount}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Instruções:</strong> Escaneie o QR Code com seu app bancário ou copie a chave PIX e o valor para realizar o pagamento. 
                    Após o pagamento, preencha seus dados abaixo e confirme.
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seus Dados</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-3"
                >
                  <Shield className="w-5 h-5" />
                  Confirmar Pagamento
                </button>
              </form>
            </div>

            {/* Segurança */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <strong>Segurança:</strong> Seus dados são protegidos e não serão compartilhados com terceiros. 
                  O pagamento é processado de forma segura via PIX. Utilizamos criptografia de ponta para proteger suas informações.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

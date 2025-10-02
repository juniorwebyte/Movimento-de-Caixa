import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, CreditCard, Clock, Shield, QrCode, Download } from 'lucide-react';
import pixService from '../services/pixService';
import { PixCobranca } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

export default function PaymentModal({ isOpen, onClose, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showFullForm, setShowFullForm] = useState(false);
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
    if (isOpen && paymentMethod === 'pix') {
      gerarCobrancaPIX();
    }
  }, [isOpen, paymentMethod]);

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
    if (paymentMethod === 'pix' && cobranca) {
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
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Teste de 30 Dias</h1>
                <p className="text-green-100 text-xs">R$ {pixAmount.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Compacto */}
        <div className="p-4">
          {/* QR Code e Informações PIX */}
          {paymentMethod === 'pix' && (
            <div className="mb-4">
              <div className="flex gap-4 items-start">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  <div className="bg-white p-3 rounded-xl border-2 border-green-200 shadow-sm">
                    {loading ? (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code PIX" 
                        className="w-32 h-32"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {qrCodeDataUrl && (
                    <button
                      onClick={handleDownloadQRCode}
                      className="w-full mt-2 text-xs text-green-600 hover:text-green-700 flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Baixar QR Code
                    </button>
                  )}
                </div>

                {/* Informações PIX */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Chave PIX:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cobranca?.chave || 'Carregando...'}
                        readOnly
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono bg-gray-50"
                      />
                      <button
                        onClick={handleCopyPixKey}
                        disabled={!cobranca}
                        className="px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Valor:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`R$ ${pixAmount.toFixed(2).replace('.', ',')}`}
                        readOnly
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono bg-gray-50"
                      />
                      <button
                        onClick={handleCopyAmount}
                        className="px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <strong>Instruções:</strong> Escaneie o QR Code ou copie a chave PIX e realize o pagamento.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulário Compacto */}
          {!showFullForm ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome completo *"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="E-mail *"
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowFullForm(true)}
                className="w-full text-sm text-green-600 hover:text-green-700 py-1"
              >
                + Adicionar telefone e empresa
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome completo *"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="E-mail *"
                />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Telefone *"
                />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Empresa"
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowFullForm(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                - Ocultar campos extras
              </button>
            </div>
          )}

          {/* Benefícios Compactos */}
          <div className="my-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Acesso completo por 30 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Suporte técnico incluído</span>
              </div>
            </div>
          </div>

          {/* Botão de Confirmação */}
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Confirmar Pagamento
            </button>
          </form>

          {/* Aviso de Segurança Compacto */}
          <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <strong>Segurança:</strong> Dados protegidos. Pagamento seguro via PIX.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

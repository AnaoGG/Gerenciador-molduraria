// src/components/views/PrintOrderView.tsx

import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { View } from '../../types';

// <-- MUDANÇA AQUI (Passo 1: Importar as bibliotecas) -->
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface PrintOrderViewProps {
  orderId: string;
  setView: (view: View, orderId?: string | null) => void;
}

const PrintOrderView: React.FC<PrintOrderViewProps> = ({ orderId, setView }) => {
  const { orders, clients, materials } = useAppContext();
  
  const order = orders.find(o => o.id === orderId);
  const client = clients.find(c => c.id === order?.clientId);

  const subtotal = useMemo(() => order ? order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0, [order]);
  const discountAmount = useMemo(() => {
    if (!order) return 0;
    if (order.discount.type === 'percentage') {
      return subtotal * (order.discount.value / 100);
    }
    return order.discount.value;
  }, [subtotal, order]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  
  // <-- MUDANÇA AQUI (Passo 2: Adicionar a função de compartilhamento) -->
  const handleShare = async () => {
    if (!order || !client) return;

    const input = document.getElementById('printable-order');
    if (!input) {
      console.error("Elemento 'printable-order' não encontrado!");
      return;
    }

    const actionsDiv = document.getElementById('print-actions');
    if (actionsDiv) actionsDiv.style.display = 'none';

    try {
        const canvas = await html2canvas(input, {
          scale: 2, // Aumenta a resolução para melhor qualidade do PDF
          useCORS: true 
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], `Pedido_${order.orderNumber}.pdf`, {
          type: 'application/pdf',
        });

        if (navigator.share) {
            await navigator.share({
              title: `Pedido Monalisa Molduras #${order.orderNumber}`,
              text: `Segue o orçamento do pedido para o cliente ${client.name}.`,
              files: [pdfFile],
            });
        } else {
            alert('Seu navegador não suporta compartilhamento direto. O PDF será baixado.');
            pdf.save(`Pedido_${order.orderNumber}.pdf`);
        }
    } catch(error) {
        console.error("Erro ao gerar ou compartilhar o PDF:", error);
        alert("Ocorreu um erro ao tentar gerar o PDF.");
    } finally {
        if (actionsDiv) actionsDiv.style.display = 'flex';
    }
  };


  if (!order || !client) {
    return (
      <div className="p-8">
        <h1 className="text-2xl text-red-600">Erro</h1>
        <p>Pedido ou cliente não encontrado.</p>
        <button onClick={() => setView('orders')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Voltar para Pedidos</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800">
        {/* <-- MUDANÇA AQUI (Passo 3: Adicionar ID na div dos botões e o novo botão) --> */}
        <div id="print-actions" className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Visualização de Impressão</h2>
            <div>
                 <button onClick={() => setView('orders')} className="mr-4 bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Voltar
                </button>
                <button onClick={() => window.print()} className="mr-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Imprimir Pedido
                </button>
                 {/* NOVO BOTÃO DE COMPARTILHAR */}
                <button onClick={handleShare} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    Compartilhar
                </button>
            </div>
        </div>

        {/* <-- MUDANÇA AQUI (Passo 4: Adicionar ID na área que será convertida para PDF) --> */}
        <div id="printable-order" className="p-8 md:p-12 print-area A4-sheet">
            <header className="flex justify-between items-start pb-8 border-b">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Monalisa Molduras</h1>
                    <p className="text-slate-600 text-sm">JORGE ALVES FRANCA JUNIOR 95389458168</p>
                    <p className="text-slate-500">QE 38 Comércio local 1, N° 12 - Brasília, DF, 71070-380</p>
                    <p className="text-slate-500">(61) 98439-5229</p>
                    <p className="text-slate-500 text-xs mt-1">CNPJ: 43.397.584/0001-93 | IE: 0808182200139</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold uppercase text-slate-500">Pedido</h2>
                    <p className="font-mono text-lg text-slate-800">#{order.orderNumber}</p>
                    <p className="text-slate-500">Data de Entrada: {new Date(order.entryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    {order.dueDate && <p className="text-slate-500">Previsão de Entrega: {new Date(order.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                </div>
            </header>

            {/* O RESTO DO SEU CÓDIGO CONTINUA IGUAL... */}
            <section className="my-8">
                <h3 className="text-sm uppercase font-semibold text-slate-500 mb-2">Cliente</h3>
                <p className="font-medium text-slate-800">{client.name}</p>
                <p className="text-slate-600">{client.phone}</p>
                <p className="text-slate-600">{client.email}</p>
            </section>

            <section>
                <table className="w-full text-left">
                    <thead className="border-b-2 border-slate-200">
                        <tr>
                            <th className="py-3 pr-2 font-semibold uppercase text-sm text-slate-500">Item</th>
                            <th className="w-1/2 py-3 px-2 font-semibold uppercase text-sm text-slate-500">Descrição e Materiais</th>
                            <th className="py-3 px-2 font-semibold uppercase text-sm text-slate-500 text-right">Qtde</th>
                            <th className="py-3 px-2 font-semibold uppercase text-sm text-slate-500 text-right">Preço Unit.</th>
                            <th className="py-3 pl-2 font-semibold uppercase text-sm text-slate-500 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {order.items.map((item, index) => (
                            <tr key={item.id}>
                                <td className="py-4 pr-2 font-medium align-top">{index + 1}</td>
                                <td className="py-4 px-2 align-top">
                                    <p className="font-medium text-slate-800">{item.description || "Item sem descrição"}</p>
                                    <p className="text-sm text-slate-600">{item.width}cm x {item.height}cm</p>
                                    <div className="mt-2 text-xs text-slate-500">
                                        {item.materials.map(matUsage => {
                                            const material = materials.find(m => m.id === matUsage.materialId);
                                            return material ? <p key={material.id}>- {material.category}: {material.name}</p> : null
                                        })}
                                    </div>
                                </td>
                                <td className="py-4 px-2 text-right align-top">{item.quantity}</td>
                                <td className="py-4 px-2 text-right align-top">{formatCurrency(item.price)}</td>
                                <td className="py-4 pl-2 text-right font-medium align-top">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mt-8 flex justify-end">
                <div className="w-full md:w-2/5">
                    <div className="flex justify-between py-2">
                        <span className="font-medium text-slate-600">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between py-2 text-red-600">
                        <span className="font-medium">Desconto ({order.discount.type === 'percentage' ? `${order.discount.value}%` : formatCurrency(order.discount.value)})</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-slate-200 mt-2">
                        <span className="font-bold text-lg text-slate-800">Total</span>
                        <span className="font-bold text-lg text-indigo-600">{formatCurrency(total)}</span>
                    </div>
                </div>
            </section>
            
            {order.installments && order.installments.length > 0 && (
                <section className="mt-8">
                    <h3 className="text-sm uppercase font-semibold text-slate-500 mb-2">Plano de Pagamento</h3>
                     <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 font-semibold text-sm text-slate-600">Parcela</th>
                                <th className="px-4 py-2 font-semibold text-sm text-slate-600">Vencimento</th>
                                <th className="px-4 py-2 font-semibold text-sm text-slate-600">Forma de Pagamento</th>
                                <th className="px-4 py-2 font-semibold text-sm text-slate-600">Status</th>
                                <th className="px-4 py-2 font-semibold text-sm text-slate-600 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.installments.map((inst, index) => (
                                <tr key={inst.id}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{new Date(inst.dueDate + 'T00:00:00-03:00').toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{inst.paymentMethod}</td>
                                    <td className="px-4 py-3">{inst.status}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(inst.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {order.notes && (
                <footer className="mt-12 pt-8 border-t">
                    <h3 className="text-sm uppercase font-semibold text-slate-500 mb-2">Observações</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{order.notes}</p>
                </footer>
            )}
        </div>
    </div>
  );
};

export default PrintOrderView;
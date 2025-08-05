import React, { useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import type { Order, OrderItem, Client, Material, View, PaymentInstallment } from '../../types';
import { OrderStatus, MaterialCategory, UnitOfMeasure, PaymentMethod, PaymentStatus } from '../../types';
import { generateDescription } from '../../services/geminiService';
import { SparklesIcon } from '../../constants';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calculateMaterialUsage = (item: Pick<OrderItem, 'width' | 'height'>, material: Material): number => {
  const widthM = item.width / 100;
  const heightM = item.height / 100;

  switch (material.unit) {
    case UnitOfMeasure.METRO_LINEAR:
      return (widthM + heightM) * 2;
    case UnitOfMeasure.METRO_QUADRADO:
      return widthM * heightM;
    case UnitOfMeasure.CHAPA:
    case UnitOfMeasure.UNIDADE:
      return 1;
    default:
      return 0;
  }
};


interface OrderItemFormProps {
    item: OrderItem;
    updateItem: (item: OrderItem) => void;
    removeItem: (id: string) => void;
    index: number;
}

const OrderItemForm: React.FC<OrderItemFormProps> = ({ item, updateItem, removeItem, index }) => {
    const { materials } = useAppContext();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newItem = { ...item, [name]: parseFloat(value) || 0 };
        updateItem(newItem);
    };

    const handleMaterialChange = (category: MaterialCategory, materialId: string) => {
        const material = materials.find(m => m.id === materialId);
        
        const otherMaterials = item.materials.filter(m => {
            const mat = materials.find(mx => mx.id === m.materialId);
            return mat?.category !== category;
        });

        if (material) {
            const quantityUsed = calculateMaterialUsage(item, material);
            const newMaterials = [...otherMaterials, { materialId: material.id, quantityUsed }];
            updateItem({ ...item, materials: newMaterials });
        } else {
            updateItem({ ...item, materials: otherMaterials });
        }
    };
    
    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        const selectedMaterials = item.materials.map(matUse => ({
            material: materials.find(m => m.id === matUse.materialId)!,
            quantity: matUse.quantityUsed,
        })).filter(m => m.material);

        if (item.width > 0 && item.height > 0 && selectedMaterials.length > 0) {
            const desc = await generateDescription(item.width, item.height, selectedMaterials);
            updateItem({ ...item, description: desc });
        }
        setIsGenerating(false);
    };

    const renderMaterialSelector = (category: MaterialCategory) => {
        const selectedMaterialId = item.materials.find(matUse => materials.find(m => m.id === matUse.materialId)?.category === category)?.materialId;
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700">{category}</label>
                <select 
                    value={selectedMaterialId || ''} 
                    onChange={e => handleMaterialChange(category, e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"
                >
                    <option value="">Nenhum</option>
                    {materials.filter(m => m.category === category).map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.stock.toFixed(2)} {m.unit})</option>
                    ))}
                </select>
            </div>
        );
    };

    const itemTotal = item.quantity * item.price;

    return (
        <div className="p-4 border rounded-lg space-y-4 bg-slate-50 relative">
            <button type="button" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <h4 className="font-semibold text-lg">Item {index + 1}</h4>
            <div className="relative">
                <label htmlFor={`description-${item.id}`} className="block text-sm font-medium text-slate-700">Descrição</label>
                <textarea 
                    id={`description-${item.id}`} rows={3} value={item.description}
                    onChange={(e) => updateItem({...item, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"
                    placeholder="Descrição do item (ex: Quadro com foto de família)"
                />
                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="absolute top-7 right-2 text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-wait p-1 rounded-full hover:bg-indigo-100">
                    <SparklesIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label htmlFor={`width-${item.id}`} className="block text-sm font-medium text-slate-700">Largura (cm)</label>
                    <input type="number" id={`width-${item.id}`} name="width" value={item.width} onChange={handleItemChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                </div>
                 <div>
                    <label htmlFor={`height-${item.id}`} className="block text-sm font-medium text-slate-700">Altura (cm)</label>
                    <input type="number" id={`height-${item.id}`} name="height" value={item.height} onChange={handleItemChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                </div>
                <div>
                    <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-slate-700">Quantidade</label>
                    <input type="number" id={`quantity-${item.id}`} name="quantity" value={item.quantity} onChange={handleItemChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                </div>
                <div>
                    <label htmlFor={`price-${item.id}`} className="block text-sm font-medium text-slate-700">Preço Unit.</label>
                    <input type="number" id={`price-${item.id}`} name="price" value={item.price} onChange={handleItemChange} step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                </div>
            </div>
            <div className="text-right">
                <span className="font-semibold text-slate-700">Total do Item: {formatCurrency(itemTotal)}</span>
            </div>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                {renderMaterialSelector(MaterialCategory.MOLDURA)}
                {renderMaterialSelector(MaterialCategory.VIDRO)}
                {renderMaterialSelector(MaterialCategory.FUNDO)}
                {renderMaterialSelector(MaterialCategory.MDF)}
                {renderMaterialSelector(MaterialCategory.PAPEL)}
                {renderMaterialSelector(MaterialCategory.OUTRO)}
            </div>
        </div>
    );
};

const OrderForm: React.FC<{
  onClose: () => void;
  orderToEdit?: Order | null;
}> = ({ onClose, orderToEdit }) => {
  const { clients, materials, addOrder, updateOrder } = useAppContext();
  const today = new Date().toISOString().split('T')[0];

  const [order, setOrder] = useState<Omit<Order, 'id' | 'orderNumber'>>({
    clientId: orderToEdit?.clientId || (clients[0]?.id || ''),
    items: orderToEdit?.items || [],
    status: orderToEdit?.status || OrderStatus.ORCAMENTO,
    notes: orderToEdit?.notes || '',
    entryDate: orderToEdit?.entryDate || today,
    dueDate: orderToEdit?.dueDate || '',
    discount: orderToEdit?.discount || { type: 'fixed', value: 0 },
    installments: orderToEdit?.installments || [],
  });

  const addNewItem = () => {
    const newItem: OrderItem = { id: crypto.randomUUID(), description: '', width: 0, height: 0, quantity: 1, price: 0, materials: [] };
    setOrder(prev => ({...prev, items: [...prev.items, newItem]}));
  };

  const updateItem = useCallback((updatedItem: OrderItem) => {
    setOrder(prev => ({...prev, items: prev.items.map(i => i.id === updatedItem.id ? updatedItem : i) }));
  }, []);

  const removeItem = (id: string) => {
    setOrder(prev => ({...prev, items: prev.items.filter(i => i.id !== id)}));
  };
  
  const handleInstallmentChange = (id: string, field: keyof PaymentInstallment, value: any) => {
      setOrder(prev => ({
          ...prev,
          installments: prev.installments.map(inst => 
              inst.id === id ? { ...inst, [field]: value } : inst
          )
      }));
  };

  const addInstallment = () => {
      const newInstallment: PaymentInstallment = {
          id: crypto.randomUUID(),
          amount: 0,
          dueDate: new Date().toISOString().split('T')[0],
          paymentMethod: PaymentMethod.A_RECEBER,
          status: PaymentStatus.PENDENTE,
      };
      setOrder(prev => ({ ...prev, installments: [...prev.installments, newInstallment] }));
  };
  
  const removeInstallment = (id: string) => {
      setOrder(prev => ({ ...prev, installments: prev.installments.filter(inst => inst.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.clientId) { alert("Por favor, selecione um cliente."); return; }
    if (order.items.length === 0) { alert("O pedido deve ter pelo menos um item."); return; }

    const finalItems = order.items.map(item => {
        const updatedMaterials = item.materials.map(matUse => {
            const material = materials.find(m => m.id === matUse.materialId);
            if (!material) return matUse;
            return { ...matUse, quantityUsed: calculateMaterialUsage(item, material) };
        });
        return { ...item, materials: updatedMaterials };
    });

    const finalOrder = { ...order, items: finalItems };

    if (orderToEdit) {
      updateOrder({ ...finalOrder, id: orderToEdit.id, orderNumber: orderToEdit.orderNumber });
    } else {
      addOrder(finalOrder);
    }
    onClose();
  };

  const subtotal = useMemo(() => order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0), [order.items]);
  const discountAmount = useMemo(() => {
    if (order.discount.type === 'percentage') {
      return subtotal * (order.discount.value / 100);
    }
    return order.discount.value;
  }, [subtotal, order.discount]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  const installmentsTotal = useMemo(() => order.installments.reduce((acc, inst) => acc + inst.amount, 0), [order.installments]);
  const remainingToPay = useMemo(() => total - installmentsTotal, [total, installmentsTotal]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">Cliente</label>
                <select id="clientId" value={order.clientId} onChange={e => setOrder({...order, clientId: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
                    <option value="" disabled>Selecione um cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                <select id="status" value={order.status} onChange={e => setOrder({...order, status: e.target.value as OrderStatus})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label htmlFor="entryDate" className="block text-sm font-medium text-slate-700">Data de Entrada</label>
                <input type="date" id="entryDate" name="entryDate" value={order.entryDate} onChange={e => setOrder({...order, entryDate: e.target.value})} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
            </div>
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Previsão de Entrega</label>
                <input type="date" id="dueDate" name="dueDate" value={order.dueDate} onChange={e => setOrder({...order, dueDate: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
            </div>
        </div>
        
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {order.items.map((item, index) => (
                <OrderItemForm key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} index={index}/>
            ))}
        </div>

        <button type="button" onClick={addNewItem} className="w-full flex justify-center py-2 px-4 border border-dashed border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
            Adicionar Item
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Observações</label>
                <textarea id="notes" value={order.notes} onChange={e => setOrder({...order, notes: e.target.value})} rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-white text-slate-900" />
            </div>
            <div className="space-y-4">
                 <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-slate-700">Subtotal:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="discountType" className="text-sm font-medium text-slate-700">Desconto</label>
                    <select id="discountType" value={order.discount.type} onChange={e => setOrder({...order, discount: { ...order.discount, type: e.target.value as 'fixed' | 'percentage' }})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
                        <option value="fixed">R$</option>
                        <option value="percentage">%</option>
                    </select>
                    <input type="number" value={order.discount.value} onChange={e => setOrder({...order, discount: { ...order.discount, value: parseFloat(e.target.value) || 0 }})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
                 </div>
                  <div className="flex justify-between items-center text-lg text-red-600">
                    <span className="font-medium">Desconto:</span>
                    <span className="font-semibold">- {formatCurrency(discountAmount)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xl font-bold border-t pt-2 mt-2">
                    <span className="text-slate-800">Total:</span>
                    <span className="text-indigo-600">{formatCurrency(total)}</span>
                 </div>
            </div>
        </div>

        <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Plano de Pagamento</h3>
            <div className="space-y-3">
                {order.installments.map(inst => (
                    <div key={inst.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-slate-50 p-3 rounded-lg">
                        <div className="md:col-span-1">
                            <label className="text-xs text-slate-500">Valor</label>
                            <input type="number" step="0.01" value={inst.amount} onChange={e => handleInstallmentChange(inst.id, 'amount', parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-xs text-slate-500">Vencimento</label>
                            <input type="date" value={inst.dueDate} onChange={e => handleInstallmentChange(inst.id, 'dueDate', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900"/>
                        </div>
                         <div className="md:col-span-1">
                            <label className="text-xs text-slate-500">Método</label>
                            <select value={inst.paymentMethod} onChange={e => handleInstallmentChange(inst.id, 'paymentMethod', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
                                {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                         <div className="md:col-span-1">
                            <label className="text-xs text-slate-500">Status</label>
                            <select value={inst.status} onChange={e => handleInstallmentChange(inst.id, 'status', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
                                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1 flex items-end justify-end">
                            <button type="button" onClick={() => removeInstallment(inst.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
                 <button type="button" onClick={addInstallment} className="w-full flex justify-center py-2 px-4 border border-dashed border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                    Adicionar Parcela
                </button>
            </div>
            <div className="mt-4 space-y-1 text-right font-medium">
                <p>Total das Parcelas: <span className="font-bold">{formatCurrency(installmentsTotal)}</span></p>
                <p>Restante a Pagar: <span className={`font-bold ${remainingToPay !== 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(remainingToPay)}</span></p>
            </div>
        </div>

      <div className="flex justify-end pt-4 border-t mt-6">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">{orderToEdit ? 'Atualizar Pedido' : 'Criar Pedido'}</button>
      </div>
    </form>
  );
};


const OrdersView: React.FC<{setView: (view: View, orderId?: string) => void;}> = ({setView}) => {
    const { orders, clients, cancelOrder } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

    const openModal = (order: Order | null = null) => {
        setOrderToEdit(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setOrderToEdit(null);
    };
    
    const sortedOrders = useMemo(() => [...orders].sort((a, b) => b.orderNumber - a.orderNumber), [orders]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Pedidos</h1>
                <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Novo Pedido
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"># Pedido</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data de Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sortedOrders.map((order) => {
                                const client = clients.find(c => c.id === order.clientId);
                                return (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">#{order.orderNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{client?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(order.entryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.status === OrderStatus.CONCLUIDO ? 'bg-green-100 text-green-800' : 
                                            order.status === OrderStatus.EM_PRODUCAO ? 'bg-yellow-100 text-yellow-800' : 
                                            order.status === OrderStatus.CANCELADO ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                                         }`}>{order.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setView('printOrder', order.id)} className="text-green-600 hover:text-green-900">Imprimir</button>
                                        <button onClick={() => openModal(order)} className="text-indigo-600 hover:text-indigo-900 ml-4">Detalhes</button>
                                        {order.status !== OrderStatus.CANCELADO && (
                                            <button onClick={() => cancelOrder(order.id)} className="text-red-600 hover:text-red-900 ml-4">Cancelar</button>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={orderToEdit ? `Editar Pedido #${orderToEdit.orderNumber}` : 'Criar Novo Pedido'}>
                <OrderForm onClose={closeModal} orderToEdit={orderToEdit} />
            </Modal>
        </div>
    );
};

export default OrdersView;
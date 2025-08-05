import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { CubeIcon, UsersIcon, DocumentTextIcon, ChartPieIcon } from '../../constants';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const DashboardView: React.FC = () => {
  const { orders, clients, materials } = useAppContext();

  const totalOrders = orders.length;
  const inProductionOrders = orders.filter(o => o.status === OrderStatus.EM_PRODUCAO).length;
  const lowStockMaterials = materials.filter(m => m.stock < 10);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Pedidos" value={totalOrders} icon={<DocumentTextIcon />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Clientes Cadastrados" value={clients.length} icon={<UsersIcon />} color="bg-green-100 text-green-600" />
        <StatCard title="Tipos de Materiais" value={materials.length} icon={<CubeIcon />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Pedidos em Produção" value={inProductionOrders} icon={<ChartPieIcon />} color="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2"># Pedido</th>
                  <th className="py-2">Cliente</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(order => {
                  const client = clients.find(c => c.id === order.clientId);
                  return (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-3 font-mono text-slate-500">#{order.orderNumber}</td>
                      <td className="py-3 pr-3">{client?.name || 'Cliente não encontrado'}</td>
                      <td className="py-3 pr-3">
                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === OrderStatus.CONCLUIDO ? 'bg-green-100 text-green-800' : 
                            order.status === OrderStatus.EM_PRODUCAO ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === OrderStatus.CANCELADO ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                         }`}>{order.status}</span>
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-500">{new Date(order.entryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Materiais com Baixo Estoque ({'<'} 10 unidades)</h2>
          <ul>
            {lowStockMaterials.length > 0 ? lowStockMaterials.map(material => (
              <li key={material.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                <span>{material.name} ({material.code})</span>
                <span className="font-bold text-red-500">{material.stock} {material.unit}</span>
              </li>
            )) : <p className="text-slate-500">Nenhum material com baixo estoque.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
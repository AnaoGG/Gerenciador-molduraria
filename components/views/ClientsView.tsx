
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import type { Client } from '../../types';

const ClientForm: React.FC<{
  onClose: () => void;
  clientToEdit?: Client | null;
}> = ({ onClose, clientToEdit }) => {
  const { addClient, updateClient } = useAppContext();
  const [client, setClient] = useState<Omit<Client, 'id'>>({
    name: clientToEdit?.name || '',
    phone: clientToEdit?.phone || '',
    email: clientToEdit?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientToEdit) {
      updateClient({ ...client, id: clientToEdit.id });
    } else {
      addClient(client);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
        <input type="text" name="name" id="name" value={client.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefone</label>
        <input type="tel" name="phone" id="phone" value={client.phone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" name="email" id="email" value={client.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancelar</button>
        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{clientToEdit ? 'Atualizar' : 'Salvar'}</button>
      </div>
    </form>
  );
};


const ClientsView: React.FC = () => {
  const { clients, deleteClient } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const openModal = (client: Client | null = null) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
        <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Adicionar Cliente
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(client)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => deleteClient(client.id)} className="text-red-600 hover:text-red-900 ml-4">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={clientToEdit ? 'Editar Cliente' : 'Adicionar Novo Cliente'}>
        <ClientForm onClose={closeModal} clientToEdit={clientToEdit} />
      </Modal>
    </div>
  );
};

export default ClientsView;

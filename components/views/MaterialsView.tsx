import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import type { Material } from '../../types';
import { MaterialCategory, UnitOfMeasure } from '../../types';

const MaterialForm: React.FC<{
  onClose: () => void;
  materialToEdit?: Material | null;
}> = ({ onClose, materialToEdit }) => {
  const { addMaterial, updateMaterial } = useAppContext();
  const [material, setMaterial] = useState<Omit<Material, 'id'>>({
    name: materialToEdit?.name || '',
    code: materialToEdit?.code || '',
    category: materialToEdit?.category || MaterialCategory.MOLDURA,
    unit: materialToEdit?.unit || UnitOfMeasure.METRO_LINEAR,
    stock: materialToEdit?.stock || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMaterial(prev => ({ ...prev, [name]: name === 'stock' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (materialToEdit) {
      updateMaterial({ ...material, id: materialToEdit.id });
    } else {
      addMaterial(material);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome do Material</label>
        <input type="text" name="name" id="name" value={material.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-slate-700">Código</label>
        <input type="text" name="code" id="code" value={material.code} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoria</label>
          <select name="category" id="category" value={material.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
            {Object.values(MaterialCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Unidade</label>
          <select name="unit" id="unit" value={material.unit} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900">
            {Object.values(UnitOfMeasure).map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-slate-700">Estoque Atual</label>
        <input type="number" name="stock" id="stock" value={material.stock} onChange={handleChange} step="0.01" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-slate-900" />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancelar</button>
        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{materialToEdit ? 'Atualizar' : 'Salvar'}</button>
      </div>
    </form>
  );
};


const MaterialsView: React.FC = () => {
  const { materials, deleteMaterial } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  const openModal = (material: Material | null = null) => {
    setMaterialToEdit(material);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMaterialToEdit(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Materiais</h1>
        <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Adicionar Material
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{material.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{material.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{material.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{material.stock.toFixed(2)} {material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(material)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => deleteMaterial(material.id)} className="text-red-600 hover:text-red-900 ml-4">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={materialToEdit ? 'Editar Material' : 'Adicionar Novo Material'}>
        <MaterialForm onClose={closeModal} materialToEdit={materialToEdit} />
      </Modal>
    </div>
  );
};

export default MaterialsView;

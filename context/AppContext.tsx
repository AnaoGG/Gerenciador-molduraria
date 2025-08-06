import React, { createContext, useContext, ReactNode, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Material, Client, Order, User } from '../types';
import { OrderStatus, MaterialCategory, UnitOfMeasure } from '../types';
import { hashPassword } from '../utils/crypto';

interface AppContextType {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber'>) => void;
  updateOrder: (order: Order) => void;
  cancelOrder: (id: string) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, password: string, token: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ---------- CLIENTES ----------
  const [clients, setClients] = useState<Client[]>([]);

  // Função para buscar clientes do backend
  const fetchClients = () => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        console.log('CLIENTES ATUALIZADOS DO BACKEND:', data);

        // "Traduz" os dados do backend para o padrão do frontend
        const translatedClients = data.map((clientDoBackend: any) => ({
          id: clientDoBackend.id.toString(),
          name: clientDoBackend.nome,
          email: clientDoBackend.email,
          phone: clientDoBackend.telefone
        }));

        setClients(translatedClients);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (client: Omit<Client, 'id'>) => {
    console.log("Dados do formulário do cliente:", client);
    try {
      const dataToSend = {
        nome: client.name,
        email: client.email,
        telefone: client.phone
      };

      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar cliente no backend');
      }

      fetchClients();
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert('Não foi possível adicionar o cliente. Verifique os dados.');
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      const dataToSend = {
        nome: updatedClient.name,
        email: updatedClient.email,
        telefone: updatedClient.phone,
      };
      const response = await fetch(`/api/clientes/${updatedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar cliente no backend');
      }
      console.log('Cliente atualizado com sucesso!');
      fetchClients();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Não foi possível atualizar o cliente.');
    }
  };

  const deleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir cliente no backend');
      }
      console.log('Cliente excluído com sucesso!');
      fetchClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Não foi possível excluir o cliente.');
    }
  };

  // ---------- MATERIAIS ----------
  const [materials, setMaterials] = useState<Material[]>([]);

  // Função para buscar materiais do backend
  const fetchMaterials = () => {
    fetch('/api/materiais')
      .then(res => res.json())
      .then(data => {
        console.log('MATERIAIS VINDO DO BACKEND:', data);

        // Traduz e garante que todos os campos esperados pelo frontend existam
        const translatedMaterials = data.map((matDoBackend: any) => ({
          id: matDoBackend.id.toString(),
          name: matDoBackend.nome || '',
          code: matDoBackend.codigo || '',
          category: matDoBackend.categoria || MaterialCategory.MOLDURA,
          unit: matDoBackend.unidade || UnitOfMeasure.METRO_LINEAR,
          stock: matDoBackend.estoque || 0,
          description: matDoBackend.descricao || '',
        }));

        setMaterials(translatedMaterials);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    fetchMaterials();
  }, []);

  const addMaterial = async (material: Omit<Material, 'id'>) => {
    try {
      const dataToSend = {
        codigo: material.code,
        nome: material.name,
        categoria: material.category,
        unidade: material.unit,
        estoque: material.stock
      };

      const response = await fetch('/api/materiais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar material no backend');
      }

      fetchMaterials();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      alert('Não foi possível adicionar o material. Verifique os dados.');
    }
  };

  const updateMaterial = async (updatedMaterial: Material) => {
    try {
      const dataToSend = {
        codigo: updatedMaterial.code,
        nome: updatedMaterial.name,
        categoria: updatedMaterial.category,
        unidade: updatedMaterial.unit,
        descricao: updatedMaterial.description,
        estoque: updatedMaterial.stock
      };
      const response = await fetch(`/api/materiais/${updatedMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar material no backend');
      }
      console.log('Material atualizado com sucesso!');
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      alert('Não foi possível atualizar o material.');
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const response = await fetch(`/api/materiais/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir material no backend');
      }
      console.log('Material excluído com sucesso!');
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      alert('Não foi possível excluir o material.');
    }
  };

  // ---------- PEDIDOS ----------
  const [orders, setOrders] = useState<Order[]>([]);

  // Função para buscar pedidos do backend
  const fetchOrders = () => {
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => {
        console.log('PEDIDOS VINDO DO BACKEND:', data);
        
        const translatedOrders = data.map((pedidoDoBackend: any) => {
          let items = [];
          try {
            items = JSON.parse(pedidoDoBackend.materiais);
          } catch (e) { console.error('Erro ao parsear materiais do pedido:', pedidoDoBackend.id); }
          
          let discount = { type: 'fixed', value: 0 };
          try {
              if (pedidoDoBackend.desconto) discount = JSON.parse(pedidoDoBackend.desconto);
          } catch (e) { console.error('Erro ao parsear desconto do pedido:', pedidoDoBackend.id); }

          let installments = [];
          try {
              if (pedidoDoBackend.valor_parcela) installments = JSON.parse(pedidoDoBackend.valor_parcela);
          } catch (e) { console.error('Erro ao parsear parcelas do pedido:', pedidoDoBackend.id); }

          return {
            id: pedidoDoBackend.id.toString(),
            orderNumber: pedidoDoBackend.id,
            clientId: pedidoDoBackend.cliente_id.toString(),
            items: items,
            status: pedidoDoBackend.status || OrderStatus.ORCAMENTO,
            entryDate: pedidoDoBackend.data || '',
            dueDate: pedidoDoBackend.previsao_entrega || '',
            discount: discount,
            installments: installments,
            notes: pedidoDoBackend.observacoes || '',
          };
        });
        
        setOrders(translatedOrders);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'orderNumber'>) => {
    console.log("Enviando pedido completo para o backend:", order);
    try {
      const dataToSend = {
        cliente_id: Number(order.clientId),
        materiais: JSON.stringify(order.items),
        data: order.entryDate,
        status: order.status,
        previsao_entrega: order.dueDate,
        desconto: JSON.stringify(order.discount),
        valor_total: order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        parcelas: order.installments.length,
        valor_parcela: JSON.stringify(order.installments)
      };

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Falha ao criar pedido no backend');
      }

      fetchOrders();
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
      alert(`Não foi possível adicionar o pedido: ${error}`);
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      const dataToSend = {
        cliente_id: Number(updatedOrder.clientId),
        materiais: JSON.stringify(updatedOrder.items),
        data: updatedOrder.entryDate,
        status: updatedOrder.status,
        previsao_entrega: updatedOrder.dueDate,
        desconto: JSON.stringify(updatedOrder.discount),
        valor_total: updatedOrder.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        parcelas: updatedOrder.installments.length,
        valor_parcela: JSON.stringify(updatedOrder.installments),
        observacoes: updatedOrder.notes || ''
      };
      const response = await fetch(`/api/pedidos/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar pedido no backend');
      }
      console.log('Pedido atualizado com sucesso!');
      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      alert('Não foi possível atualizar o pedido.');
    }
  };

  const cancelOrder = async (id: string) => {
    const orderToCancel = orders.find((o: Order) => o.id === id);

    if (!orderToCancel || orderToCancel.status === OrderStatus.CANCELADO) return;

    if (!window.confirm(`Tem certeza que deseja cancelar o Pedido #${orderToCancel.orderNumber}?`)) {
      return;
    }

    // Devolve o material ao estoque (sua lógica antiga pode ser mantida aqui, se necessário)
    // ...

    // Cria uma cópia do pedido com o novo status
    const updatedOrderData = { ...orderToCancel, status: OrderStatus.CANCELADO };

    // Usa a função que salva no banco de dados
    await updateOrder(updatedOrderData);
    // updateOrder já chama fetchOrders()
  };

  // ---------- AUTH ----------
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth_currentUser', null);
  const isAuthenticated = !!currentUser;

  const signup = async (username: string, password: string, token: string): Promise<boolean> => {
    if (token !== '33618332') {
      alert('Token de validação inválido!');
      return false;
    }

    const fullUsername = `${username.toLowerCase()}@monalisamolduras`;
    const passwordHash = await hashPassword(password);

    try {
      const response = await fetch('/api/usuarios/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fullUsername, passwordHash }),
      });

      if (!response.ok) {
        alert('Erro ao cadastrar usuário (possível nome já em uso)');
        return false;
      }

      const result = await response.json();
      const newUser: User = { id: result.id.toString(), username: fullUsername, passwordHash };
      setCurrentUser(newUser);
      return true;
    } catch (error) {
      console.error('Erro no signup:', error);
      alert('Erro ao cadastrar usuário.');
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const passwordHash = await hashPassword(password);
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase(), passwordHash }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      setCurrentUser({ id: result.id.toString(), username: result.username, passwordHash });
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider
      value={{
        materials,
        setMaterials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        clients,
        setClients,
        addClient,
        updateClient,
        deleteClient,
        orders,
        setOrders,
        addOrder,
        updateOrder,
        cancelOrder,
        isAuthenticated,
        currentUser,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export enum MaterialCategory {
  MOLDURA = 'Moldura',
  VIDRO = 'Vidro',
  MDF = 'MDF',
  PAPEL = 'Papel',
  FUNDO = 'Fundo',
  OUTRO = 'Outro',
}

export enum UnitOfMeasure {
  METRO_LINEAR = 'm',
  METRO_QUADRADO = 'm²',
  CHAPA = 'chapa',
  UNIDADE = 'un',
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: UnitOfMeasure;
  stock: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  id: string;
  description: string;
  width: number;
  height: number;
  quantity: number; // New
  price: number; // New: Unit price
  materials: {
    materialId: string;
    quantityUsed: number; // Per-unit quantity. For stock deduction, this is multiplied by the item's `quantity`.
  }[];
}

export enum OrderStatus {
  ORCAMENTO = 'Orçamento',
  EM_PRODUCAO = 'Em Produção',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado',
}

export enum PaymentMethod {
  CARTAO_CREDITO = 'Cartão de Crédito',
  CARTAO_DEBITO = 'Cartão de Débito',
  PIX = 'PIX',
  DINHEIRO = 'Dinheiro',
  A_RECEBER = 'A Receber',
}

export enum PaymentStatus {
    PENDENTE = 'Pendente',
    PAGO = 'Pago',
}

export interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
}

export interface User {
  id: string;
  username: string; // e.g., 'admin@monalisamolduras'
  passwordHash: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  clientId: string;
  items: OrderItem[];
  status: OrderStatus;
  notes: string;
  entryDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  discount: { // New
    type: 'fixed' | 'percentage';
    value: number;
  };
  installments: PaymentInstallment[];
}

export type View = 'dashboard' | 'orders' | 'materials' | 'clients' | 'printOrder';
import React, { useState } from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/views/DashboardView';
import MaterialsView from './components/views/MaterialsView';
import ClientsView from './components/views/ClientsView';
import OrdersView from './components/views/OrdersView';
import PrintOrderView from './components/views/PrintOrderView';
import AuthView from './components/views/AuthView';
import type { View } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAppContext();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const setView = (view: View, orderId: string | null = null) => {
    setCurrentView(view);
    setActiveOrderId(orderId);
  };

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView setView={setView} />;
      case 'materials':
        return <MaterialsView />;
      case 'clients':
        return <ClientsView />;
      case 'printOrder':
        return activeOrderId ? <PrintOrderView orderId={activeOrderId} setView={setView} /> : <OrdersView setView={setView} />;
      default:
        return <DashboardView />;
    }
  };

  return (
      <>
        {currentView === 'printOrder' ? (
          <main className="flex-1 bg-white">
            {renderView()}
          </main>
        ) : (
          <div className="flex h-screen bg-slate-100 text-slate-800">
            <Sidebar currentView={currentView} setCurrentView={setView} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {renderView()}
            </main>
          </div>
        )}
      </>
  );
}


const App: React.FC = () => {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
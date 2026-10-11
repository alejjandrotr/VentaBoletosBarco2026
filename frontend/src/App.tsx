import { useState } from 'react';
import { BoxOfficePage } from './components/pages/BoxOfficePage';
import { AdminDespachoViajesPage } from './components/pages/AdminDespachoViajesPage';
import { AdminItinerariosPage } from './components/pages/AdminItinerariosPage';

type AppTab = 'TAQUILLA' | 'DESPACHO' | 'ITINERARIOS';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('DESPACHO');

  return (
    <div className="min-h-screen bg-[#F4FCFB] text-[#243C4C] font-sans antialiased selection:bg-[#5289AD] selection:text-white">
      {/* Barra de Navegación Global */}
      <header className="bg-[#243C4C] border-b border-[#698696]/30 px-6 py-3.5 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo y Nombre del Sistema */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#5289AD] flex items-center justify-center text-xl shadow-md">
              🚢
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Sistema de Transporte Marítimo
              </h1>
              <span className="text-xs text-[#ACBCBF] font-medium">
                Gestión de Boletos, Despacho y Reglas de Itinerario
              </span>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <nav className="flex items-center gap-1.5 bg-[#1B2F3D] p-1 rounded-xl border border-[#698696]/40">
            <button
              type="button"
              onClick={() => setActiveTab('TAQUILLA')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'TAQUILLA'
                  ? 'bg-[#5289AD] text-white shadow-xs'
                  : 'text-[#ACBCBF] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎟️</span>
              <span>Taquilla</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DESPACHO')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DESPACHO'
                  ? 'bg-[#5289AD] text-white shadow-xs'
                  : 'text-[#ACBCBF] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>⚓</span>
              <span>Panel de Despacho</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ITINERARIOS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ITINERARIOS'
                  ? 'bg-[#5289AD] text-white shadow-xs'
                  : 'text-[#ACBCBF] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📋</span>
              <span>Plantillas Itinerario</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'TAQUILLA' && <BoxOfficePage />}
        {activeTab === 'DESPACHO' && <AdminDespachoViajesPage />}
        {activeTab === 'ITINERARIOS' && <AdminItinerariosPage />}
      </main>
    </div>
  );
}

export default App;

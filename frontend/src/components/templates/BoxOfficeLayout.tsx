import React from 'react';

export interface BoxOfficeLayoutProps {
  header: React.ReactNode;
  buyerForm: React.ReactNode;
  passengerList: React.ReactNode;
  summarySidebar: React.ReactNode;
  modal?: React.ReactNode;
}

export const BoxOfficeLayout: React.FC<BoxOfficeLayoutProps> = ({
  header,
  buyerForm,
  passengerList,
  summarySidebar,
  modal,
}) => {
  return (
    <div className="min-h-screen bg-[#F4FCFB] text-[#243C4C] font-sans antialiased selection:bg-[#5289AD] selection:text-white">
      {/* Top Navbar Header */}
      <nav className="bg-[#243C4C] border-b border-[#698696]/30 px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#5289AD] flex items-center justify-center font-black text-white text-lg shadow-md">
              🚌
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
                Sistema de Venta en Taquilla
              </h1>
              <span className="text-xs text-[#ACBCBF] font-medium">Terminal Terrestre Punto a Punto</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex bg-[#1a2d39] text-[#F4FCFB] text-xs font-semibold px-3 py-1 rounded-full border border-[#698696]/40">
              Operador: Taquilla #01
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#5289AD] animate-pulse" title="Sistema en línea" />
          </div>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-5">
          {header}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {buyerForm}
              {passengerList}
            </div>

            <div className="lg:col-span-1">{summarySidebar}</div>
          </div>
        </div>
      </main>

      {modal}
    </div>
  );
};

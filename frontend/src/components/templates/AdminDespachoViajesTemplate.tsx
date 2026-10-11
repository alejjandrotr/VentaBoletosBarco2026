import React from 'react';

export interface AdminDespachoViajesTemplateProps {
  header: React.ReactNode;
  selectorFecha: React.ReactNode;
  grilla: React.ReactNode;
}

export const AdminDespachoViajesTemplate: React.FC<AdminDespachoViajesTemplateProps> = ({
  header,
  selectorFecha,
  grilla,
}) => {
  return (
    <div className="space-y-6">
      {header}
      {selectorFecha}
      {grilla}
    </div>
  );
};

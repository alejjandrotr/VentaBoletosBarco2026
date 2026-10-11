import React from 'react';

export interface AdminItinerariosTemplateProps {
  header: React.ReactNode;
  content: React.ReactNode;
  modal?: React.ReactNode;
}

export const AdminItinerariosTemplate: React.FC<AdminItinerariosTemplateProps> = ({
  header,
  content,
  modal,
}) => {
  return (
    <div className="space-y-6">
      {header}
      {content}
      {modal}
    </div>
  );
};

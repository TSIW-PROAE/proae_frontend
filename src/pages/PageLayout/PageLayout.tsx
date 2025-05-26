import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode; // Footer agora é opcional
}

const PageLayout: React.FC<PageLayoutProps> = ({ footer, children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Conteúdo principal com Sidebar e Conteúdo */}
      <div className="flex flex-1">
        {/* Conteúdo da Página */}
        <main className="flex-1 p-6 bg-white">
          {children}
        </main>
      </div>

      {/* Footer (renderiza apenas se existir) */}
      {footer && (
        <footer className="bg-gray-200 p-4">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default PageLayout;

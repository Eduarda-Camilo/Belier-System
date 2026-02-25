import { useState } from 'react';
import { ComponentDocPage } from './pages/ComponentDocPage';
import { NovoComponentePage } from './pages/NovoComponentePage';
import { EditarComponentePage } from './pages/EditarComponentePage';
import { ChangeLogPage } from './pages/ChangeLogPage';
import { DocsPage } from './pages/DocsPage';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { InboxPage } from './pages/InboxPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;

  // Simple router
  const [currentPage, setCurrentPage] = useState('docs'); // Default to Docs for public view
  // Wrapper for navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#111822] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Function to render the active page
  const renderPage = () => {
    // Protected routes logic
    const isProtected = currentPage === 'usuarios' || currentPage === 'novo-componente' || currentPage.startsWith('editar-componente');
    if (isProtected && !isLoggedIn) {
      return <LoginPage onNavigate={handleNavigate} />;
    }

    // Parameterized routes
    if (currentPage.startsWith('componente/')) {
      const id = currentPage.split('/')[1];
      // Passing id to ComponentDocPage
      return <ComponentDocPage componentId={id} onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
    }

    if (currentPage.startsWith('editar-componente/')) {
      const id = currentPage.split('/')[1];
      return <EditarComponentePage componentId={id} onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
    }

    // Static routes
    switch (currentPage) {
      case 'login': return isLoggedIn ? <DocsPage onNavigate={handleNavigate} activePage="docs" isPublic={false} /> : <LoginPage onNavigate={handleNavigate} />;
      case 'cadastro': return isLoggedIn ? <DocsPage onNavigate={handleNavigate} activePage="docs" isPublic={false} /> : <CadastroPage onNavigate={handleNavigate} />;
      case 'inbox': return <InboxPage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
      case 'novo-componente': return <NovoComponentePage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
      case 'changelog': return <ChangeLogPage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
      case 'docs': return <DocsPage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
      case 'usuarios': return <UsuariosPage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
      default: return <DocsPage onNavigate={handleNavigate} activePage={currentPage} isPublic={!isLoggedIn} />;
    }
  };

  return (
    <div className="antialiased">
      {renderPage()}
    </div>
  );
}

export default App;

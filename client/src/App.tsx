import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Imports dos Componentes e Páginas
import Login from './pages/Login';
import Header from './components/Header';
import Home from './pages/Home';
import Chat from './pages/Chat'; // Certifique-se de que este arquivo existe em src/pages/Chat.tsx

function App() {
  // Estado para controlar a abertura do Modal de Login
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          
          {/* Header: Recebe a função para abrir o modal */}
          <Header onLoginClick={() => setIsLoginOpen(true)} />

          <main className="flex-1 w-full max-w-6xl mx-auto p-4">
            <Routes>
              {/* 1. Rota Principal (Home/Feed de salas) */}
              <Route path="/" element={<Home />} />
              
              {/* 2. Rota de Compatibilidade (Dashboard redireciona para Home) */}
              <Route path="/dashboard" element={<Navigate to="/" />} />
              
              {/* 3. Rota do Chat Dinâmica (Precisa do ID da sala) */}
              <Route 
                path="/chat/:roomId" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              />

              {/* Se tentar acessar /chat sem ID, volta para a Home para escolher uma sala */}
              <Route path="/chat" element={<Navigate to="/" />} />
              
              {/* Qualquer rota desconhecida volta pro início */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* O Modal de Login fica fora das rotas, flutuando por cima */}
          <Login 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
          />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
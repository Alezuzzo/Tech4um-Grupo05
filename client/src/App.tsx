import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* A rota "/" agora é o dashboard, gerencia o header e o modal de login internamente.
          */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Rota para compatibilidade, caso acessem /dashboard */}
          <Route path="/dashboard" element={<Navigate to="/" />} />

          {/* Rota do Chat Protegida precisa do ID da sala (:roomId) para saber onde entrar
          */}
          <Route 
            path="/chat/:roomId" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          
          {/* Qualquer rota desconhecida volta pro início */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
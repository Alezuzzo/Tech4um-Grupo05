import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Importando as páginas
import Login from './pages/Login';

// Ajustei o import aqui (sem o .tsx e com chaves se não for export default)
import  Header  from './components/Header';

// Chat provisório
const Chat = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-emerald-600 mb-2">Chat em Tempo Real</h2>
    <p className="text-gray-600">Você está logado e seguro!</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        
        {/* Wrapper Principal: Garante altura mínima e cor de fundo */}
        <div className="min-h-screen flex flex-col bg-white">
          
          {/* Header fixo no topo */}
          <Header />

          {/* Main: Onde o conteúdo das rotas vai aparecer */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-4">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Login />} />
              
              {/* Rotas Privadas (só entra se tiver logado) */}
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              />
              
              {/* Qualquer outra rota joga pro Login */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

        </div>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
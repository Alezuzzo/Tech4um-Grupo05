import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Login from './pages/Login';
import Header from './components/Header';

const Home = () => (
  <div className="text-center text-gray-400 mt-20">
    <h2 className="text-xl">conteudo</h2>
  </div>
);

const Chat = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-emerald-600 mb-2">Chat em Tempo Real</h2>
    <p className="text-gray-600">Você está logado e seguro!</p>
  </div>
);

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          
          <Header onLoginClick={() => setIsLoginOpen(true)} />

          <main className="flex-1 w-full max-w-7xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
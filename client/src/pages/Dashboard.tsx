import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

// Imports Visuais
import Header from '../components/Header';
import Login from './Login';
import Home, { type Room } from './Home';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // --- ESTADOS (Dados e Controle) ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // 1. Busca as salas na API
  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error("Erro ao carregar salas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  // 2. Tenta entrar na sala (Lógica de Auth)
  const handleEnterRoom = (roomId: string) => {
    if (user) {
      navigate(`/chat/${roomId}`);
    } else {
      setPendingRoomId(roomId);
      setIsLoginModalOpen(true);
    }
  };

  // 3. Callback de sucesso do Login
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (pendingRoomId) {
      navigate(`/chat/${pendingRoomId}`);
      setPendingRoomId(null); 
    }
  };

  // 4. Logout e Navegação
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* O Dashboard organiza o Layout Geral */}
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {/* A Home recebe apenas os dados e exibe */}
        <Home 
          rooms={rooms} 
          loading={loading} 
          onEnterRoom={handleEnterRoom}
        />
      </main>

      {/* O Modal vive no Dashboard para ser global nessa tela */}
      <Login
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
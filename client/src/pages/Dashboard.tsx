import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import type { Room } from '../types';

// Imports dos Componentes Visuais (Caminhos corrigidos)
import { Header } from '../components/Header';
import  Login  from '../pages/Login'; // Nome corrigido para Login.tsx
import { CreateRoomModal } from '../components/CreateRoomModal'; // Faltava este
import Home from '../pages/Home'; // Visual da lista de salas

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // busca as salas na API
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // entrar na Sala
  const handleEnterRoom = (roomId: string) => {
    if (user) {
      navigate(`/chat/${roomId}`);
    } else {
      setPendingRoomId(roomId);
      setIsLoginModalOpen(true);
    }
  };

  // criar Sala
  const handleCreateRoomClick = () => {
    if (user) {
      setIsCreateRoomOpen(true);
    } else {
      // Se tentar criar deslogado, pede login
      setIsLoginModalOpen(true);
    }
  };

  // callback de sucesso do Login
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    
    // se o usuário estava tentando entrar numa sala específica, redireciona
    if (pendingRoomId) {
      navigate(`/chat/${pendingRoomId}`);
      setPendingRoomId(null); 
    }
  };

  // logout
  const handleLogout = () => {
    logout();
    navigate('/'); // recarrega o dashboard como visitante
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* Header Global */}
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <Home 
          rooms={rooms} 
          loading={loading} 
          onEnterRoom={handleEnterRoom}
          onCreateRoom={handleCreateRoomClick}
        />
      </main>


      {/* Modal de Login / Cadastro */}
      <Login
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Modal de Criar Sala (Faltava este no seu código) */}
      <CreateRoomModal 
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSuccess={() => {
          fetchRooms(); // Atualiza a lista quando criar sala nova
        }}
      />
    </div>
  );
}
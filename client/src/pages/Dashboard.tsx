import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import type { Room } from '../types';
import { Header } from '../components/Header';
import { CreateRoomModal } from '../components/CreateRoomModal'; 
import Login from './Login'; 
import Home from './Home'; 

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  //estado para o filtro de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  
  //estado inteligente para lembrar ação pendente
  const [pendingAction, setPendingAction] = useState<{ type: 'join' | 'create', roomId?: string } | null>(null);

  // busca salas
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
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  // exclui sala
  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta sala?")) {
      try {
        await api.delete(`/rooms/${roomId}`);
        //atualiza a lista localmente removendo a sala deletada
        setRooms(prev => prev.filter(r => r.id !== roomId));
      } catch (error) {
        console.error("Erro ao excluir sala:", error);
        alert("Erro ao excluir sala. Verifique se você é o dono.");
      }
    }
  };

  //lógica de busca e ranking
  const processedRooms = useMemo(() => {
    if (rooms.length === 0) return [];

    let list = [...rooms];

    // identifica destaque
    const sortedByActivity = [...list].sort((a, b) => 
      (b.totalMessages || 0) - (a.totalMessages || 0)
    );
    const topRoomId = sortedByActivity[0].id;
    const maxMessages = sortedByActivity[0].totalMessages || 0;

    // marca destaque
    list = list.map(r => ({
      ...r,
      isFeatured: r.id === topRoomId && maxMessages > 0
    }));

    // filtro busca
    if (searchTerm.trim()) {
      list = list.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // ordenação
    list.sort((a, b) => {
      if (a.isFeatured === b.isFeatured) return 0;
      return a.isFeatured ? -1 : 1; 
    });

    return list;
  }, [rooms, searchTerm]);

  // entra sala
  const handleEnterRoom = (roomId: string) => {
    if (user) {
      navigate(`/chat/${roomId}`);
    } else {
      setPendingAction({ type: 'join', roomId });
      setIsLoginModalOpen(true);
    }
  };

  // cria sala
  const handleCreateRoomClick = () => {
    if (user) {
      setIsCreateRoomOpen(true);
    } else {
      setPendingAction({ type: 'create' });
      setIsLoginModalOpen(true);
    }
  };

  // sucesso no login
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (pendingAction) {
      if (pendingAction.type === 'join' && pendingAction.roomId) {
        navigate(`/chat/${pendingAction.roomId}`);
      } else if (pendingAction.type === 'create') {
        setIsCreateRoomOpen(true);
      }
      setPendingAction(null);
    }
  };

  //logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <Home 
          rooms={processedRooms} 
          loading={loading} 
          onEnterRoom={handleEnterRoom}
          onCreateRoom={handleCreateRoomClick}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUserId={user?.id}
          onDeleteRoom={handleDeleteRoom}
        />
      </main>

      <Login
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <CreateRoomModal 
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSuccess={() => {
          fetchRooms(); 
        }}
      />
    </div>
  );
}
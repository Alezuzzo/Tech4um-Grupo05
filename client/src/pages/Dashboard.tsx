import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import  Login  from '../pages/Login';
import  Header  from '../components/Header'; 
import api from '../services/api';

// interface para os dados da sala
interface Room {
  id: string;
  name: string;
  description: string;
  count?: number; //compatibilidade com json-server
  participantsCount?: number; 
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // estado para lembrar qual sala o usuario tentou entrar antes de logar
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // busca das salas
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

  // lógica clique na sala
  const handleEnterRoom = (roomId: string) => {
    if (user) {
      // Se já está logado, entra direto
      navigate(`/chat/${roomId}`);
    } else {
      setPendingRoomId(roomId);
      setIsLoginModalOpen(true);
    }
  };

  // função chamada pelo Modal assim que o login funciona
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    
    // se tinha uma sala pendente, redireciona pra ela agora
    if (pendingRoomId) {
      navigate(`/chat/${pendingRoomId}`);
      setPendingRoomId(null); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={logout}
      />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl text-gray-400 font-light">Opa!</h2>
          <h3 className="text-xl font-bold text-gray-600">Sobre o que gostaria de falar hoje?</h3>
        </div>

        <div className="flex gap-2 mb-10">
          <input 
            className="flex-1 bg-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Em busca de uma sala? Encontre-a aqui"
          />
          <button className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition">
            Buscar
          </button>
        </div>

        {/* grid salas */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            Carregando salas...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => handleEnterRoom(room.id)}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 group"
              >
                <h4 className="font-extrabold text-blue-500 text-lg mb-1 group-hover:text-blue-700">
                  {room.name}
                </h4>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[60px]">
                  {room.description}
                </p>

                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                  </div>
                  
                  <span className="text-xs font-bold text-blue-400 bg-blue-50 px-3 py-1 rounded-full">
                    +{room.count || room.participantsCount || 0} pessoas
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* modal login */}
      <Login
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess} //lógica de redirecionamento aqui
      />
    </div>
  );
}
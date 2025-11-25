import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Login from './Login';
import api from '../services/api';

// Interface para os dados da sala
interface Room {
  id: string;
  name: string;
  description: string;
  count?: number; // Compatibilidade com json-server
  participantsCount?: number; 
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle local do Modal (apenas para quando clicar na sala)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // 1. Busca das salas ao carregar a página
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

  // 2. Lógica: Quando clica em uma sala
  const handleEnterRoom = (roomId: string) => {
    if (user) {
      // Se já está logado, entra direto
      navigate(`/chat/${roomId}`);
    } else {
      // Se não, guarda o ID da sala e abre o login
      setPendingRoomId(roomId);
      setIsLoginModalOpen(true);
    }
  };

  // 3. Callback: Quando o login dá certo
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    
    // Redireciona para a sala que o usuário tentou entrar
    if (pendingRoomId) {
      navigate(`/chat/${pendingRoomId}`);
      setPendingRoomId(null); 
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-8 mt-12 md:mt-14">
        
        <section className="flex flex-col gap-1.5">
            <h1 className="text-3xl text-gray-500 font-light">Opa!</h1>
            <p className="text-xl text-gray-500 font-bold">Sobre o que gostaria de falar hoje?</p>
        </section>

        <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-1 border border-[#0078D4] rounded-lg justify-between items-center bg-white pl-1">
                <input 
                    className="px-4 py-3 focus:outline-none text-sm placeholder-gray-400 w-full rounded-l-lg" 
                    type="text" 
                    placeholder="Em busca de uma sala? Encontre-a aqui"
                />
                <button className='bg-[#0078D4] text-white font-bold px-5 py-3 rounded-lg transition-colors shadow-md hover:bg-[#0060AA] m-1 h-[calc(100%-8px)] flex items-center justify-center'>
                    →
                </button>
            </div>
            <button className='bg-[#0078D4] text-white px-5 py-3 rounded-lg transition-colors w-fit shadow-md hover:bg-[#0060AA] font-medium whitespace-nowrap'>
                Ou crie seu próprio 4um
            </button>
        </div>

        {/* SECTION: Grid de Salas (Funcionalidade Mantida) */}
        {loading ? (
            <div className="text-center py-20 text-gray-400 animate-pulse">
            Carregando salas...
            </div>
        ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <div 
                key={room.id}
                onClick={() => handleEnterRoom(room.id)}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 group relative"
                >
                {/* Título da Sala */}
                <h4 className="font-extrabold text-[#0078D4] text-lg mb-1 group-hover:underline">
                    {room.name}
                </h4>
                
                {/* Descrição */}
                <p className="text-gray-500 text-sm leading-relaxed mb-12 line-clamp-3">
                    {room.description}
                </p>

                {/* Rodapé do Card */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center border-t border-gray-100 pt-4">
                    
                    {/* Avatares (Decorativo) */}
                    <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                    </div>
                    
                    {/* Contador de Pessoas */}
                    <span className="text-xs font-bold text-blue-400 bg-blue-50 px-3 py-1 rounded-full">
                    +{room.count || room.participantsCount || 0} pessoas
                    </span>
                </div>
                </div>
            ))}
            </section>
        )}

        {/* Modal de Login (Controlado localmente para o fluxo da sala) */}
        <Login
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)}
            onSuccess={handleLoginSuccess}
        />
    </div>
  );
}
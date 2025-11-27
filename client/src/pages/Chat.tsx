import { useState, useEffect, useContext, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import socket from '../services/socket'; 
import api from '../services/api'; 
import type { Message, Participant, Room } from '../types';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [privateTarget, setPrivateTarget] = useState<Participant | null>(null);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // estado para salas reais
  const [rooms, setRooms] = useState<Room[]>([]);

  // busca lista de salas para o sidebar
  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error("Erro ao buscar lista de salas:", error);
      }
    }
    fetchRooms();
  }, []); 

  // carrega histórico ao entrar na sal
  useEffect(() => {
    if (!roomId) return;

    async function loadHistory() {
      try {
        const response = await api.get(`/chat/${roomId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.warn("Backend real falhou, tentando mock...");
        try {
          const mockResponse = await api.get(`/messages`, { params: { roomId } });
          setMessages(mockResponse.data);
        } catch (mockError) {
          console.error("Erro ao buscar histórico:", mockError);
          setMessages([]); 
        }
      } finally {
        setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
      }
    }
    
    loadHistory();
  }, [roomId]);

  //conexão com o socket
  useEffect(() => {
    if (!user || !roomId) return;

    // funcao para entrar na sala
    const handleJoinRoom = () => {
      socket.emit("join_room", { roomId, user });
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleJoinRoom();
    }

    const handleReceiveMessage = (data: Message) => {
      if (data.isPrivate) {
        const isForMe = data.receiverId === user.id;
        const isFromMe = data.senderId === user.id;
        if (!isForMe && !isFromMe) return; 
      }

      setMessages((prev) => [...prev, data]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleRoomUsers = (users: any[]) => {
      const realParticipants: Participant[] = users.map((u) => ({
        id: u.userId,
        name: u.username,
        isOnline: true,
      }));
      setParticipants(realParticipants);
    };

    socket.on("connect", handleJoinRoom);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("room_users", handleRoomUsers);

    return () => {
      socket.off("connect", handleJoinRoom);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("room_users", handleRoomUsers);
      socket.emit("leave_room", roomId);
    };
  }, [roomId, user]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId) return;

    const payload = {
      content: newMessage,
      senderId: user.id,
      senderName: user.username,
      roomId: roomId,
      isPrivate: !!privateTarget,
      receiverId: privateTarget?.id
    };

    socket.emit("send_message", payload);
    setNewMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setPrivateTarget(null);
    }
  };

  //encontra o nome da sala atual para exibir no header
  const currentRoomName = rooms.find(r => r.id === roomId)?.name || roomId;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* sidebar esquerda com os pariticipantes */}
      <aside className="w-64 bg-gray-50 border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-blue-600 mb-2">
            Participantes ({participants.length})
          </h2>
          <div className="text-xs text-gray-500 truncate" title={currentRoomName}>
            Sala: {currentRoomName}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {participants.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Ninguém online além de você... 👻
            </p>
          )}

          {participants.map(p => (
            <div 
              key={p.id} 
              onClick={() => p.id !== user?.id && setPrivateTarget(p)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors 
                ${p.id === user?.id ? 'opacity-50 cursor-default' : 'hover:bg-gray-200'}
                ${privateTarget?.id === p.id ? 'bg-orange-100 border border-orange-200' : ''}
              `}
              title={p.id === user?.id ? "Você" : "Clique para mensagem privada"}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold ${p.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate font-medium">
                  {p.name} {p.id === user?.id && '(Você)'}
                </p>
                {privateTarget?.id === p.id && <p className="text-[10px] text-orange-600 font-bold">Privado selecionado</p>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* area princiapl */}
      <main className="flex-1 flex flex-col relative bg-gray-50">
        
        <header className="bg-white p-4 border-b flex items-center justify-between shadow-sm z-10 h-16">
           <button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
             ← Voltar para o dashboard
           </button>
           
           <div className="text-right">
             <h1 className="font-bold text-lg text-blue-600 truncate max-w-[200px]">
               {currentRoomName}
             </h1>
             <span className="text-xs text-gray-400">Tech4um</span>
           </div>
        </header>

        {/* lista de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a dizer Olá!</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={index} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 text-white flex items-center justify-center text-xs">{msg.senderName.charAt(0).toUpperCase()}</div>}
                
                <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1 justify-end">
                     {!isMe && <span className="font-bold text-gray-700 text-sm mr-auto">{msg.senderName}</span>}
                     {msg.isPrivate && (
                       <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                         🔒 Privado {isMe && privateTarget ? `para ${privateTarget.name}` : ''}
                       </span>
                     )}
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : msg.isPrivate 
                        ? 'bg-orange-50 border border-orange-200 text-gray-800 rounded-tl-none'
                        : 'bg-white border border-gray-100 text-gray-600 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* input area */}
        <div className={`p-4 transition-colors duration-300 ${privateTarget ? 'bg-[#993300]' : 'bg-[#0078D4]'}`}>
          <div className="flex justify-between items-center mb-2 px-1 text-white text-xs font-bold">
            <p>
              {privateTarget 
                ? `🔒 Enviando para ${privateTarget.name} (Somente vocês dois verão)`
                : "📢 Enviando para todos"
              }
            </p>
            
            {privateTarget && (
              <button 
                onClick={() => setPrivateTarget(null)} 
                className="text-white text-xs underline hover:text-gray-200 cursor-pointer"
              >
                Cancelar envio de mensagem privada
              </button>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="bg-white rounded-full flex items-center px-4 py-2 shadow-lg">
            <input 
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
              placeholder={privateTarget ? "Escreva aqui seu segredo..." : "Escreva aqui uma mensagem maneira..."}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className={`font-bold p-2 transition-colors ${privateTarget ? 'text-[#993300]' : 'text-[#0078D4]'}`}>
              ➤
            </button>
          </form>
        </div>

      </main>

      {/* sidebar de outras salas */}
      <aside className="w-64 bg-white border-l p-4 hidden lg:block overflow-y-auto">
        <div className="bg-[#0078D4] text-white p-4 rounded-xl mb-4 shadow-lg">
          <h3 className="font-bold text-sm truncate">{currentRoomName}</h3>
          <p className="text-xs opacity-80 text-blue-100">Sala Atual</p>
        </div>

        <h3 className="font-bold text-blue-500 mb-4 text-sm px-1">Outras Salas</h3>
        
        <div className="space-y-3">
          {rooms
            .filter(r => r.id !== roomId) //para não mostra a sala atual na lista
            .map(room => (
              <div 
                key={room.id}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition border border-transparent hover:border-gray-200"
              >
                 <p className="font-bold text-sm text-gray-600 truncate">{room.name}</p>
                 <p className="text-xs text-gray-400">
                   {/* se o back mandar count, usa, senão usa participantsCount ou 0 */}
                   +{room.count || room.participantsCount || 0} pessoas
                 </p>
              </div>
          ))}
          
          {rooms.length <= 1 && (
            <p className="text-xs text-gray-400 px-1">Nenhuma outra sala disponível.</p>
          )}
        </div>
      </aside>

    </div>
  );
}
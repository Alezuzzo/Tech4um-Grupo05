import { useState, useEffect, useContext, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import socket from '../services/socket';
import api from '../services/api'; // API para buscar histórico
import type { Message, Participant } from '../types';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // controla se a mensagem é privada
  const [privateTarget, setPrivateTarget] = useState<Participant | null>(null);

  // Mock de participantes (pode criar uma rota GET /rooms/:id/users depois)
  const participants: Participant[] = [
    { id: '1', name: 'Lara Alves', isOnline: true },
    { id: '2', name: 'Lucas Pinheiro', isOnline: true },
    { id: 'system', name: 'Admin', isOnline: true },
    // adiciona voce mesmo na lista pra testar, caso nao venha do back ainda
    ...(user ? [{ id: user.id, name: user.username, isOnline: true }] : [])
  ];

  //carrega o historico
  useEffect(() => {
    if (!roomId) return;

    async function loadHistory() {
      try {
        // tenta a rota do Backend Real (/chat/:id/messages)
        const response = await api.get(`/chat/${roomId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.warn("Backend real falhou, tentando rota de Mock (json-server)...");
        try {
          // se falhar (404/400), tenta a rota do json-server (/messages?roomId=...)
          const mockResponse = await api.get(`/messages`, {
            params: { roomId: roomId }
          });
          setMessages(mockResponse.data);
        } catch (mockError) {
          console.error("Erro ao buscar histórico (Real e Mock falharam):", mockError);
          setMessages([]); //inicia vazio se tudo der errado
        }
      } finally {
        setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
      }
    }

    loadHistory();
  }, [roomId]);

  // conexao do socket em tempo real
  useEffect(() => {
    if (!user || !roomId) return;

    // garante conexão e entra na sala
    socket.connect();
    socket.emit("join_room", roomId);

    const handleReceiveMessage = (data: Message) => {
      // lógica de segurança visual para Privado
      if (data.isPrivate) {
        const isForMe = data.receiverId === user.id;
        const isFromMe = data.senderId === user.id;

        if (!isForMe && !isFromMe) return;
      }

      setMessages((prev) => [...prev, data]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // ouve o evento do Backend
    socket.on("receive_message", handleReceiveMessage);

    // cleanup ao sair da pagina
    return () => {
      socket.off("receive_message", handleReceiveMessage);
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

    // envia pro Backend (que vai salvar no banco e devolver via 'receive_message')
    socket.emit("send_message", payload);
    setNewMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setPrivateTarget(null);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">

      {/* sidebar participantes */}
      <aside className="w-64 bg-gray-50 border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-blue-600 mb-2">Participantes</h2>
          <div className="text-xs text-gray-500">Sala: {roomId}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {participants.map(p => (
            <div
              key={p.id}
              onClick={() => p.id !== user?.id && setPrivateTarget(p)} // não pode mandar privado pra si mesmo
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

        {/* header */}
        <header className="bg-white p-4 border-b flex items-center justify-between shadow-sm z-10 h-16">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
            ← Voltar para o dashboard
          </button>

          <div className="text-right">
            <h1 className="font-bold text-lg text-blue-600">{roomId}</h1>
            {/* placeholder pois ainda não temos info da sala na rota do chat */}
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

                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe
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

        {/* input area dinamica */}
        <div className={`p-4 transition-colors duration-300 ${privateTarget ? 'bg-[#993300]' : 'bg-[#0078D4]'}`}>
          <div className="flex justify-between items-center mb-2 px-1 text-white text-xs font-bold">
            <p>
              {privateTarget
                ? `nviando para ${privateTarget.name} (Somente vocês dois verão)`
                : "Enviando para todos"
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

      {/* sidebar */}
      <aside className="w-64 bg-white border-l p-4 hidden lg:block">
        <div className="bg-[#0078D4] text-white p-4 rounded-xl mb-4 shadow-lg">
          <h3 className="font-bold text-sm truncate">{roomId}</h3>
          <p className="text-xs opacity-80 text-blue-100">Sala Atual</p>
        </div>

        <h3 className="font-bold text-blue-500 mb-4 text-sm px-1">Outras Salas</h3>

        <div className="space-y-3">
          {['#segurança', 'Thinking about...', 'Tem_muita_coisa', 'Systemmmmm', 'E as férias?'].map(room => (
            <div key={room} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition border border-transparent hover:border-gray-200">
              <p className="font-bold text-sm text-gray-600">{room}</p>
              <p className="text-xs text-gray-400">+10 pessoas</p>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
}
import { useState, useEffect, useContext, FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
// import api from '../services/api'; //descomentar quando tiver o backend real para buscar
import type { Message, Participant } from '../types';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // estado do controle da mensagem privada
  const [privateTarget, setPrivateTarget] = useState<Participant | null>(null);
  
  // Mock de participantes (depoisé do socket/api)
  const participants: Participant[] = [
    { id: '1', name: 'Lara Alves', isOnline: true },
    { id: '2', name: 'Lucas Pinheiro', isOnline: true },
    { id: '3', name: 'Gabriela', isOnline: true },
    { id: '4', name: 'Wellington', isOnline: false },
    { id: '5', name: 'Leandro', isOnline: false },
  ];

  useEffect(() => {
    // mock: Carregar mensagens iniciais para não ficar vazio
    setMessages([
      {
        id: '1',
        content: 'Olá, pessoal! espaço para falar de desenvolvimento!',
        senderId: '1',
        senderName: 'Lara',
        createdAt: new Date().toISOString(),
        isPrivate: false
      },
      {
        id: '2',
        content: 'Opa! teste.',
        senderId: '2',
        senderName: 'Lucas',
        createdAt: new Date().toISOString(),
        isPrivate: false
      }
    ]);
  }, [roomId]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.id || 'meu-id',
      senderName: user?.username || 'Eu',
      createdAt: new Date().toISOString(),
      isPrivate: !!privateTarget,
      receiverId: privateTarget?.id
    };

    // Adiciona na tela (simulação)
    setMessages(prev => [...prev, messagePayload]);
    setNewMessage('');
    
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Atalho de usabilidade ESC cancela o privado
    if (e.key === 'Escape') {
      setPrivateTarget(null);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/*sidebar dos participantes */}
      <aside className="w-64 bg-gray-50 border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="font-bold text-blue-600 mb-2">Participantes</h2>
          <div className="relative">
             <input placeholder="Buscar..." className="w-full bg-gray-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-300" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {participants.map(p => (
            <div 
              key={p.id} 
              onClick={() => setPrivateTarget(p)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${privateTarget?.id === p.id ? 'bg-orange-100 border border-orange-200' : 'hover:bg-gray-200'}`}
              title="Clique para enviar mensagem privada"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold ${p.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate font-medium">{p.name}</p>
                {privateTarget?.id === p.id && <p className="text-[10px] text-orange-600 font-bold">Privado selecionado</p>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/*area princiapl*/}
      <main className="flex-1 flex flex-col relative bg-gray-50">
        
        {/* header sala */}
        <header className="bg-white p-4 border-b flex items-center justify-between shadow-sm z-10">
           <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
               ← Voltar para o dashboard
             </button>
           </div>
           
           <div className="text-right">
             <h1 className="font-bold text-lg text-blue-600">{roomId}</h1>
             <span className="text-xs text-gray-400">Criado por: Lara Alves</span>
           </div>
        </header>

        {/* lista mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const isMe = msg.senderId === (user?.id || 'meu-id');
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 text-white flex items-center justify-center text-xs">{msg.senderName.charAt(0)}</div>}
                
                <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                     {!isMe && <span className="font-bold text-gray-700 text-sm">{msg.senderName}</span>}
                     {msg.isPrivate && (
                       <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                         mensagem privada
                       </span>
                     )}
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : msg.isPrivate 
                        ? 'bg-orange-50 border border-orange-200 text-gray-800 rounded-tl-none'
                        : 'bg-white border border-gray-100 text-gray-600 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* input dinamico, muda a cor privado */}
        <div className={`p-4 transition-colors duration-300 ${privateTarget ? 'bg-[#993300]' : 'bg-[#0078D4]'}`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <p className="text-white text-xs font-bold flex items-center gap-2">
              {privateTarget 
                ? `Enviando para ${privateTarget.name} (Somente vocês dois verão)`
                : "Enviando para todos do 4um"
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
            <button type="submit" className={`font-bold transition-colors p-2 ${privateTarget ? 'text-[#993300]' : 'text-[#0078D4]'}`}>
              ➤
            </button>
          </form>
        </div>

      </main>

      {/* --- SIDEBAR DIREITA (OUTRAS SALAS) --- */}
      <aside className="w-64 bg-white border-l p-4 hidden lg:block">
        <div className="bg-[#0078D4] text-white p-4 rounded-xl mb-4 shadow-lg">
          <h3 className="font-bold text-sm truncate">{roomId}</h3>
          <p className="text-xs opacity-80">+70 pessoas</p>
        </div>

        <h3 className="font-bold text-blue-500 mb-4 text-sm px-1">Outras Salas</h3>
        
        <div className="space-y-3">
          {['#segurança', 'Thinking about...', 'Tem_muita_coisa', 'Systemmm', 'E as férias, onde...'].map(room => (
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
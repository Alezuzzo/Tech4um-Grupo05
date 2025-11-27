export interface Room {
  id: string;
  name: string;
  description: string;
  count?: number; 
  participantsCount?: number; 
}

interface HomeProps {
  rooms: Room[];
  loading: boolean;
  onEnterRoom: (roomId: string) => void;
  onCreateRoom?: () => void; 
}

export default function Home({ rooms, loading, onEnterRoom, onCreateRoom }: HomeProps) {
  return (
    <div className="w-full mx-auto flex flex-col gap-8 mt-15">
        
        {/* --- CABEÇALHO E BUSCA (Seu estilo visual) --- */}
        <section className="flex flex-col gap-1.5">
            <h1 className="text-3xl text-gray-500 font-light">Opa!</h1>
            <p className="text-xl text-gray-500 font-bold">Sobre oque gostaria de falar hoje?</p>
        </section>

        <div className="flex gap-5">
            {/* Barra de Busca Estilizada */}
            <div className="flex flex-1 border border-[#0078D4] rounded-lg justify-between items-center">
                <input 
                    className="px-4 py-3 focus:outline-none text-sm placeholder-gray-400 w-full" 
                    type="text" 
                    placeholder="Em busca de uma sala? Encontre-a aqui"
                />
                <button className='bg-[#0078D4] text-white font-bold px-4 rounded-lg transition-colors h-full shadow-md hover:bg-[#0060AA]'>
                    →
                </button>
            </div>
            
            {/* Botão Criar Sala */}
            <button 
              onClick={onCreateRoom}
              className='bg-[#0078D4] text-white px-3 rounded-lg transition-colors w-fit shadow-md hover:bg-[#0060AA] font-medium'
            >
                Ou crie seu próprio 4um
            </button>
        </div>

        {/* --- GRID DE SALAS (Conteúdo) --- */}
        {loading ? (
            <div className="text-center py-20 text-gray-400 animate-pulse">
            Carregando salas...
            </div>
        ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <div 
                key={room.id}
                onClick={() => onEnterRoom(room.id)}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 group relative"
                >
                <h4 className="font-extrabold text-[#0078D4] text-lg mb-1 group-hover:underline">
                    {room.name}
                </h4>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-12 line-clamp-3">
                    {room.description}
                </p>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center border-t border-gray-100 pt-4">
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
            </section>
        )}
    </div>
  );
}
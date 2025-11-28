import type { Room } from '../types';

interface HomeProps {
    rooms: Room[];
    loading: boolean;
    onEnterRoom: (roomId: string) => void;
    onCreateRoom: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    currentUserId?: string;
    onDeleteRoom: (roomId: string) => void;
}

export default function Home({
    rooms,
    loading,
    onEnterRoom,
    onCreateRoom,
    searchTerm,
    onSearchChange,
    currentUserId,
    onDeleteRoom
}: HomeProps) {

    return (
        <div className="w-full mx-auto flex flex-col gap-8 mt-0 md:mt-15 max-w-6xl p-4 font-sans">

            {/* CABEÇALHO */}
            <section className="flex flex-col gap-1.5 mb-2">
                <h1 className="text-4xl text-gray-500 font-light tracking-tight">Opa!</h1>
                <p className="text-2xl text-gray-500 font-bold tracking-tight">Sobre o que gostaria de falar hoje?</p>
            </section>

            {/* BARRA DE AÇÃO */}
            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex w-full border border-[#0078D4] rounded-xl items-stretch bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#0078D4]">

                    <input
                        className="px-5 py-4 focus:outline-none placeholder-gray-400 flex-1 min-w-0 text-xs sm:text-sm md:text-base
"
                        type="text"
                        placeholder="Em busca de uma sala? Encontre-a aqui"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />

                    <button
                        className="bg-[#0078D4] text-white font-bold px-6 flex items-center justify-center text-xl hover:bg-[#0060AA] transition-colors shrink-0"
                    >
                        →
                    </button>

                </div>

                <button
                    onClick={onCreateRoom}
                    className='bg-[#0078D4] text-white px-8 py-4 rounded-xl transition-all shadow-md hover:bg-[#0060AA] hover:shadow-lg active:scale-95 font-bold text-base whitespace-nowrap'
                >
                    Ou crie seu próprio 4um
                </button>
            </div>

            {/* GRID DE SALAS */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0078D4] rounded-full animate-spin mb-4"></div>
                    <p className="text-lg">Carregando salas...</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.length === 0 && (
                        <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-400 text-lg">
                            <p>{searchTerm ? `Nenhuma sala encontrada para "${searchTerm}"` : "Nenhuma sala disponível."}</p>
                        </div>
                    )}

                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            onClick={() => onEnterRoom(room.id)}
                            className={`bg-white p-8 rounded-[2rem] transition-all duration-300 cursor-pointer group relative h-full flex flex-col justify-between
                            ${room.isFeatured
                                    ? 'border-2 border-[#E04F1A]  hover:shadow-[0_20px_50px_-10px_rgba(224,79,26,0.4)] hover:-translate-y-1'
                                    : 'border-2 border-transparent shadow-sm hover:border-blue-100 hover:shadow-sm hover:-translate-y-1'
                                }
                        `}
                        >
                            {currentUserId === room.creatorId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRoom(room.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors z-20 opacity-0 group-hover:opacity-100"
                                    title="Excluir sala permanentemente"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            )}
                            <div>
                                {/* TEXTO DE DESTAQUE */}
                                {room.isFeatured && (
                                    <p className="text-[#E04F1A] font-bold text-sm mb-1 italic tracking-wide">
                                        Tópico em destaque!
                                    </p>
                                )}

                                <h4 className={`font-extrabold text-2xl mb-3 group-hover:underline break-words leading-tight tracking-tight
                                ${room.isFeatured ? 'text-[#0078D4]' : 'text-[#0078D4]'}`}>
                                    {room.name}
                                </h4>

                                <p className="text-gray-500 text-base leading-relaxed mb-16 line-clamp-3 font-medium">
                                    {room.description || "Sem descrição disponível."}
                                </p>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center border-t border-gray-100 pt-5">
                                {/* Nome do Criador */}
                                <div className="flex items-center gap-1 text-gray-500 font-medium text-sm">
                                    <span className="font-normal text-gray-400">Criado por:</span>
                                    {/* Usa creatorName se vier da API, senão um fallback */}
                                    <span className="text-gray-600 font-bold">{room.creatorName || "Admin"}</span>
                                </div>

                                {/* Bolinha de contagem */}
                                <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${room.isFeatured
                                    ? 'text-white bg-[#0078D4]'
                                    : 'text-blue-500 bg-blue-50'
                                    }`}>
                                    +{room.count || room.participantsCount || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
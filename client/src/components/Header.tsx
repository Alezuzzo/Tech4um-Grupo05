import React from 'react';
import logoImg from '../assets/logo.png';

// Atualizamos a interface para aceitar os dados completos do usuário
interface HeaderProps {
  onLoginClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, user }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F3F3F3]/90 backdrop-blur-md border-b border-gray-200">
        
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 py-6">
            
            {/* Lado Esquerdo: Logo e Slogan */}
            {/* Mantive items-center pois na imagem o texto parece centralizado com o logo visualmente */}
            <div className='flex flex-row items-center gap-4'>
              <img src={logoImg} alt="Logo Tech4Um" className="w-[97px] h-auto" />
              <h1 className='text-gray-400 text-sm font-normal hidden sm:block pt-1'>Seu fórum sobre tecnologia!</h1>
            </div>

            {/* Lado Direito: Perfil ou Login */}
            <div className='flex items-center gap-4'>
              {user ? (
                // --- ESTADO LOGADO (Igual ao Print) ---
                <div className="flex items-center gap-3 text-right">
                   {/* Container dos Textos (Alinhados à direita) */}
                   <div className="flex flex-col items-end">
                      <span className="text-gray-600 font-bold text-sm leading-tight">
                        {user.name}
                      </span>
                      <span className="text-gray-400 text-xs font-normal">
                        {user.email}
                      </span>
                   </div>

                   {/* Avatar */}
                   <img 
                     src={user.avatar} 
                     alt="Avatar" 
                     className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                   />
                </div>
              ) : (
                // --- ESTADO DESLOGADO ---
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onLoginClick} 
                    className='text-gray-500 font-bold hover:text-gray-700 transition-colors'
                  >
                    Fazer Login
                  </button>
                  <div className="rounded-full w-10 h-10 bg-[#B94318] border-2 border-white shadow-sm"></div>
                </div>
              )}
            </div>

        </div>
    </header>
  );
};

export default Header;
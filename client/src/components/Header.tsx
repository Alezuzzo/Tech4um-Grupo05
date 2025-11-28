import logoImg from '../assets/logo.png';
import type { User } from '../types';
import { useState } from 'react';
import EditUserModal from './EditUserModal';

interface HeaderProps {
  user: User | null;      // Pra mostrar o avatar ou botão de login
  onLoginClick: () => void; // Pra abrir o modal
  onLogout: () => void;     // Pra deslogar
}

export function Header({ user, onLoginClick, onLogout }: HeaderProps) {

  const [isEditOpen, setIsEditOpen] = useState(false);
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  }

  return (
    <header className="
    flex flex-col items-center gap-2
    w-full max-w-6xl mx-auto h-auto px-[50px]
    border-b border-gray-100 flex-wrap
    md:flex-row md:justify-between md:h-[100px]
  ">
      <div className='flex flex-row gap-2'>
        <img src={logoImg} alt="Logo Tech4Um" className="w-24 h-auto object-contain " />
        <h1 className='pt-5 px-2 text-gray-500'>Seu fórum sobre tecnologia!</h1>
      </div>
      {/* ÁREA DO USUÁRIO (CONDICIONAL) */}
      <div>
        {user ? (
          // --- ESTADO LOGADO (Nome + Avatar) ---
          <div className="flex items-center gap-3 sm:items-center">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-gray-700 text-sm leading-tight">
                {user.username}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {user.email}
              </p>
            </div>

            {/* Avatar com a Inicial */}
            <button className="w-9 h-9 bg-[#0078D4] rounded-full flex items-center justify-center text-white font-bold border-2 border-blue-100  transition-colors shadow-md hover:bg-[#0060AA]"
              title={user.username}
              onClick={() => setIsEditOpen(true)}
            >{getInitials(user.username)}
            </button>

            <EditUserModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
            />

            {/* Botão de Sair */}
            <button
              onClick={onLogout}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        ) : (
          // --- ESTADO DESLOGADO (Botão Entrar) ---
          <button
            onClick={onLoginClick}
            className="flex items-center gap-3 group focus:outline-none"
            title="Clique para fazer login"
          >
            <span className="font-bold text-gray-500 text-sm group-hover:text-gray-700 transition-colors">
              Fazer Login
            </span>
            {/* Círculo Colorido (Tom ferrugem/laranja da imagem) */}
            <div className="w-10 h-10 bg-[#B84308] rounded-full shadow-sm group-hover:shadow-md transition-all transform group-active:scale-95 shrink-0"></div>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
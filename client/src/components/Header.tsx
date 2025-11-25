import React from 'react';
import logoImg from '../assets/logo.png';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;      // Pra mostrar o avatar ou botão de login
  onLoginClick: () => void; // Pra abrir o modal
  onLogout: () => void;     // Pra deslogar
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  return (
    <header className="flex justify-between items-center w-full max-w-6xl mx-auto h-[100px] px-[50px] border-b border-gray-100">
        <div className='flex flex-row gap-2'>
          <img src={logoImg} alt="Logo Tech4Um" className="w-[97px]" />
          <h1 className='pt-5 px-2 text-gray-500'>Seu fórum sobre tecnologia!</h1>
        </div>
        <div className='flex items-center gap-2'>
          <button onClick={onLoginClick} className='text-gray-500 font-bold hover:text-gray-700 transition-colors'>Fazer Login</button>
          <div className="rounded-full w-12 h-12 bg-[#B94318]"></div>
        </div>
    </header>
  );
};

export default Header;
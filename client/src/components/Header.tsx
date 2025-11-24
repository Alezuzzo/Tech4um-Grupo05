// src/components/Header.tsx
import React from 'react';
import logoImg from '../assets/logo.png'

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center w-full h-25 px-50 border-b border-gray-100">
        <div className='flex flex-row  gap-2'>
          <img src={logoImg} alt="Logo Tech4Um" className="w-97px h-44px" />
          <h1 className='pt-5 px-2 text-gray-500'>Seu forum sobre tecnologia</h1>
        </div>
        <div className='flex items-center gap-2'>
          <button className='text-gray-500 font-bold'>Fazer Login</button>
          <div className="rounded-full w-12 h-12 bg-[#B94318]"></div>
        </div>
    </header>
  );
};

export default Header;

import { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Prop nova para garantir o redirecionamento correto
}

export default function Login({ isOpen, onClose, onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth', { 
        username, 
        email 
      });
      
      // --- logica misturada (mock com real) ---
      let userData;
      let tokenData;

      // se vier do Backend Real (tem chave 'user')
      if (response.data.user) {
        userData = response.data.user;
        tokenData = response.data.token;
      } else {
        // Se vier do json-server (Mock)
        userData = response.data;
        tokenData = 'token-fake-mock';
      }
      
      // Salva no contexto
      login(userData, tokenData);
      
      // Fecha o modal
      onClose();

      // Redireciona para onde o Dashboard pediu (ex: sala específica)
      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
      setError('Erro ao entrar. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0078D4] mb-2">
            Que bom ter você aqui!
          </h2>
          <p className="text-gray-500 font-medium text-sm">
            Para participar de um 4um é necessário fazer login.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0078D4] ml-1">
              Nome
            </label>
            <input 
              type="text" 
              placeholder="Seu nome de exibição"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0078D4] ml-1">
              E-mail
            </label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-4 bg-[#0078D4] text-white font-bold py-3 px-6 rounded-lg transition-colors w-fit shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0060AA]'}`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
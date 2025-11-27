import { useState, type FormEvent } from 'react';
import api from '../services/api';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Para recarregar a lista de salas
}

export function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia para o backend
      await api.post('/rooms', { 
        name, 
        description 
      });
 
      setName('');
      setDescription('');
      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert('Erro ao criar sala. Tente outro nome.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#0078D4] mb-2">
          Criar novo 4um
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Crie um espaço para discutir sobre o que você gosta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-[#0078D4] ml-1 block mb-1">
              Nome da Sala
            </label>
            <input 
              type="text" 
              placeholder="Ex: React Brasil"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0078D4] ml-1 block mb-1">
              Descrição
            </label>
            <textarea 
              placeholder="Sobre o que vamos falar?"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`bg-[#0078D4] text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all ${loading ? 'opacity-70' : 'hover:bg-[#0060AA] hover:shadow-lg'}`}
            >
              {loading ? 'Criando...' : 'Criar Sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
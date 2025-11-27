import { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginProps) {
  // Estado para controlar se é Cadastro (true) ou Login (false)
  const [isSignUp, setIsSignUp] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();                  // evita o recarregamento da página
  setError('');                        // limpa erro anterior
  setLoading(true);                    // ativa o loading no botão

  try {
    let response;

    if (isSignUp) {
      // CADASTRO
      // envia nickname, email e senha para a rota de criação de usuário
      response = await api.post('/auth/register', {   //alterado: antes chamava /auth
        nickname: username,
        email,
        password
      });

      // mensagem opcional para o usuário saber que funcionou
      // alert("Usuário criado com sucesso!");         //removido alert para não quebrar ui
    } 
    else {
      // LOGIN
      // envia email e senha para gerar o token JWT
      response = await api.post('/auth/login', {       //antes chamava /auth
        email,
        password
      });
    }
    // pega o token retornado pelo backend real
    const token = response.data.token;                 //antes o token vinha de outro formato
    const user = response.data.user ?? null;
    // caso algum problema ocorra e o token não venha
    if (!token) {
      throw new Error("token não recebido é algo no backend.");
    }
    // chama o login() do AuthContext para salvar token e usuário
    login(user, token);                                //agora sempre passa user e token corretos
    // fecha o modal
    onClose();
    // callback opcional caso o componente pai queira executar algo
    if (onSuccess) onSuccess();

  } catch (err: any) {
    console.error(err);
    // tenta pegar mensagem vinda do backend real
    const msg =
      err.response?.data?.message      //pega a message correta do backend em caso de erros
      || 'Erro ao processar requisição.'; 

    // exibe erro no modal
    setError(msg);
  } finally {
    // desativa o loading independentemente do resultado
    setLoading(false);
  }
};



  // limpa os erros ao trocar de aba
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transition-all duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0078D4] mb-2">
            {isSignUp ? 'Crie sua conta' : 'Que bom ter você aqui!'}
          </h2>
          <p className="text-gray-500 font-medium text-sm">
            {isSignUp 
              ? 'Preencha os dados abaixo para se cadastrar.' 
              : 'Para participar de um 4um é necessário fazer login.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* campo nome */}
          {isSignUp && (
            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-[#0078D4] ml-1">
                Nome
              </label>
              <input 
                type="text" 
                placeholder="Seu nome de exibição"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm placeholder-gray-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp} // Só é obrigatório se for cadastro
                disabled={loading}
              />
            </div>
          )}

          {/* campo email */}
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

          {/* campo de senha*/}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0078D4] ml-1">
              Senha
            </label>
            <input 
              type="password" 
              placeholder="********"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all text-sm placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={3}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-4 bg-[#0078D4] text-white font-bold py-3 px-6 rounded-lg transition-colors w-full shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0060AA]'}`}
          >
            {loading 
              ? 'Processando...' 
              : (isSignUp ? 'Cadastrar' : 'Entrar')
            }
          </button>
        </form>

        {/* alterna entre login e cadastro */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          </span>
          <button 
            type="button"
            onClick={toggleMode}
            className="ml-2 text-[#0078D4] font-bold hover:underline focus:outline-none"
          >
            {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
          </button>
        </div>

      </div>
    </div>
  );
}
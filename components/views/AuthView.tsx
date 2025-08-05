import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';

const LoginView: React.FC<{ onSwitchToSignup: () => void }> = ({ onSwitchToSignup }) => {
    const { login } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setError('');
        setIsLoading(true);
        const success = await login(username, password);
        if (!success) {
            setError('Usuário ou senha inválidos.');
            setIsLoading(false);
        }
        // On success, the main app will rerender, so no need to setIsLoading(false)
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">Usuário</label>
                    <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="nome@monalisamolduras"/>
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700">Senha</label>
                    <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm">
                Não tem uma conta?{' '}
                <button onClick={onSwitchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Cadastre-se
                </button>
            </p>
        </div>
    );
};

const SignupView: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
    const { signup } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await signup(username, password, token);
        if (success) {
            alert('Usuário criado com sucesso! Por favor, faça o login.');
            onSwitchToLogin();
        }
        // Errors are handled by alerts inside the signup function
        setIsLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Criar Conta</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label htmlFor="signup-username" className="block text-sm font-medium text-slate-700">Nome de Usuário</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" name="signup-username" id="signup-username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} required className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                        <span className="inline-flex items-center rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">@monalisamolduras</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="signup-password"className="block text-sm font-medium text-slate-700">Senha</label>
                    <input type="password" name="signup-password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="signup-token"className="block text-sm font-medium text-slate-700">Token de Validação</label>
                    <input type="password" name="signup-token" id="signup-token" value={token} onChange={(e) => setToken(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Peça ao administrador"/>
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
                        {isLoading ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm">
                Já tem uma conta?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Faça o login
                </button>
            </p>
        </div>
    );
};


const AuthView: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <svg className="h-10 w-10 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H8V8H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 16H8V20H4V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 4H20V8H16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 16H20V20H16V16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 4.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M15 4.5V19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M4.5 15H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="ml-3 text-2xl font-bold text-slate-800">Monalisa Molduras</span>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {isLoginView
                        ? <LoginView onSwitchToSignup={() => setIsLoginView(false)} />
                        : <SignupView onSwitchToLogin={() => setIsLoginView(true)} />
                    }
                </div>
            </div>
        </div>
    );
};

export default AuthView;

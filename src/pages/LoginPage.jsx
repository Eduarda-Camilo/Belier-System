import React, { useState } from 'react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onNavigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { signIn } = useAuth(); // Destructure signIn from context

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email || !password) {
            setErrorMsg("Por favor, preencha E-mail e Senha.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await signIn({ email, password });

            if (error) {
                setErrorMsg("E-mail ou senha incorretos.");
                console.error("Login error:", error.message);
                setIsLoading(false);
                return;
            }

            // Sucesso! O onAuthStateChange no AuthContext atualizará o user global
            // Navigate to docs as logged in (the router will pick up the user state soon too)
            if (onNavigate) {
                onNavigate('docs', true);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Ocorreu um erro no servidor. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout onNavigate={onNavigate}>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">Bem-vindo de volta</h1>
            <p className="text-[#94a3b8] text-[13px] mb-8 text-center">Entre com suas credenciais para acessar o sistema</p>

            <form className="w-full space-y-5" onSubmit={handleLogin}>
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                        E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="Digite seu e-mail..."
                        className="w-full h-11 bg-[#171e25] border border-white/10 rounded-lg px-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                        Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite..."
                            className="w-full h-11 bg-[#171e25] border border-white/10 rounded-lg pl-4 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </AuthLayout>
    );
}

import React, { useState } from 'react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { EyeOff, Eye, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CadastroPage({ onNavigate }) {
    const [name, setName] = useState('');
    const [access, setAccess] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { signUp } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!name || !access || !email || !password) {
            setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: access
                    }
                }
            });

            if (error) throw error;

            setSuccessMsg("Conta criada com sucesso! Verifique seu e-mail.");
            // Optional: navigate directly or wait for user to click
            setTimeout(() => {
                if (onNavigate) onNavigate('login');
            }, 2000);

        } catch (err) {
            console.error("Erro no cadastro:", err);
            setErrorMsg(err.message || "Ocorreu um erro ao criar a conta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout onNavigate={onNavigate}>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">Bem-vindo!</h1>
            <p className="text-[#94a3b8] text-[13px] mb-8 text-center px-4">Cadastre suas credenciais para acessar o sistema</p>

            <form className="w-full space-y-4" onSubmit={handleRegister}>

                {/* Name Input */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                        Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Digite seu nome..."
                        className="w-full h-10 bg-[#171e25] border border-white/10 rounded-lg px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Access Level Select */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                        Acesso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            className="w-full h-10 bg-[#171e25] border border-white/10 rounded-lg pl-3 pr-10 text-sm text-slate-200 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                            required
                            value={access}
                            onChange={(e) => setAccess(e.target.value)}
                        >
                            <option value="" disabled hidden>Selecione</option>
                            <option value="designer">Designer</option>
                            <option value="developer">Desenvolvedor</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                        E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="Digite seu e-mail..."
                        className="w-full h-10 bg-[#171e25] border border-white/10 rounded-lg px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                        Senha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite..."
                            className="w-full h-10 bg-[#171e25] border border-white/10 rounded-lg pl-3 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm text-center">
                        {successMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-[#94a3b8] text-sm">
                    Já tem uma conta?{' '}
                    <button
                        onClick={() => onNavigate && onNavigate('login')}
                        className="text-[#0ea5e9] hover:text-white transition-colors"
                    >
                        Entrar
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

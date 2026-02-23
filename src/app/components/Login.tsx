import { useState } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-120v37383x";
import { useAuth } from "../auth/AuthContext";

function Gradients() {
  return (
    <div className="relative size-full" data-name="Gradients">
      <div className="absolute inset-[-4.2%_-4.68%_-2.25%_-4.65%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4163.3 6043.78">
          <g id="Gradients">
            <g filter="url(#filter0_f_login)" id="Vector 1">
              <path d={svgPaths.p10e85980} fill="var(--fill-0, #005689)" fillOpacity="0.3" />
            </g>
            <g filter="url(#filter1_f_login)" id="Vector 4">
              <path d={svgPaths.p3d049680} fill="var(--fill-0, #164194)" fillOpacity="0.3" />
            </g>
            <g filter="url(#filter2_f_login)" id="Ellipse 11">
              <ellipse cx="630.638" cy="1123.28" fill="var(--fill-0, #005689)" fillOpacity="0.3" rx="630.638" ry="1123.28" transform="matrix(0.856662 -0.515878 -0.260255 0.96554 1613.72 2776.1)" />
            </g>
            <g filter="url(#filter3_f_login)" id="Vector 3">
              <path d={svgPaths.pc898600} fill="var(--fill-0, #0286BE)" fillOpacity="0.3" />
            </g>
            <g filter="url(#filter4_f_login)" id="Vector 5">
              <path d={svgPaths.p709dc80} fill="var(--fill-0, #0286BE)" fillOpacity="0.3" />
            </g>
            <g filter="url(#filter5_f_login)" id="Ellipse 10">
              <ellipse cx="527.942" cy="940.515" fill="var(--fill-0, #E84910)" fillOpacity="0.3" rx="527.942" ry="940.515" transform="matrix(0.856662 -0.515878 -0.260255 0.96554 666.478 4100.09)" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2537.83" id="filter0_f_login" width="1649.31" x="1953.27" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="3397.34" id="filter1_f_login" width="2088.38" x="1574.65" y="1433.94">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2984.46" id="filter2_f_login" width="1948.01" x="887.622" y="2043.11">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2876.22" id="filter3_f_login" width="1672.76" x="595.724" y="1156.97">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="3223.81" id="filter4_f_login" width="2020.9" x="2142.4" y="621.781">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="2615.87" id="filter5_f_login" width="1747.95" x="0" y="3427.91">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_login" stdDeviation="179.808" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Ovelhinha() {
  return (
    <div className="h-[42px] relative w-[46.89px]" data-name="ovelhinha">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46.8905 42">
        <g id="Group">
          <path d={svgPaths.pbee9f00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pf78a200} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/components/button", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login. Tente novamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#22272a] fixed inset-0 overflow-hidden">
      {/* Holographic Background */}
      <div className="absolute bg-[#22272a] bottom-0 left-0 overflow-clip right-0 top-0">
        <div className="absolute flex inset-[-58.08%_-62.8%_-89.67%_-37.06%] items-center justify-center">
          <div className="flex-none h-[1767.007px] rotate-[-22.15deg] w-[2388.036px]">
            <Gradients />
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="bg-[#22272a] border border-[#3d4448] rounded-[24px] p-12 w-full max-w-[480px]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="-scale-y-100">
              <Ovelhinha />
            </div>
            <p className="font-['Roboto_Flex:SemiBold',sans-serif] font-semibold text-[32px] text-white" style={{ fontVariationSettings: "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100" }}>
              Belier
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-['Open_Sans:Bold',sans-serif] font-bold text-[24px] text-white mb-2" style={{ fontVariationSettings: "'wdth' 100" }}>
              Bem-vindo de volta
            </h1>
            <p className="font-['Open_Sans:Regular',sans-serif] text-[14px] text-[#f5f5f5]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-['Open_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                E-mail
              </label>
              <div className="bg-[#22272a] border border-[#3d4448] rounded-[12px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-transparent font-['Open_Sans:Regular',sans-serif] text-[16px] text-white placeholder:text-[#f5f5f5] placeholder:opacity-50 outline-none"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-['Open_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                Senha
              </label>
              <div className="bg-[#22272a] border border-[#3d4448] rounded-[12px] flex items-center px-4 py-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent font-['Open_Sans:Regular',sans-serif] text-[16px] text-white placeholder:text-[#f5f5f5] outline-none"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#f5f5f5] hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showPassword ? (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                    ) : (
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#16a6df] hover:bg-[#1292c7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-[12px] px-6 py-4 font-['Open_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-white"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>

            {error && (
              <p className="mt-2 text-sm text-red-400 font-['Open_Sans:Regular',sans-serif]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
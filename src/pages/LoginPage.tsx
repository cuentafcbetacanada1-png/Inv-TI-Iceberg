import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Cpu,
  Globe
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState<string | null>(null)
  
  const { signIn, user } = useAuthStore()
  const navigate = useNavigate()

  // Si el usuario ya está autenticado, lo mandamos al dashboard directamente
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(email, password)
      toast.success('Acceso Autorizado')
      // Redirección inmediata tras éxito
      navigate('/')
    } catch (err: any) {
      const msg = err.message === 'Invalid login credentials' ? 'Credenciales Inválidas' : 'Error de Conexión'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090a09] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor (Cyber Grid) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00ff88 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10 animate-in">
        <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88] to-[#10ef87] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.5)] mb-6 rotate-3 hover:rotate-0 transition-all duration-700 group cursor-pointer">
                <Zap size={32} className="text-black group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-4xl font-bold text-white italic tracking-tighter uppercase mb-1 text-glow">Iceberg <span className="text-[#00ff88]">IT</span></h1>
            <p className="text-[10px] font-semibold text-[#4e564e] uppercase tracking-[0.4em] mb-4">Consola de Mando v10.4</p>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent rounded-full" />
        </div>

        <div className="card-matrix p-10 border-[#0e312a]/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-2xl group-hover:bg-[#00ff88]/10 transition-all" />
          
          <div className="mb-10 text-center text-white">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] italic mb-2 text-white/90">Autenticación Requerida</h2>
            <p className="text-[10px] font-semibold text-[#4e564e] uppercase tracking-widest leading-relaxed">Sincronice sus credenciales corporativas para acceder al panel de control.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <Mail size={10} className={isFocused === 'email' ? 'text-[#00ff88]' : ''} />
                Correo Electrónico
              </label>
              <div className={cn(
                "group relative transition-all duration-500",
                isFocused === 'email' ? "scale-[1.02]" : ""
              )}>
                <input
                  type="email"
                  required
                  placeholder="admin@it-iceberg.com"
                  className="w-full bg-[#090a09]/80 backdrop-blur-sm border border-[#0e312a]/50 text-sm text-white px-5 py-4 rounded-2xl outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a] placeholder:italic"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                />
                <div className={cn(
                    "absolute inset-0 bg-[#00ff88]/5 rounded-2xl transition-opacity pointer-events-none",
                    isFocused === 'email' ? "opacity-100" : "opacity-0"
                )} />
              </div>
            </div>

            <div className="space-y-2 pb-2">
              <label className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                <Lock size={10} className={isFocused === 'pass' ? 'text-[#00ff88]' : ''} />
                Contraseña
              </label>
              <div className={cn(
                "group relative transition-all duration-500",
                isFocused === 'pass' ? "scale-[1.02]" : ""
              )}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#090a09]/80 backdrop-blur-sm border border-[#0e312a]/50 text-sm text-white px-5 py-4 rounded-2xl outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#2a302a]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('pass')}
                  onBlur={() => setIsFocused(null)}
                />
                <div className={cn(
                    "absolute inset-0 bg-[#00ff88]/5 rounded-2xl transition-opacity pointer-events-none",
                    isFocused === 'pass' ? "opacity-100" : "opacity-0"
                )} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group/btn relative py-5 bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black rounded-2xl font-bold text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-[0_4px_30px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Entrar a la Matriz
                  <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#0e312a]/50 flex items-center justify-center gap-6 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700">
             <ShieldCheck size={18} className="text-[#00ff88]" />
             <Cpu size={18} className="text-[#00ff88]" />
             <Globe size={18} className="text-[#00ff88]" />
          </div>
        </div>

        <div className="mt-12 text-center space-y-2">
            <p className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.2em] italic">
                ICEBERG LOGISTICS IT SOLUTIONS © 2026
            </p>
            <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
                <span className="text-[8px] font-semibold text-[#00ff88] uppercase tracking-widest">Servidores Cifrados Activos</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Mail, 
  Monitor,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        toast.error('Acceso denegado')
      } else if (data.user) {
        toast.success('Conexión establecida')
        navigate('/', { replace: true })
      }
    } catch {
      toast.error('Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[380px] space-y-8"
      >
        <div className="flex flex-col items-center text-center gap-2">
           <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/10">
              <Monitor className="text-white w-5 h-5" />
           </div>
           <div className="mt-2">
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">Iceberg <span className="text-primary-500">IT</span></h1>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Management Console v8.8</p>
           </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl space-y-6">
           <div className="space-y-1">
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Autenticación</h2>
              <p className="text-[11px] text-zinc-500">Ingrese sus credenciales corporativas</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Correo Electrónico</label>
               <div className="relative group">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-primary-500 transition-colors" />
                 <input
                   type="email"
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-600 font-medium"
                   placeholder="admin@empresa.com"
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Contraseña</label>
               <div className="relative group">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-primary-500 transition-colors" />
                 <input
                   type="password"
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-600"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <button
               type="submit"
               disabled={loading}
               className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-2"
             >
               {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Acceder <ArrowRight className="w-4 h-4" /></>}
             </button>
           </form>
        </div>

        <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest text-center">
           Iceberg Logistics IT Solutions © 2026
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage

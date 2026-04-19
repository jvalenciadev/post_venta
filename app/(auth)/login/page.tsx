'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, HelpCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-mesh-cyber flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 animate-v10-in">
          <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-b from-orange-500/20 to-transparent">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
            <div className="relative w-28 h-28 rounded-[2.2rem] glass-modern flex items-center justify-center overflow-hidden shadow-2xl border-white/10 group-hover:border-orange-500/30 transition-all duration-500">
              <Image 
                src="/logo-v10.png" 
                alt="Cyber POS Logo" 
                width={112} 
                height={112} 
                className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700 animate-float"
              />
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border-2 border-orange-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3 justify-center">
              MOTE Y <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">CHUÑO</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3 text-orange-500/50" /> Secure Encryption Active
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 relative overflow-hidden animate-v10-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-12 h-12 text-orange-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Access Identifier
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@restaurante.com"
                className="input-v10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Security Token
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[9px] font-bold text-orange-500/60 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3 h-3" />
                  Request Reset
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="input-v10 pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest px-4 py-4 rounded-2xl animate-v10-in">
                Error: {error === 'Invalid login credentials'
                  ? 'Access Denied. Verification failed.'
                  : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="login-btn"
              className="btn-v10-primary w-full flex items-center justify-center gap-3 py-5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  INITIATE SESSION
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white bg-white/10 px-3 py-1 rounded-md">v10.2 Stable</div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white bg-white/10 px-3 py-1 rounded-md">Biometric Ready</div>
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em]">
              SENIOR SYSTEMS &copy; 2026
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center opacity-20 group">
          <div className="w-1 h-12 bg-gradient-to-b from-orange-500 to-transparent rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

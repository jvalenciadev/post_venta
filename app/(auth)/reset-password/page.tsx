'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updatePassword } from '@/lib/actions/auth'
import { Lock, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-mesh-cyber flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 animate-v10-in">
          <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-b from-orange-500/20 to-transparent">
            <div className="relative w-28 h-28 rounded-[2.2rem] glass-modern flex items-center justify-center overflow-hidden shadow-2xl border-white/10">
              <Image 
                src="/logo-v10.png" 
                alt="Cyber POS Logo" 
                width={112} 
                height={112} 
                className="object-cover scale-110"
              />
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              SECURE <span className="text-orange-500">RESET</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">
              <ShieldCheck className="w-3 h-3 inline mr-2 text-orange-500/50" /> Credential Override Active
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-10 relative overflow-hidden animate-v10-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock className="w-12 h-12 text-orange-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Define a new administrative security token for your account.
            </p>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                New Security Token
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest px-4 py-4 rounded-2xl">
                Error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-v10-primary w-full flex items-center justify-center gap-3 py-5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  UPDATE CREDENTIALS
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em] text-center">
            SYSTEM VERSION 10.2 ENCRYPTION
          </p>
        </div>
      </div>
    </div>
  )
}

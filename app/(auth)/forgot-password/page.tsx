'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/auth'
import { Mail, ChevronLeft, ShieldCheck, Zap } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await requestPasswordReset(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
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
              RECOVERY <span className="text-orange-500">PORTAL</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">
              <ShieldCheck className="w-3 h-3 inline mr-2 text-orange-500/50" /> System Access Restoration
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-10 relative overflow-hidden animate-v10-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
            <Mail className="w-12 h-12 text-orange-500" />
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Enter your registered administrator email to receive a secure recovery token.
              </p>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Administrator Email
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
                    SEND RECOVERY EMAIL
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4 animate-v10-in">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic">Email Transmitted</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Check your inbox for the secure link to finalize the password reset process.
              </p>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Terminal Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

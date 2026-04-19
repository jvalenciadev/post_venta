'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Users,
  Shield,
  Mail,
  Calendar,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  User,
  ShieldAlert,
  Loader2,
  KeyRound,
  Fingerprint,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import {
  updateUserRole,

  resetUserPassword,
  deleteUserProfile,
  createUserProfile,
  adminUpdatePassword
} from '@/lib/actions/users'
import type { Profile } from '@/types/database'

interface UserManagerProps {
  initialProfiles: Profile[]
}

export default function UserManager({ initialProfiles }: UserManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [passData, setPassData] = useState({ id: '', name: '', password: '' })
  const [formData, setFormData] = useState({ full_name: '', email: '', role: 'cajero', password: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredProfiles = initialProfiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        setMessage({ type: 'success', text: successMsg })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    handleAction(() => createUserProfile(formData as any), 'Operador creado exitosamente')
    setShowCreateModal(false)
    setFormData({ full_name: '', email: '', role: 'cajero', password: '' })
  }

  const handleUpdatePass = async (e: React.FormEvent) => {
    e.preventDefault()
    handleAction(() => adminUpdatePassword(passData.id, passData.password), 'Credencial actualizada')
    setShowPassModal(false)
    setPassData({ id: '', name: '', password: '' })
  }

  function toggleUserStatus(id: string, arg1: boolean): Promise<any> {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-v10-in">
      {/* Header section v11.4 - SENIOR ADAPTIVE */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 glass-modern p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/[0.05] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-20 h-20 rounded-[2.2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.15)] group">
            <Fingerprint className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
              NODOS <span className="text-orange-500">CENTRALES</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 flex items-center gap-3">
              <ShieldAlert className="w-3 h-3 text-orange-500/50" /> Registro Seguro de Gestión de Personal
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden w-full sm:w-80 shadow-2xl">
            <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-500 group-focus-within:text-orange-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Identificar Nodo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white text-sm placeholder:text-gray-700 w-full"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-v10-primary flex items-center gap-3 py-4 shrink-0 shadow-orange-500/20 shadow-xl active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            NUEVO OPERADOR
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-center animate-bounce ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
          {message.text}
        </div>
      )}

      {/* Users Desktop Table - SENIOR DENSITY */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 pb-20">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="glass-modern p-6 rounded-[2.5rem] border-white/5 hover:border-orange-500/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-3xl group-hover:bg-orange-500/[0.05] transition-all" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 flex items-center justify-center text-xl shadow-xl group-hover:rotate-12 transition-all">
                      {profile.role === 'admin' ? '🛡️' : 
                       profile.role === 'cocinero' ? '🍳' : 
                       profile.role === 'cajero' ? '💰' : 
                       profile.role === 'mesero' ? '📋' :
                       profile.role === 'reportes' ? '📈' : '💸'}
                    </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] border ${profile.role === 'admin'
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                        : 'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                        {profile.role}
                      </p>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase truncate max-w-[140px]">
                      {profile.full_name || 'Nodo Desconocido'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPassData({ id: profile.id, name: profile.full_name || '', password: '' })
                      setShowPassModal(true)
                    }}
                    title="Cambiar Contraseña Manualmente"
                    className="w-10 h-10 rounded-xl bg-orange-500/5 text-orange-500/40 hover:bg-orange-500/20 hover:text-orange-500 flex items-center justify-center transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-orange-500/30" />
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-orange-500/30" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ingreso: {mounted ? new Date(profile.created_at).toLocaleDateString() : '---'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.03] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[7px] font-black text-gray-700 uppercase tracking-[0.3em]">Permisos de Acceso</p>
                    <button
                      onClick={() => {
                        if (confirm('¿Seguro que desea ELIMINAR este nodo? Esta acción es irreversible.')) {
                          handleAction(() => deleteUserProfile(profile.id), 'Nodo eliminado')
                        }
                      }}
                      className="p-1 hover:text-red-500 text-gray-800 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['admin', 'cajero', 'cocinero', 'mesero', 'reportes', 'gastos'].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleAction(() => updateUserRole(profile.id, r as any), `Rol cambiado a ${r}`)}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${profile.role === r
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-white/[0.02] border border-white/5 text-gray-700 hover:text-gray-400'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL - SENIOR GLASS */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-modern p-10 rounded-[3rem] border-white/10 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-4">
              CREAR <span className="text-orange-500">OPERADOR</span>
            </h2>

            <form onSubmit={handleCreate} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Nombre Completo del Operador</label>
                <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full"
                    placeholder="EJ: JUAN VALENCIA"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Identificador (Email)</label>
                <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full"
                    placeholder="EMAIL@RESTAURANTE.COM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Credencial Secreta (Password)</label>
                <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rol del Sistema</label>
                <div className="grid grid-cols-3 gap-3">
                  {['admin', 'cajero', 'cocinero', 'mesero', 'reportes', 'gastos'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r as any })}
                      className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === r
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-gray-600'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Autorizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-modern p-10 rounded-[3rem] border-white/10 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-4">
              EDITAR <span className="text-orange-500">CREDENCIAL</span>
            </h2>

            <form onSubmit={handleUpdatePass} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Operador Seleccionado</label>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white font-black text-xs uppercase italic">
                  {passData.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Nueva Clave de Acceso</label>
                <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden">
                  <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="password"
                    value={passData.password}
                    onChange={(e) => setPassData({ ...passData, password: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Regresar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Confirmar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPending && (
        <div className="fixed bottom-10 right-10 z-[110] bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-v10-in">
          <Loader2 className="w-4 h-4 animate-spin" />
          Sincronizando Núcleo...
        </div>
      )}
    </div>
  )
}

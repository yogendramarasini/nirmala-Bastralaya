'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { loginSchema, type LoginData } from '@/lib/validations'

export default function AdminLogin() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      otp: data.otp || '',
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email, password, or authenticator code')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-bold text-white">Nirmala</div>
          <div className="text-xs tracking-[0.2em] text-gold uppercase mt-1">Bastralaya · Admin</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-full mx-auto mb-6">
            <Lock size={20} className="text-gold" />
          </div>
          <h2 className="text-white text-center text-xl font-semibold mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@example.com"
                className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-gray-600 rounded-lg outline-none focus:border-gold transition-colors ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 rounded-lg outline-none focus:border-gold transition-colors ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                Authenticator code <span className="normal-case text-gray-600">(if enabled)</span>
              </label>
              <input
                {...register('otp')}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="6-digit code"
                className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-gray-600 rounded-lg outline-none focus:border-gold transition-colors ${errors.otp ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-yellow-500 text-primary font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Nirmala Bastralaya Admin Panel · Secure Access Only
        </p>
      </div>
    </div>
  )
}

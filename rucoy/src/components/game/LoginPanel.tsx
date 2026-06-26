import { useState, useCallback } from 'react'
import heroBg from '@/assets/title-hero.jpg'
import logo from '@/assets/rucoy-logo.png'
import { supabase } from '@/integrations/supabase/client'

interface LoginPanelProps {
  onLoggedIn: () => void
  onSwitchToRegister: () => void
  onContinueAsGuest: () => void
}

export default function LoginPanel({
  onLoggedIn,
  onSwitchToRegister,
  onContinueAsGuest,
}: LoginPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = useCallback(async () => {
    setError('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido.')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter ao menos 6 caracteres.')
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setIsLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message)
      return
    }
    onLoggedIn()
  }, [email, password, onLoggedIn])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) handleLogin()
  }, [handleLogin, isLoading])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{ zIndex: 100 }}
    >
      {/* Pixel-art background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
          filter: 'brightness(0.55) saturate(1.1)',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }} />

      <div
        className="relative rounded-xl p-6 sm:p-8 w-full sm:max-w-md space-y-5 max-h-[92vh] overflow-y-auto"
        style={{
          background:
            'linear-gradient(180deg, #3a2418 0%, #2a1810 50%, #1a0e08 100%)',
          border: '4px solid #c9952a',
          boxShadow:
            '0 0 0 2px #1a0e08, 0 0 0 6px #6b4220, 0 20px 60px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,220,140,0.15), inset 0 -2px 0 rgba(0,0,0,0.4)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center -mt-2">
          <img
            src={logo}
            alt="Rucoy Offline"
            className="w-56 sm:w-64 drop-shadow-2xl"
            style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))' }}
          />
        </div>

        {/* Header */}
        <div className="space-y-1 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-wider"
            style={{
              color: '#f0c040',
              fontFamily: 'serif',
              textShadow: '0 2px 0 #4a2810, 0 0 16px rgba(240,192,64,0.4)',
            }}
          >
            ⚔ Entrar na Aventura ⚔
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: '#c9a878' }}>
            Acesse sua conta para continuar suas aventuras
          </p>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold" style={{ color: '#e8d9b5', fontFamily: 'serif' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="seu@email.com"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded text-sm sm:text-base outline-none transition-all duration-200"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: error ? '3px solid #c84040' : '3px solid #6b4220',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'auto',
            }}
            autoComplete="email"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold" style={{ color: '#e8d9b5', fontFamily: 'serif' }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded text-sm sm:text-base outline-none transition-all duration-200"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: error ? '3px solid #c84040' : '3px solid #6b4220',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
            }}
            autoComplete="current-password"
          />
          {error && (
            <p className="text-red-400 text-xs animate-pulse">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded font-bold text-lg transition-all duration-150 transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isLoading 
                ? 'rgba(240, 192, 64, 0.3)'
                : 'linear-gradient(180deg, #f0c040 0%, #c9952a 50%, #8a6018 100%)',
              color: isLoading ? '#999' : '#2a1810',
              fontFamily: 'serif',
              textShadow: isLoading ? 'none' : '0 1px 0 rgba(255,255,255,0.3)',
              border: '2px solid #4a2810',
              boxShadow: isLoading
                ? 'none'
                : '0 4px 0 #4a2810, 0 6px 12px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
            }}
          >
            {isLoading ? 'Entrando...' : '⚔ Entrar ⚔'}
          </button>

          <button
            onClick={onContinueAsGuest}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded font-bold text-sm transition-all duration-150 transform active:translate-y-0.5 disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg, #4a3020 0%, #2a1810 100%)',
              border: '2px solid #6b4220',
              color: '#c9a878',
              fontFamily: 'serif',
              boxShadow: '0 3px 0 #1a0e08, inset 0 1px 0 rgba(255,220,140,0.15)',
            }}
          >
            Jogar como Visitante
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-3" style={{ borderTop: '2px dashed rgba(201,149,42,0.4)' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#c9a878' }}>
            Não tem conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold transition-colors hover:brightness-125 underline decoration-dotted underline-offset-2"
              style={{ color: '#f0c040', fontFamily: 'serif' }}
            >
              Criar Conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

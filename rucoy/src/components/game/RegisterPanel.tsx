import { useState, useCallback } from 'react'
import heroBg from '@/assets/title-hero.jpg'
import logo from '@/assets/rucoy-logo.png'
import { supabase } from '@/integrations/supabase/client'

interface RegisterPanelProps {
  onRegistered: () => void
  onSwitchToLogin: () => void
}

export default function RegisterPanel({
  onRegistered,
  onSwitchToLogin,
}: RegisterPanelProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [])

  const validateUsername = useCallback((username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username)
  }, [])

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
    setEmailError('')
  }, [])

  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value)
    setUsernameError('')
  }, [])

  const handleRegister = useCallback(async () => {
    let hasErrors = false
    setEmailError('')
    setPasswordError('')
    setUsernameError('')

    if (!email.trim()) {
      setEmailError('Digite seu email.')
      hasErrors = true
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido.')
      hasErrors = true
    }

    if (password.length < 6) {
      setPasswordError('Senha deve ter ao menos 6 caracteres.')
      hasErrors = true
    }

    if (!username.trim()) {
      setUsernameError('Digite um nome de usuário.')
      hasErrors = true
    } else if (!validateUsername(username)) {
      setUsernameError('De 3-20 caracteres, apenas letras, números, _ e -')
      hasErrors = true
    }

    if (hasErrors) return
    setIsLoading(true)
    const redirectUrl = `${window.location.origin}/`
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username }, emailRedirectTo: redirectUrl },
    })
    setIsLoading(false)
    if (error) {
      setEmailError(error.message)
      return
    }
    onRegistered()
  }, [email, password, username, validateEmail, validateUsername, onRegistered])

  const inputClassName = "w-full px-4 py-3 rounded text-sm sm:text-base outline-none transition-all duration-200"

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{ zIndex: 100 }}
    >
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
        className="relative rounded-xl p-6 sm:p-8 w-full sm:max-w-md space-y-4 max-h-[92vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #3a2418 0%, #2a1810 50%, #1a0e08 100%)',
          border: '4px solid #c9952a',
          boxShadow:
            '0 0 0 2px #1a0e08, 0 0 0 6px #6b4220, 0 20px 60px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,220,140,0.15), inset 0 -2px 0 rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex justify-center -mt-2">
          <img src={logo} alt="Rucoy Offline" className="w-48 sm:w-56" style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))' }} />
        </div>

        {/* Header */}
        <div className="space-y-1 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-wider"
            style={{ color: '#f0c040', fontFamily: 'serif', textShadow: '0 2px 0 #4a2810, 0 0 16px rgba(240,192,64,0.4)' }}
          >
            ✦ Criar Conta ✦
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: '#c9a878' }}>
            Registre-se para salvar seu progresso na nuvem
          </p>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold" style={{ color: '#e8d9b5', fontFamily: 'serif' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="seu@email.com"
            disabled={isLoading}
            className={inputClassName}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: emailError ? '3px solid #c84040' : '3px solid #6b4220',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
            }}
            autoComplete="email"
          />
          {emailError && (
            <p className="text-red-400 text-xs animate-pulse">{emailError}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold" style={{ color: '#e8d9b5', fontFamily: 'serif' }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
            placeholder="mínimo 6 caracteres"
            disabled={isLoading}
            className={inputClassName}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: passwordError ? '3px solid #c84040' : '3px solid #6b4220',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
            }}
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-red-400 text-xs animate-pulse">{passwordError}</p>
          )}
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold" style={{ color: '#e8d9b5', fontFamily: 'serif' }}>Nome de Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="SeuNome123"
            disabled={isLoading}
            className={inputClassName}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: usernameError ? '3px solid #c84040' : '3px solid #6b4220',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
            }}
            autoComplete="username"
          />
          {usernameError && (
            <p className="text-red-400 text-xs animate-pulse">{usernameError}</p>
          )}
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
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
          {isLoading ? 'Criando Conta...' : '✦ Criar Conta ✦'}
        </button>

        {/* Switch to Login */}
        <div className="text-center pt-3" style={{ borderTop: '2px dashed rgba(201,149,42,0.4)' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#c9a878' }}>
            Já tem conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold transition-colors hover:brightness-125 underline decoration-dotted underline-offset-2"
              style={{ color: '#f0c040', fontFamily: 'serif' }}
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

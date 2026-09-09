'use client'

import { useState } from 'react'
import { Dumbbell, LogIn, Users } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Field, inputClass, Avatar } from '@/components/shared/ui'
import type { Level } from '@/lib/types'

const LEVELS: Level[] = ['Fillestar', 'Mesatar', 'Avancuar']

export function AuthScreen() {
  const { signUp, logIn, users, switchUser, showToast } = useApp()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')

  // form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [level, setLevel] = useState<Level>('Fillestar')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'login') {
      const res = logIn(email.trim(), password)
      if (!res.ok) setError(res.error ?? 'Gabim gjatë hyrjes.')
      else showToast(`Mirë se erdhe përsëri!`, 'success')
      return
    }
    if (!fullName || !email || !password || !age || !height || !weight) {
      setError('Ju lutem plotësoni të gjitha fushat.')
      return
    }
    const res = signUp({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      level,
    })
    if (!res.ok) setError(res.error ?? 'Gabim gjatë regjistrimit.')
    else showToast('Llogaria u krijua me sukses!', 'success')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-14">
      <div className="animate-rise flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Dumbbell className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">FITSHQIP</h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-balance">
          Stërvitu. Ndiq progresin. Bëhu më i fortë.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setError('')
          }}
          className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Hyr
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError('')
          }}
          className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          Regjistrohu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === 'signup' && (
          <Field label="Emri i plotë">
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="p.sh. Andi Kola"
            />
          </Field>
        )}
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ti@shembull.al"
            autoComplete="email"
          />
        </Field>
        <Field label="Fjalëkalimi">
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </Field>

        {mode === 'signup' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Mosha">
                <input
                  type="number"
                  className={inputClass}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                />
              </Field>
              <Field label="Gjatësia (cm)">
                <input
                  type="number"
                  className={inputClass}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="180"
                />
              </Field>
              <Field label="Pesha (kg)">
                <input
                  type="number"
                  className={inputClass}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="80"
                />
              </Field>
            </div>
            <Field label="Niveli i përvojës">
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      level === l
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {error && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <LogIn className="h-5 w-5" />
          {mode === 'login' ? 'Hyr në llogari' : 'Krijo llogarinë'}
        </button>
      </form>

      {mode === 'login' && users.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Ndërro profil të shpejtë</span>
          </div>
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchUser(u.id)
                  showToast(`Mirë se erdhe, ${u.fullName.split(' ')[0]}!`, 'success')
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
              >
                <Avatar name={u.fullName} color={u.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                {u.isAdmin && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    ADMIN
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Provo shpejt: admin@fitshqip.al / admin123
          </p>
        </div>
      )}

      <footer className="mt-auto pt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
        © 2026 FITSHQIP. Të gjitha të drejtat e rezervuara.
        <br />
        Zhvilluar nga Rei Muho Developments.
      </footer>
    </div>
  )
}

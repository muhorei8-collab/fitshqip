'use client'

import { useState } from 'react'
import {
  Calculator,
  ChevronRight,
  LogOut,
  Ruler,
  Shield,
  Trash2,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { useNav } from '@/components/nav'
import { Avatar, Card, Field, Modal, SectionTitle, inputClass } from '@/components/shared/ui'
import type { Level } from '@/lib/types'
import { displayWeight } from '@/lib/format'

const LEVELS: Level[] = ['Fillestar', 'Mesatar', 'Avancuar']

export function ProfileTab() {
  const { currentUser, updateProfile, toggleAdmin, resetData, logOut, showToast } = useApp()
  const { openScreen } = useNav()
  const [editOpen, setEditOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const [name, setName] = useState(currentUser?.fullName ?? '')
  const [age, setAge] = useState(String(currentUser?.age ?? ''))
  const [height, setHeight] = useState(String(currentUser?.height ?? ''))
  const [weight, setWeight] = useState(String(currentUser?.weight ?? ''))
  const [level, setLevel] = useState<Level>(currentUser?.level ?? 'Fillestar')

  if (!currentUser) return null
  const unit = currentUser.unit

  function saveProfile() {
    if (!name.trim()) {
      showToast('Emri nuk mund të jetë bosh.', 'error')
      return
    }
    updateProfile({
      fullName: name.trim(),
      age: Number(age) || currentUser!.age,
      height: Number(height) || currentUser!.height,
      weight: Number(weight) || currentUser!.weight,
      level,
    })
    showToast('Profili u përditësua!', 'success')
    setEditOpen(false)
  }

  function handleReset() {
    resetData()
    showToast('Të dhënat u fshinë.', 'info')
    setResetOpen(false)
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Profili</h1>
        <p className="text-sm text-muted-foreground">Menaxho llogarinë dhe cilësimet</p>
      </header>

      {/* User info */}
      <Card className="flex items-center gap-4">
        <Avatar name={currentUser.fullName} color={currentUser.avatarColor} size={60} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{currentUser.fullName}</h2>
            {currentUser.isAdmin && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                ADMIN
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{currentUser.email}</p>
          <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {currentUser.level}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-lg font-bold">{currentUser.age}</p>
          <p className="text-xs text-muted-foreground">Vjeç</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold">{currentUser.height}</p>
          <p className="text-xs text-muted-foreground">cm</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold">{displayWeight(currentUser.weight, unit)}</p>
          <p className="text-xs text-muted-foreground">Peshë</p>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => {
          setName(currentUser.fullName)
          setAge(String(currentUser.age))
          setHeight(String(currentUser.height))
          setWeight(String(currentUser.weight))
          setLevel(currentUser.level)
          setEditOpen(true)
        }}
        className="rounded-2xl bg-primary py-3 font-semibold text-primary-foreground"
      >
        Ndrysho Profilin
      </button>

      {/* Tools */}
      <div>
        <SectionTitle>Mjete</SectionTitle>
        <Card className="flex flex-col divide-y divide-border p-0">
          <ToolRow icon={Calculator} label="Kalkulatori i Makros & Kalorive" onClick={() => openScreen('macro')} />
          <ToolRow icon={Trophy} label="Klasifikimi (Leaderboard)" onClick={() => openScreen('leaderboard')} />
          {currentUser.isAdmin && (
            <ToolRow
              icon={Shield}
              label="Paneli i Administratës (HQ)"
              onClick={() => openScreen('admin')}
              highlight
            />
          )}
        </Card>
      </div>

      {/* Settings */}
      <div>
        <SectionTitle>Cilësimet</SectionTitle>
        <Card className="flex flex-col gap-4">
          {/* Unit switcher */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Njësia e peshës
            </span>
            <div className="flex gap-1 rounded-xl border border-border p-1">
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => updateProfile({ unit: u })}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    unit === u ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Admin toggle */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Modaliteti Admin
            </span>
            <button
              type="button"
              onClick={toggleAdmin}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                currentUser.isAdmin ? 'bg-primary' : 'bg-secondary'
              }`}
              role="switch"
              aria-checked={currentUser.isAdmin}
              aria-label="Ndërro modalitetin admin"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  currentUser.isAdmin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>
      </div>

      {/* Danger / account */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 font-semibold text-primary"
        >
          <Trash2 className="h-4 w-4" />
          Rivendos të dhënat
        </button>
        <button
          type="button"
          onClick={() => {
            logOut()
            showToast('Dolët nga llogaria.', 'info')
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 font-semibold"
        >
          <LogOut className="h-4 w-4" />
          Dil nga llogaria
        </button>
      </div>

      {/* Copyright card */}
      <Card className="text-center">
        <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
          © 2026 FITSHQIP. Të gjitha të drejtat e rezervuara.
          <br />
          Zhvilluar nga Rei Muho Developments.
        </p>
      </Card>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho Profilin">
        <div className="flex flex-col gap-4">
          <Field label="Emri i plotë">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Mosha">
              <input type="number" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
            </Field>
            <Field label="Gjatësia">
              <input type="number" className={inputClass} value={height} onChange={(e) => setHeight(e.target.value)} />
            </Field>
            <Field label="Pesha (kg)">
              <input type="number" className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} />
            </Field>
          </div>
          <Field label="Niveli">
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    level === l ? 'border-primary bg-primary/10' : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <button
            type="button"
            onClick={saveProfile}
            className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            Ruaj Ndryshimet
          </button>
        </div>
      </Modal>

      {/* Reset modal */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Rivendos të dhënat?">
        <p className="text-sm text-muted-foreground">
          Ky veprim do të fshijë të gjitha stërvitjet, rekordet, rutinat dhe matjet e tua. Llogaria mbetet aktive. Ky
          veprim nuk mund të zhbëhet.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setResetOpen(false)}
            className="rounded-xl border border-border py-3 font-semibold"
          >
            Anulo
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
          >
            Fshi të gjitha
          </button>
        </div>
      </Modal>
    </div>
  )
}

function ToolRow({
  icon: Icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 p-4 text-left">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          highlight ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

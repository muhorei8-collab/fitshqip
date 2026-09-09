'use client'

import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useApp } from '@/components/app-provider'

export function ToastHost() {
  const { toast } = useApp()
  if (!toast) return null

  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : Info
  const color =
    toast.tone === 'success'
      ? 'text-success'
      : toast.tone === 'error'
        ? 'text-primary'
        : 'text-foreground'

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className="animate-rise flex max-w-sm items-center gap-2.5 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
        <Icon className={`h-5 w-5 shrink-0 ${color}`} />
        <p className="text-sm font-medium text-pretty">{toast.message}</p>
      </div>
    </div>
  )
}

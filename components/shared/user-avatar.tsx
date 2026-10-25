'use client'

import { useState } from 'react'
import { Avatar } from '@/components/shared/ui'

// Foto e profilit nëse ka; përndryshe iniciale me ngjyrë (Avatar-i ekzistues).
export function UserAvatar({
  name,
  color,
  url,
  size,
}: {
  name: string
  color: string
  url?: string | null
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) return <Avatar name={name} color={color} {...(size ? { size } : {})} />
  const px = size ?? 40
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: px, height: px }}
    />
  )
}

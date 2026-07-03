'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  index?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'header' | 'ul' | 'li' | 'span'
  delayMs?: number
  once?: boolean
}

/*
  IntersectionObserver-driven fade + slide-up.

  The `is-armed` class (hidden state) is applied only AFTER mount, so JS-off
  visitors still see content immediately. Once visible, the reveal class stays
  on for the rest of the session.

  Stagger via `index` — each item picks up `index * 80ms` of transitionDelay.
*/
export function EditableReveal({
  children,
  index = 0,
  className = '',
  as = 'div',
  delayMs,
  once = true,
}: EditableRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [armed, setArmed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setArmed(true)
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) io.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [once])

  const style: CSSProperties = {
    transitionDelay: `${(delayMs ?? index * 80)}ms`,
  }
  const cls = [
    'editable-reveal',
    armed && !visible ? 'is-armed' : '',
    visible ? 'is-visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const Tag = as as unknown as 'div'
  return (
    <Tag
      ref={ref as never}
      className={cls}
      style={style}
    >
      {children}
    </Tag>
  )
}

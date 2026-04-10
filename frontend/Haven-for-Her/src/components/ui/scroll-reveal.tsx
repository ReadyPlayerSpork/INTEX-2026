import { type ReactNode, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 24,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  const initial: Record<string, number> = { opacity: 0 }
  if (direction === 'up') initial.y = distance
  if (direction === 'down') initial.y = -distance
  if (direction === 'left') initial.x = distance
  if (direction === 'right') initial.x = -distance

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

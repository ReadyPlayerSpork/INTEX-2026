import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (value: number) => string
  className?: string
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString()

export function AnimatedCounter({
  value,
  duration = 1.8,
  format = defaultFormat,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const shouldReduce = useReducedMotion()
  const hasAnimated = useRef(false)

  // For reduced motion, always show the final value directly
  const [display, setDisplay] = useState(0)
  const rendered = shouldReduce ? value : display

  useEffect(() => {
    if (!isInView || hasAnimated.current || shouldReduce) return
    hasAnimated.current = true
    const controls = animate(0, value, {
      duration,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [isInView, value, duration, shouldReduce])

  return (
    <span ref={ref} className={className}>
      {format(rendered)}
    </span>
  )
}

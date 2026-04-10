import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

export function ScrollProgress() {
  const shouldReduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (shouldReduce) return null

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-primary/50"
    />
  )
}

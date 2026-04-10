import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-background", className)}>
      {/* Background layer to ensure text contrast remains intact by keeping opacities very low */}
      <motion.div
        animate={{
          x: ["-2%", "2%", "-2%"],
          y: ["-2%", "2%", "-2%"],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
        className="absolute -top-[20vh] -left-[20vw] w-[140vw] h-[140vh] rounded-full bg-secondary/50 blur-[140px]"
      />
      
      <motion.div
        animate={{
          x: ["2%", "-2%", "2%"],
          y: ["2%", "-2%", "2%"],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "easeInOut",
        }}
        className="absolute top-[10vh] -right-[20vw] w-[140vw] h-[140vh] rounded-full bg-muted/60 blur-[150px]"
      />
      
      <motion.div
        animate={{
          x: ["1%", "-3%", "1%"],
          y: ["3%", "-1%", "3%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[40vh] -left-[20vw] w-[140vw] h-[140vh] rounded-full bg-secondary/50 blur-[140px]"
      />
      
      {/* A subtle grain noise overlay could go here in the future if desired, but keeping pure soft gradients for now */}
      <div className="absolute inset-0 bg-background/5 backdrop-blur-[20px]" />
    </div>
  )
}

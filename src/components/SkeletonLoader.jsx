import { motion } from 'framer-motion'

export default function SkeletonLoader() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
      <div className="h-48 bg-white/5 rounded-xl mb-4" />
      <div className="h-6 bg-white/5 rounded-md w-3/4 mb-2" />
      <div className="h-4 bg-white/5 rounded-md w-1/2 mb-4" />
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
        <div className="h-4 bg-white/5 rounded-md w-1/4" />
        <div className="h-4 bg-white/5 rounded-full w-16" />
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'

export default function GlowCard({ venue, onClick }) {
  const isAlmostFull = venue.occupancy >= 80

  // Brutalist monochrome aesthetics
  return (
    <motion.div
      onClick={() => onClick(venue)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative cursor-pointer group bg-black overflow-hidden border border-white/20 hover:border-white transition-colors duration-500"
    >
      <div className="relative h-72 w-full overflow-hidden grayscale opacity-70 group-hover:opacity-100 transition-opacity duration-700">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
        >
          <source src="/venue.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <span className="px-3 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-widest">
            {venue.type}
          </span>
        </div>

        {/* Text Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-30">
          <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-1">{venue.name}</h3>
          <div className="flex justify-between items-end border-t border-white/20 pt-3 mt-3">
            <span className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-mono">{venue.city}</span>
            <span className="text-[10px] font-mono text-white tracking-widest uppercase">
              GRID: {venue.occupancy}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Check, X, Clock, User, Phone } from 'lucide-react'

export default function BookingsTable({ bookings, onUpdateStatus }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="border border-white/10 p-12 text-center bg-white/5">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Zero data packets received</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto border border-white/10 bg-black/50">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
            <th className="px-6 py-4">Operative</th>
            <th className="px-6 py-4">Timeline</th>
            <th className="px-6 py-4">Squad</th>
            <th className="px-6 py-4">Tier</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Protocol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bookings.map((b) => (
            <motion.tr 
              key={b._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white tracking-tight">{b.userId?.name || 'Unknown'}</span>
                  <span className="text-[10px] font-mono text-white/30">{b.userId?.email}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                  <Clock size={12} className="text-brand-accent" />
                  {new Date(b.date).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-xs font-bold text-white">{b.guests} Guests</span>
              </td>
              <td className="px-6 py-5">
                <span className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest">
                  {b.tableType}
                </span>
              </td>
              <td className="px-6 py-5">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  b.status === 'confirmed' ? 'text-brand-neon' : 
                  b.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {b.status}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onUpdateStatus(b._id, 'confirmed')}
                    className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all text-white/50"
                  >
                    <Check size={14} />
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(b._id, 'cancelled')}
                    className="w-8 h-8 flex items-center justify-center border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all text-white/50"
                  >
                    <X size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { Star } from 'lucide-react'

export default function StarRating({ rating, setRating, interactive = false, size = 16 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          className={`transition-all duration-300 ${interactive ? 'hover:scale-125' : ''}`}
        >
          <Star
            size={size}
            fill={star <= rating ? 'currentColor' : 'transparent'}
            className={star <= rating ? 'text-brand-accent' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  )
}

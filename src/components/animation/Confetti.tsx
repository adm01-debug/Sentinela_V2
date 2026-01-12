import { useEffect, useState } from 'react';

interface ConfettiPiece { id: number; x: number; color: string; delay: number; }

export function Confetti({ duration = 3000 }: { duration?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            top: '-10px',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Heart } from 'lucide-react';

export default function CelebrationAnimation({ trigger, onComplete }) {
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      startCelebration();
    }
  }, [trigger]);

  const startCelebration = () => {
    setIsVisible(true);
    
    // Create particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      type: ['sparkle', 'star', 'heart'][Math.floor(Math.random() * 3)],
    }));
    
    setParticles(newParticles);

    // Hide after animation
    setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
      if (onComplete) onComplete();
    }, 3000);
  };

  if (!isVisible) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'sparkle':
        return Sparkles;
      case 'star':
        return Star;
      case 'heart':
        return Heart;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti particles */}
      {particles.map((particle) => {
        const Icon = getIcon(particle.type);
        return (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            }}
          >
            <Icon
              className="w-6 h-6 animate-celebration"
              style={{
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
              }}
            />
          </div>
        );
      })}
      
      {/* Center burst */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-burst">
          <div className="text-6xl">🎉</div>
        </div>
      </div>
      
      {/* Success message */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
        <div className="animate-bounce-in bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl font-bold text-xl">
          🌟 Awesome! 🌟
        </div>
      </div>

      <style>{`
        @keyframes celebration {
          0% {
            transform: translateY(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg) scale(1);
            opacity: 0;
          }
        }

        @keyframes burst {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(3) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0) translateY(100px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateY(0);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .animate-celebration {
          animation: celebration forwards;
        }

        .animate-burst {
          animation: burst 1s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  );
}

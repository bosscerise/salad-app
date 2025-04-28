// src/components/HeroGeometric.tsx
import { useState, useEffect } from 'react';

// Type definitions
interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

interface HeroGeometricProps {
  badge?: string;
  title1?: string;
  title2?: string;
}

// ElegantShape component with Tailwind v4 animations
const ElegantShape: React.FC<ElegantShapeProps> = ({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-white/8',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`
        absolute ${className}
        opacity-0 ${isVisible ? 'animate-fadeIn' : ''}
        transform ${isVisible ? `rotate-${rotate}` : `rotate-${rotate - 15}`}
        transition-all duration-2000 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ animationDelay: `${delay * 1000}ms` }} // Convert seconds to milliseconds for consistency
    >
      <div
        className={`
          relative w-[${width}px] h-[${height}px]
          ${isVisible ? 'animate-bounce' : ''}
        `}
      >
        <div
          className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r to-transparent ${gradient}
            backdrop-blur-[2px] border-2 border-white/15
            shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]
            after:absolute after:inset-0 after:rounded-full
            after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]
          `}
        />
      </div>
    </div>
  );
};

// HeroGeometric component
const HeroGeometric: React.FC<HeroGeometricProps> = ({
  badge = 'Salad Shack',
  title1 = 'Elevate Your',
  title2 = 'Salad Experience',
}) => {
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/15"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/15"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/15"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/15"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/15"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="container relative z-10 px-4 mx-auto md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border rounded-full bg-white/3 border-white/8 md:mb-12">
            <span className="w-5 h-5 rounded-full bg-white/10" /> {/* Placeholder for badge */}
            <span className="text-sm tracking-wide text-white/60">{badge}</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-8xl md:mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80">{title1}</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              {title2}
            </span>
          </h1>

          <p className="max-w-xl px-4 mx-auto mb-8 text-base font-light leading-relaxed tracking-wide sm:text-lg md:text-xl text-white/40">
            Crafting exceptional salad experiences through fresh ingredients and innovative design.
          </p>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900 via-transparent to-gray-900/80" />
    </div>
  );
};

export default HeroGeometric;
import React, { useEffect, useRef, useState } from 'react';

export const RoadRunnerAnimation = () => {
  const roadRunnerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const newPos = direction === 'right' ? prev + 3 : prev - 3;
        
        // Change direction when reaching boundaries
        if (newPos >= window.innerWidth - 60) {
          setDirection('left');
          return window.innerWidth - 60;
        } else if (newPos <= 0) {
          setDirection('right');
          return 0;
        }
        
        return newPos;
      });
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      ref={roadRunnerRef}
      className="fixed top-1/2 z-50 pointer-events-none"
      style={{
        left: `${position}px`,
        transform: `translateY(-50%) ${direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div className="relative">
        {/* Road Runner Body */}
        <div className="w-12 h-16 relative">
          {/* Head */}
          <div className="absolute top-0 left-2 w-8 h-6 bg-blue-400 rounded-full border-2 border-blue-600">
            {/* Beak */}
            <div className="absolute -right-2 top-2 w-3 h-2 bg-yellow-400 rounded-sm transform rotate-12"></div>
            {/* Eye */}
            <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full">
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-black rounded-full"></div>
            </div>
          </div>
          
          {/* Body */}
          <div className="absolute top-4 left-1 w-10 h-8 bg-blue-500 rounded-lg border-2 border-blue-700">
            {/* Chest marking */}
            <div className="absolute top-1 left-2 w-6 h-3 bg-white rounded-sm"></div>
          </div>
          
          {/* Tail feathers */}
          <div className="absolute top-6 -left-2 w-4 h-6 bg-blue-600 rounded-full transform -rotate-12"></div>
          
          {/* Running legs with animation */}
          <div className="absolute bottom-0 left-3 flex space-x-1">
            <div className={`w-1 h-4 bg-yellow-500 rounded-sm transition-transform duration-100 ${
              Math.floor(Date.now() / 100) % 2 === 0 ? 'transform rotate-12' : 'transform -rotate-12'
            }`}></div>
            <div className={`w-1 h-4 bg-yellow-500 rounded-sm transition-transform duration-100 ${
              Math.floor(Date.now() / 100) % 2 === 1 ? 'transform rotate-12' : 'transform -rotate-12'
            }`}></div>
          </div>
        </div>
        
        {/* Speed lines */}
        <div className="absolute top-6 -left-8 flex flex-col space-y-1 opacity-60">
          <div className="w-6 h-0.5 bg-primary rounded-full animate-pulse"></div>
          <div className="w-4 h-0.5 bg-primary rounded-full animate-pulse delay-75"></div>
          <div className="w-5 h-0.5 bg-primary rounded-full animate-pulse delay-150"></div>
        </div>
        
        {/* Dust cloud */}
        <div className="absolute bottom-0 -left-6 flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
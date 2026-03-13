import React, { useEffect, useRef } from 'react';
import { useSpring } from 'motion/react';

interface Point {
  x: number;
  y: number;
  age: number;
}

export const MouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  
  const springX = useSpring(0, { damping: 25, stiffness: 450 });
  const springY = useSpring(0, { damping: 25, stiffness: 450 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      springX.set(e.clientX);
      springY.set(e.clientY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentX = springX.get();
      const currentY = springY.get();
      
      // Only add point if it moved significantly to save memory/CPU
      const lastPoint = points.current[points.current.length - 1];
      if (!lastPoint || Math.abs(lastPoint.x - currentX) > 1 || Math.abs(lastPoint.y - currentY) > 1) {
        points.current.push({ x: currentX, y: currentY, age: 0 });
      }

      // Update points
      points.current.forEach(p => p.age++);
      
      // Remove old points
      const maxAge = 30;
      points.current = points.current.filter(p => p.age < maxAge);

      if (points.current.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 1; i < points.current.length; i++) {
          const p = points.current[i];
          const prevP = points.current[i - 1];
          
          const opacity = (1 - (p.age / maxAge)) * 0.5;
          const width = (1 - (p.age / maxAge)) * 3;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = width;
          ctx.moveTo(prevP.x, prevP.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'difference' }}
    />
  );
};

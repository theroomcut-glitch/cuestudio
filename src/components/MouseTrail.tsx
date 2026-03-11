import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
}

export const MouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });

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
      mousePos.current = { x: e.clientX, y: e.clientY };
      points.current.push({ x: e.clientX, y: e.clientY, age: 0 });
    };

    const handleMouseOut = (e: MouseEvent) => {
      // If mouse leaves the window or enters an iframe, we clear the points
      // so the trail doesn't "hang" at the edge.
      if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'IFRAME') {
        // We don't clear immediately to let the trail finish its animation
        // but we can mark it.
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    handleResize();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update points
      points.current.forEach(p => p.age++);
      
      // Remove old points
      const maxAge = 40;
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

      // Draw cursor dot with a slight fade if it's "stale"
      // If the last point is getting old, it means the mouse stopped moving or left the area
      const lastPoint = points.current[points.current.length - 1];
      const dotOpacity = lastPoint ? Math.max(0, 1 - (lastPoint.age / 20)) : 0;

      if (dotOpacity > 0) {
        ctx.beginPath();
        ctx.arc(mousePos.current.x, mousePos.current.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dotOpacity * 0.8})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
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

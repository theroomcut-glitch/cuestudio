/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { Send, ExternalLink, Play, Pause, Volume2, VolumeX, Volume1, MousePointer2, Cpu, Zap, Layers, Monitor } from "lucide-react";
import { MouseTrail } from "./components/MouseTrail";

const VIDEOS = [
  { 
    id: "ln6y-gGX7E0",
    title: "Expert Reels #1", 
    glow: "from-cyan-500/20 via-blue-500/10 to-transparent",
    bgGradient: "from-black via-cyan-900/40 to-black"
  },
  { 
    id: "hPC8ym8lN7Q",
    title: "Expert Reels #2", 
    glow: "from-blue-500/20 via-indigo-500/10 to-transparent",
    bgGradient: "from-black via-blue-900/40 to-black"
  }, 
  { 
    id: "v8w7OHM2HzM",
    title: "Expert Reels #3", 
    glow: "from-indigo-500/20 via-purple-500/10 to-transparent",
    bgGradient: "from-black via-indigo-900/40 to-black"
  },
];

// --- Components ---

interface MagneticLetterProps {
  children: string;
  strength?: number;
  key?: React.Key;
}

function MagneticLetter({ children, strength = 50, mouseX, mouseY }: MagneticLetterProps & { mouseX: any, mouseY: any }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotate = useSpring(rotate, springConfig);

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = mouseX.get() - centerX;
      const distanceY = mouseY.get() - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const radius = 100;
      if (distance < radius) {
        const power = (radius - distance) / radius;
        x.set(-distanceX * power * (strength / 30));
        y.set(-distanceY * power * (strength / 30));
        rotate.set(-distanceX * power * 0.2);
      } else {
        x.set(0);
        y.set(0);
        rotate.set(0);
      }
    };

    const unsubscribeX = mouseX.on("change", update);
    const unsubscribeY = mouseY.on("change", update);
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, strength]);

  return (
    <span className="relative inline-block" style={{ willChange: "transform" }}>
      <motion.span
        ref={ref}
        style={{ 
          x: springX, 
          y: springY, 
          rotate: springRotate,
          display: "inline-block",
          whiteSpace: "pre",
        }}
        className="relative z-10"
      >
        {children}
      </motion.span>
    </span>
  );
}

const MemoizedMagneticLetter = React.memo(MagneticLetter);

function CustomCursor({ mouseX, mouseY, type }: { mouseX: any, mouseY: any, type: string }) {
  // Use motion values directly for instant response
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <AnimatePresence mode="wait">
        {type === 'play' ? (
          <motion.div
            key="play"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
          />
        ) : type === 'grabbing' ? (
          <motion.div
            key="grabbing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          />
        ) : type === 'hover' ? (
          <motion.div
            key="hover"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        ) : (
          <motion.div
            key="default"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-3 h-3 bg-white rounded-full"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Magnetic({ children, strength = 0.5, triggerRef, mouseX, mouseY }: { children: React.ReactNode, strength?: number, triggerRef?: React.RefObject<HTMLDivElement>, mouseX: any, mouseY: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 150 });
  const springY = useSpring(y, { damping: 20, stiffness: 150 });

  useEffect(() => {
    const update = () => {
      const target = triggerRef?.current || ref.current;
      if (!target) return;

      const { left, top, width, height } = target.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distanceX = mouseX.get() - centerX;
      const distanceY = mouseY.get() - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const radius = 200;
      if (distance < radius) {
        const power = (radius - distance) / radius;
        x.set(distanceX * strength * power);
        y.set(distanceY * strength * power);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const unsubscribeX = mouseX.on("change", update);
    const unsubscribeY = mouseY.on("change", update);
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, strength, triggerRef]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

function Marquee() {
  const skills = ["MOTION DESIGN", "3D ANIMATION", "VISUAL STORYTELLING", "CGI", "AFTER EFFECTS", "BLENDER", "PREMIERE PRO"];
  return (
    <div className="w-full overflow-hidden bg-white/5 py-4 border-y border-white/5 backdrop-blur-sm">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap w-fit"
      >
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-12 items-center px-6">
            {skills.map((skill) => (
              <span key={skill} className="text-sm font-black tracking-[0.3em] text-white/20 uppercase flex items-center">
                {skill}
                <span className="mx-4 text-cyan-500/40">•</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function BentoCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [12, -12]);
  const rotateY = useTransform(x, [-100, 100], [-12, 12]);
  const springX = useSpring(rotateX, { damping: 25, stiffness: 150 });
  const springY = useSpring(rotateY, { damping: 25, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-32 px-6">
      {/* Bio Block */}
      <BentoCard className="md:col-span-2">
        <div className="h-full p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <p className="text-xl leading-relaxed text-white/80 font-medium">
              Специализируюсь на создании выразительного моушен-дизайна и 3D-графики. 
              Создаю понятные визуальные концепции, раскадровки и анимацию.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Available for work</span>
          </div>
        </div>
      </BentoCard>

      {/* Experience Block */}
      <BentoCard>
        <div className="h-full p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center group">
          <span className="text-6xl font-black text-cyan-400 mb-2">2+</span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-50">Года опыта</span>
        </div>
      </BentoCard>

      {/* Software Block */}
      <BentoCard>
        <div className="h-full p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-wrap gap-4 items-center justify-center group">
          {[
            { name: 'AE', color: 'text-purple-400', rot: -14 },
            { 
              name: 'BL', 
              color: 'text-orange-400',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg',
              rot: 18 // Opposite tilt for Blender
            },
            { name: 'PR', color: 'text-blue-400', rot: -10 }
          ].map((tool) => (
            <motion.div
              key={tool.name}
              whileHover={{ 
                rotate: tool.rot, 
                scale: 1.1,
                transition: { type: "spring", stiffness: 300, damping: 15 }
              }}
              className={`w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center font-black text-2xl border border-white/10 ${tool.color} shadow-lg`}
            >
              {tool.logo ? (
                <img 
                  src={tool.logo} 
                  alt={tool.name} 
                  className="w-12 h-12 object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                tool.name
              )}
            </motion.div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
}

function CustomVideoPlayer({ video, index, isActive, onPlay, setCursorType, volume }: { 
  video: typeof VIDEOS[0]; 
  index: number; 
  isActive: boolean; 
  onPlay: () => void;
  setCursorType: (type: string) => void;
  volume: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isActive && iframeRef.current) {
      const sendCommand = (func: string, args: any[] = []) => {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
          event: 'command',
          func,
          args
        }), '*');
      };

      // Sync volume and mute state
      sendCommand('setVolume', [volume]);
      if (volume > 0) {
        sendCommand('unMute');
      } else {
        sendCommand('mute');
      }
    }
  }, [volume, isActive]);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden group/player"
      onMouseEnter={() => !isActive && setCursorType('play')}
      onMouseLeave={() => setCursorType('default')}
    >
      {!isActive ? (
        <div 
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={onPlay}
        >
          <VideoCover index={index} bgGradient={video.bgGradient} />
        </div>
      ) : (
        <div className="w-full h-full relative z-30">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&loop=1&playlist=${video.id}&enablejsapi=1&origin=${window.location.origin}`}
            title={video.title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, index, activeId, setActiveId, setCursorType }: any) {
  const [volume, setVolume] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [-10, 10]);
  const rotateY = useTransform(x, [-150, 150], [10, -10]);
  const springX = useSpring(rotateX, { damping: 25, stiffness: 150 });
  const springY = useSpring(rotateY, { damping: 25, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="relative group" 
      ref={cardRef} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (activeId !== video.id) {
          e.preventDefault();
          e.stopPropagation();
          setActiveId(video.id);
        }
      }}
    >
      {/* Custom Dynamic Backlight */}
      <div className={`absolute -inset-6 bg-gradient-to-tr ${video.glow} rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ rotateX: springX, rotateY: springY, perspective: 1000 }}
        className={`relative z-10 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-xl ring-1 ring-white/5 ${activeId !== video.id ? 'hover:border-white/20' : ''}`}
      >
        <div className="relative aspect-[9/16] bg-black">
          <CustomVideoPlayer 
            video={video}
            index={index}
            isActive={activeId === video.id} 
            onPlay={() => setActiveId(video.id)}
            setCursorType={setCursorType}
            volume={volume}
          />

          {/* Custom Volume Slider Overlay */}
          {activeId === video.id && (
            <div 
              className="absolute top-6 right-6 z-50 flex items-center gap-3 bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setVolume(v => v > 0 ? 0 : 50);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                {volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
              </button>
              
              <div className="w-0 group-hover:w-24 overflow-hidden transition-all duration-500 flex items-center pr-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">{video.title}</h3>
          <ExternalLink size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </div>
  );
}

function VideoCover({ index, bgGradient }: { index: number; bgGradient: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 opacity-40 animate-gradient-flow bg-[length:200%_200%] bg-gradient-to-br ${bgGradient}`} />
      
      {/* Noise/Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Text with Aberration */}
      <div className="relative z-10 -rotate-6 transform transition-transform duration-700 group-hover:-rotate-3">
        <h2 className="text-5xl font-black uppercase tracking-tighter text-white/90 italic aberration-text">
          reels {index + 1}
        </h2>
      </div>

      {/* Original Bottom Play Button */}
      <div className="absolute bottom-12 flex items-center justify-center z-10">
        <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all duration-500">
          <Play size={24} className="text-white fill-white ml-1 opacity-50 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}



function ScrollRuler({ setCursorType }: { setCursorType: (t: string) => void }) {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const ticks = Array.from({ length: 20 });

  const handleScroll = (clientY: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const percentage = y / rect.height;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: percentage * scrollHeight,
      behavior: 'auto'
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleScroll(e.clientY);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setCursorType('default');
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      setCursorType('grabbing');
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="fixed right-6 top-[55%] -translate-y-1/2 z-[100] flex flex-col items-end gap-1">
      <div 
        ref={rulerRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          handleScroll(e.clientY);
        }}
        onMouseEnter={() => !isDragging && setCursorType('hover')}
        onMouseLeave={() => !isDragging && setCursorType('default')}
        className="relative h-80 w-12 flex flex-col justify-between items-end cursor-pointer pointer-events-auto group/ruler"
      >
        {/* Background Ticks */}
        {ticks.map((_, i) => (
          <div 
            key={i} 
            className={`h-[1px] bg-white/5 transition-all duration-300 ${i % 5 === 0 ? 'w-4 opacity-30' : 'w-2 opacity-10'} group-hover/ruler:bg-cyan-400 group-hover/ruler:opacity-60`}
          />
        ))}
        
        {/* Active Progress Line */}
        <motion.div 
          className="absolute right-0 top-0 w-[1px] bg-cyan-500/50 origin-top rounded-full"
          style={{ height: '100%', scaleY }}
        />

        {/* Floating Indicator Dot */}
        <motion.div 
          className="absolute -right-[3.5px] top-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, 320]) // 320px is h-80
          }}
        />
      </div>
      
      <motion.span 
        className="text-[10px] font-mono text-cyan-500/50 mt-2 uppercase tracking-widest select-none"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [0, 1]) }}
      >
        Scroll
      </motion.span>
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [cursorType, setCursorType] = useState('default');
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const contactLinkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved) setHasMoved(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasMoved]);

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30 cursor-none">
      <ScrollRuler setCursorType={setCursorType} />
      
      {hasMoved && <CustomCursor mouseX={mouseX} mouseY={mouseY} type={cursorType} />}
      <MouseTrail />

      {/* Floating Contact Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 right-8 z-50 hidden md:block"
      >
        <Magnetic strength={0.3} triggerRef={contactLinkRef} mouseX={mouseX} mouseY={mouseY}>
          <div className="w-64 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 text-center">
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">Связь со мной</span>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div ref={contactLinkRef} className="p-2">
                <a 
                  href="https://t.me/cuecute" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-lg font-medium hover:text-cyan-400 transition-colors group"
                >
                  <div className="p-2 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                    <Send size={20} />
                  </div>
                  @cuecute
                </a>
              </div>
            </div>
          </div>
        </Magnetic>
      </motion.div>

      {/* Header */}
      <header className="pt-32 pb-16 px-6 text-center border-b border-white/5 overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl font-black uppercase tracking-tighter brand-shadow mb-4 select-none flex justify-center gap-[0.1em]"
        >
          {"cue".split("").map((char, i) => (
            <MemoizedMagneticLetter key={i} strength={40} mouseX={mouseX} mouseY={mouseY}>{char}</MemoizedMagneticLetter>
          ))}
          <span className="mx-2 md:mx-4" />
          <span className="italic lowercase flex">
            {"studio".split("").map((char, i) => (
              <MemoizedMagneticLetter key={i} strength={30} mouseX={mouseX} mouseY={mouseY}>{char}</MemoizedMagneticLetter>
            ))}
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-white/60 font-medium tracking-wide select-none flex justify-center gap-[0.2em]"
        >
          {"Motion Designer".split("").map((char, i) => (
            <MemoizedMagneticLetter key={i} strength={40} mouseX={mouseX} mouseY={mouseY}>{char === " " ? "\u00A0" : char}</MemoizedMagneticLetter>
          ))}
        </motion.p>
      </header>

      <Marquee />

      <main className="max-w-6xl mx-auto px-6 py-24">
        <BentoGrid />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {VIDEOS.map((video, index) => (
            <VideoCard 
              key={video.id}
              video={video}
              index={index}
              activeId={activeId}
              setActiveId={setActiveId}
              setCursorType={setCursorType}
            />
          ))}
        </div>
      </main>

      <footer className="py-24 px-6 bg-black/50 border-t border-white/5 text-center">
        <h2 className="text-3xl font-bold mb-8 flex justify-center gap-[0.1em] select-none">
          {"Открыт для новых проектов".split("").map((char, i) => (
            <MemoizedMagneticLetter key={i} strength={30} mouseX={mouseX} mouseY={mouseY}>
              {char === " " ? "\u00A0" : char}
            </MemoizedMagneticLetter>
          ))}
        </h2>
        <div className="flex justify-center gap-8">
          <a 
            href="https://t.me/cuecute" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-2xl font-bold hover:text-cyan-400 transition-all"
          >
            <Send size={32} />
            @cuecute
          </a>
        </div>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { Send, ExternalLink, Play } from "lucide-react";
import { MouseTrail } from "./components/MouseTrail";

const VIDEOS = [
  { 
    id: "ln6y-gGX7E0", 
    title: "Expert Reels #1", 
    glow: "from-cyan-500/30 via-cyan-400/10 to-transparent",
    bgGradient: "from-purple-900/50 via-cyan-900/30 to-rose-900/50"
  },
  { 
    id: "hPC8ym8lN7Q", 
    title: "Expert Reels #2", 
    glow: "from-blue-600/20 via-indigo-900/10 to-transparent",
    bgGradient: "from-black via-indigo-950 via-blue-900/20 to-black"
  }, 
  { 
    id: "v8w7OHM2HzM", 
    title: "Expert Reels #3", 
    glow: "from-indigo-500/30 via-purple-500/10 to-transparent",
    bgGradient: "from-indigo-900/60 via-purple-900/40 to-cyan-900/50"
  },
];

function VideoCover({ title, index, bgGradient }: { title: string; index: number; bgGradient: string }) {
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

      {/* Play Button Icon */}
      <div className="absolute bottom-12 flex items-center justify-center">
        <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all duration-500">
          <Play size={24} className="text-white fill-white ml-1 opacity-50 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}

interface MagneticLetterProps {
  children: string;
  strength?: number;
  key?: React.Key;
}

function MagneticLetter({ children, strength = 50, mousePos }: MagneticLetterProps & { mousePos: { x: number, y: number } }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  // Main spring
  const springConfig = { damping: 12, stiffness: 120, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotate = useSpring(rotate, springConfig);

  // Single Trail layer for performance
  const trailX = useSpring(x, { damping: 20, stiffness: 80, mass: 0.2 });
  const trailY = useSpring(y, { damping: 20, stiffness: 80, mass: 0.2 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = mousePos.x - centerX;
    const distanceY = mousePos.y - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    const radius = 120;
    if (distance < radius) {
      const power = (radius - distance) / radius;
      const targetX = -distanceX * power * (strength / 25);
      const targetY = -distanceY * power * (strength / 25);
      x.set(targetX);
      y.set(targetY);
      rotate.set(targetX * 0.4);
    } else {
      x.set(0);
      y.set(0);
      rotate.set(0);
    }
  }, [mousePos, strength, x, y, rotate]);

  return (
    <span className="relative inline-block" style={{ willChange: "transform" }}>
      {/* Trail Layer */}
      <motion.span
        style={{ 
          x: trailX, 
          y: trailY, 
          rotate: springRotate,
          opacity: 0.15,
          display: "inline-block",
          whiteSpace: "pre",
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transform: "translateZ(0)"
        }}
      >
        {children}
      </motion.span>
      
      {/* Main Letter */}
      <motion.span
        ref={ref}
        style={{ 
          x: springX, 
          y: springY, 
          rotate: springRotate,
          display: "inline-block",
          whiteSpace: "pre",
          transform: "translateZ(0)"
        }}
        className="relative z-10"
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30">
      <MouseTrail />
      {/* Floating Contact Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 right-8 z-50 hidden md:block"
      >
        <div className="w-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-white/5 border-b border-white/5 text-center">
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Связь со мной</span>
          </div>
          <div className="p-6 flex flex-col items-center gap-4">
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
      </motion.div>

      {/* Header */}
      <header className="pt-32 pb-16 px-6 text-center border-b border-white/5 overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl font-black uppercase tracking-tighter brand-shadow mb-4 cursor-default select-none flex justify-center gap-[0.1em]"
        >
          {"cue".split("").map((char, i) => (
            <MagneticLetter key={i} strength={40} mousePos={mousePos}>{char}</MagneticLetter>
          ))}
          <span className="mx-2 md:mx-4" />
          <span className="italic lowercase flex">
            {"studio".split("").map((char, i) => (
              <MagneticLetter key={i} strength={30} mousePos={mousePos}>{char}</MagneticLetter>
            ))}
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-white/60 font-medium tracking-wide cursor-default select-none flex justify-center gap-[0.2em]"
        >
          {"Motion Designer".split("").map((char, i) => (
            <MagneticLetter key={i} strength={40} mousePos={mousePos}>{char === " " ? "\u00A0" : char}</MagneticLetter>
          ))}
        </motion.p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-24">
        {/* About Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-24"
        >
          <div className="relative inline-block pb-6 group">
            <p className="text-lg md:text-xl leading-relaxed text-white/80 cursor-default select-none">
              Специализируюсь на создании выразительного моушен-дизайна и 3D-графики. 
              Создаю понятные визуальные концепции, раскадровки и анимацию с использованием After Effects и Blender. 
              Люблю минимализм, внимание к деталям и чистый стиль.
            </p>
            
            {/* Center-to-Edges Underline Animation (Seamless Flow) */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] flex justify-center items-center pointer-events-none">
              {/* Seamless Outward Waves */}
              {[0, 1].map((i) => (
                <React.Fragment key={i}>
                  {/* Left Wing */}
                  <motion.div
                    className="absolute right-1/2 h-[1.5px] w-1/2 bg-gradient-to-l from-cyan-400 via-cyan-400/20 to-transparent origin-right"
                    animate={{
                      scaleX: [0, 1],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeOut"
                    }}
                    style={{ filter: "blur(0.5px)" }}
                  />
                  {/* Right Wing */}
                  <motion.div
                    className="absolute left-1/2 h-[1.5px] w-1/2 bg-gradient-to-r from-cyan-400 via-cyan-400/20 to-transparent origin-left"
                    animate={{
                      scaleX: [0, 1],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeOut"
                    }}
                    style={{ filter: "blur(0.5px)" }}
                  />
                </React.Fragment>
              ))}
            </div>
            
            {/* Static Base Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5" />
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {VIDEOS.map((video, index) => (
            <div key={video.id} className="relative group">
              {/* Custom Dynamic Backlight */}
              <div className={`absolute -inset-6 bg-gradient-to-tr ${video.glow} rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.04,
                  boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(34, 211, 238, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.4)"
                }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 120, // Much softer
                  damping: 20,   // Higher damping to stop the "shaking"
                  mass: 1        // Natural weight
                }}
                onClick={() => setActiveId(video.id)}
                className="relative z-10 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl cursor-pointer ring-1 ring-white/5"
              >
                <div className="relative aspect-[9/16] bg-black group/video">
                  {/* Click Overlay */}
                  {activeId !== video.id && (
                    <div className="absolute inset-0 z-10 cursor-pointer">
                      <VideoCover title={video.title} index={index} bgGradient={video.bgGradient} />
                    </div>
                  )}
                  
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&loop=1&playlist=${video.id}${activeId === video.id ? '&autoplay=1' : ''}`}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white/90">{video.title}</h3>
                  <ExternalLink size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-24 px-6 bg-black/50 border-t border-white/5 text-center">
        <h2 className="text-3xl font-bold mb-8 flex justify-center gap-[0.1em] cursor-default select-none">
          {"Открыт для новых проектов".split("").map((char, i) => (
            <MagneticLetter key={i} strength={30} mousePos={mousePos}>
              {char === " " ? "\u00A0" : char}
            </MagneticLetter>
          ))}
        </h2>
        <div className="flex justify-center gap-8">
          <a 
            href="https://t.me/cuecute" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-2xl font-bold hover:text-cyan-400 transition-all hover:scale-105"
          >
            <Send size={32} />
            @cuecute
          </a>
        </div>
      </footer>
    </div>
  );
}

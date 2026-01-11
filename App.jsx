import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring, useAnimationFrame, useVelocity } from 'framer-motion';
import Lenis from 'lenis';
import emailjs from '@emailjs/browser';
import {
    Atom, Cpu, Code, Palette, Mic, ChevronDown, Check, Sparkles, Send,
    Rocket, Users, Award, Lightbulb, Target, ArrowRight, BookOpen,
    FlaskConical, Trophy, HelpCircle, MessageSquare, Quote, Zap, Menu, X,
    Terminal, Globe, Activity, Layers, Database, Hash, Crosshair, Layout, Wrench, RotateCw, Skull,
    Fingerprint, Search, Gamepad2
} from 'lucide-react';

// Images
const IMAGES = {
    robotics: "/assets/robotics.png",
    coding: "/assets/coding.png",
};

/* ============================================================================ */
/*                          UTILITY COMPONENTS                                  */
/* ============================================================================ */

const ScrambleText = ({ text, className, hover = true }) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    const [display, setDisplay] = useState(text);
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text, trigger]);

    return (
        <span
            className={className}
            onMouseEnter={() => hover && setTrigger(prev => prev + 1)}
        >
            {display}
        </span>
    );
};

const ValidationIcon = ({ status }) => {
    // status: 'neutral', 'valid', 'invalid', 'spam'
    // improved animation: clear overlap transition (smooth) instead of waiting
    return (
        <div className="relative w-6 h-6">
            <AnimatePresence>
                {status === 'valid' && (
                    <motion.div
                        key="valid"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div className="absolute inset-0 bg-lime-400/20 rounded-full blur-md" />
                        <Check className="text-lime-400 w-6 h-6 drop-shadow-[0_0_8px_rgba(163,230,53,1)] relative z-10" strokeWidth={3} />
                    </motion.div>
                )}
                {status === 'invalid' && (
                    <motion.div
                        key="invalid"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: 90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: -90, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md" />
                        <X className="text-red-500 w-6 h-6 drop-shadow-[0_0_8px_rgba(239,68,68,1)] relative z-10" strokeWidth={3} />
                    </motion.div>
                )}
                {status === 'spam' && (
                    <motion.div
                        key="spam"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                        <div className="absolute inset-0 bg-red-600/30 rounded-full blur-lg" />
                        <Skull className="text-red-600 w-6 h-6 drop-shadow-[0_0_15px_rgba(255,0,0,1)] animate-pulse relative z-10" strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SpotlightItem = ({ children, className = "" }) => {
    const divRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`spotlight-card ${className}`}
        >
            {children}
        </div>
    );
};

const TiltCard = ({ children, className = "", ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
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
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transform-preserve-3d ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const TechOverlay = () => {
    // Current Time
    const [time, setTime] = useState("");
    useEffect(() => {
        const timer = setInterval(() => {
            const d = new Date();
            setTime(d.toISOString().split('T')[1].split('.')[0]);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5]">
            {/* Grid */}
            <div className="absolute inset-0 bg-grid-white opacity-20" />

            {/* Scanlines */}
            <div className="scanline" />

            {/* Corner Crosshairs */}
            <div className="crosshair top-8 left-8" />
            <div className="crosshair top-8 right-8" />
            <div className="crosshair bottom-8 left-8" />
            <div className="crosshair bottom-8 right-8" />

            {/* System Data */}
            <div className="absolute top-8 left-16 font-mono text-[10px] text-white/40 flex gap-4">
                <span>SYS.VER.3.0.2</span>
                <span className="text-lime-400">● ONLINE</span>
            </div>

            <div className="absolute top-8 right-16 font-mono text-[10px] text-white/40 text-right">
                <div>T: {time}</div>
                <div>LOC: 16.85°N, 107.10°E</div>
            </div>

            <div className="absolute bottom-8 left-16 font-mono text-[10px] text-white/40">
                CPU: <span className="text-white">OPTIMAL</span> // MEM: <span className="text-white">STABLE</span>
            </div>

            {/* Ruler Lines */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-white/20 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-[1px] bg-white/50" />)}
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-white/20 flex flex-col justify-between items-end">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-[1px] bg-white/50" />)}
            </div>
        </div>
    );
}
// ... existing TechOverlay code ...

/* ============================================================================ */
/*                          NEW VISUAL COMPONENTS                               */
/* ============================================================================ */

const ScrambleCounter = ({ value, duration = 2 }) => {
    const [display, setDisplay] = useState("000");
    const nodeRef = useRef(null);
    const inView = useInView(nodeRef, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!inView) return;

        const end = parseInt(value, 10);
        const chars = "0123456789";
        let frame = 0;
        const totalFrames = duration * 60;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;

            if (progress < 1) {
                // Scramble phase
                const random = Math.floor(Math.random() * (end * 1.5));
                setDisplay(random.toString().padStart(end.toString().length, '0'));
            } else {
                setDisplay(end);
                clearInterval(timer);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration, inView]);

    return <span ref={nodeRef} className="tabular-nums font-mono">{display}</span>;
}

const GlitchImage = ({ src, alt, className }) => {
    return (
        <div className={`relative overflow-hidden group ${className}`}>
            <div className="absolute inset-0 bg-lime-400/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-20 mix-blend-overlay" />
            <img src={src} alt={alt} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500 will-change-transform group-hover:scale-110" />

            {/* Glitch slices */}
            <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 pointer-events-none z-30">
                <div className="absolute top-1/4 left-0 w-full h-2 bg-red-500/50 mix-blend-color-dodge animate-pulse" style={{ clipPath: 'inset(0 0 0 0)' }} />
                <div className="absolute bottom-1/3 left-0 w-full h-1 bg-cyan-500/50 mix-blend-color-dodge" />
            </div>
        </div>
    );
}

/* ============================================================================ */
/*                          CUSTOM CURSOR                                       */
/* ============================================================================ */

const CustomCursor = () => {
    const dot = useRef(null);
    const outline = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            const { clientX, clientY } = e;
            if (dot.current) dot.current.style.transform = `translate(${clientX}px, ${clientY}px)`;

            // Delay for outline
            if (outline.current) {
                outline.current.animate({
                    transform: `translate(${clientX}px, ${clientY}px)`
                }, { duration: 500, fill: "forwards" });
            }
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    return (
        <>
            <div ref={dot} className="cursor-dot mix-blend-difference" />
            <div ref={outline} className="cursor-outline mix-blend-difference flex items-center justify-center">
                <div className="w-[1px] h-full bg-white/20" />
                <div className="h-[1px] w-full bg-white/20 absolute" />
            </div>
        </>
    );
};

/* ============================================================================ */
/*                              UI COMPONENTS                                   */
/* ============================================================================ */

// TRON IDENTITY DISC 2.0 (Tech Demo Version - Refined)
const IdentityDisc = ({ onExplode, fastMode = false }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (fastMode) setProgress(80);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onExplode, fastMode ? 300 : 800);
                    return 100;
                }
                return prev + (fastMode ? 4 : 1);
            });
        }, fastMode ? 10 : 30);
        return () => clearInterval(interval);
    }, [fastMode, onExplode]);

    return (
        <div className="relative flex items-center justify-center z-50 perspective-[1000px]">
            <motion.div
                className="relative flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: [0, 360], rotateX: [0, 10, 0] }} // Subtle global float
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                {/* Gyroscopic Ring 1 - X Axis - Fast */}
                <motion.div
                    animate={{ rotateX: 360, rotateY: 45 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[280px] h-[280px] rounded-full border border-cyan-500/30 border-t-cyan-400 border-b-cyan-400"
                    style={{ transformStyle: "preserve-3d" }}
                />

                {/* Gyroscopic Ring 2 - Y Axis - Slower */}
                <motion.div
                    animate={{ rotateY: 360, rotateX: -45 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[260px] h-[260px] rounded-full border border-purple-500/30 border-l-purple-400 border-r-purple-400"
                    style={{ transformStyle: "preserve-3d" }}
                />

                {/* Gyroscopic Ring 3 - Diagonal - Unique */}
                <motion.div
                    animate={{ rotateZ: 360, rotateX: 60 }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[220px] h-[220px] rounded-full border border-white/10 border-t-white/80 border-dashed"
                    style={{ transformStyle: "preserve-3d" }}
                />

                {/* Main Outer Ring - Flat */}
                <svg width="300" height="300" viewBox="0 0 100 100" className="animate-spin-slow relative z-10" style={{ animationDuration: '8s' }}>
                    <defs>
                        <linearGradient id="disc-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
                            <stop offset="50%" stopColor="#00F0FF" stopOpacity="1" />
                            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#7000FF" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="2 4" />
                    <motion.circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="url(#disc-grad-2)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, rotate: -90 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ ease: "linear" }}
                        className="drop-shadow-[0_0_15px_#00F0FF]"
                    />
                </svg>

                {/* Inner Ring (Counter-Rotate) - Technical Markers */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute z-10"
                >
                    <svg width="180" height="180" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#00F0FF" strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="1 5" />
                        <path d="M 50 2 L 52 5 L 48 5 Z" fill="#00F0FF" />
                        <path d="M 50 98 L 52 95 L 48 95 Z" fill="#00F0FF" />
                    </svg>
                </motion.div>

            </motion.div>

            {/* Center Core - STATIC (Moved outside) */}
            <div className="absolute text-center flex flex-col items-center justify-center w-32 h-32 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.2)] z-50">
                <div className="text-[8px] font-mono text-cyan-500 tracking-[0.3em] mb-1 opacity-70 animate-pulse">SYSTEM</div>
                <div className="text-4xl font-black font-mono text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                    {progress}<span className="text-sm align-top opacity-50">%</span>
                </div>
                {/* Data Processing Dots */}
                <div className="mt-1 flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
            </div>
        </div >
    );
};

// DATA STREAM (Falling Matrix Code)
const DataStream = () => {
    const streams = Array.from({ length: 20 }); // 20 streams of code
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
            {streams.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute top-[-100%] text-[10px] font-mono text-cyan-500/40 writing-vertical-rl"
                    style={{
                        left: `${i * 5 + Math.random() * 2}%`,
                        fontSize: `${Math.random() > 0.5 ? 10 : 14}px`,
                    }}
                    animate={{ top: "100%" }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                >
                    {Array.from({ length: 15 }).map(() => (Math.random() > 0.5 ? '1' : '0')).join('')}
                </motion.div>
            ))}
        </div>
    );
};

// PERSPECTIVE GRID (The Floor)
const NeonGrid = ({ show }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        >
            <DataStream />
            <div
                className="absolute inset-0 w-[200vw] h-[200vh] -left-[50%] top-[-50%]"
                style={{
                    backgroundSize: '80px 80px',
                    backgroundImage: `
                        linear-gradient(to right, rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
                    `,
                    transform: 'perspective(500px) rotateX(60deg) translateY(0)',
                    transformOrigin: '50% 100%',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%)',
                    animation: 'grid-move 10s linear infinite' // Add keyframe to index.css if missing or use framer
                }}
            />
        </motion.div>
    );
};

const TerminalBoot = ({ onDone }) => {
    const [lines, setLines] = useState([]);
    const bootText = [
        "INITIALIZING CORE SYSTEM...",
        "LOADING KERNEL MODULES [ROBOTICS, AI, DESIGN]...",
        "> MTX_BRIDGE: CONNECTED",
        "> NEURAL_ENGINE: OPTIMIZED",
        "ESTABLISHING SECURE CONNECTION...",
        "BYPASSING FIREWALL...",
        "ACCESS GRANTED."
    ];

    useEffect(() => {
        let isMounted = true;
        let delay = 0;

        bootText.forEach((line, index) => {
            delay += Math.random() * 150 + 50;
            setTimeout(() => {
                if (!isMounted) return;
                setLines(prev => [...prev, line]);
                if (index === bootText.length - 1) {
                    setTimeout(() => {
                        if (isMounted) onDone();
                    }, 500);
                }
            }, delay);
        });

        return () => { isMounted = false; };
    }, []);

    return (
        <div className="absolute inset-0 flex items-end p-8 pb-32 md:pb-12 md:items-start font-mono text-xs md:text-base text-lime-400 z-10 pointer-events-none">
            <div className="space-y-1 drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">
                {lines.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="text-white/30 mr-2">{`[${new Date().toLocaleTimeString()}]`}</span>
                        <span className={i === lines.length - 1 ? "animate-pulse font-bold bg-lime-400/10 px-1" : ""}>{l}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const HolographicCore = ({ onExplode, fastMode = false }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Fast Mode: Start at 90%
        if (fastMode) {
            setCount(90);
        }

        const interval = setInterval(() => {
            setCount(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onExplode, fastMode ? 200 : 500); // Faster explosion in fastMode
                    return 100;
                }
                // Faster counting if in fastMode or near end
                return prev + (fastMode ? 5 : 1);
            });
        }, fastMode ? 10 : 30);
        return () => clearInterval(interval);
    }, [fastMode, onExplode]);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative">
                {/* Orbitals - More Complex & Cool */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-80px] border border-cyan-500/20 rounded-full border-t-cyan-400/50 border-r-transparent border-b-transparent border-l-transparent"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-110px] border border-lime-500/10 rounded-full border-b-lime-400/50 border-l-transparent border-t-transparent border-r-transparent"
                />

                {/* Inner Pulse Ring */}
                <div className="absolute inset-[-40px] border border-white/10 rounded-full animate-ping opacity-20" />

                {/* Center Core */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-40 h-40 bg-black/80 backdrop-blur-xl border border-lime-400/30 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_100px_rgba(163,230,53,0.2)] overflow-hidden"
                >
                    <span className="text-white/30 text-[9px] tracking-[0.3em] mb-1">SYSTEM_CORE</span>
                    <span className={`font-black text-5xl font-mono tracking-tighter ${count === 100 ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-lime-400'}`}>
                        {count}%
                    </span>

                    {/* Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-400/20 to-transparent animate-scan" style={{ backgroundSize: '100% 3px' }} />
                </motion.div>

                {/* Floating Icons */}
                <motion.div animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-32 left-1/2 -translate-x-1/2 text-cyan-400"><Atom size={32} /></motion.div>
                <motion.div animate={{ y: [0, 15, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-lime-400"><Cpu size={32} /></motion.div>
            </div>
        </div>
    );
};

const IntroSequence = ({ onComplete }) => {
    const [phase, setPhase] = useState('boot'); // boot -> ignition -> complete
    const [isFastBoot, setIsFastBoot] = useState(false);

    useEffect(() => {
        // FAILSAFE: Force complete after 8 seconds to prevent black screen stuck
        const failsafe = setTimeout(() => {
            onComplete();
        }, 8000);

        try {
            const hasVisited = localStorage.getItem('stem_visited_v4'); // Switch to localStorage (Permanent)
            if (hasVisited) {
                console.log("Intro: Fast Boot (User Returned)");
                setIsFastBoot(true);
                setPhase('ignition');
            } else {
                console.log("Intro: Full Boot (First Visit)");
                // DO NOT SET STORAGE HERE to avoid StrictMode double-mount issue
            }
        } catch (e) {
            console.error("Storage access error:", e);
        }

        return () => clearTimeout(failsafe);
    }, []);

    const handleAnimationComplete = () => {
        // Set visited flag in LOCAL STORAGE (Persists after tab close)
        try {
            localStorage.setItem('stem_visited_v4', 'true');
        } catch (e) { }
        onComplete();
    };

    return (
        <AnimatePresence>
            {phase !== 'complete' && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#000508] overflow-hidden flex flex-col items-center justify-center"
                    exit={{
                        opacity: 0,
                        clipPath: "circle(0% at 50% 50%)", // Iris close effect
                        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
                    }}
                >
                    {/* Background Grid - Always present but fades in */}
                    <NeonGrid show={true} />

                    {/* The Identity Disc Loader */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ scale: 5, opacity: 0 }} // Expand out on exit
                        transition={{ duration: 0.8 }}
                    >
                        <IdentityDisc
                            fastMode={isFastBoot}
                            onExplode={() => {
                                setPhase('complete');
                                handleAnimationComplete();
                            }}
                        />
                    </motion.div>

                    {/* System Status Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-12 font-mono text-[10px] text-cyan-500/50 tracking-widest uppercase"
                    >
                        {isFastBoot ? "Quick_Resume_Protocol_v4.2" : "Initializing_System_Grid..."}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// CINEMATIC REVEAL (MASK REVEAL)
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
    return (
        <div className={`overflow-hidden ${className}`}>
            <motion.div
                initial={{ y: "100%", rotate: 5 }}
                whileInView={{ y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }} // smooth expo ease
                className="origin-top-left"
            >
                {children}
            </motion.div>
        </div>
    );
};

const SkewScroll = ({ children, className }) => {
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const skew = useTransform(velocity, [-1000, 1000], [-5, 5]);
    const springSkew = useSpring(skew, { stiffness: 400, damping: 30 });

    return (
        <motion.div style={{ skewY: springSkew }} className={className}>
            {children}
        </motion.div>
    );
};

const Magnetic = ({ children, strength = 0.5 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouse = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * strength);
        y.set((e.clientY - centerY) * strength);
    };

    const reset = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
        >
            {children}
        </motion.div>
    );
};

/* ============================================================================ */
/*                                SECTIONS                                      */
/* ============================================================================ */

// DYNAMIC ISLAND NAVIGATION & SMART ACTION
// DYNAMIC ISLAND NAVIGATION & GAME BAR
const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    // Smart Scroll Logic
    useEffect(() => {
        return scrollY.onChange((latest) => {
            const previous = scrollY.getPrevious();
            if (latest > previous && latest > 150) {
                setHidden(true);
            } else {
                setHidden(false);
            }
        });
    }, [scrollY]);

    const handleSmoothScroll = (e, href) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            setIsOpen(false);
            const targetId = href.replace('#', '');
            if (window.lenis) {
                window.lenis.scrollTo(`#${targetId}`);
            } else {
                const elem = document.getElementById(targetId);
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <motion.nav
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: -100, opacity: 0 }
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-6 left-[48%] -translate-x-1/2 z-50 flex items-start gap-2" // Unified flexible bar, shifted Left (48%)
        >


            {/* 2. MAIN MENU (Dynamic Island) */}
            <motion.div
                layout
                className="glass-panel rounded-3xl overflow-hidden backdrop-blur-xl"
                style={{
                    backgroundColor: 'rgba(5, 5, 5, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    boxShadow: isOpen ? '0 20px 50px -10px rgba(0,0,0,0.8)' : '0 10px 30px -5px rgba(0,0,0,0.5)'
                }}
                animate={{
                    width: isOpen ? 280 : 160,
                    height: isOpen ? "auto" : 48,
                    borderRadius: isOpen ? 20 : 100
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex flex-col relative">
                    {/* Header / Trigger */}
                    <div className="flex items-center justify-between px-2 h-12 w-full z-20">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            <span className="font-black text-black text-xs">S.</span>
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest hover:text-cyan-400 transition-colors"
                        >
                            {isOpen ? 'ĐÓNG' : <ScrambleText text="MENU" hover={false} className="font-mono" />}
                        </button>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="px-5 pb-6 pt-2 flex flex-col gap-4"
                            >
                                <div className="space-y-1">
                                    {[
                                        { label: 'Trang Chủ', href: '#home', sub: 'Main_Deck' },
                                        { label: 'Thuật Toán', href: '#algorithm', sub: 'Core_Logic' },
                                        { label: 'Hệ Thống', href: '#system', sub: 'Sys_Config' },
                                        { label: 'Phân Ban', href: '#tracks', sub: 'Unit_Select' },

                                    ].map((item, i) => (
                                        <motion.a
                                            key={item.label}
                                            href={item.href}
                                            onClick={(e) => handleSmoothScroll(e, item.href)}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 + i * 0.05 }}
                                            className="relative group flex items-center justify-between py-2 border-b border-white/5 hover:border-lime-400/30 transition-colors cursor-pointer"
                                        >
                                            <div className="relative z-10">
                                                <span className="block text-sm font-bold font-sans text-white group-hover:text-lime-400 transition-colors">{item.label}</span>
                                                <span className="text-[9px] font-mono text-white/30 group-hover:text-lime-400/70 transition-colors">/// {item.sub}</span>
                                            </div>
                                            <ArrowRight className="relative z-10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-lime-400" size={12} />

                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 bg-lime-400/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-sm" />
                                        </motion.a>
                                    ))}
                                </div>

                                <div className="mt-2 border-t border-white/10 pt-3 flex justify-between text-[8px] font-mono text-white/40">
                                    <span>EST. 2026</span>
                                    <span>SECURE://V.2</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
            {/* 2. REGISTER BUTTON (Middle) */}
            <motion.a
                href="#apply"
                onClick={(e) => handleSmoothScroll(e, '#apply')}
                className="glass-panel h-12 px-5 flex items-center gap-3 rounded-full bg-black/95 border border-white/10 hover:border-lime-400/50 hover:bg-lime-900/10 transition-all duration-300 group overflow-hidden relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400/0 via-lime-400/10 to-lime-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                {/* Visual Pulse */}
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>

                <span className="font-mono text-[10px] font-bold text-white tracking-widest group-hover:text-lime-400 transition-colors">
                    ĐĂNG KÝ
                </span>

                <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-lime-400 -rotate-90 group-hover:rotate-0 transition-transform duration-300" />
            </motion.a>

            {/* 3. GAME MODULE (Right) */}
            <motion.a
                href="/game"
                className="glass-panel h-12 px-4 md:px-5 flex items-center gap-3 rounded-full bg-black/95 border border-white/10 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all duration-300 group overflow-hidden relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                <Gamepad2 className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />

                {/* Text Stack */}
                <div className="flex flex-col leading-none">
                    <span className="font-black text-[10px] text-white tracking-widest group-hover:text-purple-400 transition-colors">GAME</span>
                    <span className="font-mono text-[8px] text-purple-400/50 group-hover:text-purple-400 transition-colors">ZONE</span>
                </div>

                {/* Tech Decor */}
                <div className="hidden md:block w-[1px] h-4 bg-white/10 mx-1" />
                <div className="hidden md:flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
            </motion.a>
        </motion.nav>
    );
};

const StaggerText = ({ text, className, delay = 0 }) => {
    return (
        <span className={`inline-block overflow-hidden ${className}`}>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className="inline-flex">
                {text.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{ y: "150%", rotate: 5 }}
                        animate={{ y: 0, rotate: 0 }}
                        transition={{
                            duration: 1.2,
                            ease: [0.16, 1, 0.3, 1],
                            delay: delay + index * 0.04
                        }}
                        className="inline-block whitespace-pre"
                    >
                        {char}
                    </motion.span>
                ))}
            </span>
        </span>
    );
};

/* ============================================================================ */
/*                          NEW CINEMATIC HERO                                  */
/* ============================================================================ */

const ParticleMesh = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 800], [1, 0]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // PROPER NULL CHECK
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationFrame;

        const mouse = { x: null, y: null, radius: 200 };

        const handleMouseMove = (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        }

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const count = Math.min(150, (width * height) / 10000); // Increased density
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#ccff00' : '#ffffff',
                    baseX: Math.random() * width, // store original for returning? No, let them float.
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach((p, i) => {
                // Mouse interaction
                if (mouse.x != null) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * 5;
                        const directionY = forceDirectionY * force * 5;
                        p.x -= directionX;
                        p.y -= directionY;
                    }
                }

                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx = -p.vx;
                if (p.y < 0 || p.y > height) p.vy = -p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.6;
                ctx.fill();

                // Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - dist / 1500})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrame = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <motion.canvas
            ref={canvasRef}
            style={{ opacity }}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    );
};

const CinematicHero = () => {
    const { scrollY } = useScroll();
    const yText = useTransform(scrollY, [0, 500], [0, 200]);
    const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#020205]">
            <ParticleMesh />

            {/* Mesh Gradients for depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-lime-400/5 rounded-full blur-[100px]" />

            <motion.div
                style={{ y: yText, opacity: opacityText }}
                className="relative z-10 text-center flex flex-col items-center px-4"
            >
                {/* Intro Tag */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="font-mono text-xs md:text-sm tracking-[0.5em] text-cyan-400 mb-8 uppercase"
                >
                    System Online • 2026
                </motion.div>

                {/* GRAND TYPOGRAPHY */}
                <div className="relative z-20">
                    <StaggerText
                        text="ĐỊNH HÌNH"
                        className="text-[12vw] md:text-[10vw] font-black leading-none tracking-tighter text-white opacity-90 mix-blend-overlay"
                        delay={0.2}
                    />
                </div>
                <div className="relative z-20">
                    <StaggerText
                        text="TƯƠNG LAI"
                        className="text-[12vw] md:text-[10vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400"
                        delay={0.5}
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-8 max-w-xl text-white/50 font-mono text-xs md:text-sm leading-relaxed"
                >
                    Chúng tôi là những kiến trúc sư của tương lai số. Khai phá tiềm năng của <span className="text-white">Robotics</span>, <span className="text-white">Trí Tuệ Nhân Tạo</span>, và <span className="text-white">Thiết Kế Tương Tác</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="mt-12"
                >
                    <a href="#algorithm" onClick={(e) => handleSmoothScroll(e, '#algorithm')} className="group relative px-6 py-3 overflow-hidden border border-white/20 rounded-none bg-transparent hover:bg-white/5 transition-all">
                        <div className="absolute inset-0 w-1 bg-lime-400 transition-all duration-300 group-hover:w-full opacity-10" />
                        <span className="relative flex items-center gap-4 font-mono text-xs text-white">
                            KHỞI_CHẠY_GIAO_THỨC <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </motion.div>
            </motion.div>

            {/* FLOATING ICONS (Parallax & Magnetic) */}
            <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
                {/* 1. Atom (Science/Physics) - Top Left */}
                <div className="absolute top-[20%] left-[15%]">
                    <Magnetic strength={0.5}>
                        <motion.div
                            initial={{ opacity: 0, x: -50, scale: 0 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 2.2, type: "spring" }}
                            className="p-4 border border-cyan-400/30 rounded-full bg-cyan-900/10 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                            <Atom size={40} className="text-cyan-400 animate-spin-slow" />
                        </motion.div>
                    </Magnetic>
                </div>

                {/* 2. CPU (Tech/AI) - Bottom Right */}
                <div className="absolute bottom-[25%] right-[15%]">
                    <Magnetic strength={0.8}>
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 2.4, type: "spring" }}
                            className="p-5 border border-lime-400/30 rounded-xl bg-lime-900/10 backdrop-blur-md shadow-[0_0_30px_rgba(163,230,53,0.2)]"
                        >
                            <Cpu size={40} className="text-lime-400" />
                        </motion.div>
                    </Magnetic>
                </div>

                {/* 3. Code (Decor) - Top Right */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.6, duration: 1 }}
                    className="absolute top-[15%] right-[25%] opacity-30 rotate-12"
                >
                    <Code size={120} className="text-white/5" />
                </motion.div>

                {/* 4. Globe (Decor) - Bottom Left */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.8, duration: 1 }}
                    className="absolute bottom-[10%] left-[20%] opacity-20 -rotate-12"
                >
                    <Globe size={100} className="text-white/5" />
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                <span className="font-mono text-[10px] text-white/30 animate-pulse">CUỘN XUỐNG</span>
            </motion.div>
        </section>
    );
};

/* ============================================================================ */
/*                          LOGICAL DIVIDERS                                    */
/* ============================================================================ */

const SectionDivider = ({ inverted = false }) => {
    return (
        <div className="w-full relative h-24 overflow-hidden -mt-1 pointer-events-none z-10">
            <svg className={`absolute ${inverted ? 'bottom-0' : 'top-0'} w-full h-[100%]`} viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path
                    fill="#020205"
                    fillOpacity="1"
                    d={inverted
                        ? "M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
                        : "M0,0L80,10.7C160,21,320,43,480,48C640,53,800,43,960,37.3C1120,32,1280,32,1360,32L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,0,0Z"
                    }
                />
            </svg>
        </div>
    );
}

/* ============================================================================ */
/*                          MULTI-STEP FORM                                     */
/* ============================================================================ */

const RegistrationForm = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ name: '', class: '', email: '', socialLink: '', track: '', contribution: '' });
    const [touched, setTouched] = useState({ name: false, class: false, email: false, socialLink: false, track: false, contribution: false });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FIX: Add handleInput definition that was missing
    const handleInput = (field, e) => {
        let value = e.target.value;

        // Auto-format Class: 10a1 -> 10A1
        if (field === 'class') {
            value = value.toUpperCase();
        }

        // Auto-format Name: Title Case
        if (field === 'name') {
            value = value.replace(/\b\w/g, c => c.toUpperCase());
        }

        setFormData({ ...formData, [field]: value });
        if (touched[field]) {
            validate(field, value);
        }
    };

    const getStatus = (field) => {
        if (!touched[field]) return 'neutral';
        if (errors[field]) {
            if (errors[field].includes('SYSTEM:') || errors[field].includes('SECURITY ALERT:')) return 'spam';
            return 'invalid';
        }
        return 'valid';
    };

    const validate = (field, value) => {
        let newErrors = { ...errors };

        // --- HEURISTIC ENGINES ---
        const isSpam = (text) => {
            if (!text) return false;
            // 1. Consonant Clusters (e.g., "fdsfsd") - 5+ consonants in a row
            const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
            // 2. Keyboard Mash (e.g., "asdfgh") - Common linear patterns (simplified)
            const mashPattern = /(asdf|hjkl|qwer|zxcv|1234|7890)/i;
            // 3. Repetitive Chars (e.g., "aaaaa") - 4+ same chars
            const repetitive = /(.)\1{3,}/;

            return consonantCluster.test(text) || mashPattern.test(text) || repetitive.test(text);
        };

        const isProfane = (text) => {
            if (!text) return false;
            // Basic blacklist + simple variations
            const blacklist = ['nigga', 'nigger', 'faggot', 'retard', 'cc', 'clmm', 'dmm', 'loz', 'kak', 'buoi', 'lol', 'occho', 'ngu', 'cho', 'dien'];
            const lower = text.toLowerCase().replace(/[^a-z]/g, ''); // Strip symbols to catch "n.i.g.g.a"
            return blacklist.some(word => lower.includes(word));
        };

        if (field === 'name') {
            const basicRegex = /^[a-zA-Z\s\u00C0-\u1EF9]+$/;
            const twoWordsRegex = /^\S+\s+\S+/;

            if (!value) newErrors.name = 'DỮ LIỆU TRỐNG // REQUIRED';
            else if (isProfane(value)) newErrors.name = '⚠️ SECURITY ALERT: NGÔN TỪ KHÔNG PHÙ HỢP';
            else if (isSpam(value)) newErrors.name = '⚠️ SYSTEM: PHÁT HIỆN SPAM/VÔ NGHĨA';
            else if (!basicRegex.test(value)) newErrors.name = 'LỖI CÚ PHÁP: CHỈ CHẤP NHẬN CHỮ CÁI';
            else if (!twoWordsRegex.test(value)) newErrors.name = 'YÊU CẦU: HỌ VÀ TÊN (TỐI THIỂU 2 TỪ)';
            else delete newErrors.name;
        }

        if (field === 'class') {
            const strictClassRegex = /^(10|11|12)[A-Z0-9]*$/;

            if (!value) newErrors.class = 'DỮ LIỆU TRỐNG // REQUIRED';
            else if (isProfane(value)) newErrors.class = '⚠️ SECURITY ALERT: NGÔN TỪ KHÔNG PHÙ HỢP';
            else if (isSpam(value)) newErrors.class = '⚠️ SYSTEM: PHÁT HIỆN SPAM';
            else if (!/^(10|11|12)/.test(value)) newErrors.class = 'LỖI LOGIC: CHỈ KHỐI 10, 11, HOẶC 12';
            else if (!strictClassRegex.test(value)) newErrors.class = 'ĐỊNH DẠNG SAI: VÍ DỤ 10A1, 11B2';
            else delete newErrors.class;
        }

        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) newErrors.email = 'DỮ LIỆU TRỐNG // REQUIRED';
            else if (isProfane(value) || isSpam(value)) newErrors.email = '⚠️ SYSTEM: EMAIL KHÔNG HỢP LỆ';
            else if (!emailRegex.test(value)) newErrors.email = 'LỖI KẾT NỐI: EMAIL KHÔNG HỢP LỆ';
            else delete newErrors.email;
        }

        if (field === 'socialLink') {
            // Optional field, but if entered must be valid URL
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (value && !urlRegex.test(value)) {
                newErrors.socialLink = 'LỖI KẾT NỐI: LINK KHÔNG HỢP LỆ';
            } else if (value && isProfane(value)) {
                newErrors.socialLink = '⚠️ SECURITY ALERT: LINK ĐỘC HẠI';
            } else {
                delete newErrors.socialLink;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        validate(field, formData[field]);
    };

    const nextStep = () => {
        let isValid = true;
        if (step === 0) {
            const nameValid = validate('name', formData.name);
            const classValid = validate('class', formData.class);
            isValid = nameValid && classValid;

            setTouched(prev => ({ ...prev, name: true, class: true }));
        } else if (step === 1) {
            const emailValid = validate('email', formData.email);
            // Social Link is optional, but if it has error (invalid format), block next
            const socialValid = !errors.socialLink;
            isValid = emailValid && socialValid;

            setTouched(prev => ({ ...prev, email: true, socialLink: true }));
        }

        if (isValid) setStep(prev => prev + 1);
        else {
            // Trigger Shake/Glitch Effect globally or on specific field?
            // For now, simple logic ensures error state is set
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!formData.track) return;
        setIsSubmitting(true);

        // Prepare email content
        const trackMap = {
            'Programming': 'Lập trình',
            'Robotics': 'Robot',
            'Science': 'Khoa học',
            'Media': 'Truyền thông',
            'Design': 'Thiết kế'
        };

        const templateParams = {
            to_name: 'STEM Club Admin',
            from_name: formData.name,
            from_class: formData.class,
            from_email: formData.email,
            social_link: formData.socialLink || "Không có",
            selected_track: trackMap[formData.track],
            contribution: formData.contribution || "Không có",
            submission_id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            submission_time: new Date().toLocaleString('vi-VN')
        };

        try {
            // NOTE: You need to install @emailjs/browser: npm install @emailjs/browser
            // And replace these placeholders with your actual EmailJS keys
            await emailjs.send('service_1lf847e', 'template_fwlk2fs', templateParams, 'voANcSoXZbEB5clc4');

            // For now, simulating API call success
            console.log("Email would be sent to tkdang0812@gmail.com", templateParams);
            await new Promise(r => setTimeout(r, 1500));

            // Success
            setIsSubmitting(false);
            setStep(5); // Move to success step (adjusted index)
        } catch (error) {
            console.error("Email send failed:", error);
            alert("Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại!");
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            id: 0,
            title: "Thông tin",
            content: (
                <div className="space-y-8">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 01: KHỞI TẠO HỒ SƠ</p>

                    {/* Name Input */}
                    <div className="group relative">
                        <label className="flex justify-between text-xs font-mono text-white/50 mb-2">
                            <span>DANH TÍNH (Họ và Tên)</span>
                            {errors.name && touched.name && (
                                <span className="text-red-500 font-bold animate-pulse">
                                    [!ERR] {errors.name}
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            className={`form-input text-2xl w-full bg-transparent border-b-2 py-3 focus:outline-none transition-all duration-300 font-mono
                                ${errors.name && touched.name
                                    ? 'border-red-500 text-red-500 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : touched.name && !errors.name
                                        ? 'border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                        : 'border-white/20 text-white focus:border-lime-400'
                                }`}
                            placeholder="NGUYEN VAN A"
                            value={formData.name}
                            onChange={(e) => handleInput('name', e)}
                            onBlur={() => handleBlur('name')}
                        />
                        <div className="absolute right-4 bottom-4">
                            <ValidationIcon status={getStatus('name')} />
                        </div>
                    </div>

                    {/* Class Input */}
                    <div className="group relative">
                        <label className="flex justify-between text-xs font-mono text-white/50 mb-2">
                            <span>ĐƠN VỊ (Lớp)</span>
                            {errors.class && touched.class && (
                                <span className="text-red-500 font-bold animate-pulse">
                                    [!ERR] {errors.class}
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            className={`form-input text-2xl w-full bg-transparent border-b-2 py-3 focus:outline-none transition-all duration-300 font-mono
                                ${errors.class && touched.class
                                    ? 'border-red-500 text-red-500 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : touched.class && !errors.class
                                        ? 'border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                        : 'border-white/20 text-white focus:border-lime-400'
                                }`}
                            placeholder="10A1"
                            value={formData.class}
                            onChange={(e) => handleInput('class', e)}
                            onBlur={() => handleBlur('class')}
                        // maxLength={5} REMOVED: too restrictive
                        />
                        <div className="absolute right-4 bottom-4">
                            <ValidationIcon status={getStatus('class')} />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            title: "Liên hệ",
            content: (
                <div className="space-y-8">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 02: KÊNH LIÊN LẠC</p>
                    <div className="group relative">
                        <label className="flex justify-between text-xs font-mono text-white/50 mb-2">
                            <span>ĐỊA CHỈ EMAIL</span>
                            {errors.email && touched.email && (
                                <span className="text-red-500 font-bold animate-pulse">
                                    [!ERR] {errors.email}
                                </span>
                            )}
                        </label>
                        <input
                            type="email"
                            className={`form-input text-2xl w-full bg-transparent border-b-2 py-3 focus:outline-none transition-all duration-300 font-mono
                                ${errors.email && touched.email
                                    ? 'border-red-500 text-red-500 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : touched.email && !errors.email
                                        ? 'border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                        : 'border-white/20 text-white focus:border-lime-400'
                                }`}
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInput('email', e)}
                            onBlur={() => handleBlur('email')}
                        />
                        <div className="absolute right-4 bottom-4">
                            <ValidationIcon status={getStatus('email')} />
                        </div>
                    </div>

                    {/* Social Link Input */}
                    <div className="group relative">
                        <label className="flex justify-between text-xs font-mono text-white/50 mb-2">
                            <span>MẠNG XÃ HỘI (Facebook/Instagram - Tùy chọn)</span>
                            {errors.socialLink && touched.socialLink && (
                                <span className="text-red-500 font-bold animate-pulse">
                                    [!ERR] {errors.socialLink}
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            className={`form-input text-2xl w-full bg-transparent border-b-2 py-3 focus:outline-none transition-all duration-300 font-mono
                                ${errors.socialLink && touched.socialLink
                                    ? 'border-red-500 text-red-500 animate-shake shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : touched.socialLink && !errors.socialLink && formData.socialLink
                                        ? 'border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                        : 'border-white/20 text-white focus:border-lime-400'
                                }`}
                            placeholder="https://facebook.com/..."
                            value={formData.socialLink}
                            onChange={(e) => handleInput('socialLink', e)}
                            onBlur={() => handleBlur('socialLink')}
                        />
                        <div className="absolute right-4 bottom-4">
                            {/* Only show icon if user has typed something */}
                            {formData.socialLink && <ValidationIcon status={getStatus('socialLink')} />}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 2,
            title: "Đóng góp",
            content: (
                <div className="space-y-6">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 03: KHÁT VỌNG & ĐÓNG GÓP</p>
                    <div className="group">
                        <label className="block text-xs font-mono text-white/50 mb-2">BẠN MUỐN ĐÓNG GÓP GÌ CHO CLB?</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-lime-400 focus:bg-white/10 transition-all min-h-[120px]"
                            placeholder="Chia sẻ ngắn gọn về kỹ năng đặc biệt, mong muốn hoặc ý tưởng dự án của bạn..."
                            value={formData.contribution}
                            onChange={e => setFormData({ ...formData, contribution: e.target.value })}
                        />
                    </div>
                </div>
            )
        },
        {
            id: 3,
            title: "Vị trí",
            content: (
                <div className="space-y-6">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 04: CHỌN MÔ_ĐUN</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'Programming', label: 'Lập trình' },
                            { key: 'Robotics', label: 'Robot' },
                            { key: 'Science', label: 'Khoa học' },
                            { key: 'Media', label: 'Truyền thông' },
                            { key: 'Design', label: 'Thiết kế' }
                        ].map((track) => (
                            <button
                                key={track.key}
                                onClick={() => setFormData({ ...formData, track: track.key })}
                                className={`p-6 border text-left transition-all duration-300 relative overflow-hidden group ${formData.track === track.key ? 'border-lime-400 bg-lime-400/10' : 'border-white/10 hover:border-white/30'}`}
                            >
                                <div className={`absolute inset-0 bg-lime-400/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`} />
                                <div className={`text-xl font-bold relative z-10 ${formData.track === track.key ? 'text-lime-400' : 'text-white'}`}>{track.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 4,
            title: "Xác nhận",
            content: (
                <div className="space-y-8 text-center">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 05: XÁC THỰC DỮ LIỆU</p>
                    <div className="border border-white/10 p-8 text-left space-y-4 font-mono text-sm bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-lime-400/20" />
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Họ và tên:</span> <span className="text-white">{formData.name}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Lớp:</span> <span className="text-white">{formData.class}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Email:</span> <span className="text-white">{formData.email}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Đóng góp:</span> <span className="text-white truncate max-w-[200px]">{formData.contribution || "Không"}</span></div>
                        <div className="flex justify-between"><span>Ban:</span> <span className="text-lime-400">{formData.track === 'Programming' ? 'Lập trình' : formData.track === 'Robotics' ? 'Robot' : formData.track === 'Science' ? 'Khoa học' : formData.track === 'Media' ? 'Truyền thông' : 'Thiết kế'}</span></div>
                    </div>
                </div>
            )
        },
        {
            id: 5,
            title: "Thành công",
            content: (
                <div className="text-center py-12">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-24 h-24 rounded-full bg-lime-400 text-black flex items-center justify-center mx-auto mb-8 box-shadow-neon"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                    <h3 className="text-4xl font-black mb-4 tracking-normal">CHÀO MỪNG BẠN!</h3>
                    <p className="text-white/50 font-mono">Đăng ký thành công. <br /> Mã đăng ký: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
            )
        }
    ];

    return (
        <section id="apply" className="py-32 px-6 relative bg-[#020205]">
            <div className="max-w-3xl mx-auto">
                {step < 5 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-lime-400/20 flex items-center justify-center border border-lime-400">
                                <Activity className="text-lime-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Cổng Đăng Ký</h3>
                                <p className="text-white/50 text-sm font-light">Gia nhập đội ngũ kiến tạo tương lai</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1 w-12 transition-colors duration-500 ${i <= step ? 'bg-lime-400' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <div className="font-mono text-xs text-white/30">TIẾN TRÌNH {step + 1} // 05</div>
                        </div>
                    </div>
                )}

                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            {steps[step].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {step < 4 && (
                    <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                        <button
                            onClick={prevStep}
                            disabled={step === 0}
                            className={`flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <ArrowRight className="rotate-180" size={14} /> QUAY LẠI
                        </button>

                        <button
                            onClick={step === 3 ? handleSubmit : nextStep}
                            disabled={isSubmitting}
                            className="bg-white text-black px-8 py-3 font-bold font-mono text-sm hover:bg-lime-400 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:bg-neutral-800 disabled:text-neutral-500"
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : step === 3 ? 'ĐĂNG KÝ' : 'TIẾP TỤC'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

/* ============================================================================ */
/*                          NEW INTRO SECTION (CINEMATIC)                       */
/* ============================================================================ */

const IntroSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const rotate = useTransform(scrollYProgress, [0, 1], [5, -5]);

    return (
        <section id="system" ref={containerRef} className="relative py-32 bg-[#020205] overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-lime-400/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left: Typography & Content */}
                    <div className="space-y-12">
                        <div className="overflow-hidden">
                            <motion.div
                                initial={{ y: "100%" }}
                                whileInView={{ y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-4 mb-6"
                            >
                                <div className="w-12 h-[1px] bg-lime-400" />
                                <div className="text-lime-400 font-mono text-xs mb-2">ENCRYPTED_DATA</div>
                            </motion.div>
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.9]">
                            <span className="block overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    whileInView={{ y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="block"
                                >
                                    Chúng Tôi
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    whileInView={{ y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="block text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400 italic pr-4"
                                >
                                    Định Hình
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    whileInView={{ y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="block"
                                >
                                    Tương Lai
                                </motion.span>
                            </span>
                        </h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl"
                        >
                            Chúng tôi không chỉ là một câu lạc bộ. Chúng tôi là nơi những ý tưởng điên rồ nhất thành hiện thực.
                            Tại đây, bạn sẽ học cách biến những dòng code khô khan thành nghệ thuật, biến những mô hình tĩnh thành robot có sự sống.
                        </motion.p>

                        {/* Special Rounded Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7 }}
                        >
                            <button className="relative group px-10 py-5 bg-white text-black rounded-full overflow-hidden font-mono font-bold text-sm tracking-wider hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(163,230,53,0.5)]">
                                <span className="relative z-10 flex items-center gap-3">
                                    KHÁM PHÁ NGAY
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Right: Abstract Visual */}
                    <div className="relative h-[600px] w-full hidden lg:block">
                        <motion.div
                            style={{ y, rotate }}
                            className="absolute inset-0 border border-white/10 bg-white/[0.02] backdrop-blur-sm rounded-[2rem] overflow-hidden p-8"
                        >
                            {/* Inner Visual Elements */}
                            <div className="absolute inset-0 bg-grid-white opacity-20" />

                            <div className="absolute top-10 right-10 p-4 border border-white/20 rounded-xl bg-black/50 backdrop-blur-md">
                                <Atom size={48} className="text-lime-400 animate-spin-slow" />
                            </div>

                            <motion.div
                                className="absolute bottom-10 left-10 p-6 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl backdrop-blur-md max-w-xs"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="font-mono text-xs text-white/50">TRỰC TUYẾN</span>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">
                                    <ScrambleCounter value="128" />
                                </div>
                                <div className="text-xs text-white/40">Dự án đang hoạt động</div>
                            </motion.div>

                            {/* Floating Cards */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 2, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-1/3 right-1/4 w-64 h-80 bg-neutral-900/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10"
                            >
                                <img src={IMAGES.robotics} alt="Robotics" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="font-mono text-xs text-lime-400 mb-2">TARGET_ID: UNIT_01</div>
                                    <div className="font-bold text-white">Robotics</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, 30, 0],
                                    rotate: [0, -3, 0]
                                }}
                                transition={{
                                    duration: 7,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute bottom-1/4 left-1/3 w-56 h-72 bg-neutral-900/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                            >
                                <img src={IMAGES.coding} alt="Coding" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="font-mono text-xs text-cyan-400 mb-1">ĐƠN_VỊ_02</div>
                                    <div className="font-bold text-white">Lập Trình</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};


// NEURAL LINK SIMULATION (APTITUDE TEST)
const CyberGameSection = () => {
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, ANALYZING, RESULT, RESETTING
    const [currentScenario, setCurrentScenario] = useState(0);
    const [scores, setScores] = useState({ Programming: 0, Robotics: 0, Science: 0, Media: 0, Design: 0 });
    const [selectedOption, setSelectedOption] = useState(null); // Track selection for animation
    const [isTransitioning, setIsTransitioning] = useState(false);

    const scenarios = [
        {
            id: 1,
            title: "SỞ THÍCH & ĐAM MÊ",
            desc: "Vào những ngày cuối tuần rảnh rỗi, bạn thường dành thời gian cho việc gì nhất?",
            options: [
                { label: "Viết code / Xây dựng web", type: "Programming", icon: Terminal, color: "text-blue-400", border: "group-hover:border-blue-400" },
                { label: "Lắp ráp / Sửa chữa đồ đạc", type: "Robotics", icon: Wrench, color: "text-purple-400", border: "group-hover:border-purple-400" },
                { label: "Đọc sách / Tìm hiểu cái mới", type: "Science", icon: BookOpen, color: "text-green-400", border: "group-hover:border-green-400" },
                { label: "Vẽ vời / Chỉnh sửa ảnh", type: "Design", icon: Palette, color: "text-orange-400", border: "group-hover:border-orange-400" }
            ]
        },
        {
            id: 2,
            title: "VAI TRÒ TRONG NHÓM",
            desc: "Khi làm việc nhóm cùng bạn bè, bạn thường đảm nhận vị trí nào?",
            options: [
                { label: "Người đưa ra giải pháp logic", type: "Programming", icon: Code, color: "text-blue-400", border: "group-hover:border-blue-400" },
                { label: "Người bắt tay vào làm ngay", type: "Robotics", icon: Zap, color: "text-purple-400", border: "group-hover:border-purple-400" },
                { label: "Người cung cấp kiến thức thú vị", type: "Science", icon: Lightbulb, color: "text-green-400", border: "group-hover:border-green-400" },
                { label: "Người lo phần trình bày đẹp", type: "Design", icon: Layout, color: "text-orange-400", border: "group-hover:border-orange-400" }
            ]
        },
        {
            id: 3,
            title: "PHONG CÁCH HỌC TẬP",
            desc: "Cách nào giúp bạn tiếp thu kiến thức mới nhanh nhất?",
            options: [
                { label: "Tư duy logic / Phân tích", type: "Programming", icon: Hash, color: "text-blue-400", border: "group-hover:border-blue-400" },
                { label: "Thực hành / Cầm tay chỉ việc", type: "Robotics", icon: Cpu, color: "text-purple-400", border: "group-hover:border-purple-400" },
                { label: "Đọc tài liệu / Sách giáo khoa", type: "Science", icon: Search, color: "text-green-400", border: "group-hover:border-green-400" },
                { label: "Xem hình ảnh / Video minh họa", type: "Design", icon: Layout, color: "text-orange-400", border: "group-hover:border-orange-400" }
            ]
        },
        {
            id: 4,
            title: "GIÁ TRỊ CỐT LÕI",
            desc: "Điều gì quan trọng nhất đối với bạn trong một sản phẩm?",
            options: [
                { label: "Sự ổn định & Hiệu quả", type: "Programming", icon: Check, color: "text-blue-400", border: "group-hover:border-blue-400" },
                { label: "Sự mạnh mẽ & Chắc chắn", type: "Robotics", icon: Zap, color: "text-purple-400", border: "group-hover:border-purple-400" },
                { label: "Tính mới mẻ & Khám phá", type: "Science", icon: Globe, color: "text-green-400", border: "group-hover:border-green-400" },
                { label: "Sự nổi bật & Lan tỏa", type: "Media", icon: Mic, color: "text-pink-400", border: "group-hover:border-pink-400" }
            ]
        },
        {
            id: 5,
            title: "LỰA CHỌN CUỐI CÙNG",
            desc: "Nếu phải chọn một vật dụng để mang theo, bạn sẽ chọn gì?",
            options: [
                { label: "Laptop cấu hình cao", type: "Programming", icon: Database, color: "text-blue-400", border: "group-hover:border-blue-400" },
                { label: "Bộ dụng cụ đa năng", type: "Robotics", icon: Wrench, color: "text-purple-400", border: "group-hover:border-purple-400" },
                { label: "Máy quay / Máy ghi âm", type: "Media", icon: Mic, color: "text-pink-400", border: "group-hover:border-pink-400" },
                { label: "Bộ màu vẽ / Máy tính bảng", type: "Design", icon: Palette, color: "text-orange-400", border: "group-hover:border-orange-400" }
            ]
        }
    ];

    // Check imports: Zap, Wrench, Lightbulb, Layout, Hash, Cpu, Search, Check, Globe, Mic, Database, Terminal, BookOpen, Palette, Code. 
    // All seem standard except Camera (swapping to something else).
    const [result, setResult] = useState(null);

    // Calculate result early for the animation
    const calculateResult = (finalScores) => {
        let maxScore = -1;
        let winner = 'Programming';
        Object.entries(finalScores).forEach(([key, val]) => {
            if (val > maxScore) {
                maxScore = val;
                winner = key;
            }
        });
        return winner;
    };

    const handleOptionClick = (type, index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setSelectedOption(index);

        // Update scores
        const newScores = { ...scores, [type]: scores[type] + 1 };
        setScores(newScores);

        setTimeout(() => {
            if (currentScenario < scenarios.length - 1) {
                setCurrentScenario(prev => prev + 1);
                setSelectedOption(null);
                setIsTransitioning(false);
            } else {
                // Calculate winner BEFORE entering analyzing state
                const winner = calculateResult(newScores);
                setResult(winner);
                setGameState('ANALYZING');

                // Wait for animation then show result
                setTimeout(() => {
                    setGameState('RESULT');
                }, 4000); // 4 seconds for full animation
            }
        }, 800);
    };

    const handleRecalibrate = () => {
        setGameState('RESETTING');
        setTimeout(() => {
            setGameState('INTRO');
            setCurrentScenario(0);
            setSelectedOption(null);
            setIsTransitioning(false); // CRITICAL FIX: Reset transition lock
            setScores({ Programming: 0, Robotics: 0, Science: 0, Media: 0, Design: 0 });
        }, 2500);
    };



    const tracks = {
        Programming: { title: "KIẾN TRÚC SƯ THẦN KINH", subtitle: "CÔNG NGHỆ PHẦN MỀM", desc: "Bạn nói ngôn ngữ của máy móc. Tâm trí bạn ánh xạ các logic phức tạp thành các giải pháp tinh tế.", color: "text-blue-400", bg: "bg-blue-600", border: "border-blue-400", icon: Code, gradient: "from-blue-600 to-cyan-500" },
        Robotics: { title: "KỸ SƯ ĐỘNG LỰC HỌC", subtitle: "ROBOTICS & IOT", desc: "Bạn nối liền khoảng cách giữa mã kỹ thuật số và thực tế vật lý. Bạn xây dựng tương lai.", color: "text-purple-400", bg: "bg-purple-600", border: "border-purple-400", icon: Cpu, gradient: "from-purple-600 to-pink-500" },
        Science: { title: "NHÀ THÁM HIỂM LƯỢNG TỬ", subtitle: "KHOA HỌC ỨNG DỤNG", desc: "Sự tò mò là động cơ của bạn. Bạn giải mã những bí ẩn của vũ trụ thông qua dữ liệu.", color: "text-green-400", bg: "bg-green-600", border: "border-green-400", icon: FlaskConical, gradient: "from-green-600 to-emerald-500" },
        Design: { title: "NHÀ THIẾT KẾ HOLO", subtitle: "NGHỆ THUẬT SỐ & UI", desc: "Bạn định hình thực tế của người dùng. Thẩm mỹ và chức năng hòa quyện dưới sự chỉ huy của bạn.", color: "text-orange-400", bg: "bg-orange-600", border: "border-orange-400", icon: Palette, gradient: "from-orange-600 to-yellow-500" },
        Media: { title: "TIÊN PHONG MẠNG LƯỚI", subtitle: "TRUYỀN THÔNG & MEDIA", desc: "Tiếng nói của bạn thu hút sự chú ý. Bạn dệt nên những câu chuyện vang vọng khắp mạng lưới.", color: "text-pink-400", bg: "bg-pink-600", border: "border-pink-400", icon: Mic, gradient: "from-pink-600 to-rose-500" }
    };

    return (
        <section className="py-20 px-4 relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#020205]">
            {/* Complex Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-[10px] font-mono text-lime-400/20 whitespace-nowrap"
                        initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, ease: "linear" }}
                    >
                        {Math.random() > 0.5 ? "0101001" : "SYS_OP_"} {i}
                    </motion.div>
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-lime-400/5 rounded-full blur-[100px] animate-pulse-slow" />
            </div>

            <div className="max-w-6xl w-full z-10 relative">
                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {gameState === 'INTRO' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <div className="mb-12 relative inline-flex items-center justify-center">
                                <div className="absolute inset-0 border border-dashed border-lime-400/30 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="absolute inset-[-20px] border border-lime-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse] scale-110" />
                                <div className="w-56 h-56 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 relative overflow-hidden group cursor-pointer" onClick={() => setGameState('PLAYING')}>
                                    <div className="absolute inset-0 bg-lime-400/20 scale-0 group-hover:scale-100 transition-transform duration-700 ease-out rounded-full" />
                                    <Fingerprint size={80} strokeWidth={1} className="text-lime-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-[2px] bg-lime-400/50 blur-[2px] animate-[scan_2s_linear_infinite]" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-normal leading-tight mix-blend-screen">
                                NHẬN_DẠNG<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">ĐỒNG_BỘ_V2.0</span>
                            </h2>
                            <p className="text-white/50 font-mono text-lg max-w-xl mx-auto mb-12">
                                Khởi tạo bắt tay thần kinh nâng cao. <br />
                                Hệ thống sẽ phân tích các mô hình nhận thức của bạn để xác định phân loại hoạt động tối ưu.
                            </p>

                            <Magnetic strength={0.5}>
                                <button
                                    onClick={() => setGameState('PLAYING')}
                                    className="relative px-16 py-6 group overflow-hidden bg-white/5 border border-white/10 rounded-full hover:border-lime-400/50 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative font-bold font-mono text-xl text-white group-hover:text-lime-400 flex items-center gap-3">
                                        BẮT_ĐẦU_PHÂN_TÍCH <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </Magnetic>
                        </motion.div>
                    )}

                    {/* PLAYING */}
                    {gameState === 'PLAYING' && (
                        <motion.div
                            key="playing"
                            className="w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Improved HUD */}
                            <div className="flex justify-between items-center mb-16 pb-6 border-b border-white/10 relative">
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />

                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 relative overflow-hidden">
                                        <span className="font-mono font-bold text-2xl text-lime-400 relative z-10">0{currentScenario + 1}</span>
                                        <div className="absolute inset-0 bg-lime-400/10 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-[10px] text-lime-400 mb-1">TIẾN_ĐỘ</div>
                                        <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-lime-400 to-emerald-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
                                                layout
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right hidden md:block">
                                    <div className="font-mono text-xs text-white/30 mb-1">MÃ_PHIÊN</div>
                                    <div className="font-mono text-sm text-white">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                </div>
                            </div>



                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentScenario}
                                    initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                >
                                    <div className="mb-12">
                                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                                            {scenarios[currentScenario].title}
                                        </h3>
                                        <div className="h-1 w-20 bg-lime-400 mx-auto mb-8" />
                                        <p className="text-xl md:text-2xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed">
                                            {scenarios[currentScenario].desc}
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {scenarios[currentScenario].options.map((opt, i) => (
                                            <TiltCard key={i} className="h-full" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                                                <button
                                                    onClick={() => handleOptionClick(opt.type, i)}
                                                    disabled={isTransitioning}
                                                    className={`w-full h-full p-8 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${selectedOption === i
                                                        ? 'bg-lime-500/10 border-lime-500' // Selected state
                                                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10' // Normal state
                                                        } ${isTransitioning && selectedOption !== i ? 'opacity-50 blur-sm' : ''}`} // Dim others
                                                >
                                                    {/* Selected Ripple/Fill Effect */}
                                                    {selectedOption === i && (
                                                        <motion.div
                                                            layoutId="selection-ring"
                                                            className="absolute inset-0 border-2 border-lime-400 rounded-2xl pointer-events-none"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    )}
                                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                                    <div className="relative z-10 flex items-start gap-6">
                                                        <div className={`
                                                        p-5 rounded-xl border transition-all duration-500
                                                        ${selectedOption === i
                                                                ? 'bg-lime-400 text-black border-lime-400 rotate-12 scale-110'
                                                                : `bg-black/50 ${opt.color} border-white/10 group-hover:scale-110 group-hover:rotate-6`
                                                            }
                                                    `}>
                                                            <motion.div
                                                                animate={selectedOption === i ? { rotate: 360 } : {}}
                                                                whileHover={{ scale: 1.2, rotate: 10 }} // Added subtle hover animation
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <opt.icon size={32} strokeWidth={1.5} />
                                                            </motion.div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Giao_thức_0{i + 1}</span>
                                                                {selectedOption === i && <Check size={16} className="text-lime-400" />}
                                                            </div>
                                                            <div className={`text-xl font-bold transition-colors duration-300 ${selectedOption === i ? 'text-lime-400' : 'text-white group-hover:text-white/90'}`}>
                                                                {opt.label}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 group-hover:border-lime-400/50 transition-colors" />
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 group-hover:border-lime-400/50 transition-colors" />
                                                </button>
                                            </TiltCard>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ANALYZING */}
                    {/* ANALYZING */}
                    {gameState === 'ANALYZING' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] w-full relative max-w-4xl mx-auto"
                        >
                            {/* Terminal Window Frame */}
                            <div className="w-full bg-black/80 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md relative shadow-2xl">
                                {/* Window Header */}
                                <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="text-[10px] font-mono text-white/30 tracking-widest">SYSTEM_DIAGNOSTIC_TOOL_V9.0</div>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    {/* Left: Code Log Stream */}
                                    <div className="col-span-2 space-y-2 font-mono text-xs relative z-10 h-64 overflow-hidden mask-linear-fade">
                                        {[
                                            "KHỞI_TẠO_BOOT_SEQUENCE...",
                                            "ĐANG_TẢI_KERNEL_THẦN_KINH...",
                                            ">>> TRÍ TUỆ NHÂN TẠO: [SẴN SÀNG]",
                                            ">>> CẢM BIẾN SINH HỌC: [KẾT NỐI]",
                                            "ĐANG PHÂN TÍCH DỮ LIỆU ĐẦU VÀO...",
                                            "--- BẮT ĐẦU QUÉT MẪU ---",
                                            "PHÁT HIỆN TÍN HIỆU LOGIC... 98%",
                                            "KIỂM TRA CHỈ SỐ SÁNG TẠO... HOÀN TẤT",
                                            "TỐI ƯU HÓA VECTOR KHÔNG GIAN #A992",
                                            "ĐANG BIÊN DỊCH MÃ GEN KỸ THUẬT SỐ...",
                                            "CẢNH BÁO: PHÁT HIỆN TIỀM NĂNG CAO",
                                            "ĐANG TÁI CẤU TRÚC MÔ HÌNH DỰ ĐOÁN...",
                                            "KẾT XUẤT DỮ LIỆU CUỐI CÙNG...",
                                            "ĐỒNG BỘ HÓA VỚI MÁY CHỦ TRUNG TÂM...",
                                            "XÁC THỰC NGƯỜI DÙNG: HỢP LỆ"
                                        ].map((log, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: [0, 1, 0.5] }}
                                                transition={{ duration: 0.2, delay: i * 0.15 }}
                                                className="text-lime-400/80 flex gap-2"
                                            >
                                                <span className="text-white/30">[{new Date().toLocaleTimeString()}:{Math.floor(Math.random() * 99)}]</span>
                                                {log}
                                            </motion.div>
                                        ))}
                                        <motion.div
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="w-3 h-5 bg-lime-400 inline-block align-middle"
                                        />
                                    </div>

                                    {/* Right: Analysis Viz */}
                                    <div className="space-y-4 relative z-10 font-mono text-xs">
                                        <div className="flex justify-between items-center text-white/50 mb-2 border-b border-white/10 pb-1">
                                            <span>MỤC_TIÊU_XÁC_ĐỊNH</span>
                                            <span>TRẠNG_THÁI</span>
                                        </div>

                                        {Object.entries(tracks).map(([key, track], idx) => {
                                            const currentScore = scores[key];
                                            const maxScore = Math.max(...Object.values(scores));
                                            const isTie = Object.values(scores).filter(s => s === maxScore).length > 1;
                                            // Only highlight if it's the winner AND there is no tie
                                            const isWinner = !isTie && result === key;

                                            // Determine bar color and status text based on whether it's the winner
                                            const getStatusColor = () => {
                                                if (isWinner) return "text-lime-400";
                                                return "text-white/30";
                                            };

                                            const getStatusText = () => {
                                                if (isWinner) return "KẾT NỐI AN TOÀN";
                                                if (isTie && currentScore === maxScore) return "TÍN HIỆU CAO..."; // Special text for ties?
                                                return "TÍN HIỆU YẾU...";
                                            };

                                            return (
                                                <motion.div
                                                    key={key}
                                                    className={`relative p-3 rounded-lg transition-all duration-500 ${isWinner
                                                        ? 'bg-lime-400/10 border border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.2)] scale-105 z-10'
                                                        : 'border border-transparent opacity-60'
                                                        }`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: isWinner ? 1 : 0.6, x: 0 }}
                                                    transition={{ delay: 0.5 + idx * 0.2 }}
                                                >
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className={`font-bold tracking-widest ${isWinner ? 'text-lime-300' : 'text-white/40'}`}>
                                                            {track.subtitle}
                                                        </span>
                                                        <span className={`${getStatusColor()} text-[9px]`}>
                                                            {isWinner ? (
                                                                <span className="text-lime-400 font-bold animate-pulse">
                                                                    KẾT NỐI AN TOÀN [OK]
                                                                </span>
                                                            ) : (
                                                                <span className="animate-pulse">
                                                                    {isTie && currentScore === maxScore ? "TIỀM NĂNG [?]" : "ĐANG QUÉT..."}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                                                        {/* Animated Bar */}
                                                        {isWinner ? (
                                                            // Winner Animation: Fills to 100% and turns Green
                                                            <motion.div
                                                                className="h-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                                                                initial={{ width: "0%" }}
                                                                animate={{ width: "100%" }}
                                                                transition={{ duration: 2.5, ease: "circOut", delay: 0.5 }}
                                                            />
                                                        ) : (
                                                            // Others (or Ties): Fluctuate randomly
                                                            <motion.div
                                                                className={`h-full ${track.bg.replace('bg-', 'bg-')} opacity-40`}
                                                                initial={{ width: "0%" }}
                                                                animate={{
                                                                    width: currentScore === maxScore && isTie
                                                                        ? ["40%", "60%", "50%", "70%"] // Ties fluctuate higher
                                                                        : ["0%", "60%", "20%", "40%", "10%"], // Low scores fluctuate lower
                                                                    opacity: [0.4, 0.6, 0.2]
                                                                }}
                                                                transition={{ duration: 3, ease: "linear", repeat: 0 }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Selection Marker */}
                                                    {isWinner && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 3 }}
                                                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-lime-400 rounded-full shadow-[0_0_8px_#a3e635]"
                                                        />
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl text-white font-bold mt-8 glitch-text animate-pulse decoration-clone" data-text="PROCESSING_NEURAL_LINK...">
                                PROCESSING_NEURAL_LINK...
                            </h3>
                        </motion.div>
                    )}

                    {/* RESULT */}
                    {gameState === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="w-full max-w-5xl mx-auto"
                        >
                            <SpotlightItem className="relative bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group">
                                {/* Top Decoration */}
                                <div className={`h-2 w-full bg-gradient-to-r ${tracks[result] ? tracks[result].gradient : 'from-gray-500 to-white'} opacity-50`} />

                                <div className="p-8 md:p-16 relative z-10 grid md:grid-cols-12 gap-16">
                                    {/* Left: Identity Card */}
                                    <div className="md:col-span-5 relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl -m-4 transform -rotate-2" />
                                        <div className={`relative p-8 rounded-2xl bg-black border ${tracks[result].border} text-center overflow-hidden`}>
                                            {/* Holographic BG */}
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                            <div className={`absolute -top-20 -right-20 w-40 h-40 ${tracks[result].bg} blur-[60px] opacity-40`} />

                                            {/* Icon */}
                                            <div className={`w-32 h-32 mx-auto rounded-full ${tracks[result].bg} bg-opacity-20 flex items-center justify-center mb-8 border-2 ${tracks[result].border} shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                                                {(() => {
                                                    const Icon = tracks[result].icon;
                                                    return <Icon size={64} className={tracks[result].color} />;
                                                })()}
                                            </div>

                                            <div className="font-mono text-[10px] text-white/40 mb-3 tracking-[0.2em]">XÁC_NHẬN_DANH_TÍNH</div>
                                            <h2 className={`text-4xl md:text-5xl font-black uppercase leading-tight mb-4 ${tracks[result].color}`}>
                                                {tracks[result].title}
                                            </h2>
                                            <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase border border-white/5">
                                                {tracks[result].subtitle}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats & Action */}
                                    <div className="md:col-span-7 flex flex-col justify-center">
                                        <div className="mb-8">
                                            <h3 className="font-mono text-sm text-lime-400 mb-4 uppercase tracking-widest flex items-center gap-2"> {/* Increased margin-bottom */}
                                                <Activity size={14} /> Phân Tích Thần Kinh Hoàn Tất
                                            </h3>
                                            <p className="text-2xl text-white/80 font-light leading-loose"> {/* Changed relaxed to loose */}
                                                "{tracks[result].desc}"
                                            </p>
                                        </div>

                                        <div className="space-y-5 mb-12">
                                            {Object.entries(scores).map(([key, val], idx) => (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                                >
                                                    <div className="flex justify-between text-[10px] font-bold text-white mb-2 uppercase tracking-wider">
                                                        <span>{key}</span>
                                                        <span className="text-xs text-lime-400">SECURE CONNECTION ESTABLISHED</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (val / 5) * 100)}%` }}
                                                            transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                                                            className={`h-full ${tracks[key] ? tracks[key].bg : 'bg-white'} shadow-[0_0_10px_currentColor]`}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => document.getElementById('apply').scrollIntoView({ behavior: 'smooth' })}
                                                className="flex-1 py-5 bg-lime-400 hover:bg-lime-300 text-black font-black font-mono text-sm uppercase transition-all hover:scale-105 shadow-[0_0_30px_rgba(163,230,53,0.3)] flex items-center justify-center gap-3 rounded-lg"
                                            >
                                                Khởi Chạy Chuỗi <ArrowRight size={18} />
                                            </button>
                                            <button
                                                onClick={handleRecalibrate}
                                                className="px-8 py-5 border border-white/20 hover:bg-white/5 text-white font-mono text-xs uppercase transition-all hover:scale-105 hover:border-lime-400/50 rounded-lg group"
                                            >
                                                <span className="flex items-center gap-2 align-middle">
                                                    <RotateCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                                                    Tái Hiệu Chỉnh
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightItem>
                        </motion.div>
                    )}

                    {/* NEW RESETTING STATE */}
                    {gameState === 'RESETTING' && (
                        <motion.div
                            key="resetting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-[60vh] relative z-50"
                        >
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                            <div className="relative z-10 flex flex-col items-center">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 0] }}
                                    transition={{ duration: 2, ease: "anticipate" }}
                                    className="mb-8"
                                >
                                    <RotateCw size={64} className="text-red-500" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-white mb-2 glitch-text" data-text="THANH_LỌC_HỆ_THỐNG">THANH_LỌC_HỆ_THỐNG</h2>
                                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, ease: "linear" }}
                                        className="h-full bg-red-500"
                                    />
                                </div>
                                <div className="mt-4 font-mono text-xs text-red-400">
                                    <ScrambleText text=">> ĐANG XÓA BỘ NHỚ ĐỆM... ĐANG ĐẶT LẠI MẠNG THẦN KINH..." />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};


// "THE ALGORITHM" (Methodology) - HYPER DETAILED
const AlgorithmSection = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yColumn = useTransform(scrollYProgress, [0, 1], [100, -100]); // Moves opposite to scroll for parallax

    return (
        <section ref={sectionRef} id="algorithm" className="py-32 px-6 relative border-t border-white/5 bg-[#030305]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Left Column: Header & Description */}
                    <div className="md:col-span-4 space-y-8 sticky top-32 h-fit">
                        <div className="overflow-hidden">
                            <ScrollReveal>
                                <SkewScroll>
                                    <h2 className="text-6xl md:text-7xl font-serif text-white mb-4 leading-[0.9]">
                                        Phương <br /> <span className="text-lime-400">Pháp</span>
                                    </h2>
                                </SkewScroll>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal delay={0.2}>
                            <div className="font-mono text-xs text-white/40 space-y-4 border-l border-white/10 pl-4">
                                <p className="text-lime-400">/// KERNEL_PANIC.INIT</p>
                                <p className="leading-relaxed">
                                    Hỗn loạn là nhiên liệu. Cấu trúc là khuôn mẫu. Chúng ta không viết mã đơn thuần; ta kiến tạo sự sống trong không gian số.
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <div className="text-white">LỖI_001</div>
                                        <div>Thử Nghiệm</div>
                                    </div>
                                    <div>
                                        <div className="text-white">LỖI_002</div>
                                        <div>Sai Sót</div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right Column: Broken Grid Content */}
                    <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Item 1 - Wide */}
                        <div className="md:col-span-2 relative group">
                            {/* Adjusted positioning to prevent overlap */}
                            <div className="absolute -left-6 top-0 font-mono text-xs text-lime-400 -rotate-90 origin-bottom-right z-10 tracking-widest hidden md:block">INPUT_STREAM</div>
                            <div className="border border-white/10 p-6 bg-white/[0.02] hover:bg-white/5 transition-colors duration-500 relative ml-0 md:ml-4">
                                <h3 className="text-2xl font-bold mb-4 flex justify-between items-center relative z-10">
                                    <ScrambleText text="01 // QUAN SÁT" />
                                    <ArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform text-lime-400" />
                                </h3>
                                <p className="text-white/50 mb-6 max-w-lg relative z-10">Quét đường chân trời tìm tín hiệu. Chúng tôi tiếp nhận dữ liệu từ dòng chảy công nghệ toàn cầu, lọc nhiễu để tìm tín hiệu.</p>
                                <GlitchImage src={IMAGES.robotics} alt="Observation" className="h-64 w-full" />
                            </div>
                        </div>

                        {/* Item 2 - Tall */}
                        <motion.div style={{ y: yColumn }} className="md:row-span-2 relative group mt-12 md:mt-0">
                            <div className="border border-white/10 p-6 bg-white/[0.02] h-full hover:bg-white/5 transition-colors duration-500 flex flex-col">
                                <GlitchImage src={IMAGES.coding} alt="Processing" className="h-64 w-full mb-6 order-last md:order-first md:h-full md:max-h-[300px]" />
                                <h3 className="text-2xl font-bold mb-2 mt-auto"><ScrambleText text="02 // TỔNG HỢP" /></h3>
                                <p className="text-white/50 text-sm">Hợp nhất các yếu tố rời rạc. Mã gặp Phần cứng. Nghệ thuật gặp Logic.</p>
                            </div>
                        </motion.div>

                        {/* Item 3 - Standard */}
                        <div className="relative group">
                            <Magnetic>
                                <div className="border border-white/10 p-6 bg-white/[0.02] hover:bg-white/5 transition-colors duration-500 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <h3 className="text-2xl font-bold mb-4 text-right"><ScrambleText text="03 // TRIỂN KHAI" /></h3>
                                    <div className="h-[1px] w-full bg-white/10 mb-4 group-hover:bg-lime-400 transition-colors" />
                                    <p className="text-white/50 text-sm mb-4">Phát hành tải trọng. Giải pháp mở rộng, mạnh mẽ và có tác động.</p>
                                    <div className="font-mono text-xs text-lime-400 text-right group-hover:animate-pulse">STATUS: READY</div>
                                </div>
                            </Magnetic>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// HORIZONTAL TRACKS SECTION - ENHANCED
const TracksSection = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);
    const bgPos = useTransform(scrollYProgress, [0, 1], ["0% 0%", "100% 0%"]);

    const [selectedTrack, setSelectedTrack] = useState(null);

    const tracks = [
        {
            id: "prog",
            icon: Code,
            title: "Lập Trình",
            desc: "Thuật Toán, Web Dev, AI/ML",
            color: "#3b82f6",
            img: IMAGES.coding,
            specs: ["NextJS", "Python", "TensorFlow"],
            curriculum: ["Sáng tạo Web", "Cấu trúc dữ liệu", "Học máy cơ bản", "Dự án Capstone"]
        },
        {
            id: "robo",
            icon: Cpu,
            title: "Robotics",
            desc: "Arduino, IoT, Mạch Điện",
            color: "#a855f7",
            img: IMAGES.robotics,
            specs: ["C++", "Điện Tử", "CAD"],
            curriculum: ["Nguyên lý mạch", "Lập trình nhúng", "Thiết kế 3D", "Robot tự hành"]
        },
        {
            id: "sci",
            icon: FlaskConical,
            title: "Khoa Học",
            desc: "Vật Lý, Hóa Học, Sinh Học",
            color: "#22c55e",
            img: null,
            specs: ["Thí Nghiệm", "Nghiên Cứu", "Phân Tích"],
            curriculum: ["Phương pháp NCKH", "Thí nghiệm thực hành", "Viết báo cáo", "Sáng tạo xanh"]
        },
        {
            id: "des",
            icon: Palette,
            title: "Thiết Kế",
            desc: "Đồ Họa, Video, Nhận Diện",
            color: "#f97316",
            img: null,
            specs: ["Figma", "Blender", "Adobe"],
            curriculum: ["Tư duy thiết kế", "UI/UX App", "Dựng phim", "Đồ họa 3D"]
        },
        {
            id: "com",
            icon: Mic,
            title: "Truyền Thông",
            desc: "PR, Sự Kiện, Đối Ngoại",
            color: "#ec4899",
            img: null,
            specs: ["Thuyết Trình", "Viết Lách", "Media"],
            curriculum: ["Phát triển nội dung", "Quản lý sự kiện", "Nhiếp ảnh & Quay phim", "Public Speaking"]
        },
    ];

    return (
        <section ref={targetRef} id="tracks" className="relative h-[300vh] bg-[#050505]">
            {/* Parallax Background Grid */}
            <motion.div
                style={{ backgroundPosition: bgPos }}
                className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed"
            />
            <div className="absolute inset-0 bg-grid-white opacity-[0.05] z-0 pointer-events-none" />

            <div className="sticky top-0 flex h-screen items-center overflow-hidden z-10">
                <motion.div style={{ x }} className="flex gap-4 md:gap-12 px-4 md:px-24">
                    {/* Intro Card */}
                    <div className="min-w-[85vw] md:min-w-[400px] flex flex-col justify-center border-l border-white/10 pl-4 md:pl-12 backdrop-blur-sm">
                        <span className="font-mono text-xs text-lime-400 mb-4 typing-effect">SELECT_MODULE</span>
                        <SkewScroll>
                            <h2 className="text-6xl md:text-8xl font-serif leading-none mb-8 text-white mix-blend-difference">
                                Chọn<br />Lối Đi<br /><span className="text-stroke text-transparent">Của Bạn</span>
                            </h2>
                        </SkewScroll>
                        <div className="mt-8 flex gap-4">
                            <ArrowRight className="animate-pulse text-lime-400" />
                            <span className="font-mono text-xs text-white/50">CUỘN ĐỂ ĐIỀU HƯỚNG</span>
                        </div>
                    </div>

                    {/* Track Cards */}
                    {tracks.map((track, i) => (
                        <motion.div
                            key={track.id}
                            layoutId={`card-${track.id}`}
                            className="group relative h-[60vh] w-[85vw] md:w-[400px] bg-neutral-900 border border-white/10 flex flex-col cursor-pointer overflow-hidden"
                        >
                            {track.img ? (
                                <motion.div layoutId={`img-${track.id}`} className="absolute inset-0">
                                    <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-colors" />
                                    <img src={track.img} alt={track.title} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0" />
                                </motion.div>
                            ) : (
                                <motion.div layoutId={`img-${track.id}`} className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            )}

                            {/* Scanning Line Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-400/20 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 z-10 pointer-events-none" />

                            <div className="absolute top-4 right-4 z-20 font-mono text-xs text-white/50 border border-white/10 px-2 py-1 rounded-sm backdrop-blur-md">
                                MOD.0{i + 1}
                            </div>

                            <TiltCard className="h-full relative z-20">
                                <div className="h-full p-8 flex flex-col justify-end">
                                    <div className="mb-auto">
                                        <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-lime-400/50 transition-colors">
                                            <track.icon size={32} style={{ color: track.color }} strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <motion.h3 layoutId={`title-${track.id}`} className="text-4xl font-bold text-white mb-2 decoration-clone">
                                        <ScrambleText text={track.title} hover={true} />
                                    </motion.h3>
                                    <motion.p layoutId={`desc-${track.id}`} className="text-white/60 font-mono text-xs mb-6 border-l-2 pl-4 transition-colors group-hover:text-white" style={{ borderColor: track.color }}>
                                        {track.desc}
                                    </motion.p>

                                    {/* Tech Specs */}
                                    <div className="flex gap-2 flex-wrap mb-8 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                        {track.specs.map(spec => (
                                            <span key={spec} className="text-[10px] font-mono border border-white/20 px-2 py-1 text-white/70 bg-black/50 backdrop-blur-sm">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Initialize Button */}
                                    <motion.button
                                        layoutId={`btn-${track.id}`}
                                        onClick={() => setSelectedTrack(track)}
                                        className="w-full py-4 bg-white text-black font-mono font-bold text-sm uppercase flex items-center justify-between px-6 hover:bg-lime-400 transition-colors"
                                    >
                                        <span>Khởi Chạy</span>
                                        <ArrowRight size={16} />
                                    </motion.button>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* EXPANDED MODAL */}
            <AnimatePresence>
                {selectedTrack && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTrack(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-lg cursor-pointer"
                        />

                        <motion.div
                            layoutId={`card-${selectedTrack.id}`}
                            className="relative w-full max-w-5xl h-[80vh] bg-[#0a0a0a] border border-white/20 overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <button
                                onClick={() => setSelectedTrack(null)}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-500/20 text-white border border-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Left: Visuals */}
                            <div className="w-full md:w-1/3 relative h-64 md:h-full bg-neutral-900 border-b md:border-b-0 md:border-r border-white/10">
                                {selectedTrack.img ? (
                                    <motion.div layoutId={`img-${selectedTrack.id}`} className="absolute inset-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                                        <img src={selectedTrack.img} alt={selectedTrack.title} className="h-full w-full object-cover opacity-80" />
                                    </motion.div>
                                ) : (
                                    <motion.div layoutId={`img-${selectedTrack.id}`} className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black" />
                                )}

                                <div className="absolute bottom-8 left-8 z-20">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6"
                                    >
                                        <selectedTrack.icon size={40} style={{ color: selectedTrack.color }} />
                                    </motion.div>
                                    <motion.h3 layoutId={`title-${selectedTrack.id}`} className="text-5xl font-black text-white mb-2 uppercase leading-[0.9]">
                                        {selectedTrack.title}
                                    </motion.h3>
                                    <motion.p layoutId={`desc-${selectedTrack.id}`} className="text-lime-400 font-mono text-sm max-w-[200px]">
                                        {selectedTrack.desc}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
                                        <span className="font-mono text-xs text-white/30 uppercase tracking-widest">SYSTEM_ACCESS: GRANTED</span>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-lime-400/50 to-transparent" />
                                        <span className="font-mono text-xs text-lime-400 animate-pulse">LIVE_FEED</span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                                        <div>
                                            <h4 className="font-mono text-sm text-lime-400 mb-6 flex items-center gap-2">
                                                <Layers size={14} /> MODULES_CORE
                                            </h4>
                                            <ul className="space-y-4">
                                                {selectedTrack.curriculum?.map((item, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                                        className="flex items-center gap-4 p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                                                    >
                                                        <span className="font-mono text-xs text-white/30">0{idx + 1}</span>
                                                        <span className="font-bold text-white/90">{item}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-mono text-sm text-lime-400 mb-6 flex items-center gap-2">
                                                <Activity size={14} /> STAT_ANALYSIS
                                            </h4>
                                            <div className="aspect-video bg-white/[0.02] border border-white/5 p-4 relative flex items-end gap-2">
                                                {[40, 65, 30, 85, 50, 75, 60].map((h, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ delay: 0.5 + idx * 0.05, duration: 1, ease: "circOut" }}
                                                        className="flex-1 bg-white/10 hover:bg-lime-400 transition-colors relative group"
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            DAT_{idx}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
                                            </div>
                                            <div className="mt-4 flex justify-between font-mono text-[10px] text-white/30">
                                                <span>INTENSITY</span>
                                                <span>CREATIVITY</span>
                                                <span>LOGIC</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <motion.button
                                            layoutId={`btn-${selectedTrack.id}`}
                                            onClick={() => {
                                                setSelectedTrack(null);
                                                document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="flex-1 py-5 bg-lime-400 hover:bg-lime-300 text-black font-black font-mono text-sm uppercase transition-all shadow-[0_0_30px_rgba(163,230,53,0.3)] flex items-center justify-center gap-3"
                                        >
                                            <span className="tracking-widest">INITIALIZE_JOIN_PROTOCOL</span>
                                            <ArrowRight size={18} />
                                        </motion.button>

                                        <button className="px-8 py-5 border border-white/10 hover:bg-white/5 text-white font-mono text-sm uppercase transition-colors">
                                            DOCS
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

// PROJECT ARCHIVES SECTION (CONNECTED NODE SYSTEM)
const ProjectArchives = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const projects = [
        {
            id: "ARCH_01",
            name: "ALPHA DRONE",
            category: "Robotics",
            desc: "Drone xử lí cỏ dại tích hợp điều hòa không khí và độ ẩm.",
            stats: { power: 85, ai: 40, mech: 95 },
            status: "DEPLOYED",
            icon: Wrench,
            color: "text-purple-400",
            img: IMAGES.robotics
        },
        {
            id: "ARCH_02",
            name: "NEURAL NET",
            category: "AI / Vision",
            desc: "Ứng dụng học sâu trong dự đoán trạng thái trẻ sơ sinh",
            stats: { power: 90, ai: 98, mech: 20 },
            status: "LEARNING",
            icon: Cpu,
            color: "text-cyan-400",
            img: IMAGES.coding
        },
        {
            id: "ARCH_03",
            name: "BIO SYNTH",
            category: "Biotech",
            desc: "Hệ thống nhà kính thông minh tự cân bằng độ ẩm và điều hòa không khí.",
            stats: { power: 60, ai: 75, mech: 50 },
            status: "PROTOTYPE",
            icon: FlaskConical,
            color: "text-lime-400",
            img: IMAGES.robotics
        },
        {
            id: "ARCH_04",
            name: "CYBER DECK",
            category: "Hardware",
            desc: "Máy tính cầm tay thiết kế module hóa, vỏ in 3D chịu va đập.",
            stats: { power: 70, ai: 30, mech: 85 },
            status: "ONLINE",
            icon: Terminal,
            color: "text-orange-400",
            img: IMAGES.coding
        }
    ];

    return (
        <section ref={sectionRef} id="archives" className="py-40 relative bg-[#020205] overflow-hidden">
            {/* Complex Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-400/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="w-3 h-3 bg-lime-400 animate-pulse box-shadow-neon" />
                            <div className="h-[1px] w-24 bg-gradient-to-r from-lime-400 to-transparent" />
                            <span className="text-lime-400 font-mono text-xs tracking-[0.3em] uppercase">/// SYSTEM_NODES_V.2.4</span>
                        </motion.div>
                        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-normal leading-tight">
                            Dự Án <br />
                            <span className="relative inline-block">
                                <span className="absolute -inset-1 bg-lime-400/20 blur-xl"></span>
                                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400">Tiêu Biểu</span>
                            </span>
                        </h2>
                    </div>

                    <div className="hidden md:block text-right font-mono text-xs text-white/40 space-y-2">
                        <div className="flex items-center gap-4 justify-end">
                            <span>SYNC_RATE: 99.9%</span>
                            <div className="w-12 h-1 bg-white/10 overflow-hidden"><div className="h-full w-full bg-lime-400 animate-progress-indeterminate" /></div>
                        </div>
                        <div>CLUSTER_STATUS: <span className="text-lime-400">OPTIMAL</span></div>
                        <div className="text-[10px] opacity-50">ENCRYPTED_CONNECTION_SECURE</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    {projects.map((project, i) => (
                        <TiltCard
                            key={i}
                            className="h-[600px] relative group pointer-events-auto"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {/* Enhanced Card Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.8, type: "spring", stiffness: 50 }}
                                className="h-full bg-[#0a0a0a] border border-white/10 rounded-xl relative overflow-hidden flex flex-col transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_50px_rgba(132,204,22,0.15)] group-hover:border-lime-400/30"
                            >
                                {/* Active Spotlight Border */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                                    <div className="absolute inset-[-1px] bg-gradient-to-b from-lime-400/50 via-transparent to-cyan-400/50 rounded-xl blur-sm" />
                                </div>

                                {/* Tech Header */}
                                <div className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 relative z-20">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 180, scale: 1.2 }}
                                            transition={{ duration: 0.5 }}
                                            className="p-1 rounded bg-white/5"
                                        >
                                            <project.icon size={18} className={`${project.color}`} />
                                        </motion.div>
                                        <div className="font-mono text-[10px] text-white/50 tracking-wider font-bold">NODE_{i + 1} :: <span className={project.color}>{project.id}</span></div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                </div>

                                {/* Main Image with Holographic Effects */}
                                <div className="relative flex-1 overflow-hidden group-hover:flex-[1.5] transition-all duration-700 ease-out">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />

                                    {/* Tech Overlay Lines */}
                                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/50" />
                                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/50" />
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-lime-400/20" />
                                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-lime-400/20" />
                                    </div>

                                    <img
                                        src={project.img}
                                        alt={project.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1 opacity-60 group-hover:opacity-100 grayscale hover:grayscale-0"
                                    />

                                    {/* Scanline */}
                                    <div className="absolute inset-0 bg-lime-400/10 h-[2px] w-full translate-y-[-100%] group-hover:animate-scan z-20" />
                                </div>

                                {/* Content Body */}
                                <div className="p-8 relative z-20 bg-[#0a0a0a] border-t border-white/10 flex flex-col justify-between h-[280px]">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-black text-white uppercase group-hover:text-lime-400 transition-colors">
                                                {project.name}
                                            </h3>
                                            <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-white/50 border border-white/10">
                                                V.2.{i}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-white/40 mb-4 tracking-widest uppercase">{project.category}</div>
                                        <p className="text-white/60 text-sm font-light leading-loose mb-6 line-clamp-3 group-hover:text-white/80 transition-colors">
                                            {project.desc}
                                        </p>
                                    </div>

                                    {/* Advanced Stats Viz - Compact & Annotated */}
                                    <div className="space-y-3 mt-auto">
                                        <div className="grid grid-cols-3 gap-2 h-24 items-end p-3 bg-white/[0.03] rounded-xl border border-white/10 relative overflow-hidden group/stats">
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity" />
                                            {['PWR', 'AI', 'MECH'].map((stat, idx) => {
                                                const val = stat === 'PWR' ? project.stats.power : stat === 'AI' ? project.stats.ai : project.stats.mech;
                                                const Icon = stat === 'PWR' ? Zap : stat === 'AI' ? Cpu : Wrench;
                                                const label = stat === 'PWR' ? "HIỆU SUẤT" : stat === 'AI' ? "TRÍ TUỆ" : "CƠ KHÍ"; // Vietnamese Tooltip

                                                return (
                                                    <div key={stat} className="flex flex-col h-full justify-end gap-1 relative group/bar">
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 px-2 py-1 rounded text-[8px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                                                            {label}
                                                        </div>

                                                        <div className="text-[10px] font-bold font-mono text-center text-white mb-0.5">{val}%</div>
                                                        <div className="w-full bg-white/5 rounded-md relative overflow-hidden flex-1 shadow-inner">
                                                            <motion.div
                                                                className={`absolute bottom-0 w-full rounded-md transition-all duration-1000 ${stat === 'PWR' ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : stat === 'AI' ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 'bg-gradient-to-t from-lime-600 to-lime-400'}`}
                                                                initial={{ height: 0 }}
                                                                whileInView={{ height: `${val}%` }}
                                                                viewport={{ once: false }}
                                                                transition={{ delay: 0.1 + idx * 0.1, type: "spring", stiffness: 50 }}
                                                            >
                                                                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 shadow-[0_0_8px_white]" />
                                                            </motion.div>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <Icon size={8} className={`opacity-60 ${stat === 'PWR' ? 'text-cyan-400' : stat === 'AI' ? 'text-purple-400' : 'text-lime-400'}`} />
                                                            <div className="text-[8px] font-bold text-white/40 tracking-wider">{stat}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-white/30">STATUS</span>
                                            <span className={`font-bold ${project.status === 'DEPLOYED' || project.status === 'ONLINE' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                [{project.status}]
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

// TRANSMISSION LOG (Testimonials)
const TransmissionLog = () => {
    const logs = [
        { id: "LOG_882", user: "N. Anh", role: "Tác giả 'Máy phát điện vỉnh cữu hao phí xấp xỉ 0%'", msg: "CLB là chất xúc tác cho sự nghiệp nghiên cứu của tôi. Họ đã giúp tôi hoàn thành dự án vươn tầm thế giới." },
        { id: "LOG_991", user: "Stephen Hawking", role: "Nhà khoa học", msg: "Nếu không có CLB STEM này, tôi đã không thể giải mã được bí ẩn đằng sau Lỗ Đen Vũ trụ" },
        { id: "LOG_102", user: "rip_indra", role: "Nhà phát triển Blox Fruit", msg: "CLB này là nơi đã giúp tôi có được những kiến thức kinh nghiệm mà không nơi nào có và đã góp phần hiện thực hóa Blox Fruit" }
    ];

    return (
        <section className="py-32 border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-lime-400/5 -skew-y-3 transform origin-top-left scale-110" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex items-end justify-between mb-16">
                    <h2 className="text-4xl font-serif">Nhật Ký <br /> <span className="text-stroke">Truyền Tin</span></h2>
                    <div className="font-mono text-xs text-right hidden md:block">
                        <div>DỮ_LIỆU_MÃ_HÓA</div>
                        <div className="text-lime-400">ĐANG GIẢI MÃ...</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {logs.map((log, i) => (
                        <SpotlightItem key={i} className="glass-panel p-8 group hover:bg-white/5 transition-colors duration-500">
                            <div className="flex justify-between items-start mb-6 text-xs font-mono text-white/30">
                                <span>{log.id}</span>
                                <Activity size={12} className="text-lime-400 opacity-50" />
                            </div>
                            <p className="text-lg font-light mb-8 leading-loose max-w-sm">"{log.msg}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600" />
                                <div>
                                    <div className="font-bold text-sm">{log.user}</div>
                                    <div className="text-[10px] font-mono text-lime-400">{log.role}</div>
                                </div>
                            </div>
                        </SpotlightItem>
                    ))}
                </div>
            </div>
        </section>
    );
};

// "SYSTEM STATS" SECTION
const StatsSection = () => {
    const stats = [
        { label: "THÀNH VIÊN", val: 120, suff: "+" },
        { label: "HỌC PHẦN", val: 45, suff: "" },
        { label: "GIẢI THƯỞNG", val: 12, suff: "" },
        { label: "CHU KỲ", val: 2026, suff: "" }
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center group relative p-4">
                        <div className="absolute inset-0 border border-white/5 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                        <div className="font-mono text-xs text-white/30 mb-2">DỮ_LIỆU_0{i + 1}</div>
                        <div className="text-5xl md:text-7xl font-black text-white group-hover:text-lime-400 transition-colors flex justify-center items-center">
                            <ScrambleCounter value={stat.val} />{stat.suff}
                        </div>
                        <div className="text-sm font-bold tracking-widest mt-2">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};



// TERMINAL FOOTER
const Footer = () => {
    return (
        <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-8 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-12 gap-12 mb-20">
                    {/* Brand / Terminal */}
                    <div className="md:col-span-5 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                        </div>
                        <p className="text-white/50 font-light max-w-sm leading-loose">
                            Trao quyền cho thế hệ nhà đổi mới tiếp theo thông qua Khoa học, Công nghệ, Kỹ thuật và Toán học.
                        </p>
                    </div>

                    {/* Sitemap */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="font-mono text-xs text-lime-400 uppercase tracking-widest">/// THƯ MỤC</h4>
                        <ul className="space-y-4 font-mono text-sm text-white/60">
                            {[
                                { label: 'Thuật Toán', href: '#algorithm' },
                                { label: 'Phân Ban', href: '#tracks' },
                                { label: 'Lưu Trữ', href: '#archives' },
                                { label: 'Đăng Ký', href: '#apply' }
                            ].map(item => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-white hover:pl-2 transition-all flex items-center gap-2 group">
                                        <span className="opacity-0 group-hover:opacity-100 text-lime-400">&gt;</span>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter CLI */}
                    <div className="md:col-span-4 space-y-6">
                        <h4 className="font-mono text-xs text-lime-400 uppercase tracking-widest">/// CẬP NHẬT</h4>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-lime-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-black border border-white/20 p-1">
                                <span className="pl-3 pr-2 font-mono text-sm text-lime-400">$</span>
                                <input
                                    type="email"
                                    placeholder="dang_ky --email user@loc.al"
                                    className="bg-transparent w-full p-2 outline-none font-mono text-sm text-white placeholder-white/20"
                                />
                                <Magnetic>
                                    <button className="p-2 hover:bg-lime-400 hover:text-black transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                </Magnetic>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Social - Better Spacing */}
                    <div className="md:col-span-12 flex gap-6 items-center mt-8"> {/* Adjusted to span full width and added margin-top */}
                        {['Facebook', 'Discord', 'Github'].map((social) => (
                            <Magnetic key={social} strength={0.3}>
                                <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-lime-400 hover:border-lime-400 hover:text-black transition-all duration-300">
                                    {/* Icons based on social name, reusing existing imports if needed, or generic */}
                                    <div className="scale-75">
                                        {social === 'Facebook' && <Globe size={24} />}
                                        {social === 'Discord' && <MessageSquare size={24} />}
                                        {social === 'Github' && <Code size={24} />}
                                    </div>
                                </a>
                            </Magnetic>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    <div className="mb-4 md:mb-0 max-w-sm leading-relaxed">
                        &copy; 2026 STEM CLUB.<br />
                        TẤT CẢ HỆ THỐNG HOẠT ĐỘNG.
                    </div>
                    <div className="flex items-center gap-12">
                        <span className="hover:text-white cursor-pointer transition-colors block py-2">BẢO_MẬT</span>
                        <span className="hover:text-white cursor-pointer transition-colors block py-2">ĐIỀU_KHOẢN</span>
                        <span className="block py-2">
                            THIẾT_KẾ_BỞI // <span className="text-lime-400">ANTIGRAVITY</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* ============================================================================ */
/*                          MAIN COMPONENT                                      */
/* ============================================================================ */

export default function App() {
    const [loading, setLoading] = useState(true);

    // LENIS SMOOTH SCROLL INITIALIZATION
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        window.lenis = lenis;
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            window.lenis = null;
        };
    }, []);

    // Smooth scroll helper
    const handleSmoothScroll = (e, href) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const elem = document.getElementById(targetId);
        if (elem) {
            // Use Lenis scroll if available, otherwise fallback
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#020205] text-slate-200 selection:bg-lime-400 selection:text-black min-h-screen leading-relaxed">
            <AnimatePresence>
                {loading && <IntroSequence onComplete={() => setLoading(false)} />}
            </AnimatePresence>

            <TechOverlay />
            <div className="noise-overlay" />
            <CustomCursor />
            {!loading && <Navigation />}

            <main className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
                <CinematicHero />
                <SectionDivider />
                <IntroSection />
                <CyberGameSection />
                <SectionDivider inverted />
                <AlgorithmSection />
                <div className="py-12" />

                <TracksSection />
                <SectionDivider />

                <ProjectArchives />
                <div className="h-32" />

                <TransmissionLog />
                <SectionDivider inverted />

                <StatsSection />

                <RegistrationForm />
            </main>

            {!loading && <Footer />}
        </div>
    );
}

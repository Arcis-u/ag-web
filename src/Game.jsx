import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion'
import '../index.css'
import { Gamepad2, ArrowLeft, ArrowRight, Terminal, Cpu, Zap, Activity, Power, LogOut, CornerDownLeft, Box, Hexagon } from 'lucide-react'

// COMPONENTS
import GameBackground from './components/game/GameBackground'
import HUD from './components/game/HUD'
import LogicBreaker from './components/game/LogicBreaker'
import NeonRunner from './components/game/NeonRunner'

// GAME REGISTRY
const GAMES = [
    {
        id: 'LOGIC_BREAKER',
        title: 'LOGIC BREAKER',
        subtitle: 'SECURITY PUZZLE',
        icon: Hexagon,
        color: 'text-cyan-400',
        borderColor: 'group-hover:border-cyan-500/50',
        shadowColor: 'hover:shadow-[0_0_100px_-10px_rgba(6,182,212,0.3)]',
        accent: 'cyan'
    },
    {
        id: 'NEON_RUNNER',
        title: 'NEON DRIFT',
        subtitle: 'REFLEX TEST',
        icon: Zap,
        color: 'text-purple-400',
        borderColor: 'group-hover:border-purple-500/50',
        shadowColor: 'hover:shadow-[0_0_100px_-10px_rgba(168,85,247,0.3)]',
        accent: 'purple'
    }
];

// UTILS
const CircularText = ({ text, radius, className }) => {
    const letters = text.split("");
    return (
        <div className={`absolute inset-0 flex items-center justify-center animate-spin-slow ${className}`}>
            {letters.map((letter, i) => (
                <span
                    key={i}
                    className="absolute font-mono font-bold text-[10px] uppercase tracking-widest text-cyan-500/30"
                    style={{
                        transform: `rotate(${i * (360 / letters.length)}deg) translateY(-${radius}px)`,
                    }}
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

const GameZone = () => {
    const [booted, setBooted] = useState(false);
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);
    const [activeGame, setActiveGame] = useState(null);
    const [exiting, setExiting] = useState(false);

    const selectedGame = GAMES[selectedGameIndex];

    // Boot Sequence Effect
    useEffect(() => {
        const timer = setTimeout(() => setBooted(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Handle Exit Transition
    const handleExitSystem = () => {
        setExiting(true);
        setTimeout(() => {
            window.location.href = '/';
        }, 800);
    };

    const nextGame = (e) => {
        e.stopPropagation();
        setSelectedGameIndex((prev) => (prev + 1) % GAMES.length);
    };

    const prevGame = (e) => {
        e.stopPropagation();
        setSelectedGameIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length);
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-purple-500/30 cursor-crosshair">

            {/* L1: BACKGROUND SIMULATION */}
            <GameBackground />

            {/* EDGE DECORATION FRAME */}
            <div className="fixed inset-0 pointer-events-none z-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

                <div className="absolute top-0 left-0 w-32 h-32 border-l-[4px] border-t-[4px] border-cyan-500/20 rounded-tl-3xl opacity-50" />
                <div className="absolute top-0 right-0 w-32 h-32 border-r-[4px] border-t-[4px] border-cyan-500/20 rounded-tr-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-l-[4px] border-b-[4px] border-cyan-500/20 rounded-bl-3xl opacity-50" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-[4px] border-b-[4px] border-cyan-500/20 rounded-br-3xl opacity-50" />

                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-0" />
            </div>

            {/* L2: HEADS UP DISPLAY (Overlay) */}
            <motion.div animate={{ opacity: exiting || activeGame ? 0 : 1 }} transition={{ duration: 0.3 }}>
                <HUD />
            </motion.div>

            {/* L3: CONTENT LAYER */}
            <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-4 ${exiting ? 'pointer-events-none' : ''}`}>

                {/* GAME CONTAINER */}
                <div className="pointer-events-auto w-full flex items-center justify-center">
                    <AnimatePresence mode="wait">

                        {/* 1. LOGIC BREAKER */}
                        {!exiting && activeGame === 'LOGIC_BREAKER' && (
                            <motion.div
                                key="game-logic-breaker"
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 z-50 flex items-center justify-center"
                            >
                                <LogicBreaker onExit={() => setActiveGame(null)} />
                            </motion.div>
                        )}

                        {/* 2. NEON RUNNER */}
                        {!exiting && activeGame === 'NEON_RUNNER' && (
                            <motion.div
                                key="game-neon-runner"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0 z-50 flex items-center justify-center"
                            >
                                <NeonRunner onExit={() => setActiveGame(null)} />
                            </motion.div>
                        )}

                        {/* 3. MAIN HUB (SELECTOR) */}
                        {!exiting && activeGame === null && (
                            <motion.div
                                key="hub-main"
                                initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                exit={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                                className="relative group perspective-1000"
                            >
                                {/* MAIN CARD */}
                                <div
                                    onClick={() => setActiveGame(selectedGame.id)}
                                    className={`relative w-[500px] h-[600px] border border-white/10 bg-black/40 backdrop-blur-2xl p-16 rounded-3xl flex flex-col items-center justify-center gap-8 shadow-[0_0_80px_-20px_rgba(88,28,135,0.4)] hover:border-white/30 ${selectedGame.shadowColor} transition-all duration-500 transform-gpu preserve-3d group-hover:scale-[1.02] cursor-pointer`}
                                >

                                    {/* Corners */}
                                    <div className="absolute top-4 left-4 w-2 h-2 border border-white/30" />
                                    <div className="absolute top-4 right-4 w-2 h-2 border border-white/30" />
                                    <div className="absolute bottom-4 left-4 w-2 h-2 border border-white/30" />
                                    <div className="absolute bottom-4 right-4 w-2 h-2 border border-white/30" />

                                    {/* NAV ARROWS */}
                                    <button onClick={prevGame} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white transition-colors z-50">
                                        <ArrowLeft size={32} />
                                    </button>
                                    <button onClick={nextGame} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white transition-colors z-50">
                                        <ArrowRight size={32} />
                                    </button>

                                    {/* Dynamic Icon */}
                                    <div className="relative w-40 h-40 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedGame.id}
                                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            >
                                                <selectedGame.icon className={`w-24 h-24 ${selectedGame.color} drop-shadow-[0_0_30px_currentColor]`} />
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Title info */}
                                    <div className="text-center space-y-2 relative z-20">
                                        <motion.div
                                            key={selectedGame.id}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                        >
                                            <h2 className={`font-mono text-sm tracking-[0.5em] ${selectedGame.color} mb-2`}>{selectedGame.subtitle}</h2>
                                            <h1 className="text-5xl font-black tracking-tighter text-white uppercase break-words w-full">
                                                {selectedGame.title}
                                            </h1>
                                        </motion.div>

                                        <div className={`mt-8 inline-flex items-center justify-center gap-2 font-mono text-xs tracking-[0.3em] uppercase py-2 px-6 rounded border transition-all duration-300 ${selectedGame.accent === 'cyan' ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-300' : 'bg-purple-900/20 border-purple-500/50 text-purple-300'}`}>
                                            <Terminal size={12} />
                                            <span>{booted ? "Click to Breach" : "Initializing..."}</span>
                                        </div>
                                    </div>

                                    {/* Pagination Dots */}
                                    <div className="absolute bottom-8 flex gap-2">
                                        {GAMES.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === selectedGameIndex ? 'bg-white' : 'bg-white/20'}`}
                                            />
                                        ))}
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* === BRIGHTER EXIT BUTTON === */}
                {!activeGame && !exiting && (
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExitSystem}
                        className="fixed bottom-10 left-10 z-50 group"
                    >
                        <div className="relative px-6 py-4 bg-zinc-900/90 border border-white/20 rounded-xl backdrop-blur-md flex items-center gap-4 hover:bg-white/10 hover:border-red-500/50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] overflow-hidden">
                            {/* Diagonal Stripes BG */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[size:250%_250%] group-hover:animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:border-red-500/50 group-hover:text-red-500 transition-colors text-white">
                                <Power size={18} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-none mb-1 group-hover:text-red-500/50 transition-colors">SYSTEM_EXIT</span>
                                <span className="text-sm font-black text-white tracking-wider leading-none group-hover:text-red-100 transition-colors shadow-black drop-shadow-md">ABORT SESSION</span>
                            </div>
                            <CornerDownLeft className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors ml-2" />
                        </div>
                    </motion.button>
                )}
            </div>

            {/* EXIT TRANSITION */}
            <AnimatePresence>
                {exiting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ height: "100vh", scaleY: 1 }}
                            animate={{ height: "2px", scaleY: 1, backgroundColor: "#ffffff" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full bg-white absolute"
                        />
                        <motion.div
                            initial={{ width: "100vw", opacity: 0 }}
                            animate={{ width: "0vw", opacity: 1, height: "2px" }}
                            transition={{ delay: 0.3, duration: 0.2 }}
                            className="h-[2px] bg-white absolute"
                        />
                        <div className="text-cyan-500 font-mono text-xs tracking-[0.5em] animate-pulse absolute bottom-10">
                            SYSTEM_SHUTDOWN...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GameZone />
    </React.StrictMode>,
)

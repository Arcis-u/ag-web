import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, AlertTriangle, RefreshCw, XCircle, Power, ChevronRight, AlertOctagon, Ban, Play, Eye } from 'lucide-react';

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const GlitchText = ({ text, color = "text-red-500" }) => {
    return (
        <div className="relative inline-block">
            <span className={`relative z-10 ${color}`}>{text}</span>
            <motion.span
                animate={{ opacity: [0, 1, 0], x: [-2, 2, -2] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                className={`absolute top-0 left-0 -z-10 ${color} opacity-70 blur-[1px]`}
            >
                {text}
            </motion.span>
            <motion.span
                animate={{ opacity: [0, 1, 0], x: [2, -2, 2] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: "mirror" }}
                className={`absolute top-0 left-0 -z-10 ${color} opacity-70 blur-[1px]`}
            >
                {text}
            </motion.span>
        </div>
    );
};

const LogicBreaker = ({ onExit }) => {
    // Game State Management
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState('IDLE'); // IDLE, INIT, PREPARING, SHOWING, PLAYING, SUCCESS, GAME_OVER, REBOOTING
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [activeCell, setActiveCell] = useState(null);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("INITIALIZING...");
    const [logs, setLogs] = useState([]);

    // Unmount Guard
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- EFFECT: LOG GENERATION (Visual Only) ---
    useEffect(() => {
        if (gameState === 'GAME_OVER') {
            const errs = Array(20).fill(0).map(() => `ERR_0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()} // MEMORY_LEAK`);
            setLogs(errs);
        }
    }, [gameState]);

    // --- EFFECT: GAME LOOP STATE MACHINE ---
    useEffect(() => {
        let timer;

        const safeSetState = (fn) => {
            if (isMounted.current) fn();
        };

        switch (gameState) {
            case 'IDLE':
                timer = setTimeout(() => safeSetState(() => setGameState('INIT')), 500);
                break;

            case 'INIT':
                setLevel(1);
                setMessage("INITIALIZING...");
                timer = setTimeout(() => safeSetState(() => setGameState('PREPARING')), 1000);
                break;

            case 'PREPARING':
                setMessage(`// SEQUENCE_LOAD: LVL_${level}`);
                timer = setTimeout(() => {
                    if (!isMounted.current) return;
                    const newSequence = [];
                    const length = 2 + level;
                    for (let i = 0; i < length; i++) {
                        newSequence.push(Math.floor(Math.random() * 9));
                    }
                    setSequence(newSequence);
                    setPlayerSequence([]);
                    setGameState('SHOWING');
                }, 1000);
                break;

            case 'REBOOTING':
                timer = setTimeout(() => {
                    if (!isMounted.current) return;
                    setScore(0);
                    setLevel(1);
                    setGameState('PREPARING');
                }, 1500);
                break;

            case 'SUCCESS':
                setMessage("ACCESS_GRANTED");
                timer = setTimeout(() => {
                    if (!isMounted.current) return;
                    setLevel(l => l + 1);
                    setGameState('PREPARING');
                }, 1200);
                break;

            default:
                break;
        }

        return () => clearTimeout(timer);
    }, [gameState, level]);

    // --- EFFECT: SEQUENCE PLAYBACK ---
    useEffect(() => {
        let isCancelled = false;

        const playSequence = async () => {
            if (gameState === 'SHOWING' && sequence.length > 0) {
                setMessage(">> OBSERVE PATTERN <<");

                for (let i = 0; i < sequence.length; i++) {
                    if (isCancelled || !isMounted.current) return;

                    await new Promise(r => setTimeout(r, 300));
                    if (isCancelled || !isMounted.current) return;

                    setActiveCell(sequence[i]);
                    await new Promise(r => setTimeout(r, 500));
                    if (isMounted.current) setActiveCell(null);
                }

                if (!isCancelled && isMounted.current) {
                    setGameState('PLAYING');
                    setMessage(">> INPUT SEQUENCE <<");
                }
            }
        };

        playSequence();

        return () => { isCancelled = true; setActiveCell(null); };
    }, [gameState, sequence]);


    // --- HANDLERS ---
    const handleCellClick = (index) => {
        if (gameState !== 'PLAYING') return;

        setActiveCell(index);
        setTimeout(() => isMounted.current && setActiveCell(null), 150);

        const expected = sequence[playerSequence.length];

        if (index === expected) {
            const newSeq = [...playerSequence, index];
            setPlayerSequence(newSeq);

            if (newSeq.length === sequence.length) {
                setGameState('SUCCESS');
                setScore(s => s + (level * 100));
            }
        } else {
            setGameState('GAME_OVER');
            setMessage("!! SECURITY_TRIGGERED !!");
        }
    };

    const handleReboot = () => {
        setGameState('REBOOTING');
    };

    const handleTerminate = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        onExit();
    };

    // Derived State
    const canInteract = gameState === 'PLAYING';

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden">

            {/* AMBIENT GLOW */}
            <motion.div
                animate={{ opacity: gameState === 'GAME_OVER' ? 1 : 0.2 }}
                className={`absolute inset-0 transition-colors duration-1000 ${gameState === 'GAME_OVER' ? 'bg-red-900/30' : 'bg-cyan-900/10'}`}
            />

            {/* ERROR LOGS (Fail Only) */}
            <AnimatePresence>
                {gameState === 'GAME_OVER' && (
                    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none flex flex-col font-mono text-[10px] text-red-500 leading-tight">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {log}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* MAIN INTERFACE */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-2xl p-8 flex flex-col items-center gap-6 z-20"
            >
                {/* 1. HEADER HUD */}
                <div className="w-full flex justify-between items-end border-b border-white/10 pb-4 relative">
                    <motion.div
                        layoutId="status-bar"
                        animate={{
                            width: gameState === 'GAME_OVER' ? "100%" :
                                gameState === 'PLAYING' ? "100%" :
                                    gameState === 'SHOWING' ? "50%" : "20%",
                            backgroundColor: gameState === 'GAME_OVER' ? "#ef4444"
                                : gameState === 'PLAYING' ? "#10b981"
                                    : "#06b6d4"
                        }}
                        className="absolute bottom-0 left-0 h-[2px] shadow-[0_0_10px_currentColor] transition-all duration-300"
                    />

                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center border transition-colors duration-500 ${gameState === 'GAME_OVER' ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                            {gameState === 'GAME_OVER' ? <AlertOctagon size={20} className="text-red-500 animate-pulse" /> :
                                gameState === 'SHOWING' ? <Eye size={20} className="text-cyan-400 animate-pulse" /> :
                                    <Lock size={20} className="text-cyan-400" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter">LOGIC<span className={`${gameState === 'GAME_OVER' ? 'text-red-500' : 'text-cyan-400'}`}>BREAKER</span></h2>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={message}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`text-[10px] font-mono tracking-[0.2em] uppercase ${gameState === 'GAME_OVER' ? 'text-red-500/80' : 'text-cyan-500/60'}`}
                                >
                                    {message}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-mono">CURRENT SCORE</div>
                        <div className="text-3xl font-bold font-mono text-white tabular-nums">{score.toString().padStart(6, '0')}</div>
                    </div>
                </div>

                {/* 2. GAME GRID */}
                <AnimatePresence mode="wait">
                    {!['GAME_OVER', 'REBOOTING'].includes(gameState) && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative p-1"
                        >
                            <div className="grid grid-cols-3 gap-4 md:gap-6 bg-black/50 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                {CELLS.map((cell, i) => (
                                    <motion.button
                                        key={cell}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05, type: "spring" }}
                                        disabled={!canInteract}
                                        onClick={() => handleCellClick(cell)}
                                        className={`
                                            relative w-20 h-20 md:w-24 md:h-24 rounded-lg flex items-center justify-center
                                            transition-all duration-150 backdrop-blur-sm
                                            ${activeCell === cell
                                                ? 'bg-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.8)] border-white scale-105 z-20'
                                                : canInteract
                                                    ? 'bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-900/20 cursor-pointer'
                                                    : 'bg-white/5 border border-white/5 cursor-not-allowed opacity-50'
                                            }
                                            ${gameState === 'SUCCESS' ? '!border-green-500/50 !bg-green-500/20' : ''}
                                        `}
                                    >
                                        <div className={`w-3 h-3 rounded-sm transform rotate-45 transition-colors duration-150 ${activeCell === cell ? 'bg-black' : 'bg-cyan-500/20'}`} />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {['GAME_OVER', 'REBOOTING'].includes(gameState) && (
                        <motion.div
                            key="fail-ui"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full h-[400px] flex flex-col items-center justify-center p-8 border border-red-500/30 bg-black/80 rounded-2xl backdrop-blur-xl shadow-[0_0_100px_-20px_rgba(239,68,68,0.5)] overflow-hidden"
                        >
                            <div className="flex flex-col items-center z-20">
                                <div className="relative mb-6">
                                    <Ban size={80} className="text-red-500" />
                                </div>

                                <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-tighter mb-2 text-center">
                                    <GlitchText text="SYSTEM FAILURE" />
                                </h1>
                                <p className="font-mono text-red-500/70 tracking-widest text-center mb-8">
                                    SECURITY PROTOCOLS LOCKED
                                </p>

                                {gameState === 'GAME_OVER' && (
                                    <div className="flex gap-6">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleReboot}
                                            className="px-8 py-4 bg-cyan-500 rounded-xl flex items-center gap-3 font-black text-black tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow cursor-pointer"
                                        >
                                            <RefreshCw className="w-5 h-5" /> REBOOT_SYSTEM
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleTerminate}
                                            className="px-8 py-4 bg-transparent border border-red-500/30 hover:bg-red-950/30 rounded-xl font-mono font-bold text-red-500 tracking-wider transition-colors cursor-pointer"
                                        >
                                            ABORT
                                        </motion.button>
                                    </div>
                                )}

                                {gameState === 'REBOOTING' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4 w-64"
                                    >
                                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5 }}
                                                className="h-full bg-cyan-500"
                                            />
                                        </div>
                                        <div className="font-mono text-cyan-500 text-[10px] animate-pulse">RESTORING KERNEL INTEGRITY...</div>
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            onClick={handleTerminate}
                                            className="mt-4 text-[10px] text-red-500/50 hover:text-red-500 uppercase tracking-widest cursor-pointer"
                                        >
                                            [ Force Abort ]
                                        </motion.button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. TERMINATE BUTTON (Visible unless failing) */}
                {!['GAME_OVER', 'REBOOTING'].includes(gameState) && (
                    <motion.button
                        layout
                        whileHover={{ scale: 1.05 }}
                        onClick={handleTerminate}
                        className="mt-6 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full font-mono text-red-400 text-xs tracking-widest flex items-center gap-2 group cursor-pointer"
                    >
                        <Power size={14} className="group-hover:text-red-300" />
                        TERMINATE_PROCESS
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

export default LogicBreaker;

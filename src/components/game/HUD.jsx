import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Battery, Signal, Wifi, Clock, Activity, Shield } from 'lucide-react';

// Sub-component: Clock (Updates every second)
const ClockWidget = memo(() => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="text-xl font-bold tracking-widest text-white">
            {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
    );
});

// Sub-component: System Stats (Updates every 500ms)
const SystemStats = memo(() => {
    const [fps, setFps] = useState(60);
    useEffect(() => {
        const fpsTimer = setInterval(() => {
            setFps(Math.floor(Math.random() * (60 - 55 + 1) + 55));
        }, 500);
        return () => clearInterval(fpsTimer);
    }, []);
    return (
        <div className="flex items-center gap-4 text-xs text-cyan-500/50 border-t border-cyan-500/30 pt-1 mt-1">
            <span>FPS: {fps}</span>
            <span>PING: 12ms</span>
            <span>MEM: 45%</span>
        </div>
    );
});

// Main HUD (Static structure, rarely re-renders)
const HUD = () => {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none p-6 font-mono text-xs md:text-sm text-cyan-400/80 mix-blend-screen select-none">

            {/* TOP LEFT: PLAYER STATUS */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-6 left-6 flex flex-col gap-2"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-500/50 rounded-full flex items-center justify-center bg-cyan-900/20 relative overflow-hidden">
                        <span className="font-bold text-lg">P1</span>
                        <div className="absolute bottom-0 w-full h-1/2 bg-cyan-500/10" />
                    </div>
                    <div>
                        <div className="text-xs text-cyan-500/50 tracking-widest">OPERATOR</div>
                        <div className="font-bold text-white tracking-wider">GUEST_USER</div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="w-48 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "25%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-cyan-600 to-purple-600"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-cyan-500/40">
                    <span>LVL.01</span>
                    <span>EXP 250/1000</span>
                </div>
            </motion.div>

            {/* TOP RIGHT: SYSTEM INFO */}
            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-6 right-6 flex flex-col items-end gap-2"
            >
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-purple-400" />
                        <span className="text-purple-400">SHIELD: ON</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Signal size={14} className="animate-pulse" />
                        <span>LINK: STABLE</span>
                    </div>
                    <ClockWidget />
                </div>
                <SystemStats />
            </motion.div>

            {/* BOTTOM LEFT: AUDIO VISUALIZER (Static Mock) */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 left-6 flex items-end gap-1 h-8"
            >
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [10, Math.random() * 32, 10] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className={`w-1 bg-cyan-500/50 rounded-t-sm ${i > 6 ? 'bg-purple-500/50' : ''}`}
                    />
                ))}
            </motion.div>

            {/* BOTTOM RIGHT: ACTION HINT */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 right-6 text-right"
            >
                <div className="text-[10px] text-cyan-500/40 mb-1">SYSTEM MESSAGE</div>
                <div className="border border-white/20 bg-black/40 backdrop-blur px-4 py-2 rounded-lg typewriter">
                    Select a module to override...
                </div>
            </motion.div>

            {/* DECORATIVE CORNERS */}
            <div className="absolute top-6 left-6 w-32 h-32 border-l border-t border-white/10 rounded-tl-3xl pointer-events-none" />
            <div className="absolute top-6 right-6 w-32 h-32 border-r border-t border-white/10 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-32 h-32 border-l border-b border-white/10 rounded-bl-3xl pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-32 h-32 border-r border-b border-white/10 rounded-br-3xl pointer-events-none" />
        </div>
    );
};

export default memo(HUD);

import React from 'react'
import ReactDOM from 'react-dom/client'
import { motion } from 'framer-motion'
import './index.css'
import { Gamepad2, Zap } from 'lucide-react'

// PREMIUM GAME ENTRY - WILL EXPAND LATER
const GameZone = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden font-sans">
            {/* Background Grid */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="relative"
                >
                    <div className="absolute -inset-10 bg-purple-500/20 blur-3xl rounded-full" />

                    <div className="border border-white/10 bg-black/50 backdrop-blur-xl p-12 rounded-3xl flex flex-col items-center gap-6 shadow-[0_0_100px_-20px_rgba(168,85,247,0.3)]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 rounded-full border border-purple-500/30 flex items-center justify-center relative"
                        >
                            <div className="absolute inset-0 border-t border-purple-500 rounded-full blur-[2px]" />
                            <Gamepad2 className="w-8 h-8 text-purple-400" />
                        </motion.div>

                        <div className="text-center space-y-2">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                                GAME ZONE
                            </h1>
                            <p className="font-mono text-purple-400/80 tracking-[0.2em] text-sm uppercase">
                                System Initialization...
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Back Link */}
                <motion.a
                    href="/"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-zinc-500 hover:text-white transition-colors font-mono text-xs flex items-center gap-2 group cursor-pointer"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    RETURN TO MAIN DECK
                </motion.a>
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GameZone />
    </React.StrictMode>,
)

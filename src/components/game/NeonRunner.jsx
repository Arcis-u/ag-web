import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, AlertTriangle, Wind, Zap, Activity, Scan, Target } from 'lucide-react';

// --- MATH & CONFIG ---
const LANE_WIDTH = 150; 
const LANE_HEIGHT = 120; 
const FOCAL_LENGTH = 380;
const HORIZON_Y = 250; 
const SPEED_BASE = 900;
const SPEED_MAX = 2200;

const NeonRunner = ({ onExit }) => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('MENU'); // MENU, TUTORIAL, PLAYING, GAME_OVER
    const [score, setScore] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [integrity, setIntegrity] = useState(100);
    const [combo, setCombo] = useState(0);
    const [multiplier, setMultiplier] = useState(1);

    // GAME STATE REFS
    const stateRef = useRef({
        playerLaneX: 0, 
        playerLaneY: 0, 
        playerX: 0, 
        playerY: 0,
        zPos: 0, 
        obstacles: [], 
        particles: [],
        speed: SPEED_BASE,
        totalScore: 0,
        displayScore: 0,
        integrity: 100,
        lastTime: 0,
        shaking: 0,
        waveTimer: 0,
        tilt: 0,
    });

    // --- CONTROLS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'PLAYING') return;
            const s = stateRef.current;
            
            if (e.key === 'ArrowLeft') { s.playerLaneX = Math.max(-1, s.playerLaneX - 1); s.tilt = -20; }
            if (e.key === 'ArrowRight') { s.playerLaneX = Math.min(1, s.playerLaneX + 1); s.tilt = 20; }
            if (e.key === 'ArrowUp') s.playerLaneY = Math.min(2, s.playerLaneY + 1);
            if (e.key === 'ArrowDown') s.playerLaneY = Math.max(0, s.playerLaneY - 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    // --- MAIN ENGINE ---
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Reset
        const s = stateRef.current;
        s.speed = SPEED_BASE;
        s.obstacles = [];
        s.particles = [];
        s.integrity = 100;
        s.totalScore = 0;
        s.displayScore = 0;
        s.zPos = 0;
        s.waveTimer = 0;
        s.playerLaneX = 0;
        s.playerLaneY = 0;
        s.tilt = 0;

        // SPAWNER
        const spawnPattern = () => {
             const r = Math.random();
             const zStart = 3500;
             const type = r;

             if (type < 0.25) { // "STAIRS"
                 for(let i=0; i<3; i++) {
                     s.obstacles.push({ type: 'DATA', laneX: -1+i, laneY: i, z: zStart + i*400, width: 1 });
                     s.obstacles.push({ type: 'WALL', laneX: -1+i, laneY: (i+1)%3, z: zStart + i*400, width: 1 });
                 }
             } else if (type < 0.5) { // "TUNNEL"
                 for(let i=0; i<5; i++) {
                     s.obstacles.push({ type: 'WALL', laneX: 0, laneY: 0, z: zStart + i*500, width: 3 }); // Floor
                     s.obstacles.push({ type: 'WALL', laneX: 0, laneY: 2, z: zStart + i*500, width: 3 }); // Ceiling
                     s.obstacles.push({ type: 'DATA', laneX: 0, laneY: 1, z: zStart + i*500, width: 1 }); // Safe middle
                 }
             } else if (type < 0.75) { // "SLALOM"
                 for(let i=0; i<6; i++) {
                     const lane = i%2 === 0 ? -1 : 1;
                     s.obstacles.push({ type: 'WALL', laneX: lane, laneY: 0, z: zStart + i*400, width: 1 });
                     s.obstacles.push({ type: 'DATA', laneX: 0, laneY: 0, z: zStart + i*400, width: 1 });
                 }
             } else { // "WALL OF DOOM" (Requires Jump)
                 s.obstacles.push({ type: 'WALL', laneX: 0, laneY: 0, z: zStart, width: 3 });
                 s.obstacles.push({ type: 'WALL', laneX: 0, laneY: 1, z: zStart, width: 3 });
                 // Top lane open
                 s.obstacles.push({ type: 'DATA', laneX: 0, laneY: 2, z: zStart + 500, width: 1 });
             }
        };

        const renderLoop = (timestamp) => {
            if (!s.lastTime) s.lastTime = timestamp;
            const deltaTime = Math.min((timestamp - s.lastTime) / 1000, 0.1); 
            s.lastTime = timestamp;

            const W = canvas.width;
            const H = canvas.height;
            const CX = W / 2;
            const CY = H / 2;

            // UPDATE
            s.speed = Math.min(SPEED_MAX, s.speed + (12 * deltaTime));
            s.zPos += s.speed * deltaTime;
            s.totalScore += s.speed * deltaTime * 0.1;
            s.displayScore += (s.totalScore - s.displayScore) * 0.1; // Smooth lerp
            if (s.shaking > 0) s.shaking -= deltaTime * 3;
            s.tilt += (0 - s.tilt) * 5 * deltaTime; // Recover tilt

            s.playerX += (s.playerLaneX * LANE_WIDTH - s.playerX) * 10 * deltaTime;
            s.playerY += (s.playerLaneY * LANE_HEIGHT - s.playerY) * 10 * deltaTime;

            s.waveTimer += deltaTime * s.speed;
            if (s.waveTimer > 2500) { spawnPattern(); s.waveTimer = 0; }

            // COLLISIONS
            for (let i = s.obstacles.length - 1; i >= 0; i--) {
                const obs = s.obstacles[i];
                obs.z -= s.speed * deltaTime;

                if (obs.z < 80 && obs.z > -80) {
                    const hitX = Math.abs(obs.laneX * LANE_WIDTH - s.playerX) < 80; // Forgiving X
                    const hitY = Math.abs(obs.laneY * LANE_HEIGHT - s.playerY) < 70;
                    
                    if (hitX && hitY) {
                         if (obs.type === 'WALL') {
                            if (s.shaking <= 0) {
                                s.integrity -= 30;
                                s.shaking = 0.8;
                                s.speed *= 0.6; 
                                setCombo(0); setMultiplier(1);
                                // Explosion FX
                                for(let k=0; k<20; k++) s.particles.push({
                                    x: CX, y: CY, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, life: 1, color: '#ef4444'
                                });
                            }
                         } else {
                             // DATA
                             s.totalScore += 500 * multiplier;
                             setCombo(c => {
                                 const newC = c + 1;
                                 setMultiplier(Math.min(5, 1 + Math.floor(newC / 5)));
                                 return newC;
                             });
                             s.integrity = Math.min(100, s.integrity + 5);
                             s.obstacles.splice(i, 1);
                         }
                    }
                }
                if (obs.z < -FOCAL_LENGTH) s.obstacles.splice(i, 1);
                
                if (s.integrity <= 0) {
                    setGameState('GAME_OVER');
                    setScore(Math.floor(s.totalScore));
                    return; // EXIT LOOP
                }
            }

            // RENDER
            ctx.fillStyle = '#0f0518'; 
            ctx.fillRect(0, 0, W, H);
            
            const shakeX = s.shaking > 0 ? (Math.random() - 0.5) * s.shaking * 25 : 0;
            const shakeY = s.shaking > 0 ? (Math.random() - 0.5) * s.shaking * 25 : 0;
            ctx.save();
            ctx.translate(shakeX, shakeY);

            // SKY & GRID PROJECTION
            const project = (x, y, z) => {
                const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
                return { x: CX + x * scale, y: HORIZON_Y + 70 + (100 - y) * scale, scale };
            };

            // SUN
            const sunY = HORIZON_Y - 50;
            const sunGrad = ctx.createLinearGradient(0, sunY-150, 0, sunY+150);
            sunGrad.addColorStop(0, '#facc15'); sunGrad.addColorStop(1, '#db2777');
            ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(CX, sunY, 180, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#0f0518'; for(let j=0; j<10; j++) ctx.fillRect(CX-200, sunY + 20 + j*14, 400, 2+j*2);

            // FLOOR GRID
            ctx.lineWidth = 2;
            const offsetZ = s.zPos % 200;
            ctx.shadowBlur = 0;
            
            // Horizon
            const horizonGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
            horizonGrad.addColorStop(0, '#4a044e'); horizonGrad.addColorStop(0.6, '#0f0518');
            ctx.fillStyle = horizonGrad; ctx.fillRect(0, HORIZON_Y, W, H-HORIZON_Y);

            // Checkered Floor Effect
            // (Simplified to Lines for performance)
            ctx.strokeStyle = 'rgba(232, 121, 249, 0.3)'; // Pink 
            for(let z=0; z<3000; z+=100) {
                const ez = z - offsetZ; if(ez<0) continue;
                const p1 = project(-1500, 0, ez); const p2 = project(1500, 0, ez);
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
            // Vertical Lines (Curved Canyon)
            for(let x=-2; x<=2; x++) {
                const wx = x * LANE_WIDTH * 1.5; // Wider at edges
                const pFar = project(wx, 0, 3000); const pNear = project(wx, 0, 0);
                
                // Curve effect
                ctx.strokeStyle = Math.abs(x) >= 2 ? '#22d3ee' : 'rgba(232, 121, 249, 0.1)';
                ctx.beginPath();
                ctx.moveTo(pFar.x, pFar.y); 
                // Bezier for curve? No, simple linear for speed
                ctx.lineTo(pNear.x, pNear.y);
                ctx.stroke();
            }

            // OBSTACLES (Back to Front)
            s.obstacles.sort((a,b) => b.z - a.z).forEach(obs => {
                const p = project(obs.laneX * LANE_WIDTH, obs.laneY * LANE_HEIGHT, obs.z);
                const size = 120 * p.scale;
                const w = size * obs.width;
                const h = size * 0.8;
                
                if (obs.type === 'WALL') {
                    // LASER GATE
                    ctx.shadowBlur = 20 * p.scale; ctx.shadowColor = '#ef4444'; ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 5 * p.scale;
                    
                    // Main Frame
                    ctx.beginPath();
                    // Top Bar
                    ctx.moveTo(p.x - w/2, p.y - h); ctx.lineTo(p.x + w/2, p.y - h);
                    // Bottom Bar
                    ctx.moveTo(p.x - w/2, p.y); ctx.lineTo(p.x + w/2, p.y);
                    ctx.stroke();
                    
                    // Laser Grid
                    ctx.lineWidth = 2 * p.scale; ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    for(let k=1; k<4; k++) {
                        ctx.moveTo(p.x - w/2 + (w/4)*k, p.y - h); 
                        ctx.lineTo(p.x - w/2 + (w/4)*k, p.y);
                    }
                    ctx.stroke(); ctx.globalAlpha = 1;

                    // Danger Icon
                    ctx.fillStyle = '#ef4444'; ctx.beginPath(); 
                    ctx.arc(p.x, p.y - h/2, 10*p.scale, 0, Math.PI*2); ctx.fill();

                } else {
                    // DATA SHARD
                    ctx.shadowBlur = 15; ctx.shadowColor = '#22d3ee'; ctx.fillStyle = '#22d3ee';
                    const rot = timestamp * 0.003;
                    
                    ctx.beginPath();
                    for(let k=0; k<4; k++) {
                        const angle = rot + (k * Math.PI/2);
                        const r = k%2===0 ? size/2 : size/4;
                        ctx.lineTo(p.x + Math.cos(angle)*r, p.y - size/2 + Math.sin(angle)*r);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            });

            // PLAYER SHIP
            const shipP = project(s.playerX, s.playerY, 0);
            const bankAngle = s.tilt + (s.playerLaneX * LANE_WIDTH - s.playerX) * 0.05;
            
            ctx.save();
            ctx.translate(shipP.x, shipP.y - 30 * shipP.scale);
            ctx.rotate(bankAngle * Math.PI / 180);
            ctx.scale(shipP.scale, shipP.scale);

            // Jet Effect
            ctx.shadowBlur = 30; ctx.shadowColor = '#d946ef'; ctx.fillStyle = '#d946ef';
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); 
            ctx.lineTo(0, 40 + Math.random()*20); ctx.fill();

            // Hull
            ctx.shadowBlur = 10; ctx.shadowColor = '#00f0ff';
            ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 3;
            // Complex Shape
            ctx.beginPath();
            ctx.moveTo(0, -50); // Nose
            ctx.lineTo(20, -10);
            ctx.lineTo(50, 20); // Wing R
            ctx.lineTo(20, 20);
            ctx.lineTo(0, 10); // Rear
            ctx.lineTo(-20, 20);
            ctx.lineTo(-50, 20); // Wing L
            ctx.lineTo(-20, -10);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0,-30); ctx.lineTo(5,-10); ctx.lineTo(-5,-10); ctx.fill();

            ctx.restore();
            ctx.restore();

            // PARTICLES
            s.particles.forEach((p, idx) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.05;
                if(p.life <= 0) s.particles.splice(idx, 1);
                else {
                    ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
                }
            });
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(renderLoop);
            
            // Sync UI
            if (timestamp % 5 < 1) {
                setScore(Math.floor(s.displayScore));
                setSpeed(Math.floor(s.speed));
                setIntegrity(Math.floor(s.integrity));
            }
        };

        const resize = () => {canvas.width = window.innerWidth; canvas.height = window.innerHeight;};
        window.addEventListener('resize', resize); resize();
        animationFrameId = requestAnimationFrame(renderLoop);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, [gameState]); // Re-run when gameState changes

    // --- UI HANDLERS ---
    const startTutorial = () => setGameState('TUTORIAL');
    const skipTutorial = () => {
        setGameState('PLAYING');
        setScore(0);
        setIntegrity(100);
    };

    // ESCAPE KEY HANDLER
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onExit();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onExit]);

    // TRANSITION VARIANTS
    const overlayVariants = {
        hidden: { opacity: 0, scale: 1.1, filter: "blur(10px)" },
        visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.9, filter: "blur(20px)", transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="absolute inset-0 bg-black font-sans overflow-hidden select-none cursor-none">
            <canvas ref={canvasRef} className="block w-full h-full" />
            
            {/* VIGNETTE & SCANLINES */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-10 opacity-30" />

            {/* UI LAYER */}
            <div className="absolute inset-0 pointer-events-none z-20 sticky-ui">
                <AnimatePresence mode="wait">
                    {gameState === 'PLAYING' && (
                        <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                             {/* TOP LEFT SCORE */}
                             <div className="absolute top-8 left-10">
                                 <motion.div 
                                    initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-xs mb-1"
                                 >
                                     <Activity size={14} /> SCORE_V3
                                 </motion.div>
                                 <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                                    className="text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                                 >
                                     {score.toString().padStart(6, '0')}
                                 </motion.div>
                                 <AnimatePresence>
                                     {combo > 1 && (
                                         <motion.div 
                                            initial={{ opacity: 0, y: 20, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
                                            key={combo}
                                            className="text-yellow-400 font-black text-2xl italic mt-1 ml-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                                         >
                                             {combo}X COMBO!
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                             </div>

                             {/* TOP RIGHT SPEED */}
                             <div className="absolute top-8 right-10 text-right">
                                 <motion.div 
                                    initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="flex justify-end items-center gap-2 text-purple-400 font-bold tracking-widest text-xs mb-1"
                                 >
                                     <Wind size={14} /> VELOCITY
                                 </motion.div>
                                 <div className="flex items-baseline justify-end gap-1">
                                     <span className="text-5xl font-black text-white italic">{speed}</span>
                                     <span className="text-sm font-mono text-gray-500">KM/H</span>
                                 </div>
                                 <div className="w-48 h-1.5 bg-gray-900 mt-2 ml-auto rounded-full overflow-hidden border border-white/10">
                                     <motion.div 
                                         className="h-full bg-gradient-to-l from-purple-500 to-cyan-500" 
                                         animate={{ width: `${Math.min(100, (speed/SPEED_MAX)*100)}%` }}
                                     />
                                 </div>
                             </div>

                             {/* EXIT BUTTON (INGAME) */}
                             <motion.button
                                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                onClick={onExit}
                                className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto group flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                             >
                                 <div className="w-8 h-8 rounded-full border border-red-500/50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-black transition-colors">
                                     <div className="w-3 h-3 bg-current rounded-sm" />
                                 </div>
                                 <span className="text-[9px] font-mono text-red-500 tracking-widest">ESC</span>
                             </motion.button>


                             {/* BOTTOM INTEGRITY */}
                             <motion.div 
                                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                                className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[600px]"
                             >
                                 <div className="flex justify-between text-xs font-bold text-cyan-300 mb-2 tracking-[0.2em] font-mono shadow-black drop-shadow-md">
                                     <span>SHIELD_INTEGRITY</span>
                                     <span>{integrity}%</span>
                                 </div>
                                 {/* Complex Bar */}
                                 <div className="h-5 bg-black/80 border border-cyan-500/50 rounded skew-x-[-20deg] p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                     <motion.div 
                                        className={`h-full rounded-sm relative overflow-hidden ${integrity < 30 ? 'bg-red-500 animate-pulse warning-stripes' : 'bg-cyan-500'}`}
                                        animate={{ width: `${integrity}%` }}
                                        transition={{ type: 'spring', stiffness: 50 }}
                                     >
                                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-shimmer" />
                                     </motion.div>
                                 </div>
                             </motion.div>
                        </motion.div>
                    )}

                    {/* MENU */}
                    {gameState === 'MENU' && (
                        <motion.div 
                            key="menu" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto"
                        >
                            <div className="relative text-center z-20">
                                {/* Decorative Rings */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-cyan-500/10 rounded-full animate-spin-slow pointer-events-none border-dashed" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-purple-500/10 rounded-full animate-reverse-spin pointer-events-none" />
                                
                                <motion.h1 
                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "circOut" }}
                                    className="text-[140px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 italic mix-blend-screen filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                >
                                    NEON
                                    <span className="block text-[100px] text-cyan-500 drop-shadow-[0_0_5px_cyan]">DRIFT</span>
                                </motion.h1>
                                
                                <motion.button 
                                    whileHover={{ scale: 1.05, skewX: -12 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setGameState('TUTORIAL')}
                                    className="group relative mt-16 px-24 py-8 bg-white text-black font-black text-2xl tracking-[0.25em] skew-x-[-10deg] overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                >
                                    <span className="relative z-10 group-hover:text-purple-600 transition-colors">INITIALIZE</span>
                                    <div className="absolute inset-0 bg-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                                </motion.button>
                                
                                <motion.button 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                    onClick={onExit} 
                                    className="block mx-auto mt-10 text-[10px] font-mono text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-[0.3em] hover:tracking-[0.5em] duration-300"
                                >
                                    [ ABORT SEQUENCE ]
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* TUTORIAL */}
                    {gameState === 'TUTORIAL' && (
                        <motion.div 
                           key="tutorial" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                           className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl pointer-events-auto z-50"
                        >
                            <div className="w-full max-w-7xl grid grid-cols-12 gap-10 items-center p-10">
                                <div className="col-span-12 md:col-span-5 space-y-10">
                                    <motion.div 
                                        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="border-l-4 border-cyan-500 pl-6"
                                    >
                                        <h2 className="text-7xl font-black text-white italic mb-2">PILOT<br/><span className="text-cyan-500">MANUAL</span></h2>
                                        <p className="text-gray-400 font-mono text-sm tracking-wide">SYSTEM: v3.14 // READY</p>
                                    </motion.div>
                                    
                                    <div className="space-y-8">
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-6 mb-2">
                                                <div className="flex gap-2">
                                                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center"><ChevronLeft className="text-white"/></div>
                                                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center"><ChevronRight className="text-white"/></div>
                                                </div>
                                                <span className="font-bold text-cyan-400 tracking-wider">LATERAL CONTROL</span>
                                            </div>
                                            <p className="text-sm text-gray-400">Strafe left/right to avoid Red Laser Gates.</p>
                                        </div>

                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-6 mb-2">
                                                <div className="flex gap-2">
                                                    <div className="w-10 h-10 border border-cyan-500 text-cyan-500 rounded flex items-center justify-center"><ChevronUp /></div>
                                                    <div className="w-10 h-10 border border-purple-500 text-purple-500 rounded flex items-center justify-center"><ChevronDown /></div>
                                                </div>
                                                <span className="font-bold text-purple-400 tracking-wider">ALTITUDE CONTROL</span>
                                            </div>
                                            <p className="text-sm text-gray-400">Jump over low walls. Dive under ceiling beams.</p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs font-mono text-gray-500 pt-4 border-t border-white/10">
                                            <span>EXIT PROTOCOL:</span>
                                            <span className="flex items-center gap-2">PRESS <span className="border border-red-500 text-red-500 px-2 py-0.5 rounded text-[10px]">ESC</span> TO ABORT</span>
                                        </div>
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={skipTutorial} 
                                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                                    >
                                        ENGAGE HYPERDRIVE
                                    </motion.button>
                                </div>
                                <div className="col-span-12 md:col-span-7 h-[600px] relative">
                                     <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 grid-background opacity-20" />
                                        <div className="text-center">
                                            <Scan size={80} className="mx-auto text-cyan-500 animate-pulse mb-6" />
                                            <div className="text-xs font-mono text-cyan-300 tracking-[0.5em]">SIMULATION_PREVIEW</div>
                                            <div className="mt-8 flex gap-4 opacity-50">
                                                <div className="w-32 h-20 border border-red-500/50 rounded flex items-center justify-center text-red-500 text-xs">AVOID</div>
                                                <div className="w-32 h-20 border border-cyan-500/50 rounded flex items-center justify-center text-cyan-500 text-xs">COLLECT</div>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                     {/* GAME OVER */}
                     {gameState === 'GAME_OVER' && (
                        <motion.div 
                            key="game-over" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                            className="absolute inset-0 flex items-center justify-center bg-red-950/90 pointer-events-auto z-50 backdrop-blur-md"
                        >
                            <div className="text-center relative">
                                <motion.div 
                                    initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="text-[120px] font-black text-white italic leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                >
                                    CRASHED
                                </motion.div>
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl mt-8 inline-block min-w-[300px]"
                                >
                                    <div className="text-xs font-mono text-gray-400 tracking-widest mb-2">FINAL SCORE</div>
                                    <div className="text-5xl font-mono text-cyan-400">{score}</div>
                                </motion.div>

                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                                    className="flex justify-center gap-6 mt-12"
                                >
                                    <button onClick={skipTutorial} className="px-12 py-4 bg-white text-black font-bold text-xl hover:bg-cyan-400 hover:scale-105 transition-all skew-x-[-10deg]">
                                        RETRY_MISSION
                                    </button>
                                    <button onClick={onExit} className="px-12 py-4 border border-white/20 text-white font-bold text-xl hover:bg-white/10 hover:border-white transition-all skew-x-[-10deg]">
                                        ABORT
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                     )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NeonRunner;

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring, useAnimationFrame, useVelocity } from 'framer-motion';
import Lenis from 'lenis';
import {
    Atom, Cpu, Code, Palette, Mic, ChevronDown, Check, Sparkles, Send,
    Rocket, Users, Award, Lightbulb, Target, ArrowRight, BookOpen,
    FlaskConical, Trophy, HelpCircle, MessageSquare, Quote, Zap, Menu, X,
    Terminal, Globe, Activity, Layers, Database
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
            className={`font-mono ${className} ${hover ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => hover && setTrigger(prev => prev + 1)}
        >
            {display}
        </span>
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

const IntroSequence = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 50);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#020205] flex flex-col items-center justify-center font-mono"
            initial={{ y: 0 }}
            animate={progress === 100 ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            onAnimationComplete={onComplete}
        >
            <div className={`text-4xl font-bold mb-4 ${progress === 100 ? 'text-lime-400' : 'text-white'}`}>
                {progress}%
            </div>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-lime-400 transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-4 text-xs text-white/40">SYSTEM INITIALIZING...</div>
        </motion.div>
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

// DYNAMIC ISLAND NAVIGATION
const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        >
            <motion.div
                layout
                className="glass-panel rounded-full overflow-hidden"
                style={{
                    backgroundColor: '#0a0a0a',
                    borderColor: 'rgba(255,255,255,0.1)'
                }}
                animate={{
                    width: isOpen ? 320 : 200,
                    height: isOpen ? 380 : 56,
                    borderRadius: isOpen ? 24 : 100
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex flex-col h-full relative">
                    {/* Header / Trigger */}
                    <div className="flex items-center justify-between px-2 h-14 absolute top-0 w-full z-20">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center pointer-events-none">
                            <span className="font-black text-black">S.</span>
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="px-4 py-2 text-xs font-mono uppercase tracking-widest hover:text-cyan-400 transition-colors"
                        >
                            {isOpen ? 'Close' : <ScrambleText text="MENU" hover={false} />}
                        </button>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pt-20 px-6 pb-6 flex flex-col gap-4 h-full"
                            >
                                {['Home', 'Algorithm', 'System', 'Tracks', 'Apply'].map((item, i) => (
                                    <motion.a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        onClick={() => setIsOpen(false)}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="text-3xl font-serif text-white/50 hover:text-white hover:pl-4 transition-all duration-300 flex items-center gap-4 group"
                                    >
                                        <span>{item}</span>
                                        <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-cyan-400" size={20} />
                                    </motion.a>
                                ))}

                                <div className="mt-auto border-t border-white/10 pt-4 flex justify-between text-[10px] font-mono text-white/40">
                                    <span>EST. 2026</span>
                                    <span>SECURE://V.2</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
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
                        text="SHAPING"
                        className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter text-white opacity-90 mix-blend-overlay"
                        delay={0.2}
                    />
                </div>
                <div className="relative z-20">
                    <StaggerText
                        text="THE FUTURE"
                        className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400"
                        delay={0.5}
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-8 max-w-xl text-white/50 font-mono text-xs md:text-sm leading-relaxed"
                >
                    We are the architects of the unseen. Exploring the boundaries of <span className="text-white">Robotics</span>, <span className="text-white">AI</span>, and <span className="text-white">Design</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="mt-12"
                >
                    <a href="#algorithm" className="group relative px-6 py-3 overflow-hidden border border-white/20 rounded-none bg-transparent hover:bg-white/5 transition-all">
                        <div className="absolute inset-0 w-1 bg-lime-400 transition-all duration-300 group-hover:w-full opacity-10" />
                        <span className="relative flex items-center gap-4 font-mono text-xs text-white">
                            INITIALIZE_PROTOCOL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                <span className="font-mono text-[10px] text-white/30 animate-pulse">SCROLL</span>
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
    const [formData, setFormData] = useState({ name: '', class: '', email: '', track: '' });
    const [touched, setTouched] = useState({ name: false, class: false, email: false, track: false });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (field, value) => {
        let newErrors = { ...errors };

        if (field === 'name') {
            if (!value) newErrors.name = 'Vui lòng nhập họ tên';
            else delete newErrors.name;
        }
        if (field === 'class') {
            if (!value) newErrors.class = 'Vui lòng nhập lớp';
            else delete newErrors.class;
        }
        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) newErrors.email = 'Vui lòng nhập email';
            else if (!emailRegex.test(value)) newErrors.email = 'Email không hợp lệ';
            else delete newErrors.email;
        }
        if (field === 'track') {
            if (!value) newErrors.track = 'Vui lòng chọn ban';
            else delete newErrors.track;
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
            isValid = validate('name', formData.name) && validate('class', formData.class);
            if (!formData.name) { setTouched(prev => ({ ...prev, name: true })); isValid = false; }
            if (!formData.class) { setTouched(prev => ({ ...prev, class: true })); isValid = false; }
        } else if (step === 1) {
            isValid = validate('email', formData.email);
            if (!formData.email) { setTouched(prev => ({ ...prev, email: true })); isValid = false; }
        }

        if (isValid) setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!formData.track) return;
        setIsSubmitting(true);

        // Prepare email content
        const targetEmail = 'anhquan130408@gmail.com';
        const subject = encodeURIComponent(`[STEM Club Registration] ${formData.name} - ${formData.track}`);
        const body = encodeURIComponent(
            `=== STEM CLUB REGISTRATION ===

AGENT (Họ và Tên): ${formData.name}
UNIT (Lớp): ${formData.class}
COMMS (Email): ${formData.email}
MISSION (Track): ${formData.track}

---
Submitted: ${new Date().toLocaleString('vi-VN')}
Registration ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
`
        );

        // Open mailto link
        const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');

        await new Promise(r => setTimeout(r, 1000));
        setIsSubmitting(false);
        setStep(4);
    };

    const steps = [
        {
            id: 0,
            title: "Thông tin",
            content: (
                <div className="space-y-8">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 01_03: THÔNG TIN CÁ NHÂN</p>
                    <div className="group">
                        <label className="block text-xs font-mono text-white/50 mb-2">HỌ VÀ TÊN {errors.name && <span className="text-red-500 ml-2">[{errors.name}]</span>}</label>
                        <input
                            type="text"
                            className={`form-input text-2xl ${errors.name && touched.name ? 'text-red-400 border-red-500/50 animate-shake' : ''}`}
                            placeholder="Nguyễn Văn A"
                            value={formData.name}
                            onChange={e => {
                                setFormData({ ...formData, name: e.target.value });
                                if (touched.name) validate('name', e.target.value);
                            }}
                            onBlur={() => handleBlur('name')}
                        />
                        <div className={`input-underline ${errors.name && touched.name ? 'bg-red-500/50' : ''}`} />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-mono text-white/50 mb-2">LỚP {errors.class && <span className="text-red-500 ml-2">[{errors.class}]</span>}</label>
                        <input
                            type="text"
                            className={`form-input text-2xl ${errors.class && touched.class ? 'text-red-400 border-red-500/50 animate-shake' : ''}`}
                            placeholder="10A1"
                            value={formData.class}
                            onChange={e => {
                                setFormData({ ...formData, class: e.target.value });
                                if (touched.class) validate('class', e.target.value);
                            }}
                            onBlur={() => handleBlur('class')}
                        />
                        <div className={`input-underline ${errors.class && touched.class ? 'bg-red-500/50' : ''}`} />
                    </div>
                </div>
            )
        },
        {
            id: 1,
            title: "Liên hệ",
            content: (
                <div className="space-y-8">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 02_03: THÔNG TIN LIÊN HỆ</p>
                    <div className="group">
                        <label className="block text-xs font-mono text-white/50 mb-2">ĐỊA CHỈ EMAIL {errors.email && <span className="text-red-500 ml-2">[{errors.email}]</span>}</label>
                        <input
                            type="email"
                            className={`form-input text-2xl ${errors.email && touched.email ? 'text-red-400 border-red-500/50 animate-shake' : ''}`}
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={e => {
                                setFormData({ ...formData, email: e.target.value });
                                if (touched.email) validate('email', e.target.value);
                            }}
                            onBlur={() => handleBlur('email')}
                        />
                        <div className={`input-underline ${errors.email && touched.email ? 'bg-red-500/50' : ''}`} />
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Chọn ban",
            content: (
                <div className="space-y-8">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// BƯỚC 03_03: CHỌN BAN HOẠT ĐỘNG</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'Programming', label: 'Lập trình' },
                            { key: 'Robotics', label: 'Robot' },
                            { key: 'Science', label: 'Khoa học' },
                            { key: 'Media', label: 'Truyền thông' }
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
            id: 3,
            title: "Xác nhận",
            content: (
                <div className="space-y-8 text-center">
                    <p className="font-mono text-sm text-lime-400 mb-4">/// XÁC NHẬN THÔNG TIN</p>
                    <div className="border border-white/10 p-8 text-left space-y-4 font-mono text-sm bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-lime-400/20" />
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Họ và tên:</span> <span className="text-white">{formData.name}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Lớp:</span> <span className="text-white">{formData.class}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Email:</span> <span className="text-white">{formData.email}</span></div>
                        <div className="flex justify-between"><span>Ban:</span> <span className="text-lime-400">{formData.track === 'Programming' ? 'Lập trình' : formData.track === 'Robotics' ? 'Robot' : formData.track === 'Science' ? 'Khoa học' : 'Truyền thông'}</span></div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
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
                    <h3 className="text-4xl font-black mb-4 tracking-tighter">CHÀO MỪNG BẠN!</h3>
                    <p className="text-white/50 font-mono">Đăng ký thành công. <br /> Mã đăng ký: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
            )
        }
    ];

    return (
        <section id="apply" className="py-32 px-6 relative bg-[#020205]">
            <div className="max-w-3xl mx-auto">
                {step < 4 && (
                    <div className="flex justify-between items-center mb-16">
                        <div className="flex gap-2">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`h-1 w-12 transition-colors duration-500 ${i <= step ? 'bg-lime-400' : 'bg-white/10'}`} />
                            ))}
                        </div>
                        <div className="font-mono text-xs text-white/30">PHASE 0{step + 1} // 04</div>
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
                                        The <br /> <span className="text-lime-400">Method</span>
                                    </h2>
                                </SkewScroll>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal delay={0.2}>
                            <div className="font-mono text-xs text-white/40 space-y-4 border-l border-white/10 pl-4">
                                <p className="text-lime-400">/// KERNEL_PANIC.INIT</p>
                                <p className="leading-relaxed">
                                    Chaos is our engine. Structure is our exhaust. We don't just write code; we architect existence in the digital realm.
                                </p>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <div className="text-white">ERR_001</div>
                                        <div>Trial</div>
                                    </div>
                                    <div>
                                        <div className="text-white">ERR_002</div>
                                        <div>Error</div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right Column: Broken Grid Content */}
                    <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Item 1 - Wide */}
                        <div className="md:col-span-2 relative group">
                            <div className="absolute -left-4 top-0 font-mono text-xs text-lime-400 -rotate-90 origin-bottom-right">INPUT_STREAM</div>
                            <div className="border border-white/10 p-6 bg-white/[0.02] hover:bg-white/5 transition-colors duration-500">
                                <h3 className="text-2xl font-bold mb-4 flex justify-between items-center">
                                    <ScrambleText text="01 // OBSERVATION" />
                                    <ArrowRight className="-rotate-45 group-hover:rotate-0 transition-transform text-lime-400" />
                                </h3>
                                <p className="text-white/50 mb-6 max-w-lg">Scanning the horizon for signals. We ingest data from global tech currents, filtering noise to find the signal.</p>
                                <GlitchImage src={IMAGES.robotics} alt="Observation" className="h-64 w-full" />
                            </div>
                        </div>

                        {/* Item 2 - Tall */}
                        <motion.div style={{ y: yColumn }} className="md:row-span-2 relative group mt-12 md:mt-0">
                            <div className="border border-white/10 p-6 bg-white/[0.02] h-full hover:bg-white/5 transition-colors duration-500 flex flex-col">
                                <GlitchImage src={IMAGES.coding} alt="Processing" className="h-64 w-full mb-6 order-last md:order-first md:h-full md:max-h-[300px]" />
                                <h3 className="text-2xl font-bold mb-2 mt-auto"><ScrambleText text="02 // SYNTHESIS" /></h3>
                                <p className="text-white/50 text-sm">Fusing disparate elements. Code meets Hardware. Art meets Logic.</p>
                            </div>
                        </motion.div>

                        {/* Item 3 - Standard */}
                        <div className="relative group">
                            <div className="border border-white/10 p-6 bg-white/[0.02] hover:bg-white/5 transition-colors duration-500">
                                <h3 className="text-2xl font-bold mb-4 text-right"><ScrambleText text="03 // DEPLOY" /></h3>
                                <div className="h-[1px] w-full bg-white/10 mb-4" />
                                <p className="text-white/50 text-sm mb-4">Releasing the payload. Scalable, robust, and impactful solutions.</p>
                                <div className="font-mono text-xs text-lime-400 text-right">STATUS: READY</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// HORIZONTAL TRACKS SECTION
const TracksSection = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

    const tracks = [
        { icon: Code, title: "Programming", desc: "Algorithms, Web Dev, AI/ML", color: "#3b82f6", img: IMAGES.coding, specs: ["NextJS", "Python", "TensorFlow"] },
        { icon: Cpu, title: "Robotics", desc: "Arduino, IoT, Circuit Design", color: "#a855f7", img: IMAGES.robotics, specs: ["C++", "Electronics", "CAD"] },
        { icon: FlaskConical, title: "Science", desc: "Physics, Chemistry, Biology", color: "#22c55e", img: null, specs: ["Lab Work", "Research", "Analysis"] },
        { icon: Palette, title: "Design", desc: "Graphics, Video, Brand Identity", color: "#f97316", img: null, specs: ["Figma", "Blender", "Adobe"] },
        { icon: Mic, title: "Communication", desc: "PR, Events, Outreach", color: "#ec4899", img: null, specs: ["Public Speaking", "Writing", "Media"] },
    ];

    return (
        <section ref={targetRef} id="tracks" className="relative h-[300vh] bg-[#050505]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-4 md:gap-12 px-4 md:px-24">
                    {/* Intro Card */}
                    <div className="min-w-[85vw] md:min-w-[400px] flex flex-col justify-center border-l border-white/10 pl-4 md:pl-12">
                        <span className="font-mono text-xs text-lime-400 mb-4">SELECT_MODULE</span>
                        <SkewScroll>
                            <h2 className="text-6xl md:text-8xl font-serif leading-none mb-8 text-white">
                                Choose<br />Your<br /><span className="text-stroke">Path</span>
                            </h2>
                        </SkewScroll>
                        <div className="mt-8 flex gap-4">
                            <ArrowRight className="animate-pulse" />
                            <span className="font-mono text-xs">SCROLL TO NAVIGATE</span>
                        </div>
                    </div>

                    {/* Track Cards */}
                    {tracks.map((track, i) => (
                        <motion.div
                            key={i}
                            className="group relative h-[60vh] w-[85vw] md:w-[400px] overflow-hidden bg-neutral-900 border border-white/10"
                        >
                            {track.img ? (
                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                    <div className="absolute inset-0 bg-black/30 z-10" />
                                    <img src={track.img} alt={track.title} className="h-full w-full object-cover opacity-60 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                            )}

                            <div className="absolute top-4 right-4 z-20 font-mono text-xs text-white/50 border border-white/10 px-2 py-1 rounded-sm">
                                MOD.0{i + 1}
                            </div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                                <div className="mb-auto">
                                    <track.icon size={40} style={{ color: track.color }} strokeWidth={1} />
                                </div>

                                <h3 className="text-4xl font-bold text-white mb-2 decoration-clone">
                                    <ScrambleText text={track.title} />
                                </h3>
                                <p className="text-white/60 font-mono text-xs mb-6 border-l-2 pl-4" style={{ borderColor: track.color }}>{track.desc}</p>

                                {/* Tech Specs */}
                                <div className="flex gap-2 flex-wrap mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    {track.specs.map(spec => (
                                        <span key={spec} className="text-[10px] font-mono border border-white/20 px-2 py-1 text-white/70">
                                            {spec}
                                        </span>
                                    ))}
                                </div>

                                <button className="w-full py-4 border-t border-white/20 flex justify-between items-center hover:bg-white hover:text-black transition-colors px-4 group/btn">
                                    <span className="font-mono text-xs uppercase tracking-wider">Initialize</span>
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// PROJECT ARCHIVES SECTION
const ProjectArchives = () => {
    const [activeProject, setActiveProject] = useState(null);
    const [hoveredProject, setHoveredProject] = useState(null);
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const projects = [
        { id: "01", name: "Alpha_Rover", type: "Robotics", date: "2025.02", specs: ["ESP32", "Lidar", "Python"], img: IMAGES.robotics, description: "Autonomous navigation unit designed for hostile terrain mapping." },
        { id: "02", name: "Neural_Net_V1", type: "AI / ML", date: "2025.06", specs: ["TensorFlow", "React", "Node"], img: IMAGES.coding, description: "Self-learning algorithm capable of predictive pattern recognition." },
        { id: "03", name: "Eco_System", type: "IoT", date: "2025.09", specs: ["Arduino", "Sensors", "LoRa"], img: IMAGES.robotics, description: "Interconnected sensor mesh for real-time environmental bio-feedback." },
        { id: "04", name: "Cyber_Deck", type: "Hardware", date: "2025.12", specs: ["3D Print", "Linux", "Mech"], img: IMAGES.coding, description: "Portable cyber-warfare terminal with tactical mechanical inputs." },
    ];

    // Default to first project for display if none hovered
    const currentProject = hoveredProject || projects[0];

    return (
        <section ref={sectionRef} className="py-32 px-6 relative z-20 bg-[#020205] overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                {/* HEADLINES */}
                <div className="col-span-12 mb-12 md:mb-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="h-[1px] w-12 bg-lime-400" />
                        <span className="text-lime-400 font-mono text-xs tracking-[0.2em]">/// CLASSIFIED_ARCHIVES</span>
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20 uppercase leading-[0.9]">
                        Selected<br />Cases
                    </h2>
                </div>

                {/* LEFT: Project List */}
                <div className="col-span-12 md:col-span-7 relative z-10 space-y-2">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                            onMouseEnter={() => setHoveredProject(project)}
                            onMouseLeave={() => setHoveredProject(null)}
                        >
                            <div className={`relative p-6 border-b border-white/10 transition-all duration-500 ${hoveredProject?.id === project.id ? 'pl-12 bg-white/5 border-lime-400/50' : 'hover:bg-white/[0.02]'}`}>
                                {/* Hover Indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-lime-400 transition-all duration-300 ${hoveredProject?.id === project.id ? 'opacity-100' : 'opacity-0'}`} />

                                <div className="flex justify-between items-baseline relative z-10">
                                    <h3 className={`text-3xl md:text-5xl font-bold uppercase transition-colors duration-300 ${hoveredProject?.id === project.id ? 'text-white' : 'text-white/40'}`}>
                                        {project.name}
                                    </h3>
                                    <span className="font-mono text-xs text-lime-400/50 group-hover:text-lime-400 transition-colors">
                                        .{project.type}
                                    </span>
                                </div>

                                <div className={`overflow-hidden transition-all duration-500 ${hoveredProject?.id === project.id ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-white/60 font-mono text-xs max-w-md mb-4">{project.description}</p>
                                    <div className="flex gap-2">
                                        {project.specs.map(spec => (
                                            <span key={spec} className="text-[10px] uppercase border border-lime-400/30 text-lime-400 px-2 py-1 rounded-sm">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Decorative numbering */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-6xl text-white/5 pointer-events-none group-hover:text-lime-400/10 transition-colors">
                                    {project.id}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* RIGHT: Visual Preview (Sticky) */}
                <div className="hidden md:block col-span-5 relative h-[600px]">
                    <div className="sticky top-32 w-full">
                        <div className="relative aspect-[4/5] bg-black border border-white/20 p-2 overflow-hidden group">
                            {/* CRT Overlay Effects */}
                            <div className="absolute inset-0 pointer-events-none z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 Mix-blend-overlay" />
                            <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-transparent via-white/5 to-black/50" />
                            <div className="absolute top-0 w-full h-2 bg-lime-400/30 blur-sm animate-[scanlines_3s_linear_infinite] z-40 pointer-events-none" />

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-lime-400 z-50" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-lime-400 z-50" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-lime-400 z-50" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-lime-400 z-50" />

                            {/* Image Container with Glitch Transition */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentProject.id}
                                    initial={{ opacity: 0, filter: "brightness(2) blur(10px)" }}
                                    animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
                                    exit={{ opacity: 0, filter: "hue-rotate(90deg) blur(5px)" }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full relative"
                                >
                                    <img
                                        src={currentProject.img}
                                        alt={currentProject.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    {/* Color Overlay for Tint */}
                                    <div className="absolute inset-0 bg-lime-500/20 mix-blend-overlay" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Data Overlay */}
                            <div className="absolute bottom-8 left-8 right-8 z-50">
                                <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
                                    <div>
                                        <div className="text-[10px] font-mono text-lime-400 mb-1">TARGET_ID</div>
                                        <div className="text-2xl font-bold text-white">{currentProject.id}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-lime-400 mb-1">DATE</div>
                                        <div className="text-sm font-bold text-white">{currentProject.date}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-white/50">
                                    <span>RENDER: CYCLES_X</span>
                                    <span className="animate-pulse text-lime-400">STATUS: LIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Under element */}
                        <div className="mt-4 flex justify-between font-mono text-[10px] text-white/20">
                            <div>SECURE CONNECTION ESTABLISHED</div>
                            <div>encrypted_v2.0.4</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// TRANSMISSION LOG (Testimonials)
const TransmissionLog = () => {
    const logs = [
        { id: "LOG_882", user: "H. Minh", role: "Alumni '24", msg: "The club was the catalyst for my CS career. Truly a different dimension." },
        { id: "LOG_991", user: "L. An", role: "Robotics Lead", msg: "We don't just build robots; we build the future infrastructure." },
        { id: "LOG_102", user: "T. Bao", role: "Creative Dir", msg: "Where art meets algorithm. The perfect chaos." }
    ];

    return (
        <section className="py-32 border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-lime-400/5 -skew-y-3 transform origin-top-left scale-110" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex items-end justify-between mb-16">
                    <h2 className="text-4xl font-serif">Transmission <br /> <span className="text-stroke">Logs</span></h2>
                    <div className="font-mono text-xs text-right hidden md:block">
                        <div>ENCRYPTED_DATA</div>
                        <div className="text-lime-400">DECRYPTING...</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {logs.map((log, i) => (
                        <div key={i} className="glass-panel p-8 group hover:bg-white/5 transition-colors duration-500">
                            <div className="flex justify-between items-start mb-6 text-xs font-mono text-white/30">
                                <span>{log.id}</span>
                                <Activity size={12} className="text-lime-400 opacity-50" />
                            </div>
                            <p className="text-lg font-light mb-8 leading-relaxed max-w-sm">"{log.msg}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600" />
                                <div>
                                    <div className="font-bold text-sm">{log.user}</div>
                                    <div className="text-[10px] font-mono text-lime-400">{log.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// "SYSTEM STATS" SECTION
const StatsSection = () => {
    const stats = [
        { label: "AGENTS", val: 120, suff: "+" },
        { label: "MODULES", val: 45, suff: "" },
        { label: "TROPHIES", val: 12, suff: "" },
        { label: "CYCLES", val: 2026, suff: "" }
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center group relative p-4">
                        <div className="absolute inset-0 border border-white/5 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                        <div className="font-mono text-xs text-white/30 mb-2">DATAPOINT_0{i + 1}</div>
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

// FOOTER WITH CLI
const Footer = () => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState(["> SYSTEM READY..."]);
    const inputRef = useRef(null);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            let response = `> COMMAND NOT RECOGNIZED: ${cmd}`;
            if (cmd === 'help') response = "> AVAILABLE COMMANDS: apply, status, clear, home";
            if (cmd === 'status') response = "> SYSTEM: NOMINAL // ALL SYSTEMS GO";
            if (cmd === 'clear') { setOutput([]); setInput(""); return; }
            if (cmd === 'home') { window.scrollTo(0, 0); response = "> NAVIGATING TO ORIGIN..."; }

            setOutput(prev => [...prev, `> ${input}`, response]);
            setInput("");
            setTimeout(() => {
                if (inputRef.current) inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 10);
        }
    }

    return (
        <footer className="py-24 bg-[#020205] relative z-10 border-t border-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-12 gap-12 mb-16">
                    <div className="col-span-12 md:col-span-6">
                        <div className="relative">
                            <h2 className="text-[25vw] md:text-[12rem] font-black text-white/5 leading-none select-none -ml-4 truncate">
                                END
                            </h2>
                            <div className="absolute bottom-4 left-4 md:left-20">
                                <p className="font-mono text-white/50 max-w-sm">
                                    STEM CLUB. Dong Ha High School.<br />
                                    Constructing the future, one bit at a time.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        {/* CLI MOCKUP */}
                        <div className="bg-black border border-white/20 p-4 font-mono text-xs h-64 flex flex-col rounded-lg relative overflow-hidden group">
                            <div className="absolute top-2 right-2 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[8px]">x</div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className="text-white/30 mb-2 select-none border-b border-white/10 pb-2">TERMINAL // GUEST_SESSION</div>

                            <div ref={inputRef} className="flex-1 overflow-y-auto space-y-1 text-lime-400 mb-2 scrollbar-none">
                                {output.map((line, i) => <div key={i}>{line}</div>)}
                            </div>

                            <div className="flex items-center gap-2 text-white">
                                <span className="text-lime-400">root@stem:~#</span>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleCommand}
                                    className="bg-transparent outline-none flex-1 text-white placeholder-white/20 caret-lime-400"
                                    placeholder="Type 'help' for commands..."
                                />
                            </div>

                            <div className="absolute inset-0 pointer-events-none bg-grid-white opacity-5" />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-8 mb-12 border-t border-white/10 pt-12">
                    <div className="space-y-4">
                        <h3 className="font-mono text-lime-400 text-xs mb-6">DIRECTORY</h3>
                        {['Algorithm', 'Tracks', 'Archives', 'Apply'].map(link => (
                            <a key={link} href={`#${link.toLowerCase()}`} className="block text-white/60 hover:text-white transition-colors hover:pl-2">{link}</a>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-mono text-lime-400 text-xs mb-6">CONNECT</h3>
                        {['Facebook', 'Github', 'Discord', 'Email'].map(link => (
                            <a key={link} href="#" className="block text-white/60 hover:text-white transition-colors hover:pl-2">{link}</a>
                        ))}
                    </div>
                    <div className="space-y-4 col-span-2">
                        <h3 className="font-mono text-lime-400 text-xs mb-6">NEWSLETTER_SUB</h3>
                        <div className="flex border-b border-white/20 pb-2">
                            <input type="email" placeholder="ENTER_EMAIL_ADDRESS" className="bg-transparent flex-1 outline-none font-mono text-sm" />
                            <button className="text-lime-400 font-bold hover:text-white transition-colors">INIT</button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center font-mono text-xs text-white/30">
                    <div>
                        © 2026 STEM CLUB. SYSTEM STATUS: <span className="text-lime-400 animate-pulse">NORMAL</span>
                    </div>
                    <div className="mt-4 md:mt-0">
                        DESIGNED_BY // <span className="text-white">ANTIGRAVITY</span>
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

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <div className="bg-[#020205] text-slate-200 selection:bg-lime-400 selection:text-black min-h-screen">
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

import React, { useEffect, useRef, memo } from 'react';

const GameBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on bg
        let animationFrameId;
        let particles = [];
        let mouse = { x: 0, y: 0 };
        let resizeTimeout;

        const resizeCursor = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init(); // Re-init particles on resize to fill screen
        };

        // Debounced Resize
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCursor, 200);
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.color = Math.random() > 0.5 ? '#a855f7' : '#06b6d4'; // Purple & Cyan
                this.life = Math.random() * 100;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse repulsion (Squared distance optimization)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 10000) { // 100^2
                    const force = (10000 - distSq) / 10000;
                    this.x -= dx * force * 0.05;
                    this.y -= dy * force * 0.05;
                }

                if (this.size > 0.2) this.size -= 0.01;
                if (this.size <= 0.2) this.size = Math.random() * 2;

                // Wrap around
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, 6.28); // Math.PI * 2 approx
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            // Optimize count based on screen area (approx 1 per 8000px sq)
            const count = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            // Trail effect (Darken previous frame)
            ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Grid (Lightweight)
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
            ctx.lineWidth = 1;

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Random Glitch Lines (Optimized frequency)
            if (Math.random() > 0.98) { // Reduced freq slightly
                ctx.fillStyle = `rgba(0, 240, 255, ${Math.random() * 0.1})`;
                ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 3);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCursor(); // Initial size
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(resizeTimeout);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-[#050505]" />;
};

export default memo(GameBackground);

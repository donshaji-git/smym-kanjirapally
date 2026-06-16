/* ═══════════════════════════════════════════════════════
   PARTICLES.JS — Canvas 2D Particle System
   Features:
     1. Ambient background drifting particles (red, gold, white)
     2. Interactive mouse trail particles (red, gold)
     3. Smooth easing, no jittery line streaks
     4. Always moves behind page text (z-index: -1)
   ═══════════════════════════════════════════════════════ */

(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    let mouse = { x: -9999, y: -9999, active: false };

    // Set canvas size
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        // Spawn interactive trail particles when mouse moves
        for (let i = 0; i < 3; i++) {
            trailParticles.push(new TrailParticle(mouse.x, mouse.y));
        }
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
        mouse.active = false;
    });

    // ── Ambient Background Particle class ──
    class AmbientParticle {
        constructor(initial = false) {
            this.reset(initial);
        }

        reset(initial = false) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : H + 10;
            this.size = Math.random() * 1.5 + 0.6; // Small and smooth (0.6px to 2.1px)
            this.speedY = Math.random() * 0.4 + 0.15; // Slow drift upward
            this.speedX = (Math.random() - 0.5) * 0.15;
            this.angle = Math.random() * Math.PI * 2;
            this.freq = Math.random() * 0.01 + 0.005;
            this.amplitude = Math.random() * 0.3 + 0.1;

            // Colors: Soft white (60%), Golden Yellow (25%), Crimson Red (15%)
            const r = Math.random();
            if (r < 0.60) {
                // Soft white
                const alpha = (Math.random() * 0.3 + 0.15).toFixed(2);
                this.color = `rgba(255, 255, 255, ${alpha})`;
                this.glowColor = `rgba(255, 255, 255, ${alpha})`;
            } else if (r < 0.85) {
                // Liturgical gold / yellow glow
                const alpha = (Math.random() * 0.4 + 0.2).toFixed(2);
                this.color = `rgba(244, 197, 66, ${alpha})`;
                this.glowColor = `rgba(212, 175, 55, ${alpha})`;
            } else {
                // Warm crimson red
                const alpha = (Math.random() * 0.35 + 0.15).toFixed(2);
                this.color = `rgba(139, 0, 0, ${alpha})`;
                this.glowColor = `rgba(220, 38, 38, ${alpha})`;
            }
        }

        update(t) {
            this.y -= this.speedY;
            // Gentle side-to-side swing
            this.x += this.speedX + Math.sin(t * this.freq + this.angle) * this.amplitude;

            // Gravity pull towards mouse if mouse is nearby (smooth following)
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const pull = (150 - dist) / 150 * 0.2;
                    this.x += (dx / dist) * pull;
                    this.y += (dy / dist) * pull;
                }
            }

            // Reset when leaving screen
            if (this.y < -10 || this.x < -10 || this.x > W + 10) {
                this.reset(false);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // ── Interactive Trail Particle class ──
    class TrailParticle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 6;
            this.y = y + (Math.random() - 0.5) * 6;
            this.size = Math.random() * 0.8 + 0.4; // Narrow/small when fresh near mouse
            this.vx = (Math.random() - 0.5) * 2.2;
            this.vy = (Math.random() - 0.5) * 2.2 - 0.4; // Upward smoke drift
            this.alpha = 1.0;
            this.fadeSpeed = Math.random() * 0.015 + 0.012; // Slow fade for smooth dispersion
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.fadeSpeed;
            // Expand size like smoke as it moves away
            if (this.size < 20) {
                this.size += 0.32;
            }
            // Decelerate/friction (billowing smoke effect)
            this.vx *= 0.97;
            this.vy *= 0.97;
        }

        draw() {
            if (this.alpha <= 0) return;
            
            // Lerp color based on alpha:
            // alpha = 1.0 (Red) -> alpha = 0.65 (White) -> alpha = 0.0 (Yellow/Gold)
            let r, g, b;
            if (this.alpha > 0.65) {
                // Lerp between White (255,255,255) and Red (220,38,38)
                const ratio = (this.alpha - 0.65) / 0.35; // 0 to 1
                r = Math.round(255 + (220 - 255) * ratio);
                g = Math.round(255 + (38 - 255) * ratio);
                b = Math.round(255 + (38 - 255) * ratio);
            } else {
                // Lerp between Yellow (244,197,66) and White (255,255,255)
                const ratio = this.alpha / 0.65; // 0 to 1
                r = Math.round(244 + (255 - 244) * ratio);
                g = Math.round(197 + (255 - 197) * ratio);
                b = Math.round(66 + (255 - 66) * ratio);
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.7})`;
            
            // Blur for soft smoke glow
            ctx.shadowBlur = this.size * 1.5;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.4})`;
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize ambient background particles (3% higher density)
    const COUNT = Math.min(Math.floor((W * H) / 8700), 185);
    const ambientParticles = Array.from({ length: COUNT }, () => new AmbientParticle(true));
    const trailParticles = [];

    // Animation Loop
    let t = 0;
    function loop() {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        t++;

        // 1. Draw ambient particles
        ambientParticles.forEach(p => {
            p.update(t);
            p.draw();
        });

        // 2. Draw trail particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.update();
            if (p.alpha <= 0 || p.size <= 0.1) {
                trailParticles.splice(i, 1);
            } else {
                p.draw();
            }
        }
    }

    loop();
})();

/* ═══════════════════════════════════════════════════════
   SCRIPT.JS — Master Interaction Controller
   Handles:
     1. Scroll-based nav style
     2. Multi-layer parallax (watermark + orbs + content)
     3. Scroll-reveal (IntersectionObserver)
     4. 3D tilt on glass cards
     5. Magnetic CTA button
     6. Animated number counters
     7. Calendar tab switcher
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ══════════════════════════════════════════
       1. NAV — scroll style
    ══════════════════════════════════════════ */
    const nav = document.getElementById('nav');
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });


    /* ══════════════════════════════════════════
       1.5 CURSOR GLOW FOLLOW
    ══════════════════════════════════════════ */
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        window.addEventListener('mousemove', (e) => {
            cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            cursorGlow.style.opacity = '1';
        });
        window.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }


    /* ══════════════════════════════════════════
       1.8 GSAP PINNED HERO PARALLAX (Desktop)
    ══════════════════════════════════════════ */
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        // Hero pinning timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "+=120%", // Pin for 120% viewport scroll height
                scrub: 1,      // Smooth scrubbing
                pin: true,     // Pin the section
                anticipatePin: 1
            }
        });

        // 1. Center logo scales down from 2.8 to 1
        tl.fromTo("#hero-center-logo", 
            { scale: 2.8 }, 
            { scale: 1.0, duration: 1.5, ease: "power2.out" }
        );

        // 2. Left details slide in from down-left
        tl.fromTo("#hero-left-details", 
            { x: -180, y: 180, opacity: 0 }, 
            { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
            "<" // start simultaneously
        );

        // 3. Right details slide in from down-right
        tl.fromTo("#hero-right-details", 
            { x: 180, y: 180, opacity: 0 }, 
            { x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
            "<" // start simultaneously
        );

        // 4. Reveal titles mask-up during scroll
        tl.fromTo(".line-inner", 
            { y: "100%" }, 
            { y: "0%", duration: 1.0, ease: "power2.out" },
            "<0.3"
        );
    });

    mm.add("(max-width: 1023px)", () => {
        // Safe resets for mobile viewports
        gsap.set("#hero-center-logo", { scale: 1.0 });
        gsap.set("#hero-left-details", { x: 0, y: 0, opacity: 1 });
        gsap.set("#hero-right-details", { x: 0, y: 0, opacity: 1 });
        gsap.set(".line-inner", { y: "0%" });
    });


    /* ══════════════════════════════════════════
       2. PARALLAX — watermark + orbs
    ══════════════════════════════════════════ */
    const watermark = document.querySelector('.bg-watermark');
    const orbRed    = document.querySelector('.orb-crimson');
    const orbGold   = document.querySelector('.orb-gold');
    let mouse = { x: 0, y: 0 };
    let smooth = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        // Normalized -1 to 1
        mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Scroll parallax for watermark
    window.addEventListener('scroll', () => {
        if (watermark) {
            const y = window.scrollY * 0.18;
            watermark.style.transform = `translateX(-50%) translateY(${y}px)`;
        }
    }, { passive: true });

    // RAF loop for smooth mouse parallax on orbs
    function parallaxLoop() {
        smooth.x += (mouse.x - smooth.x) * 0.04;
        smooth.y += (mouse.y - smooth.y) * 0.04;

        if (orbRed) {
            orbRed.style.transform = `translate(${smooth.x * 30}px, ${smooth.y * 20}px)`;
        }
        if (orbGold) {
            orbGold.style.transform = `translate(${smooth.x * -25}px, ${smooth.y * -18}px)`;
        }

        requestAnimationFrame(parallaxLoop);
    }
    parallaxLoop();


    /* ══════════════════════════════════════════
       3. SCROLL REVEAL — IntersectionObserver
    ══════════════════════════════════════════ */
    const revealEls = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-scale');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger children if inside a grid
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 120);
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    // Stagger siblings within grids
    document.querySelectorAll('.identity-grid, .impact-grid').forEach(grid => {
        [...grid.children].forEach((child, i) => {
            child.dataset.delay = i;
        });
    });

    revealEls.forEach(el => revealObs.observe(el));


    /* ══════════════════════════════════════════
       4. 3D CARD TILT
    ══════════════════════════════════════════ */
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect  = card.getBoundingClientRect();
            const cx    = rect.left + rect.width  / 2;
            const cy    = rect.top  + rect.height / 2;
            const dx    = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
            const dy    = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
            const rotX  = -dy * 8;   // max 8 deg
            const rotY  =  dx * 8;

            card.style.transform    = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
            card.style.boxShadow    = `
                ${-dx * 12}px ${-dy * 12}px 40px rgba(15,23,42,0.1),
                0 20px 50px rgba(15,23,42,0.08)
            `;

            // Shift border "light" toward cursor
            card.style.borderColor = `rgba(255,255,255,${0.55 + Math.abs(dx) * 0.3})`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.borderColor = '';
        });
    });


    /* ══════════════════════════════════════════
       5. MAGNETIC CTA BUTTON
    ══════════════════════════════════════════ */
    const ctaBtn = document.getElementById('cta-magnetic');

    if (ctaBtn) {
        let raf;

        document.addEventListener('mousemove', (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = ctaBtn.getBoundingClientRect();
                const cx   = rect.left + rect.width  / 2;
                const cy   = rect.top  + rect.height / 2;
                const dx   = e.clientX - cx;
                const dy   = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const magnetRadius = 160;

                if (dist < magnetRadius) {
                    const pull = (magnetRadius - dist) / magnetRadius; // 0-1
                    const tx   = dx * pull * 0.35;
                    const ty   = dy * pull * 0.35;
                    ctaBtn.style.transform = `translate(${tx}px, ${ty}px)`;
                } else {
                    ctaBtn.style.transform = '';
                }
            });
        });
    }


    /* ══════════════════════════════════════════
       6. ANIMATED NUMBER COUNTERS
    ══════════════════════════════════════════ */
    const counters = document.querySelectorAll('[data-target]');

    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const dur    = 2200; // ms
            const start  = performance.now();

            function easeOutExpo(t) {
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            }

            function tick(now) {
                const elapsed  = now - start;
                const progress = Math.min(elapsed / dur, 1);
                const value    = Math.round(easeOutExpo(progress) * target);

                // Format large numbers
                if (value >= 1000000) {
                    el.textContent = (value / 1000000).toFixed(1) + 'M' + suffix;
                } else if (value >= 1000) {
                    el.textContent = (value / 1000).toFixed(0) + 'K' + suffix;
                } else {
                    el.textContent = value + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }

            requestAnimationFrame(tick);
            counterObs.unobserve(el);
        });
    }, { threshold: 0.4 });

    counters.forEach(el => counterObs.observe(el));


    /* ══════════════════════════════════════════
       7. CALENDAR TAB SWITCHER
    ══════════════════════════════════════════ */
    const tabs   = document.querySelectorAll('.cal-tab');
    const panels = document.querySelectorAll('.cal-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = parseInt(tab.dataset.month, 10);

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            panels.forEach(p => p.classList.remove('active'));
            const target = document.querySelector(`.cal-panel[data-panel="${idx}"]`);
            if (target) target.classList.add('active');
        });
    });


    /* ══════════════════════════════════════════
       8. HERO LOGO — gentle 3D hover tilt
    ══════════════════════════════════════════ */
    const logoWrap = document.getElementById('hero-video-wrapper');
    if (logoWrap) {
        logoWrap.addEventListener('mousemove', (e) => {
            const rect = logoWrap.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
            logoWrap.style.transform = `perspective(500px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.06) translateZ(0)`;
        });
        logoWrap.addEventListener('mouseleave', () => {
            logoWrap.style.transform = '';
        });
    }


    /* ══════════════════════════════════════════
       9. SMOOTH ACTIVE NAV LINKS
    ══════════════════════════════════════════ */
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('active-link'));
                const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (link) link.classList.add('active-link');
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObs.observe(s));


    /* ══════════════════════════════════════════
       10. MOBILE MENU TOGGLE
    ══════════════════════════════════════════ */
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }

});

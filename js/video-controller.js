/* ═══════════════════════════════════════════════════════
   VIDEO-CONTROLLER.JS
   Handles intro → loop seamless transition for all
   logo videos on the page.
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Hero logo ── */
    setupTransition('hero-intro', 'hero-loop');

    /* ── Nav logo ── */
    setupTransition('nav-intro', 'nav-loop');

    function setupTransition(introId, loopId) {
        const intro = document.getElementById(introId);
        const loop  = document.getElementById(loopId);
        if (!intro || !loop) return;

        // Preload loop video
        loop.load();

        // Auto-play intro
        const p = intro.play();
        if (p !== undefined) {
            p.catch(() => {
                // Autoplay blocked — silently switch to loop
                intro.classList.remove('active');
                loop.classList.add('active');
                loop.play().catch(() => {});
            });
        }

        // On intro end → crossfade to loop
        intro.addEventListener('ended', () => {
            intro.classList.remove('active');
            loop.classList.add('active');
            loop.play().catch(() => {});
        });
    }
});

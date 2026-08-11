/* ============================================================
   MAISON — main.js
   GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
   + Magnetic Effect + Custom Cursor + Awwwards-level FX
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   REGISTER PLUGINS
────────────────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, CustomEase);

// Custom silk ease
CustomEase.create('silk',    'M0,0 C0.25,0 0.1,1 1,1');
CustomEase.create('expo',    'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('elastic2','M0,0 C0.6,0 0.4,1.4 1,1');

/* ──────────────────────────────────────────────────────────────
   UTILITY — simple text splitter (no paid plugin required)
────────────────────────────────────────────────────────────── */
function splitLines(el) {
    const text  = el.innerText;
    const words = text.split(' ');
    el.innerHTML = words.map(w =>
        `<span class="word-wrap"><span class="word-inner">${w}</span></span>`
    ).join(' ');
    return el.querySelectorAll('.word-inner');
}

function splitChars(el) {
    const text  = el.innerText;
    el.innerHTML = [...text].map(ch =>
        ch === ' ' ? ' ' : `<span class="char-inner">${ch}</span>`
    ).join('');
    return el.querySelectorAll('.char-inner');
}

/* ──────────────────────────────────────────────────────────────
   1. PRELOADER
────────────────────────────────────────────────────────────── */
(function initPreloader() {
    const preloader  = document.getElementById('preloader');
    const preBar     = document.getElementById('preBar');
    const preCount   = document.getElementById('preCount');
    const preChars   = document.querySelectorAll('.pre-char');
    const preTagline = document.querySelector('.pre-tagline');

    if (!preloader) return;

    // Safe GSAP setup
    if (typeof gsap !== 'undefined') {
        gsap.set(preChars,  { y: 80, opacity: 0 });
        gsap.set(preTagline, { opacity: 0, y: 10 });

        const introTl = gsap.timeline();
        introTl
            .to(preChars, {
                y: 0, opacity: 1,
                stagger: 0.07,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.05
            })
            .to(preTagline, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3');
    }

    // Fast progress counter
    let progress = 0;
    let isHidden = false;

    const interval = setInterval(() => {
        const step = Math.random() * 18 + 8;
        progress = Math.min(100, progress + step);

        if (preCount) preCount.textContent = Math.round(progress);
        if (preBar) preBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            if (!isHidden) {
                isHidden = true;
                setTimeout(hidePreloader, 1000);
            }
        }
    }, 40);

    // Guaranteed fallback after 2.5 seconds maximum
    setTimeout(() => {
        if (!isHidden) {
            isHidden = true;
            clearInterval(interval);
            hidePreloader();
        }
    }, 2500);

    function hidePreloader() {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({
                onComplete: () => {
                    preloader.style.pointerEvents = 'none';
                    preloader.style.display = 'none';
                    document.body.classList.remove('loading');
                    initApp();
                }
            });

            tl.to(preloader, {
                opacity: 0,
                duration: 0.7,
                ease: 'power2.out'
            });
        } else {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            setTimeout(() => {
                preloader.style.display = 'none';
                initApp();
            }, 500);
        }
    }
})();

/* ──────────────────────────────────────────────────────────────
   2. MAIN APP — runs after preloader exits
────────────────────────────────────────────────────────────── */
function initApp() {

    /* ── 2A. LENIS SMOOTH SCROLL ── */
    const lenis = new Lenis({
        duration: 1.45,
        easing:   t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ── Navbar scroll state (lenis-aware) ── */
    lenis.on('scroll', ({ scroll }) => {
        document.getElementById('navbar').classList.toggle('scrolled', scroll > 60);
    });


    /* ──────────────────────────────────────────────────────────
       3. DUAL CURSOR (dot + ring)
    ────────────────────────────────────────────────────────── */
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    let mx = 0, my = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        gsap.to(dot,  { x: mx, y: my, duration: 0.1,  ease: 'power1.out' });
        gsap.to(ring, { x: mx, y: my, duration: 0.55, ease: 'power2.out' });
    });

    // Context states
    const hoverEls = document.querySelectorAll('a, button');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(dot,  { scale: 0.3, duration: 0.3 });
            gsap.to(ring, { scale: 2.2, borderColor: 'var(--rose)', duration: 0.35, ease: 'back.out(1.5)' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(dot,  { scale: 1, duration: 0.4, ease: 'elastic.out(1,.6)' });
            gsap.to(ring, { scale: 1, borderColor: 'rgba(26,25,23,.35)', duration: 0.4 });
        });
    });

    // Image / card — "VIEW" state
    const viewEls = document.querySelectorAll('.bento-item, .feat-img-wrap, .feat-img-sm, .about-img-primary, .about-img-secondary, .contact-visual, .philo-image');
    viewEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.setAttribute('data-label', 'VIEW');
            gsap.to(dot, { scale: 0, duration: 0.2 });
        });
        el.addEventListener('mouseleave', () => {
            ring.removeAttribute('data-label');
            gsap.to(dot, { scale: 1, duration: 0.3 });
        });
    });

    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));


    /* ──────────────────────────────────────────────────────────
       4. HERO ENTRANCE ANIMATIONS
    ────────────────────────────────────────────────────────── */
    const heroTl = gsap.timeline({ delay: 0.15 });

    heroTl
        .from('.navbar', {
            yPercent: -100, opacity: 0,
            duration: 1, ease: 'expo'
        })
        .from('.hero-eyebrow', {
            y: 30, opacity: 0,
            duration: 0.9, ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-title', {
            y: 90, opacity: 0, skewY: 4,
            duration: 1.3, ease: 'expo'
        }, '-=0.65')
        .from('.title-flourish-svg', {
            scaleX: 0, opacity: 0,
            transformOrigin: 'left center',
            duration: 0.85, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-body', {
            y: 22, opacity: 0,
            duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-scroll-wrap', {
            y: 20, opacity: 0,
            duration: 0.7, ease: 'power3.out'
        }, '-=0.45')
        .from('.hero-meta-item', {
            y: 16, opacity: 0,
            stagger: 0.1, duration: 0.65, ease: 'power3.out'
        }, '-=0.5')
        .from('.hero-badge', {
            scale: 0, opacity: 0,
            duration: 1, ease: 'elastic.out(1,0.6)'
        }, '-=0.9');


    /* ──────────────────────────────────────────────────────────
       5. SECTION TITLE WORD REVEAL (scrub-free snap reveal)
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.section-title').forEach(el => {
        // Skip elements that already contain spans (avoid re-splitting)
        if (el.querySelector('.word-inner')) return;

        // Save italic/em content
        const htmlContent = el.innerHTML;

        // Build wrapper spans around top-level text nodes only
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;

        // Wrap each text node word
        const lines = el.querySelectorAll('em, br');
        // Simpler: just clip the whole block
        gsap.set(el, { overflow: 'hidden' });

        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none'
            },
            clipPath: 'inset(0 0 100% 0)',
            y: 40,
            duration: 1.15,
            ease: 'expo'
        });
    });


    /* ──────────────────────────────────────────────────────────
       6. CLIP-PATH IMAGE REVEALS
    ────────────────────────────────────────────────────────── */
    const revealImages = [
        '.feat-img-inner',
        '.bento-img',
        '.about-img-primary',
        '.about-img-secondary',
        '.philo-image',
        '.contact-visual',
        '.statement-image'
    ].join(',');

    gsap.utils.toArray(revealImages).forEach((el, i) => {
        gsap.fromTo(el,
            { clipPath: 'inset(100% 0 0 0)' },
            {
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.4,
                ease: 'expo',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                }
            }
        );

        // Slight inner image scale-down as it reveals
        const img = el.querySelector('img');
        if (img) {
            gsap.fromTo(img,
                { scale: 1.18 },
                {
                    scale: 1,
                    duration: 1.6,
                    ease: 'expo',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });


    /* ──────────────────────────────────────────────────────────
       7. PARALLAX ON SCROLL (scrub)
    ────────────────────────────────────────────────────────── */
    gsap.utils.toArray('.philo-image img, .contact-visual img').forEach(img => {
        gsap.to(img, {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('section') || img.parentElement.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });

    // Hero parallax
    gsap.to('.hero-img', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // About secondary image parallax
    gsap.to('.about-img-secondary', {
        yPercent: -22,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8
        }
    });


    /* ──────────────────────────────────────────────────────────
       8. BENTO GRID — staggered pop-in
    ────────────────────────────────────────────────────────── */
    gsap.from('.bento-item', {
        scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 86%',
            toggleActions: 'play none none none'
        },
        y: 70, opacity: 0, scale: 0.97,
        duration: 0.95, ease: 'power3.out',
        stagger: { amount: 0.65, from: 'start' }
    });


    /* ──────────────────────────────────────────────────────────
       9. STATS COUNT-UP
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.a-num').forEach(el => {
        const raw    = el.textContent.trim();
        const num    = parseInt(raw.replace(/\D/g, ''), 10);
        const suffix = raw.replace(/[0-9]/g, '');

        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: num,
                    duration: 2.2,
                    ease: 'power2.out',
                    onUpdate() {
                        el.textContent = Math.round(obj.val) + suffix;
                    }
                });
            }
        });
    });


    /* ──────────────────────────────────────────────────────────
       10. GENERAL FADE-UP REVEALS
    ────────────────────────────────────────────────────────── */
    const fadeEls = [
        '.section-eyebrow',
        '.section-body',
        '.section-desc',
        '.featured-header',
        '.feat-text',
        '.philo-tags',
        '.philo-sub',
        '.about-stats',
        '.contact-links',
        '.footer-tagline',
        '.collection-header .section-body',
        '.text-link',
        '.pill-btn'
    ].join(',');

    gsap.utils.toArray(fadeEls).forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                toggleActions: 'play none none none'
            },
            y: 28, opacity: 0,
            duration: 0.85, ease: 'power3.out'
        });
    });

    // Philosophy quote special entrance
    gsap.from('.philo-quote', {
        scrollTrigger: { trigger: '.philo-quote', start: 'top 88%' },
        x: -40, opacity: 0,
        duration: 1.3, ease: 'expo'
    });

    // Contact headline slide from left
    gsap.from('.contact-headline', {
        scrollTrigger: { trigger: '.contact-headline', start: 'top 88%' },
        x: -60, opacity: 0,
        duration: 1.2, ease: 'expo'
    });

    gsap.from('.contact-link', {
        scrollTrigger: { trigger: '.contact-links', start: 'top 90%' },
        x: -30, opacity: 0,
        stagger: 0.1, duration: 0.8, ease: 'power3.out'
    });

    // Collection header
    gsap.from('.col-header-right .section-title', {
        scrollTrigger: { trigger: '.collection-header', start: 'top 88%' },
        x: 40, opacity: 0,
        duration: 1.1, ease: 'expo'
    });

    // Footer signature replay
    ScrollTrigger.create({
        trigger: '.footer',
        start: 'top 90%',
        once: true,
        onEnter: () => {
            document.querySelectorAll('.sig-path, .sig-dot').forEach(el => {
                el.style.animation = 'none';
                void el.offsetHeight;
                el.style.animation = '';
            });
        }
    });


    /* ──────────────────────────────────────────────────────────
       11. MAGNETIC EFFECT
    ────────────────────────────────────────────────────────── */
    const magnetEls = document.querySelectorAll('.pill-btn, .nav-cta, .back-top, .coral-btn');

    magnetEls.forEach(el => {
        const strength = parseFloat(el.dataset.magnet) || 0.38;

        el.addEventListener('mousemove', e => {
            const r  = el.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            const dx = (e.clientX - cx) * strength;
            const dy = (e.clientY - cy) * strength;

            gsap.to(el, {
                x: dx, y: dy,
                duration: 0.4, ease: 'power2.out'
            });

            // Also move inner text slightly for depth
            const inner = el.querySelector('span');
            if (inner) {
                gsap.to(inner, {
                    x: dx * 0.25, y: dy * 0.25,
                    duration: 0.4, ease: 'power2.out'
                });
            }
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0, y: 0,
                duration: 0.75, ease: 'elastic.out(1, 0.45)'
            });
            const inner = el.querySelector('span');
            if (inner) {
                gsap.to(inner, {
                    x: 0, y: 0,
                    duration: 0.6, ease: 'elastic.out(1, 0.5)'
                });
            }
        });
    });


    /* ──────────────────────────────────────────────────────────
       12. NAVBAR BRAND LETTER HOVER WAVE
    ────────────────────────────────────────────────────────── */
    const brand = document.querySelector('.nav-brand');
    if (brand && !brand.querySelector('.brand-char')) {
        const letters = brand.textContent.split('');
        brand.innerHTML = letters.map(l => `<span class="brand-char">${l}</span>`).join('');
    }

    brand?.addEventListener('mouseenter', () => {
        gsap.fromTo('.brand-char',
            { y: 0 },
            { y: -5, stagger: 0.04, duration: 0.28, ease: 'power2.out',
              yoyo: true, repeat: 1 }
        );
    });


    /* ──────────────────────────────────────────────────────────
       13. MARQUEE — speed up & direction reverse on scroll
    ────────────────────────────────────────────────────────── */
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        lenis.on('scroll', ({ direction, velocity }) => {
            if (direction === -1) {
                marqueeTrack.style.animationDirection = 'reverse';
            } else {
                marqueeTrack.style.animationDirection = 'normal';
            }
            const speed = Math.abs(velocity) / 100;
            const dur   = Math.max(6, 32 - speed * 18);
            marqueeTrack.style.animationDuration = dur + 's';
        });

        // Pause on hover
        document.querySelector('.marquee-band')?.addEventListener('mouseenter', () => {
            marqueeTrack.style.animationPlayState = 'paused';
        });
        document.querySelector('.marquee-band')?.addEventListener('mouseleave', () => {
            marqueeTrack.style.animationPlayState = 'running';
        });
    }


    /* ──────────────────────────────────────────────────────────
       14. HERO SECTION TITLE SKEW ON SCROLL
    ────────────────────────────────────────────────────────── */
    let lastScrollY = 0;
    let ticking = false;

    lenis.on('scroll', ({ scroll, velocity }) => {
        const skew = Math.max(-4, Math.min(4, velocity * 0.03));
        gsap.to('.hero-title', {
            skewY: skew,
            duration: 0.8,
            ease: 'power3.out',
            overwrite: 'auto'
        });
    });


    /* ──────────────────────────────────────────────────────────
       15. FEATURED SECTION — horizontal shift on scroll
    ────────────────────────────────────────────────────────── */
    gsap.from('.feat-img-wrap', {
        scrollTrigger: {
            trigger: '.featured-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        x: -60, opacity: 0,
        duration: 1.3, ease: 'expo'
    });

    gsap.from('.feat-right', {
        scrollTrigger: {
            trigger: '.featured-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        x: 60, opacity: 0,
        duration: 1.3, ease: 'expo'
    });


    /* ──────────────────────────────────────────────────────────
       16. PHILOSOPHY SPLIT — image + content counter-scroll
    ────────────────────────────────────────────────────────── */
    gsap.to('.philo-image img', {
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
            trigger: '.philosophy-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });


    /* ──────────────────────────────────────────────────────────
       17. SCROLL-TRIGGERED LINE DRAW (ornament SVG replay)
    ────────────────────────────────────────────────────────── */
    ScrollTrigger.create({
        trigger: '.section-ornament',
        start: 'top 90%',
        once: true,
        onEnter: () => {
            ['.orn-line-left', '.orn-line-right', '.orn-diamond', '.orn-cross'].forEach(sel => {
                const el = document.querySelector(sel);
                if (!el) return;
                el.style.animation = 'none';
                void el.offsetHeight;
                el.style.animation = '';
            });
        }
    });


    /* ──────────────────────────────────────────────────────────
       19. SMOOTH & SUBTLE 3D CARD TILT ON MOUSE MOVE (No image distortion)
    ────────────────────────────────────────────────────────── */
    const tiltCards = document.querySelectorAll('.bento-item, .feat-img-wrap, .about-img-primary');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Ultra-subtle tilt (max 4.5 degrees) for zero image distortion
            const rotateX = (-y / (rect.height / 2)) * 4.5;
            const rotateY = (x / (rect.width / 2)) * 4.5;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1200,
                ease: 'power2.out',
                duration: 0.5
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                ease: 'elastic.out(1, 0.6)',
                duration: 1.1
            });
        });
    });

    /* ──────────────────────────────────────────────────────────
       20. HORIZONTAL TEXT PARALLAX SCRUB ON SCROLL (Awwwards Style)
    ────────────────────────────────────────────────────────── */

    /* ──────────────────────────────────────────────────────────
       21. HORIZONTAL TEXT PARALLAX SCRUB ON SCROLL (Awwwards Style)
    ────────────────────────────────────────────────────────── */
    gsap.to('.hero-title', {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });

    gsap.to('.col-header-right .section-title', {
        xPercent: 12,
        ease: 'none',
        scrollTrigger: {
            trigger: '.collection-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    /* ──────────────────────────────────────────────────────────
       23. AWWWARDS COOL GSAP FX 1: IMAGE SPOTLIGHT ZOOM & REVEAL
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll('.bento-item, .feat-img-wrap').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;
        
        item.addEventListener('mouseenter', () => {
            gsap.to(img, {
                scale: 1.08,
                filter: 'brightness(1.08) contrast(1.04)',
                duration: 0.6,
                ease: 'power3.out'
            });
            gsap.to(item.querySelectorAll('.b-title, .b-num, .b-tag'), {
                y: -4,
                stagger: 0.04,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(img, {
                scale: 1,
                filter: 'brightness(1) contrast(1)',
                duration: 0.8,
                ease: 'power3.out'
            });
            gsap.to(item.querySelectorAll('.b-title, .b-num, .b-tag'), {
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    /* ──────────────────────────────────────────────────────────
       24. AWWWARDS COOL GSAP FX 2: VELOCITY-BASED TEXT SKEW
    ────────────────────────────────────────────────────────── */
    let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter(".section-title, .hero-title", "skewY", "deg"),
        clamp = gsap.utils.clamp(-6, 6);

    ScrollTrigger.create({
        onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -300);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, {
                    skew: 0,
                    duration: 0.8,
                    ease: "power3",
                    overwrite: true,
                    onUpdate: () => skewSetter(proxy.skew)
                });
            }
        }
    });

    /* ──────────────────────────────────────────────────────────
       25. AWWWARDS COOL GSAP FX 3: FLOATING BADGE & ORNAMENT SCROLL ROTATION
    ────────────────────────────────────────────────────────── */
    gsap.to('.hero-badge', {
        rotate: 360,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });

    gsap.to('.orn-diamond', {
        rotate: 180,
        transformOrigin: 'center center',
        ease: 'none',
        scrollTrigger: {
            trigger: '.section-ornament',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
        }
    });

    /* ──────────────────────────────────────────────────────────
       26. AWWWARDS COOL GSAP FX 4: STAGGERED FOOTER BRAND CHARACTER WAVE
    ────────────────────────────────────────────────────────── */
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand && !footerBrand.querySelector('.f-char')) {
        const text = footerBrand.textContent;
        footerBrand.innerHTML = [...text].map(c => `<span class="f-char" style="display:inline-block;">${c}</span>`).join('');
        
        ScrollTrigger.create({
            trigger: '.footer',
            start: 'top 85%',
            onEnter: () => {
                gsap.fromTo('.f-char', 
                    { y: 40, opacity: 0, rotateX: -90 },
                    { y: 0, opacity: 1, rotateX: 0, stagger: 0.05, duration: 0.9, ease: 'back.out(1.7)' }
                );
            }
        });
    }

    /* ──────────────────────────────────────────────────────────
       27. SVG SCROLL WAVE LINE DRAW (Scroll-Triggered)
    ────────────────────────────────────────────────────────── */
    const waveLine = document.querySelector('.wave-line-stroke');
    if (waveLine) {
        gsap.to(waveLine, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.scroll-wave-wrap',
                start: 'top 85%',
                end: 'bottom 40%',
                scrub: 1
            }
        });
    }

} // end initApp



gsap.registerPlugin(ScrollTrigger);

let locoScroll;
let isMobile = false;
let isTablet = false;

function detectDevice() {
    isMobile = window.innerWidth <= 768;
    isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    if (isMobile) {
        document.body.classList.add('is-mobile');
        document.body.classList.remove('is-tablet', 'is-desktop');
    } else if (isTablet) {
        document.body.classList.add('is-tablet');
        document.body.classList.remove('is-mobile', 'is-desktop');
    } else {
        document.body.classList.add('is-desktop');
        document.body.classList.remove('is-mobile', 'is-tablet');
    }
}

detectDevice();

function initNoiseTexture() {
    const canvas = document.getElementById('noise-canvas');
    if (!canvas) return;
    
    // Disable on low-end mobile devices
    if (isMobile && navigator.hardwareConcurrency < 4) {
        canvas.style.display = 'none';
        return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newImageData = ctx.createImageData(canvas.width, canvas.height);
            const newData = newImageData.data;
            for (let i = 0; i < newData.length; i += 4) {
                const noise = Math.random() * 255;
                newData[i] = noise;
                newData[i + 1] = noise;
                newData[i + 2] = noise;
                newData[i + 3] = 255;
            }
            ctx.putImageData(newImageData, 0, 0);
        }, 300);
    });
}

initNoiseTexture();

function initCursor() {
    // Disable on mobile and tablet
    if (isMobile || isTablet) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorCircle = document.querySelector('.cursor-circle');
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorCircle) cursorCircle.style.display = 'none';
        return;
    }
    
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorCircle = document.querySelector('.cursor-circle');
    
    if (!cursorDot || !cursorCircle) return;
    
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let circleX = 0, circleY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;
        circleX += (mouseX - circleX) * 0.15;
        circleY += (mouseY - circleY) * 0.15;
        
        cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
        cursorCircle.style.transform = `translate(${circleX - 20}px, ${circleY - 20}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .work-item-fixed, .principle-minimal, input, textarea');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-grow');
        });
        
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-grow');
        });
    });
}

initCursor();

function initLoader() {
    const loader = document.querySelector('.loader');
    const letters = document.querySelectorAll('.letter');
    const loaderCount = document.querySelector('.loader-count');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!loader) return;
    
    // Faster animation on mobile
    const animDuration = isMobile ? 0.5 : 0.8;
    const animDelay = isMobile ? 0.1 : 0.2;
    
    // Animate letters in sequence
    letters.forEach((letter, i) => {
        gsap.to(letter, {
            opacity: 1,
            scale: 1,
            duration: animDuration,
            delay: i * animDelay,
            ease: 'back.out(1.7)'
        });
    });
    
    gsap.to(loaderCount, {
        opacity: 1,
        duration: 0.4,
        delay: isMobile ? 0.4 : 0.8
    });
    
    let count = 0;
    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 8) + 3;
        if (count >= 100) {
            count = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        loader.style.display = 'none';
                        initLocomotiveScroll();
                    }
                });
            }, isMobile ? 300 : 600);
        }
        
        loaderCount.textContent = count;
        progressBar.style.width = count + '%';
    }, isMobile ? 30 : 40);
}

initLoader();

function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle-minimal');
    const menuClose = document.querySelector('.menu-close');
    const fullscreenMenu = document.querySelector('.fullscreen-menu');
    const menuItems = document.querySelectorAll('.menu-item');
    const themeToggle = document.querySelector('.theme-toggle-minimal');
    
    function preventScroll(e) {
        e.preventDefault();
    }
    
    // Menu Toggle
    if (menuToggle && fullscreenMenu) {
        menuToggle.addEventListener('click', () => {
            fullscreenMenu.classList.add('active');
            menuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // iOS scroll lock
            if (isMobile) {
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.addEventListener('touchmove', preventScroll, { passive: false });
            }
        });
    }
    
    // Menu Close
    function closeMenu() {
        if (fullscreenMenu && menuToggle) {
            fullscreenMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // iOS scroll unlock
            if (isMobile) {
                document.body.style.position = '';
                document.body.style.width = '';
                document.removeEventListener('touchmove', preventScroll);
            }
        }
    }
    
    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }
    
    // Close on menu item click
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            
            // If internal link
            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeMenu();
                
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target && locoScroll) {
                        locoScroll.scrollTo(target, {
                            duration: isMobile ? 800 : 1200,
                            offset: isMobile ? -60 : 0
                        });
                    } else if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            } else {
                // External link, just close menu
                setTimeout(closeMenu, 200);
            }
        });
    });
    
    // Close menu on swipe down (mobile)
    if (isMobile && fullscreenMenu) {
        let touchStartY = 0;
        
        fullscreenMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        fullscreenMenu.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchEndY - touchStartY;
            
            // Swipe down to close
            if (diff > 100) {
                closeMenu();
            }
        });
    }
    
    // Theme Toggle
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Haptic feedback on mobile
            if (isMobile && navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    }
    
    // Local Time Update
    updateLocalTime();
    setInterval(updateLocalTime, 1000);
}

function updateLocalTime() {
    const timeElement = document.getElementById('localTime');
    if (!timeElement) return;
    
    const now = new Date();
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    timeElement.textContent = now.toLocaleTimeString('en-US', options);
}

initNavigation();

function initLocomotiveScroll() {
    const scrollWrapper = document.querySelector('#scroll-wrapper');
    if (!scrollWrapper) return;
    
    // Mobile-specific configuration
    const scrollConfig = {
        el: scrollWrapper,
        smooth: true,
        multiplier: isMobile ? 1.2 : 0.8,
        lerp: isMobile ? 0.1 : 0.06,
        smartphone: {
            smooth: true,
            multiplier: 1.2,
            lerp: 0.1
        },
        tablet: {
            smooth: true,
            multiplier: 1.0,
            lerp: 0.08
        }
    };
    
    locoScroll = new LocomotiveScroll(scrollConfig);
    
    locoScroll.on('scroll', ScrollTrigger.update);
    
    ScrollTrigger.scrollerProxy('#scroll-wrapper', {
        scrollTop(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: scrollWrapper.style.transform ? 'transform' : 'fixed'
    });
    
    ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
    ScrollTrigger.refresh();
    
    initAnimations();
    initBackToTop();
    
}

function initAnimations() {
    // Reduced animation duration for mobile
    const animDuration = isMobile ? 0.6 : 1;
    const animStagger = isMobile ? 0.08 : 0.15;
    
    // ===== HERO =====
    gsap.to('.hero-label', {
        opacity: 1,
        y: 0,
        duration: animDuration,
        delay: 0.2
    });
    
    gsap.to('.word', {
        y: 0,
        opacity: 1,
        duration: isMobile ? 0.8 : 1.2,
        stagger: animStagger,
        ease: 'power4.out',
        delay: 0.4
    });
    
    gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: animDuration,
        delay: isMobile ? 0.8 : 1.3
    });
    
    gsap.to('.hero-cta', {
        opacity: 1,
        y: 0,
        duration: animDuration,
        delay: isMobile ? 1.0 : 1.5
    });
    
    // Lighter shape animations on mobile
    gsap.to('.shape', {
        opacity: isMobile ? 0.3 : 1,
        duration: animDuration,
        stagger: 0.2,
        delay: 0.8
    });
    
    // Disable rotation on mobile (performance)
    if (!isMobile) {
        gsap.to('.shape-circle', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });
    }
    
    gsap.to('.scroll-indicator', {
        opacity: 1,
        duration: animDuration,
        delay: isMobile ? 1.2 : 2
    });
    
    initStatsCounter();
    initWorksAnimations();
    initProjectFilters();
    initTestimonialsSlider();
    initExpertiseMinimalAnimations();
    initContactFormAnimations();
    initPhilosophyMinimalAnimations();
    
    // Contact section
    ScrollTrigger.create({
        trigger: '.contact-headline',
        scroller: '#scroll-wrapper',
        start: 'top 75%',
        onEnter: () => {
            gsap.fromTo('.contact-headline',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: animDuration, ease: 'power3.out' }
            );
            
            gsap.fromTo('.contact-description',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: animDuration, delay: 0.15 }
            );
            
            gsap.fromTo('.contact-email',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: animDuration, delay: 0.3 }
            );
        }
    });
    
    ScrollTrigger.create({
        trigger: '.contact-socials',
        scroller: '#scroll-wrapper',
        start: 'top 80%',
        onEnter: () => {
            gsap.fromTo('.social-item',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: animDuration,
                    stagger: 0.08,
                    ease: 'power3.out'
                }
            );
        }
    });
}

function initStatsCounter() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.6 : 0.8,
                    delay: i * 0.08,
                    ease: 'power3.out'
                });
                
                const numberEl = item.querySelector('.stat-number');
                const target = parseInt(numberEl.getAttribute('data-count'));
                animateNumber(numberEl, 0, target, isMobile ? 1500 : 2000);
            }
        });
    });
}

function animateNumber(element, start, end, duration) {
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(animation);
}

function initWorksAnimations() {
    const workItems = document.querySelectorAll('.work-item-fixed');
    
    workItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            scroller: '#scroll-wrapper',
            start: 'top 85%',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.6 : 1,
                    delay: i * 0.08,
                    ease: 'power3.out'
                });
            }
        });
    });
}

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item-fixed');
    
    if (filterBtns.length === 0) return;
    
    filterBtns.forEach(btn => {
        // Add touch feedback
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', () => {
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Haptic feedback
            if (isMobile && navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            workItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category.includes(filter)) {
                    gsap.to(item, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        display: 'block',
                        onStart: () => {
                            item.classList.remove('hidden');
                        }
                    });
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        onComplete: () => {
                            item.classList.add('hidden');
                        }
                    });
                }
            });
            
            // Update Locomotive Scroll
            if (locoScroll) {
                setTimeout(() => locoScroll.update(), 500);
            }
        });
    });
}

function initTestimonialsSlider() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    
    if (testimonials.length === 0) return;
    
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function showTestimonial(index) {
        testimonials.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    showTestimonial(0);
    
    // Dot navigation
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = i;
            showTestimonial(currentIndex);
        });
    });
    
    // Touch swipe support for mobile
    if (isMobile) {
        const container = document.querySelector('.testimonials-slider');
        if (container) {
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
        }
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swipe left - next
                currentIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(currentIndex);
            }
            if (touchEndX > touchStartX + 50) {
                // Swipe right - previous
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentIndex);
            }
        }
    }
    
    // Auto-rotate (longer interval on mobile to save battery)
    const rotateInterval = isMobile ? 7000 : 5000;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, rotateInterval);
}

function initExpertiseMinimalAnimations() {
    ScrollTrigger.create({
        trigger: '.expertise-statement',
        scroller: '#scroll-wrapper',
        start: 'top 70%',
        onEnter: () => {
            gsap.to('.statement-text', {
                opacity: 1,
                y: 0,
                duration: isMobile ? 0.6 : 1,
                ease: 'power3.out'
            });
            
            gsap.to('.statement-large', {
                opacity: 1,
                duration: isMobile ? 0.8 : 1.5,
                delay: 0.2,
                ease: 'power3.out'
            });
        }
    });
    
    const skillSections = document.querySelectorAll('.skill-section-minimal');
    skillSections.forEach((section, i) => {
        ScrollTrigger.create({
            trigger: section,
            scroller: '#scroll-wrapper',
            start: 'top 75%',
            onEnter: () => {
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.5 : 0.8,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
                
                const dots = section.querySelectorAll('.skill-dots .dot.filled');
                gsap.fromTo(dots,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: 0.3,
                        stagger: 0.04,
                        delay: 0.2 + (i * 0.1),
                        ease: 'back.out(1.7)'
                    }
                );
            }
        });
    });
}

function initContactFormAnimations() {
    ScrollTrigger.create({
        trigger: '.contact-form-wrapper',
        scroller: '#scroll-wrapper',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.contact-form-wrapper', {
                opacity: 1,
                y: 0,
                duration: isMobile ? 0.6 : 1,
                ease: 'power3.out'
            });
            
            gsap.fromTo('.form-group',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.5 : 0.8,
                    stagger: 0.08,
                    delay: 0.2,
                    ease: 'power3.out'
                }
            );
            
            gsap.fromTo('.form-submit',
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: 0.6,
                    ease: 'back.out(1.7)'
                }
            );
        }
    });
}

function initPhilosophyMinimalAnimations() {
    ScrollTrigger.create({
        trigger: '.philosophy-quote',
        scroller: '#scroll-wrapper',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.philosophy-quote', {
                opacity: 1,
                x: 0,
                duration: isMobile ? 0.6 : 1,
                ease: 'power3.out'
            });
        }
    });
    
    const principles = document.querySelectorAll('.principle-minimal');
    principles.forEach((principle, i) => {
        ScrollTrigger.create({
            trigger: principle,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(principle, {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.4 : 0.6,
                    delay: i * 0.06,
                    ease: 'power3.out'
                });
            }
        });
    });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('.form-submit');
        const originalText = submitBtn.querySelector('span').textContent;
        
        submitBtn.querySelector('span').textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Haptic feedback
        if (isMobile && navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
        }
        
        setTimeout(() => {
            submitBtn.querySelector('span').textContent = 'Sent!';
            setTimeout(() => {
                submitBtn.querySelector('span').textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1000);
    });
}

function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;
    
    if (locoScroll) {
        locoScroll.on('scroll', (args) => {
            if (args.scroll.y > (isMobile ? 300 : 500)) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }
    
    backToTop.addEventListener('click', () => {
        // Haptic feedback
        if (isMobile && navigator.vibrate) {
            navigator.vibrate(10);
        }
        
        if (locoScroll) {
            locoScroll.scrollTo(0, {
                duration: isMobile ? 800 : 1200,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = this.getAttribute('href');
        
        if (target === '#') return;
        
        e.preventDefault();
        const targetEl = document.querySelector(target);
        
        if (targetEl && locoScroll) {
            locoScroll.scrollTo(targetEl, {
                offset: isMobile ? -60 : 0,
                duration: isMobile ? 800 : 1200,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        }
    });
});

let resizeTimer;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
        detectDevice();
        
        if (locoScroll) {
            locoScroll.update();
        }
        ScrollTrigger.refresh();
    }, 300);
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (locoScroll) {
            locoScroll.update();
        }
        ScrollTrigger.refresh();
    }, 100);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (locoScroll) locoScroll.stop();
    } else {
        if (locoScroll) locoScroll.start();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const fullscreenMenu = document.querySelector('.fullscreen-menu');
        if (fullscreenMenu && fullscreenMenu.classList.contains('active')) {
            const menuClose = document.querySelector('.menu-close');
            if (menuClose) menuClose.click();
        }
    }
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(10);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
            })
            .catch(error => {
            });
    });
}

window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    }
});
// ==========================================
// ABOUT PAGE SPECIFIC SCRIPTS
// ==========================================

gsap.registerPlugin(ScrollTrigger);

let locoScroll;

// ==========================================
// INITIALIZE ON PAGE LOAD (NO LOADER)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize basic features immediately
    initNoiseTexture();
    initCursor();
    initThemeToggle();
    initNavigation();
    
    // Initialize Locomotive Scroll after a short delay
    setTimeout(() => {
        initLocomotiveScroll();
    }, 100);
    
});

// ==========================================
// ORGANIC TEXTURE
// ==========================================
function initNoiseTexture() {
    const canvas = document.getElementById('noise-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
    
    window.addEventListener('resize', () => {
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
    });
}

// ==========================================
// CURSOR
// ==========================================
function initCursor() {
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
    const interactiveElements = document.querySelectorAll('a, button, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-grow');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-grow');
        });
    });
}

// ==========================================
// THEME TOGGLE
// ==========================================
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        gsap.to(themeToggle, {
            rotation: 360,
            duration: 0.5,
            ease: 'power2.out'
        });
    });
}

// ==========================================
// NAVIGATION - REDESIGNED
// ==========================================

function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle-minimal');
    const menuClose = document.querySelector('.menu-close');
    const fullscreenMenu = document.querySelector('.fullscreen-menu');
    const menuItems = document.querySelectorAll('.menu-item');
    const themeToggle = document.querySelector('.theme-toggle-minimal');
    
    // Menu Toggle
    if (menuToggle && fullscreenMenu) {
        menuToggle.addEventListener('click', () => {
            fullscreenMenu.classList.add('active');
            menuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Menu Close
    if (menuClose && fullscreenMenu) {
        menuClose.addEventListener('click', () => {
            fullscreenMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close on menu item click
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            
            // If internal link
            if (href.startsWith('#')) {
                e.preventDefault();
                fullscreenMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    const target = document.querySelector(href);
                    if (target && locoScroll) {
                        locoScroll.scrollTo(target);
                    } else if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            }
        });
    });
    
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

// Initialize
initNavigation();


// ==========================================
// LOCOMOTIVE SCROLL
// ==========================================
function initLocomotiveScroll() {
    const scrollWrapper = document.querySelector('#scroll-wrapper');
    if (!scrollWrapper) {
        console.error('Scroll wrapper not found!');
        return;
    }
    
    locoScroll = new LocomotiveScroll({
        el: scrollWrapper,
        smooth: true,
        multiplier: 0.8,
        lerp: 0.06,
        smartphone: { smooth: true },
        tablet: { smooth: true }
    });
    
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
    
    // Initialize animations after Locomotive is ready
    initAnimations();
    initBackToTop();
}

// ==========================================
// ANIMATIONS
// ==========================================
function initAnimations() {
    
    // Animate Experience Items
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
            }
        });
    });
    
    // Animate Education Items
    const educationItems = document.querySelectorAll('.education-item');
    educationItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: i * 0.15,
                    ease: 'power3.out'
                });
            }
        });
    });
    
    // Animate Certification Items
    const certItems = document.querySelectorAll('.cert-item');
    certItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: 'back.out(1.7)'
                });
            }
        });
    });
    
    // Animate Skills Categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, i) => {
        ScrollTrigger.create({
            trigger: category,
            scroller: '#scroll-wrapper',
            start: 'top 75%',
            onEnter: () => {
                gsap.to(category, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
                
                const tags = category.querySelectorAll('.skill-tags span');
                gsap.fromTo(tags,
                    { opacity: 0, scale: 0.8 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        stagger: 0.03,
                        delay: 0.3 + (i * 0.1),
                        ease: 'back.out(1.7)'
                    }
                );
            }
        });
    });
    
    // Animate Interest Cards
    const interestCards = document.querySelectorAll('.interest-card');
    interestCards.forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            scroller: '#scroll-wrapper',
            start: 'top 80%',
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
            }
        });
    });
}

// ==========================================
// BACK TO TOP BUTTON
// ==========================================
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;
    
    if (locoScroll) {
        locoScroll.on('scroll', (args) => {
            if (args.scroll.y > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }
    
    backToTop.addEventListener('click', () => {
        if (locoScroll) {
            locoScroll.scrollTo('top');
        }
    });
}

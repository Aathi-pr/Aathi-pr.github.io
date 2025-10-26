// ==================== GSAP REGISTRATION ====================
gsap.registerPlugin(ScrollTrigger);

// ==================== LENIS SMOOTH SCROLL ====================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ==================== DETECT DEVICE TYPE ====================
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isTouchDevice) {
    document.body.classList.add('desktop');
}

// ==================== CUSTOM CURSOR ====================
if (!isTouchDevice) {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0
        });
    });
    
    gsap.ticker.add(() => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        gsap.set(cursorFollower, {
            x: followerX,
            y: followerY
        });
    });
    
    document.querySelectorAll('a, button, .service-card, .gallery-image').forEach(el => {
        el.addEventListener('mouseenter', () => cursorFollower.classList.add('expand'));
        el.addEventListener('mouseleave', () => cursorFollower.classList.remove('expand'));
    });
}

// ==================== LOADER ====================
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    
    gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        onComplete: () => {
            loader.classList.add('hidden');
            initScrollAnimations();
            initGalleryLightbox();
        }
    });
});

// ==================== MAKE SERVICE CARDS CLICKABLE ====================
document.querySelectorAll('.service-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        if (e.target.closest('.service-link')) return;
        
        const link = card.querySelector('.service-link');
        if (link) {
            window.location.href = link.href;
        }
    });
});

// ==================== GALLERY LIGHTBOX - COMPLETE FIX FOR FULL IMAGE ====================
function initGalleryLightbox() {
    const galleryImages = document.querySelectorAll('.gallery-image');
    
    console.log('Found', galleryImages.length, 'gallery images');
    
    if (galleryImages.length === 0) {
        console.error('No gallery images found!');
        return;
    }
    
    // Create array of lightbox elements
    const lightboxElements = [];
    
    galleryImages.forEach((item, index) => {
        const img = item.querySelector('img');
        
        if (!img) {
            console.warn('No img found in gallery-image', index);
            return;
        }
        
        let imageSrc = img.getAttribute('src') || img.src;
        
        // Get original full-size image URL
        let fullSizeUrl = imageSrc;
        if (imageSrc.includes('unsplash.com')) {
            // Use original size without any parameters
            fullSizeUrl = imageSrc.split('?')[0];
        }
        
        // Add to lightbox elements with proper sizing
        lightboxElements.push({
            href: fullSizeUrl,
            type: 'image',
            width: 'auto',
            height: 'auto'
        });
        
        // Store index for click handling
        item.dataset.index = index;
        item.style.cursor = 'pointer';
        
        console.log('Added image', index, fullSizeUrl);
    });
    
    // Initialize GLightbox with proper configuration
    const lightbox = GLightbox({
        elements: lightboxElements,
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        openEffect: 'zoom',
        closeEffect: 'zoom',
        closeButton: true,
        closeOnOutsideClick: true,
        zoomable: true,
        draggable: true,
        preload: true,
        width: 'auto',
        height: 'auto',
        svg: {
            close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            next: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
            prev: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
        }
    });
    
    // Add click handlers to gallery images
    galleryImages.forEach((item) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.dataset.index);
            console.log('Opening lightbox at index', index);
            lightbox.openAt(index);
        });
    });
    
    // Back button support
    let isLightboxOpen = false;
    
    lightbox.on('open', () => {
        isLightboxOpen = true;
        history.pushState({ lightboxOpen: true }, '');
        document.body.style.overflow = 'hidden';
        console.log('Lightbox opened');
    });
    
    lightbox.on('close', () => {
        isLightboxOpen = false;
        document.body.style.overflow = '';
        console.log('Lightbox closed');
    });
    
    window.addEventListener('popstate', () => {
        if (isLightboxOpen) {
            lightbox.close();
        }
    });
    
    console.log('GLightbox initialized with', lightboxElements.length, 'images');
}

// ==================== FULLSCREEN MENU ====================
const menuToggle = document.getElementById('menuToggle');
const fullscreenMenu = document.getElementById('fullscreenMenu');
const menuClose = document.getElementById('menuClose');
const menuLinks = document.querySelectorAll('.menu-link');
const menuOverlay1 = document.querySelector('.menu-overlay-1');
const menuOverlay2 = document.querySelector('.menu-overlay-2');
const menuContact = document.querySelector('.menu-contact');
const menuSocial = document.querySelector('.menu-social');
const menuFooter = document.querySelector('.menu-footer');

let isMenuOpen = false;

function openMenu() {
    isMenuOpen = true;
    fullscreenMenu.classList.add('active');
    document.body.classList.add('menu-open');
    menuToggle.classList.add('active');
    
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    
    const tl = gsap.timeline();
    
    tl.to(menuOverlay1, { y: '0%', duration: 0.6, ease: 'power4.inOut' })
      .to(menuOverlay2, { y: '0%', duration: 0.6, ease: 'power4.inOut' }, '-=0.4')
      .to(menuClose, { opacity: 1, duration: 0.3 }, '-=0.2')
      .to(menuLinks, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.3')
      .to([menuContact, menuSocial, menuFooter], { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.5');
}

function closeMenu(callback) {
    if (!isMenuOpen) return;
    
    isMenuOpen = false;
    
    const tl = gsap.timeline({
        onComplete: () => {
            fullscreenMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            menuToggle.classList.remove('active');
            
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            
            gsap.set([menuLinks, menuContact, menuSocial, menuFooter], { y: 50, opacity: 0 });
            gsap.set(menuClose, { opacity: 0 });
            gsap.set([menuOverlay1, menuOverlay2], { y: '-100%' });
            
            if (callback) callback();
        }
    });
    
    tl.to([menuContact, menuSocial, menuFooter], { y: 30, opacity: 0, duration: 0.3, stagger: 0.05 })
      .to(menuLinks, { y: -50, opacity: 0, duration: 0.4, stagger: 0.05 }, '-=0.2')
      .to(menuClose, { opacity: 0, duration: 0.2 }, '-=0.3')
      .to(menuOverlay2, { y: '-100%', duration: 0.6, ease: 'power4.inOut' }, '-=0.1')
      .to(menuOverlay1, { y: '-100%', duration: 0.6, ease: 'power4.inOut' }, '-=0.4');
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        if (isMenuOpen) closeMenu();
        else openMenu();
    });
}

if (menuClose) {
    menuClose.addEventListener('click', () => closeMenu());
}

// Menu navigation with scroll
menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const href = this.getAttribute('href');
        
        console.log('Clicked href:', href);
        
        closeMenu(() => {
            if (href && href.startsWith('#') && href !== '#') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                console.log('Target element:', targetElement);
                
                if (targetElement) {
                    setTimeout(() => {
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 100);
                } else {
                    console.error('Element not found:', targetId);
                }
            }
        });
    });
});

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) closeMenu();
});

// Click outside
if (fullscreenMenu) {
    fullscreenMenu.addEventListener('click', (e) => {
        if (e.target === fullscreenMenu) closeMenu();
    });
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
    // Hero
    gsap.to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: 0.3,
        ease: 'power3.out'
    });
    
    gsap.to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out'
    });
    
    gsap.to('.hero-scroll', {
        opacity: 0.8,
        duration: 1,
        delay: 1,
        ease: 'power2.out'
    });
    
    // Services
    gsap.to('.services-header h2', {
    x: 0,
    opacity: 1,
    duration: 1,
    scrollTrigger: {
        trigger: '.services-section',
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1
    }
});

const servicesWrapper = document.querySelector('.services-wrapper');
const servicesTrack = document.getElementById('servicesTrack');
const serviceCards = document.querySelectorAll('.service-card');

if (servicesWrapper && servicesTrack) {
    // Horizontal scrolling for both desktop AND mobile
    gsap.to(servicesTrack, {
        x: () => -(servicesTrack.scrollWidth - window.innerWidth + (window.innerWidth > 768 ? 160 : 40)),
        ease: 'none',
        scrollTrigger: {
            trigger: servicesWrapper,
            start: 'top top',
            end: () => `+=${servicesTrack.scrollWidth - window.innerWidth + (window.innerWidth > 768 ? 160 : 40)}`,
            scrub: 1,
            pin: '.services-sticky',
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });
    
    // Card animations
    serviceCards.forEach((card, index) => {
        if (window.innerWidth > 768) {
            gsap.to(card, {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                scrollTrigger: {
                    trigger: servicesWrapper,
                    start: `top+=${index * 200} center`,
                    end: `top+=${index * 200 + 300} center`,
                    scrub: 1
                }
            });
        } else {
            // Simpler animation for mobile
            gsap.fromTo(card, 
                {  scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    scrollTrigger: {
                        trigger: servicesWrapper,
                        start: () => `top+=${index * (servicesTrack.scrollWidth / serviceCards.length)} top`,
                        end: () => `top+=${(index + 1) * (servicesTrack.scrollWidth / serviceCards.length)} top`,
                        scrub: 1
                    }
                }
            );
        }
    });
}
    
    // Stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        gsap.to(item, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15,
            scrollTrigger: {
                trigger: '.stats-section',
                start: 'top 80%'
            }
        });
    });
    
    // Counter animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: 'power1.out',
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.innerHTML = Math.ceil(counter.innerHTML);
                    }
                });
            },
            once: true
        });
    });
    
    // Approach
    gsap.to('.approach-header h2', {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: '.approach-section',
            start: 'top 70%'
        }
    });
    
    gsap.to('.approach-header p', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
            trigger: '.approach-section',
            start: 'top 70%'
        }
    });
    
    const approachSteps = document.querySelectorAll('.approach-step');
    approachSteps.forEach((step, index) => {
        gsap.to(step, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15,
            scrollTrigger: {
                trigger: '.approach-steps',
                start: 'top 70%'
            }
        });
    });
    
    // Gallery
    if (window.innerWidth > 1024) {
        const galleryWrapper = document.querySelector('.gallery-wrapper');
        const galleryScrollContainer = document.querySelector('.gallery-scroll-container');
        const galleryGrid = document.querySelector('.gallery-grid');
        const galleryRight = document.querySelector('.gallery-right');
        
        if (galleryWrapper && galleryScrollContainer && galleryGrid && galleryRight) {
            const scrollDistance = galleryGrid.scrollHeight - galleryRight.offsetHeight;
            galleryWrapper.style.height = `${scrollDistance + window.innerHeight}px`;
            
            gsap.to(galleryScrollContainer, {
                y: -scrollDistance,
                ease: 'none',
                scrollTrigger: {
                    trigger: galleryWrapper,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                    pin: '.gallery-section',
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        gsap.to('.gallery-left-content h2', {
            x: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
        
        gsap.to('.gallery-left-content p', {
            x: 0,
            opacity: 1,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
        
        gsap.to('.gallery-cta', {
            x: 0,
            opacity: 1,
            duration: 1,
            delay: 0.4,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
    } else {
        gsap.to('.gallery-left-content h2', {
            x: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
        
        gsap.to('.gallery-left-content p', {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
        
        gsap.to('.gallery-cta', {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.4,
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top 70%'
            }
        });
        
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryImages.forEach((img) => {
            gsap.fromTo(img, 
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: img,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }
    
    // Testimonial
    gsap.to('.testimonial-quote', {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: '.testimonial-section',
            start: 'top 70%'
        }
    });
    
    gsap.to('.testimonial-author', {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.3,
        scrollTrigger: {
            trigger: '.testimonial-section',
            start: 'top 70%'
        }
    });
    
    // Contact
    gsap.to('.contact-left h2', {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 70%'
        }
    });
    
    gsap.to('.contact-left p', {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 70%'
        }
    });
    
    const contactDetails = document.querySelectorAll('.contact-detail');
    contactDetails.forEach((detail, index) => {
        gsap.to(detail, {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.4 + (index * 0.1),
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 70%'
            }
        });
    });
    
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        gsap.to(group, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 70%'
            }
        });
    });
}

// ==================== FORM HANDLING ====================
const contactForm = document.getElementById('contactForm');
const formSuccess = document.querySelector('.form-success');

if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        
        let isValid = true;
        
        [name, email, message].forEach(field => {
            if (field) {
                const formGroup = field.closest('.form-group');
                if (!field.value.trim()) {
                    formGroup.classList.add('error');
                    isValid = false;
                } else {
                    formGroup.classList.remove('error');
                }
            }
        });
        
        if (email && email.value && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            email.closest('.form-group').classList.add('error');
            isValid = false;
        }
        
        if (isValid) {
            contactForm.style.display = 'none';
            formSuccess.classList.add('visible');
            
            gsap.from(formSuccess, {
                opacity: 0,
                y: 20,
                duration: 0.6
            });
        }
    });
}

// ==================== SMOOTH SCROLL FOR ALL ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]:not(.menu-link)').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href && href !== '#') {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==================== RESPONSIVE HANDLING ====================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
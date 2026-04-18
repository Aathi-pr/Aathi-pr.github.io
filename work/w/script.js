// ============================================
// GSAP & ScrollTrigger Registration
// ============================================
gsap.registerPlugin(ScrollTrigger);

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
gsap.config({ 
    nullTargetWarn: false,
    trialWarn: false
});

// ============================================
// CUSTOM CURSOR
// ============================================
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    
    requestAnimationFrame(animateCursor);
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

animateCursor();

// Cursor hover effect
const interactiveElements = document.querySelectorAll('a, button, .gallery-item, .faq-question, .event-card, .event-btn');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorFollower, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorFollower, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
});

// ============================================
// COUNTDOWN TIMER
// ============================================
function startCountdown() {
    const weddingDate = new Date('December 15, 2025 11:30:00').getTime();
    
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '000';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(3, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    };
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

startCountdown();

// ============================================
// FAQ ACCORDION
// ============================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        if (!isActive) {
            item.classList.add('active');
            
            const answer = item.querySelector('.faq-answer');
            gsap.from(answer, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    });
});

// ============================================
// FULLSCREEN NAVIGATION
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const fullscreenNav = document.querySelector('.fullscreen-nav');
const navItems = document.querySelectorAll('.nav-item');
let navOpen = false;

function openNav() {
    navOpen = true;
    navToggle.classList.add('active');
    fullscreenNav.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (window.locomotiveScroll) {
        window.locomotiveScroll.stop();
    }
}

function closeNav() {
    navOpen = false;
    navToggle.classList.remove('active');
    fullscreenNav.classList.remove('active');
    document.body.style.overflow = '';
    
    if (window.locomotiveScroll) {
        window.locomotiveScroll.start();
    }
}

navToggle.addEventListener('click', () => {
    if (navOpen) {
        closeNav();
    } else {
        openNav();
    }
});

navItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        
        closeNav();
        
        setTimeout(() => {
            if (window.locomotiveScroll) {
                const target = document.querySelector(targetId);
                if (target) {
                    window.locomotiveScroll.scrollTo(target, {
                        duration: 1500,
                        easing: [0.25, 0.00, 0.35, 1.00]
                    });
                }
            }
        }, 800);
    });
});

const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = ctaButton.getAttribute('href');
        
        if (window.locomotiveScroll) {
            const target = document.querySelector(targetId);
            if (target) {
                window.locomotiveScroll.scrollTo(target, {
                    duration: 1500,
                    easing: [0.25, 0.00, 0.35, 1.00]
                });
            }
        }
    });
}

// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    
    gsap.to('.preloader-content', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        delay: 2,
        ease: 'power2.inOut',
        onComplete: () => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                initLocomotiveScroll();
            }, 200);
        }
    });
});

// ============================================
// LOCOMOTIVE SCROLL INITIALIZATION (OPTIMIZED)
// ============================================
function initLocomotiveScroll() {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    
    const scroll = new LocomotiveScroll({
        el: scrollContainer,
        smooth: true,
        multiplier: 0.9,
        smoothMobile: false,
        smartphone: {
            smooth: false
        },
        tablet: {
            smooth: true,
            multiplier: 0.8
        },
        lerp: 0.1,
        class: 'is-inview',
        scrollFromAnywhere: false,
        repeat: false,
        touchMultiplier: 2,
        firefoxMultiplier: 50,
        resetNativeScroll: true
    });

    window.locomotiveScroll = scroll;

    const isMobile = window.innerWidth < 768;

    ScrollTrigger.scrollerProxy(scrollContainer, {
        scrollTop(value) {
            if (arguments.length) {
                scroll.scrollTo(value, {duration: 0, disableLerp: true});
            }
            return scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: isMobile ? 'fixed' : 'transform'
    });

    scroll.on('scroll', ScrollTrigger.update);

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================
    ScrollTrigger.create({
        trigger: scrollContainer,
        scroller: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            gsap.to('.scroll-progress', {
                scaleX: self.progress,
                duration: 0.1,
                ease: 'none',
                overwrite: true
            });
        }
    });

    // ============================================
    // HERO SECTION ANIMATIONS (MINIMAL)
    // ============================================
    
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' }});
    
    heroTimeline
        .from('.name-first', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: 0.2
        })
        .from('.name-separator', {
            opacity: 0,
            scale: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.4')
        .from('.name-second', {
            opacity: 0,
            y: 50,
            duration: 0.8
        }, '-=0.6')
        .from('.hero-minimal-date', {
            opacity: 0,
            y: 20,
            duration: 0.6
        }, '-=0.4')
        .from('.countdown-item', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1
        }, '-=0.3')
        .from('.cta-button', {
            opacity: 0,
            y: 20,
            duration: 0.6
        }, '-=0.3');

    gsap.to('.hero-floral-accent', {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: 'none'
    });

    // ============================================
    // QUOTE SECTION (MINIMAL)
    // ============================================
    gsap.from('.quote-icon', {
        opacity: 0,
        scale: 0.5,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.quote-section',
            scroller: scrollContainer,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.quote-text', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.quote-section',
            scroller: scrollContainer,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.quote-author', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        scrollTrigger: {
            trigger: '.quote-author',
            scroller: scrollContainer,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    // ============================================
    // STORY SECTION (ENHANCED)
    // ============================================
    
    gsap.to('.story-section .parallax-bg', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
            trigger: '.story-section',
            scroller: scrollContainer,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    const storyTitle = document.querySelector('.story-section .section-title');
    if (storyTitle) {
        gsap.from(storyTitle, {
            opacity: 0,
            y: 80,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: storyTitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    gsap.utils.toArray('.story-image-wrapper').forEach((wrapper, index) => {
        const image = wrapper.querySelector('img');
        
        gsap.fromTo(wrapper,
            {
                clipPath: 'inset(100% 0% 0% 0%)',
                opacity: 0
            },
            {
            	clipPath: 'inset(0% 0% 0% 0%)',
                opacity: 1,
                ease: 'power2.out',
                duration: 1.8,
                scrollTrigger: {
                    trigger: wrapper,
                    scroller: scrollContainer,
                    start: 'top 70%',
                    end: 'top 35%',
                    scrub: 1
                }
            }
        );

        gsap.fromTo(image,
            { scale: 1.3 },
            {
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: wrapper,
                    scroller: scrollContainer,
                    start: 'top 70%',
                    end: 'top 35%',
                    scrub: 1
                }
            }
        );
    });

    gsap.utils.toArray('.story-content').forEach((content, index) => {
        gsap.fromTo(content,
            {
                opacity: 0,
                x: index % 2 === 0 ? -100 : 100,
                y: 50
            },
                        {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: content,
                    scroller: scrollContainer,
                    start: 'top 75%',
                    end: 'top 40%',
                    scrub: 0.8
                }
            }
        );
    });

    // ============================================
    // EVENTS SECTION (MINIMAL)
    // ============================================
    
    const eventsTitle = document.querySelector('.events-minimal-section .section-title');
    if (eventsTitle) {
        gsap.from(eventsTitle, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: eventsTitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    const eventsSubtitle = document.querySelector('.events-minimal-section .section-subtitle');
    if (eventsSubtitle) {
        gsap.from(eventsSubtitle, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            scrollTrigger: {
                trigger: eventsSubtitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    gsap.utils.toArray('.event-card').forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                scroller: scrollContainer,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });
        
        gsap.from(card.querySelector('.event-icon-large'), {
            scale: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: card,
                scroller: scrollContainer,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.from('.venue-contact-info', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
            trigger: '.venue-contact-info',
            scroller: scrollContainer,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // ============================================
    // FAQ SECTION (MINIMAL)
    // ============================================
    
    const faqTitle = document.querySelector('.faq-section .section-title');
    if (faqTitle) {
        gsap.from(faqTitle, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: faqTitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    gsap.utils.toArray('.faq-item').forEach((item) => {
        gsap.from(item, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            scrollTrigger: {
                trigger: item,
                scroller: scrollContainer,
                start: 'top 82%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // ============================================
    // GALLERY SECTION (FIXED - NO JITTER)
    // ============================================
    
    const galleryTitle = document.querySelector('.gallery-section .section-title');
    if (galleryTitle) {
        gsap.from(galleryTitle, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: galleryTitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // Simple fade in without scrub to prevent jitter
    gsap.utils.toArray('.gallery-item').forEach((item, index) => {
        gsap.from(item, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: (index % 3) * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: item,
                scroller: scrollContainer,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // ============================================
    // RSVP SECTION (MINIMAL)
    // ============================================
    
    gsap.to('.parallax-floral', {
        rotation: 90,
        x: 100,
        y: -100,
        scale: 1.2,
        opacity: 0.06,
        ease: 'none',
        scrollTrigger: {
            trigger: '.rsvp-section',
            scroller: scrollContainer,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        }
    });

    const rsvpTitle = document.querySelector('.rsvp-section .section-title');
    if (rsvpTitle) {
        gsap.from(rsvpTitle, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: rsvpTitle,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    gsap.from('.rsvp-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        scrollTrigger: {
            trigger: '.rsvp-subtitle',
            scroller: scrollContainer,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.utils.toArray('.form-field').forEach((field, index) => {
        gsap.from(field, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: index * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.rsvp-form-custom',
                scroller: scrollContainer,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.from('.submit-btn-custom', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.submit-btn-custom',
            scroller: scrollContainer,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
        }
    });

    // ============================================
    // FOOTER
    // ============================================
    gsap.from('.footer-content', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.footer',
            scroller: scrollContainer,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // ============================================
    // REFRESH SEQUENCE (OPTIMIZED)
    // ============================================
    
    ScrollTrigger.addEventListener('refresh', () => scroll.update());
    
    const refreshTimes = [100, 500, 1000];
    refreshTimes.forEach(time => {
        setTimeout(() => {
            scroll.update();
            ScrollTrigger.refresh();
        }, time);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            scroll.update();
            ScrollTrigger.refresh();
        }, 300);
    });

    if (document.fonts) {
        document.fonts.ready.then(() => {
            scroll.update();
            ScrollTrigger.refresh();
        });
    }

    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    images.forEach(img => {
        if (img.complete) {
            loadedImages++;
        } else {
            img.addEventListener('load', () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    setTimeout(() => {
                        scroll.update();
                        ScrollTrigger.refresh();
                    }, 300);
                }
            });
        }
    });
}

// ============================================
// CUSTOM FORM CONTROLS
// ============================================

const numberMinus = document.querySelector('.number-minus');
const numberPlus = document.querySelector('.number-plus');
const numberInput = document.querySelector('.number-input');

if (numberMinus && numberPlus && numberInput) {
    numberMinus.addEventListener('click', () => {
        let currentValue = parseInt(numberInput.value);
        let minValue = parseInt(numberInput.getAttribute('min'));
        
        if (currentValue > minValue) {
            numberInput.value = currentValue - 1;
            gsap.from(numberInput, {
                scale: 1.2,
                duration: 0.2,
                ease: 'back.out(1.7)'
            });
        }
    });

    numberPlus.addEventListener('click', () => {
        let currentValue = parseInt(numberInput.value);
        let maxValue = parseInt(numberInput.getAttribute('max'));
        
        if (currentValue < maxValue) {
            numberInput.value = currentValue + 1;
            gsap.from(numberInput, {
                scale: 1.2,
                duration: 0.2,
                ease: 'back.out(1.7)'
            });
        }
    });
}

// ============================================
// RSVP FORM SUBMISSION
// ============================================
const rsvpForm = document.querySelector('.rsvp-form-custom');

if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.submit-btn-custom');
        const originalText = submitBtn.innerHTML;
        
        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                submitBtn.innerHTML = '<span class="submit-text">SENT!</span> <i class="fas fa-check submit-icon"></i>';
                
                gsap.to(submitBtn, {
                    backgroundColor: 'var(--earth-sage)',
                    borderColor: 'var(--earth-sage)',
                    duration: 0.3
                });
                
                const successMessage = document.createElement('p');
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your RSVP! We look forward to celebrating with you.';
                successMessage.style.cssText = `
                    text-align: center;
                    color: var(--earth-sage);
                    margin-top: 2rem;
                    font-size: 1.1rem;
                    font-weight: 400;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                `;
                rsvpForm.appendChild(successMessage);
                
                gsap.from(successMessage, {
                    opacity: 0,
                    y: 20,
                    duration: 0.4,
                    ease: 'power2.out'
                });
                
                setTimeout(() => {
                    gsap.to(submitBtn, {
                        backgroundColor: 'transparent',
                        borderColor: 'var(--earth-brown)',
                        duration: 0.3,
                        onComplete: () => {
                            submitBtn.innerHTML = originalText;
                            rsvpForm.reset();
                            if (successMessage) {
                                gsap.to(successMessage, {
                                    opacity: 0,
                                    y: -10,
                                    duration: 0.3,
                                    onComplete: () => successMessage.remove()
                                });
                            }
                        }
                    });
                }, 3000);
            }
        });
    });
}

// ============================================
// LIGHTBOX FUNCTIONALITY
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentImageIndex = 0;
const images = Array.from(galleryItems).map(item => item.querySelector('img').src);

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentImageIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    lightbox.classList.add('active');
    lightboxImage.src = images[currentImageIndex];
    document.body.style.overflow = 'hidden';
    
    if (window.locomotiveScroll) {
        window.locomotiveScroll.stop();
    }
    
    gsap.fromTo(lightbox,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    gsap.from(lightboxImage, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
    });
}

function closeLightbox() {
    gsap.to(lightboxImage, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
    });
    
    gsap.to(lightbox, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            
            if (window.locomotiveScroll) {
                window.locomotiveScroll.start();
            }
        }
    });
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

lightboxPrev.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    
    gsap.to(lightboxImage, {
        x: -100,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            lightboxImage.src = images[currentImageIndex];
            gsap.fromTo(lightboxImage,
                { x: 100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
            );
        }
    });
});

lightboxNext.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    
    gsap.to(lightboxImage, {
        x: 100,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            lightboxImage.src = images[currentImageIndex];
            gsap.fromTo(lightboxImage,
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
            );
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    }
    
    if (fullscreenNav.classList.contains('active') && e.key === 'Escape') {
        closeNav();
    }
});

// ============================================
// CONSOLE LOG
// ============================================
console.log('%c🎉 Indian Wedding RSVP Website', 'color: #9CAF88; font-size: 20px; font-weight: bold;');
console.log('%c💍 Priya & Arjun - December 15, 2025', 'color: #C8A882; font-size: 14px;');
console.log('%c✨ Portfolio Demo Project', 'color: #D4937D; font-size: 12px;');
console.log('%c🚀 Optimized Animations + No Jitter', 'color: #7D6E5C; font-size: 12px;');

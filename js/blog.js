gsap.registerPlugin(ScrollTrigger);

let locoScroll;

window.addEventListener('load', () => {
    console.log('Window loaded, initializing...');
    
    initNoiseTexture();
    initCursor();
    initThemeToggle();
    initNavigation();
    
    setTimeout(() => {
        initLocomotiveScroll();
    }, 200);
});

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
}

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
    
    const interactiveElements = document.querySelectorAll('a, button, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
    });
}

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
    });
}

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

function initLocomotiveScroll() {
    const scrollWrapper = document.querySelector('#scroll-wrapper');
    
    try {
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
        
        // Initialize everything else
        initBlogFilters();
        initAnimations();
        initLoadMore();
        initNewsletter();
        initBackToTop();
        
        console.log('All features initialized!');
        
    } catch (error) {
        console.error('Error initializing Locomotive:', error);
    }
}

function initBlogFilters() {
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    console.log('Filter buttons:', filterBtns.length);
    console.log('Blog cards:', blogCards.length);
    
    if (filterBtns.length === 0 || blogCards.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            console.log('Filtering by:', category);
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            blogCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category') || '';
                
                if (category === 'all' || cardCategories.includes(category)) {
                    card.style.display = 'block';
                    card.classList.remove('hidden');
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'power3.out'
                    });
                } else {
                    gsap.to(card, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        onComplete: () => {
                            card.style.display = 'none';
                            card.classList.add('hidden');
                        }
                    });
                }
            });
            
            if (locoScroll) {
                setTimeout(() => locoScroll.update(), 500);
            }
        });
    });
}

function initAnimations() {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            scroller: '#scroll-wrapper',
            start: 'top 85%',
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: (i % 3) * 0.1,
                    ease: 'power3.out'
                });
            }
        });
    });
}

function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            loadMoreBtn.textContent = 'No More Articles';
            setTimeout(() => {
                gsap.to(loadMoreBtn, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => loadMoreBtn.style.display = 'none'
                });
            }, 1000);
        }, 1500);
    });
}

function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        const btn = form.querySelector('.newsletter-btn');
        const originalText = btn.textContent;
        
        btn.textContent = 'Subscribing...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = 'Subscribed!';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                form.reset();
            }, 2000);
        }, 1000);
    });
}

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

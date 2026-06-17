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
initNoiseTexture();

function initLoader() {
    const loader = document.querySelector('.loader');
    const letters = document.querySelectorAll('.letter');
    const loaderCount = document.querySelector('.loader-count');
    const progressBar = document.querySelector('.progress-bar');

    if (!loader) return;

    const animDuration = isMobile ? 0.5 : 0.8;
    const animDelay = isMobile ? 0.1 : 0.2;

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

    if (menuToggle && fullscreenMenu) {
        menuToggle.addEventListener('click', () => {
            fullscreenMenu.classList.add('active');
            menuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (isMobile) {
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.addEventListener('touchmove', preventScroll, { passive: false });
            }
        });
    }

    function closeMenu() {
        if (fullscreenMenu && menuToggle) {
            fullscreenMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';

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

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');

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
                setTimeout(closeMenu, 200);
            }
        });
    });

    if (isMobile && fullscreenMenu) {
        let touchStartY = 0;

        fullscreenMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        fullscreenMenu.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchEndY - touchStartY;

            if (diff > 100) {
                closeMenu();
            }
        });
    }


    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            if (isMobile && navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    }

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
    const animDuration = isMobile ? 0.6 : 1;
    const animStagger = isMobile ? 0.08 : 0.15;

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

    gsap.to('.shape', {
        opacity: isMobile ? 0.3 : 1,
        duration: animDuration,
        stagger: 0.2,
        delay: 0.8
    });

    if (!isMobile) {
        gsap.to('.shape-circle', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });
    }

    const _scrollIndicatorEl = document.querySelector('.scroll-indicator');
    if (_scrollIndicatorEl) {
        gsap.to(_scrollIndicatorEl, {
            opacity: 1,
            duration: animDuration,
            delay: isMobile ? 1.2 : 2
        });
    }

    initStatsCounter();
    initWorksAnimations();
    initTestimonialsSlider();
    initExpertiseMinimalAnimations();
    initContactFormAnimations();

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
    const preview = document.querySelector('.work-preview');
    if (!preview || workItems.length === 0) return;

    const previewImg = preview.querySelector('img');
    const previewTitle = preview.querySelector('.preview-title');
    const previewStack = preview.querySelector('.preview-stack');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // On mobile devices, avoid eager-loading large preview images.
    // The markup uses `data-src` for the preview image; set `src` only for desktop.
    if (previewImg) {
        const dataSrc = previewImg.getAttribute('data-src');
        if (isMobile) {
            // ensure no src attribute so the browser won't fetch it automatically
            previewImg.removeAttribute('src');
            if (dataSrc) previewImg.setAttribute('data-src', dataSrc);
        } else {
            // desktop: load the initial preview image if provided via data-src
            if (dataSrc && !previewImg.getAttribute('src')) {
                previewImg.setAttribute('src', dataSrc);
            }
        }
    }

    const _originalPreviewParent = preview.parentNode;
    const _originalPreviewNext = preview.nextSibling;

    // Entry animation
    gsap.fromTo(workItems,
        { autoAlpha: 0, y: prefersReducedMotion ? 0 : 34 },
        {
            autoAlpha: 1,
            y: 0,
            duration: prefersReducedMotion ? 0.01 : (isMobile ? 0.55 : 0.85),
            stagger: prefersReducedMotion ? 0 : 0.055,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.works-archive',
                scroller: '#scroll-wrapper',
                start: 'top 82%',
                once: true
            }
        }
    );

    if (isMobile || isTablet) {
        let activeItem = null;

        function closeMobileRows(exceptItem) {
            workItems.forEach(row => {
                if (row !== exceptItem) {
                    row.classList.remove('is-open');
                }
            });
        }

        function hideMobilePreview(callback) {
            gsap.to(preview, {
                opacity: 0,
                scale: 0.98,
                y: 8,
                duration: prefersReducedMotion ? 0.01 : 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    preview.classList.remove('is-visible');
                    preview.setAttribute('aria-hidden', 'true');
                    if (preview.parentNode !== _originalPreviewParent) {
                        try {
                            if (_originalPreviewNext && _originalPreviewNext.parentNode === _originalPreviewParent) {
                                _originalPreviewParent.insertBefore(preview, _originalPreviewNext);
                            } else {
                                _originalPreviewParent.appendChild(preview);
                            }
                        } catch (e) { }
                    }
                    if (typeof callback === 'function') callback();
                }
            });
        }

        workItems.forEach(item => {
            const desc = item.querySelector('.work-desc-fixed');
            const stack = item.querySelector('.work-stack');
            const arrow = item.querySelector('.work-arrow');

            item.addEventListener('click', (event) => {
                event.preventDefault();
                const alreadyOpen = item.classList.contains('is-open');

                if (alreadyOpen) {
                    item.classList.remove('is-open');

                    // Collapse item height and elements using GSAP
                    gsap.to(item, {
                        paddingTop: '1.15rem',
                        paddingBottom: '1.15rem',
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                    if (desc) gsap.to(desc, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.3 });
                    if (stack) gsap.to(stack, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.3 });
                    if (arrow) gsap.to(arrow, { opacity: 0, x: -10, y: 10, duration: 0.3 });

                    closeMobileRows();
                    hideMobilePreview(() => {
                        activeItem = null;
                        if (locoScroll) {
                            window.setTimeout(() => locoScroll.update(), 120);
                        }
                    });
                    return;
                }

                closeMobileRows(item);
                item.classList.add('is-open');
                activeItem = item;

                // Animate other items to collapsed height
                workItems.forEach(row => {
                    if (row !== item) {
                        gsap.to(row, {
                            paddingTop: '1.15rem',
                            paddingBottom: '1.15rem',
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                        const rDesc = row.querySelector('.work-desc-fixed');
                        const rStack = row.querySelector('.work-stack');
                        const rArrow = row.querySelector('.work-arrow');
                        if (rDesc) gsap.to(rDesc, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.3 });
                        if (rStack) gsap.to(rStack, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.3 });
                        if (rArrow) gsap.to(rArrow, { opacity: 0, x: -10, y: 10, duration: 0.3 });
                    }
                });

                // Expand this item
                gsap.to(item, {
                    paddingTop: '1.5rem',
                    paddingBottom: '1.5rem',
                    duration: 0.4,
                    ease: 'power2.out'
                });
                if (desc) gsap.to(desc, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 });
                if (stack) gsap.to(stack, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 });
                if (arrow) gsap.to(arrow, { opacity: 1, x: 0, y: 0, duration: 0.4 });

                const src = item.getAttribute('data-preview');
                const titleEl = item.querySelector('.work-title-fixed');
                const stackEl = item.querySelector('.work-stack');
                const titleText = titleEl ? titleEl.textContent.trim() : '';
                const stackText = stackEl ? stackEl.textContent.trim() : '';

                if (previewImg && src) {
                    previewImg.setAttribute('src', src);
                    previewImg.setAttribute('alt', titleText ? (titleText + ' — preview') : 'work preview');
                }
                if (previewTitle) previewTitle.textContent = titleText;
                if (previewStack) previewStack.textContent = stackText;

                item.parentNode.insertBefore(preview, item.nextSibling);
                preview.classList.add('is-visible');
                preview.removeAttribute('aria-hidden');

                gsap.fromTo(preview,
                    { opacity: 0, scale: 0.98, y: 8 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: prefersReducedMotion ? 0.01 : 0.4,
                        ease: 'power3.out',
                        onComplete: () => {
                            if (locoScroll) {
                                window.setTimeout(() => locoScroll.update(), 120);
                            }
                        }
                    }
                );

                if (navigator.vibrate) {
                    navigator.vibrate(8);
                }
            });
        });

        preview.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileRows();
            hideMobilePreview(() => {
                activeItem = null;
                if (locoScroll) {
                    window.setTimeout(() => locoScroll.update(), 120);
                }
            });
        });

        return;
    }

    // Desktop GSAP Pointer tracking & Hover Effects
    document.body.appendChild(preview);

    gsap.set(preview, {
        position: 'fixed',
        top: 0,
        left: 0,
        x: window.innerWidth * 0.66,
        y: window.innerHeight * 0.5,
        autoAlpha: 0,
        scale: 0.94,
        filter: 'blur(12px)',
        transformOrigin: '0 0'
    });

    const previewGap = 24;
    const previewMotion = {
        duration: prefersReducedMotion ? 0.01 : 0.45,
        ease: 'power2.out'
    };

    const movePreviewX = gsap.quickTo(preview, 'x', previewMotion);
    const movePreviewY = gsap.quickTo(preview, 'y', previewMotion);

    function getPreviewPosition(event) {
        const previewWidth = preview.offsetWidth || 420;
        const previewHeight = preview.offsetHeight || 320;
        const fitsRight = event.clientX + previewGap + previewWidth <= window.innerWidth;
        const fitsBelow = event.clientY + previewGap + previewHeight <= window.innerHeight;

        const x = fitsRight
            ? event.clientX + previewGap
            : event.clientX - previewWidth - previewGap;
        const y = fitsBelow
            ? event.clientY + previewGap
            : event.clientY - previewHeight - previewGap;

        return {
            x: Math.min(
                Math.max(x, previewGap),
                Math.max(previewGap, window.innerWidth - previewWidth - previewGap)
            ),
            y: Math.min(
                Math.max(y, previewGap),
                Math.max(previewGap, window.innerHeight - previewHeight - previewGap)
            )
        };
    }

    function movePreviewToPointer(event, instant = false) {
        const position = getPreviewPosition(event);

        if (instant || prefersReducedMotion) {
            gsap.set(preview, {
                x: position.x,
                y: position.y
            });
            return;
        }

        movePreviewX(position.x);
        movePreviewY(position.y);
    }

    function showPreview() {
        gsap.to(preview, {
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: prefersReducedMotion ? 0.01 : 0.45,
            ease: 'power3.out'
        });
        preview.removeAttribute('aria-hidden');
    }

    function hidePreview() {
        gsap.to(preview, {
            autoAlpha: 0,
            scale: 0.94,
            filter: 'blur(12px)',
            duration: prefersReducedMotion ? 0.01 : 0.35,
            ease: 'power3.out',
            onComplete: () => {
                preview.setAttribute('aria-hidden', 'true');
            }
        });
    }

    let activeItem = null;

    function setPreviewImage(item) {
        const src = item.getAttribute('data-preview');
        const titleEl = item.querySelector('.work-title-fixed');
        const stackEl = item.querySelector('.work-stack');
        const titleText = titleEl ? titleEl.textContent.trim() : '';
        const stackText = stackEl ? stackEl.textContent.trim() : '';

        if (previewTitle) previewTitle.textContent = titleText;
        if (previewStack) previewStack.textContent = stackText;

        if (!src || !previewImg) return;

        if (previewImg.getAttribute('src') === src) {
            previewImg.setAttribute('alt', titleText ? (titleText + ' — preview') : 'work preview');
            return;
        }

        gsap.to(previewImg, {
            opacity: 0.15,
            scale: 0.98,
            duration: 0.15,
            onComplete: () => {
                previewImg.setAttribute('src', src);
                previewImg.setAttribute('alt', titleText ? (titleText + ' — preview') : 'work preview');
                previewImg.onload = () => {
                    gsap.to(previewImg, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.25,
                        ease: 'power2.out'
                    });
                };
            }
        });
    }

    workItems.forEach(item => {
        const title = item.querySelector('.work-title-fixed');
        const number = item.querySelector('.work-number');
        const meta = item.querySelector('.work-meta');
        const desc = item.querySelector('.work-desc-fixed');
        const stack = item.querySelector('.work-stack');
        const arrow = item.querySelector('.work-arrow');

        item.addEventListener('mouseenter', (event) => {
            activeItem = item;
            setPreviewImage(item);
            movePreviewToPointer(event, true);
            showPreview();

            // Animate row expand
            gsap.to(item, {
                minHeight: '10.5rem',
                paddingTop: '2.7rem',
                paddingBottom: '2.7rem',
                borderColor: document.body.classList.contains('dark-mode') ? 'rgba(254, 254, 254, 0.28)' : 'rgba(13, 13, 13, 0.28)',
                duration: 0.5,
                ease: 'power2.out',
                overwrite: 'auto'
            });

            if (title) gsap.to(title, { x: 6, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (number) gsap.to(number, { color: 'var(--black)', y: 3, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (meta) gsap.to(meta, { color: '#8d5b4c', y: 3, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });

            if (desc) gsap.to(desc, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (stack) gsap.to(stack, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (arrow) gsap.to(arrow, { opacity: 1, x: 0, y: 0, borderColor: 'var(--black)', duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        });

        item.addEventListener('mousemove', (event) => {
            if (activeItem !== item) return;
            movePreviewToPointer(event);
        });

        item.addEventListener('mouseleave', () => {
            activeItem = null;
            hidePreview();

            // Animate row collapse
            gsap.to(item, {
                minHeight: '5.7rem',
                paddingTop: '2.1rem',
                paddingBottom: '2.1rem',
                borderColor: 'var(--sand)',
                duration: 0.5,
                ease: 'power2.out',
                overwrite: 'auto'
            });

            if (title) gsap.to(title, { x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (number) gsap.to(number, { color: '', y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            if (meta) gsap.to(meta, { color: '', y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });

            if (desc) gsap.to(desc, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
            if (stack) gsap.to(stack, { opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
            if (arrow) gsap.to(arrow, { opacity: 0, x: -10, y: 10, borderColor: '', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });

        item.setAttribute('aria-controls', 'work-preview');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            activeItem = null;
            hidePreview();
        }
    });
}

function initTestimonialsSlider() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.testimonial-dots .dot');

    if (testimonials.length === 0) return;

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // Set initial position states
    testimonials.forEach((item, i) => {
        if (i === 0) {
            item.style.position = 'relative';
            item.style.top = 'auto';
            item.style.left = 'auto';
            item.classList.add('active');
            gsap.set(item, { opacity: 1, x: 0 });
        } else {
            item.style.position = 'absolute';
            item.style.top = '0';
            item.style.left = '0';
            item.classList.remove('active');
            gsap.set(item, { opacity: 0, x: 50 });
        }
    });

    function showTestimonial(index, direction = 1) {
        testimonials.forEach((item, i) => {
            if (i === index) {
                item.style.position = 'relative';
                item.style.top = 'auto';
                item.style.left = 'auto';
                item.classList.add('active');

                gsap.fromTo(item,
                    { opacity: 0, x: direction * 50 },
                    { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }
                );
            } else if (item.classList.contains('active')) {
                item.style.position = 'absolute';
                item.style.top = '0';
                item.style.left = '0';
                item.classList.remove('active');

                gsap.to(item, {
                    opacity: 0,
                    x: -direction * 50,
                    duration: 0.5,
                    ease: 'power2.in',
                    overwrite: 'auto'
                });
            } else {
                item.classList.remove('active');
                item.style.position = 'absolute';
                item.style.top = '0';
                item.style.left = '0';
                gsap.set(item, { opacity: 0, x: direction * 50 });
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

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (i === currentIndex) return;
            const direction = i > currentIndex ? 1 : -1;
            currentIndex = i;
            showTestimonial(currentIndex, direction);
        });
    });

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
                const prevIndex = currentIndex;
                currentIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(currentIndex, 1);
            }
            if (touchEndX > touchStartX + 50) {
                const prevIndex = currentIndex;
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentIndex, -1);
            }
        }
    }

    const rotateInterval = isMobile ? 7000 : 5000;
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        currentIndex = nextIndex;
        showTestimonial(currentIndex, 1);
    }, rotateInterval);
}

function initExpertiseMinimalAnimations() {
    ScrollTrigger.create({
        trigger: '.expertise-statement',
        scroller: '#scroll-wrapper',
        start: 'top 70%',
        onEnter: () => {
            gsap.fromTo('.statement-text',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.6 : 1,
                    ease: 'power3.out'
                }
            );

            gsap.fromTo('.statement-large',
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: isMobile ? 0.8 : 1.5,
                    delay: 0.2,
                    ease: 'power3.out'
                }
            );
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



const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        const submitBtn = this.querySelector('.form-submit');
        const originalText = submitBtn.querySelector('span').textContent;

        submitBtn.querySelector('span').textContent = 'Sending...';
        submitBtn.disabled = true;

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
    anchor.addEventListener('click', function (e) {
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
    // Only attempt to register a service worker on secure origins or localhost.
    if (location.protocol === 'http:' || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/js/sw.js')
                .then(registration => {
                    // registration successful
                })
                .catch(error => {
                    // registration failed
                });
        });
    }
}

window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    }
});

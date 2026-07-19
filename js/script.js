// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Active Nav Link for Multi-Page
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.split("/").pop() || "index.html"; // Get current page filename

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // Fallback for root path if index.html is not explicitly in URL
    if (currentPath === "" && document.querySelector('.nav-links a[href="index.html"]')) {
         document.querySelector('.nav-links a[href="index.html"]').classList.add('active');
    }
}


// Reveal Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');

            if (entry.target.classList.contains('cards-grid') ||
                entry.target.classList.contains('team-grid') ||
                entry.target.classList.contains('alumni-grid') ||
                // Note: We handle gallery-grid items separately in populateGallery
                entry.target.classList.contains('achievements-list')) {
                const items = entry.target.children;
                Array.from(items).forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 100);
                });
            }

            if (entry.target.classList.contains('section')) {
                entry.target.classList.add('animate');
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.querySelectorAll('.cards-grid, .team-grid, .alumni-grid, .achievements-list').forEach(el => observer.observe(el));
document.querySelectorAll('.section').forEach(el => observer.observe(el));

// Smooth Scrolling for in-page # links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId.length > 1 && document.querySelector(targetId)) {
            e.preventDefault();
            const target = document.querySelector(targetId);
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // If mobile menu is open, close it after clicking a link
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (navMenu && navMenu.classList.contains('mobile-active')) {
            navMenu.classList.remove('mobile-active');
            mobileMenuButton.classList.remove('active');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }
    });
});

// Floating Images JS
function createFloatingElements() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const imagePaths = [
        'images/logo.png',
        'images/logo.png',
        'images/logo.png'
    ];

    setInterval(() => {
        if (document.hidden) return;

        const elementWrapper = document.createElement('div');
        elementWrapper.classList.add('floating-image-element');

        const img = document.createElement('img');
        img.src = imagePaths[Math.floor(Math.random() * imagePaths.length)];

        img.onerror = function() {
            console.warn("Floating image not found at: " + img.src);
            elementWrapper.remove();
        };
        img.onload = function() {
            elementWrapper.appendChild(img);
            hero.appendChild(elementWrapper);
        }

        const size = Math.random() * 30 + 20;
        elementWrapper.style.width = `${size}px`;
        elementWrapper.style.height = `${size}px`;
        elementWrapper.style.opacity = Math.random() * 0.3 + 0.2;
        elementWrapper.style.left = Math.random() * 100 + '%';
        elementWrapper.style.top = '110%';
        elementWrapper.style.animation = `floatUp ${Math.random() * 8 + 10}s linear forwards`;

        setTimeout(() => {
            elementWrapper.remove();
        }, 18000);
    }, 3500);
}

const floatingStyle = document.createElement('style');
floatingStyle.textContent = `
    @keyframes floatUp {
        0% { transform: translateY(0) rotate(${Math.random() * 60 - 30}deg); opacity: ${Math.random() * 0.3 + 0.2}; }
        100% { transform: translateY(-120vh) rotate(${Math.random() * 360}deg); opacity: 0; }
    }
`;
document.head.appendChild(floatingStyle);

// Mouse move for geometry (parallax-like)
document.addEventListener('mousemove', (e) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const mouseXNorm = e.clientX / window.innerWidth;
    const mouseYNorn = e.clientY / window.innerHeight;

    document.querySelectorAll('.geometry').forEach((element, index) => {
        const speed = (index + 1) * 0.3 + 0.2;
        const x = (mouseXNorm - 0.5) * speed * 40;
        const y = (mouseYNorn - 0.5) * speed * 40;
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});


// Card hover gradient effect
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x-card', `${x}px`);
        card.style.setProperty('--mouse-y-card', `${y}px`);
        card.style.background = `radial-gradient(circle at var(--mouse-x-card) var(--mouse-y-card), rgba(var(--dark-navy-rgb), 0.4), var(--glass-bg))`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.background = 'var(--glass-bg)';
    });
});

// --- Team Photo Slider ---
function initTeamPhotoSlider() {
    const slider = document.querySelector('.team-photo-slider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = Array.from(track.children);
    const nextButton = slider.querySelector('.slider-button.next');
    const prevButton = slider.querySelector('.slider-button.prev');
    const dotsNav = slider.querySelector('.slider-nav');

    if (!track || !nextButton || !prevButton || !dotsNav || slides.length === 0) return;

    let slideWidth = slides[0].getBoundingClientRect().width;
    let currentIndex = 0;
    
    let autoScrollInterval;
    const autoScrollDelay = 5000;

    dotsNav.innerHTML = ''; 
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        dot.setAttribute('aria-label', `Go to image ${index + 1}`);
        if (index === 0) dot.classList.add('current-slide');
        dotsNav.appendChild(dot);
    });
    const dots = Array.from(dotsNav.children);

    const moveToSlide = (targetIndex) => {
        track.style.transform = 'translateX(-' + slideWidth * targetIndex + 'px)';
        slides[currentIndex].classList.remove('current-slide');
        slides[targetIndex].classList.add('current-slide');
        dots[currentIndex].classList.remove('current-slide');
        dots[targetIndex].classList.add('current-slide');
        currentIndex = targetIndex;
    };
    
    const startAutoScroll = () => {
        stopAutoScroll();
        autoScrollInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            moveToSlide(nextIndex);
        }, autoScrollDelay);
    };

    const stopAutoScroll = () => clearInterval(autoScrollInterval);
    const resetAutoScroll = () => { stopAutoScroll(); startAutoScroll(); };

    nextButton.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        moveToSlide(nextIndex);
        resetAutoScroll();
    });

    prevButton.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        moveToSlide(prevIndex);
        resetAutoScroll();
    });

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button.slider-dot');
        if (!targetDot) return;
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        moveToSlide(targetIndex);
        resetAutoScroll();
    });

    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);

    let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0;
    const getPositionX = (e) => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;

    const touchStart = (e) => {
        stopAutoScroll();
        isDragging = true;
        startPos = getPositionX(e);
        track.style.transition = 'none';
        prevTranslate = -currentIndex * slideWidth;
    };

    const touchMove = (e) => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPos;
        track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const touchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        if (movedBy < -50 && currentIndex < slides.length - 1) {
            moveToSlide(currentIndex + 1);
        } else if (movedBy > 50 && currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        } else {
            moveToSlide(currentIndex);
        }
        startAutoScroll();
    };
    
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => { if(isDragging) touchEnd(); });
    track.addEventListener('touchend', touchEnd);
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('touchmove', touchMove, { passive: true });

    window.addEventListener('resize', () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transition = 'none';
        moveToSlide(currentIndex);
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    startAutoScroll();
}

// ===== NEW: Gallery Population Logic =====
function populateGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    // If the gallery grid doesn't exist on the current page, do nothing.
    if (!galleryGrid) return;

    // --- MANAGE YOUR IMAGES HERE ---
    // Add the filenames of images from your "/images/gallery/" folder to this list.
    const galleryImages = [
        '1 (1).jpg',
        '1 (2).jpg',
        '1 (3).jpg',
        '1 (4).jpg',
        '1 (5).jpg',
        '1 (6).jpg',
        '1 (7).jpg',
        '1 (8).jpg',
        '1 (9).jpg',
        '1 (10).jpg',
        '1 (39).jpg',
        '1 (40).jpg',
        '1 (11).jpg',
        '1 (12).jpg',
        '1 (13).jpg',
        '1 (14).jpg',
        '1 (15).jpg',
        '1 (16).jpg',
        '1 (17).jpg',
        '1 (18).jpg',
        '1 (19).jpg',
        '1 (20).jpg',
        '1 (21).jpg',
        '1 (22).jpg',
        '1 (23).jpg',
        '1 (24).jpg',
        '1 (25).jpg',
        '1 (26).jpg',
        '1 (27).jpg',
        '1 (28).jpg',
        '1 (29).jpg',
        '1 (30).jpg',
        '1 (31).jpg',
        '1 (32).jpg',
        '1 (33).jpg',
        '1 (34).jpg',
        '1 (35).jpg',
        '1 (36).jpg',
        '1 (37).jpg',
        '1 (38).jpg',
    ];

    // Clear any placeholder content from the HTML
    galleryGrid.innerHTML = '';

    // Create and append an item for each image
    galleryImages.forEach((imageName, index) => {
        // Create the main container div
        const item = document.createElement('div');
        item.classList.add('gallery-item', 'reveal');

        // Stagger the animation delays, cycling from 1 to 6
        const delayClass = `delay-${(index % 6) + 1}`;
        item.classList.add(delayClass);

        // Create the image element
        const img = document.createElement('img');
        img.src = `images/gallery/${imageName}`;
        
        // Create a user-friendly alt text and caption from the filename
        const captionText = imageName.split('.')[0]
                                   .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
                                   .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

        img.alt = captionText;
        img.loading = 'lazy'; // Improve performance by lazy loading images

        // Create the caption element
        const caption = document.createElement('div');
        caption.classList.add('caption');
        caption.textContent = " ";

        // Assemble the gallery item
        item.appendChild(img);
        item.appendChild(caption);

        // Add the completed item to the grid
        galleryGrid.appendChild(item);
    });

    // Since we added new elements, we need to tell the IntersectionObserver to watch them
    document.querySelectorAll('.gallery-item.reveal').forEach(el => observer.observe(el));
}


// --- START: Custom Designed Cursor Logic ---
const cursorDot = document.querySelector('.custom-cursor-dot');
const cursorRing = document.querySelector('.custom-cursor-ring');

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;
const ringStalkerSpeed = 0.18;
let isCursorReady = false;

function setInitialCursorElementPositions(x, y) {
    if (cursorDot) {
        cursorDot.style.transition = 'none';
        cursorDot.style.setProperty('--cursor-dot-x', `${x}px`);
        cursorDot.style.setProperty('--cursor-dot-y', `${y}px`);
        cursorDot.style.setProperty('--cursor-dot-scale', 'scale(1)');
        requestAnimationFrame(() => cursorDot.style.transition = '');
    }
    if (cursorRing) {
        cursorRing.style.transition = 'none';
        cursorRing.style.setProperty('--cursor-ring-x', `${x}px`);
        cursorRing.style.setProperty('--cursor-ring-y', `${y}px`);
        cursorRing.style.setProperty('--cursor-ring-scale', 'scale(1)');
        requestAnimationFrame(() => cursorRing.style.transition = '');
    }
}

document.addEventListener('mousedown', () => {
    if (window.matchMedia("(min-width: 769px)").matches && !window.matchMedia("(pointer: coarse)").matches) {
        if (cursorDot && cursorRing) document.body.classList.add('cursor-is-clicking');
    }
});

document.addEventListener('mouseup', () => {
    if (window.matchMedia("(min-width: 769px)").matches && !window.matchMedia("(pointer: coarse)").matches) {
        if (cursorDot && cursorRing) document.body.classList.remove('cursor-is-clicking');
    }
});

function updateCursorPositions(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (window.matchMedia("(min-width: 769px)").matches && !window.matchMedia("(pointer: coarse)").matches) {
        localStorage.setItem('ttCursorX', String(mouseX));
        localStorage.setItem('ttCursorY', String(mouseY));
    }

    if (!isCursorReady) {
        if (cursorDot) {
            cursorDot.style.setProperty('--cursor-dot-x', `${mouseX}px`);
            cursorDot.style.setProperty('--cursor-dot-y', `${mouseY}px`);
            cursorDot.style.opacity = '1';
        }
        if (cursorRing) {
            ringX = mouseX;
            ringY = mouseY;
            cursorRing.style.setProperty('--cursor-ring-x', `${ringX}px`);
            cursorRing.style.setProperty('--cursor-ring-y', `${ringY}px`);
            cursorRing.style.opacity = '1';
        }
        isCursorReady = true;
    }
}

function animateCustomCursor() {
    if (isCursorReady) {
        if (cursorDot) {
            cursorDot.style.setProperty('--cursor-dot-x', `${mouseX}px`);
            cursorDot.style.setProperty('--cursor-dot-y', `${mouseY}px`);
        }
        if (cursorRing) {
            ringX += (mouseX - ringX) * ringStalkerSpeed;
            ringY += (mouseY - ringY) * ringStalkerSpeed;
            cursorRing.style.setProperty('--cursor-ring-x', `${ringX.toFixed(2)}px`);
            cursorRing.style.setProperty('--cursor-ring-y', `${ringY.toFixed(2)}px`);
        }
    }
    requestAnimationFrame(animateCustomCursor);
}

function setupCursorHoverEffects() {
    const interactiveElements = document.querySelectorAll(
        'a, button, .cta-button, .social-link, .nav-links a, .logo, .card, .team-member, .alumni-member, .gallery-item, .achievement-item, input, textarea, .mobile-menu-toggle, .slider-dot'
    );
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-interactive-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-interactive-hover'));
    });
}
// --- END: Custom Designed Cursor Logic ---


// Konami Code
let konamiCode = [];
const correctCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > correctCode.length) konamiCode.shift();

    if (JSON.stringify(konamiCode) === JSON.stringify(correctCode)) {
        document.body.style.animation = 'rainbow 2s ease-in-out infinite';
        const konamiMessage = document.createElement('div');
        konamiMessage.textContent = "🚀 Tech Titans Realm Unlocked! 🚀";
        Object.assign(konamiMessage.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            padding: '20px', background: 'var(--text-gradient-gold)', color: 'white',
            fontSize: '2rem', borderRadius: '10px', zIndex: '10002',
            boxShadow: '0 0 30px var(--golden-orange-start)', textShadow: '0 0 5px #000'
        });
        document.body.appendChild(konamiMessage);
        setTimeout(() => {
            document.body.style.animation = '';
            konamiMessage.remove();
            konamiCode = [];
        }, 5000);
    }
});

const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
document.head.appendChild(rainbowStyle);

// Mobile Menu Toggle Functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const navMenu = document.getElementById('nav-menu');

if (mobileMenuButton && navMenu) {
    mobileMenuButton.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-active');
        mobileMenuButton.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('mobile-active');
        mobileMenuButton.setAttribute('aria-expanded', isExpanded.toString());
        document.body.classList.toggle('no-scroll', isExpanded);
    });
}
// --- START: Page Transition Logic (REFINED SEQUENTIAL SHUTTER) ---
const NUM_SHUTTERS = 8; // Increased for smoother effect
const PAGE_TRANSITION_DURATION = 800; // Slightly longer for refined animation
const SHUTTER_DELAY = 100; // Delay between each shutter (ms)
let transitionOverlay = null;

function createTransitionOverlay() {
    if (document.getElementById('page-transition-overlay-id')) {
        transitionOverlay = document.getElementById('page-transition-overlay-id');
        transitionOverlay.innerHTML = '';
    } else {
        transitionOverlay = document.createElement('div');
        transitionOverlay.id = 'page-transition-overlay-id';
        transitionOverlay.className = 'page-transition-overlay';
        document.body.appendChild(transitionOverlay);
    }
    
    for (let i = 0; i < NUM_SHUTTERS; i++) {
        const shutter = document.createElement('div');
        shutter.className = 'shutter';
        shutter.style.setProperty('--shutter-index', i);
        transitionOverlay.appendChild(shutter);
    }
    return transitionOverlay;
}

function initPageArrival() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.body.style.opacity = '1';
        if (transitionOverlay) transitionOverlay.style.display = 'none';
        return;
    }
    
    transitionOverlay = createTransitionOverlay();
    transitionOverlay.style.display = 'flex';
    transitionOverlay.classList.remove('page-is-leaving');
    transitionOverlay.classList.add('page-is-arriving');
    
    setTimeout(() => {
        if (transitionOverlay && !transitionOverlay.classList.contains('page-is-leaving')) {
             transitionOverlay.style.display = 'none';
             transitionOverlay.classList.remove('page-is-arriving');
        }
        document.body.style.opacity = '1';
    }, PAGE_TRANSITION_DURATION);
}

function handlePageLeave(event, destinationUrl) {
    event.preventDefault();
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.location.href = destinationUrl;
        return;
    }
    
    transitionOverlay = createTransitionOverlay();
    transitionOverlay.style.display = 'flex';
    transitionOverlay.classList.remove('page-is-arriving');
    transitionOverlay.classList.add('page-is-leaving');
    document.body.style.opacity = '0.8';
    
    setTimeout(() => {
        window.location.href = destinationUrl;
    }, PAGE_TRANSITION_DURATION - 50);
}

function setupLinkTransitions() {
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'));
        const isAnchor = href && href.startsWith('#');
        
        if (href && !isExternal && !isAnchor && link.target !== '_blank') {
            link.addEventListener('click', (e) => handlePageLeave(e, href));
        }
    });
}
// --- END: Page Transition Logic ---


// --- START: Page Loading Logic (IMPROVED - PLAYS ONCE PER SESSION) ---
function handlePageLoad() {
    const loader = document.getElementById('loader-wrapper');
    const body = document.body;

    // Check if the loader has been shown in this browser session
    if (sessionStorage.getItem('loaderHasPlayed')) {
        // --- LOADER HAS ALREADY PLAYED ---
        // Hide the loader immediately
        if (loader) loader.style.display = 'none';
        
        // Make the body content visible
        body.classList.add('loaded');
        
        // Initialize the page with the normal shutter transition for page-to-page navigation.
        initializePage(true);

    } else {
        // --- FIRST VISIT THIS SESSION: PLAY THE LOADER ---
        if (loader) {
            // Make sure the loader is visible
            loader.style.display = 'flex';
            
            const lastAnimatedElement = loader.querySelector('.loader-logo-container');
            if (lastAnimatedElement) {
                lastAnimatedElement.addEventListener('animationend', () => {
                    // When the boot-up animation finishes...
                    
                    // 1. Set the flag in sessionStorage so it doesn't play again
                    sessionStorage.setItem('loaderHasPlayed', 'true');
                    
                    // 2. Fade out the loader and fade in the page content
                    body.classList.add('loaded');
                    
                    setTimeout(() => {
                        loader.style.display = 'none';
                        // 3. Initialize the page WITHOUT the shutter animation
                        initializePage(false);
                    }, 800); // Time for the loader to fade out

                }, { once: true });
            } else {
                // Fallback if the element isn't found
                fallbackLoader();
            }
        } else {
             // Fallback if the loader element itself doesn't exist
            fallbackLoader();
        }
    }

    // A simple fallback function in case the animation event logic fails
    function fallbackLoader() {
        setTimeout(() => {
            body.classList.add('loaded');
            sessionStorage.setItem('loaderHasPlayed', 'true');
            setTimeout(() => {
                if (loader) loader.style.display = 'none';
                initializePage(false); // Init without shutter on fallback
            }, 800);
        }, 5000); // A generous fallback timer
    }
}
// --- END: Page Loading Logic ---


// --- Main Initialization and Page Lifecycle ---
// MODIFIED: This function now accepts a parameter to control the shutter animation.
function initializePage(runPageArrivalAnimation = true) {
    
    // Only run the shutter animation if the parameter is true.
    if (runPageArrivalAnimation) {
        initPageArrival();
    }
    
    // The rest of the initialization runs every time.
    setupLinkTransitions();
    setActiveNavLink();
    
    if (document.querySelector('.hero')) {
      createFloatingElements();
    }
    
    initTeamPhotoSlider();
    populateGallery();

    if (window.matchMedia("(min-width: 769px)").matches && !window.matchMedia("(pointer: coarse)").matches) {
        const storedX = localStorage.getItem('ttCursorX');
        const storedY = localStorage.getItem('ttCursorY');
        if (storedX && storedY) {
            mouseX = parseInt(storedX, 10);
            mouseY = parseInt(storedY, 10);
            ringX = mouseX;
            ringY = mouseY;
            setInitialCursorElementPositions(mouseX, mouseY);
            requestAnimationFrame(() => {
                if(cursorDot) cursorDot.style.opacity = '1';
                if(cursorRing) cursorRing.style.opacity = '1';
            });
            isCursorReady = true;
        } else {
            isCursorReady = false;
        }

        document.addEventListener('mousemove', updateCursorPositions);
        requestAnimationFrame(animateCustomCursor);
        setupCursorHoverEffects();
    }
}

// This now calls our new, smarter loading handler
window.addEventListener('load', handlePageLoad);

// The pageshow event should also re-run the full loading sequence for consistency
window.addEventListener('pageshow', function(event) {
    if (event.persisted) { 
        // This handles the back/forward cache.
        // The logic in handlePageLoad will correctly determine whether to show the loader or the shutter.
        document.body.classList.remove('loaded');
        handlePageLoad();
    }
});

// =============================================
//  PREMIUM ENHANCEMENTS
// =============================================

// ---- Scroll Progress Bar ----
(function initScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    const update = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// ---- Back to Top Button ----
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ---- Counter Animation (disabled) ----
// (removed)

// ---- Typing Effect (disabled) ----
// (removed)

// ---- Ach-Card Mouse Tilt Effect ----
(function initCardTilt() {
    document.querySelectorAll('.ach-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -5;
            const rotateY = ((x - cx) / cx) * 5;
            card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
})();
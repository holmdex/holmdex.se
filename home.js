/**
 * HOLMDEX PROFESSIONAL HOMEPAGE JAVASCRIPT
 * Simplified with refined animations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * Helper Functions
     */
    // Shorthand selectors
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    // Add event listener with safety check
    const addEvent = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    };
    
    // Debounce function to limit function call frequency
    const debounce = (func, wait = 100) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    /**
     * Card Hover Effects
     * Adds subtle 3D effects for cards on hover
     */
    const setupCardEffects = () => {
        // Only apply on devices with hover capability
        if (!window.matchMedia('(hover: hover)').matches) return;
        
        // Apply effect to principle cards
        const principleCards = $$('.principle-card');
        
        principleCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate center point
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate rotation values (subtle)
                const rotateY = ((x - centerX) / centerX) * 3; // max ±3 degrees
                const rotateX = ((centerY - y) / centerY) * 3; // max ±3 degrees
                
                // Apply transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset transform
                card.style.transform = '';
            });
        });
        
        // Apply effect to resource cards
        const resourceCards = $$('.resource-card');
        
        resourceCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate center point
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate rotation values (subtle)
                const rotateY = ((x - centerX) / centerX) * 3; // max ±3 degrees
                const rotateX = ((centerY - y) / centerY) * 3; // max ±3 degrees
                
                // Apply transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset transform
                card.style.transform = '';
            });
        });
    };
   /**
 * HOLMDEX TRUSTED SOURCES TICKER
 * Sets up the continuous ticker and duplicates content for smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * Set up the sources ticker
     * Makes sure there's enough content for smooth infinite scrolling
     */
    const setupSourcesTicker = () => {
        const ticker = document.querySelector('.sources-ticker');
        if (!ticker) return;
        
        // Clone all source items to ensure the ticker has enough content
        // This creates the illusion of infinite scrolling
        const sourceItems = ticker.querySelectorAll('.source-item');
        
        // Create a document fragment to avoid multiple repaints
        const fragment = document.createDocumentFragment();
        
        // Clone all source items
        sourceItems.forEach(item => {
            const clone = item.cloneNode(true);
            fragment.appendChild(clone);
        });
        
        // Append the clones to the ticker
        ticker.appendChild(fragment);
        
        // Calculate the total width to ensure smooth animation
        const totalWidth = Array.from(ticker.children)
            .reduce((sum, item) => sum + item.offsetWidth, 0);
        
        // Make sure the ticker width is at least twice the container
        const container = document.querySelector('.sources-ticker-container');
        if (container) {
            const containerWidth = container.offsetWidth;
            
            // If we don't have enough content, clone everything again
            if (totalWidth < containerWidth * 2) {
                const sourceItems = ticker.querySelectorAll('.source-item');
                sourceItems.forEach(item => {
                    const clone = item.cloneNode(true);
                    ticker.appendChild(clone);
                });
            }
        }
    };
    
    /**
     * Add hover effect for source items
     */
    const setupSourceItemHover = () => {
        const sourceItems = document.querySelectorAll('.source-item');
        
        sourceItems.forEach(item => {
            // Add subtle bounce effect on hover
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    };
    
    /**
     * Adjust ticker speed based on screen width
     */
    const adjustTickerSpeed = () => {
        const ticker = document.querySelector('.sources-ticker');
        if (!ticker) return;
        
        // Adjust animation duration based on screen size
        const duration = window.innerWidth < 768 ? '60s' : '90s';
        ticker.style.animationDuration = duration;
    };
    
    /**
     * Initialize ticker functionality
     */
    const initTicker = () => {
        setupSourcesTicker();
        setupSourceItemHover();
        adjustTickerSpeed();
        
        // Re-adjust on resize
        window.addEventListener('resize', debounce(() => {
            adjustTickerSpeed();
        }, 250));
    };
    
    /**
     * Debounce function to limit function call frequency
     */
    const debounce = (func, wait = 100) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    // Initialize when the DOM is ready
    initTicker();
}); 
    /**
     * Scroll-Based Animations
     * Handles animations that trigger on scroll
     */
    const setupScrollAnimations = () => {
        // Elements to animate on scroll
        const principleCards = $$('.principle-card');
        const resourceCards = $$('.resource-card');
        const sourceLogos = $$('.source-logo');
        
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Apply animations immediately for older browsers
            principleCards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
            
            resourceCards.forEach(card => {
                card.classList.add('visible');
            });
            
            sourceLogos.forEach(logo => {
                logo.style.opacity = '0.7';
            });
            
            return;
        }
        
        // Create observer for principle cards
        const principleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // The card is now visible
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    entry.target.style.setProperty('--delay', delay);
                    
                    // Stop observing this element
                    principleObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Create observer for resource cards
        const resourceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // The card is now visible
                    entry.target.classList.add('visible');
                    
                    // Stop observing this element
                    resourceObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Create observer for source logos
        const logoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggered animation for source logos
                    const index = Array.from(sourceLogos).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.style.opacity = '0.7';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    
                    // Stop observing this element
                    logoObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Start observing elements
        principleCards.forEach(card => {
            principleObserver.observe(card);
        });
        
        resourceCards.forEach(card => {
            resourceObserver.observe(card);
        });
        
        sourceLogos.forEach(logo => {
            // Initial state
            logo.style.opacity = '0';
            logo.style.transform = 'translateY(10px)';
            logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // Observe
            logoObserver.observe(logo);
        });
    };
    
    /**
     * Source Logos Animation
     * Subtle animations for trusted sources logos
     */
    const setupSourceLogos = () => {
        const sourceLogos = $$('.source-logo');
        
        sourceLogos.forEach((logo, index) => {
            // Add hover effect for source logos
            logo.addEventListener('mouseenter', () => {
                const icon = logo.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            logo.addEventListener('mouseleave', () => {
                const icon = logo.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    };
    
    /**
     * Back To Top Button
     * Creates and manages a "back to top" button
     */
    const setupBackToTop = () => {
        // Check if button already exists or create it
        let backToTopBtn = $('#back-to-top');
        
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'back-to-top';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            
            document.body.appendChild(backToTopBtn);
        }
        
        // Show/hide button based on scroll position
        const toggleBackToTopButton = () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };
        
        // Initial check
        toggleBackToTopButton();
        
        // Add scroll listener
        window.addEventListener('scroll', () => {
            toggleBackToTopButton();
        });
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };
    
    /**
     * Smooth Scroll for Anchor Links
     */
    const setupSmoothScroll = () => {
        const anchorLinks = $$('a[href^="#"]:not([href="#"])');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerOffset = 70; // Adjust for header height
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL hash without causing jump
                    window.history.pushState(null, null, targetId);
                }
            });
        });
    };
    
    /**
     * Header Scroll Effects
     * Adds classes to header for scroll-based styling
     */
    const setupHeaderEffects = () => {
        const header = $('.holmdex-header');
        
        if (!header) return;
        
        let lastScrollTop = 0;
        const scrollThreshold = 100;
        
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add 'scrolled' class when scrolled down
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide header when scrolling down quickly past threshold
            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop + 20) {
                    // Scrolling down quickly
                    header.classList.add('header-hidden');
                } else if (scrollTop < lastScrollTop - 5 || scrollTop < scrollThreshold) {
                    // Scrolling up or near top
                    header.classList.remove('header-hidden');
                }
            } else {
                header.classList.remove('header-hidden');
            }
            
            lastScrollTop = scrollTop;
        };
        
        // Throttle scroll event to improve performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 10);
            }
        });
        
        // Initial header state
        handleScroll();
    };
    
    /**
     * Detect and Adjust for Animation Preferences
     */
    const setupAnimationPreferences = () => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up source logos animation
        setupSourceLogos();
        
        // Set up scroll-based animations
        setupScrollAnimations();
        
        // Set up interactive card effects
        setupCardEffects();
        
        // Set up back to top button
        setupBackToTop();
        
        // Set up smooth scrolling for anchor links
        setupSmoothScroll();
        
        // Set up header scroll effects
        setupHeaderEffects();
        
        // Set up animation preferences
        setupAnimationPreferences();
        
        // Log initialization
        console.log('Holmdex professional homepage initialized');
    };
    
    // Start initialization
    init();
});

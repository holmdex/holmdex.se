/**
 * HOLMDEX ABOUT US PAGE JAVASCRIPT
 * Handles animations and interactive elements only for the About Us page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run this script if we're on the About Us page
    if (!document.querySelector('.about-page')) return;
    
    /**
     * Helper Functions
     */
    // Shorthand selectors that only target elements within the About Us page
    const $ = (selector) => document.querySelector('.about-page ' + selector);
    const $$ = (selector) => document.querySelectorAll('.about-page ' + selector);
    
    /**
     * Animation on Scroll
     * Reveals elements as they come into viewport
     */
    const setupScrollAnimations = () => {
        // Elements to animate (limited to About Us page)
        const animateElements = [
            '.intro-content',
            '.philosophy-card',
            '.global-content',
            '.approach-item',
            '.message-content'
        ];
        
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15
            };
            
            const animateOnScroll = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        animateOnScroll.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            // For each selector, find all matching elements and observe them
            animateElements.forEach(selector => {
                const elements = $$(selector);
                elements.forEach((element, index) => {
                    // Add initial class and delay based on index
                    element.classList.add('reveal');
                    element.style.transitionDelay = `${index * 0.1}s`;
                    
                    // Start observing
                    animateOnScroll.observe(element);
                });
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            animateElements.forEach(selector => {
                const elements = $$(selector);
                elements.forEach(element => {
                    element.classList.add('animate');
                });
            });
        }
    };
    
    /**
     * Philosophy Cards Interaction
     * Enhances card hover effects
     */
    const setupPhilosophyCards = () => {
        const cards = $$('.philosophy-card');
        
        cards.forEach(card => {
            // Add hover effect for the card image
            const cardImage = card.querySelector('.card-img');
            
            if (cardImage) {
                card.addEventListener('mouseenter', () => {
                    cardImage.style.transform = 'scale(1.05)';
                });
                
                card.addEventListener('mouseleave', () => {
                    cardImage.style.transform = '';
                });
            }
            
            // Make cards focusable for accessibility
            card.setAttribute('tabindex', '0');
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    };
    
    /**
     * Approach Items Animation
     * Adds interactive behavior to approach section
     */
    const setupApproachItems = () => {
        const items = $$('.approach-item');
        
        items.forEach(item => {
            const icon = item.querySelector('.approach-icon');
            const iconEl = item.querySelector('.approach-icon i');
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                if (icon && iconEl) {
                    icon.style.backgroundColor = 'var(--accent, #25A75E)';
                    icon.style.transform = 'scale(1.1) rotate(10deg)';
                    iconEl.style.color = 'white';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (icon && iconEl) {
                    icon.style.backgroundColor = '';
                    icon.style.transform = '';
                    iconEl.style.color = '';
                }
            });
            
            // Make items focusable for accessibility
            item.setAttribute('tabindex', '0');
            
            // Add keyboard support
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Toggle the hover effect
                    if (icon.style.backgroundColor) {
                        icon.style.backgroundColor = '';
                        icon.style.transform = '';
                        iconEl.style.color = '';
                    } else {
                        icon.style.backgroundColor = 'var(--accent, #25A75E)';
                        icon.style.transform = 'scale(1.1) rotate(10deg)';
                        iconEl.style.color = 'white';
                    }
                }
            });
        });
    };
    
    /**
     * Image Grid Animation
     * Adds subtle interactions to global section images
     */
    const setupImageGrid = () => {
        const gridItems = $$('.grid-item');
        
        gridItems.forEach(item => {
            const img = item.querySelector('.grid-img');
            
            if (img) {
                item.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.05)';
                });
                
                item.addEventListener('mouseleave', () => {
                    img.style.transform = '';
                });
            }
        });
    };
    
    /**
     * Profile Image Animation
     * Adds subtle animation to the founder profile image
     */
    const setupProfileImage = () => {
        const profileContainer = $('.profile-image-container');
        
        if (profileContainer) {
            const profileImage = profileContainer.querySelector('.profile-image');
            
            profileContainer.addEventListener('mouseenter', () => {
                if (profileImage) {
                    profileImage.style.transform = 'scale(1.05)';
                }
            });
            
            profileContainer.addEventListener('mouseleave', () => {
                if (profileImage) {
                    profileImage.style.transform = '';
                }
            });
        }
    };
    
    /**
     * Hero Parallax Effect
     * Adds subtle movement to hero image on scroll
     */
    const setupHeroParallax = () => {
        const hero = $('.about-hero');
        const heroBg = hero ? hero.querySelector('.hero-bg') : null;
        
        if (hero && heroBg) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.pageYOffset;
                
                // Only apply effect if within the hero section
                if (scrollPosition < hero.offsetHeight) {
                    // Move background slightly on scroll
                    heroBg.style.transform = `translateY(${scrollPosition * 0.3}px)`;
                }
            });
        }
    };
    
    /**
     * Smooth Scrolling for Anchor Links within the About page
     */
    const setupSmoothScroll = () => {
        // Only target anchor links within the About page
        const anchorLinks = document.querySelectorAll('.about-page a[href^="#"]:not([href="#"])');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                // Only look for targets within the About page
                const targetElement = document.querySelector('.about-page ' + targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerOffset = 80; // Adjust based on your header height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    /**
     * Back To Top Button specifically for the About page
     */
    const setupBackToTop = () => {
        // Create button if it doesn't exist, with an ID specific to the About page
        if (!document.querySelector('#about-back-to-top')) {
            const backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'about-back-to-top';
            backToTopBtn.className = 'about-back-to-top';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            
            // Add the button to the About page main element instead of body
            document.querySelector('.about-page').appendChild(backToTopBtn);
            
            // Show button when scrolled down
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });
            
            // Scroll to top when clicked
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    };
    
    /**
     * Accessibility Enhancements limited to About page
     */
    const setupAccessibility = () => {
        // Add proper roles and ARIA attributes to sections within About page
        const sections = $$('section');
        sections.forEach(section => {
            section.setAttribute('role', 'region');
            
            // Get section id or class name for labeling
            const id = section.id || section.className.split(' ')[0];
            section.setAttribute('aria-label', id.replace(/-/g, ' '));
        });
        
        // Add better focus styles for keyboard navigation within About page
        const focusableElements = $$('a, button, [tabindex="0"]');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('keyboard-focus');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('keyboard-focus');
            });
        });
    };
    
    /**
     * Check for reduced motion preference and adjust accordingly
     */
    const checkReducedMotion = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Add class to About page main element for CSS targeting
            document.querySelector('.about-page').classList.add('reduced-motion');
            
            // Disable animations only within About page
            const animatedElements = document.querySelectorAll('.about-page .reveal, .about-page .animate');
            animatedElements.forEach(element => {
                element.classList.remove('reveal');
                element.classList.add('animate');
                element.style.transitionDelay = '0s';
            });
        }
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Check for reduced motion preference first
        checkReducedMotion();
        
        // Set up all interactive elements
        setupScrollAnimations();
        setupPhilosophyCards();
        setupApproachItems();
        setupImageGrid();
        setupProfileImage();
        setupHeroParallax();
        setupSmoothScroll();
        setupBackToTop();
        setupAccessibility();
        
        // Add necessary CSS classes for animations, but only to the About page
        document.querySelector('.about-page').classList.add('js-enabled');
        
        // Log initialization
        console.log('Holmdex about page initialized');
    };
    
    // Start initialization
    init();
});

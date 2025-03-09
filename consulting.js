/**
 * HOLMDEX CONSULTING PAGE JAVASCRIPT
 * Handles interactive elements and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // First, check if we're on the consulting page
    const isConsultingPage = document.querySelector('.consulting-page');
    
    // Only run the script if we're on the consulting page
    if (!isConsultingPage) return;
    
    /**
     * Helper Functions
     */
    // Shorthand selectors
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    /**
     * Service Cards Animation
     * Adds staggered entrance animation for service cards
     */
    const setupServiceCards = () => {
        const serviceCards = $$('.service-card');
        
        // Set staggered delays for each card
        serviceCards.forEach((card, index) => {
            card.style.setProperty('--delay', index * 150);
            
            // Add focus styles for accessibility
            card.setAttribute('tabindex', '0');
            
            // Set up hover interactions
            const icon = card.querySelector('.service-icon i');
            
            card.addEventListener('mouseenter', () => {
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (icon) {
                    icon.style.transform = '';
                }
            });
            
            // Keyboard accessibility
            card.addEventListener('focus', () => {
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                }
            });
            
            card.addEventListener('blur', () => {
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    };
    
    /**
     * Process Timeline Animation
     * Animates the process steps when they come into view
     */
    const setupProcessTimeline = () => {
        const processSteps = $$('.process-step');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Add delay based on index for staggered animation
                        setTimeout(() => {
                            entry.target.classList.add('fade-in', 'active');
                        }, index * 200);
                        
                        // Stop observing once animation is applied
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Start observing each process step
            processSteps.forEach(step => {
                // Set initial state
                step.classList.add('fade-in');
                observer.observe(step);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            processSteps.forEach(step => {
                step.classList.add('active');
            });
        }
        
        // Add interaction effects
        processSteps.forEach(step => {
            step.setAttribute('tabindex', '0');
        });
    };
    
    /**
     * Smooth Scrolling for Anchor Links
     */
    const setupSmoothScrolling = () => {
        const anchorLinks = $$('.consulting-page a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Get the target element
                const targetId = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate offset to account for fixed header
                    const headerOffset = 80; // Adjust based on your header height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    // Scroll to the target element
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Set focus to target for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                }
            });
        });
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up service cards
        setupServiceCards();
        
        // Set up process timeline animation
        setupProcessTimeline();
        
        // Set up smooth scrolling
        setupSmoothScrolling();
        
        // Load animations only when visible (performance)
        if ('IntersectionObserver' in window) {
            const sections = $$('.consulting-page section:not(.consulting-hero)');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            sections.forEach(section => {
                observer.observe(section);
            });
        }
        
        // Log initialization
        console.log('Holmdex consulting page initialized');
    };
    
    // Start initialization
    init();
});

// Remove noscript elements on page load
document.addEventListener('DOMContentLoaded', function() {
    const noscriptElements = document.querySelectorAll('noscript');
    noscriptElements.forEach(function(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    // Also remove any text containing "Please enable JavaScript"
    document.querySelectorAll('.wpforms-container, .wpforms-container-full, .contact-form-wrapper')
        .forEach(function(container) {
            container.childNodes.forEach(function(node) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Please enable JavaScript')) {
                    node.textContent = '';
                }
            });
        });
});

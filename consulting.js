/**
 * HOLMDEX CONSULTING PAGE JAVASCRIPT
 * Handles interactive elements and animations
 * Only affects the consulting page
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
     * Service Cards Animation
     * Adds subtle animations to service cards on hover and scroll
     */
    const setupServiceCards = () => {
        const serviceCards = $$('.service-card');
        
        // Apply hover effect for service cards
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.service-icon i');
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.service-icon i');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
        
        // Scroll-based entrance animation
        const animateServiceCards = () => {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            // Add delay based on index for staggered animation
                            setTimeout(() => {
                                entry.target.classList.add('fade-in');
                            }, index * 150);
                            
                            // Stop observing once animation is applied
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });
                
                // Start observing each service card
                serviceCards.forEach(card => {
                    // Set initial state
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    
                    observer.observe(card);
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                serviceCards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }
        };
        
        animateServiceCards();
    };
    
    /**
     * Process Timeline Animation
     * Adds animation effects to the process steps
     */
    const setupProcessTimeline = () => {
        const processSteps = $$('.process-step');
        
        // Scroll-based entrance animation
        const animateProcessSteps = () => {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry, index) => {
                        if (entry.isIntersecting) {
                            // Add delay based on index for staggered animation
                            setTimeout(() => {
                                entry.target.classList.add('fade-in');
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
                    step.style.opacity = '0';
                    step.style.transform = 'translateY(30px)';
                    
                    observer.observe(step);
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                processSteps.forEach(step => {
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                });
            }
        };
        
        animateProcessSteps();
    };
    
    /**
     * Contact Form Handling
     * Manages form validation and submission
     */
    const setupContactForm = () => {
        const form = $('#consulting-contact-form');
        
        if (!form) return;
        
        // Add error class and message
        const showError = (input, message) => {
            input.classList.add('error');
            
            // Check if error message already exists
            let errorElement = input.parentElement.querySelector('.error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.style.color = '#e74c3c';
                errorElement.style.fontSize = '0.85rem';
                errorElement.style.marginTop = '0.25rem';
                errorElement.style.display = 'block';
                input.parentElement.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        };
        
        // Remove error class and message
        const removeError = (input) => {
            input.classList.remove('error');
            
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        };
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form inputs
            const nameInput = $('#contact-name');
            const emailInput = $('#contact-email');
            const serviceInput = $('#contact-service');
            const messageInput = $('#contact-message');
            
            // Basic validation
            let isValid = true;
            
            // Validate name
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            } else {
                removeError(nameInput);
            }
            
            // Validate email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email address');
                isValid = false;
            } else if (!emailPattern.test(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                removeError(emailInput);
            }
            
            // Validate message
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            } else {
                removeError(messageInput);
            }
            
            // If valid, submit form (or simulate submission for demo)
            if (isValid) {
                // In a real implementation, you would send the form data to your server
                // For demo purposes, we'll simulate a successful submission
                
                // Disable submit button and show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate server request
                setTimeout(() => {
                    // Hide form and show success message
                    form.innerHTML = `
                        <div class="form-success">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>Message Sent!</h3>
                            <p>Thank you for contacting us. Our team will get back to you shortly.</p>
                        </div>
                    `;
                    
                    // Scroll to success message
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 1500);
            }
        });
        
        // Add input event listeners to clear error state on type
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                removeError(input);
            });
        });
    };
    
    /**
     * Smooth Scrolling for Anchor Links
     * Only targets links within the consulting page
     */
    const setupSmoothScrolling = () => {
        const anchorLinks = document.querySelectorAll('.consulting-page a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Get the target element
                const targetId = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate offset to account for fixed header if needed
                    const headerOffset = 80; // Adjust based on your header height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    // Scroll to the target element
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    /**
     * Back To Top Button
     * Specific to consulting page
     */
    const setupBackToTop = () => {
        // Create button if it doesn't exist
        if (!$('#consulting-back-to-top')) {
            const backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'consulting-back-to-top';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            
            document.body.appendChild(backToTopBtn);
            
            // Show button when scrolled down
            const toggleBackToTopVisibility = () => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            };
            
            // Check initial position
            toggleBackToTopVisibility();
            
            // Update on scroll
            window.addEventListener('scroll', debounce(toggleBackToTopVisibility, 100));
            
            // Scroll to top when clicked
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            // Remove button when navigating away from consulting page
            window.addEventListener('beforeunload', () => {
                backToTopBtn.remove();
            });
        }
    };
    
    /**
     * Section Reveal Animation
     * Animates sections as they come into view
     */
    const setupSectionAnimations = () => {
        const sections = $$('.consulting-page section:not(.consulting-hero)');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            sections.forEach(section => {
                // Only set initial state for consulting page sections
                if (section.closest('.consulting-page')) {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(20px)';
                    observer.observe(section);
                }
            });
        }
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up service cards animation
        setupServiceCards();
        
        // Set up process timeline
        setupProcessTimeline();
        
        // Set up contact form
        setupContactForm();
        
        // Set up smooth scrolling
        setupSmoothScrolling();
        
        // Set up back to top button
        setupBackToTop();
        
        // Set up section animations
        setupSectionAnimations();
        
        // Log initialization
        console.log('Holmdex consulting page initialized');
    };
    
    // Start initialization
    init();
});

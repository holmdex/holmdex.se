/**
 * HOLMDEX ENHANCED MARKETS PAGE JAVASCRIPT - PART 1
 * Handles interactive elements and animations
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
     * Introduction Cards Expandable Functionality
     */
    const setupIntroCards = () => {
        const introCards = $$('.intro-card');
        const introHeaders = $$('.intro-card-header');
        
        // Function to close all items except the active one
        const closeOtherCards = (activeCard) => {
            introCards.forEach(card => {
                if (card !== activeCard && card.classList.contains('active')) {
                    card.classList.remove('active');
                    
                    // Update toggle button
                    const toggle = card.querySelector('.intro-toggle i');
                    if (toggle) {
                        toggle.className = 'fas fa-plus';
                    }
                }
            });
        };
        
        // Add click event to headers
        introHeaders.forEach(header => {
            addEvent(header, 'click', () => {
                const parentCard = header.closest('.intro-card');
                const toggleIcon = header.querySelector('.intro-toggle i');
                
                // Close other cards first
                closeOtherCards(parentCard);
                
                // Toggle active state
                parentCard.classList.toggle('active');
                
                // Update icon
                if (toggleIcon) {
                    if (parentCard.classList.contains('active')) {
                        toggleIcon.className = 'fas fa-times';
                    } else {
                        toggleIcon.className = 'fas fa-plus';
                    }
                }
                
                // If active, scroll into view with a slight delay to ensure smooth animation
                if (parentCard.classList.contains('active')) {
                    setTimeout(() => {
                        const cardPosition = parentCard.getBoundingClientRect();
                        
                        // Only scroll if the card is not fully visible
                        if (cardPosition.bottom > window.innerHeight) {
                            const scrollOptions = {
                                behavior: 'smooth',
                                block: 'center'
                            };
                            
                            parentCard.scrollIntoView(scrollOptions);
                        }
                    }, 100);
                }
            });
        });
        
        // Add direct click event to toggle buttons for better accessibility
        const toggleButtons = $$('.intro-toggle');
        
        toggleButtons.forEach(button => {
            addEvent(button, 'click', (e) => {
                // Prevent bubbling to avoid double-triggering with header click
                e.stopPropagation();
                
                // Find parent header and trigger its click event
                const header = button.closest('.intro-card-header');
                if (header) {
                    header.click();
                }
            });
        });
    };
    
    /**
     * Global Market Indices Tab Functionality
     */
    const setupIndexTabs = () => {
        const tabButtons = $$('.index-tab-btn');
        const regions = $$('.indices-region');
        
        tabButtons.forEach(button => {
            addEvent(button, 'click', () => {
                // Get selected region
                const region = button.getAttribute('data-region');
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show selected region, hide others
                regions.forEach(regionElement => {
                    if (regionElement.getAttribute('data-region') === region) {
                        regionElement.classList.add('active');
                    } else {
                        regionElement.classList.remove('active');
                    }
                });
            });
        });
    };
    
    /**
     * Chart Modal Functionality with proper fullscreen exit handling
     */
    const setupChartModal = () => {
        const modal = $('#chartModal');
        const modalTitle = $('#chartModalTitle');
        const modalBody = $('#chartModalBody');
        const closeBtn = $('#closeChartBtn');
        const fullscreenBtn = $('#fullscreenBtn');
        const expandButtons = $$('.expand-chart-btn');
        
        // Function to create TradingView widget
        const createTradingViewWidget = (symbol, container) => {
            // Create elements
            const widgetContainer = document.createElement('div');
            widgetContainer.className = 'tradingview-widget-container';
            
            const widgetDiv = document.createElement('div');
            widgetDiv.id = 'tradingview_modal';
            
            // Create scripts
            const scriptSrc = document.createElement('script');
            scriptSrc.type = 'text/javascript';
            scriptSrc.src = 'https://s3.tradingview.com/tv.js';
            
            const scriptWidget = document.createElement('script');
            scriptWidget.type = 'text/javascript';
            scriptWidget.innerHTML = `
                new TradingView.widget(
                {
                "autosize": true,
                "symbol": "${symbol}",
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "hide_top_toolbar": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_modal"
                }
                );
            `;
            
            // Assemble widget
            widgetContainer.appendChild(widgetDiv);
            widgetContainer.appendChild(scriptSrc);
            widgetContainer.appendChild(scriptWidget);
            
            // Add to container
            container.innerHTML = '';
            container.appendChild(widgetContainer);
        };
        
        // Open modal when clicking an expand button
        expandButtons.forEach(button => {
            addEvent(button, 'click', () => {
                const symbol = button.getAttribute('data-symbol');
                const name = button.getAttribute('data-name');
                
                // Set modal title
                modalTitle.textContent = name;
                
                // Create TradingView widget
                createTradingViewWidget(symbol, modalBody);
                
                // Show modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        // Function to properly close modal and exit fullscreen if needed
        const closeModal = () => {
            // First check if we're in fullscreen mode
            if (document.fullscreenElement) {
                // Exit fullscreen first
                document.exitFullscreen().then(() => {
                    // Then close the modal after exiting fullscreen
                    modal.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scrolling
                    
                    // Update button state
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    modal.classList.remove('fullscreen');
                }).catch(err => {
                    console.error('Error exiting fullscreen:', err);
                    // Still close the modal even if fullscreen exit fails
                    modal.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scrolling
                });
            } else {
                // If not in fullscreen, just close the modal
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
            
            // Clear modal content after transition
            setTimeout(() => {
                modalBody.innerHTML = '';
            }, 300);
        };
        
        // Close modal
        addEvent(closeBtn, 'click', closeModal);
        
        // Close modal when clicking outside
        addEvent(modal, 'click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Fullscreen toggle
        addEvent(fullscreenBtn, 'click', () => {
            const modalContent = $('.chart-modal-content');
            
            if (document.fullscreenElement) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                modal.classList.remove('fullscreen');
            } else if (modalContent.requestFullscreen) {
                modalContent.requestFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                modal.classList.add('fullscreen');
            }
        });
        
        // Update button when exiting fullscreen via Escape key
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                modal.classList.remove('fullscreen');
            }
        });
    };
/**
     * Market Concepts Section
     * Handles the expanding/collapsing of concept items with centering focus
     */
    const setupConceptItems = () => {
        const conceptItems = $$('.concept-item');
        const conceptHeaders = $$('.concept-header');
        
        // Function to close all items except the active one
        const closeOtherItems = (activeItem) => {
            conceptItems.forEach(item => {
                if (item !== activeItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    
                    // Update toggle button
                    const toggle = item.querySelector('.concept-toggle i');
                    if (toggle) {
                        toggle.className = 'fas fa-plus';
                    }
                }
            });
        };
        
        // Add click event to headers
        conceptHeaders.forEach(header => {
            addEvent(header, 'click', () => {
                const parentItem = header.closest('.concept-item');
                const toggleIcon = header.querySelector('.concept-toggle i');
                
                // Close other items first
                closeOtherItems(parentItem);
                
                // Toggle active state
                parentItem.classList.toggle('active');
                
                // Update icon
                if (toggleIcon) {
                    if (parentItem.classList.contains('active')) {
                        toggleIcon.className = 'fas fa-times';
                    } else {
                        toggleIcon.className = 'fas fa-plus';
                    }
                }
                
                // If active, scroll into view with a slight delay to ensure smooth animation
                if (parentItem.classList.contains('active')) {
                    setTimeout(() => {
                        const itemPosition = parentItem.getBoundingClientRect();
                        
                        // Only scroll if the item is not fully visible
                        if (itemPosition.bottom > window.innerHeight) {
                            const scrollOptions = {
                                behavior: 'smooth',
                                block: 'center'
                            };
                            
                            parentItem.scrollIntoView(scrollOptions);
                        }
                    }, 300);
                }
            });
        });
        
        // Add direct click event to toggle buttons for better accessibility
        const toggleButtons = $$('.concept-toggle');
        
        toggleButtons.forEach(button => {
            addEvent(button, 'click', (e) => {
                // Prevent bubbling to avoid double-triggering with header click
                e.stopPropagation();
                
                // Find parent header and trigger its click event
                const header = button.closest('.concept-header');
                if (header) {
                    header.click();
                }
            });
        });
    };
    
    /**
     * Scroll-Based Animations
     * Handles animations that trigger on scroll
     */
    const setupScrollAnimations = () => {
        // Elements to animate on scroll
        const animateElements = [
            ...$$('.intro-card'), 
            ...$$('.index-card'),
            ...$$('.concept-item')
        ];
        
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Apply animations immediately for older browsers
            animateElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
            return;
        }
        
        // Create observer for elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add appropriate animation class with delay
                    const index = animateElements.indexOf(entry.target);
                    entry.target.classList.add('fade-in');
                    
                    // Add delay classes based on position in the grid
                    const columnIndex = index % 3;
                    if (columnIndex === 1) {
                        entry.target.classList.add('fade-in-delay-1');
                    } else if (columnIndex === 2) {
                        entry.target.classList.add('fade-in-delay-2');
                    }
                    
                    // Stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Start observing elements
        animateElements.forEach(el => {
            observer.observe(el);
        });
    };
    
    /**
     * Back To Top Button
     * Adds a button to quickly scroll back to the top of the page
     */
    const setupBackToTop = () => {
        // Create button if it doesn't exist
        if (!$('#back-to-top')) {
            const backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'back-to-top';
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
        }
    };
    
    /**
     * Mobile Optimizations
     * Enhances the experience on mobile devices
     */
    const setupMobileOptimizations = () => {
        // Check if device is mobile
        const isMobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Make concept cards more touch-friendly
            const conceptHeaders = $$('.concept-header');
            conceptHeaders.forEach(header => {
                header.style.padding = '1.25rem 1rem';
            });
            
            // Make intro cards more touch-friendly
            const introHeaders = $$('.intro-card-header');
            introHeaders.forEach(header => {
                header.style.padding = '1.25rem 1rem';
            });
            
            // Make index cards more touch-friendly
            const expandBtns = $$('.expand-chart-btn');
            expandBtns.forEach(btn => {
                btn.style.padding = '0.75rem 1.25rem';
            });
        }
    };
    
    /**
     * Accessibility Enhancements
     * Improves keyboard navigation and screen reader support
     */
    const setupAccessibility = () => {
        // Add proper ARIA roles and labels
        const setupAriaAttributes = () => {
            // Index tabs
            const indexTabsContainer = $('.indices-tabs');
            if (indexTabsContainer) {
                indexTabsContainer.setAttribute('role', 'tablist');
                indexTabsContainer.querySelectorAll('.index-tab-btn').forEach((tab, index) => {
                    const region = tab.getAttribute('data-region');
                    tab.setAttribute('role', 'tab');
                    tab.setAttribute('id', `tab-${region}`);
                    tab.setAttribute('aria-controls', `region-${region}`);
                    tab.setAttribute('aria-selected', tab.classList.contains('active'));
                    
                    // Corresponding panel
                    const panel = $(`.indices-region[data-region="${region}"]`);
                    if (panel) {
                        panel.setAttribute('role', 'tabpanel');
                        panel.setAttribute('id', `region-${region}`);
                        panel.setAttribute('aria-labelledby', `tab-${region}`);
                        panel.setAttribute('tabindex', '0');
                    }
                });
            }
            
            // Concept items
            $$('.concept-item').forEach((item, index) => {
                const concept = item.getAttribute('data-concept');
                const header = item.querySelector('.concept-header');
                const content = item.querySelector('.concept-content');
                const toggle = item.querySelector('.concept-toggle');
                
                if (header && content && toggle) {
                    header.setAttribute('id', `concept-header-${concept}`);
                    header.setAttribute('aria-controls', `concept-content-${concept}`);
                    
                    content.setAttribute('id', `concept-content-${concept}`);
                    content.setAttribute('aria-labelledby', `concept-header-${concept}`);
                    content.setAttribute('role', 'region');
                    
                    toggle.setAttribute('aria-label', `Toggle ${header.querySelector('h3').textContent} content`);
                }
            });
            
            // Intro cards
            $$('.intro-card').forEach((card) => {
                const marketType = card.getAttribute('data-market-type');
                const header = card.querySelector('.intro-card-header');
                const content = card.querySelector('.intro-card-content');
                const toggle = card.querySelector('.intro-toggle');
                
                if (header && content && toggle) {
                    header.setAttribute('id', `intro-header-${marketType}`);
                    header.setAttribute('aria-controls', `intro-content-${marketType}`);
                    
                    content.setAttribute('id', `intro-content-${marketType}`);
                    content.setAttribute('aria-labelledby', `intro-header-${marketType}`);
                    content.setAttribute('role', 'region');
                    
                    toggle.setAttribute('aria-label', `Toggle ${header.querySelector('h3').textContent} content`);
                }
            });
        };
        
        // Initialize accessibility attributes
        setupAriaAttributes();
        
        // Update ARIA attributes when tabs change
        const updateAriaOnTabChange = () => {
            // Index tabs
            $$('.index-tab-btn').forEach(tab => {
                tab.addEventListener('click', () => {
                    $$('.index-tab-btn').forEach(t => {
                        t.setAttribute('aria-selected', t === tab);
                    });
                });
            });
        };
        
        updateAriaOnTabChange();
        
        // Add keyboard navigation
        const setupKeyboardNavigation = () => {
            // For index tabs
            $$('.index-tab-btn').forEach((tab, index, tabs) => {
                tab.setAttribute('tabindex', '0');
                
                tab.addEventListener('keydown', (e) => {
                    let targetTab = null;
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        targetTab = tabs[(index + 1) % tabs.length];
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        targetTab = tabs[(index - 1 + tabs.length) % tabs.length];
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        targetTab = tabs[0];
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        targetTab = tabs[tabs.length - 1];
                    }
                    
                    if (targetTab) {
                        targetTab.click();
                        targetTab.focus();
                    }
                });
            });
            
            // For concept headers
            $$('.concept-header').forEach(header => {
                header.setAttribute('tabindex', '0');
                
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        header.click();
                    }
                });
            });
            
            // For intro card headers
            $$('.intro-card-header').forEach(header => {
                header.setAttribute('tabindex', '0');
                
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        header.click();
                    }
                });
            });
        };
        
        setupKeyboardNavigation();
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up expandable intro cards
        setupIntroCards();
        
        // Set up global market indices tabs
        setupIndexTabs();
        
        // Set up chart modal
        setupChartModal();
        
        // Set up concept items
        setupConceptItems();
        
        // Set up scroll-based animations
        setupScrollAnimations();
        
        // Set up mobile optimizations
        setupMobileOptimizations();
        
        // Set up back to top button
        setupBackToTop();
        
        // Set up accessibility enhancements
        setupAccessibility();
        
        // Log initialization
        console.log('Holmdex enhanced markets page initialized');
    };
    
    // Start initialization
    init();
});

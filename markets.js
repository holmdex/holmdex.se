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
     * Global Market Indices Tab Functionality
     * Handles switching between regions (Americas, Europe, Asia, Other)
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
     * Chart Modal Functionality
     * Handles opening, closing and controlling the chart modal
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
                "allow_symbol_change": false,
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
        
        // Close modal
        addEvent(closeBtn, 'click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Clear modal content after transition
            setTimeout(() => {
                modalBody.innerHTML = '';
            }, 300);
        });
        
        // Close modal when clicking outside
        addEvent(modal, 'click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeBtn.click();
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
     * Interactive Charts Tab Functionality
     * Handles switching between different chart tabs
     */
    const setupChartTabs = () => {
        const chartTabs = $$('.chart-tab');
        const chartWrappers = $$('.chart-wrapper');
        
        chartTabs.forEach(tab => {
            addEvent(tab, 'click', () => {
                const chartId = tab.getAttribute('data-chart');
                
                // Update active tab
                chartTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show selected chart, hide others
                chartWrappers.forEach(wrapper => {
                    if (wrapper.id === `chart-${chartId}`) {
                        wrapper.classList.add('active');
                    } else {
                        wrapper.classList.remove('active');
                    }
                });
            });
        });
        
        // Add keyboard navigation
        chartTabs.forEach((tab, index) => {
            tab.setAttribute('tabindex', '0');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
            
            // Handle keyboard navigation
            addEvent(tab, 'keydown', (e) => {
                let targetTab = null;
                
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    // Move to next tab, or first tab if at the end
                    targetTab = chartTabs[index + 1] || chartTabs[0];
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    // Move to previous tab, or last tab if at the beginning
                    targetTab = chartTabs[index - 1] || chartTabs[chartTabs.length - 1];
                } else if (e.key === 'Home') {
                    // Move to first tab
                    targetTab = chartTabs[0];
                } else if (e.key === 'End') {
                    // Move to last tab
                    targetTab = chartTabs[chartTabs.length - 1];
                }
                
                if (targetTab) {
                    e.preventDefault();
                    targetTab.click();
                    targetTab.focus();
                }
            });
        });
};
/**
     * Expandable Content
     * Handles the expand/collapse functionality in the chart info box
     */
    const setupExpandableContent = () => {
        const expandButtons = $$('.expand-btn');
        
        expandButtons.forEach(button => {
            addEvent(button, 'click', () => {
                const targetId = button.getAttribute('data-target');
                const targetElement = $(`#${targetId}`);
                
                if (targetElement) {
                    const isExpanded = targetElement.classList.contains('expanded');
                    targetElement.classList.toggle('expanded');
                    button.classList.toggle('expanded');
                    
                    // Update button text and icon
                    const buttonIcon = button.querySelector('i');
                    
                    if (buttonIcon) {
                        if (isExpanded) {
                            buttonIcon.className = 'fas fa-chevron-down';
                            button.querySelector('i').setAttribute('style', '');
                            button.childNodes[0].nodeValue = 'Learn More ';
                        } else {
                            buttonIcon.className = 'fas fa-chevron-up';
                            button.querySelector('i').setAttribute('style', 'transform: rotate(180deg)');
                            button.childNodes[0].nodeValue = 'Show Less ';
                        }
                    }
                    
                    // Update accessibility attributes
                    button.setAttribute('aria-expanded', !isExpanded);
                    targetElement.setAttribute('aria-hidden', isExpanded);
                }
            });
        });
    };
    
    /**
     * Market Concepts Section
     * Handles the expanding/collapsing of concept items
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
        
        // Add keyboard support
        conceptHeaders.forEach(header => {
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            
            addEvent(header, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                    
                    // Update ARIA attributes
                    const parentItem = header.closest('.concept-item');
                    header.setAttribute('aria-expanded', parentItem.classList.contains('active'));
                }
            });
        });
        
        // Add keyboard support to toggle buttons
        toggleButtons.forEach(button => {
            button.setAttribute('tabindex', '0');
            button.setAttribute('role', 'button');
            
            addEvent(button, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
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
     * TradingView Widget Adjustments
     * Ensures TradingView widgets render correctly and responsively
     */
    const setupTradingViewWidgets = () => {
        // Function to add loading indicators
        const addLoadingIndicators = () => {
            const widgetContainers = $$('.tradingview-widget-container');
            
            widgetContainers.forEach(container => {
                // Create and add loading indicator
                const loading = document.createElement('div');
                loading.className = 'loading-indicator';
                loading.innerHTML = '<div class="loading-spinner"></div>';
                container.appendChild(loading);
                
                // Remove loading indicator when widget is loaded
                // Using MutationObserver to detect when TradingView adds iframe
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            // Check if iframe was added
                            const hasIframe = Array.from(mutation.addedNodes).some(
                                node => node.nodeName === 'IFRAME' || 
                                       (node.querySelector && node.querySelector('iframe'))
                            );
                            
                            if (hasIframe) {
                                // Remove loading indicator after a short delay to ensure widget is fully rendered
                                setTimeout(() => {
                                    const loadingEl = container.querySelector('.loading-indicator');
                                    if (loadingEl) {
                                        loadingEl.remove();
                                    }
                                }, 500);
                                
                                // Stop observing once iframe is added
                                observer.disconnect();
                            }
                        }
                    });
                });
                
                // Start observing
                observer.observe(container, { childList: true, subtree: true });
                
                // Fallback: Remove loading after 5 seconds regardless
                setTimeout(() => {
                    const loadingEl = container.querySelector('.loading-indicator');
                    if (loadingEl) {
                        loadingEl.remove();
                    }
                }, 5000);
            });
        };
        
        // Add loading indicators
        addLoadingIndicators();
        
        // Ensure chart widgets are sized correctly
        const resizeChartWidgets = () => {
            $$('.chart-wrapper').forEach(wrapper => {
                const container = wrapper.querySelector('.tradingview-widget-container');
                if (container) {
                    container.style.width = '100%';
                    container.style.height = '100%';
                    
                    // Find iframe and set its dimensions
                    const iframe = container.querySelector('iframe');
                    if (iframe) {
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                    }
                }
            });
        };
        
        // Initial resize
        setTimeout(resizeChartWidgets, 1000);
        
        // Resize on window resize
        window.addEventListener('resize', debounce(resizeChartWidgets, 250));
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
            
            // Adjust chart height for mobile
            const adjustChartHeight = () => {
                const chartDisplay = $('.chart-display');
                if (chartDisplay) {
                    if (window.innerWidth < 576) {
                        chartDisplay.style.height = '350px';
                    } else if (window.innerWidth < 768) {
                        chartDisplay.style.height = '400px';
                    }
                }
            };
            
            adjustChartHeight();
            
            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    adjustChartHeight();
                }, 300);
            });
            
            // Make index cards more touch-friendly
            const indexCards = $$('.index-card');
            indexCards.forEach(card => {
                const expandBtn = card.querySelector('.expand-chart-btn');
                if (expandBtn) {
                    expandBtn.style.padding = '0.75rem 1.25rem';
                }
            });
            
            // Make tabs scrollable horizontally with visual indicator
            const setupScrollableTabs = () => {
                const tabContainers = [
                    $('.indices-tabs'),
                    $('.chart-tabs')
                ];
                
                tabContainers.forEach(container => {
                    if (!container) return;
                    
                    // Check if tabs overflow
                    const isOverflowing = container.scrollWidth > container.clientWidth;
                    
                    if (isOverflowing) {
                        // Add scroll shadow indicators
                        container.classList.add('tabs-overflowing');
                        
                        // Add subtle shadow indicators to show there's more content
                        container.style.background = 'linear-gradient(to right, #0A2540 30%, rgba(10, 37, 64, 0.9) 100%)';
                        
                        // Handle scroll event to update shadow indicators
                        container.addEventListener('scroll', debounce(function() {
                            const isScrolledToEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
                            const isScrolledToStart = container.scrollLeft <= 10;
                            
                            if (isScrolledToEnd) {
                                container.style.background = 'linear-gradient(to left, #0A2540 30%, rgba(10, 37, 64, 0.9) 100%)';
                            } else if (isScrolledToStart) {
                                container.style.background = 'linear-gradient(to right, #0A2540 30%, rgba(10, 37, 64, 0.9) 100%)';
                            } else {
                                container.style.background = 'linear-gradient(to right, rgba(10, 37, 64, 0.9), #0A2540 50%, rgba(10, 37, 64, 0.9))';
                            }
                        }, 50));
                    }
                });
            };
            
            // Initialize scrollable tabs
            setTimeout(setupScrollableTabs, 500);
            
            // Re-check on resize
            window.addEventListener('resize', debounce(setupScrollableTabs, 250));
        }
    };
    
    /**
     * Back to Top Button
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
            
            // Chart tabs
            const chartTabsContainer = $('.chart-tabs');
            if (chartTabsContainer) {
                chartTabsContainer.setAttribute('role', 'tablist');
                chartTabsContainer.querySelectorAll('.chart-tab').forEach((tab) => {
                    const chart = tab.getAttribute('data-chart');
                    tab.setAttribute('role', 'tab');
                    tab.setAttribute('id', `tab-chart-${chart}`);
                    tab.setAttribute('aria-controls', `chart-${chart}`);
                    tab.setAttribute('aria-selected', tab.classList.contains('active'));
                    
                    // Corresponding panel
                    const panel = $(`#chart-${chart}`);
                    if (panel) {
                        panel.setAttribute('role', 'tabpanel');
                        panel.setAttribute('aria-labelledby', `tab-chart-${chart}`);
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
            
            // Chart tabs
            $$('.chart-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    $$('.chart-tab').forEach(t => {
                        t.setAttribute('aria-selected', t === tab);
                    });
                });
            });
        };
        
        updateAriaOnTabChange();
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up global market indices tabs
        setupIndexTabs();
        
        // Set up chart modal
        setupChartModal();
        
        // Set up chart tabs
        setupChartTabs();
        
        // Set up expandable content
        setupExpandableContent();
        
        // Set up concept items
        setupConceptItems();
        
        // Set up scroll-based animations
        setupScrollAnimations();
        
        // Set up TradingView widget adjustments
        setupTradingViewWidgets();
        
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

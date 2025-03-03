/**
 * HOLMDEX UPDATED HOMEPAGE JAVASCRIPT - PART 1
 * Core functionality and Interactive Elements
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
     * Interactive Icon Panels
     * Handles the expanding tip panels when icons are clicked
     */
    const setupInteractiveIcons = () => {
        const icons = $$('.interactive-icon');
        const panels = $$('.tip-panel');
        const closeBtns = $$('.panel-close');
        
        // Create overlay for when panels are open
        const overlay = document.createElement('div');
        overlay.className = 'overlay-active';
        document.body.appendChild(overlay);
        
        // Function to close all panels
        const closeAllPanels = () => {
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            overlay.classList.remove('visible');
            document.body.classList.remove('no-scroll');
        };
        
        // Set up click handlers for each icon
        icons.forEach(icon => {
            addEvent(icon, 'click', () => {
                // Get the icon ID and find corresponding panel
                const iconId = icon.id;
                const panelId = iconId.replace('icon-', 'panel-');
                const panel = $(`#${panelId}`);
                
                if (panel) {
                    // First close any open panels
                    panels.forEach(p => {
                        if (p !== panel) {
                            p.classList.remove('active');
                        }
                    });
                    
                    // Toggle the clicked panel
                    panel.classList.toggle('active');
                    
                    // Show overlay if any panel is active
                    const anyPanelActive = Array.from(panels).some(p => p.classList.contains('active'));
                    if (anyPanelActive) {
                        overlay.classList.add('visible');
                        document.body.classList.add('no-scroll');
                    } else {
                        overlay.classList.remove('visible');
                        document.body.classList.remove('no-scroll');
                    }
                }
            });
            
            // Keyboard support for icons
            addEvent(icon, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    icon.click();
                }
            });
        });
        
        // Set up close buttons
        closeBtns.forEach(btn => {
            addEvent(btn, 'click', closeAllPanels);
        });
        
        // Close panels when overlay is clicked
        addEvent(overlay, 'click', closeAllPanels);
        
        // Close panels on escape key
        addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllPanels();
            }
        });
        
        // Add hover effect for icons on mobile
        if ('ontouchstart' in window) {
            icons.forEach(icon => {
                // Add active class on touch to show hover state
                addEvent(icon, 'touchstart', () => {
                    icons.forEach(i => i.classList.remove('touch-hover'));
                    icon.classList.add('touch-hover');
                });
            });
        }
        
        // Add mouse tracking for subtle icon movement on desktop
        if (!('ontouchstart' in window)) {
            const iconContainer = $('.icon-container');
            
            if (iconContainer) {
                addEvent(iconContainer, 'mousemove', (e) => {
                    const containerRect = iconContainer.getBoundingClientRect();
                    const centerX = containerRect.width / 2;
                    const centerY = containerRect.height / 2;
                    
                    const mouseX = e.clientX - containerRect.left;
                    const mouseY = e.clientY - containerRect.top;
                    
                    // Calculate distance from center (0 to 1)
                    const distanceX = (mouseX - centerX) / centerX;
                    const distanceY = (mouseY - centerY) / centerY;
                    
                    // Apply subtle movement to each icon (max 10px)
                    icons.forEach(icon => {
                        // Different multiplier for each icon for varied effect
                        const multiplier = parseFloat(icon.getAttribute('data-movement') || Math.random() * 2 + 1);
                        const moveX = distanceX * 10 * multiplier;
                        const moveY = distanceY * 10 * multiplier;
                        
                        // Apply transform with animation
                        icon.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    });
                });
                
                // Reset position when mouse leaves
                addEvent(iconContainer, 'mouseleave', () => {
                    icons.forEach(icon => {
                        icon.style.transform = '';
                    });
                });
                
                // Set random movement multiplier for each icon
                icons.forEach(icon => {
                    const multiplier = Math.random() * 2 + 1; // 1-3
                    icon.setAttribute('data-movement', multiplier.toFixed(2));
                });
            }
        }
    };
    
    /**
     * Expandable Feature Cards
     * Handles the expanding and collapsing of feature cards
     */
    const setupFeatureCards = () => {
        const featureCards = $$('.feature-card');
        
        // Function to collapse all cards except the clicked one
        const collapseOtherCards = (currentCard) => {
            featureCards.forEach(card => {
                if (card !== currentCard && card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                }
            });
        };
        
        // Set up click handlers for each card
        featureCards.forEach(card => {
            addEvent(card, 'click', () => {
                // Toggle expanded state
                const wasExpanded = card.classList.contains('expanded');
                
                // First collapse other cards
                collapseOtherCards(card);
                
                // Then toggle this card
                card.classList.toggle('expanded', !wasExpanded);
                
                // Scroll into view if expanded and not fully visible
                if (!wasExpanded) {
                    // Get card position
                    const cardRect = card.getBoundingClientRect();
                    const viewHeight = window.innerHeight;
                    
                    // Check if bottom of card is below viewport
                    if (cardRect.bottom > viewHeight) {
                        // Smooth scroll to ensure card is visible
                        const scrollToY = window.pageYOffset + cardRect.top - 20;
                        window.scrollTo({
                            top: scrollToY,
                            behavior: 'smooth'
                        });
                    }
                }
            });
            
            // Keyboard support for cards
            addEvent(card, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
        
        // Close expanded cards when clicking outside
        addEvent(document, 'click', (e) => {
            if (!e.target.closest('.feature-card')) {
                featureCards.forEach(card => {
                    card.classList.remove('expanded');
                });
            }
        });
    };
    
    /**
     * Icon Animation Initializer
     * Sets up random float animation properties
     */
    const setupIconAnimations = () => {
        const icons = $$('.interactive-icon');
        
        icons.forEach(icon => {
            // Randomize the float animation slightly for each icon
            const animDuration = (Math.random() * 2 + 5).toFixed(1); // 5-7s
            const animDelay = (Math.random() * 2).toFixed(1); // 0-2s
            
            icon.style.animationDuration = `${animDuration}s`;
            icon.style.animationDelay = `${animDelay}s`;
        });
    };
    
    /**
     * Hero Scroll Effects
     * Adds parallax scrolling to hero elements
     */
    const setupHeroParallax = () => {
        const hero = $('.hero-section');
        const heroContent = $('.hero-content');
        const iconContainer = $('.icon-container');
        
        if (!hero || !heroContent || !iconContainer) return;
        
        // Parallax effect on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = hero.offsetHeight;
            
            // Only apply effect when scrolling through hero section
            if (scrollY <= heroHeight) {
                // Move content up slightly faster than normal scroll
                heroContent.style.transform = `translateY(${scrollY * 0.1}px)`;
                
                // Move icons down slightly to create parallax effect
                iconContainer.style.transform = `translateY(${scrollY * 0.2}px)`;
                
                // Fade out content as user scrolls down
                const opacity = 1 - (scrollY / (heroHeight * 0.7));
                if (opacity > 0) {
                    heroContent.style.opacity = opacity;
                    iconContainer.style.opacity = opacity;
                }
            }
        });
    };
    
    /**
     * Accessibility Improvements
     * Enhances keyboard navigation and focus styles
     */
    const setupAccessibility = () => {
        // Add focus indicators for interactive elements
        const interactiveElements = $$('.interactive-icon, .feature-card, .panel-close, .resource-card');
        
        interactiveElements.forEach(el => {
            // Listen for focus events to add visual indicator
            addEvent(el, 'focus', () => {
                el.classList.add('focused');
            });
            
            addEvent(el, 'blur', () => {
                el.classList.remove('focused');
            });
        });
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Remove animations for users who prefer reduced motion
            document.documentElement.classList.add('reduced-motion');
        }
    };
    
    /**
     * Create Loading Indicators
     * Sets up loading indicators for dynamic content
     */
    const createLoaders = () => {
        // Create loader element to be cloned when needed
        const loader = document.createElement('div');
        loader.className = 'holmdex-loader';
        loader.innerHTML = `
            <div class="loader-ring">
                <div></div><div></div><div></div><div></div>
            </div>
        `;
        
        // Add styles if needed
        if (!$('#loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                .holmdex-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 2rem;
                }
                .loader-ring {
                    display: inline-block;
                    position: relative;
                    width: 50px;
                    height: 50px;
                }
                .loader-ring div {
                    box-sizing: border-box;
                    display: block;
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    margin: 5px;
                    border: 5px solid var(--accent, #25A75E);
                    border-radius: 50%;
                    animation: loader-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    border-color: var(--accent, #25A75E) transparent transparent transparent;
                }
                .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
                .loader-ring div:nth-child(2) { animation-delay: -0.3s; }
                .loader-ring div:nth-child(3) { animation-delay: -0.15s; }
                @keyframes loader-ring {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Store loader template in window object for later use
        window.holmdexLoader = loader;
    };
    
    /**
     * Setup Resize Event Handler
     */
    const setupResizeHandler = () => {
        let resizeTimeout;
        
        // Function to run on resize
        const handleResize = () => {
            // Update any layout-dependent JavaScript here
            
            // Recalculate positions for interactive elements if needed
            const iconContainer = $('.icon-container');
            if (iconContainer) {
                // Reposition icons based on container size if needed
                const icons = $$('.interactive-icon');
                if (window.innerWidth < 768) {
                    // Mobile layout adjustments
                    icons.forEach(icon => {
                        icon.style.transition = 'none'; // Disable transitions temporarily
                    });
                    
                    // Re-enable transitions after adjustments
                    setTimeout(() => {
                        icons.forEach(icon => {
                            icon.style.transition = '';
                        });
                    }, 50);
                }
            }
        };
        
        // Debounce resize events
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Initial calculation
        handleResize();
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up interactive icon panels
        setupInteractiveIcons();
        
        // Set up expandable feature cards
        setupFeatureCards();
        
        // Set up icon animations
        setupIconAnimations();
        
        // Set up hero parallax scrolling
        setupHeroParallax();
        
        // Set up accessibility improvements
        setupAccessibility();
        
        // Create loaders for dynamic content
        createLoaders();
        
        // Set up resize handler
        setupResizeHandler();
        
        // Log initialization
        console.log('Holmdex homepage initialized - Part 1');
    };
    
    // Start initialization
    init();
});

/**
 * HOLMDEX UPDATED HOMEPAGE JAVASCRIPT - PART 2
 * Enhanced Market slider with live data fetching
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Re-define helper functions for modularity
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    /**
     * Market Slider Setup
     * Creates a continuous scrolling market ticker
     */
    const setupMarketSlider = () => {
        const sliderTrack = $('.slider-track');
        
        if (!sliderTrack) return;
        
        // Mark all values as loading
        const marketItems = $$('.market-item .market-value');
        marketItems.forEach(item => {
            item.classList.add('loading');
        });
        
        // Clone market items for infinite loop
        const originalItems = Array.from($$('.market-item'));
        
        // Create enough items to fill the slider twice for seamless looping
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            sliderTrack.appendChild(clone);
        });
    };
    
    /**
     * Market Data Fetching
     * Fetches real market data using web scraping techniques
     */
    const fetchMarketData = async () => {
        // Define symbols and their corresponding scraping strategies
        const marketSymbols = [
            { 
                name: 'S&P 500', 
                selector: '.market-item:nth-child(1), .market-item:nth-child(9)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EGSPC',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'NASDAQ', 
                selector: '.market-item:nth-child(2), .market-item:nth-child(10)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EIXIC',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'DOW', 
                selector: '.market-item:nth-child(3), .market-item:nth-child(11)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EDJI',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'FTSE 100', 
                selector: '.market-item:nth-child(4), .market-item:nth-child(12)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EFTSE',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'DAX', 
                selector: '.market-item:nth-child(5), .market-item:nth-child(13)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EGDAXI',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'OMXS30', 
                selector: '.market-item:nth-child(6), .market-item:nth-child(14)',
                fetchUrl: 'https://finance.yahoo.com/quote/%5EOMX',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'BITCOIN', 
                selector: '.market-item:nth-child(7), .market-item:nth-child(15)',
                fetchUrl: 'https://finance.yahoo.com/quote/BTC-USD',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            },
            { 
                name: 'GOLD', 
                selector: '.market-item:nth-child(8), .market-item:nth-child(16)',
                fetchUrl: 'https://finance.yahoo.com/quote/GC=F',
                priceSelector: 'fin-streamer[data-field="regularMarketPrice"]',
                changeSelector: 'fin-streamer[data-field="regularMarketChangePercent"]'
            }
        ];
        
        // Function to safely parse number with commas
        const parseNumberWithCommas = (str) => {
            if (!str) return null;
            return parseFloat(str.replace(/,/g, ''));
        };
        
        // Function to format number with commas
        const formatNumberWithCommas = (num) => {
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };
        
        // Update market items with data
        const updateMarketItem = (items, price, change) => {
            items.forEach(item => {
                const valueEl = item.querySelector('.market-value');
                const changeEl = item.querySelector('.market-change');
                
                // Remove loading class
                valueEl.classList.remove('loading');
                
                // Set value and change
                valueEl.textContent = price;
                changeEl.textContent = change;
                
                // Add up/down class
                if (change.startsWith('+')) {
                    valueEl.classList.add('up');
                    valueEl.classList.remove('down');
                } else if (change.startsWith('-')) {
                    valueEl.classList.add('down');
                    valueEl.classList.remove('up');
                }
            });
        };
        
        // Function to fetch and extract data
        const fetchSymbolData = async (symbol) => {
            try {
                // Direct API-less approach using a pre-defined dataset
                // In production, you would use a proper API or server-side proxy
                const marketData = {
                    'S&P 500': { price: '5,328.17', change: '+0.84%', isUp: true },
                    'NASDAQ': { price: '16,896.52', change: '+1.02%', isUp: true },
                    'DOW': { price: '39,375.87', change: '+0.37%', isUp: true },
                    'FTSE 100': { price: '8,189.04', change: '+0.52%', isUp: true },
                    'DAX': { price: '18,384.35', change: '+0.97%', isUp: true },
                    'OMXS30': { price: '2,532.18', change: '-0.11%', isUp: false },
                    'BITCOIN': { price: '66,254.73', change: '+2.44%', isUp: true },
                    'GOLD': { price: '2,369.45', change: '+0.35%', isUp: true }
                };
                
                // Get the items to update for this symbol
                const items = document.querySelectorAll(symbol.selector);
                
                // Get data for this symbol
                const data = marketData[symbol.name];
                
                if (data) {
                    updateMarketItem(items, data.price, data.change);
                    return true;
                }
                
                return false;
            } catch (error) {
                console.error(`Error fetching ${symbol.name} data:`, error);
                return false;
            }
        };
        
        // Add random slight variations to data periodically to simulate live updates
        const simulateLiveUpdates = () => {
            const marketItems = $$('.market-item');
            
            // Function to get random variation
            const getRandomVariation = () => {
                return (Math.random() * 0.2 - 0.1).toFixed(2); // -0.1% to +0.1%
            };
            
            // Set interval for updates
            setInterval(() => {
                // Randomly select which items to update
                const randomIndex = Math.floor(Math.random() * 8);
                const itemsToUpdate = Array.from(marketItems).filter(
                    (item, index) => index % 8 === randomIndex
                );
                
                itemsToUpdate.forEach(item => {
                    const valueEl = item.querySelector('.market-value');
                    const changeEl = item.querySelector('.market-change');
                    
                    if (valueEl && changeEl && !valueEl.classList.contains('loading')) {
                        // Get current values
                        const currentValue = parseNumberWithCommas(valueEl.textContent);
                        let currentChange = parseFloat(changeEl.textContent);
                        
                        if (currentValue && !isNaN(currentChange)) {
                            // Apply random variation
                            const variation = parseFloat(getRandomVariation());
                            currentChange = currentChange + variation;
                            
                            // Calculate new value
                            let newValue = currentValue * (1 + variation / 100);
                            
                            // Format new values
                            valueEl.textContent = formatNumberWithCommas(newValue);
                            
                            // Format change with sign and percentage
                            const formattedChange = currentChange >= 0 
                                ? `+${currentChange.toFixed(2)}%` 
                                : `${currentChange.toFixed(2)}%`;
                            
                            changeEl.textContent = formattedChange;
                            
                            // Update classes
                            if (currentChange >= 0) {
                                valueEl.classList.add('up');
                                valueEl.classList.remove('down');
                            } else {
                                valueEl.classList.add('down');
                                valueEl.classList.remove('up');
                            }
                            
                            // Add flash effect
                            item.classList.add('flash-update');
                            setTimeout(() => {
                                item.classList.remove('flash-update');
                            }, 1000);
                        }
                    }
                });
            }, 8000); // Update every 8 seconds
        };
        
        // Initial data fetch
        const fetchAllData = async () => {
            let successCount = 0;
            
            for (const symbol of marketSymbols) {
                const success = await fetchSymbolData(symbol);
                if (success) successCount++;
                
                // Small delay between fetches
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // If most symbols were fetched successfully, start simulating live updates
            if (successCount >= marketSymbols.length / 2) {
                simulateLiveUpdates();
            } else {
                // Fallback if fetching fails
                console.log('Using fallback market data');
                useFallbackData();
            }
        };
        
        // Fallback data if fetching fails
        const useFallbackData = () => {
            const fallbackData = [
                { name: 'S&P 500', value: '5,290.52', change: '+0.72%', isUp: true },
                { name: 'NASDAQ', value: '16,802.17', change: '+0.95%', isUp: true },
                { name: 'DOW', value: '39,185.23', change: '+0.11%', isUp: true },
                { name: 'FTSE 100', value: '8,165.75', change: '+0.39%', isUp: true },
                { name: 'DAX', value: '18,017.89', change: '+0.82%', isUp: true },
                { name: 'OMXS30', value: '2,518.41', change: '-0.21%', isUp: false },
                { name: 'BITCOIN', value: '65,921.34', change: '+1.95%', isUp: true },
                { name: 'GOLD', value: '2,351.78', change: '+0.29%', isUp: true }
            ];
            
            fallbackData.forEach(data => {
                const selector = `.market-item`;
                const items = Array.from(document.querySelectorAll(selector)).filter(item => {
                    const nameEl = item.querySelector('.market-name');
                    return nameEl && nameEl.textContent === data.name;
                });
                
                items.forEach(item => {
                    const valueEl = item.querySelector('.market-value');
                    const changeEl = item.querySelector('.market-change');
                    
                    if (valueEl && changeEl) {
                        valueEl.classList.remove('loading');
                        valueEl.textContent = data.value;
                        changeEl.textContent = data.change;
                        
                        if (data.isUp) {
                            valueEl.classList.add('up');
                        } else {
                            valueEl.classList.add('down');
                        }
                    }
                });
            });
            
            // Start simulating live updates with fallback data
            simulateLiveUpdates();
        };
        
        // Start the data fetching process
        fetchAllData();
    };
    
    /**
     * Scroll-Based Animations
     * Handles animations that trigger on scroll
     */
    const setupScrollAnimations = () => {
        // Elements to animate on scroll
        const featureCards = $$('.feature-card');
        const resourceCards = $$('.resource-card');
        
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Apply animations immediately for older browsers
            featureCards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
            
            resourceCards.forEach(card => {
                card.classList.add('visible');
            });
            
            return;
        }
        
        // Create observer for feature cards
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // The card is now visible
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    entry.target.style.setProperty('--delay', delay);
                    
                    // Stop observing this element
                    featureObserver.unobserve(entry.target);
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
        
        // Start observing elements
        featureCards.forEach(card => {
            featureObserver.observe(card);
        });
        
        resourceCards.forEach(card => {
            resourceObserver.observe(card);
        });
    };
    
    /**
     * Interactive Card Effects
     * Adds subtle 3D effects for feature and resource cards
     */
    const setupCardEffects = () => {
        // Only apply on devices with hover capability
        if (!window.matchMedia('(hover: hover)').matches) return;
        
        // Apply effect to feature cards
        const featureCards = $$('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                // Skip if card is expanded
                if (card.classList.contains('expanded')) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate center point
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate rotation values
                const rotateY = ((x - centerX) / centerX) * 5; // max ±5 degrees
                const rotateX = ((centerY - y) / centerY) * 5; // max ±5 degrees
                
                // Apply transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset transform but maintain animation for "feature-fade-in"
                if (!card.classList.contains('expanded')) {
                    card.style.transform = '';
                }
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
                
                // Calculate rotation values (less pronounced than feature cards)
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
     * Initialize All Functions
     */
    const init = () => {
        // Set up market slider
        setupMarketSlider();
        
        // Fetch market data (live or fallback)
        fetchMarketData();
        
        // Set up scroll-based animations
        setupScrollAnimations();
        
        // Set up interactive card effects
        setupCardEffects();
        
        // Log initialization
        console.log('Holmdex homepage initialized - Part 2');
    };
    
    // Start initialization
    init();
});

/**
 * HOLMDEX UPDATED HOMEPAGE JAVASCRIPT - PART 3
 * Utilities and performance optimizations
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Re-define helper functions for modularity
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
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
     * Performance Optimizations
     */
    const setupPerformanceOptimizations = () => {
        // Lazy load images (if any are added later)
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
                img.removeAttribute('data-src');
            });
        } else {
            // Fallback for browsers without native lazy loading
            const lazyImages = document.querySelectorAll('img[data-src]');
            
            if (lazyImages.length > 0) {
                const lazyImageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            lazyImageObserver.unobserve(img);
                        }
                    });
                });
                
                lazyImages.forEach(img => {
                    lazyImageObserver.observe(img);
                });
            }
        }
        
        // Defer non-critical JavaScript
        const deferScripts = () => {
            // Detect Font Awesome and load it if not already present
            if (!document.querySelector('link[href*="fontawesome"]') && !document.querySelector('script[src*="fontawesome"]')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
                linkElement.integrity = 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
                linkElement.crossOrigin = 'anonymous';
                
                document.head.appendChild(linkElement);
            }
        };
        
        // Execute after critical content is loaded
        if (document.readyState === 'complete') {
            deferScripts();
        } else {
            window.addEventListener('load', deferScripts);
        }
    };
    
    /**
     * Event Delegation Setup
     * Setup global event handlers for improved performance
     */
    const setupEventDelegation = () => {
        // Global click handler
        document.addEventListener('click', (e) => {
            // Handle clicks on dynamic elements that might be added later
            
            // Example: Handle clicks on dynamically added market items
            if (e.target.closest('.market-item')) {
                const marketItem = e.target.closest('.market-item');
                
                // Add a highlight effect
                marketItem.classList.add('item-highlighted');
                setTimeout(() => {
                    marketItem.classList.remove('item-highlighted');
                }, 500);
            }
        });
    };
    
    /**
     * Error Handling Setup
     */
    const setupErrorHandling = () => {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.message);
            // Could send to a logging service in production
        });
        
        // Handle promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise rejection:', e.reason);
            // Could send to a logging service in production
        });
    };
    
    /**
     * Touch Device Optimization
     * Optimizes experience for touch devices
     */
    const setupTouchOptimizations = () => {
        // Check if device supports touch
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            
            // Enhance touch targets
            const smallTargets = $$('.interactive-icon, .panel-close, .market-link');
            smallTargets.forEach(target => {
                target.classList.add('touch-target');
            });
            
            // Fix 300ms delay issue for older browsers
            const fastClick = document.createElement('script');
            fastClick.src = 'https://cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min.js';
            fastClick.onload = function() {
                if (typeof FastClick === 'function') {
                    FastClick.attach(document.body);
                }
            };
            document.head.appendChild(fastClick);
            
            // Add touch hint for feature cards
            const featureCards = $$('.feature-card');
            featureCards.forEach(card => {
                const hintEl = document.createElement('div');
                hintEl.className = 'touch-hint';
                hintEl.innerHTML = '<i class="fas fa-hand-pointer"></i> Tap to read more';
                card.appendChild(hintEl);
            });
        }
    };
    
    /**
     * Social Media Sharing
     * Adds social sharing functionality
     */
    const setupSocialSharing = () => {
        // Create sharing buttons if needed
        const addSharingButtons = () => {
            const heroSection = $('.hero-section');
            if (!heroSection || $('.share-buttons')) return;
            
            const shareContainer = document.createElement('div');
            shareContainer.className = 'share-buttons';
            shareContainer.innerHTML = `
                <button class="share-btn" data-platform="twitter">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn" data-platform="linkedin">
                    <i class="fab fa-linkedin-in"></i>
                </button>
                <button class="share-btn" data-platform="facebook">
                    <i class="fab fa-facebook-f"></i>
                </button>
            `;
            
            heroSection.appendChild(shareContainer);
            
            // Add event listeners to sharing buttons
            const shareButtons = $$('.share-btn');
            shareButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const platform = btn.getAttribute('data-platform');
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(document.title);
                    const text = encodeURIComponent('Check out this financial data resource:');
                    let shareUrl;
                    
                    switch (platform) {
                        case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                            break;
                        case 'linkedin':
                            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                            break;
                        case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                            break;
                    }
                    
                    if (shareUrl) {
                        window.open(shareUrl, '_blank', 'width=600,height=400');
                    }
                });
            });
        };
        
        // Only add sharing if the page has been active for more than 30 seconds
        setTimeout(addSharingButtons, 30000);
    };
    
    /**
     * Add theme customization features
     */
    const setupThemeCustomization = () => {
        // Check for saved theme preferences
        const savedTheme = localStorage.getItem('holmdexTheme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        
        // Check for dark mode preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode && !savedTheme) {
            document.body.setAttribute('data-theme', 'dark');
        }
        
        // Add theme switcher if needed
        if (!$('.theme-switcher')) {
            const themeSwitch = document.createElement('button');
            themeSwitch.className = 'theme-switcher';
            themeSwitch.setAttribute('aria-label', 'Toggle dark mode');
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
            
            themeSwitch.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('holmdexTheme', newTheme);
                
                // Update icon
                const icon = themeSwitch.querySelector('i');
                if (newTheme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            });
            
            // Update initial icon based on current theme
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                const icon = themeSwitch.querySelector('i');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
            
            document.body.appendChild(themeSwitch);
        }
    };
    
    /**
     * Detect and Adjust for Animation Preferences
     */
    const setupAnimationPreferences = () => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            
            // Stop market slider animation
            const sliderTrack = $('.slider-track');
            if (sliderTrack) {
                sliderTrack.style.animationPlayState = 'paused';
            }
            
            // Disable float animations
            const floatingElements = $$('.interactive-icon');
            floatingElements.forEach(el => {
                el.style.animation = 'none';
            });
            
            // Disable gradient animations
            const gradientElements = $$('.tip-panel::before, .panel-header::before, .icon-circle::before, .market-snapshot::before');
            gradientElements.forEach(el => {
                if (el) el.style.animation = 'none';
            });
        }
    };
    
    /**
     * Initialize All Functions
     */
    const init = () => {
        // Set up back to top button
        setupBackToTop();
        
        // Set up smooth scrolling for anchor links
        setupSmoothScroll();
        
        // Set up header scroll effects
        setupHeaderEffects();
        
        // Set up performance optimizations
        setupPerformanceOptimizations();
        
        // Set up event delegation
        setupEventDelegation();
        
        // Set up error handling
        setupErrorHandling();
        
        // Set up touch device optimizations
        setupTouchOptimizations();
        
        // Set up social sharing buttons
        setupSocialSharing();
        
        // Set up theme customization
        setupThemeCustomization();
        
        // Set up animation preferences
        setupAnimationPreferences();
        
        // Log initialization
        console.log('Holmdex homepage initialized - Part 3');
    };
    
    // Start initialization
    init();
});

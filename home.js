/**
 * HOLMDEX HOMEPAGE JAVASCRIPT - PART 1
 * Core functionality and Interactive Icons
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
        });
        
        // Set up close buttons
        closeBtns.forEach(btn => {
            addEvent(btn, 'click', () => {
                closeAllPanels();
            });
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
                heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
                
                // Move icons down slightly to create parallax effect
                iconContainer.style.transform = `translateY(${scrollY * 0.3}px)`;
                
                // Fade out content as user scrolls down
                const opacity = 1 - (scrollY / (heroHeight * 0.5));
                if (opacity > 0) {
                    heroContent.style.opacity = opacity;
                    iconContainer.style.opacity = opacity;
                }
            }
        });
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
     * Initialize All Functions
     */
    const init = () => {
        // Set up interactive icon panels
        setupInteractiveIcons();
        
        // Set up icon animations
        setupIconAnimations();
        
        // Set up hero parallax scrolling
        setupHeroParallax();
        
        // Create loaders for dynamic content
        createLoaders();
        
        // Log initialization
        console.log('Holmdex homepage initialized - Part 1');
    };
    
    // Start initialization
    init();
});

/**
 * HOLMDEX HOMEPAGE JAVASCRIPT - PART 2
 * Market slider and scroll-based animations
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
        
        // Clone market items for infinite loop
        const marketItems = Array.from($$('.market-item'));
        
        // Create enough items to fill the slider twice for seamless looping
        marketItems.forEach(item => {
            const clone = item.cloneNode(true);
            sliderTrack.appendChild(clone);
        });
        
        // Handle market data formatting and style
        const formatMarketItems = () => {
            const items = $$('.market-item');
            
            items.forEach(item => {
                const valueElement = item.querySelector('.market-value');
                const changeElement = item.querySelector('.market-change');
                
                if (valueElement && changeElement) {
                    // Ensure up/down classes are applied correctly
                    if (changeElement.textContent.startsWith('+')) {
                        valueElement.classList.add('up');
                        valueElement.classList.remove('down');
                    } else if (changeElement.textContent.startsWith('-')) {
                        valueElement.classList.add('down');
                        valueElement.classList.remove('up');
                    }
                }
            });
        };
        
        formatMarketItems();
        
        // Pause animation on hover
        sliderTrack.addEventListener('mouseenter', () => {
            sliderTrack.style.animationPlayState = 'paused';
        });
        
        sliderTrack.addEventListener('mouseleave', () => {
            sliderTrack.style.animationPlayState = 'running';
        });
        
        // Touch device compatibility - pause on touch
        sliderTrack.addEventListener('touchstart', () => {
            sliderTrack.style.animationPlayState = 'paused';
        });
        
        sliderTrack.addEventListener('touchend', () => {
            sliderTrack.style.animationPlayState = 'running';
        });
    };
    
    /**
     * Fetch Live Market Data
     * Attempts to get real data with graceful fallback to static data
     */
    const fetchMarketData = () => {
        // Mock data update function - used if API fails
        const updateWithMockData = () => {
            console.log('Using fallback market data');
            
            const mockData = [
                { name: 'S&P 500', value: '5,281.40', change: '+0.63%', isUp: true },
                { name: 'NASDAQ', value: '16,742.39', change: '+0.85%', isUp: true },
                { name: 'DOW', value: '39,123.59', change: '-0.21%', isUp: false },
                { name: 'FTSE 100', value: '8,175.24', change: '+0.42%', isUp: true },
                { name: 'DAX', value: '17,932.17', change: '+0.75%', isUp: true },
                { name: 'OMXS30', value: '2,489.72', change: '-0.18%', isUp: false },
                { name: 'BITCOIN', value: '66,781.49', change: '+2.15%', isUp: true },
                { name: 'GOLD', value: '2,345.10', change: '+0.27%', isUp: true }
            ];
            
            // Apply the mock data to all instances of each market item
            mockData.forEach(item => {
                const marketItems = $$('.market-item');
                marketItems.forEach(marketItem => {
                    const nameElement = marketItem.querySelector('.market-name');
                    if (nameElement && nameElement.textContent === item.name) {
                        const valueElement = marketItem.querySelector('.market-value');
                        const changeElement = marketItem.querySelector('.market-change');
                        
                        if (valueElement && changeElement) {
                            valueElement.textContent = item.value;
                            changeElement.textContent = item.change;
                            
                            valueElement.classList.remove('up', 'down');
                            valueElement.classList.add(item.isUp ? 'up' : 'down');
                        }
                    }
                });
            });
        };
        
        // Try to fetch live data (using a proxy to avoid CORS issues)
        const fetchLiveData = async () => {
            try {
                // This is for demonstration - in production use server-side API calls
                // Yahoo Finance API or another reliable financial data source
                const corsProxy = 'https://corsproxy.io/?';
                const symbols = [
                    { name: 'S&P 500', symbol: '%5EGSPC' },  // ^GSPC
                    { name: 'NASDAQ', symbol: '%5EIXIC' },   // ^IXIC
                    { name: 'DOW', symbol: '%5EDJI' },       // ^DJI
                    { name: 'FTSE 100', symbol: '%5EFTSE' }, // ^FTSE
                    { name: 'DAX', symbol: '%5EGDAXI' },     // ^GDAXI
                    { name: 'OMXS30', symbol: '%5EOMX' },    // ^OMX
                    { name: 'BITCOIN', symbol: 'BTC-USD' },
                    { name: 'GOLD', symbol: 'GC=F' }
                ];
                
                // Process in batches to avoid overwhelming the browser or API
                const batchSize = 2;
                let successCount = 0;
                
                for (let i = 0; i < symbols.length; i += batchSize) {
                    const batch = symbols.slice(i, i + batchSize);
                    
                    const promises = batch.map(async ({ name, symbol }) => {
                        try {
                            const url = `${corsProxy}https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
                            const response = await fetch(url);
                            
                            if (!response.ok) {
                                throw new Error(`Error fetching ${name} data`);
                            }
                            
                            const data = await response.json();
                            const result = data.chart.result[0];
                            
                            if (!result) {
                                throw new Error(`No data for ${name}`);
                            }
                            
                            const meta = result.meta;
                            const latestPrice = meta.regularMarketPrice;
                            const previousClose = meta.previousClose || meta.chartPreviousClose;
                            const change = latestPrice - previousClose;
                            const changePercent = (change / previousClose) * 100;
                            
                            // Format the values
                            const formattedPrice = latestPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                            
                            const formattedChange = changePercent >= 0 
                                ? `+${changePercent.toFixed(2)}%` 
                                : `${changePercent.toFixed(2)}%`;
                            
                            // Update all instances of this market item
                            const marketItems = $$('.market-item');
                            marketItems.forEach(item => {
                                const nameElement = item.querySelector('.market-name');
                                if (nameElement && nameElement.textContent === name) {
                                    const valueElement = item.querySelector('.market-value');
                                    const changeElement = item.querySelector('.market-change');
                                    
                                    if (valueElement && changeElement) {
                                        valueElement.textContent = formattedPrice;
                                        changeElement.textContent = formattedChange;
                                        
                                        valueElement.classList.remove('up', 'down');
                                        valueElement.classList.add(changePercent >= 0 ? 'up' : 'down');
                                    }
                                }
                            });
                            
                            successCount++;
                            return true;
                        } catch (error) {
                            console.warn(`Error fetching data for ${name}:`, error);
                            return false;
                        }
                    });
                    
                    await Promise.allSettled(promises);
                    
                    // Small delay between batches
                    if (i + batchSize < symbols.length) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
                
                // Return success if at least half of the symbols were fetched successfully
                return successCount >= symbols.length / 2;
            } catch (error) {
                console.error('Error fetching market data:', error);
                return false;
            }
        };
        
        // Try live data with fallback
        fetchLiveData().then(success => {
            if (!success) {
                // If live data fetch failed, use mock data
                updateWithMockData();
            }
        }).catch(() => {
            // On any error, use mock data
            updateWithMockData();
        });
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
        
        // Fetch market data (live or mock)
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
 * HOLMDEX HOMEPAGE JAVASCRIPT - PART 3
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
     * Accessibility Improvements
     */
    const setupAccessibility = () => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Disable animations
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                * {
                    animation-duration: 0.001s !important;
                    transition-duration: 0.001s !important;
                }
                
                .market-slider .slider-track {
                    animation: none !important;
                }
            `;
            document.head.appendChild(styleElement);
            
            // Reset transforms for all elements
            const animatedElements = document.querySelectorAll(
                '.feature-card, .resource-card, .interactive-icon, .hero-content, .icon-container'
            );
            
            animatedElements.forEach(el => {
                el.style.transform = 'none';
                el.style.opacity = '1';
            });
        }
        
        // Add keyboard navigation for interactive elements
        const interactiveElements = document.querySelectorAll(
            '.interactive-icon, .feature-card, .resource-card'
        );
        
        interactiveElements.forEach(el => {
            // Make elements focusable if not already
            if (!el.getAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
            
            // Trigger click on Enter/Space for elements that need it
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        });
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
                const containerWidth = iconContainer.offsetWidth;
                const containerHeight = iconContainer.offsetHeight;
                
                // Reposition icons based on container size
                const icons = $$('.interactive-icon');
                if (window.innerWidth < 768) {
                    // Mobile layout adjustments
                    icons.forEach(icon => {
                        icon.style.transition = 'none'; // Disable transitions temporarily
                    });
                    
                    // Add specific mobile positioning if needed
                    
                    setTimeout(() => {
                        icons.forEach(icon => {
                            icon.style.transition = ''; // Re-enable transitions
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
     * Event Delegation Setup
     * Setup global event handlers for improved performance
     */
    const setupEventDelegation = () => {
        // Global click handler
        document.addEventListener('click', (e) => {
            // Handle clicks on dynamic elements that might be added later
            
            // Example: Handle clicks on dynamically added elements with class 'dynamic-element'
            if (e.target.closest('.dynamic-element')) {
                const element = e.target.closest('.dynamic-element');
                // Handle the click
                console.log('Dynamic element clicked:', element);
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
     * Initialize All Functions
     */
    const init = () => {
        // Set up back to top button
        setupBackToTop();
        
        // Set up smooth scrolling for anchor links
        setupSmoothScroll();
        
        // Set up header scroll effects
        setupHeaderEffects();
        
        // Set up accessibility improvements
        setupAccessibility();
        
        // Set up performance optimizations
        setupPerformanceOptimizations();
        
        // Set up resize handler
        setupResizeHandler();
        
        // Set up event delegation
        setupEventDelegation();
        
        // Set up error handling
        setupErrorHandling();
        
        // Log initialization
        console.log('Holmdex homepage initialized - Part 3');
    };
    
    // Start initialization
    init();
});

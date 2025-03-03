/**
 * Holmdex Homepage JavaScript
 * Handles interactive elements and dynamic content
 */

document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * Utility Functions
     */
    
    // Helper function for element selection
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    // Helper to add event listeners with error handling
    const addEvent = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    };
    
    // Debounce function to limit rapid function calls
    const debounce = (func, wait = 100) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    /**
     * Market Ticker
     * Using a free API source to fetch real market data
     */
    const updateMarketTicker = () => {
        // Function to update ticker UI
        const updateTickerItem = (symbol, value, change, isUp) => {
            const items = $$('.ticker-item');
            
            items.forEach(item => {
                const symbolEl = item.querySelector('.ticker-symbol');
                if (symbolEl && symbolEl.textContent === symbol) {
                    const valueEl = item.querySelector('.ticker-value');
                    const changeEl = item.querySelector('.ticker-change');
                    
                    if (valueEl && changeEl) {
                        // Update the display values
                        valueEl.textContent = value;
                        changeEl.textContent = change;
                        
                        // Update classes for styling
                        valueEl.classList.remove('up', 'down');
                        valueEl.classList.add(isUp ? 'up' : 'down');
                    }
                }
            });
        };
        
        // Map of symbols on the ticker to their API symbols
        const symbolMap = {
            'S&P 500': '%5EGSPC',  // ^GSPC
            'NASDAQ': '%5EIXIC',   // ^IXIC
            'DOW': '%5EDJI',       // ^DJI
            'FTSE 100': '%5EFTSE', // ^FTSE
            'DAX': '%5EGDAXI',     // ^GDAXI
            'NIKKEI': '%5EN225',   // ^N225
            'HANG SENG': '%5EHSI', // ^HSI
            'OMXS30': '%5EOMX',    // ^OMX
            'USD/EUR': 'EURUSD=X',
            'BITCOIN': 'BTC-USD',
            'GOLD': 'GC=F',
            'CRUDE OIL': 'CL=F'
        };
        
        // Using Yahoo Finance API via a proxy to avoid CORS issues
        // Note: This is a workaround. In production, fetch this data server-side.
        const fetchMarketData = async (symbol) => {
            try {
                // Use a CORS proxy service (replace with your own solution in production)
                const corsProxy = 'https://corsproxy.io/?';
                const url = `${corsProxy}https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Extract the relevant data
                const result = data.chart.result[0];
                if (!result) {
                    throw new Error('No data available');
                }
                
                const meta = result.meta;
                // Get the latest price
                const latestPrice = meta.regularMarketPrice;
                const previousClose = meta.previousClose || meta.chartPreviousClose;
                
                // Calculate change
                const change = latestPrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                return {
                    price: latestPrice.toFixed(2),
                    change: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
                    isUp: changePercent >= 0
                };
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error);
                return null;
            }
        };
        
        // Fetch data for each symbol on the ticker
        const updateAllTickers = async () => {
            // Use Promise.allSettled to handle multiple requests
            // Process in batches to avoid overwhelming the API or browser
            const batchSize = 3;
            const symbols = Object.keys(symbolMap);
            
            for (let i = 0; i < symbols.length; i += batchSize) {
                const batch = symbols.slice(i, i + batchSize);
                const promises = batch.map(symbol => 
                    fetchMarketData(symbolMap[symbol])
                    .then(data => {
                        if (data) {
                            updateTickerItem(symbol, data.price, data.change, data.isUp);
                        }
                    })
                );
                
                // Wait for batch to complete
                await Promise.allSettled(promises);
                
                // Small delay between batches
                if (i + batchSize < symbols.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        };
        
        // Initial update
        updateAllTickers();
        
        // Update periodically (every 5 minutes)
        setInterval(updateAllTickers, 5 * 60 * 1000);
    };
    
    /**
     * Alternative Market Data - Using finance widgets
     * This is a fallback if the Yahoo Finance API method doesn't work
     */
    const setupFinanceWidgets = () => {
        // Create script tag for TradingView widgets
        const injectTradingViewScript = () => {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "NASDAQ" },
                    { "proName": "FOREXCOM:DJI", "title": "Dow Jones" },
                    { "proName": "INDEX:NKY", "title": "Nikkei 225" },
                    { "proName": "INDEX:DEU30", "title": "DAX" },
                    { "proName": "INDEX:FTSE", "title": "FTSE 100" },
                    { "proName": "FOREXCOM:EURUSD", "title": "EUR/USD" },
                    { "proName": "FX:GBPUSD", "title": "GBP/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "BTC/USD" },
                    { "proName": "NYMEX:CL1!", "title": "Crude Oil" },
                    { "proName": "COMEX:GC1!", "title": "Gold" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "dark",
                "isTransparent": true,
                "displayMode": "adaptive",
                "locale": "en"
            });
            
            // Replace the ticker with the TradingView widget
            const tickerContainer = $('.market-ticker');
            if (tickerContainer) {
                tickerContainer.innerHTML = '<div class="tradingview-widget-container"></div>';
                tickerContainer.querySelector('.tradingview-widget-container').appendChild(script);
            }
        };
        
        // Only inject the widget if we need fallback
        // Uncomment this to use TradingView widget instead of custom ticker
        // injectTradingViewScript();
    };
    
    /**
     * Expandable Concept Cards
     */
    const initConceptCards = () => {
        const conceptCards = $$('.concept-card');
        const expandButtons = $$('.expand-btn');
        const collapseButtons = $$('.collapse-btn');
        
        // Function to toggle card expansion
        const toggleCard = (card, btn, expand = true) => {
            // Get content element
            const contentId = btn.getAttribute('aria-controls');
            const content = $(`#${contentId}`);
            
            if (!content) return;
            
            if (expand) {
                // Expand the card
                card.classList.add('expanded');
                btn.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = `${content.scrollHeight}px`;
                
                // Scroll to the expanded card if needed
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    if (rect.bottom > window.innerHeight) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            } else {
                // Collapse the card
                card.classList.remove('expanded');
                const expandBtn = card.querySelector('.expand-btn');
                if (expandBtn) {
                    expandBtn.setAttribute('aria-expanded', 'false');
                }
                content.style.maxHeight = '0';
            }
        };
        
        // Set up expand buttons
        expandButtons.forEach(btn => {
            const card = btn.closest('.concept-card');
            btn.addEventListener('click', () => {
                toggleCard(card, btn, true);
            });
        });
        
        // Set up collapse buttons
        collapseButtons.forEach(btn => {
            const card = btn.closest('.concept-card');
            const expandBtn = card.querySelector('.expand-btn');
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent event bubbling
                e.stopPropagation();
                toggleCard(card, expandBtn, false);
            });
        });
        
        // Initialize card states (all collapsed)
        conceptCards.forEach(card => {
            const content = card.querySelector('.concept-content');
            if (content) {
                content.style.maxHeight = '0';
            }
        });
    };
    
    /**
     * Sources Carousel - Enhanced with swipe functionality and drag scrollbar
     */
    const initSourcesCarousel = () => {
        const carousel = $('#sourcesCarousel');
        const carouselContainer = $('#carouselContainer');
        const track = $('#sourcesTrack');
        const prevBtn = $('#sourcesPrev');
        const nextBtn = $('#sourcesNext');
        const currentPage = $('.current-page');
        const totalPages = $('.total-pages');
        const scrollThumb = $('#scrollThumb');
        const scrollTrack = $('.scroll-track');
        
        if (!track || !carousel) return;
        
        const sourceItems = track.querySelectorAll('.source-item');
        if (sourceItems.length === 0) return;
        
        // State variables
        let position = 0;
        let itemsPerPage = 0;
        let totalItems = sourceItems.length;
        let isDragging = false;
        let isScrollDragging = false;
        let startX = 0;
        let scrollStartX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let scrollThumbLeft = 0;
        
        // Calculate how many items can be displayed per page based on container width
        const calculateGridLayout = () => {
            if (!carouselContainer || !track) return;
            
            const containerWidth = carouselContainer.offsetWidth;
            
            // Get computed item width from the first source item
            const firstItem = sourceItems[0];
            const itemStyles = window.getComputedStyle(firstItem);
            const itemWidth = firstItem.offsetWidth + 
                              parseFloat(itemStyles.marginLeft) + 
                              parseFloat(itemStyles.marginRight);
            
            // Calculate how many items fit in one page
            itemsPerPage = Math.floor(containerWidth / itemWidth);
            if (itemsPerPage < 1) itemsPerPage = 1;
            
            // Calculate total pages
            const pages = Math.ceil(totalItems / itemsPerPage);
            
            // Update page indicator
            if (totalPages) totalPages.textContent = pages;
            
            // Ensure valid position after resize
            validatePosition();
            
            return {
                itemsPerPage,
                itemWidth,
                pages
            };
        };
        
        // Validate and correct position if needed
        const validatePosition = () => {
            const maxPosition = Math.ceil(totalItems / itemsPerPage) - 1;
            position = Math.min(Math.max(0, position), maxPosition);
            updateCarouselPosition();
            updatePageIndicator();
            updateNavButtons();
        };
        
        // Update carousel position
        const updateCarouselPosition = () => {
            if (!track) return;
            const layout = calculateGridLayout();
            if (!layout) return;
            const { itemWidth } = layout;
            const translateX = -position * (itemsPerPage * itemWidth);
            track.style.transform = `translateX(${translateX}px)`;
            currentTranslate = translateX;
            prevTranslate = translateX;
        };
        
        // Update page indicator
        const updatePageIndicator = () => {
            if (currentPage) {
                currentPage.textContent = position + 1;
            }
        };
        
        // Update navigation buttons
        const updateNavButtons = () => {
            if (!prevBtn || !nextBtn) return;
            const maxPosition = Math.ceil(totalItems / itemsPerPage) - 1;
            prevBtn.disabled = position <= 0;
            nextBtn.disabled = position >= maxPosition;
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        };
        
        // Navigate to next page
        const goToNextPage = () => {
            const maxPosition = Math.ceil(totalItems / itemsPerPage) - 1;
            position = Math.min(position + 1, maxPosition);
            updateCarouselPosition();
            updatePageIndicator();
            updateNavButtons();
        };
        
        // Navigate to previous page
        const goToPrevPage = () => {
            position = Math.max(position - 1, 0);
            updateCarouselPosition();
            updatePageIndicator();
            updateNavButtons();
        };
        
        // Touch events for swiping
        const touchStart = (e) => {
            startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            isDragging = true;
            track.style.transition = 'none';
        };
        
        const touchMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const diff = currentX - startX;
            
            // Apply resistance at the edges
            if ((position === 0 && diff > 0) || 
                (position >= Math.ceil(totalItems / itemsPerPage) - 1 && diff < 0)) {
                currentTranslate = prevTranslate + diff * 0.3;
            } else {
                currentTranslate = prevTranslate + diff;
            }
            track.style.transform = `translateX(${currentTranslate}px)`;
        };
        
        const touchEnd = (e) => {
            isDragging = false;
            track.style.transition = 'transform 0.4s ease';
            const threshold = carouselContainer.offsetWidth * 0.2;
            const currentX = e.type === 'touchend' ? 
                              (e.changedTouches ? e.changedTouches[0].clientX : startX) : 
                              e.clientX;
            const diff = currentX - startX;
            
            if (Math.abs(diff) > threshold) {
                diff > 0 ? goToPrevPage() : goToNextPage();
            } else {
                updateCarouselPosition();
            }
            
            if (Math.abs(diff) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        // Set up button event listeners
        addEvent(prevBtn, 'click', goToPrevPage);
        addEvent(nextBtn, 'click', goToNextPage);
        
        // Set up touch/mouse events for swipe functionality
        addEvent(carousel, 'touchstart', touchStart);
        addEvent(carousel, 'touchmove', touchMove);
        addEvent(carousel, 'touchend', touchEnd);
        addEvent(carousel, 'mousedown', touchStart);
        addEvent(window, 'mousemove', touchMove);
        addEvent(window, 'mouseup', touchEnd);
        addEvent(carousel, 'touchcancel', touchEnd);
        
        // Prevent context menu during drag
        addEvent(carousel, 'contextmenu', e => {
            if (isDragging) {
                e.preventDefault();
                return false;
            }
        });
        
        // Initialize scrollbar for desktop
        const updateScrollThumb = () => {
            if (!scrollThumb || !scrollTrack) return;
            const trackWidth = scrollTrack.offsetWidth;
            const contentWidth = track.scrollWidth;
            const containerWidth = carouselContainer.offsetWidth;
            const thumbWidth = Math.max(60, (containerWidth / contentWidth) * trackWidth);
            scrollThumb.style.width = `${thumbWidth}px`;
            const maxScroll = contentWidth - containerWidth;
            const scrollPercent = Math.min(Math.abs(currentTranslate) / maxScroll, 1);
            const maxThumbPosition = trackWidth - thumbWidth;
            const thumbPosition = scrollPercent * maxThumbPosition;
            scrollThumb.style.left = `${thumbPosition}px`;
        };
        
        // Handle scrollbar drag
        const scrollThumbStart = (e) => {
            if (!scrollThumb) return;
            isScrollDragging = true;
            scrollThumb.classList.add('dragging');
            scrollStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            scrollThumbLeft = scrollThumb.offsetLeft;
            document.body.style.userSelect = 'none';
        };
        
        const scrollThumbMove = (e) => {
            if (!isScrollDragging || !scrollThumb || !scrollTrack) return;
            const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const diff = currentX - scrollStartX;
            const trackWidth = scrollTrack.offsetWidth;
            const thumbWidth = scrollThumb.offsetWidth;
            const maxThumbPosition = trackWidth - thumbWidth;
            let newLeft = Math.max(0, Math.min(scrollThumbLeft + diff, maxThumbPosition));
            scrollThumb.style.left = `${newLeft}px`;
            
            // Update carousel based on scrollbar position
            const contentWidth = track.scrollWidth;
            const containerWidth = carouselContainer.offsetWidth;
            const maxScroll = contentWidth - containerWidth;
            const scrollPercent = newLeft / maxThumbPosition;
            const newTranslate = -scrollPercent * maxScroll;
            track.style.transform = `translateX(${newTranslate}px)`;
            currentTranslate = newTranslate;
            prevTranslate = newTranslate;
            
            // Update page indicator
            const totalPageCount = Math.ceil(totalItems / itemsPerPage);
            const page = Math.min(Math.floor(scrollPercent * totalPageCount), totalPageCount - 1);
            position = page;
            updatePageIndicator();
        };
        
        const scrollThumbEnd = () => {
            if (!isScrollDragging) return;
            isScrollDragging = false;
            if (scrollThumb) {
                scrollThumb.classList.remove('dragging');
            }
            document.body.style.userSelect = '';
        };
        
        if (scrollThumb && scrollTrack) {
            addEvent(scrollThumb, 'mousedown', scrollThumbStart);
            addEvent(scrollThumb, 'touchstart', scrollThumbStart);
            addEvent(window, 'mousemove', scrollThumbMove);
            addEvent(window, 'touchmove', scrollThumbMove);
            addEvent(window, 'mouseup', scrollThumbEnd);
            addEvent(window, 'touchend', scrollThumbEnd);
        }
        
        // Initialize carousel
        calculateGridLayout();
        updateCarouselPosition();
        updatePageIndicator();
        updateNavButtons();
        updateScrollThumb();
        
        // Update on window resize
        window.addEventListener('resize', debounce(() => {
            calculateGridLayout();
            updateCarouselPosition();
            updatePageIndicator();
            updateNavButtons();
            updateScrollThumb();
        }, 200));
        
        // Hide or show swipe indicator based on touch capability
        const swipeIndicator = $('.swipe-indicator');
        if (swipeIndicator) {
            swipeIndicator.style.display = ('ontouchstart' in window) ? 'flex' : 'none';
        }
    };
    
    /**
     * Animation on Scroll
     * Simple section reveal animations
     */
    const initScrollAnimations = () => {
        const revealElements = $$('.section-header, .concept-card, .service-card, .source-item');
        
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            revealElements.forEach(el => {
                el.classList.add('reveal-element');
                revealObserver.observe(el);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            revealElements.forEach(el => {
                el.classList.add('revealed');
            });
        }
    };
    
    /**
     * Card Hover Effects
     * Add subtle 3D tilt effect to cards on mousemove
     */
    const initCardEffects = () => {
        const cards = $$('.concept-card, .service-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return; // Skip on mobile
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate rotation based on mouse position
                const xRotation = ((y - rect.height / 2) / rect.height) * 5;
                const yRotation = ((rect.width / 2 - x) / rect.width) * 5;
                
                // Apply transform with perspective
                card.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) translateY(-5px)`;
            });
            
            // Reset transform on mouse leave
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
            
            // Add focus effects for accessibility
            card.addEventListener('focus', () => {
                card.classList.add('focused');
            });
            card.addEventListener('blur', () => {
                card.classList.remove('focused');
            });
        });
    };
    
    /**
     * Back to Top Button
     */
    const initBackToTop = () => {
        const createBackToTopButton = () => {
            const btn = document.createElement('button');
            btn.className = 'back-to-top';
            btn.id = 'backToTop';
            btn.setAttribute('aria-label', 'Back to top');
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-arrow-up';
            btn.appendChild(icon);
            
            document.body.appendChild(btn);
            return btn;
        };
        
        const btn = $('#backToTop') || createBackToTopButton();
        
        const toggleBackToTopButton = () => {
            if (window.pageYOffset > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };
        
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        toggleBackToTopButton();
        window.addEventListener('scroll', debounce(toggleBackToTopButton, 100));
    };
    
    /**
     * Add CSS class for reveal animations
     */
    const addRevealStyles = () => {
        if (!document.getElementById('reveal-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'reveal-animation-styles';
            style.textContent = `
                .reveal-element {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                }
                
                .revealed {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    /**
     * Fallback to mock data if API access fails
     */
    const initFallbackData = () => {
        window.updateWithFallbackData = () => {
            console.log('Using fallback market data');
            const fallbackData = [
                { symbol: 'S&P 500', value: '5,281.40', change: '+0.63%', isUp: true },
                { symbol: 'NASDAQ', value: '16,742.39', change: '+0.85%', isUp: true },
                { symbol: 'DOW', value: '39,123.59', change: '-0.21%', isUp: false },
                { symbol: 'FTSE 100', value: '8,175.24', change: '+0.42%', isUp: true },
                { symbol: 'DAX', value: '17,932.17', change: '+0.75%', isUp: true },
                { symbol: 'NIKKEI', value: '38,721.33', change: '-0.31%', isUp: false },
                { symbol: 'HANG SENG', value: '16,512.92', change: '+1.23%', isUp: true },
                { symbol: 'OMXS30', value: '2,489.72', change: '-0.18%', isUp: false },
                { symbol: 'USD/EUR', value: '0.9235', change: '-0.12%', isUp: false },
                { symbol: 'BITCOIN', value: '66,781.49', change: '+2.15%', isUp: true },
                { symbol: 'GOLD', value: '2,345.10', change: '+0.27%', isUp: true },
                { symbol: 'CRUDE OIL', value: '78.25', change: '-0.51%', isUp: false }
            ];
            
            fallbackData.forEach(item => {
                const items = $$('.ticker-item');
                items.forEach(tickerItem => {
                    const symbolEl = tickerItem.querySelector('.ticker-symbol');
                    if (symbolEl && symbolEl.textContent === item.symbol) {
                        const valueEl = tickerItem.querySelector('.ticker-value');
                        const changeEl = tickerItem.querySelector('.ticker-change');
                        if (valueEl && changeEl) {
                            valueEl.textContent = item.value;
                            changeEl.textContent = item.change;
                            valueEl.classList.remove('up', 'down');
                            valueEl.classList.add(item.isUp ? 'up' : 'down');
                        }
                    }
                });
            });
        };
    };
    
    /**
     * Initialize all components
     */
    const init = () => {
        // Add reveal animation styles
        addRevealStyles();
        
        // Initialize fallback data function
        initFallbackData();
        
        // Try to get real market data, with fallback
        try {
            updateMarketTicker();
        } catch (error) {
            console.error('Error initializing market ticker:', error);
            window.updateWithFallbackData();
        }
        
        // Initialize component features
        initConceptCards();
        initSourcesCarousel();
        initScrollAnimations();
        initCardEffects();
        initBackToTop();
        
        // Additional initialization can be added here
        console.log('Holmdex Homepage initialized');
    };
    
    // Start initialization
    init();
});

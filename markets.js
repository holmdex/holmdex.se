/**
 * HOLMDEX MARKETS PAGE JAVASCRIPT - PART 1
 * Core functionality for market data display and interactivity
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
    
    // Format number with commas and fixed decimals
    const formatNumber = (num, decimals = 2) => {
        if (isNaN(num)) return "N/A";
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };
    
    // Format percentage with + sign for positive values
    const formatPercentage = (percent, decimals = 2) => {
        if (isNaN(percent)) return "N/A";
        const sign = percent > 0 ? "+" : "";
        return `${sign}${percent.toFixed(decimals)}%`;
    };
    
    // Update last update time
    const updateTimeDisplay = () => {
        const timeElement = $('#lastUpdateTime');
        if (timeElement) {
            const now = new Date();
            const options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true,
                day: 'numeric',
                month: 'short'
            };
            timeElement.textContent = now.toLocaleString(undefined, options);
        }
    };
    
    /**
     * Market Overview Cards
     * Handles updating and displaying market data
     */
    const setupMarketCards = () => {
        updateTimeDisplay();
        
        // Market data (in a real implementation, this would come from an API)
        const marketData = {
            'sp500': {
                name: 'S&P 500',
                symbol: 'SPX',
                value: 5310.42,
                change: 36.96,
                percentChange: 0.72,
                trend: 'up'
            },
            'nasdaq': {
                name: 'NASDAQ',
                symbol: 'IXIC',
                value: 16749.22,
                change: 156.38,
                percentChange: 0.94,
                trend: 'up'
            },
            'dowjones': {
                name: 'Dow Jones',
                symbol: 'DJI',
                value: 39097.16,
                change: 42.13,
                percentChange: 0.11,
                trend: 'up'
            },
            'omxs30': {
                name: 'OMXS30',
                symbol: 'OMXS30.ST',
                value: 2526.86,
                change: -5.13,
                percentChange: -0.20,
                trend: 'down'
            },
            'ftse': {
                name: 'FTSE 100',
                symbol: 'FTSE',
                value: 8147.03,
                change: 37.29,
                percentChange: 0.46,
                trend: 'up'
            },
            'dax': {
                name: 'DAX',
                symbol: 'GDAXI',
                value: 18325.94,
                change: 108.01,
                percentChange: 0.59,
                trend: 'up'
            },
            'nikkei': {
                name: 'Nikkei 225',
                symbol: 'N225',
                value: 38633.02,
                change: 173.74,
                percentChange: 0.45,
                trend: 'up'
            },
            'bitcoin': {
                name: 'Bitcoin',
                symbol: 'BTC-USD',
                value: 66243.18,
                change: 1289.62,
                percentChange: 1.99,
                trend: 'up'
            }
        };
        
        // Update each market card with data
        Object.keys(marketData).forEach(marketId => {
            const card = $(`#${marketId}`);
            if (!card) return;
            
            const data = marketData[marketId];
            
            // Add trend class to card
            card.classList.add(data.trend);
            
            // Update values
            const valueElement = card.querySelector('.current-value');
            const changeValueElement = card.querySelector('.change-value');
            const changePercentElement = card.querySelector('.change-percent');
            
            if (valueElement) valueElement.textContent = formatNumber(data.value);
            if (changeValueElement) {
                const sign = data.change >= 0 ? '+' : '';
                changeValueElement.textContent = `${sign}${formatNumber(data.change)}`;
            }
            if (changePercentElement) {
                changePercentElement.textContent = formatPercentage(data.percentChange);
            }
            
            // Create mini chart
            createMiniChart(marketId, data.trend);
        });
        
        // Set up timer to simulate live updates
        setInterval(() => {
            simulateMarketUpdates();
        }, 15000); // Update every 15 seconds
    };
    
    /**
     * Mini Chart Creation
     * Creates SVG sparkline charts for market cards
     */
    const createMiniChart = (marketId, trend) => {
        const chartContainer = $(`#miniChart-${marketId}`);
        if (!chartContainer) return;
        
        // Generate random data points for demo purposes
        // In a real implementation, this would use actual historical data
        const generateChartData = (points, trend) => {
            const baseValue = 100;
            const variance = 10;
            const data = [];
            
            for (let i = 0; i < points; i++) {
                // Create slight trend bias based on current trend
                const trendFactor = trend === 'up' ? 0.6 : -0.6;
                const randomFactor = Math.random() * 2 - 1; // Between -1 and 1
                const change = randomFactor * variance + trendFactor;
                
                // Add some volatility
                const volatility = Math.random() > 0.8 ? (Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1) : 0;
                
                const prevValue = data.length > 0 ? data[data.length - 1] : baseValue;
                const newValue = prevValue + change + volatility;
                
                // Ensure we don't go negative
                data.push(Math.max(newValue, 1));
            }
            
            return data;
        };
        
        const chartData = generateChartData(50, trend);
        
        // Calculate dimensions and scales
        const width = chartContainer.clientWidth;
        const height = 60;
        const xScale = width / (chartData.length - 1);
        
        const min = Math.min(...chartData) * 0.95; // Add 5% padding
        const max = Math.max(...chartData) * 1.05; // Add 5% padding
        const yRange = max - min;
        
        // Create SVG path
        let path = `M0,${height - ((chartData[0] - min) / yRange) * height}`;
        
        for (let i = 1; i < chartData.length; i++) {
            const x = i * xScale;
            const y = height - ((chartData[i] - min) / yRange) * height;
            path += ` L${x},${y}`;
        }
        
        // Create SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("preserveAspectRatio", "none");
        
        // Create path element
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElement.setAttribute("d", path);
        pathElement.setAttribute("fill", "none");
        pathElement.setAttribute("stroke", trend === 'up' ? "var(--success, #2ecc71)" : "var(--danger, #e74c3c)");
        pathElement.setAttribute("stroke-width", "1.5");
        
        // Append path to SVG
        svg.appendChild(pathElement);
        
        // Append SVG to container
        chartContainer.innerHTML = '';
        chartContainer.appendChild(svg);
    };
    
    /**
     * Simulate Live Market Updates
     * Randomly updates market data to simulate live feed
     */
    const simulateMarketUpdates = () => {
        const markets = ['sp500', 'nasdaq', 'dowjones', 'omxs30', 'ftse', 'dax', 'nikkei', 'bitcoin'];
        
        // Randomly select 1-3 markets to update
        const numMarkets = Math.floor(Math.random() * 3) + 1;
        const marketsToUpdate = [];
        
        while (marketsToUpdate.length < numMarkets) {
            const market = markets[Math.floor(Math.random() * markets.length)];
            if (!marketsToUpdate.includes(market)) {
                marketsToUpdate.push(market);
            }
        }
        
        // Update selected markets
        marketsToUpdate.forEach(marketId => {
            const card = $(`#${marketId}`);
            if (!card) return;
            
            const valueElement = card.querySelector('.current-value');
            const changeValueElement = card.querySelector('.change-value');
            const changePercentElement = card.querySelector('.change-percent');
            
            if (!valueElement || !changeValueElement || !changePercentElement) return;
            
            // Get current value
            let currentValue = parseFloat(valueElement.textContent.replace(/,/g, ''));
            if (isNaN(currentValue)) return;
            
            // Determine if this update is positive or negative
            const isPositive = Math.random() > 0.4; // 60% chance of positive movement
            
            // Calculate new values
            const percentChange = (Math.random() * 0.3) * (isPositive ? 1 : -1);
            const valueChange = currentValue * (percentChange / 100);
            const newValue = currentValue + valueChange;
            
            // Get current change and add to it
            let currentChange = parseFloat(changeValueElement.textContent.replace(/[+,]/g, ''));
            if (isNaN(currentChange)) currentChange = 0;
            const newChange = currentChange + valueChange;
            
            // Get current percent and add to it
            let currentPercent = parseFloat(changePercentElement.textContent.replace(/[+%]/g, ''));
            if (isNaN(currentPercent)) currentPercent = 0;
            const newPercent = currentPercent + percentChange;
            
            // Update elements
            valueElement.textContent = formatNumber(newValue);
            changeValueElement.textContent = (newChange >= 0 ? '+' : '') + formatNumber(newChange);
            changePercentElement.textContent = formatPercentage(newPercent);
            
            // Update card class based on trend
            const trend = newChange >= 0 ? 'up' : 'down';
            card.classList.remove('up', 'down');
            card.classList.add(trend);
            
            // Flash effect
            card.classList.add('update-flash');
            setTimeout(() => {
                card.classList.remove('update-flash');
            }, 1000);
            
            // Update mini chart
            createMiniChart(marketId, trend);
        });
        
        // Update the time display
        updateTimeDisplay();
    };
    
    /**
     * Interactive Charts Section
     * Handles the TradingView widget integration and tab switching
     */
    const setupChartSection = () => {
        // Initialize TradingView widget for the default tab
        loadTradingViewWidget('sp500');
        
        // Set up tab switching
        const chartTabs = $$('.chart-tab');
        
        chartTabs.forEach(tab => {
            addEvent(tab, 'click', () => {
                // Update active tab
                chartTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get chart to display
                const chartId = tab.getAttribute('data-chart');
                
                // Update chart wrappers
                const chartWrappers = $$('.chart-wrapper');
                chartWrappers.forEach(wrapper => {
                    wrapper.classList.remove('active');
                });
                
                const activeWrapper = $(`#chart-${chartId}`);
                if (activeWrapper) {
                    activeWrapper.classList.add('active');
                    
                    // Load TradingView widget if needed
                    if (!activeWrapper.querySelector('iframe')) {
                        loadTradingViewWidget(chartId);
                    }
                }
            });
        });
        
        // Set up timeframe buttons
        const timeframeButtons = $$('.timeframe-btn');
        
        timeframeButtons.forEach(button => {
            addEvent(button, 'click', () => {
                // Update active button
                timeframeButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Get timeframe
                const timeframe = button.getAttribute('data-timeframe');
                
                // In a real implementation, this would update the chart timeframe
                // For the demo, we'll just simulate a reload
                const activeChartId = $('.chart-tab.active').getAttribute('data-chart');
                loadTradingViewWidget(activeChartId, timeframe);
            });
        });
    };
    
    /**
     * Load TradingView Widget
     * Creates and inserts TradingView chart widgets
     */
    const loadTradingViewWidget = (chartId, timeframe = '1D') => {
        // Map chart IDs to TradingView symbols
        const chartSymbols = {
            'sp500': 'INDEX:SPX',
            'nasdaq': 'NASDAQ:NDX',
            'omxs30': 'INDEX:OMX',
            'btc': 'COINBASE:BTCUSD'
        };
        
        // Map timeframes to TradingView intervals
        const timeframeIntervals = {
            '1D': '60',
            '1W': 'D',
            '1M': 'W',
            '3M': 'W',
            '1Y': 'M',
            '5Y': 'M'
        };
        
        const symbol = chartSymbols[chartId] || 'INDEX:SPX';
        const interval = timeframeIntervals[timeframe] || '60';
        
        // Find the container
        const container = $(`#chart-${chartId}`);
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create TradingView widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        
        script.onload = function() {
            if (typeof TradingView !== 'undefined') {
                new TradingView.widget({
                    "autosize": true,
                    "symbol": symbol,
                    "interval": interval,
                    "timezone": "Etc/UTC",
                    "theme": "light",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_top_toolbar": false,
                    "hide_legend": false,
                    "save_image": false,
                    "container_id": `chart-${chartId}`
                });
            }
        };
        
        document.head.appendChild(script);
    };

    // Initialize everything
    setupMarketCards();
    setupChartSection();
});
/**
 * HOLMDEX MARKETS PAGE JAVASCRIPT - PART 2
 * Sectors heatmap, global markets, forex and commodities
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Redefine helper functions for modularity
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    const addEvent = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    };
    
    /**
     * Market Sectors Heatmap
     * Creates and initializes the sectors performance heatmap
     */
    const setupSectorsHeatmap = () => {
        const heatmapContainer = $('#sectors-heatmap-widget');
        if (!heatmapContainer) return;
        
        // Create TradingView Sectors Heatmap widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "exchanges": [
                "SPX",
                "NASDAQ"
            ],
            "dataSource": "SPX500",
            "grouping": "sector",
            "blockSize": "market_cap_basic",
            "blockColor": "change",
            "locale": "en",
            "symbolUrl": "",
            "colorTheme": "light",
            "hasTopBar": false,
            "isDataSetEnabled": false,
            "isCustomColumnNameEnabled": false,
            "width": "100%",
            "height": "100%"
        });
        
        heatmapContainer.appendChild(script);
    };
    
    /**
     * Expandable Content
     * Handles the expand/collapse functionality
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
                    
                    // Update button text
                    const buttonText = button.childNodes[0];
                    if (buttonText && buttonText.nodeType === Node.TEXT_NODE) {
                        buttonText.nodeValue = isExpanded ? 'Learn More ' : 'Show Less ';
                    }
                }
            });
        });
    };
    
    /**
     * Global Markets Map
     * Creates and initializes the world markets map
     */
    const setupGlobalMarketsMap = () => {
        const mapContainer = $('#global-markets-widget');
        if (!mapContainer) return;
        
        // Create TradingView World Markets widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-global-markets.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "colorTheme": "light",
            "dateRange": "1D",
            "showChart": true,
            "locale": "en",
            "largeChartUrl": "",
            "isTransparent": false,
            "showSymbolLogo": true,
            "showFloatingTooltip": false,
            "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
            "plotLineColorFalling": "rgba(41, 98, 255, 1)",
            "gridLineColor": "rgba(42, 46, 57, 0)",
            "scaleFontColor": "rgba(134, 137, 147, 1)",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
            "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "tabs": [
                {
                    "title": "Indices",
                    "symbols": [
                        {
                            "s": "FOREXCOM:SPXUSD",
                            "d": "S&P 500"
                        },
                        {
                            "s": "FOREXCOM:NSXUSD",
                            "d": "US 100"
                        },
                        {
                            "s": "FOREXCOM:DJI",
                            "d": "Dow 30"
                        },
                        {
                            "s": "INDEX:NKY",
                            "d": "Nikkei 225"
                        },
                        {
                            "s": "INDEX:DEU40",
                            "d": "DAX"
                        },
                        {
                            "s": "FOREXCOM:UKXGBP",
                            "d": "UK 100"
                        },
                        {
                            "s": "INDEX:OMX",
                            "d": "OMXS30"
                        }
                    ],
                    "originalTitle": "Indices"
                },
                {
                    "title": "Futures",
                    "symbols": [
                        {
                            "s": "CME_MINI:ES1!",
                            "d": "S&P 500"
                        },
                        {
                            "s": "CME:6E1!",
                            "d": "Euro"
                        },
                        {
                            "s": "COMEX:GC1!",
                            "d": "Gold"
                        },
                        {
                            "s": "NYMEX:CL1!",
                            "d": "Oil"
                        },
                        {
                            "s": "NYMEX:NG1!",
                            "d": "Gas"
                        },
                        {
                            "s": "CBOT:ZC1!",
                            "d": "Corn"
                        }
                    ],
                    "originalTitle": "Futures"
                },
                {
                    "title": "Bonds",
                    "symbols": [
                        {
                            "s": "CME:GE1!",
                            "d": "Eurodollar"
                        },
                        {
                            "s": "CBOT:ZB1!",
                            "d": "T-Bond"
                        },
                        {
                            "s": "CBOT:UB1!",
                            "d": "Ultra T-Bond"
                        },
                        {
                            "s": "EUREX:FGBL1!",
                            "d": "Euro Bund"
                        },
                        {
                            "s": "EUREX:FBTP1!",
                            "d": "Euro BTP"
                        },
                        {
                            "s": "EUREX:FGBM1!",
                            "d": "Euro BOBL"
                        }
                    ],
                    "originalTitle": "Bonds"
                },
                {
                    "title": "Forex",
                    "symbols": [
                        {
                            "s": "FX:EURUSD",
                            "d": "EUR to USD"
                        },
                        {
                            "s": "FX:GBPUSD",
                            "d": "GBP to USD"
                        },
                        {
                            "s": "FX:USDJPY",
                            "d": "USD to JPY"
                        },
                        {
                            "s": "FX:USDCHF",
                            "d": "USD to CHF"
                        },
                        {
                            "s": "FX:AUDUSD",
                            "d": "AUD to USD"
                        },
                        {
                            "s": "FX:USDCAD",
                            "d": "USD to CAD"
                        }
                    ],
                    "originalTitle": "Forex"
                }
            ]
        });
        
        mapContainer.appendChild(script);
    };
    
    /**
     * Global Markets Table Data
     * Populates the global markets table with market data
     */
    const setupGlobalMarketsTable = () => {
        const tableBody = $('#global-markets-data');
        if (!tableBody) return;
        
        // Sample market data (in a real implementation, this would come from an API)
        const marketsData = [
            {
                region: 'Americas',
                market: 'S&P 500',
                index: 'SPX',
                value: 5310.42,
                change: 36.96,
                percentChange: 0.72,
                status: 'open'
            },
            {
                region: 'Americas',
                market: 'Dow Jones',
                index: 'DJI',
                value: 39097.16,
                change: 42.13,
                percentChange: 0.11,
                status: 'open'
            },
            {
                region: 'Americas',
                market: 'NASDAQ',
                index: 'IXIC',
                value: 16749.22,
                change: 156.38,
                percentChange: 0.94,
                status: 'open'
            },
            {
                region: 'Europe',
                market: 'FTSE 100',
                index: 'FTSE',
                value: 8147.03,
                change: 37.29,
                percentChange: 0.46,
                status: 'open'
            },
            {
                region: 'Europe',
                market: 'DAX',
                index: 'GDAXI',
                value: 18325.94,
                change: 108.01,
                percentChange: 0.59,
                status: 'open'
            },
            {
                region: 'Europe',
                market: 'OMXS30',
                index: 'OMXS30.ST',
                value: 2526.86,
                change: -5.13,
                percentChange: -0.20,
                status: 'open'
            },
            {
                region: 'Asia',
                market: 'Nikkei 225',
                index: 'N225',
                value: 38633.02,
                change: 173.74,
                percentChange: 0.45,
                status: 'closed'
            },
            {
                region: 'Asia',
                market: 'Hang Seng',
                index: 'HSI',
                value: 17687.48,
                change: -114.24,
                percentChange: -0.64,
                status: 'closed'
            },
            {
                region: 'Asia',
                market: 'Shanghai Composite',
                index: 'SSEC',
                value: 3121.96,
                change: 5.15,
                percentChange: 0.17,
                status: 'closed'
            }
        ];
        
        // Clear loading row
        tableBody.innerHTML = '';
        
        // Sort by region then by market
        marketsData.sort((a, b) => {
            if (a.region !== b.region) {
                return a.region.localeCompare(b.region);
            }
            return a.market.localeCompare(b.market);
        });
        
        // Create groups by region
        const regions = {};
        marketsData.forEach(market => {
            if (!regions[market.region]) {
                regions[market.region] = [];
            }
            regions[market.region].push(market);
        });
        
        // Add data rows by region
        Object.keys(regions).forEach(region => {
            // Add region header
            const regionRow = document.createElement('tr');
            regionRow.className = 'region-header';
            
            const regionCell = document.createElement('td');
            regionCell.colSpan = 6;
            regionCell.textContent = region;
            regionCell.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            regionCell.style.fontWeight = 'bold';
            
            regionRow.appendChild(regionCell);
            tableBody.appendChild(regionRow);
            
            // Add market rows for this region
            regions[region].forEach(market => {
                const row = document.createElement('tr');
                
                // Market name
                const marketCell = document.createElement('td');
                marketCell.textContent = market.market;
                row.appendChild(marketCell);
                
                // Index
                const indexCell = document.createElement('td');
                indexCell.textContent = market.index;
                row.appendChild(indexCell);
                
                // Value
                const valueCell = document.createElement('td');
                valueCell.textContent = market.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                row.appendChild(valueCell);
                
                // Change
                const changeCell = document.createElement('td');
                changeCell.textContent = (market.change >= 0 ? '+' : '') + market.change.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                changeCell.style.color = market.change >= 0 ? 'var(--success, #2ecc71)' : 'var(--danger, #e74c3c)';
                row.appendChild(changeCell);
                
                // Percent Change
                const percentCell = document.createElement('td');
                percentCell.textContent = (market.percentChange >= 0 ? '+' : '') + market.percentChange.toFixed(2) + '%';
                percentCell.style.color = market.percentChange >= 0 ? 'var(--success, #2ecc71)' : 'var(--danger, #e74c3c)';
                row.appendChild(percentCell);
                
                // Status
                const statusCell = document.createElement('td');
                const statusSpan = document.createElement('span');
                statusSpan.className = `market-status ${market.status}`;
                statusSpan.textContent = market.status.charAt(0).toUpperCase() + market.status.slice(1);
                statusCell.appendChild(statusSpan);
                row.appendChild(statusCell);
                
                tableBody.appendChild(row);
            });
        });
    };
    
    /**
     * Forex and Commodities Tabs
     * Manages tab switching and widget loading
     */
    const setupForexCommoditiesTabs = () => {
        const tabButtons = $$('.tab-btn');
        
        tabButtons.forEach(button => {
            addEvent(button, 'click', () => {
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Get tab to display
                const tabId = button.getAttribute('data-tab');
                
                // Update tab content visibility
                const tabContents = $$('.tab-content');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const activeContent = $(`#${tabId}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                    
                    // Load widgets if needed
                    if (tabId === 'forex' && !$('#forex-widget-container').innerHTML) {
                        loadForexWidgets();
                    } else if (tabId === 'commodities' && !$('#commodities-widget-container').innerHTML) {
                        loadCommoditiesWidgets();
                    }
                }
            });
        });
        
        // Initialize the forex tab widgets (default tab)
        loadForexWidgets();
    };
    
    /**
     * Load Forex Widgets
     * Creates TradingView widgets for forex pairs
     */
    const loadForexWidgets = () => {
        const container = $('#forex-widget-container');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Define forex pairs to display
        const forexPairs = [
            { symbol: 'FX:EURUSD', description: 'EUR/USD' },
            { symbol: 'FX:GBPUSD', description: 'GBP/USD' },
            { symbol: 'FX:USDJPY', description: 'USD/JPY' },
            { symbol: 'FX:AUDUSD', description: 'AUD/USD' },
            { symbol: 'FX:USDCAD', description: 'USD/CAD' },
            { symbol: 'FX:EURSEK', description: 'EUR/SEK' }
        ];
        
        // Create forex widgets
        forexPairs.forEach(pair => {
            const widgetDiv = document.createElement('div');
            widgetDiv.className = 'forex-widget';
            
            // Create TradingView Mini Chart widget
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.type = 'text/javascript';
            script.innerHTML = JSON.stringify({
                "symbol": pair.symbol,
                "width": "100%",
                "height": "100%",
                "locale": "en",
                "dateRange": "1D",
                "colorTheme": "light",
                "trendLineColor": "rgba(41, 98, 255, 1)",
                "underLineColor": "rgba(41, 98, 255, 0.3)",
                "underLineBottomColor": "rgba(41, 98, 255, 0)",
                "isTransparent": false,
                "autosize": true,
                "largeChartUrl": ""
            });
            
            widgetDiv.appendChild(script);
            container.appendChild(widgetDiv);
        });
    };
    
    /**
     * Load Commodities Widgets
     * Creates TradingView widgets for commodities
     */
    const loadCommoditiesWidgets = () => {
        const container = $('#commodities-widget-container');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Define commodities to display
        const commodities = [
            { symbol: 'COMEX:GC1!', description: 'Gold Futures' },
            { symbol: 'COMEX:SI1!', description: 'Silver Futures' },
            { symbol: 'NYMEX:CL1!', description: 'Crude Oil WTI' },
            { symbol: 'NYMEX:NG1!', description: 'Natural Gas' },
            { symbol: 'COMEX:HG1!', description: 'Copper Futures' },
            { symbol: 'CBOT:ZC1!', description: 'Corn Futures' }
        ];
        
        // Create commodities widgets
        commodities.forEach(commodity => {
            const widgetDiv = document.createElement('div');
            widgetDiv.className = 'commodity-widget';
            
            // Create TradingView Mini Chart widget
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
            script.async = true;
            script.type = 'text/javascript';
            script.innerHTML = JSON.stringify({
                "symbol": commodity.symbol,
                "width": "100%",
                "height": "100%",
                "locale": "en",
                "dateRange": "1D",
                "colorTheme": "light",
                "trendLineColor": "rgba(41, 98, 255, 1)",
                "underLineColor": "rgba(41, 98, 255, 0.3)",
                "underLineBottomColor": "rgba(41, 98, 255, 0)",
                "isTransparent": false,
                "autosize": true,
                "largeChartUrl": ""
            });
            
            widgetDiv.appendChild(script);
            container.appendChild(widgetDiv);
        });
    };
    
    /**
     * Market News Ticker
     * Creates and populates the news ticker
     */
    const setupNewsTicker = () => {
        const tickerTrack = $('#news-ticker');
        if (!tickerTrack) return;
        
        // Sample news headlines (in a real implementation, these would come from a news API)
        const newsHeadlines = [
            "Federal Reserve holds interest rates steady, signals possible future cuts",
            "Tech stocks rally pushes Nasdaq to new record high",
            "European markets mixed as investors await ECB decision",
            "Oil prices rise on supply concerns amid Middle East tensions",
            "Swedish OMXS30 drops slightly after disappointing manufacturing data",
            "Gold hits 2-month high as market uncertainty rises",
            "US jobless claims fall to lowest level in three weeks",
            "Asian markets close mixed after volatile trading session",
            "UK inflation falls to two-year low, below Bank of England target",
            "Bitcoin surges above $65,000 as investor sentiment improves"
        ];
        
        // Clear loading message
        tickerTrack.innerHTML = '';
        
        // Add news headlines to ticker
        newsHeadlines.forEach(headline => {
            const tickerItem = document.createElement('span');
            tickerItem.className = 'ticker-item';
            tickerItem.textContent = headline;
            tickerTrack.appendChild(tickerItem);
        });
        
        // Clone items for seamless looping
        newsHeadlines.forEach(headline => {
            const tickerItem = document.createElement('span');
            tickerItem.className = 'ticker-item';
            tickerItem.textContent = headline;
            tickerTrack.appendChild(tickerItem);
        });
    };
    
    // Initialize modules
    setupSectorsHeatmap();
    setupExpandableContent();
    setupGlobalMarketsMap();
    setupGlobalMarketsTable();
    setupForexCommoditiesTabs();
    setupNewsTicker();
});
/**
 * HOLMDEX MARKETS PAGE JAVASCRIPT - PART 3
 * Performance optimizations, UI enhancements, and mobile responsiveness
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Redefine helper functions for modularity
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    const addEvent = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    };
    
    /**
     * Performance Optimizations
     * Improves page load and rendering performance
     */
    const setupPerformanceOptimizations = () => {
        // Lazy load TradingView widgets
        const loadWidgetsOnScroll = () => {
            // Define sections that contain widgets
            const widgetSections = [
                { id: 'sectors-heatmap-widget', loaded: false },
                { id: 'global-markets-widget', loaded: false }
            ];
            
            // Create IntersectionObserver
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        const section = widgetSections.find(s => s.id === sectionId);
                        
                        if (section && !section.loaded) {
                            // Trigger load for this section
                            switch (sectionId) {
                                case 'sectors-heatmap-widget':
                                    if (!section.loaded) {
                                        // This is now handled by setupSectorsHeatmap
                                        section.loaded = true;
                                    }
                                    break;
                                case 'global-markets-widget':
                                    if (!section.loaded) {
                                        // This is now handled by setupGlobalMarketsMap
                                        section.loaded = true;
                                    }
                                    break;
                            }
                            
                            // Once loaded, stop observing this section
                            observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '100px'
            });
            
            // Start observing widget containers
            widgetSections.forEach(section => {
                const element = $(`#${section.id}`);
                if (element) {
                    observer.observe(element);
                }
            });
        };
        
        // Initialize lazy loading
        if ('IntersectionObserver' in window) {
            loadWidgetsOnScroll();
        }
        
        // Defer non-critical JavaScript
        const deferScripts = () => {
            // Load Font Awesome if not already present
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
        
        // Add debounce function for scroll events
        const debounce = (func, wait = 20) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };
        
        // Optimize scroll event handling
        const optimizeScrollEvents = () => {
            // Debounced scroll handler
            const handleScroll = debounce(() => {
                // Add scroll-based animations or functionality here
                animateOnScroll();
            });
            
            window.addEventListener('scroll', handleScroll);
        };
        
        optimizeScrollEvents();
    };
    
    /**
     * Scroll-Based Animations
     * Adds animations that trigger as elements scroll into view
     */
    const animateOnScroll = () => {
        // Elements to animate on scroll
        const animateElements = $$('.education-card, .market-card, .info-card');
        
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
                    // The element is now visible
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    entry.target.classList.add('fade-in');
                    entry.target.style.setProperty('--delay', delay);
                    
                    // Stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Start observing elements
        animateElements.forEach((el, index) => {
            // Add staggered delay
            el.setAttribute('data-delay', index * 100);
            observer.observe(el);
        });
    };
    
    /**
     * Mobile Optimizations
     * Enhances the experience on mobile devices
     */
    const setupMobileOptimizations = () => {
        // Check if device is mobile
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Optimize tables for mobile
            const responsiveTables = () => {
                const table = $('.markets-table');
                if (table) {
                    // Add data-label attributes for mobile display
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
                    
                    table.querySelectorAll('tbody tr').forEach(row => {
                        if (row.classList.contains('region-header')) return;
                        
                        Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
                            if (headers[index]) {
                                cell.setAttribute('data-label', headers[index]);
                            }
                        });
                    });
                }
            };
            
            // Optimize charts for mobile
            const optimizeCharts = () => {
                const chartDisplay = $('.chart-display');
                if (chartDisplay && window.innerWidth < 768) {
                    chartDisplay.style.height = '300px';
                }
            };
            
            // Run mobile optimizations
            responsiveTables();
            optimizeCharts();
            
            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    optimizeCharts();
                }, 300);
            });
        }
    };
    
    /**
     * Theme Preferences
     * Handles dark mode and other theme preferences
     */
    const setupThemePreferences = () => {
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
                
/**
 * HOLMDEX MARKETS PAGE JAVASCRIPT - PART 3 (continued)
 */

                // Update icon
                const icon = themeSwitch.querySelector('i');
                if (icon) {
                    if (newTheme === 'dark') {
                        icon.classList.remove('fa-moon');
                        icon.classList.add('fa-sun');
                    } else {
                        icon.classList.remove('fa-sun');
                        icon.classList.add('fa-moon');
                    }
                }
            });
            
            // Update initial icon based on current theme
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                const icon = themeSwitch.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
            
            document.body.appendChild(themeSwitch);
        }
        
        // Add listeners for system theme changes
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkModeMediaQuery.addEventListener) {
            darkModeMediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('holmdexTheme')) {
                    // Only apply if user hasn't explicitly set a preference
                    document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }
    };
    
    /**
     * Accessibility Improvements
     * Enhances keyboard navigation and screen reader support
     */
    const setupAccessibility = () => {
        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = $$('.market-card, .chart-tab, .tab-btn, .timeframe-btn, .education-card');
        
        interactiveElements.forEach(el => {
            // Add tabindex if not already present
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
            
            // Add keyboard event listeners for elements that need them
            if (el.classList.contains('market-card') || el.classList.contains('education-card')) {
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        el.click();
                    }
                });
            }
        });
        
        // Add skip link for keyboard navigation
        if (!$('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.className = 'skip-link';
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to content';
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
        
        // Ensure TradingView widgets have proper ARIA attributes
        setTimeout(() => {
            const iframes = $$('iframe');
            iframes.forEach(iframe => {
                if (iframe.src.includes('tradingview.com')) {
                    iframe.setAttribute('title', 'TradingView Chart Widget');
                    iframe.setAttribute('aria-label', 'Interactive financial chart');
                }
            });
        }, 3000); // Give time for widgets to load
    };
    
    /**
     * Error Handling
     * Sets up global error handling for widgets and components
     */
    const setupErrorHandling = () => {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.message);
            
            // Check if error is related to TradingView widgets
            if (e.message.includes('tradingview') || e.filename.includes('tradingview')) {
                // Handle TradingView errors
                handleWidgetError();
            }
        });
        
        // Handle Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise rejection:', e.reason);
        });
        
        // Function to handle widget loading errors
        const handleWidgetError = () => {
            // Find all widget containers
            const widgetContainers = [
                ...$$('.chart-wrapper'),
                $('#sectors-heatmap-widget'),
                $('#global-markets-widget'),
                $('#forex-widget-container'),
                $('#commodities-widget-container')
            ].filter(Boolean);
            
            // Check each container for content
            widgetContainers.forEach(container => {
                // If container is empty or only contains a script tag
                if (!container.children.length || 
                    (container.children.length === 1 && container.children[0].tagName === 'SCRIPT')) {
                    
                    // Create fallback content
                    const fallbackElement = document.createElement('div');
                    fallbackElement.className = 'widget-fallback';
                    fallbackElement.innerHTML = `
                        <div class="fallback-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Chart widget could not be loaded.</p>
                            <button class="reload-widget-btn">Try Again</button>
                        </div>
                    `;
                    
                    // Add reload functionality
                    const reloadBtn = fallbackElement.querySelector('.reload-widget-btn');
                    if (reloadBtn) {
                        reloadBtn.addEventListener('click', () => {
                            location.reload(); // Simple reload for now
                        });
                    }
                    
                    // Clear container and add fallback
                    container.innerHTML = '';
                    container.appendChild(fallbackElement);
                }
            });
        };
        
        // Set timeout to check widget loading status
        setTimeout(() => {
            // Find chart containers and check if they have loaded
            const chartContainers = $$('.chart-wrapper');
            chartContainers.forEach(container => {
                if (!container.querySelector('iframe')) {
                    const activeContainer = container.classList.contains('active');
                    if (activeContainer) {
                        // If active container failed to load, try again
                        const chartId = container.id.replace('chart-', '');
                        try {
                            loadTradingViewWidget(chartId);
                        } catch (e) {
                            handleWidgetError();
                        }
                    }
                }
            });
        }, 5000); // Check after 5 seconds
    };
    
    /**
     * Social Sharing
     * Adds social sharing functionality
     */
    const setupSocialSharing = () => {
        // Add share button
        const addShareButton = () => {
            if ($('.share-button')) return;
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'share-button';
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
            shareBtn.setAttribute('aria-label', 'Share this page');
            shareBtn.setAttribute('title', 'Share this page');
            
            // Add click handler
            shareBtn.addEventListener('click', () => {
                const title = document.title;
                const url = window.location.href;
                
                // Check if Web Share API is supported
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        url: url
                    }).catch(console.error);
                } else {
                    // Fallback to clipboard copy
                    navigator.clipboard.writeText(url).then(() => {
                        // Show copy success message
                        const notification = document.createElement('div');
                        notification.className = 'copy-notification';
                        notification.textContent = 'Link copied to clipboard!';
                        document.body.appendChild(notification);
                        
                        // Remove notification after delay
                        setTimeout(() => {
                            notification.classList.add('fade-out');
                            setTimeout(() => {
                                document.body.removeChild(notification);
                            }, 500);
                        }, 2000);
                    }).catch(console.error);
                }
            });
            
            document.body.appendChild(shareBtn);
        };
        
        // Add share button only if not on a mobile device
        if (!('ontouchstart' in window) || window.navigator.maxTouchPoints === 0) {
            addShareButton();
        }
    };
    
    /**
     * Page Analytics Monitor
     * Tracks user interactions for page improvement (no personal data)
     */
    const setupAnalyticsMonitor = () => {
        // Track chart tab changes
        const trackChartTabChanges = () => {
            const chartTabs = $$('.chart-tab');
            chartTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const chartId = tab.getAttribute('data-chart');
                    if (chartId && window.dataLayer) {
                        window.dataLayer.push({
                            'event': 'chart_view',
                            'chart_type': chartId
                        });
                    }
                });
            });
        };
        
        // Track timeframe selection
        const trackTimeframeChanges = () => {
            const timeframeBtns = $$('.timeframe-btn');
            timeframeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const timeframe = btn.getAttribute('data-timeframe');
                    if (timeframe && window.dataLayer) {
                        window.dataLayer.push({
                            'event': 'timeframe_change',
                            'timeframe': timeframe
                        });
                    }
                });
            });
        };
        
        // Initialize tracking if dataLayer exists
        if (window.dataLayer) {
            trackChartTabChanges();
            trackTimeframeChanges();
        }
    };
    
    /**
     * Back To Top Button
     * Adds a button to quickly scroll back to the top of the page
     */
    const setupBackToTop = () => {
        // Create the button if it doesn't exist
        if (!$('#back-to-top')) {
            const backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'back-to-top';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            
            document.body.appendChild(backToTopBtn);
            
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
        }
    };
    
    /**
     * Load External Resources
     * Handles loading of external resources like fonts and icons
     */
    const loadExternalResources = () => {
        // Check if Font Awesome is loaded
        if (!document.querySelector('link[href*="fontawesome"]')) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(linkElement);
        }
    };
    
    // Initialize all the modules
    setupPerformanceOptimizations();
    setTimeout(animateOnScroll, 300); // Delay slightly to avoid jank during page load
    setupMobileOptimizations();
    setupThemePreferences();
    setupAccessibility();
    setupErrorHandling();
    setupSocialSharing();
    setupAnalyticsMonitor();
    setupBackToTop();
    loadExternalResources();
});

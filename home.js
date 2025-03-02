/**
 * Holmdex Homepage JavaScript
 * Provides interactive functionality for all home page components
 * WordPress-compatible version
 */

// Wait for DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function() {
  
  /********************************************
   * UTILITY FUNCTIONS
   ********************************************/
  
  /**
   * Get element by selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element to search within (optional)
   * @returns {Element|null} - Selected element or null
   */
  function $(selector, parent) {
    if (!parent) parent = document;
    return parent.querySelector(selector);
  }
  
  /**
   * Get all elements by selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element to search within (optional)
   * @returns {NodeList} - Selected elements
   */
  function $$(selector, parent) {
    if (!parent) parent = document;
    return parent.querySelectorAll(selector);
  }
  
  /**
   * Add event listener with error handling
   * @param {Element} element - Element to add listener to
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  function addEvent(element, event, callback) {
    if (element) {
      element.addEventListener(event, callback);
    }
  }
  
  /**
   * Add multiple events to an element
   * @param {Element} element - Element to add listeners to
   * @param {Array} events - Array of event names
   * @param {Function} callback - Callback function
   */
  function addEvents(element, events, callback) {
    if (element) {
      for (var i = 0; i < events.length; i++) {
        element.addEventListener(events[i], callback);
      }
    }
  }
  
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait) {
    if (!wait) wait = 100;
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
  
  /********************************************
   * CONSTRUCTION NOTICE
   ********************************************/
  
  var constructionNotice = $('#constructionNotice');
  
  // Close the construction notice
  window.closeNotice = function() {
    if (constructionNotice) {
      constructionNotice.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(function() {
        constructionNotice.style.display = 'none';
        // Update localStorage to remember user preference
        localStorage.setItem('noticeHidden', 'true');
      }, 300);
    }
  };
  
  // Check if notice was previously closed
  if (localStorage.getItem('noticeHidden') === 'true' && constructionNotice) {
    constructionNotice.style.display = 'none';
  }
  
  /********************************************
   * COOKIE CONSENT BANNER
   ********************************************/
  
  var cookieConsent = $('#cookie-consent');
  var acceptButton = $('#cookie-accept');
  var settingsButton = $('#cookie-settings');
  
  // Hide banner if consent was previously given
  if (localStorage.getItem('cookieConsent') === 'accepted' && cookieConsent) {
    cookieConsent.style.display = 'none';
  }
  
  // Accept all cookies
  addEvent(acceptButton, 'click', function() {
    if (cookieConsent) {
      localStorage.setItem('cookieConsent', 'accepted');
      cookieConsent.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(function() {
        cookieConsent.style.display = 'none';
      }, 300);
    }
  });
  
  // Open cookie settings (placeholder functionality)
  addEvent(settingsButton, 'click', function() {
    // Future implementation: open modal with detailed cookie settings
    alert('Cookie settings functionality will be implemented in a future update.');
  });
  
  /********************************************
   * INVESTMENT CONCEPT TABS
   ********************************************/
  
  var tabButtons = $$('.tab-btn');
  var tabContents = $$('.tab-content');
  var tabInterval;
  var currentTabIndex = 0;
  
  // Switch tab function
  function switchTab(index) {
    if (tabButtons.length === 0 || tabContents.length === 0) return;
    
    // Reset all tabs
    for (var i = 0; i < tabButtons.length; i++) {
      tabButtons[i].classList.remove('active');
      tabButtons[i].setAttribute('aria-selected', 'false');
    }
    
    for (var j = 0; j < tabContents.length; j++) {
      tabContents[j].classList.remove('active');
      tabContents[j].setAttribute('hidden', '');
    }
    
    // Activate selected tab
    tabButtons[index].classList.add('active');
    tabButtons[index].setAttribute('aria-selected', 'true');
    
    var tabId = tabButtons[index].getAttribute('data-tab');
    var activeContent = $('#' + tabId);
    
    if (activeContent) {
      activeContent.classList.add('active');
      activeContent.removeAttribute('hidden');
    }
    
    // Update current index
    currentTabIndex = index;
  }
  
  // Auto-rotate tabs
  function startTabRotation() {
    clearInterval(tabInterval);
    tabInterval = setInterval(function() {
      var nextIndex = (currentTabIndex + 1) % tabButtons.length;
      switchTab(nextIndex);
    }, 8000); // Switch every 8 seconds
  }
  
  // Set up tab button click handlers
  for (var t = 0; t < tabButtons.length; t++) {
    (function(index) {
      tabButtons[index].addEventListener('click', function() {
        switchTab(index);
        // Pause rotation temporarily when user interacts
        clearInterval(tabInterval);
        // Restart after a delay
        setTimeout(startTabRotation, 15000);
      });
      
      // Keyboard navigation for tabs
      tabButtons[index].addEventListener('keydown', function(e) {
        var nextIndex;
        
        switch(e.key) {
          case 'ArrowRight':
            nextIndex = (index + 1) % tabButtons.length;
            tabButtons[nextIndex].focus();
            e.preventDefault();
            break;
          case 'ArrowLeft':
            nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
            tabButtons[nextIndex].focus();
            e.preventDefault();
            break;
          case 'Enter':
          case ' ':
            this.click();
            e.preventDefault();
            break;
        }
      });
    })(t);
  }
  
  // Initialize tabs
  if (tabButtons.length > 0) {
    switchTab(0);
    startTabRotation();
  }
  
  /********************************************
   * SOURCES CAROUSEL
   ********************************************/
  
  var carouselTrack = $('.carousel-track');
  var sourceItems = $$('.news-source-btn');
  var prevBtn = $('#prevBtn');
  var nextBtn = $('#nextBtn');
  
  // Initialize carousel if elements exist
  if (carouselTrack && sourceItems.length > 0) {
    var position = 0;
    var itemWidth = 160; // Width of each item including margins
    
    // Function to update visible items based on container width
    function updateCarousel() {
      if (!carouselTrack || !prevBtn || !nextBtn) return;
      
      var containerWidth = carouselTrack.parentElement.offsetWidth;
      var visibleItems = Math.floor(containerWidth / itemWidth);
      var maxPosition = Math.max(0, sourceItems.length - visibleItems);
      
      // Ensure position is valid
      position = Math.min(position, maxPosition);
      
      // Update carousel position
      carouselTrack.style.transform = 'translateX(-' + (position * itemWidth) + 'px)';
      
      // Enable/disable buttons based on position
      prevBtn.disabled = position <= 0;
      nextBtn.disabled = position >= maxPosition;
      
      // Update button opacity based on disabled state
      prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
      nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
      
      return { maxPosition: maxPosition, visibleItems: visibleItems };
    }
    
    // Set initial width of carousel track
    carouselTrack.style.width = (sourceItems.length * itemWidth) + 'px';
    
    // Button click handlers
    addEvent(prevBtn, 'click', function() {
      position = Math.max(0, position - 1);
      updateCarousel();
    });
    
    addEvent(nextBtn, 'click', function() {
      var result = updateCarousel() || { maxPosition: 0 };
      position = Math.min(result.maxPosition, position + 1);
      updateCarousel();
    });
    
    // Initialize carousel
    updateCarousel();
    
    // Update carousel on window resize
    window.addEventListener('resize', debounce(updateCarousel, 200));
  }
  
  /********************************************
   * TESTIMONIALS SLIDER
   ********************************************/
  
  var testimonialTrack = $('.testimonials-track');
  var testimonialCards = $$('.testimonial-card');
  var testimonialDots = $$('.dot');
  var prevTestimonialBtn = $('#testimonialPrev');
  var nextTestimonialBtn = $('#testimonialNext');
  
  // Initialize testimonials slider if elements exist
  if (testimonialTrack && testimonialCards.length > 0) {
    var currentTestimonial = 0;
    var testimonialInterval;
    
    // Function to show specific testimonial
    function showTestimonial(index) {
      if (!testimonialTrack) return;
      
      // Update slide position
      testimonialTrack.style.transform = 'translateX(-' + (index * 100) + '%)';
      
      // Update active dot
      for (var i = 0; i < testimonialDots.length; i++) {
        testimonialDots[i].classList.toggle('active', i === index);
        testimonialDots[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
      }
      
      currentTestimonial = index;
    }
    
    // Auto-rotate testimonials
    function startTestimonialRotation() {
      clearInterval(testimonialInterval);
      testimonialInterval = setInterval(function() {
        var nextIndex = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(nextIndex);
      }, 6000); // Rotate every 6 seconds
    }
    
    // Button click handlers
    addEvent(prevTestimonialBtn, 'click', function() {
      var prevIndex = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
      showTestimonial(prevIndex);
      // Pause rotation temporarily
      clearInterval(testimonialInterval);
      setTimeout(startTestimonialRotation, 10000);
    });
    
    addEvent(nextTestimonialBtn, 'click', function() {
      var nextIndex = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(nextIndex);
      // Pause rotation temporarily
      clearInterval(testimonialInterval);
      setTimeout(startTestimonialRotation, 10000);
    });
    
    // Dot click handlers
    for (var d = 0; d < testimonialDots.length; d++) {
      (function(index) {
        testimonialDots[index].addEventListener('click', function() {
          showTestimonial(index);
          // Pause rotation temporarily
          clearInterval(testimonialInterval);
          setTimeout(startTestimonialRotation, 10000);
        });
      })(d);
    }
    
    // Initialize testimonials
    showTestimonial(0);
    startTestimonialRotation();
  }
  
  /********************************************
   * INVESTMENT CALCULATOR
   ********************************************/
  
  var initialInvestment = $('#initial-investment');
  var monthlyContribution = $('#monthly-contribution');
  var timePeriod = $('#time-period');
  var timePeriodValue = $('#time-period-value');
  var interestRate = $('#interest-rate');
  var interestRateValue = $('#interest-rate-value');
  var compoundFrequency = $('#compound-frequency');
  var finalBalance = $('#final-balance');
  var totalContributions = $('#total-contributions');
  var totalInterest = $('#total-interest');
  var chartContainer = $('.chart-container');
  
  // Initialize chart if Chart.js is loaded and elements exist
  var investmentChart;
  
  function initializeChart() {
    if (typeof Chart !== 'undefined' && chartContainer) {
      var canvas = document.createElement('canvas');
      canvas.id = 'investmentChart';
      
      // Replace placeholder with canvas
      var placeholder = $('.chart-placeholder');
      if (placeholder) {
        placeholder.innerHTML = '';
        placeholder.appendChild(canvas);
      }
      
      // Create chart
      var ctx = canvas.getContext('2d');
      investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Total Balance',
              data: [],
              backgroundColor: 'rgba(37, 167, 94, 0.2)',
              borderColor: 'rgba(37, 167, 94, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Contributions',
              data: [],
              backgroundColor: 'rgba(10, 37, 64, 0.2)',
              borderColor: 'rgba(10, 37, 64, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  var label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Years'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Balance ($)'
              },
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumSignificantDigits: 3
                  }).format(value);
                }
              }
            }
          }
        }
      });
    }
  }
  
  // Calculate investment growth
  function calculateInvestment() {
    if (!initialInvestment || !monthlyContribution || !timePeriod || 
        !interestRate || !compoundFrequency || !finalBalance || 
        !totalContributions || !totalInterest) {
      return;
    }
    
    var principal = parseFloat(initialInvestment.value) || 0;
    var monthly = parseFloat(monthlyContribution.value) || 0;
    var years = parseFloat(timePeriod.value) || 0;
    var rate = parseFloat(interestRate.value) / 100 || 0;
    var compounds = parseFloat(compoundFrequency.value) || 12;
    
    // Calculate total contributions
    var totalMonthlyContributions = monthly * years * 12;
    var totalInitialPrincipal = principal + totalMonthlyContributions;
    
    // Calculate compound interest
    var balance = principal;
    var monthlyRate = rate / compounds;
    var totalMonths = years * 12;
    
    // Prepare data for chart
    var yearLabels = [];
    var balanceData = [];
    var contributionData = [];
    
    // Add initial point
    yearLabels.push(0);
    balanceData.push(principal);
    contributionData.push(principal);
    
    // Calculate year-by-year growth
    for (var year = 1; year <= years; year++) {
      // Calculate balance for this year
      for (var month = 1; month <= 12; month++) {
        // Apply interest for the month
        balance *= (1 + monthlyRate);
        // Add monthly contribution
        balance += monthly;
      }
      
      // Track contributions for this year
      var contributionAtYear = principal + (monthly * year * 12);
      
      // Add data point for this year
      yearLabels.push(year);
      balanceData.push(balance);
      contributionData.push(contributionAtYear);
    }
    
    // Update results
    finalBalance.textContent = formatCurrency(balance);
    totalContributions.textContent = formatCurrency(totalInitialPrincipal);
    totalInterest.textContent = formatCurrency(balance - totalInitialPrincipal);
    
    // Update chart if it exists
    if (investmentChart) {
      investmentChart.data.labels = yearLabels;
      investmentChart.data.datasets[0].data = balanceData;
      investmentChart.data.datasets[1].data = contributionData;
      investmentChart.update();
    }
  }
  
  // Format currency values
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  // Set up calculator event listeners
  function setupCalculatorListeners() {
    if (initialInvestment && monthlyContribution && timePeriod && 
        interestRate && compoundFrequency) {
      
      var inputs = [initialInvestment, monthlyContribution, compoundFrequency];
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', calculateInvestment);
        inputs[i].addEventListener('input', calculateInvestment);
      }
      
      // Special handling for range inputs to update display value
      timePeriod.addEventListener('input', function() {
        if (timePeriodValue) {
          timePeriodValue.textContent = this.value;
        }
        calculateInvestment();
      });
      
      interestRate.addEventListener('input', function() {
        if (interestRateValue) {
          interestRateValue.textContent = this.value;
        }
        calculateInvestment();
      });
    }
  }
  
  // Initialize calculator
  function initializeCalculator() {
    if (initialInvestment && monthlyContribution && timePeriod && 
        interestRate && compoundFrequency) {
      
      initializeChart();
      setupCalculatorListeners();
      calculateInvestment(); // Calculate initial values
    }
  }
  
  // Initialize calculator if Chart.js is loaded
  if (typeof Chart !== 'undefined') {
    initializeCalculator();
  } else {
    // If Chart.js is loaded asynchronously
    window.addEventListener('load', function() {
      if (typeof Chart !== 'undefined') {
        initializeCalculator();
      }
    });
  }
  
  /********************************************
   * FAQ ACCORDION
   ********************************************/
  
  var faqQuestions = $$('.faq-question');
  
  for (var q = 0; q < faqQuestions.length; q++) {
    faqQuestions[q].addEventListener('click', function() {
      var answerId = this.getAttribute('aria-controls');
      var answer = $('#' + answerId);
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle current question
      this.setAttribute('aria-expanded', !isExpanded);
      
      if (answer) {
        if (isExpanded) {
          answer.setAttribute('hidden', '');
        } else {
          answer.removeAttribute('hidden');
        }
      }
    });
    
    // Keyboard accessibility
    faqQuestions[q].addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  }
  
  /********************************************
   * NEWSLETTER FORM
   ********************************************/
  
  var subscribeForm = $('#subscribe-form');
  
  addEvent(subscribeForm, 'submit', function(e) {
    e.preventDefault();
    
    // Get form values
    var emailElement = $('#subscriber-email');
    var frequencyElement = $('#subscriber-frequency');
    var consentElement = $('#gdpr-consent');
    
    var email = emailElement ? emailElement.value : '';
    var frequency = frequencyElement ? frequencyElement.value : 'weekly';
    var consent = consentElement ? consentElement.checked : false;
    
    // Validate form
    if (!email || !consent) {
      alert('Please fill in all required fields and accept the privacy policy.');
      return;
    }
    
    // In a real implementation, this would send data to a server
    // For now, we'll just show a success message
    alert('Thank you for subscribing with ' + email + '! You will receive ' + frequency + ' updates.');
    
    // Reset form
    this.reset();
  });
  
  /********************************************
   * BACK TO TOP BUTTON
   ********************************************/
  
  var backToTopBtn = $('#backToTop');
  
  // Show/hide button based on scroll position
  function toggleBackToTopButton() {
    if (backToTopBtn) {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }
  
  // Scroll to top when button is clicked
  addEvent(backToTopBtn, 'click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Initial check and add scroll listener
  toggleBackToTopButton();
  window.addEventListener('scroll', debounce(toggleBackToTopButton, 100));
  
  /********************************************
   * SMOOTH SCROLLING FOR ANCHOR LINKS
   ********************************************/
  
  var anchorLinks = $$('a[href^="#"]:not([href="#"])');
  
  for (var a = 0; a < anchorLinks.length; a++) {
    anchorLinks[a].addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      var targetElement = $(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Get header height for offset
        var headerElement = $('.holmdex-header');
        var headerHeight = headerElement ? headerElement.offsetHeight : 0;
        
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight - 20,
          behavior: 'smooth'
        });
        
        // Update URL without page jump
        history.pushState(null, null, targetId);
      }
    });
  }
  
  /********************************************
   * SECTION REVEAL ANIMATIONS
   ********************************************/
  
  function initSectionAnimations() {
    if ('IntersectionObserver' in window) {
      var sections = $$('section:not(.hero)');
      
      var revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };
      
      var revealOnScroll = new IntersectionObserver(function(entries, observer) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (!entry.isIntersecting) continue;
          
          // Add animation class
          entry.target.classList.add('revealed');
          
          // Stop observing after animation
          observer.unobserve(entry.target);
        }
      }, revealOptions);
      
      // Start observing each section
      for (var s = 0; s < sections.length; s++) {
        revealOnScroll.observe(sections[s]);
      }
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      var allSections = $$('section');
      for (var i = 0; i < allSections.length; i++) {
        allSections[i].classList.add('revealed');
      }
    }
  }
  
  // Initialize section animations
  initSectionAnimations();
  
  /********************************************
   * SERVICE CARD HOVER EFFECTS
   ********************************************/
  
  var serviceCards = $$('.service-card');
  
  for (var c = 0; c < serviceCards.length; c++) {
    // Add 3D tilt effect on mousemove
    serviceCards[c].addEventListener('mousemove', function(e) {
      if (window.innerWidth <= 768) return; // Skip on mobile
      
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position (subtle effect)
      var xRotation = ((y - rect.height / 2) / rect.height) * 5;
      var yRotation = ((rect.width / 2 - x) / rect.width) * 5;
      
      // Apply the transform with perspective
      this.style.transform = 'perspective(1000px) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg) translateY(-5px)';
    });
    
    // Reset transform on mouse leave
    serviceCards[c].addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
    
    // Add focus effect for accessibility
    serviceCards[c].addEventListener('focus', function() {
      this.classList.add('focused');
    });
    
    serviceCards[c].addEventListener('blur', function() {
      this.classList.remove('focused');
    });
  }
  
  /********************************************
   * KEYBOARD ACCESSIBILITY
   ********************************************/
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Escape key closes notices
    if (e.key === 'Escape') {
      // Close construction notice if visible
      if (constructionNotice && constructionNotice.style.display !== 'none') {
        closeNotice();
      }
      
      // Close cookie consent if visible
      if (cookieConsent && cookieConsent.style.display !== 'none') {
        acceptButton.click();
      }
    }
    
    // Home key scrolls to top
    if (e.key === 'Home' && !e.ctrlKey) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      e.preventDefault();
    }
    
    // End key scrolls to bottom
    if (e.key === 'End' && !e.ctrlKey) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      e.preventDefault();
    }
  });
  
  /********************************************
   * PAGE LOAD ANIMATIONS
   ********************************************/
  
  // Add class to body when page is loaded
  document.body.classList.add('page-loaded');
  
  // Add fade-out animation before leaving the page
  window.addEventListener('beforeunload', function() {
    document.body.classList.add('page-exiting');
  });
  
  /********************************************
   * CURRENT YEAR FOR COPYRIGHT
   ********************************************/
  
  var yearElement = $('#current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

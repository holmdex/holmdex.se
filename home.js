// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // ===== Construction Notice =====
  const constructionNotice = document.getElementById('constructionNotice');
  
  // Close the construction notice
  window.closeNotice = function() {
    constructionNotice.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => {
      constructionNotice.style.display = 'none';
      // Save to localStorage to remember the user closed it
      localStorage.setItem('noticeHidden', 'true');
    }, 300);
  };
  
  // Check if user already closed the notice
  if (localStorage.getItem('noticeHidden') === 'true') {
    constructionNotice.style.display = 'none';
  }
  
  // ===== Concept Tabs =====
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the tab to show
      const tabId = this.getAttribute('data-tab');
      
      // Hide all tabs and remove active class from buttons
      tabContents.forEach(tab => tab.classList.remove('active'));
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Show the selected tab and set active class on button
      document.getElementById(tabId).classList.add('active');
      this.classList.add('active');
    });
  });
  
  // ===== Sources Carousel =====
  const carouselTrack = document.querySelector('.carousel-track');
  const sourceBtns = document.querySelectorAll('.news-source-btn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  let position = 0;
  const itemWidth = 160; // Width of each item including margins
  const visibleItems = Math.floor(carouselTrack.offsetWidth / itemWidth);
  const maxPosition = Math.max(0, sourceBtns.length - visibleItems);
  
  // Set initial width of carousel track
  carouselTrack.style.width = `${sourceBtns.length * itemWidth}px`;
  
  // Function to update the carousel position
  function updateCarousel() {
    carouselTrack.style.transform = `translateX(-${position * itemWidth}px)`;
    
    // Enable/disable buttons based on position
    prevBtn.disabled = position <= 0;
    nextBtn.disabled = position >= maxPosition;
    
    // Update button opacity based on disabled state
    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
  }
  
  // Button click handlers
  prevBtn.addEventListener('click', function() {
    position = Math.max(0, position - 1);
    updateCarousel();
  });
  
  nextBtn.addEventListener('click', function() {
    position = Math.min(maxPosition, position + 1);
    updateCarousel();
  });
  
  // Initialize carousel
  updateCarousel();
  
  // Update carousel on window resize
  window.addEventListener('resize', function() {
    const newVisibleItems = Math.floor(carouselTrack.parentElement.offsetWidth / itemWidth);
    const newMaxPosition = Math.max(0, sourceBtns.length - newVisibleItems);
    position = Math.min(position, newMaxPosition);
    updateCarousel();
  });
  
  // ===== Intro Cards Highlighting =====
  const introCards = document.querySelectorAll('.intro-card');
  
  introCards.forEach(card => {
    card.addEventListener('click', function() {
      introCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // ===== Back to Top Button =====
  const backToTopBtn = document.getElementById('backToTop');
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // Scroll to top when button is clicked
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // ===== Auto-switching Concept Tabs =====
  let tabInterval;
  let currentTabIndex = 0;
  
  function autoSwitchTabs() {
    tabInterval = setInterval(() => {
      currentTabIndex = (currentTabIndex + 1) % tabButtons.length;
      tabButtons[currentTabIndex].click();
    }, 8000); // Switch every 8 seconds
  }
  
  // Start auto-switching
  autoSwitchTabs();
  
  // Stop auto-switching when user interacts with tabs
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      clearInterval(tabInterval);
      // Update current index to the clicked tab
      currentTabIndex = Array.from(tabButtons).indexOf(this);
      // Restart auto-switching after a delay
      setTimeout(autoSwitchTabs, 15000);
    });
  });
  
  // ===== Smooth Scrolling for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 50,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // ===== Interactive Cards Animation =====
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s ease-out';
    });
    
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position
      const xRotation = ((y - rect.height / 2) / rect.height) * 10;
      const yRotation = ((rect.width / 2 - x) / rect.width) * 10;
      
      // Apply the transform
      this.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(-5px)';
    });
  });
  
  // ===== Add keyboard navigation =====
  document.addEventListener('keydown', function(e) {
    // Escape key closes the construction notice
    if (e.key === 'Escape' && constructionNotice.style.display !== 'none') {
      closeNotice();
    }
    
    // Arrow keys for carousel navigation
    if (e.key === 'ArrowLeft') {
      prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      nextBtn.click();
    }
    
    // Home key scrolls to top
    if (e.key === 'Home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
  
  // ===== Add simple preloader =====
  const body = document.body;
  body.classList.add('loaded');
  
  // ===== Intersection Observer for Animations =====
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section');
    
    const appearOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      });
    }, appearOptions);
    
    sections.forEach(section => {
      section.classList.add('section--hidden');
      appearOnScroll.observe(section);
    });
  }
});

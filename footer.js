// Footer JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Set current year for copyright
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Disclaimer toggle functionality
  const disclaimerToggle = document.querySelector('.disclaimer-toggle');
  const disclaimerContent = document.getElementById('disclaimer-content');
  
  if (disclaimerToggle && disclaimerContent) {
    disclaimerToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle expanded state
      this.setAttribute('aria-expanded', !expanded);
      disclaimerContent.classList.toggle('expanded');
      
      // Store preference in localStorage
      localStorage.setItem('disclaimerExpanded', !expanded);
    });
    
    // Check if disclaimer was previously expanded
    const wasExpanded = localStorage.getItem('disclaimerExpanded') === 'true';
    if (wasExpanded) {
      disclaimerToggle.setAttribute('aria-expanded', 'true');
      disclaimerContent.classList.add('expanded');
    }
  }
  
  // Contact trigger functionality (for example, open a modal or scroll to contact form)
  const contactTrigger = document.getElementById('contact-trigger');
  if (contactTrigger) {
    contactTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Check if there's a contact form on the page
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        // Scroll to contact form
        contactForm.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If no contact form, create a simple alert (could be replaced with a modal)
        alert('Contact us at: info@holmdex.se');
      }
    });
  }
  
  // Add smooth scrolling for all footer links that point to an ID on the same page
  const footerLinks = document.querySelectorAll('.holmdex-footer a[href^="#"]');
  footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Make sure this is a link to an ID
      const href = this.getAttribute('href');
      if (href.length > 1) { // More than just '#'
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  // Fade in animation for footer when scrolled into view
  const footer = document.querySelector('.holmdex-footer');
  
  if (footer && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.style.opacity = '1';
          observer.unobserve(footer);
        }
      });
    }, { threshold: 0.1 });
    
    // Set initial opacity and start observing
    footer.style.opacity = '0';
    footer.style.transition = 'opacity 0.5s ease';
    observer.observe(footer);
  } else if (footer) {
    // Fallback for browsers without IntersectionObserver
    footer.style.opacity = '1';
  }
});

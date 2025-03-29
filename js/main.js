/**
 * United Defense Tactical - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Header scroll effect
  const header = document.querySelector('.site-header');

  function handleScroll() {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');

      // Accessibility - Toggle aria-expanded
      const expanded = navLinks.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', expanded);

      // Change burger icon to X when menu is open (visual indicator)
      const spans = menuToggle.querySelectorAll('span');
      if (expanded) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');

        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // Counter Animation
  function animateCounters() {
    const counterElements = document.querySelectorAll('.counter-value');

    counterElements.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // 2 seconds
      const step = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.ceil(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      updateCounter();
    });
  }

  // FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // Pricing Toggle
  const pricingToggle = document.querySelector('#pricing-toggle');
  const monthlyPrices = document.querySelectorAll('.price-monthly');
  const yearlyPrices = document.querySelectorAll('.price-yearly');

  if (pricingToggle) {
    pricingToggle.addEventListener('change', function() {
      if (this.checked) {
        // Yearly pricing
        monthlyPrices.forEach(price => price.style.display = 'none');
        yearlyPrices.forEach(price => price.style.display = 'block');
      } else {
        // Monthly pricing
        monthlyPrices.forEach(price => price.style.display = 'block');
        yearlyPrices.forEach(price => price.style.display = 'none');
      }
    });
  }

  // Modal functionality
  const modal = document.getElementById('free-class-modal');
  const openModalBtn = document.getElementById('open-free-class-modal');
  const closeModalBtn = document.getElementById('close-modal');

  if (modal && openModalBtn && closeModalBtn) {
    // Open modal
    openModalBtn.addEventListener('click', function() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    });

    // Close modal
    closeModalBtn.addEventListener('click', function() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close modal on click outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle form submission
  const freeClassForm = document.getElementById('free-class-form');

  if (freeClassForm) {
    freeClassForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const experience = document.getElementById('experience').value;

      // Validate form (simple validation)
      if (!name || !email || !phone || !experience) {
        alert('Please fill out all fields');
        return;
      }

      // Format data for sending
      const formData = {
        name,
        email,
        phone,
        experience,
        date: new Date().toISOString()
      };

      // In a real implementation, you would send this data to a server
      console.log('Form submitted:', formData);

      // Show success message
      freeClassForm.innerHTML = `
        <div class="success-message">
          <h3>Thank You!</h3>
          <p>We've received your request for a free class. One of our instructors will contact you within 24 hours to schedule your session.</p>
        </div>
      `;

      // Auto-close modal after success (3 seconds)
      setTimeout(() => {
        if (modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }, 3000);
    });
  }

  // Video background
  const videoContainer = document.querySelector('.hero-video-container');
  if (videoContainer) {
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    // Add source element
    const source = document.createElement('source');
    source.src = 'videos/tactical-training.mp4';
    source.type = 'video/mp4';

    video.appendChild(source);
    videoContainer.appendChild(video);

    // Fallback if video can't play
    video.addEventListener('error', function() {
      videoContainer.style.backgroundImage = 'url("images/hero-bg.jpg")';
      videoContainer.style.backgroundSize = 'cover';
      videoContainer.style.backgroundPosition = 'center';
    });
  }

  // Initialize Google Map
  function initMap() {
    // Coordinates for Anaheim Hills (updated coordinates for Old Springs Road)
    const location = { lat: 33.8529, lng: -117.7544 };

    // Check if Google Maps API is loaded and element exists
    if (window.google && document.getElementById('map')) {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#1A1A1A" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#333333" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#111111" }]
          }
        ]
      });

      // Add marker for location
      new google.maps.Marker({
        position: location,
        map: map,
        title: 'United Defense Tactical'
      });
    } else {
      // Fallback if Google Maps isn't available
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: var(--color-gunmetal); color: white; text-align: center; padding: 2rem;"><div><p style="margin-bottom: 1rem; font-weight: bold;">United Defense Tactical</p><p>160 S Old Springs Road #155, Anaheim Hills, CA 92808</p></div></div>';
      }
    }
  }

  // This would call the map initialization if Google Maps was included
  // Uncomment the below line if you add the Google Maps API
  // window.initMap = initMap;

  // For demonstration, add a placeholder implementation
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.innerHTML = `
      <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--color-navy); color: white; text-align: center; padding: 2rem;">
        <div>
          <p style="margin-bottom: 1rem; font-weight: bold;">United Defense Tactical</p>
          <p>160 S Old Springs Road #155, Anaheim Hills, CA 92808</p>
        </div>
      </div>
    `;
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Get header height for offset (sticky header)
        const headerHeight = document.querySelector('.site-header').offsetHeight;

        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });

        // Update URL hash without jumping (modern browsers)
        history.pushState(null, null, targetId);
      }
    });
  });

  // Add animation on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
      const position = element.getBoundingClientRect();
      const offset = 100; // Only animate when a specific amount of the element is visible

      // If element is in viewport
      if (position.top - windowHeight + offset < 0) {
        element.classList.add('animate-in');

        // If it's a counter element, start animation
        if (element.classList.contains('counter-container') && !element.classList.contains('counted')) {
          animateCounters();
          element.classList.add('counted'); // Prevent re-counting
        }
      }
    });
  }

  // Add animate-on-scroll class to elements we want to animate
  const animatableElements = document.querySelectorAll('.instructor-card, .category-card, .testimonial-card, .step, .pricing-card, .counter-container, .section-header');
  animatableElements.forEach(element => {
    element.classList.add('animate-on-scroll');
  });

  // Add CSS for modern animations
  const style = document.createElement('style');
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1), 
                  transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .fade-in-left {
      opacity: 0;
      transform: translateX(-40px);
      transition: opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .fade-in-right {
      opacity: 0;
      transform: translateX(40px);
      transition: opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .fade-in-left.animate-in,
    .fade-in-right.animate-in {
      opacity: 1;
      transform: translateX(0);
    }

    .scale-in {
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .scale-in.animate-in {
      opacity: 1;
      transform: scale(1);
    }

    .stagger-item {
      transition-delay: calc(var(--item-index) * 0.1s);
    }
  `;
  document.head.appendChild(style);

  // Assign animation types based on element types
  document.querySelectorAll('.instructor-card').forEach((el, index) => {
    el.classList.add('fade-in-left', 'stagger-item');
    el.style.setProperty('--item-index', index);
  });

  document.querySelectorAll('.category-card').forEach((el, index) => {
    el.classList.add('fade-in-right', 'stagger-item');
    el.style.setProperty('--item-index', index);
  });

  document.querySelectorAll('.pricing-card').forEach((el, index) => {
    el.classList.add('scale-in', 'stagger-item');
    el.style.setProperty('--item-index', index);
  });

  document.querySelectorAll('.testimonial-card').forEach((el, index) => {
    el.classList.add('fade-in-left', 'stagger-item');
    el.style.setProperty('--item-index', index);
  });

  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('scale-in');
  });

  // Listen for scroll events
  window.addEventListener('scroll', animateOnScroll);

  // Initial call to animate elements in view on page load
  setTimeout(animateOnScroll, 100);
});
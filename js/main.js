/**
 * United Defense Tactical - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Implement lazy loading for images
  function setupLazyLoading() {
    // Create a new IntersectionObserver instance
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        // If the image is in the viewport
        if (entry.isIntersecting) {
          const img = entry.target;
          // Replace the src with the data-src value
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          // Stop observing the image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading images when they're 50px from viewport
      threshold: 0.01 // Trigger when even 1% of the image is visible
    });

    // Find all images with data-src attribute and observe them
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Apply lazy loading to existing images
  function convertToLazyLoad() {
    const images = document.querySelectorAll('img:not([data-src])');
    images.forEach(img => {
      // Skip images that are already lazy loaded or don't have a src
      if (!img.src || img.hasAttribute('data-src') || img.src.includes('data:image')) return;

      // Set data-src and use a placeholder
      img.dataset.src = img.src;
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
    });
    setupLazyLoading();
  }

  // Run lazy loading setup
  convertToLazyLoad();

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

  // Handle video loading
  const trainingVideo = document.querySelector('.training-video');
  if (trainingVideo) {
    // Add animation class to video container
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      videoContainer.classList.add('animate-on-scroll');
    }

    // Lazy load video for better performance
    trainingVideo.addEventListener('loadeddata', function() {
      console.log('Video loaded successfully');
    });

    trainingVideo.addEventListener('error', function(e) {
      console.error('Error loading video:', e);
      // Fallback if video doesn't load
      const videoContainer = document.querySelector('.video-container');
      if (videoContainer) {
        videoContainer.innerHTML = `
          <div class="video-fallback">
            <p>Video unavailable. Please check back later.</p>
          </div>
        `;
      }
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
  const closeModalBtn = document.getElementById('close-modal');
  const freeClassButtons = document.querySelectorAll('.free-class-btn');

  if (modal && closeModalBtn) {
    // Open modal for all free class buttons
    freeClassButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        // Prevent default navigation to the #free-class section
        e.stopPropagation(); // Stop the event from bubbling up
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
      });
    });

    // Also handle the dedicated button in free class section
    const openModalBtn = document.getElementById('open-free-class-modal');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', function(e) {
        if (e) e.preventDefault(); // Prevent any default behavior
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
      });
    }

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

  // Image slider for modal with controlled timing
  function setupModalImageSlider() {
    const modal = document.getElementById('free-class-modal');
    if (!modal) return;

    const imageSlider = modal.querySelector('.modal-image-slider');
    if (!imageSlider) return;

    // Images to cycle through
    const imageUrls = [
      'images/udt1.jpg',
      'images/udt2.jpg',
      'images/udt3.jpg',
      'images/udt5.jpg'
    ];

    // Create image elements and add to slider
    imageSlider.innerHTML = '';
    imageUrls.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Tactical Training';
      img.className = index === 0 ? 'active-slide' : '';
      imageSlider.appendChild(img);
    });

    // Set up the image rotation with fixed interval
    let currentIndex = 0;
    const slides = imageSlider.querySelectorAll('img');
    let slideInterval;

    function rotateImages() {
      slides[currentIndex].classList.remove('active-slide');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active-slide');
    }

    function startSlideshow() {
      // Clear any existing interval first to prevent multiple intervals
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      // Start a new interval with fixed timing
      slideInterval = setInterval(rotateImages, 5000); // 5 seconds for more stability
    }

    function stopSlideshow() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    // Start/stop rotation based on modal visibility
    modal.addEventListener('click', function(e) {
      // Only handle direct click on modal or overlay
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        stopSlideshow();
      }
    });

    // Better event listeners for modal visibility
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          if (modal.classList.contains('active')) {
            startSlideshow();
          } else {
            stopSlideshow();
          }
        }
      });
    });

    observer.observe(modal, { attributes: true });

    // Clear interval when modal is closed via button click
    const closeBtn = modal.querySelector('#close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', stopSlideshow);
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stopSlideshow();
      } else if (modal.classList.contains('active')) {
        startSlideshow();
      }
    });
  }

  // Initialize image slider when the page loads
  setupModalImageSlider();

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

  // Video background with mobile optimization
  const videoContainer = document.querySelector('.hero-video-container');
  if (videoContainer) {
    // Check if device is mobile
    const isMobile = window.innerWidth < 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Use static image for mobile
      videoContainer.style.backgroundImage = 'url("images/hero-bg.jpg")';
      videoContainer.style.backgroundSize = 'cover';
      videoContainer.style.backgroundPosition = 'center';

      // Add a class for mobile-specific styling
      videoContainer.classList.add('mobile-hero');
    } else {
      // Use video for desktop
      const video = document.createElement('video');
      video.className = 'hero-video';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('loading', 'lazy');

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

  // Add sticky mobile CTA
  function addStickyCTA() {
    if (window.innerWidth >= 768) return; // Only for mobile

    // Create the sticky CTA element
    const stickyCTA = document.createElement('div');
    stickyCTA.className = 'sticky-cta';
    stickyCTA.innerHTML = `
      <button class="btn btn-primary btn-sticky free-class-btn">
        CLAIM FREE CLASS <span class="arrow">→</span>
      </button>
    `;

    // Append to body
    document.body.appendChild(stickyCTA);

    // Add event listener to the button
    stickyCTA.querySelector('.free-class-btn').addEventListener('click', function(e) {
      e.preventDefault();
      // Open the free class modal
      const modal = document.getElementById('free-class-modal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // Hide sticky CTA when footer is visible
    const footer = document.querySelector('.site-footer');
    if (footer) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            stickyCTA.classList.add('hidden');
          } else {
            stickyCTA.classList.remove('hidden');
          }
        });
      }, { threshold: 0.1 });

      observer.observe(footer);
    }
  }

  // Initialize sticky CTA
  addStickyCTA();


  // Exit intent popup with improved user experience
  function setupExitIntentPopup() {
    let exitIntentShown = false;
    let popupDisplayed = false;

    // Store session state in localStorage to avoid repeated popups
    if (sessionStorage.getItem('exitIntentShown')) {
      exitIntentShown = true;
    }

    // More reliable exit intent detection
    function handleExitIntent() {
      if (exitIntentShown || popupDisplayed) return;

      const modal = document.getElementById('free-class-modal');
      if (!modal || modal.classList.contains('active')) return;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      popupDisplayed = true;

      // Update modal title for better conversion
      const modalTitle = document.querySelector('.form-header h2');
      if (modalTitle) {
        modalTitle.innerHTML = "CLAIM YOUR FREE TRAINING CLASS";
      }

      // Add social proof without being too aggressive
      const modalDescription = document.querySelector('.caption-text');
      if (modalDescription) {
        modalDescription.innerHTML = "Join our community of trained individuals. Limited spots available each week!";
      }

      // Track in session storage to prevent repeated popups
      sessionStorage.setItem('exitIntentShown', 'true');

      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'exit_intent_popup_shown');
      }
    }

    // Desktop exit intent detection
    let mouseY;
    let mouseLeft = false;

    document.addEventListener('mouseleave', function(e) {
      if (e.clientY <= 0 && !e.relatedTarget) {
        mouseLeft = true;
        setTimeout(() => {
          if (mouseLeft) {
            handleExitIntent();
          }
        }, 1000); // Small delay to prevent accidental triggers
      }
    });

    document.addEventListener('mouseenter', function() {
      mouseLeft = false;
    });

    // More reliable scroll detection for mobile
    let lastScrollTop = 0;
    let scrollDirectionChangeCount = 0;

    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Only track significant scrolling near the top
      if (Math.abs(scrollTop - lastScrollTop) > 10) {
        if (scrollTop < lastScrollTop && scrollTop < 300) {
          scrollDirectionChangeCount++;

          // After a few direction changes, user is likely trying to leave
          if (scrollDirectionChangeCount >= 3 && !exitIntentShown) {
            handleExitIntent();
          }
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      }
    }, { passive: true });

    // More user-friendly time-based trigger (60 seconds instead of 45)
    setTimeout(() => {
      if (!exitIntentShown && !popupDisplayed) {
        handleExitIntent();

        if (window.gtag) {
          window.gtag('event', 'time_based_popup_shown');
        }
      }
    }, 60000); // 60 seconds
  }

  // Setup exit intent
  setupExitIntentPopup();


  // Prioritize content loading
  function optimizeContentLoading() {
    // Move testimonials above program section on mobile
    if (window.innerWidth < 768) {
      const testimonialsSection = document.getElementById('testimonials');
      const programsSection = document.getElementById('programs');

      if (testimonialsSection && programsSection) {
        const parent = programsSection.parentNode;
        parent.insertBefore(testimonialsSection, programsSection);

        // Add special class for mobile styling
        testimonialsSection.classList.add('mobile-priority');
      }
    }

    // Defer non-critical scripts
    function deferScript(src) {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Defer non-essential scripts after page load
    window.addEventListener('load', function() {
      setTimeout(() => {
        // Add any additional scripts that aren't critical for initial page load
        deferScript('js/optimized-modal.js');
      }, 2000);
    });
  }

  // Run optimization
  optimizeContentLoading();


  // We've removed the CSS optimization function as it's not necessary
  // and can cause issues with stylesheet loading

/**
 * United Defense Tactical - Conversion-Optimized Modal Implementation
 * 
 * Features:
 * - Multi-stage form to reduce friction
 * - Exit-intent detection
 * - Smart timing (30-second delay if no interaction)
 * - Mobile-optimized experience
 * - Social proof elements
 * - Urgency/scarcity elements
 * - A/B testing ready
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create the modal HTML structure
  const modalHTML = `
    <div id="udt-conversion-modal" class="udt-modal" aria-hidden="true">
      <!-- Modal overlay with tactical background -->
      <div class="modal-overlay">
        <!-- Close button -->
        <button id="modal-close" class="modal-close" aria-label="Close popup">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Modal container -->
        <div class="modal-container">
          <!-- Progress steps (only visible on mobile) -->
          <div class="modal-progress">
            <div class="progress-step active" data-step="1"></div>
            <div class="progress-step" data-step="2"></div>
          </div>

          <!-- Step 1: Value proposition and initial engagement -->
          <div class="modal-step active" data-step="1">
            <div class="modal-content">
              <!-- Title and subtitle -->
              <h2 class="modal-title">TIME TO <span class="highlight">MOVE</span> WHEN SECONDS <span class="highlight">MATTER</span></h2>
              <p class="modal-subtitle">Join the 5,000+ California residents who can now respond with confidence in high-threat situations</p>

              <!-- Value proposition with icons -->
              <div class="value-props">
                <div class="value-prop">
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="value-text">
                    <h3>ELITE MILITARY TRAINING</h3>
                    <p>Learn from real special forces veterans</p>
                  </div>
                </div>
                <div class="value-prop">
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.34998 9.35001H19.65" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8.49994 16.9381C9.53346 17.629 10.7558 18 12.0001 18C13.2443 18 14.4667 17.629 15.5001 16.9381" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 18V22" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15 22H9" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="value-text">
                    <h3>REALITY-BASED SCENARIOS</h3>
                    <p>Develop muscle memory that works under stress</p>
                  </div>
                </div>
                <div class="value-prop">
                  <div class="value-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16H13C13.6667 16 15 15.6 15 14C15 12.4 13.6667 12 13 12H11C10.3333 12 9 11.6 9 10C9 8.4 10.3333 8 11 8H12M12 16H9M12 16V18M12 8H15M12 8V6" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="value-text">
                    <h3>FREE FIRST CLASS</h3>
                    <p>Experience our training with zero risk</p>
                  </div>
                </div>
              </div>

              <!-- Social proof bar -->
              <div class="social-proof">
                <div class="recent-signup">
                  <div class="signup-pulse"></div>
                  <span id="recent-signup-name">James from Anaheim</span> just signed up <span id="recent-signup-time">2 minutes ago</span>
                </div>
                <div class="enrollment-counter">
                  <strong><span id="spots-counter">7</span> spots remaining</strong> this week
                </div>
              </div>

              <!-- Call to action -->
              <button id="step1-cta" class="cta-button">
                CLAIM YOUR FREE TRAINING CLASS
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- Trust indicators -->
              <div class="trust-indicators">
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  No credit card required
                </div>
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Cancel anytime
                </div>
                <div class="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  5,000+ trained clients
                </div>
              </div>
            </div>

            <!-- Visual side with tactical training image -->
            <div class="modal-visual">
              <div class="visual-overlay"></div>
              <div class="countdown-container">
                <div class="countdown-label">This offer expires in:</div>
                <div class="countdown-timer">
                  <div class="countdown-block">
                    <div id="countdown-hours">23</div>
                    <div class="countdown-text">Hours</div>
                  </div>
                  <div class="countdown-block">
                    <div id="countdown-minutes">59</div>
                    <div class="countdown-text">Minutes</div>
                  </div>
                  <div class="countdown-block">
                    <div id="countdown-seconds">59</div>
                    <div class="countdown-text">Seconds</div>
                  </div>
                </div>
              </div>
              <img src="images/tactical-training-action.jpg" alt="Tactical Defense Training in Action" class="visual-image">
            </div>
          </div>

          <!-- Step 2: Streamlined form with microdecisions -->
          <div class="modal-step" data-step="2">
            <div class="modal-content">
              <!-- Back button -->
              <button id="back-to-step1" class="back-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Back
              </button>

              <!-- Form header -->
              <h2 class="modal-title">RESERVE YOUR SPOT NOW</h2>
              <p class="modal-subtitle">Complete the form below to secure your free training class</p>

              <!-- Dynamic spots remaining indicator -->
              <div class="spots-indicator">
                <div class="spots-label">Weekly Spots Remaining:</div>
                <div class="spots-bar">
                  <div class="spots-progress" style="width: 30%;"></div>
                </div>
                <div class="spots-count"><strong><span id="spots-remaining">7</span>/20</strong> spots remaining</div>
              </div>

              <!-- Streamlined form -->
              <form id="free-class-form" class="signup-form">
                <div class="form-group">
                  <label for="name">Full Name</label>
                  <input type="text" id="name" name="name" placeholder="Enter your full name" required>
                </div>

                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" placeholder="(123) 456-7890" required>
                </div>

                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>

                <div class="form-group">
                  <label>Your Experience Level</label>
                  <div class="experience-options">
                    <label class="experience-option">
                      <input type="radio" name="experience" value="beginner" checked>
                      <span class="option-text">Complete Beginner</span>
                    </label>
                    <label class="experience-option">
                      <input type="radio" name="experience" value="some">
                      <span class="option-text">Some Experience</span>
                    </label>
                    <label class="experience-option">
                      <input type="radio" name="experience" value="experienced">
                      <span class="option-text">Experienced</span>
                    </label>
                  </div>
                </div>

                <button type="submit" class="cta-button">
                  SECURE YOUR FREE CLASS NOW
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                <div class="trust-indicators centered">
                  <div class="trust-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Your information is secure and will never be shared
                  </div>
                </div>
              </form>

              <!-- Testimonial as social proof -->
              <div class="testimonial">
                <div class="testimonial-quote">"United Defense Tactical gave me the confidence to protect myself and my family in any situation. Their training translates directly to real-world scenarios."</div>
                <div class="testimonial-author">
                  <img src="images/testimonial-john.jpg" alt="John D." class="testimonial-img">
                  <div class="testimonial-info">
                    <div class="testimonial-name">John D.</div>
                    <div class="testimonial-date">Member since 2023</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual side for form step -->
            <div class="modal-visual">
              <div class="visual-overlay"></div>
              <img src="images/training-handgun.jpg" alt="Defensive Handgun Training" class="visual-image">

              <!-- Feature highlights on the image -->
              <div class="feature-highlights">
                <div class="feature-highlight">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>All equipment provided</span>
                </div>
                <div class="feature-highlight">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Expert instructors</span>
                </div>
                <div class="feature-highlight">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>No obligation</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Success step (shown after form submission) -->
          <div class="modal-step" data-step="success">
            <div class="success-content">
              <div class="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#D10000" stroke="#D10000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 12L11 15L16 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2>YOU'RE ALL SET!</h2>
              <p>We've received your request for a free training class. One of our instructors will contact you within 24 hours to schedule your session.</p>
              <p class="success-next">Here's what happens next:</p>
              <ol class="success-steps">
                <li>You'll receive a confirmation email within 5 minutes</li>
                <li>An instructor will call you to find the perfect time for your first class</li>
                <li>You'll get a reminder text the day before your scheduled class</li>
              </ol>
              <p class="success-contact">If you have any questions, please call us at <strong>(657) 276-0457</strong></p>
              <button id="success-close" class="cta-button">
                CLOSE WINDOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create the modal styles
  const modalStyles = `
    /* Base modal styles */
    .udt-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      z-index: 9999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .udt-modal.active {
      display: block;
      animation: modalFadeIn 0.4s forwards;
    }

    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    /* Modal container */
    .modal-container {
      display: flex;
      width: 100%;
      max-width: 1000px;
      max-height: 90vh;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* Modal close button */
    .modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100;
      transition: background-color 0.2s, transform 0.2s;
    }

    .modal-close:hover {
      background-color: rgba(209, 0, 0, 0.8);
      transform: rotate(90deg);
    }

    /* Progress indicator for mobile */
    .modal-progress {
      position: absolute;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      flex-direction: row;
      gap: 8px;
      z-index: 10;
    }

    .progress-step {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transition: background-color 0.3s;
    }

    .progress-step.active {
      background-color: #fff;
    }

    /* Modal steps */
    .modal-step {
      display: none;
      width: 100%;
      animation: stepFadeIn 0.4s forwards;
    }

    .modal-step.active {
      display: flex;
    }

    /* Step content area */
    .modal-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      position: relative;
    }

    /* Visual area */
    .modal-visual {
      width: 40%;
      position: relative;
      overflow: hidden;
    }

    .visual-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .visual-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8));
      z-index: 1;
    }

    /* Typography */
    .modal-title {
      font-family: 'Bebas Neue', 'Inter', sans-serif;
      font-size: 36px;
      line-height: 1.1;
      margin-bottom: 16px;
      color: #1A1A1A;
      letter-spacing: 1px;
    }

    .modal-subtitle {
      font-size: 18px;
      line-height: 1.5;
      margin-bottom: 24px;
      color: #4A4A4A;
    }

    .highlight {
      color: #D10000;
    }

    /* Value propositions */
    .value-props {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .value-prop {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .value-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(209, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .value-text h3 {
      font-family: 'Bebas Neue', 'Inter', sans-serif;
      font-size: 18px;
      margin: 0 0 4px 0;
      color: #1A1A1A;
    }

    .value-text p {
      margin: 0;
      font-size: 16px;
      color: #4A4A4A;
    }

    /* Social proof */
    .social-proof {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #F5F5F5;
      border-radius: 6px;
      margin-bottom: 24px;
    }

    .recent-signup {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #4A4A4A;
    }

    .signup-pulse {
      width: 10px;
      height: 10px;
      background-color: #28a745;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .enrollment-counter {
      font-size: 14px;
      color: #4A4A4A;
    }

    .enrollment-counter strong {
      color: #D10000;
      font-weight: 600;
    }

    /* CTA Button */
    .cta-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px 24px;
      background-color: #D10000;
      color: white;
      border: none;
      border-radius: 6px;
      font-family: 'Bebas Neue', 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      letter-spacing: 1px;
      box-shadow: 0 4px 6px rgba(209, 0, 0, 0.2);
      margin-bottom: 16px;
    }

    .cta-button:hover {
      background-color: #B30000;
      transform: translateY(-2px);
    }

    .cta-button:active {
      transform: translateY(1px);
      box-shadow: 0 2px 3px rgba(209, 0, 0, 0.2);
    }

    /* Trust indicators */
    .trust-indicators {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .trust-indicators.centered {
      justify-content: center;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
    }

    /* Countdown timer */
    .countdown-container {
      position: absolute;
      bottom: 40px;
      left: 0;
      right: 0;
      z-index: 2;
      text-align: center;
      padding: 0 20px;
    }

    .countdown-label {
      color: white;
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .countdown-timer {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .countdown-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      padding: 8px 12px;
      min-width: 60px;
    }

    .countdown-block div:first-child {
      font-size: 24px;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .countdown-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 4px;
    }

    /* Back button */
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: #4A4A4A;
      font-size: 14px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 16px;
    }

    .back-button:hover {
      color: #D10000;
    }

    /* Spots indicator */
    .spots-indicator {
      background-color: #F5F5F5;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
    }

    .spots-label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1A1A1A;
    }

    .spots-bar {
      height: 8px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .spots-progress {
      height: 100%;
      background-color: #D10000;
      border-radius: 4px;
    }

    .spots-count {
      font-size: 14px;
      color: #4A4A4A;
      text-align: right;
    }

    /* Form styles */
    .signup-form {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #1A1A1A;
    }

    .signup-form input[type="text"],
    .signup-form input[type="email"],
    .signup-form input[type="tel"] {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 15px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .signup-form input:focus {
      border-color: #D10000;
      box-shadow: 0 0 0 3px rgba(209, 0, 0, 0.1);
      outline: none;
    }

    /* Experience options */
    .experience-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .experience-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .experience-option input {
      margin-bottom: 8px;
    }

    .experience-option:hover {
      border-color: #D10000;
      background-color: rgba(209, 0, 0, 0.05);
    }

    .experience-option input:checked + .option-text {
      font-weight: 600;
      color: #D10000;
    }

    /* Testimonial */
    .testimonial {
      background-color: #F5F5F5;
      padding: 16px;
      border-radius: 6px;
      margin-top: 24px;
    }

    .testimonial-quote {
      font-size: 15px;
      font-style: italic;
      margin-bottom: 12px;
      color: #1A1A1A;
      position: relative;
      padding-left: 24px;
    }

    .testimonial-quote::before {
      content: '"';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 36px;
      line-height: 1;
      color: #D10000;
      font-family: serif;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .testimonial-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .testimonial-name {
      font-weight: 600;
      font-size: 14px;
      color: #1A1A1A;
    }

    .testimonial-date {
      font-size: 12px;
      color: #666;
    }

    /* Feature highlights */
    .feature-highlights {
      position: absolute;
      bottom: 30px;
      left: 20px;
      right: 20px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .feature-highlight {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
    }

    /* Success step */
    .success-content {
      width: 100%;
      padding: 40px;
      text-align: center;
    }

    .success-icon {
      margin: 0 auto 24px;
      width: 64px;
      height: 64px;
    }

    .success-content h2 {
      font-family: 'Bebas Neue', 'Inter', sans-serif;
      font-size: 36px;
      margin-bottom: 16px;
      color: #1A1A1A;
    }

    .success-content p {
      font-size: 18px;
      margin-bottom: 16px;
      color: #4A4A4A;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .success-next {
      font-weight: 600;
      margin-top: 24px;
      text-align: left;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .success-steps {
      text-align: left;
      max-width: 500px;
      margin: 16px auto 24px;
      padding-left: 20px;
    }

    .success-steps li {
      margin-bottom: 8px;
      padding-left: 8px;
    }

    .success-contact {
      font-size: 16px;
      margin-bottom: 24px;
    }

    /* Animations */
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes stepFadeIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .modal-container {
        flex-direction: column;
        max-height: 95vh;
      }

      .modal-progress {
        display: flex;
      }

      .modal-step {
        flex-direction: column;
      }

      .modal-content {
        padding: 24px;
        order: 1;
      }

      .modal-visual {
        width: 100%;
        height: 180px;
        order: 0;
      }

      .modal-title {
        font-size: 28px;
        text-align: center;
      }

      .modal-subtitle {
        font-size: 16px;
        text-align: center;
      }

      .countdown-container {
        bottom: 20px;
      }

      .countdown-block {
        min-width: 50px;
        padding: 6px 10px;
      }

      .countdown-block div:first-child {
        font-size: 20px;
      }

      .social-proof {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .experience-options {
        grid-template-columns: 1fr;
      }

      .feature-highlights {
        display: none;
      }
    }

    /* Animation for the CTA button */
    .cta-button {
      animation: ctaPulse 2s infinite;
    }

    @keyframes ctaPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    /* Added styles for better mobile experience */
    @media (max-width: 576px) {
      .modal-overlay {
        padding: 0;
      }

      .modal-container {
        border-radius: 0;
        max-height: 100vh;
        height: 100vh;
      }

      .value-props {
        gap: 12px;
      }

      .modal-content {
        padding: 20px;
      }

      .cta-button {
        padding: 14px 20px;
      }
    }
  `;

  // Add styles to document
  const styleElement = document.createElement('style');
  styleElement.textContent = modalStyles;
  document.head.appendChild(styleElement);

  // Add modal to DOM
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // Get modal elements
  const modal = document.getElementById('udt-conversion-modal');
  const closeBtn = document.getElementById('modal-close');
  const step1CTA = document.getElementById('step1-cta');
  const backToStep1 = document.getElementById('back-to-step1');
  const freeClassForm = document.getElementById('free-class-form');
  const successCloseBtn = document.getElementById('success-close');

  // Other buttons that should open the modal
  const freeClassButtons = document.querySelectorAll('.free-class-btn');
  const openModalBtn = document.getElementById('open-free-class-modal');

  // Function to open modal
  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Start countdown if not already running
    if (!countdownInterval) {
      startCountdown();
    }

    // Record this shown event for analytics
    trackModalEvent('shown');
  }

  // Function to close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling

    // Record this close event for analytics
    trackModalEvent('closed');
  }

  // Function to go to a specific step
  function goToStep(stepNumber) {
    const allSteps = document.querySelectorAll('.modal-step');
    allSteps.forEach(step => step.classList.remove('active'));

    if (stepNumber === 'success') {
      document.querySelector('.modal-step[data-step="success"]').classList.add('active');
    } else {
      document.querySelector(`.modal-step[data-step="${stepNumber}"]`).classList.add('active');

      // Update progress indicators
      const progressSteps = document.querySelectorAll('.progress-step');
      progressSteps.forEach(step => step.classList.remove('active'));
      document.querySelector(`.progress-step[data-step="${stepNumber}"]`).classList.add('active');
    }

    // Record step view for analytics
    trackModalEvent(`viewed_step_${stepNumber}`);
  }

  // Event listeners
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (step1CTA) {
    step1CTA.addEventListener('click', () => {
      goToStep(2);
    });
  }

  if (backToStep1) {
    backToStep1.addEventListener('click', () => {
      goToStep(1);
    });
  }

  if (freeClassForm) {
    freeClassForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(freeClassForm);
      const formDataObj = Object.fromEntries(formData.entries());

      // Here you'd normally send the data to your server
      console.log('Form submitted:', formDataObj);

      // Show success step
      goToStep('success');

      // Track conversion for analytics
      trackModalEvent('converted', formDataObj);
    });
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', closeModal);
  }

  // Add event listeners to free class buttons
  freeClassButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Add event listener to dedicated free class button in section
  if (openModalBtn) {
    openModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Close on click outside of modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Exit intent detection
  let exitIntentShown = false;

  document.addEventListener('mouseleave', (e) => {
    // Only trigger if the cursor leaves the top of the document
    if (e.clientY <= 0 && !exitIntentShown && !modal.classList.contains('active')) {
      exitIntentShown = true;
      setTimeout(() => {
        openModal();
        trackModalEvent('exit_intent_triggered');
      }, 300);
    }
  });

  // Time-based trigger (show after 30 seconds if user hasn't interacted with modal)
  let timeBasedTriggerShown = false;

  setTimeout(() => {
    if (!exitIntentShown && !timeBasedTriggerShown && !modal.classList.contains('active')) {
      timeBasedTriggerShown = true;
      openModal();
      trackModalEvent('time_delay_triggered');
    }
  }, 30000); // 30 seconds

  // Scroll-based trigger (show when user scrolls 70% down the page)
  let scrollTriggerShown = false;

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollPosition / totalHeight) * 100;

    if (scrollPercentage > 70 && !scrollTriggerShown && !exitIntentShown && !timeBasedTriggerShown && !modal.classList.contains('active')) {
      scrollTriggerShown = true;
      openModal();
      trackModalEvent('scroll_triggered');
    }
  });

  // Countdown timer
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');
  let countdownInterval;

  function startCountdown() {
    // Set initial time (24 hours from now)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 23);
    endTime.setMinutes(endTime.getMinutes() + 59);
    endTime.setSeconds(endTime.getSeconds() + 59);

    // Update countdown every second
    countdownInterval = setInterval(() => {
      const now = new Date();
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        // Reset countdown when it reaches zero
        clearInterval(countdownInterval);
        startCountdown();
        return;
      }

      // Calculate hours, minutes, and seconds
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      // Update DOM elements
      if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
      if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
      if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
  }

  // Simulate dynamic social proof updates
  function setupDynamicSocialProof() {
    const recentSignupName = document.getElementById('recent-signup-name');
    const recentSignupTime = document.getElementById('recent-signup-time');
    const spotsCounter = document.getElementById('spots-counter');
    const spotsRemaining = document.getElementById('spots-remaining');

    // Names for dynamic display
    const names = [
      'James from Anaheim',
      'Sarah from Irvine',
      'Michael from Orange',
      'David from Tustin',
      'Lisa from Costa Mesa',
      'Robert from Fullerton',
      'Jessica from Newport Beach',
      'John from Huntington Beach'
    ];

    // Times for dynamic display
    const times = [
      '2 minutes ago',
      '5 minutes ago',
      '7 minutes ago',
      '12 minutes ago',
      '15 minutes ago',
      'just now',
      '3 minutes ago',
      '9 minutes ago'
    ];

    // Update recent signup periodically
    setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];

      if (recentSignupName) recentSignupName.textContent = randomName;
      if (recentSignupTime) recentSignupTime.textContent = randomTime;

      // Small chance to decrease spots remaining (creates urgency)
      if (Math.random() < 0.3) {
        const currentSpots = parseInt(spotsCounter.textContent);
        if (currentSpots > 1) {
          const newSpots = currentSpots - 1;
          if (spotsCounter) spotsCounter.textContent = newSpots;
          if (spotsRemaining) spotsRemaining.textContent = newSpots;

          // Update progress bar
          const spotsProgress = document.querySelector('.spots-progress');
          if (spotsProgress) {
            const progressWidth = ((20 - newSpots) / 20) * 100;
            spotsProgress.style.width = `${progressWidth}%`;
          }
        }
      }
    }, 15000); // Update every 15 seconds
  }

  // Track modal events (would connect to your analytics system)
  function trackModalEvent(eventName, data = {}) {
    // This would normally send data to your analytics platform
    console.log(`Modal event: ${eventName}`, data);

    // If you're using Google Analytics, you might do:
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'modal_interaction',
        'modal_action': eventName,
        'modal_data': data
      });
    }
  }

  // Initialize components
  setupDynamicSocialProof();

  // Return API for programmatic control
  return {
    open: openModal,
    close: closeModal,
    goToStep
  };
}

// Initialize the optimized modal when the page loads
let modalController;
document.addEventListener('DOMContentLoaded', function() {
  modalController = initOptimizedModal();
});document.addEventListener('DOMContentLoaded', function() {
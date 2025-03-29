/**
 * United Defense Tactical - Lead Generation Dashboard
 * 
 * This code implements a dashboard for tracking lead generation metrics
 * using Google Analytics 4, Google Tag Manager, and custom event tracking.
 */

// GTM Implementation Script - Add to <head> section of index.html
function installGTM() {
  const gtmCode = `
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
  <!-- End Google Tag Manager -->
  `;

  // Code to insert in <body>
  const gtmNoScript = `
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  `;

  console.log("Add the GTM code to your site's <head> and the noscript version after <body>");
}

// Lead Tracking Module
class LeadTrackingModule {
  constructor() {
    this.setupEventListeners();
    this.setupDataLayer();
  }

  setupDataLayer() {
    // Initialize data layer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Push initial page data
    window.dataLayer.push({
      'pageTitle': document.title,
      'pagePath': window.location.pathname,
      'websiteSection': this.getCurrentSection()
    });
  }

  getCurrentSection() {
    // Determine current section based on URL or page content
    const path = window.location.pathname;
    if (path.includes('programs')) return 'programs';
    if (path.includes('instructors')) return 'instructors';
    if (path.includes('pricing')) return 'pricing';
    if (path.includes('contact')) return 'contact';
    return 'home';
  }

  setupEventListeners() {
    // Track form submissions
    const freeClassForm = document.getElementById('free-class-form');
    if (freeClassForm) {
      freeClassForm.addEventListener('submit', (e) => {
        this.trackFormSubmission(e, 'free_class');
      });
    }

    // Track chat interactions
    this.setupChatTracking();

    // Track CTA button clicks
    this.trackCTAClicks();

    // Track outbound links
    this.trackOutboundLinks();

    // Track video engagements
    this.trackVideoEngagement();
  }

  trackFormSubmission(event, formType) {
    // Capture form data
    const formData = new FormData(event.target);
    const formFieldsUsed = Array.from(formData.keys()).length;

    // Get lead source from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'direct';
    const utmMedium = urlParams.get('utm_medium') || 'none';
    const utmCampaign = urlParams.get('utm_campaign') || 'none';

    // Push form submission event to dataLayer
    window.dataLayer.push({
      'event': 'form_submission',
      'formType': formType,
      'formFieldsUsed': formFieldsUsed,
      'leadSource': utmSource,
      'leadMedium': utmMedium,
      'leadCampaign': utmCampaign,
      'conversionValue': this.estimateLeadValue(formType)
    });

    // Store lead data in localStorage for cross-session tracking
    this.storeLeadData(formType, utmSource, utmMedium, utmCampaign);
  }

  estimateLeadValue(formType) {
    // Assign estimated value based on form type
    switch(formType) {
      case 'free_class':
        return 75;  // Average value of a free class lead
      case 'contact':
        return 50;  // Average value of a contact form submission
      case 'subscription':
        return 100; // Average value of a subscription lead
      default:
        return 25;  // Default value for other interactions
    }
  }

  storeLeadData(formType, source, medium, campaign) {
    // Create lead data object
    const leadData = {
      timestamp: new Date().toISOString(),
      formType: formType,
      source: source,
      medium: medium,
      campaign: campaign,
      pageUrl: window.location.href
    };

    // Get existing leads or initialize empty array
    const existingLeads = JSON.parse(localStorage.getItem('udtLeads') || '[]');

    // Add new lead and store back in localStorage
    existingLeads.push(leadData);
    localStorage.setItem('udtLeads', JSON.stringify(existingLeads));

    // Set lead cookie for cross-domain tracking if needed
    document.cookie = `udtLeadSource=${source}; path=/; max-age=2592000`; // 30 days
  }

  setupChatTracking() {
    // Track chat open events
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) {
      chatToggle.addEventListener('click', () => {
        window.dataLayer.push({
          'event': 'chat_open',
          'chatInteraction': 'open'
        });
      });
    }

    // Track chat message sent events
    const chatSend = document.getElementById('chat-send');
    if (chatSend) {
      chatSend.addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input');
        if (chatInput && chatInput.value.trim()) {
          window.dataLayer.push({
            'event': 'chat_message',
            'chatInteraction': 'message_sent',
            'chatMessageLength': chatInput.value.trim().length
          });
        }
      });
    }
  }

  trackCTAClicks() {
    // Track clicks on all primary and secondary buttons
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const buttonText = e.target.textContent.trim();
        const buttonType = e.target.classList.contains('btn-primary') ? 'primary' : 'secondary';

        window.dataLayer.push({
          'event': 'cta_click',
          'ctaText': buttonText,
          'ctaType': buttonType,
          'ctaLocation': this.getCurrentSection()
        });
      });
    });
  }

  trackOutboundLinks() {
    // Track clicks on external links
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (link.hostname && link.hostname !== window.location.hostname) {
        link.addEventListener('click', (e) => {
          window.dataLayer.push({
            'event': 'outbound_click',
            'linkUrl': link.href,
            'linkText': link.textContent.trim()
          });
        });
      }
    });
  }

  trackVideoEngagement() {
    // Track video engagement if hero video exists
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
      // Track video start
      heroVideo.addEventListener('play', () => {
        window.dataLayer.push({
          'event': 'video_start',
          'videoName': 'hero-video',
          'videoSection': 'hero'
        });
      });

      // Track video complete
      heroVideo.addEventListener('ended', () => {
        window.dataLayer.push({
          'event': 'video_complete',
          'videoName': 'hero-video',
          'videoSection': 'hero'
        });
      });

      // Track video progress at 25%, 50%, 75%
      heroVideo.addEventListener('timeupdate', () => {
        const progress = (heroVideo.currentTime / heroVideo.duration) * 100;
        if (progress >= 25 && progress < 26 && !heroVideo.tracked25) {
          heroVideo.tracked25 = true;
          window.dataLayer.push({
            'event': 'video_progress',
            'videoName': 'hero-video',
            'videoProgress': 25
          });
        } else if (progress >= 50 && progress < 51 && !heroVideo.tracked50) {
          heroVideo.tracked50 = true;
          window.dataLayer.push({
            'event': 'video_progress',
            'videoName': 'hero-video',
            'videoProgress': 50
          });
        } else if (progress >= 75 && progress < 76 && !heroVideo.tracked75) {
          heroVideo.tracked75 = true;
          window.dataLayer.push({
            'event': 'video_progress',
            'videoName': 'hero-video',
            'videoProgress': 75
          });
        }
      });
    }
  }
}

// Custom Dashboard Implementation
class LeadDashboard {
  constructor(containerId) {
    // No need to create the UI elements as they're now in the HTML
    this.setupEventListeners();
    this.fetchData();
    this.setupRefreshInterval();
    this.charts = {};
  }

  setupEventListeners() {
    // Setup event listeners for dashboard controls
    const dateRange = document.getElementById('date-range');
    const customDateInputs = document.getElementById('custom-date-inputs');
    const refreshButton = document.getElementById('refresh-data');

    if (dateRange) {
      dateRange.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          customDateInputs.style.display = 'flex';
        } else {
          customDateInputs.style.display = 'none';
          this.fetchData();
        }
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.fetchData();
        // Add animation to the refresh button
        refreshButton.classList.add('rotating');
        setTimeout(() => {
          refreshButton.classList.remove('rotating');
        }, 1000);
      });
    }

    // Initialize today's date for date inputs
    const dateStart = document.getElementById('date-start');
    const dateEnd = document.getElementById('date-end');
    if (dateStart && dateEnd) {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      dateStart.valueAsDate = oneWeekAgo;
      dateEnd.valueAsDate = today;

      // Add event listeners to fetch data when dates change
      dateStart.addEventListener('change', () => this.fetchData());
      dateEnd.addEventListener('change', () => this.fetchData());
    }

    // Add event listeners to table action buttons
    document.querySelectorAll('.btn-table-action').forEach(button => {
      button.addEventListener('click', () => {
        alert('Export functionality would go here');
      });
    });

    // Add event listeners to chart action buttons
    document.querySelectorAll('.btn-chart-action').forEach(button => {
      button.addEventListener('click', () => {
        const icon = button.querySelector('i');
        if (icon.classList.contains('fa-download')) {
          alert('Download chart functionality would go here');
        } else if (icon.classList.contains('fa-expand')) {
          alert('Expand chart functionality would go here');
        }
      });
    });
  }

  fetchData() {
    // In a real implementation, this would fetch data from GA4 or your backend
    // For demo purposes, we'll use mock data

    this.updateSummaryMetrics(this.getMockSummaryData());
    this.updateCharts(this.getMockChartData());
    this.updateTables(this.getMockTableData());
  }

  updateSummaryMetrics(data) {
    document.querySelector('#total-leads .metric-value').textContent = data.totalLeads;
    document.querySelector('#conversion-rate .metric-value').textContent = data.conversionRate + '%';
    document.querySelector('#cost-per-lead .metric-value').textContent = '$' + data.costPerLead;
    document.querySelector('#lead-value .metric-value').textContent = '$' + data.leadValue;

    // Update change indicators
    this.updateChangeIndicator('#total-leads .metric-change', data.totalLeadsChange);
    this.updateChangeIndicator('#conversion-rate .metric-change', data.conversionRateChange);
    this.updateChangeIndicator('#cost-per-lead .metric-change', data.costPerLeadChange, true);
    this.updateChangeIndicator('#lead-value .metric-change', data.leadValueChange);
  }

  updateChangeIndicator(selector, value, inverse = false) {
    const element = document.querySelector(selector);
    if (!element) return;

    const prefix = value > 0 ? '+' : '';
    element.textContent = `${prefix}${value}% vs previous`;

    // For metrics like cost-per-lead, a decrease is positive (inverse)
    if ((value > 0 && !inverse) || (value < 0 && inverse)) {
      element.classList.add('positive');
      element.classList.remove('negative');
    } else if ((value < 0 && !inverse) || (value > 0 && inverse)) {
      element.classList.add('negative');
      element.classList.remove('positive');
    } else {
      element.classList.remove('positive', 'negative');
    }
  }

  updateCharts(data) {
    console.log('Campaign data for charts:', data);

    // Clean up any existing charts
    if (this.charts.campaign) {
      this.charts.campaign.destroy();
    }
    if (this.charts.trend) {
      this.charts.trend.destroy();
    }

    // Campaign source chart (doughnut)
    const campaignCtx = document.getElementById('campaign-chart');
    if (campaignCtx) {
      this.charts.campaign = new Chart(campaignCtx, {
        type: 'doughnut',
        data: {
          labels: data.campaigns.map(item => item.source),
          datasets: [{
            data: data.campaigns.map(item => item.leads),
            backgroundColor: [
              '#D10000', // Primary red
              '#333333', // Dark gray
              '#4A90E2', // Blue
              '#F5A623', // Orange
              '#7ED321'  // Green
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                family: "'Inter', sans-serif"
              },
              bodyFont: {
                size: 13,
                family: "'Inter', sans-serif"
              },
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} leads (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Trend chart (line)
    const trendCtx = document.getElementById('trend-chart');
    if (trendCtx) {
      this.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: data.trend.map(item => item.date),
          datasets: [{
            label: 'Leads',
            data: data.trend.map(item => item.leads),
            borderColor: '#D10000',
            backgroundColor: 'rgba(209, 0, 0, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#D10000',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.05)'
              },
              ticks: {
                font: {
                  family: "'Inter', sans-serif"
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(0,0,0,0.05)'
              },
              ticks: {
                font: {
                  family: "'Inter', sans-serif"
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                family: "'Inter', sans-serif"
              },
              bodyFont: {
                size: 13,
                family: "'Inter', sans-serif"
              },
              callbacks: {
                label: function(context) {
                  return `Leads: ${context.raw}`;
                }
              }
            }
          }
        }
      });
    }
  }

  updateTables(data) {
    // Update top pages table
    const pagesTableBody = document.querySelector('#pages-table tbody');
    if (pagesTableBody) {
      pagesTableBody.innerHTML = data.topPages.map(page => `
        <tr>
          <td><strong>${page.path}</strong></td>
          <td>${page.visitors.toLocaleString()}</td>
          <td>${page.leads}</td>
          <td>
            <div class="conversion-badge ${this.getConversionClass(page.conversionRate)}">
              ${page.conversionRate}%
            </div>
          </td>
          <td>
            <button class="btn-action" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn-action" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          </td>
        </tr>
      `).join('');
    }

    // Update recent leads table
    const leadsTableBody = document.querySelector('#leads-table tbody');
    if (leadsTableBody) {
      leadsTableBody.innerHTML = data.recentLeads.map(lead => `
        <tr>
          <td>${lead.datetime}</td>
          <td>
            <span class="source-badge">${lead.source}</span>
          </td>
          <td>${lead.page}</td>
          <td>${lead.type}</td>
          <td>
            <button class="btn-action" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn-action" title="Contact"><i class="fas fa-envelope"></i></button>
          </td>
        </tr>
      `).join('');
    }

    // Add event listeners to action buttons
    document.querySelectorAll('.btn-action').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('title');
        alert(`${action} functionality would go here`);
      });
    });

    // Add CSS for new elements
    this.addTableStyles();
  }

  getConversionClass(rate) {
    if (rate >= 5) return 'high';
    if (rate >= 3) return 'medium';
    return 'low';
  }

  addTableStyles() {
    // Check if styles are already added
    if (document.getElementById('dashboard-dynamic-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-dynamic-styles';
    styleElement.textContent = `
      .conversion-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 1.2rem;
      }
      .conversion-badge.high {
        background-color: rgba(40, 167, 69, 0.1);
        color: #28a745;
      }
      .conversion-badge.medium {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
      .conversion-badge.low {
        background-color: rgba(220, 53, 69, 0.1);
        color: #dc3545;
      }
      .source-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 1.2rem;
        background-color: rgba(0, 0, 0, 0.05);
      }
      .btn-action {
        width: 30px;
        height: 30px;
        border-radius: 4px;
        background-color: transparent;
        border: 1px solid var(--color-border);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-right: 5px;
        transition: all 0.2s;
      }
      .btn-action:hover {
        background-color: var(--color-border);
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotate 1s linear;
      }
    `;
    document.head.appendChild(styleElement);
  }

  setupRefreshInterval() {
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.fetchData();
    }, 5 * 60 * 1000);
  }

  // Mock data methods for demonstration
  getMockSummaryData() {
    return {
      totalLeads: 143,
      totalLeadsChange: 12.4,
      conversionRate: 4.7,
      conversionRateChange: 0.8,
      costPerLead: 42.75,
      costPerLeadChange: -6.3,
      leadValue: 85.50,
      leadValueChange: 5.2
    };
  }

  getMockChartData() {
    return {
      campaigns: [
        { source: 'Google Ads', leads: 62 },
        { source: 'Facebook', leads: 41 },
        { source: 'Organic', leads: 23 },
        { source: 'Direct', leads: 10 },
        { source: 'Referral', leads: 7 }
      ],
      trend: [
        { date: '3/22', leads: 18 },
        { date: '3/23', leads: 15 },
        { date: '3/24', leads: 21 },
        { date: '3/25', leads: 24 },
        { date: '3/26', leads: 19 },
        { date: '3/27', leads: 22 },
        { date: '3/28', leads: 24 }
      ]
    };
  }

  getMockTableData() {
    return {
      topPages: [
        { path: 'Home Page', visitors: 1250, leads: 45, conversionRate: 3.6 },
        { path: '/free-class', visitors: 583, leads: 38, conversionRate: 6.5 },
        { path: '/programs', visitors: 892, leads: 29, conversionRate: 3.3 },
        { path: '/pricing', visitors: 745, leads: 21, conversionRate: 2.8 },
        { path: '/instructors', visitors: 512, leads: 10, conversionRate: 2.0 }
      ],
      recentLeads: [
        { datetime: '3/28/2025 14:23', source: 'Google Ads', page: '/free-class', type: 'Free Class Form' },
        { datetime: '3/28/2025 13:11', source: 'Facebook', page: '/pricing', type: 'Chatbot' },
        { datetime: '3/28/2025 11:47', source: 'Organic', page: '/programs', type: 'Free Class Form' },
        { datetime: '3/28/2025 10:32', source: 'Direct', page: '/home', type: 'Contact Form' },
        { datetime: '3/28/2025 09:15', source: 'Google Ads', page: '/free-class', type: 'Free Class Form' }
      ]
    };
  }
}

// UTM Parameter Helper
function createUTMLinks() {
  const campaignMap = {
    'google': {
      name: 'Google Ads',
      medium: 'cpc',
      campaigns: ['search_brand', 'search_tactical', 'display_training']
    },
    'facebook': {
      name: 'Facebook',
      medium: 'social',
      campaigns: ['feed_prospecting', 'feed_retargeting', 'story_ads']
    },
    'email': {
      name: 'Email',
      medium: 'email',
      campaigns: ['newsletter', 'promotion', 'welcome_series']
    },
    'instagram': {
      name: 'Instagram',
      medium: 'social',
      campaigns: ['feed', 'story', 'reels']
    }
  };

  // Example URL builder
  const siteUrl = 'https://uniteddefensetactical.com';
  const pages = ['/', '/programs', '/pricing', '/free-class'];

  const utmUrls = [];

  for (const [source, sourceData] of Object.entries(campaignMap)) {
    for (const campaign of sourceData.campaigns) {
      for (const page of pages) {
        const utmUrl = `${siteUrl}${page}?utm_source=${source}&utm_medium=${sourceData.medium}&utm_campaign=${campaign}`;
        utmUrls.push({ source: sourceData.name, campaign, page, url: utmUrl });
      }
    }
  }

  console.table(utmUrls);
  return utmUrls;
}

// Implementation guide
function implementationGuide() {
  console.log(`
    United Defense Tactical - Lead Tracking Implementation Guide

    1. Set up Google Analytics 4:
       - Create a GA4 property
       - Add the GA4 tag to your website via Google Tag Manager
       - Configure events for form submissions, chatbot interactions, etc.

    2. Set up UTM parameter tracking:
       - Use the createUTMLinks() function to generate campaign URLs
       - Ensure all marketing campaigns use proper UTM parameters

    3. Implement the Lead Tracking Module:
       - Add the LeadTrackingModule to main.js
       - Initialize it on page load

    4. Create the dashboard:
       - Add a new dashboard.html page to your site
       - Initialize the LeadDashboard class with proper container
       - Connect to your GA4 data source (requires additional API setup)

    5. Set up goal tracking in GA4:
       - Configure conversion events for form submissions
       - Set values for different lead types

    For more detailed implementation, contact your web developer.
  `);
}

// Initialize tracking on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Create a new dashboard instance targeting the container element
    new LeadDashboard('dashboard-container');

    // Optional: Add basic access protection
    function checkAccess() {
        // In production, replace with proper authentication
        const accessKey = localStorage.getItem('udt_dashboard_access');
        if (!accessKey) {
            const password = prompt("Enter dashboard password:");
            if (password === "udt2025") { // Change this!
                localStorage.setItem('udt_dashboard_access', Date.now());
            } else {
                alert("Access denied");
                window.location.href = "index.html";
            }
        }
    }

    // Uncomment to enable password protection
    // checkAccess();
});
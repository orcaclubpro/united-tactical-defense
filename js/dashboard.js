/**
 * United Defense Tactical - Website Analytics Dashboard
 * 
 * This code implements a general website statistics dashboard to track:
 * - Daily, weekly, monthly visitor traffic
 * - Conversion rates (form submissions)
 * - Traffic sources
 * - User engagement metrics
 */

// Dashboard Implementation
class WebsiteAnalyticsDashboard {
  constructor() {
    this.currentPeriod = 'daily';
    this.setupEventListeners();
    this.fetchData();
    this.setupRefreshInterval();
    this.charts = {};
    this.addTableStyles();
  }

  setupEventListeners() {
    // Date range selector
    const dateRange = document.getElementById('date-range');
    const customDateInputs = document.getElementById('custom-date-inputs');
    const refreshButton = document.getElementById('refresh-data');
    const periodButtons = document.querySelectorAll('.btn-period');

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
        refreshButton.classList.add('rotating');
        setTimeout(() => {
          refreshButton.classList.remove('rotating');
        }, 1000);
      });
    }

    // Period toggle buttons (daily, weekly, monthly)
    periodButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        periodButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentPeriod = e.target.dataset.period;
        this.updateTrafficChart();
      });
    });

    // Set daily as default active
    document.getElementById('daily-view').classList.add('active');

    // Initialize date inputs
    const dateStart = document.getElementById('date-start');
    const dateEnd = document.getElementById('date-end');
    if (dateStart && dateEnd) {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      dateStart.valueAsDate = oneWeekAgo;
      dateEnd.valueAsDate = today;

      dateStart.addEventListener('change', () => this.fetchData());
      dateEnd.addEventListener('change', () => this.fetchData());
    }

    // Export buttons
    document.querySelectorAll('.btn-chart-action').forEach(button => {
      if (button.querySelector('i.fas.fa-download')) {
        button.addEventListener('click', () => {
          this.exportChart(button.closest('.chart-container').querySelector('canvas').id);
        });
      }
    });

    document.querySelectorAll('.btn-table-action').forEach(button => {
      button.addEventListener('click', () => {
        const tableId = button.closest('.table-container').querySelector('table').id;
        this.exportTable(tableId);
      });
    });
  }

  fetchData() {
    console.log('Fetching website analytics data...');
    // In a production environment, this would fetch real analytics data
    // For demo purposes, we're using mock data

    // Update all dashboard components with mock data
    this.updateSummaryMetrics(this.getMockSummaryData());
    this.updateTrafficChart();
    this.updateSourceChart(this.getMockSourceData());
    this.updateFunnelChart(this.getMockFunnelData());
    this.updateTables(this.getMockTableData());
  }

  updateSummaryMetrics(data) {
    // Update the summary metrics cards
    document.querySelector('#total-visitors .metric-value').textContent = data.visitors.toLocaleString();
    document.querySelector('#page-views .metric-value').textContent = data.pageViews.toLocaleString();
    document.querySelector('#conversion-rate .metric-value').textContent = data.conversionRate + '%';
    document.querySelector('#avg-time .metric-value').textContent = data.avgSessionTime;

    // Update change indicators
    this.updateChangeIndicator('#total-visitors .metric-change', data.visitorsChange);
    this.updateChangeIndicator('#page-views .metric-change', data.pageViewsChange);
    this.updateChangeIndicator('#conversion-rate .metric-change', data.conversionRateChange);
    this.updateChangeIndicator('#avg-time .metric-change', data.avgTimeChange);
  }

  updateChangeIndicator(selector, value, inverse = false) {
    const element = document.querySelector(selector);
    if (!element) return;

    const prefix = value > 0 ? '+' : '';
    element.textContent = `${prefix}${value}% vs previous`;

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

  updateTrafficChart() {
    // Get data based on the selected period (daily, weekly, monthly)
    const data = this.getTrafficData(this.currentPeriod);

    // Clean up existing chart if it exists
    if (this.charts.traffic) {
      this.charts.traffic.destroy();
    }

    const ctx = document.getElementById('traffic-chart');
    if (!ctx) return;

    this.charts.traffic = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Visitors',
            data: data.visitors,
            borderColor: '#D10000',
            backgroundColor: 'rgba(209, 0, 0, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#D10000',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Page Views',
            data: data.pageViews,
            borderColor: '#333333',
            backgroundColor: 'rgba(51, 51, 51, 0.05)',
            borderDash: [5, 5],
            tension: 0.3,
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#333333',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
              display: false
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
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              padding: 20,
              font: {
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
            }
          }
        }
      }
    });
  }

  updateSourceChart(data) {
    if (this.charts.source) {
      this.charts.source.destroy();
    }

    const ctx = document.getElementById('source-chart');
    if (!ctx) return;

    this.charts.source = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#D10000', // Primary red
            '#4A90E2', // Blue
            '#F5A623', // Orange  
            '#7ED321', // Green
            '#333333', // Dark gray
            '#9B9B9B'  // Light gray
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
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
                return `${label}: ${value} visitors (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  updateFunnelChart(data) {
    if (this.charts.funnel) {
      this.charts.funnel.destroy();
    }

    const ctx = document.getElementById('funnel-chart');
    if (!ctx) return;

    // Create horizontal bar chart to simulate a funnel
    this.charts.funnel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          axis: 'y',
          data: data.values,
          backgroundColor: [
            'rgba(209, 0, 0, 0.9)',
            'rgba(209, 0, 0, 0.7)',
            'rgba(209, 0, 0, 0.5)',
            'rgba(209, 0, 0, 0.3)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif"
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                weight: 'bold'
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
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = data.values[0]; // First value is total visitors
                const percentage = Math.round((value / total) * 100);
                return `${value} users (${percentage}% of visitors)`;
              }
            }
          }
        }
      }
    });
  }

  updateTables(data) {
    // Update top pages table
    const pagesTableBody = document.querySelector('#pages-table tbody');
    if (pagesTableBody) {
      pagesTableBody.innerHTML = data.topPages.map(page => `
        <tr>
          <td><strong>${page.path}</strong></td>
          <td>${page.visitors.toLocaleString()}</td>
          <td>${page.pageViews.toLocaleString()}</td>
          <td>
            <div class="bounce-badge ${this.getBounceRateClass(page.bounceRate)}">
              ${page.bounceRate}%
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Update recent conversions table
    const conversionsTableBody = document.querySelector('#conversions-table tbody');
    if (conversionsTableBody) {
      conversionsTableBody.innerHTML = data.recentConversions.map(conversion => `
        <tr>
          <td>${conversion.datetime}</td>
          <td>
            <span class="source-badge">${conversion.source}</span>
          </td>
          <td>${conversion.page}</td>
          <td>${conversion.formType}</td>
          <td>
            <i class="fas fa-${this.getDeviceIcon(conversion.device)}"></i> ${conversion.device}
          </td>
        </tr>
      `).join('');
    }
  }

  getDeviceIcon(device) {
    switch(device.toLowerCase()) {
      case 'desktop': return 'desktop';
      case 'tablet': return 'tablet-alt';
      case 'mobile': return 'mobile-alt';
      default: return 'question-circle';
    }
  }

  getBounceRateClass(rate) {
    if (rate <= 30) return 'low';
    if (rate <= 60) return 'medium';
    return 'high';
  }

  addTableStyles() {
    // Add dynamic styles for tables and badges
    if (document.getElementById('dashboard-dynamic-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-dynamic-styles';
    styleElement.textContent = `
      .bounce-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 1.2rem;
      }
      .bounce-badge.low {
        background-color: rgba(40, 167, 69, 0.1);
        color: #28a745;
      }
      .bounce-badge.medium {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
      .bounce-badge.high {
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
      .btn-period {
        background-color: transparent;
        border: 1px solid #ddd;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 1.2rem;
        cursor: pointer;
        margin-right: 5px;
      }
      .btn-period.active {
        background-color: #D10000;
        color: white;
        border-color: #D10000;
      }
      .full-width {
        grid-column: 1 / -1;
      }
      .two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 992px) {
        .two-column {
          grid-template-columns: 1fr;
        }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotate 1s linear;
      }
      .chart-container {
        min-height: 300px;
      }
    `;
    document.head.appendChild(styleElement);
  }

  exportChart(chartId) {
    console.log(`Exporting chart: ${chartId}`);
    const chart = this.charts[chartId.replace('-chart', '')];
    if (!chart) return;

    const canvas = document.getElementById(chartId);
    const link = document.createElement('a');
    link.download = `${chartId}-export-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  exportTable(tableId) {
    console.log(`Exporting table: ${tableId}`);
    const table = document.getElementById(tableId);
    if (!table) return;

    // Simple CSV export example
    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cols = row.querySelectorAll('td, th');
      const rowData = [];

      cols.forEach(col => {
        // Remove HTML and use only text content
        let cellContent = col.textContent.trim().replace(/"/g, '""');
        rowData.push(`"${cellContent}"`);
      });

      csv.push(rowData.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${tableId}-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = url;
    link.click();
  }

  setupRefreshInterval() {
    // Auto-refresh every 5 minutes in a real implementation
    setInterval(() => {
      this.fetchData();
    }, 5 * 60 * 1000);
  }

  // MOCK DATA METHODS
  getTrafficData(period) {
    let labels, visitors, pageViews;

    switch(period) {
      case 'weekly':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
        visitors = [1450, 1680, 1590, 2100, 1800, 2400, 2100, 2580];
        pageViews = [4200, 4850, 4680, 6300, 5400, 7100, 6300, 7800];
        break;
      case 'monthly':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        visitors = [5800, 6700, 7800, 8200, 7600, 7100, 8500, 9200, 8700, 9600, 10800, 11400];
        pageViews = [17400, 20100, 23400, 24600, 22800, 21300, 25500, 27600, 26100, 28800, 32400, 34200];
        break;
      default: // daily
        labels = ['Mar 22', 'Mar 23', 'Mar 24', 'Mar 25', 'Mar 26', 'Mar 27', 'Mar 28', 'Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4'];
        visitors = [320, 295, 310, 345, 280, 270, 305, 340, 350, 370, 390, 410, 380, 420];
        pageViews = [960, 885, 930, 1035, 840, 810, 915, 1020, 1050, 1110, 1170, 1230, 1140, 1260];
    }

    return { labels, visitors, pageViews };
  }

  getMockSummaryData() {
    return {
      visitors: 4825,
      visitorsChange: 12.4,
      pageViews: 14475,
      pageViewsChange: 15.8,
      conversionRate: 4.2,
      conversionRateChange: 0.5,
      avgSessionTime: '2m 45s',
      avgTimeChange: 8.3
    };
  }

  getMockSourceData() {
    return {
      labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email', 'Other'],
      values: [1850, 1200, 850, 450, 350, 125]
    };
  }

  getMockFunnelData() {
    return {
      labels: ['Website Visitors', 'Page Scroll >50%', 'Form View', 'Form Submission'],
      values: [4825, 3380, 1205, 203]
    };
  }

  getMockTableData() {
    return {
      topPages: [
        { path: 'Home Page', visitors: 2250, pageViews: 3100, avgTime: '2m 10s', bounceRate: 35 },
        { path: '/free-class', visitors: 1150, pageViews: 1680, avgTime: '3m 45s', bounceRate: 22 },
        { path: '/programs', visitors: 950, pageViews: 2400, avgTime: '4m 20s', bounceRate: 18 },
        { path: '/pricing', visitors: 780, pageViews: 1100, avgTime: '2m 30s', bounceRate: 42 },
        { path: '/instructors', visitors: 620, pageViews: 890, avgTime: '1m 55s', bounceRate: 38 }
      ],
      recentConversions: [
        { datetime: '2023-04-04 14:23', source: 'Organic', page: '/free-class', formType: 'Free Class Form', device: 'Desktop' },
        { datetime: '2023-04-04 13:11', source: 'Facebook', page: '/pricing', formType: 'Contact Form', device: 'Mobile' },
        { datetime: '2023-04-04 11:47', source: 'Google Ads', page: '/programs', formType: 'Free Class Form', device: 'Desktop' },
        { datetime: '2023-04-04 10:32', source: 'Direct', page: '/home', formType: 'Newsletter', device: 'Tablet' },
        { datetime: '2023-04-04 09:15', source: 'Instagram', page: '/free-class', formType: 'Free Class Form', device: 'Mobile' }
      ]
    };
  }
}

// Initialize dashboard on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Create a new dashboard instance
  new WebsiteAnalyticsDashboard();
});
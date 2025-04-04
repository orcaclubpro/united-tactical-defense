// Form Monitor Loader
// This script loads the form submission monitor with a simple toggle UI

(function() {
  // Create UI elements
  function createMonitorUI() {
    // Create container
    const container = document.createElement('div');
    container.id = 'form-monitor-control';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      min-width: 200px;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      border-bottom: 1px solid #555;
      padding-bottom: 5px;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Form Monitor';
    title.style.fontWeight = 'bold';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => {
      container.remove();
      if (window._formMonitor) {
        window._formMonitor.stop();
        window._formMonitor = null;
      }
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);
    
    // Create toggle switch
    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;
    
    const toggleLabel = document.createElement('label');
    toggleLabel.textContent = 'Monitoring:';
    
    const toggleSwitch = document.createElement('label');
    toggleSwitch.className = 'switch';
    toggleSwitch.style.cssText = `
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    `;
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.style.cssText = `
      opacity: 0;
      width: 0;
      height: 0;
    `;
    
    const toggleSlider = document.createElement('span');
    toggleSlider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 20px;
    `;
    toggleSlider.innerHTML = '<span style="position: absolute; content: \'\'; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>';
    
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    
    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleSwitch);
    container.appendChild(toggleContainer);
    
    // Create live mode toggle
    const liveModeContainer = document.createElement('div');
    liveModeContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;
    
    const liveModeLabel = document.createElement('label');
    liveModeLabel.textContent = 'Live Mode:';
    
    const liveModeSwitch = document.createElement('label');
    liveModeSwitch.className = 'switch';
    liveModeSwitch.style.cssText = `
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    `;
    
    const liveModeInput = document.createElement('input');
    liveModeInput.type = 'checkbox';
    liveModeInput.style.cssText = `
      opacity: 0;
      width: 0;
      height: 0;
    `;
    
    const liveModeSlider = document.createElement('span');
    liveModeSlider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 20px;
    `;
    liveModeSlider.innerHTML = '<span style="position: absolute; content: \'\'; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>';
    
    liveModeSwitch.appendChild(liveModeInput);
    liveModeSwitch.appendChild(liveModeSlider);
    
    liveModeContainer.appendChild(liveModeLabel);
    liveModeContainer.appendChild(liveModeSwitch);
    container.appendChild(liveModeContainer);
    
    // Create status display
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'monitor-status';
    statusDisplay.style.cssText = `
      padding: 5px;
      margin-top: 5px;
      background: #222;
      border-radius: 4px;
      font-size: 12px;
    `;
    statusDisplay.textContent = 'Monitoring inactive';
    container.appendChild(statusDisplay);
    
    // Append to body
    document.body.appendChild(container);
    
    // Toggle functionality
    toggleInput.addEventListener('change', function() {
      if (this.checked) {
        startMonitoring(liveModeInput.checked);
        toggleSlider.style.backgroundColor = '#4CAF50';
        toggleSlider.querySelector('span').style.transform = 'translateX(20px)';
        statusDisplay.textContent = `Monitoring active (${liveModeInput.checked ? 'LIVE MODE' : 'Test Mode'})`;
      } else {
        stopMonitoring();
        toggleSlider.style.backgroundColor = '#ccc';
        toggleSlider.querySelector('span').style.transform = 'translateX(0)';
        statusDisplay.textContent = 'Monitoring inactive';
      }
    });
    
    liveModeInput.addEventListener('change', function() {
      if (window._formMonitor) {
        window._formMonitor.setConfig({ ALLOW_REAL_REQUESTS: this.checked });
        statusDisplay.textContent = `Monitoring active (${this.checked ? 'LIVE MODE' : 'Test Mode'})`;
        
        if (this.checked) {
          liveModeSlider.style.backgroundColor = '#f44336';
          liveModeSlider.querySelector('span').style.transform = 'translateX(20px)';
          
          // Display warning
          statusDisplay.innerHTML += '<br>⚠️ WARNING: Live requests enabled!';
        } else {
          liveModeSlider.style.backgroundColor = '#ccc';
          liveModeSlider.querySelector('span').style.transform = 'translateX(0)';
        }
      }
    });
    
    return {
      toggleInput,
      liveModeInput,
      statusDisplay
    };
  }
  
  // Start monitoring
  function startMonitoring(liveMode) {
    loadMonitorScript()
      .then(() => {
        if (window.monitorFormSubmission) {
          window._formMonitor = window.monitorFormSubmission({
            ALLOW_REAL_REQUESTS: liveMode
          });
          
          console.log('[Form Monitor Loader] Monitoring started');
          updateRequestCount();
        } else {
          console.error('[Form Monitor Loader] Form monitor not loaded properly');
        }
      })
      .catch(error => {
        console.error('[Form Monitor Loader] Error loading monitor script:', error);
      });
  }
  
  // Stop monitoring
  function stopMonitoring() {
    if (window._formMonitor) {
      window._formMonitor.stop();
      window._formMonitor = null;
      console.log('[Form Monitor Loader] Monitoring stopped');
    }
  }
  
  // Load the form-submission-monitor.js script
  function loadMonitorScript() {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (window.monitorFormSubmission) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'form-submission-monitor.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Update request count periodically
  function updateRequestCount() {
    if (window._formMonitor && window._formMonitor.getCapturedRequests) {
      const statusElement = document.getElementById('monitor-status');
      if (statusElement) {
        const count = window._formMonitor.getCapturedRequests().length;
        const liveMode = window._formMonitor.getConfig().ALLOW_REAL_REQUESTS;
        
        statusElement.innerHTML = `Monitoring active (${liveMode ? 'LIVE MODE' : 'Test Mode'})<br>`;
        statusElement.innerHTML += `Captured requests: ${count}`;
        
        if (liveMode) {
          statusElement.innerHTML += '<br>⚠️ WARNING: Live requests enabled!';
        }
      }
      
      setTimeout(updateRequestCount, 2000);
    }
  }
  
  // Initialize
  function initialize() {
    console.log('[Form Monitor Loader] Initializing...');
    
    // Create the UI
    const controls = createMonitorUI();
    
    // Load the monitor script
    loadMonitorScript()
      .then(() => {
        console.log('[Form Monitor Loader] Ready to monitor form submissions');
      })
      .catch(error => {
        console.error('[Form Monitor Loader] Error loading monitor script:', error);
        
        const statusElement = document.getElementById('monitor-status');
        if (statusElement) {
          statusElement.textContent = 'Error loading monitor script. Check console for details.';
          statusElement.style.color = '#f44336';
        }
      });
  }
  
  // Start on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(); 
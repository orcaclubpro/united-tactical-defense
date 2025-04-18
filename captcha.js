// Node.js version of the captcha script for Node.js v18+ 
const { FormData } = await import('form-data');
const { default: nodeFetch } = await import('node-fetch');

// Function to simulate a form submission with reCAPTCHA
async function simulateFormSubmission() {
  console.log('Starting form submission simulation');
  
  // Create the form data
  const formData = new FormData();
  
  // Example form data
  const jsonData = {
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+15551234567",
    "email": "example@email.com", 
    "postal_code": "90210",
    "formId": "TEKBM3ACn5q9MxWAjsL8",
    "location_id": "wCjIiRV3L99XP2J5wYdA",
    "sessionId": "3c01ab77-3a17-415d-990e-ba1dccf22d81",
    "eventData": {
      "source": "leadgen-apps-form-survey-builder.leadconnectorhq.com",
      "referrer": "https://leadgen-apps-form-survey-builder.leadconnectorhq.com/",
      "keyword": "",
      "adSource": "",
      "url_params": {},
      "page": {
        "url": "https://go.udttraining.com/widget/form/TEKBM3ACn5q9MxWAjsL8",
        "title": ""
      },
      "timestamp": Date.now(),
      "campaign": "",
      "contactSessionIds": {
        "ids": [
          "7ebdaaf9-28fd-4648-bebc-6e36c00f8673",
          "be788354-d4c2-4a9b-a4c6-b3cb3f35ec06",
          "3c01ab77-3a17-415d-990e-ba1dccf22d81"
        ]
      },
      "fbp": "",
      "fbc": "",
      "type": "page-visit",
      "parentId": "TEKBM3ACn5q9MxWAjsL8",
      "pageVisitType": "form",
      "domain": "go.udttraining.com",
      "version": "v3",
      "parentName": "Lead Capture",
      "fingerprint": null,
      "documentURL": "https://go.udttraining.com/widget/form/TEKBM3ACn5q9MxWAjsL8",
      "fbEventId": "5ae2b16a-d848-42f1-bec6-3ac61092da2c",
      "medium": "form",
      "mediumId": "TEKBM3ACn5q9MxWAjsL8"
    },
    "Timezone": "America/Los_Angeles (GMT-07:00)",
    "paymentContactId": {},
    "timeSpent": 36.091
  };
  
  // Add form fields
  formData.append('formData', JSON.stringify(jsonData));
  formData.append('locationId', 'wCjIiRV3L99XP2J5wYdA');
  formData.append('formId', 'TEKBM3ACn5q9MxWAjsL8');
  formData.append('captchaV3', '6LehShsrAAAAAIOfZ7haAesfJT4Vz4QJUFDl5wfi');
  
  try {
    console.log('Preparing to send form data...');
    
    // Configure the request
    const response = await nodeFetch('https://backend.leadconnectorhq.com/forms/submit', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://go.udttraining.com/',
        'fullurl': 'https://go.udttraining.com/widget/form/TEKBM3ACn5q9MxWAjsL8',
        'timezone': 'America/Los_Angeles',
        'Origin': 'https://go.udttraining.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Priority': 'u=4',
        'TE': 'trailers'
      },
      body: formData
    });
    
    // Handle the response
    const textResponse = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response text:', textResponse);
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      console.log('JSON response:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.log('Response is not valid JSON');
      return textResponse;
    }
  } catch (error) {
    console.error('Error during form submission:', error);
    return null;
  }
}

// For Node.js environments: immediately run the function
console.log('Starting script...');
simulateFormSubmission()
  .then(result => {
    console.log('Script completed with result:', result ? 'Success' : 'Failure');
  })
  .catch(error => {
    console.error('Script failed with error:', error);
  });

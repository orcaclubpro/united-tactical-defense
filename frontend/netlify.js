// Script to handle Netlify environment variables and deployment setup
const fs = require('fs');
const path = require('path');

// Log the build environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NETLIFY_ENV:', process.env.NETLIFY_ENV);
console.log('CONTEXT:', process.env.CONTEXT);

// Create a netlify.toml file if one doesn't exist
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
if (!fs.existsSync(netlifyTomlPath)) {
  const netlifyToml = `
[build]
  publish = "build"
  command = "npm run build:prod"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  fs.writeFileSync(netlifyTomlPath, netlifyToml);
  console.log('Created netlify.toml file');
}

// Create a _redirects file in the public directory for fallback
const redirectsPath = path.join(__dirname, 'public', '_redirects');
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

const redirects = `
/* /index.html 200
`;
fs.writeFileSync(redirectsPath, redirects);
console.log('Created _redirects file');

console.log('Netlify deployment setup complete!'); 
const net = require('net');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get port configuration
const backendPort = process.env.PORT || 3002;
const frontendPort = 3000;

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is available
    });
    
    server.listen(port);
  });
}

// Check multiple ports
async function checkPorts() {
  console.log('Checking if required ports are available...');
  
  const backendPortInUse = await isPortInUse(backendPort);
  const frontendPortInUse = await isPortInUse(frontendPort);
  
  console.log(`Backend port ${backendPort}: ${backendPortInUse ? 'IN USE' : 'AVAILABLE'}`);
  console.log(`Frontend port ${frontendPort}: ${frontendPortInUse ? 'IN USE' : 'AVAILABLE'}`);
  
  if (backendPortInUse || frontendPortInUse) {
    console.log('\nOne or more required ports are in use. Please follow these steps:');
    
    if (backendPortInUse) {
      console.log(`1. Find the process using port ${backendPort}:`);
      console.log(`   - On macOS/Linux: lsof -i :${backendPort}`);
      console.log(`   - On Windows: netstat -ano | findstr :${backendPort}`);
      console.log('2. Terminate the process or change the port in .env file');
    }
    
    if (frontendPortInUse) {
      console.log(`1. Find the process using port ${frontendPort}:`);
      console.log(`   - On macOS/Linux: lsof -i :${frontendPort}`);
      console.log(`   - On Windows: netstat -ano | findstr :${frontendPort}`);
      console.log('2. Terminate the process');
    }
    
    process.exit(1);
  } else {
    console.log('\nAll required ports are available! You can start the application.');
    console.log('- Backend: npm start');
    console.log('- Frontend: npm run client');
    console.log('- Both: npm run dev');
    process.exit(0);
  }
}

// Run the port check
checkPorts(); 
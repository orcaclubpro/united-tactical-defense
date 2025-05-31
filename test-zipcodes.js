const zipcodes = require('zipcodes');

// Log the package to see what's available
console.log('Available methods:', Object.keys(zipcodes));

// Test some common zip codes
const zipInfo1 = zipcodes.lookup('92618'); // Irvine
const zipInfo2 = zipcodes.lookup('90210'); // Beverly Hills

console.log('92618 info:', zipInfo1);
console.log('90210 info:', zipInfo2);

// Test distance calculation
const distance = zipcodes.distance('92618', '90210');
console.log('Distance between 92618 and 90210:', distance, 'miles');

// Test lookup by city
const lookupByCity = zipcodes.lookupByName('Irvine', 'CA');
console.log('Irvine, CA zipcodes:', lookupByCity);

// Test radius lookup
const radius = zipcodes.radius('92618', 10); // 10 miles around 92618
console.log('Zip codes within 10 miles of 92618:', radius.length, 'total');
console.log('First 5 zip codes in radius:', radius.slice(0, 5));

// Test invalid zip code
const invalidZip = zipcodes.lookup('INVALID');
console.log('Invalid zip lookup:', invalidZip); 
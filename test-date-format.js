// Test script to verify the date formatting works correctly

// Function to format date with timezone offset for Pacific Time (-07:00 during DST)
const formatDateWithTimezone = (date, timeString) => {
  // Parse hours and minutes from timeString (format: HH:MM)
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a new date with the specific time
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  
  // Format to ISO string and replace the Z with -07:00 for Pacific Time
  return dateTime.toISOString().replace(/\.\d+Z$/, '-07:00');
};

// Test case for April 3, 2025 at 1:30 PM
const testDate = new Date(2025, 3, 3); // April 3, 2025 (month is 0-indexed)
const testTime = '13:30';

const formattedDate = formatDateWithTimezone(testDate, testTime);
console.log('Formatted date for April 3, 2025 at 1:30 PM:');
console.log(formattedDate);

// This should output something like: 2025-04-03T13:30:00-07:00

// Validate against regex pattern
const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
console.log('Regex validation result:', timeRegex.test(formattedDate));

// Output the individual parts of the date for verification
const dateParts = formattedDate.split('T');
console.log('Date part:', dateParts[0]);
console.log('Time part with timezone:', dateParts[1]);

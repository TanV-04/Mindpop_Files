/**
 * Formats a percentage value as a string with 0 decimal places and a % symbol
 * @param {number} percentage - The percentage value to format
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  // Handle edge cases and ensure percentage is a number
  if (percentage === undefined || percentage === null || isNaN(percentage)) {
    return "0%";
  }
  // Round to nearest integer and append % symbol
  return Math.round(percentage) + "%";
};

/**
 * Counts the number of character differences between two strings
 * @param {string} actual - The user's typed text
 * @param {string} expected - The target text to compare against
 * @returns {number} - The number of errors
 */
export const countErrors = (actual, expected) => {
  // Handle null/undefined inputs
  if (!actual) actual = "";
  if (!expected) expected = "";
  
  let errors = 0;
  const maxLen = Math.max(actual.length, expected.length);

  for (let i = 0; i < maxLen; i++) {
    // Count as error if characters don't match, including when one string is shorter
    if (actual[i] !== expected[i]) {
      errors++;
    }
  }

  return errors;
};

/**
 * Calculates typing accuracy as a percentage
 * @param {number} errors - Number of typing errors
 * @param {number} total - Total number of characters typed
 * @returns {number} - Accuracy percentage (0-100)
 */
export const calculateAccuracyPercentage = (errors, total) => {
  // Handle edge cases
  if (!total || total <= 0) return 0;
  if (errors < 0) errors = 0;
  if (errors > total) errors = total;
  
  // Calculate correct characters and accuracy percentage
  const corrects = total - errors;
  const accuracy = (corrects / total) * 100;
  
  // Ensure the result is between 0 and 100
  return Math.min(100, Math.max(0, accuracy));
};

/**
 * Calculates words per minute (WPM)
 * @param {number} charCount - Number of characters typed
 * @param {number} timeInSeconds - Time taken in seconds
 * @returns {number} - Words per minute (assuming 5 chars = 1 word)
 */
export const calculateWPM = (charCount, timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds <= 0) return 0;
  
  // Standard formula: (characters / 5) / (time in minutes)
  const words = charCount / 5;
  const timeInMinutes = timeInSeconds / 60;
  
  return Math.round(words / timeInMinutes);
};
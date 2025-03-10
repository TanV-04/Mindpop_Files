export const formatPercentage = (percentage) => {
  return percentage.toFixed(0) + "%";
};

export const countErrors = (actual, expected) => {
  let errors = 0;
  const maxLen = Math.max(actual.length, expected.length);

  for (let i = 0; i < maxLen; i++) {
    if (actual[i] !== expected[i]) {
      errors++;
    }
  }

  return errors;
};

export const calculateAccuracyPercentage = (errors, total) => {
  if (total === 0) return 0; //if nothing is typed, accuracy is 0
  const corrects = total - errors;
  return Math.max(0, (corrects / total) * 100);
};

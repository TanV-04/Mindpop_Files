const showRandomAffirmation = () => {
  const random = affirmations[Math.floor(Math.random() * affirmations.length)];
  setShowAffirmation(random);
  setTimeout(() => {
    setShowAffirmation(""); // hide after 2 seconds
  }, 2000);
};

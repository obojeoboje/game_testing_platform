export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const calculateProgress = (current, total) => (current / total) * 100;

export const getDifficultyTag = (difficulty) => {
  if (!difficulty) return null;

  switch(difficulty.toLowerCase()) {
    case 'junior':
      return { text: 'Junior', className: 'tag junior' };
    case 'middle':
      return { text: 'Middle', className: 'tag middle' };
    case 'senior':
      return { text: 'Senior', className: 'tag senior' };
    default:
      return null;
  }
};

export const calculateAccuracy = (correctAnswers, totalAnswers) => {
  if (totalAnswers === 0) return 0;
  return (correctAnswers / totalAnswers) * 100;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
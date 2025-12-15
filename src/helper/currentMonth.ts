// utils/dateUtils.js

export const currentMonth = () => {
  const now = new Date();
  // Set day to 1, time to 00:00:00.000
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
};

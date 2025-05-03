// Calculate the number of days between two dates
export const daysBetweenDates= (date1, date2) => {
  // Convert both dates to milliseconds since epoch
  const date1Ms = new Date(date1).setHours(0, 0, 0, 0);
  const date2Ms = new Date(date2).setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds
  const differenceMs = Math.abs(date1Ms - date2Ms);
  
  // Convert difference from milliseconds to days
  return Math.floor(differenceMs / (1000 * 60 * 60 * 24));
}
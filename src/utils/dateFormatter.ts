// Function to format time in hours, minutes, and seconds
export function formatTime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor(seconds / 60) % 60;
  const remainingSeconds = seconds % 60;

  let formattedTime = "";
  if (days > 0) {
    formattedTime += `${days} day${days > 1 ? "s" : ""} `;
  }
  if (hours > 0 || days > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    formattedTime += `${minutes}m `;
  }
  formattedTime += `${remainingSeconds}s`;

  return formattedTime;
}

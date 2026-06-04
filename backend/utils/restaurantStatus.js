/**
 * Checks if a restaurant is currently closed based on its operating hours.
 * Supports standard shifts and overnight shifts (e.g., 20:00 to 02:00).
 * 
 * @param {Object} restaurant - The restaurant object containing openTime and closeTime.
 * @returns {Boolean} - True if closed, false if open.
 */
const isRestaurantClosed = (restaurant) => {
  if (!restaurant || !restaurant.openTime || !restaurant.closeTime) return false;
  try {
    let currentHour;
    let currentMinute;
    try {
      // Get current time in Asia/Kolkata timezone (matching user's local timezone)
      const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: false };
      const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
      currentHour = parseInt(parts.find(p => p.type === 'hour').value, 10);
      currentMinute = parseInt(parts.find(p => p.type === 'minute').value, 10);
    } catch (e) {
      // Fallback to system local time
      const now = new Date();
      currentHour = now.getHours();
      currentMinute = now.getMinutes();
    }

    const currentTime = currentHour * 60 + currentMinute;
    const [openH, openM] = restaurant.openTime.split(':').map(Number);
    const [closeH, closeM] = restaurant.closeTime.split(':').map(Number);
    const openTime = openH * 60 + openM;
    let closeTime = closeH * 60 + closeM;

    if (closeTime < openTime) {
      // Overnight shift
      if (currentTime < openTime && currentTime > closeTime) {
        return true;
      }
    } else {
      // Standard shift
      if (currentTime < openTime || currentTime > closeTime) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Error parsing operating hours:", e);
    return false;
  }
};

module.exports = { isRestaurantClosed };

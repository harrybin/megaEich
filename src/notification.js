/**
 * Notification System
 * Handles in-game notifications/messages
 */

class NotificationManager {
  constructor() {
    this.notification = null;
  }

  show(text, duration) {
    this.notification = { text, timer: duration };
  }

  update() {
    if (this.notification) {
      this.notification.timer--;
      if (this.notification.timer <= 0) {
        this.notification = null;
      }
    }
  }

  getNotification() {
    return this.notification;
  }

  clear() {
    this.notification = null;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = NotificationManager;
}

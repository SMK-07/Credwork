const eventBus = require('./eventBus');

class NotificationService {
  constructor() {
    eventBus.on('outcome.confirmed', this.logNotification.bind(this));
    eventBus.on('dispute.resolved', this.logNotification.bind(this));
  }

  logNotification(data) {
    console.log('[NOTIFICATION LOG]: Event triggered ->', JSON.stringify(data));
  }
}

module.exports = new NotificationService();

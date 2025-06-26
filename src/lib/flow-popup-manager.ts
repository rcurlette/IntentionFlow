import { FlowEntry } from "@/types";
import { createFlowEntry, saveFlowEntry } from "./flow-tracking";

export class FlowPopupManager {
  private popupWindow: Window | null = null;
  private onEntrySubmitted?: (entry: FlowEntry) => void;

  constructor(onEntrySubmitted?: (entry: FlowEntry) => void) {
    this.onEntrySubmitted = onEntrySubmitted;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data;

      switch (type) {
        case "FLOW_ENTRY_SUBMITTED":
          this.handleEntrySubmitted(data);
          break;
        case "FLOW_POPUP_CLOSED":
          this.handlePopupClosed();
          break;
        case "FLOW_POPUP_MINIMIZED":
          this.handlePopupMinimized();
          break;
      }
    });
  }

  private handleEntrySubmitted(entryData: Omit<FlowEntry, "id" | "createdAt">) {
    const entry = createFlowEntry(entryData);
    saveFlowEntry(entry);

    if (this.onEntrySubmitted) {
      this.onEntrySubmitted(entry);
    }

    // Close the popup after successful submission
    this.closePopup();
  }

  private handlePopupClosed() {
    this.popupWindow = null;
  }

  private handlePopupMinimized() {
    if (this.popupWindow) {
      this.popupWindow.blur();
      window.focus();
    }
  }

  public openPopup() {
    // Close existing popup if open
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.focus();
      return;
    }

    // Calculate popup position (centered on screen)
    const width = 480;
    const height = 700;
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);

    // Create popup window
    this.popupWindow = window.open(
      `${window.location.origin}/flow-tracker-popup`,
      "FlowTracker",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`,
    );

    if (this.popupWindow) {
      this.popupWindow.focus();

      // Set window title
      this.popupWindow.addEventListener("load", () => {
        if (this.popupWindow) {
          this.popupWindow.document.title = "FlowTracker - Flow Check";
        }
      });
    }
  }

  public closePopup() {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
    }
    this.popupWindow = null;
  }

  public isPopupOpen(): boolean {
    return this.popupWindow !== null && !this.popupWindow.closed;
  }

  public destroy() {
    this.closePopup();
    window.removeEventListener("message", this.setupMessageListener);
  }
}

// Notification manager for browser notifications
export class FlowNotificationManager {
  private permission: NotificationPermission = "default";

  constructor() {
    this.checkPermission();
  }

  private async checkPermission() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === "granted";
  }

  public async showFlowCheckNotification(): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    const notification = new Notification(
      "FlowTracker - Time for a Flow Check! 🌊",
      {
        body: "How's your current activity going? Click to rate your flow state.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "flow-check",
        requireInteraction: true,
        actions: [
          {
            action: "open",
            title: "Rate Flow State",
          },
          {
            action: "snooze",
            title: "Remind me in 10 min",
          },
        ],
      },
    );

    return new Promise((resolve) => {
      notification.onclick = () => {
        window.focus();
        notification.close();
        resolve(true);
      };

      notification.onclose = () => {
        resolve(false);
      };

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
        resolve(false);
      }, 10000);
    });
  }

  public hasPermission(): boolean {
    return this.permission === "granted";
  }

  public canShowNotifications(): boolean {
    return "Notification" in window;
  }
}

// Enhanced Flow Tracking Session with popup and notifications
export class PopupFlowTrackingSession {
  private intervalId: number | null = null;
  private settings: any;
  private popupManager: FlowPopupManager;
  private notificationManager: FlowNotificationManager;
  private onPrompt: () => void;

  constructor(
    onPrompt: () => void,
    onEntrySubmitted?: (entry: FlowEntry) => void,
  ) {
    this.onPrompt = onPrompt;
    this.popupManager = new FlowPopupManager(onEntrySubmitted);
    this.notificationManager = new FlowNotificationManager();
  }

  async start(settings: any): Promise<void> {
    this.settings = settings;

    if (!settings.isEnabled || this.intervalId !== null) return;

    // Request notification permission
    await this.notificationManager.requestPermission();

    this.scheduleNextPrompt();
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.popupManager.closePopup();
  }

  updateSettings(settings: any): void {
    this.settings = settings;

    if (settings.isEnabled) {
      this.restart();
    } else {
      this.stop();
    }
  }

  private restart(): void {
    this.stop();
    this.start(this.settings);
  }

  private scheduleNextPrompt(): void {
    if (!this.settings) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if tracking is enabled for today
    if (!this.settings.trackingDays.includes(currentDay)) {
      this.scheduleForNextTrackingDay();
      return;
    }

    // Check quiet hours
    const quietStart = this.parseTime(this.settings.quietHours.start);
    const quietEnd = this.parseTime(this.settings.quietHours.end);
    const currentTime = currentHour * 60 + currentMinute;

    let isQuietTime = false;
    if (quietStart < quietEnd) {
      isQuietTime = currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      isQuietTime = currentTime >= quietStart && currentTime <= quietEnd;
    }

    if (isQuietTime) {
      const quietEndMinutes = this.parseTime(this.settings.quietHours.end);
      const minutesUntilEnd =
        quietEndMinutes > currentTime
          ? quietEndMinutes - currentTime
          : 24 * 60 - currentTime + quietEndMinutes;

      this.intervalId = window.setTimeout(
        () => {
          this.scheduleNextPrompt();
        },
        minutesUntilEnd * 60 * 1000,
      );
      return;
    }

    // Schedule next prompt based on interval
    const intervalMs = this.settings.interval * 60 * 1000;
    this.intervalId = window.setTimeout(async () => {
      await this.triggerFlowCheck();
      this.scheduleNextPrompt();
    }, intervalMs);
  }

  private async triggerFlowCheck(): Promise<void> {
    // First try to show notification
    const notificationClicked =
      await this.notificationManager.showFlowCheckNotification();

    if (notificationClicked || !this.notificationManager.hasPermission()) {
      // Open popup window
      this.popupManager.openPopup();
    }

    // Also trigger the original prompt callback for backward compatibility
    this.onPrompt();
  }

  private scheduleForNextTrackingDay(): void {
    const now = new Date();
    const currentDay = now.getDay();

    // Find next tracking day
    let nextTrackingDay = -1;
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (this.settings.trackingDays.includes(checkDay)) {
        nextTrackingDay = checkDay;
        break;
      }
    }

    if (nextTrackingDay === -1) return;

    const daysUntil =
      nextTrackingDay > currentDay
        ? nextTrackingDay - currentDay
        : 7 - currentDay + nextTrackingDay;

    const quietEndMinutes = this.parseTime(this.settings.quietHours.end);
    const msUntilNextDay = daysUntil * 24 * 60 * 60 * 1000;
    const msUntilQuietEnd = quietEndMinutes * 60 * 1000;

    this.intervalId = window.setTimeout(() => {
      this.scheduleNextPrompt();
    }, msUntilNextDay + msUntilQuietEnd);
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  public triggerManualCheck(): void {
    this.popupManager.openPopup();
  }

  public destroy(): void {
    this.stop();
    this.popupManager.destroy();
  }
}

import { useState, useEffect, useCallback } from "react";
import { FlowEntry, FlowTrackingSettings } from "@/types";
import {
  getFlowSettings,
  saveFlowSettings,
  DEFAULT_FLOW_SETTINGS,
} from "@/lib/flow-tracking";
import {
  PopupFlowTrackingSession,
  FlowNotificationManager,
} from "@/lib/flow-popup-manager";

export function useFlowTracking() {
  const [settings, setSettings] = useState<FlowTrackingSettings>(
    DEFAULT_FLOW_SETTINGS,
  );
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [session, setSession] = useState<PopupFlowTrackingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationManager] = useState(() => new FlowNotificationManager());

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getFlowSettings();
    setSettings(savedSettings);
  }, []);

  // Initialize tracking session
  useEffect(() => {
    if (settings.isEnabled && !session) {
      const newSession = new PopupFlowTrackingSession(
        () => {
          showPrompt();
        },
        (entry) => {
          console.log("Flow entry submitted:", entry);
          // Could trigger a refresh of insights here
        },
      );
      newSession.start(settings);
      setSession(newSession);
    } else if (!settings.isEnabled && session) {
      session.stop();
      setSession(null);
    }

    return () => {
      if (session) {
        session.destroy();
      }
    };
  }, [settings.isEnabled]);

  // Update session when settings change
  useEffect(() => {
    if (session) {
      session.updateSettings(settings);
    }
  }, [session, settings]);

  const showPrompt = useCallback(() => {
    setIsPromptOpen(true);
  }, []);

  const hidePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  const updateSettings = useCallback((newSettings: FlowTrackingSettings) => {
    setSettings(newSettings);
    saveFlowSettings(newSettings);
  }, []);

  const submitFlowEntry = useCallback(
    async (entryData: Omit<FlowEntry, "id" | "createdAt">) => {
      setIsSubmitting(true);
      try {
        const entry = createFlowEntry(entryData);
        saveFlowEntry(entry);
        setIsPromptOpen(false);

        // Optional: Show a brief success notification
        console.log("Flow entry saved:", entry);
      } catch (error) {
        console.error("Error saving flow entry:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const enableTracking = useCallback(() => {
    updateSettings({ ...settings, isEnabled: true });
  }, [settings, updateSettings]);

  const disableTracking = useCallback(() => {
    updateSettings({ ...settings, isEnabled: false });
  }, [settings, updateSettings]);

  const setTrackingInterval = useCallback(
    (interval: number) => {
      updateSettings({ ...settings, interval });
    },
    [settings, updateSettings],
  );

  const setQuietHours = useCallback(
    (start: string, end: string) => {
      updateSettings({ ...settings, quietHours: { start, end } });
    },
    [settings, updateSettings],
  );

  const setTrackingDays = useCallback(
    (days: number[]) => {
      updateSettings({ ...settings, trackingDays: days });
    },
    [settings, updateSettings],
  );

  const triggerManualPrompt = useCallback(() => {
    if (session) {
      session.triggerManualCheck();
    } else {
      showPrompt();
    }
  }, [session, showPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    return await notificationManager.requestPermission();
  }, [notificationManager]);

  const hasNotificationPermission = useCallback(() => {
    return notificationManager.hasPermission();
  }, [notificationManager]);

  return {
    // State
    settings,
    isPromptOpen,
    isSubmitting,
    isTrackingEnabled: settings.isEnabled,

    // Actions
    showPrompt,
    hidePrompt,
    updateSettings,
    submitFlowEntry,
    enableTracking,
    disableTracking,
    setTrackingInterval,
    setQuietHours,
    setTrackingDays,
    triggerManualPrompt,

    // Notifications
    requestNotificationPermission,
    hasNotificationPermission,
  };
}

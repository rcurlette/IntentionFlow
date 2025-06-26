import { useState, useEffect, useCallback } from "react";
import { FlowEntry, FlowTrackingSettings } from "@/types";
import {
  getFlowSettings,
  saveFlowSettings,
  createFlowEntry,
  saveFlowEntry,
  FlowTrackingSession,
  DEFAULT_FLOW_SETTINGS,
} from "@/lib/flow-tracking";

export function useFlowTracking() {
  const [settings, setSettings] = useState<FlowTrackingSettings>(
    DEFAULT_FLOW_SETTINGS,
  );
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [session, setSession] = useState<FlowTrackingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getFlowSettings();
    setSettings(savedSettings);
  }, []);

  // Initialize tracking session
  useEffect(() => {
    if (settings.isEnabled && !session) {
      const newSession = new FlowTrackingSession(() => {
        showPrompt();
      });
      newSession.start();
      setSession(newSession);
    } else if (!settings.isEnabled && session) {
      session.stop();
      setSession(null);
    }

    return () => {
      if (session) {
        session.stop();
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
    showPrompt();
  }, [showPrompt]);

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
  };
}

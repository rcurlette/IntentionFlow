import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onNewTask?: () => void;
  onQuickAdd?: () => void;
  onEscape?: () => void;
  onFlowTracker?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onEscape,
  onFlowTracker,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // New task shortcut: Ctrl+N
      if (event.ctrlKey && event.key === "n" && onNewTask) {
        event.preventDefault();
        onNewTask();
      }

      // Flow tracker shortcut: Ctrl+F
      if (event.ctrlKey && event.key === "f" && onFlowTracker) {
        event.preventDefault();
        onFlowTracker();
      }

      // Escape shortcut
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNewTask, onEscape, onFlowTracker]);
}

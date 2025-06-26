import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onNewTask?: () => void;
  onQuickAdd?: () => void;
  onEscape?: () => void;
  onFlowTracker?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onQuickAdd,
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

      // Quick add shortcut: Ctrl+K (similar to command palette)
      if (event.ctrlKey && event.key === "k" && onQuickAdd) {
        event.preventDefault();
        onQuickAdd();
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
  }, [onNewTask, onQuickAdd, onEscape, onFlowTracker]);
}

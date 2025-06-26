import { useEffect } from "react";

interface KeyboardShortcutOptions {
  onNewTask?: () => void;
  onToggleSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onToggleSearch,
  onEscape,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Ctrl+N or Cmd+N for new task
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault();
        onNewTask?.();
        return;
      }

      // Ctrl+K or Cmd+K for search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onToggleSearch?.();
        return;
      }

      // Escape key
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNewTask, onToggleSearch, onEscape]);
}

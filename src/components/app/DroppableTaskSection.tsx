import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableTaskSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableTaskSection({
  id,
  children,
  className,
}: DroppableTaskSectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200",
        isOver && "scale-105",
        className,
      )}
    >
      {children}
    </div>
  );
}

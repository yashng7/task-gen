import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types";

const categoryBadge: Record<string, { class: string; label: string }> = {
  user_story: { class: "badge-green", label: "Story" },
  engineering_task: { class: "badge-blue", label: "Task" },
  risk: { class: "badge-red", label: "Risk" },
};

interface Props {
  task: Task;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
}

export default function SortableTask({ task, selected, onToggleSelect, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badge = categoryBadge[task.category] || { class: "badge-gray", label: "General" };

  return (
    <div
      ref={setNodeRef}
      style={style} /* Required for dnd-kit functionality, not styling */
      className={`task-card ${isDragging ? "dragging" : ""}`}
      {...attributes}
    >
      <div className="task-card-header">
        <div className="task-card-controls">
          <div 
            className={`checkbox-custom ${selected ? "checked" : ""}`}
            onClick={onToggleSelect}
          >
            {selected && <span className="checkmark">✓</span>}
          </div>

          <span {...listeners} className="drag-handle">
            ⋮⋮
          </span>

          <span className={`badge ${badge.class}`}>{badge.label}</span>
          <span className="task-card-title">{task.title}</span>
        </div>
        
        <button className="btn btn-icon" onClick={onEdit}>
          Edit
        </button>
      </div>
      <div className="task-card-desc">
        {task.description}
      </div>
    </div>
  );
}
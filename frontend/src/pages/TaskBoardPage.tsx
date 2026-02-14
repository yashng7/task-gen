import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { api } from "../api/client";
import { Spec, Task } from "../types";
import SortableTask from "../components/SortableTask";
import EditModal from "../components/EditModal";
import GroupModal from "../components/GroupModal";
import ExportPanel from "../components/ExportPanel";

type TabType = "all" | "user_story" | "engineering_task" | "risk";

export default function TaskBoardPage() {
  const { id } = useParams<{ id: string }>();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showGroup, setShowGroup] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showExport, setShowExport] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    loadSpec();
  }, [id]);

  const loadSpec = async () => {
    if (!id) return;
    try {
      const data = await api.getSpec(id);
      setSpec(data);
      setTaskList(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spec");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks =
    activeTab === "all" ? taskList : taskList.filter((t) => t.category === activeTab);

  const groupedTasks = filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const group = task.groupName || "Ungrouped";
    if (!acc[group]) acc[group] = [];
    acc[group].push(task);
    return acc;
  }, {});

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !id) return;

    const oldIndex = taskList.findIndex((t) => t.id === active.id);
    const newIndex = taskList.findIndex((t) => t.id === over.id);
    const newList = arrayMove(taskList, oldIndex, newIndex);
    setTaskList(newList);

    try {
      await api.reorderTasks(id, newList.map((t) => t.id));
    } catch (err) {
      console.error("Reorder failed:", err);
      loadSpec();
    }
  };

  const handleEditSave = async (taskId: string, data: { title: string; description: string }) => {
    try {
      const updated = await api.updateTask(taskId, data);
      setTaskList((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setEditTask(null);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleGroupSave = async (groupName: string) => {
    if (!id || selectedTasks.size === 0) return;
    try {
      await api.groupTasks(id, Array.from(selectedTasks), groupName);
      await loadSpec();
      setSelectedTasks(new Set());
      setShowGroup(false);
    } catch (err) {
      console.error("Group failed:", err);
    }
  };

  const toggleSelect = (taskId: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!spec) return <div className="error-msg">Project not found</div>;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "all", label: "All Items", count: taskList.length },
    { key: "user_story", label: "Stories", count: taskList.filter((t) => t.category === "user_story").length },
    { key: "engineering_task", label: "Tasks", count: taskList.filter((t) => t.category === "engineering_task").length },
    { key: "risk", label: "Risks", count: taskList.filter((t) => t.category === "risk").length },
  ];

  return (
    <div className="container">
      {/* HEADER */}
      <div className="page-header">
        <h1>{spec.goal}</h1>
        <div className="meta-info">
          <span className="badge badge-gray">{spec.templateType}</span>
          <span className="separator">•</span>
          <span>{spec.users}</span>
          <span className="separator">•</span>
          <span>{taskList.length} items</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="btn-group">
          {selectedTasks.size > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowGroup(true)}>
              Group Selected ({selectedTasks.size})
            </button>
          )}
           <button 
             className={`btn btn-sm ${showExport ? 'btn-primary' : 'btn-secondary'}`} 
             onClick={() => setShowExport(!showExport)}
           >
            {showExport ? "Close Export" : "Export Data"}
          </button>
        </div>
      </div>

      {/* EXPORT PANEL */}
      {showExport && <ExportPanel specId={spec.id} />}

      {/* DRAG & DROP BOARD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {Object.entries(groupedTasks).map(([group, groupTasks]) => (
            <div key={group} className="task-group">
              <div className="group-header">
                {group}
              </div>
              {groupTasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  selected={selectedTasks.has(task.id)}
                  onToggleSelect={() => toggleSelect(task.id)}
                  onEdit={() => setEditTask(task)}
                />
              ))}
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {/* MODALS */}
      {editTask && (
        <EditModal 
          task={editTask} 
          onSave={(data) => handleEditSave(editTask.id, data)} 
          onClose={() => setEditTask(null)} 
        />
      )}
      
      {showGroup && (
        <GroupModal 
          onSave={handleGroupSave} 
          onClose={() => setShowGroup(false)} 
        />
      )}
    </div>
  );
}
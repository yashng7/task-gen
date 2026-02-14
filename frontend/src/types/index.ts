export interface Spec {
  id: string;
  goal: string;
  users: string;
  constraints: string;
  templateType: "web" | "mobile" | "internal";
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  specId: string;
  category: "user_story" | "engineering_task" | "risk";
  title: string;
  description: string;
  groupName: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpecSummary {
  id: string;
  goal: string;
  templateType: string;
  taskCount: number;
  createdAt: string;
}

export interface StatusResponse {
  backend: { status: string; uptime: number };
  database: { status: string; latency_ms?: number; error?: string };
}
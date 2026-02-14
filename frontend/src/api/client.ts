const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("json")) {
    return res.json();
  }
  return res.text() as unknown as T;
}

export const api = {
  getStatus: () => request<any>("/api/status"),

  createSpec: (data: {
    goal: string;
    users: string;
    constraints: string;
    templateType: string;
  }) =>
    request<any>("/api/specs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSpecs: () => request<{ specs: any[] }>("/api/specs"),

  getSpec: (id: string) => request<any>(`/api/specs/${id}`),

  updateTask: (id: string, data: any) =>
    request<any>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  reorderTasks: (specId: string, taskIds: string[]) =>
    request<any>(`/api/specs/${specId}/tasks/reorder`, {
      method: "PUT",
      body: JSON.stringify({ taskIds }),
    }),

  groupTasks: (specId: string, taskIds: string[], groupName: string) =>
    request<any>(`/api/specs/${specId}/tasks/group`, {
      method: "PUT",
      body: JSON.stringify({ taskIds, groupName }),
    }),

  exportSpec: async (id: string, format: "markdown" | "text") => {
    const res = await fetch(
      `${API_URL}/api/specs/${id}/export?format=${format}`,
    );
    return res.text();
  },

  deleteSpec: (id: string) =>
    request<{ message: string }>(`/api/specs/${id}`, { method: "DELETE" }),
};

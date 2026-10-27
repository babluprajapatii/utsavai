/**
 * UtsavAI Frontend API Client
 * Centralized, typed HTTP client connecting the frontend to API route handlers.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (res.status === 204) {
      return { success: true };
    }

    const json = await res.json();
    return json;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message,
      },
    };
  }
}

export const apiClient = {
  events: {
    list: (limit = 50, offset = 0) =>
      request<any[]>(`/api/events?limit=${limit}&offset=${offset}`),
    get: (id: string) => request<any>(`/api/events/${id}`),
    create: (data: any) =>
      request<any>('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, patch: any) =>
      request<any>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    delete: (id: string) =>
      request<void>(`/api/events/${id}`, { method: 'DELETE' }),
  },

  preferences: {
    get: (eventId: string) =>
      request<any>(`/api/events/${eventId}/preferences`),
    update: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/preferences`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  budget: {
    getOverview: (eventId: string) =>
      request<any>(`/api/events/${eventId}/budget`),
  },

  budgetCategories: {
    list: (eventId: string) =>
      request<any[]>(`/api/events/${eventId}/budget-categories`),
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/budget-categories`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (categoryId: string, data: any) =>
      request<any>(`/api/budget-categories/${categoryId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (categoryId: string) =>
      request<void>(`/api/budget-categories/${categoryId}`, {
        method: 'DELETE',
      }),
  },

  expenses: {
    list: (eventId: string, filters?: { category_id?: string; date_from?: string; date_to?: string }) => {
      const q = new URLSearchParams();
      if (filters?.category_id) q.set('category_id', filters.category_id);
      if (filters?.date_from) q.set('date_from', filters.date_from);
      if (filters?.date_to) q.set('date_to', filters.date_to);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<any[]>(`/api/events/${eventId}/expenses${queryStr}`);
    },
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (expenseId: string, data: any) =>
      request<any>(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (expenseId: string) =>
      request<void>(`/api/expenses/${expenseId}`, { method: 'DELETE' }),
  },

  tasks: {
    list: (eventId: string, filters?: { status?: string; priority?: string }) => {
      const q = new URLSearchParams();
      if (filters?.status) q.set('status', filters.status);
      if (filters?.priority) q.set('priority', filters.priority);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<any[]>(`/api/events/${eventId}/tasks${queryStr}`);
    },
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (taskId: string, data: any) =>
      request<any>(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (taskId: string) =>
      request<void>(`/api/tasks/${taskId}`, { method: 'DELETE' }),
    listDependencies: (taskId: string) =>
      request<any[]>(`/api/tasks/${taskId}/dependencies`),
    createDependency: (taskId: string, dependsOnTaskId: string) =>
      request<any>(`/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify({ depends_on_task_id: dependsOnTaskId }),
      }),
    deleteDependency: (dependencyId: string) =>
      request<void>(`/api/dependencies/${dependencyId}`, { method: 'DELETE' }),
  },

  timeline: {
    list: (eventId: string) =>
      request<any[]>(`/api/events/${eventId}/timeline`),
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (milestoneId: string, data: any) =>
      request<any>(`/api/timeline/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (milestoneId: string) =>
      request<void>(`/api/timeline/${milestoneId}`, { method: 'DELETE' }),
  },

  schedule: {
    list: (eventId: string) =>
      request<any[]>(`/api/events/${eventId}/schedule`),
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (scheduleId: string, data: any) =>
      request<any>(`/api/schedule/${scheduleId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (scheduleId: string) =>
      request<void>(`/api/schedule/${scheduleId}`, { method: 'DELETE' }),
  },

  vendors: {
    list: (eventId: string, filters?: { category?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (filters?.category) q.set('category', filters.category);
      if (filters?.status) q.set('status', filters.status);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<any[]>(`/api/events/${eventId}/vendors${queryStr}`);
    },
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/vendors`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (vendorId: string, data: any) =>
      request<any>(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (vendorId: string) =>
      request<void>(`/api/vendors/${vendorId}`, { method: 'DELETE' }),
  },

  guests: {
    list: (eventId: string, filters?: { rsvp?: string; group_name?: string }) => {
      const q = new URLSearchParams();
      if (filters?.rsvp) q.set('rsvp', filters.rsvp);
      if (filters?.group_name) q.set('group_name', filters.group_name);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<any[]>(`/api/events/${eventId}/guests${queryStr}`);
    },
    create: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/guests`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (guestId: string, data: any) =>
      request<any>(`/api/guests/${guestId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (guestId: string) =>
      request<void>(`/api/guests/${guestId}`, { method: 'DELETE' }),
  },

  notifications: {
    list: (unreadOnly = false) =>
      request<any[]>(`/api/notifications${unreadOnly ? '?unread_only=true' : ''}`),
    markRead: (id: string) =>
      request<any>(`/api/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: true }),
      }),
    markAllRead: () =>
      request<{ updated: number }>('/api/notifications/mark-all-read', {
        method: 'POST',
      }),
  },

  dashboard: {
    get: () => request<any>('/api/dashboard'),
  },

  ai: {
    chat: (eventId: string, message: string) =>
      request<{ response: string; conversationId: string | null }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId, message }),
      }),
    generatePlan: (eventId: string) =>
      request<any>('/api/ai/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId }),
      }),
    acceptPlan: (planId: string, data?: any) =>
      request<{ tasksCreated: number; milestonesCreated: number; scheduleItemsCreated: number }>(
        `/api/ai/plans/${planId}/accept`,
        {
          method: 'POST',
          body: JSON.stringify(data || {}),
        }
      ),
  },
};


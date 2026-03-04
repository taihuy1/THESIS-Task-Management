// task and notification endpoints used across multiple files
// auth and user paths are just hardcoded in their service files, not worth centralizing
export const API_ENDPOINTS = {
    TASKS: {
        BASE: '/task',
        BY_ID: (id: string) => `/task/${id}`,
        START: (id: string) => `/task/${id}/start`,
        COMPLETE: (id: string) => `/task/${id}/complete`,
        APPROVE: (id: string) => `/task/${id}/approve`,
        REJECT: (id: string) => `/task/${id}/reject`,
    },
    NOTIFICATIONS: {
        BASE: '/notifications',
        BY_ID: (id: string) => `/notifications/${id}`,
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        UNREAD_COUNT: '/notifications/unread-count',
    },
};

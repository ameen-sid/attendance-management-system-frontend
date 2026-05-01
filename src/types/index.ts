/**
 * Common API Response Interfaces
 */
export interface ApiResponse<T = unknown> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    errors?: (string | { field?: string; message: string })[];
}

export interface PaginatedResponse<T> {
    employees?: T[]; // For employee service
    clients?: T[];   // For client service
    attendanceLogs?: T[]; // For attendance history
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

/**
 * Core Data Models
 */
export const Status = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    HALF_DAY: 'HALF_DAY',
} as const;

export type Status = typeof Status[keyof typeof Status];

export interface User {
    id: number;
    fullname: string;
    username: string;
    email?: string | null;
    isAdmin: boolean;
    role: string;
    avatar?: string | null;
    shift_hours: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Client {
    id: number;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface TaskCategory {
    id: number;
    name: string;
    order: number;
    tasks?: Task[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Task {
    id: number;
    title: string;
    order: number;
    categoryId: number;
    category?: TaskCategory;
    createdAt?: string;
    updatedAt?: string;
}

export interface Attendance {
    id: number;
    date: string;
    clock_in_time: string;
    clock_in_latitude: number;
    clock_in_longitude: number;
    clock_in_address?: string | null;
    clock_out_time?: string | null;
    clock_out_latitude?: number | null;
    clock_out_longitude?: number | null;
    clock_out_address?: string | null;
    status: Status | string;
    userId: number;
    user?: User | string; // Sometimes just the name string comes back from daily
    role?: string;        // Field on flattened response
    clockIn?: string;     // Formatted time
    clockOut?: string;    // Formatted time
    isLate?: boolean;
    location?: string;
    totalHrs?: string;
    requiredHrs?: number;
    employeeName?: string;
    employeeRole?: string;
    
    // Plan fields
    plannedClientId?: number | null;
    plannedClient?: Client | null | string; // Name string in daily response
    plannedDept?: string | null;
    plannedTasks?: string | null;
    plannedTaskCategoryId?: number | null;
    plannedTaskId?: number | null;

    // Report fields
    reportTasksDone?: string | null;
    reportGuidance?: string | null;
    reportHandedOver?: string | null;
    reportTargetDate?: string | null;
    reportResponsible?: string | null;
    reportStatus?: string | null;
    reportTaskCategoryId?: number | null;
    reportTaskId?: number | null;

    attendanceTasks?: {
        id: number;
        title: string;
        isCompleted: boolean;
        remarks?: string | null;
    }[];

    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeHistoryResponse {
    employee: User;
    logs: Attendance[];
}

export interface ClientHistoryResponse {
    client: Client;
    logs: Attendance[];
}

export interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    lateArrivals: number;
    onLeave: number;
    trend: {
        name: string;
        present: number;
        late: number;
        avgHours: number;
    }[];
    clientStats: {
        name: string;
        value: number;
    }[];
    taskStats: {
        total: number;
        completed: number;
        pending: number;
    };
}

export interface RecentActivity {
    id: string;
    name: string;
    time: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    location: string;
}


export interface CalendarEvent {
    id: number | string;
    title: string;
    description?: string | null;
    start: string;
    end: string;
    allDay: boolean;
    type: string;
    color?: string;
    userId: number;
    user?: User;
    createdAt?: string;
    updatedAt?: string;
}
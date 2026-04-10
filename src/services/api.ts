import axios from "axios";

// The local server URL since banana-app is not present
const API_URL = "https://api.bananabillz.com/r/monitoring";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "server-secret": "SERVER_SECRET",
    "api-server-secret": "API_SERVER_SECRET",
  },
});

export interface OutletMetrics {
  pingMs?: number;
  sqliteSizeBytes?: number;
  cpuUsagePercent?: number;
  memoryUsageMb?: number;
  diskSpaceFreeGb?: number;
  uptimeHours?: number;
  unsyncedRevenue?: number;
  syncSuccessRate?: number;
  posVersion?: string;
  localIp?: string;
  connectionType?: string;
}

export interface SyncTableState {
  status?: boolean;
  lastSyncTime?: number;
  error?: string;
  tables?: Record<string, any>;
}

export interface PullSync {
  structure?: SyncTableState;
  menu?: SyncTableState;
  security?: SyncTableState;
  backup?: SyncTableState;
  [key: string]: SyncTableState | undefined;
}

export interface PushSync {
  lastPushTime?: number;
  tables?: Record<string, any>;
}

export interface SyncVerification {
  date: string;
  tables: Record<
    string,
    {
      localCount: number;
      cloudCount?: number;
      isMatched?: boolean;
    }
  >;
}

export interface OutletState {
  _id: string;
  outletId: string;
  outletName: string;
  status: "ONLINE" | "OFFLINE" | "SYNC_ERROR" | "WARNING";
  lastHeartbeat: number;
  metrics: OutletMetrics;
  pullSync?: PullSync;
  pushSync?: PushSync;
  syncVerification?: SyncVerification;
}

export interface ActiveAlert {
  _id: string;
  outletId: string;
  outletName: string;
  apiEndpoint: string;
  direction: "PULL" | "PUSH";
  tableName?: string;
  recordId?: string;
  errorMessage: string;
  errorStack?: string;
  resolved: boolean;
  timestamp: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const monitorService = {
  getOutlets: async (): Promise<OutletState[]> => {
    try {
      const response = await api.get<ApiResponse<OutletState[]>>("/fleet");
      return response.data.data; // project standard ApiResponse.data
    } catch (e) {
      console.error("Failed to fetch outlets:", e);
      throw e;
    }
  },

  getAlerts: async (): Promise<ActiveAlert[]> => {
    try {
      const response = await api.get<ApiResponse<ActiveAlert[]>>("/alerts");
      return response.data.data;
    } catch (e) {
      console.error("Failed to fetch alerts:", e);
      throw e;
    }
  },

  resolveAlert: async (id: string): Promise<{ success: boolean }> => {
    try {
      await api.post(`/alerts/${id}/resolve`, {});
      return { success: true };
    } catch (e) {
      console.error(`Failed to resolve alert ${id}:`, e);
      throw e;
    }
  },
};

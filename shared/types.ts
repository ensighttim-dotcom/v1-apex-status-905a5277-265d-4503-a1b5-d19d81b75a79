export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Apex Status Application Types
export enum EndpointStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface StatusCheck {
  timestamp: number;
  status: EndpointStatus;
  latency: number; // in milliseconds
  statusCode?: number;
  statusText?: string;
}
// This is the core entity stored in the Durable Object.
// It only contains the configuration, not the live status.
export interface MonitoredEndpoint {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers?: string; // Stored as JSON string
  body?: string; // Stored as JSON string
  createdAt: number;
}
// This is the type sent from the frontend to create a new endpoint.
export type CreateEndpointPayload = Omit<MonitoredEndpoint, 'id' | 'createdAt'>;
// This is the type returned by the API, which includes the latest status info.
export interface MonitoredEndpointWithStatus extends MonitoredEndpoint {
  status: EndpointStatus;
  lastCheck?: StatusCheck;
  statusHistory: StatusCheck[];
}
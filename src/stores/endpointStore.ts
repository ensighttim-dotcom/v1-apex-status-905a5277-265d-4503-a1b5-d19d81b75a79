import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { MonitoredEndpointWithStatus, CreateEndpointPayload, StatusCheck } from '@shared/types';
interface EndpointState {
  endpoints: Record<string, MonitoredEndpointWithStatus>;
  checking: Record<string, boolean>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}
interface EndpointActions {
  fetchEndpoints: () => Promise<void>;
  addEndpoint: (newEndpoint: CreateEndpointPayload) => Promise<void>;
  updateEndpoint: (endpointId: string, data: CreateEndpointPayload) => Promise<void>;
  checkEndpoint: (endpointId: string) => Promise<void>;
  deleteEndpoint: (endpointId: string) => Promise<void>;
  refreshAllEndpoints: () => Promise<void>;
}
type EndpointStore = EndpointState & EndpointActions;
export const useEndpointStore = create<EndpointStore>()(
  immer((set, get) => ({
    endpoints: {},
    checking: {},
    isLoading: true,
    isRefreshing: false,
    error: null,
    fetchEndpoints: async () => {
      try {
        set({ isLoading: true, error: null });
        const data = await api<MonitoredEndpointWithStatus[]>('/api/endpoints');
        const endpointsMap = data.reduce((acc, endpoint) => {
          acc[endpoint.id] = endpoint;
          return acc;
        }, {} as Record<string, MonitoredEndpointWithStatus>);
        set({ endpoints: endpointsMap, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load monitoring data.';
        console.error("Failed to fetch endpoints:", error);
        toast.error(errorMessage);
        set({ isLoading: false, error: errorMessage });
      }
    },
    addEndpoint: async (newEndpointData) => {
      try {
        const newEndpoint = await api<MonitoredEndpointWithStatus>('/api/endpoints', {
          method: 'POST',
          body: JSON.stringify(newEndpointData),
        });
        set((state) => {
          state.endpoints[newEndpoint.id] = newEndpoint;
        });
        toast.success('Endpoint added successfully!');
        get().checkEndpoint(newEndpoint.id);
      } catch (error) {
        console.error("Failed to add endpoint:", error);
        toast.error('Failed to add endpoint. Please try again.');
        throw error; // Re-throw to be caught in the form
      }
    },
    updateEndpoint: async (endpointId, data) => {
      try {
        const updatedEndpoint = await api<MonitoredEndpointWithStatus>(`/api/endpoints/${endpointId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        set(state => {
          state.endpoints[endpointId] = updatedEndpoint;
        });
        toast.success('Endpoint updated successfully!');
      } catch (error) {
        console.error(`Failed to update endpoint ${endpointId}:`, error);
        toast.error('Failed to update endpoint. Please try again.');
        throw error; // Re-throw to be caught in the form
      }
    },
    checkEndpoint: async (endpointId) => {
      if (get().checking[endpointId]) return; // Prevent concurrent checks
      set((state) => {
        state.checking[endpointId] = true;
      });
      try {
        const statusCheck = await api<StatusCheck>(`/api/endpoints/${endpointId}/check`, {
          method: 'POST',
        });
        set((state) => {
          const endpoint = state.endpoints[endpointId];
          if (endpoint) {
            endpoint.status = statusCheck.status;
            endpoint.lastCheck = statusCheck;
            endpoint.statusHistory.unshift(statusCheck);
            if (endpoint.statusHistory.length > 50) {
              endpoint.statusHistory.length = 50;
            }
          }
        });
      } catch (error) {
        console.error(`Failed to check endpoint ${endpointId}:`, error);
        // Optionally update UI to show check failed
      } finally {
        set((state) => {
          state.checking[endpointId] = false;
        });
      }
    },
    deleteEndpoint: async (endpointId: string) => {
      try {
        await api(`/api/endpoints/${endpointId}`, { method: 'DELETE' });
        set((state) => {
          delete state.endpoints[endpointId];
        });
        toast.success('Endpoint deleted successfully.');
      } catch (error) {
        console.error(`Failed to delete endpoint ${endpointId}:`, error);
        toast.error('Failed to delete endpoint.');
      }
    },
    refreshAllEndpoints: async () => {
      set({ isRefreshing: true });
      const { endpoints, checkEndpoint } = get();
      const endpointIds = Object.keys(endpoints);
      try {
        await Promise.all(endpointIds.map(id => checkEndpoint(id)));
        toast.info('All endpoints have been refreshed.');
      } catch (error) {
        console.error("Failed during refresh all:", error);
        toast.error('An error occurred while refreshing endpoints.');
      } finally {
        set({ isRefreshing: false });
      }
    },
  }))
);
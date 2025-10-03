import { IndexedEntity } from "./core-utils";
import type { MonitoredEndpoint, StatusCheck } from "@shared/types";
const MAX_HISTORY_LENGTH = 50;
export type MonitoredEndpointState = MonitoredEndpoint & {
  history: StatusCheck[];
};
export class MonitoredEndpointEntity extends IndexedEntity<MonitoredEndpointState> {
  static readonly entityName = "endpoint";
  static readonly indexName = "endpoints";
  // This is the initial state for a newly created entity.
  static readonly initialState: MonitoredEndpointState = {
    id: "",
    name: "",
    url: "",
    method: 'GET',
    createdAt: 0,
    history: [],
  };
  async addStatusCheck(check: StatusCheck): Promise<void> {
    await this.mutate(s => {
      const newHistory = [check, ...s.history];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.length = MAX_HISTORY_LENGTH;
      }
      return { ...s, history: newHistory };
    });
  }
  async getHistory(): Promise<StatusCheck[]> {
    const state = await this.getState();
    return state.history || [];
  }
}
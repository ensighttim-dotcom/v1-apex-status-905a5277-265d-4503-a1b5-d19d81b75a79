import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { MonitoredEndpointEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { EndpointStatus, type MonitoredEndpointWithStatus, StatusCheck } from "@shared/types";
const endpointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL format"),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.string().optional(),
  body: z.string().optional(),
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // GET /api/endpoints - List all endpoints with their latest status
  app.get('/api/endpoints', async (c) => {
    const { items: endpoints } = await MonitoredEndpointEntity.list(c.env);
    const endpointsWithStatus: MonitoredEndpointWithStatus[] = endpoints.map(e => {
      const lastCheck = e.history?.[0];
      const { history, ...rest } = e;
      return {
        ...rest,
        status: lastCheck?.status ?? EndpointStatus.UNKNOWN,
        lastCheck: lastCheck,
        statusHistory: history ?? [],
      };
    });
    return ok(c, endpointsWithStatus);
  });
  // POST /api/endpoints - Create a new endpoint
  app.post('/api/endpoints', zValidator('json', endpointSchema), async (c) => {
    const payload = c.req.valid('json');
    const newEndpointData = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...payload,
    };
    const created = await MonitoredEndpointEntity.create(c.env, { ...newEndpointData, history: [] });
    // Ensure consistent response shape with GET endpoints
    const { history, ...rest } = created;
    const response: MonitoredEndpointWithStatus = {
        ...rest,
        status: EndpointStatus.UNKNOWN,
        statusHistory: history ?? [],
        lastCheck: undefined,
    };
    return ok(c, response);
  });
  // GET /api/endpoints/:id - Get a single endpoint
  app.get('/api/endpoints/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new MonitoredEndpointEntity(c.env, id);
    if (!await entity.exists()) {
      return notFound(c);
    }
    const state = await entity.getState();
    const lastCheck = state.history?.[0];
    const { history, ...rest } = state;
    const endpointWithStatus: MonitoredEndpointWithStatus = {
      ...rest,
      status: lastCheck?.status ?? EndpointStatus.UNKNOWN,
      lastCheck: lastCheck,
      statusHistory: history ?? [],
    };
    return ok(c, endpointWithStatus);
  });
  // PUT /api/endpoints/:id - Update an endpoint
  app.put('/api/endpoints/:id', zValidator('json', endpointSchema), async (c) => {
    const id = c.req.param('id');
    const payload = c.req.valid('json');
    const entity = new MonitoredEndpointEntity(c.env, id);
    if (!await entity.exists()) {
      return notFound(c, 'Endpoint not found');
    }
    await entity.patch(payload);
    const updatedState = await entity.getState();
    const lastCheck = updatedState.history?.[0];
    // Ensure consistent response shape with GET endpoints
    const { history, ...rest } = updatedState;
    const response: MonitoredEndpointWithStatus = {
      ...rest,
      status: lastCheck?.status ?? EndpointStatus.UNKNOWN,
      lastCheck: lastCheck,
      statusHistory: history ?? [],
    };
    return ok(c, response);
  });
  // DELETE /api/endpoints/:id - Delete an endpoint
  app.delete('/api/endpoints/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'ID is required');
    const deleted = await MonitoredEndpointEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // POST /api/endpoints/:id/check - Perform a health check
  app.post('/api/endpoints/:id/check', async (c) => {
    const id = c.req.param('id');
    const entity = new MonitoredEndpointEntity(c.env, id);
    if (!await entity.exists()) {
      return notFound(c, 'Endpoint not found');
    }
    const endpoint = await entity.getState();
    const startTime = Date.now();
    let checkResult: StatusCheck;
    try {
      const headers = endpoint.headers ? JSON.parse(endpoint.headers) : {};
      const body = endpoint.body ? JSON.parse(endpoint.body) : undefined;
      // This will throw if URL is invalid, which is caught below
      const request = new Request(endpoint.url, {
        method: endpoint.method,
        headers: { 'User-Agent': 'ApexStatus-Checker/1.0', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        redirect: 'manual',
      });
      const response = await fetch(request);
      const latency = Date.now() - startTime;
      let status: EndpointStatus;
      if (response.ok) { // Status 200-299
        status = latency > 1000 ? EndpointStatus.DEGRADED : EndpointStatus.UP;
      } else {
        status = EndpointStatus.DOWN;
      }
      checkResult = {
        timestamp: Date.now(),
        status,
        latency,
        statusCode: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error(`Error checking ${endpoint.url}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      checkResult = {
        timestamp: Date.now(),
        status: EndpointStatus.DOWN,
        latency: Date.now() - startTime,
        statusCode: 0,
        statusText: `Check failed: ${errorMessage.substring(0, 100)}`,
      };
    }
    await entity.addStatusCheck(checkResult);
    return ok(c, checkResult);
  });
}
import React, { useEffect, useState } from 'react';
import { useEndpointStore } from '@/stores/endpointStore';
import { StatusCard } from './StatusCard';
import { AnimatePresence, motion } from 'framer-motion';
import { AddEndpointDialog } from './AddEndpointDialog';
import { MonitoredEndpointWithStatus } from '@shared/types';
const POLLING_INTERVAL = 300000; // 5 minutes
export function StatusDashboard() {
  const { endpoints, isLoading, fetchEndpoints, checkEndpoint } = useEndpointStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<MonitoredEndpointWithStatus | undefined>(undefined);
  const endpointList = Object.values(endpoints);
  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);
  useEffect(() => {
    const interval = setInterval(() => {
      const currentEndpoints = useEndpointStore.getState().endpoints;
      Object.keys(currentEndpoints).forEach(id => {
        checkEndpoint(id);
      });
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [checkEndpoint]);
  const handleEdit = (endpoint: MonitoredEndpointWithStatus) => {
    setEditingEndpoint(endpoint);
    setModalOpen(true);
  };
  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingEndpoint(undefined);
    }
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatusCard key={index} isLoading={true} onEdit={() => {}} />
        ))}
      </div>
    );
  }
  if (endpointList.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold text-foreground">No Endpoints Monitored</h2>
        <p className="mt-2 text-muted-foreground">Click "Add Endpoint" to start monitoring your APIs.</p>
      </div>
    );
  }
  return (
    <>
      <AddEndpointDialog
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        endpointToEdit={editingEndpoint}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {endpointList.map((endpoint) => (
            <motion.div
              key={endpoint.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <StatusCard endpointId={endpoint.id} onEdit={() => handleEdit(endpoint)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
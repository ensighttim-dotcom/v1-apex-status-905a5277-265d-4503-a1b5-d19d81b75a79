import React from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddEndpointDialog } from '@/components/dashboard/AddEndpointDialog';
import { useEndpointStore } from '@/stores/endpointStore';
import { cn } from '@/lib/utils';
export function Header() {
  const { refreshAllEndpoints, isRefreshing } = useEndpointStore();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="h-6 w-6 text-blue-500"
          >
            <rect width="256" height="256" fill="none" />
            <path
              d="M45.1,182.2a8,8,0,0,1-13.1-7.4,104.1,104.1,0,0,1,192-74.2,8,8,0,0,1-15.8,2.8,88.1,88.1,0,0,0-163.1,63.4A8,8,0,0,1,45.1,182.2Z"
              fill="currentColor"
            />
            <path
              d="M210.9,73.8a8,8,0,0,1,13.1,7.4,104.1,104.1,0,0,1-192,74.2,8,8,0,0,1,15.8-2.8,88.1,88.1,0,0,0,163.1-63.4A8,8,0,0,1,210.9,73.8Z"
              fill="currentColor"
            />
          </svg>
          <h1 className="text-2xl font-display font-bold">Apex Status</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAllEndpoints} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
          <AddEndpointDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Endpoint
            </Button>
          </AddEndpointDialog>
          <ThemeToggle className="relative" />
        </div>
      </div>
    </header>
  );
}
import React from 'react';
import { EndpointStatus, MonitoredEndpointWithStatus } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowDown, ArrowUp, AlertTriangle, MoreVertical, ServerOff, Trash2, Edit, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useEndpointStore } from '@/stores/endpointStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from 'date-fns';
interface StatusCardProps {
  endpointId?: string;
  isLoading?: boolean;
  onEdit: (endpoint: MonitoredEndpointWithStatus) => void;
}
const statusConfig = {
  [EndpointStatus.UP]: {
    label: 'Up',
    color: 'bg-green-500 border-green-500',
    icon: <ArrowUp className="h-4 w-4 text-green-500" />,
    chartColor: 'hsl(var(--chart-2))'
  },
  [EndpointStatus.DOWN]: {
    label: 'Down',
    color: 'bg-red-500 border-red-500',
    icon: <ArrowDown className="h-4 w-4 text-red-500" />,
    chartColor: 'hsl(var(--destructive))'
  },
  [EndpointStatus.DEGRADED]: {
    label: 'Degraded',
    color: 'bg-yellow-500 border-yellow-500',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    chartColor: 'hsl(var(--chart-1))'
  },
  [EndpointStatus.UNKNOWN]: {
    label: 'Unknown',
    color: 'bg-gray-500 border-gray-500',
    icon: <ServerOff className="h-4 w-4 text-gray-500" />,
    chartColor: 'hsl(var(--muted-foreground))'
  }
};
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.7rem] uppercase text-muted-foreground">Latency</span>
            <span className="font-bold text-muted-foreground">{payload[0].value}ms</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export function StatusCard({ endpointId, isLoading = false, onEdit }: StatusCardProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const endpoint = useEndpointStore((state) => endpointId ? state.endpoints[endpointId] : undefined);
  const isChecking = useEndpointStore((state) => endpointId ? state.checking[endpointId] : false);
  const deleteEndpoint = useEndpointStore((state) => state.deleteEndpoint);
  if (isLoading || !endpoint) {
    return (
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </CardFooter>
      </Card>
    );
  }
  const config = statusConfig[endpoint.status] || statusConfig[EndpointStatus.UNKNOWN];
  const chartData = endpoint.statusHistory.map((h) => ({ name: h.timestamp, latency: h.latency })).reverse();
  return (
    <>
      <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold leading-snug tracking-tight pr-2">
              {endpoint.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(endpoint)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground truncate">{endpoint.url}</p>
        </CardHeader>
        <CardContent className="py-0">
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id={`color-${endpoint.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="latency" stroke={config.chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#color-${endpoint.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
          <Badge variant="outline" className={cn('border-transparent text-xs', config.color)}>
            <span className={cn('mr-1.5 h-2 w-2 rounded-full transition-all', config.color, isChecking && 'animate-pulse')} />
            {config.label}
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex items-center font-semibold">
              {config.icon}
              <span className="ml-1.5">
                {endpoint.lastCheck?.latency ?? 'N/A'} ms
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {endpoint.lastCheck ? formatDistanceToNow(new Date(endpoint.lastCheck.timestamp), { addSuffix: true }) : 'never'}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold"> {endpoint.name} </span>
              endpoint and all of its monitoring data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteEndpoint(endpoint.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
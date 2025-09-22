import { DeviceConnectionCard } from "@/components/DeviceConnectionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Watch, Activity, Plus, RefreshCw, Wifi, Battery } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DevicesPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connected devices
  const { data: devices, isLoading } = useQuery({
    queryKey: ['/api/devices'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mutation for syncing device
  const syncDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => apiRequest('/api/devices/sync', 'POST', { deviceId }),
    onSuccess: (data, deviceId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      toast({
        title: "Device Sync Started",
        description: "Your device is now syncing...",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Unable to sync device. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSyncDevice = (deviceId: string) => {
    syncDeviceMutation.mutate(deviceId);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    if (devices && devices.length > 0) {
      for (const device of devices) {
        await syncDeviceMutation.mutateAsync(device.id);
      }
    }
    setIsSyncing(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apple_watch':
      case 'watch':
        return <Watch className="h-5 w-5" />;
      case 'iphone':
      case 'phone':
        return <Smartphone className="h-5 w-5" />;
      case 'whoop':
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'syncing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'disconnected':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Connected Devices</h1>
          <p className="text-muted-foreground">Manage your health tracking devices and data sources</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSyncAll}
            disabled={isSyncing || !devices || devices.length === 0}
            data-testid="button-sync-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
          <Button data-testid="button-add-device">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {devices?.filter(d => d.status === 'connected').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {devices?.filter(d => d.status === 'syncing').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Syncing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Battery className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {devices ? Math.round(devices.reduce((acc, d) => acc + (d.batteryLevel || 0), 0) / devices.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Battery</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <Activity className="h-5 w-5 text-chart-1" />
            </div>
            Your Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices && devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map((device: any) => (
                <div key={device.id} className="flex items-center gap-4 p-4 rounded-lg border hover-elevate">
                  <div className="p-3 rounded-lg bg-muted">
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{device.deviceName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Never'}
                    </p>
                    {device.metadata && (
                      <p className="text-xs text-muted-foreground">
                        {device.metadata.model} • {device.metadata.version || device.metadata.firmware}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{device.batteryLevel}%</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSyncDevice(device.id)}
                      disabled={device.status === 'syncing'}
                      data-testid={`button-sync-${device.id}`}
                    >
                      {device.status === 'syncing' ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Syncing
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No devices connected</p>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your health devices to start tracking your wellness data
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Device
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-dashed">
              <div className="flex items-center gap-3 mb-2">
                <Watch className="h-6 w-6 text-muted-foreground" />
                <h4 className="font-medium">Apple Watch</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Heart rate, activity, workout data
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-dashed">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="h-6 w-6 text-muted-foreground" />
                <h4 className="font-medium">iPhone / Android</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Steps, sleep tracking, health data
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-dashed">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-6 w-6 text-muted-foreground" />
                <h4 className="font-medium">Whoop / Fitbit</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Recovery, strain, sleep scores
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <h4 className="font-medium">End-to-End Encryption</h4>
                <p className="text-sm text-muted-foreground">All health data is encrypted during transmission and storage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <h4 className="font-medium">Local Processing</h4>
                <p className="text-sm text-muted-foreground">Mood analysis happens locally when possible</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <h4 className="font-medium">No Data Sharing</h4>
                <p className="text-sm text-muted-foreground">Your health data is never shared with third parties</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
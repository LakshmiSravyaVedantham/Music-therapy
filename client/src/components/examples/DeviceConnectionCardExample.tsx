import { DeviceConnectionCard } from '../DeviceConnectionCard'

export default function DeviceConnectionCardExample() {
  const mockDevices = [
    {
      id: "1",
      name: "Apple Watch Series 9",
      type: "watch" as const,
      status: "connected" as const,
      lastSync: "2 minutes ago",
      batteryLevel: 85
    },
    {
      id: "2",
      name: "iPhone 15 Pro",
      type: "phone" as const,
      status: "syncing" as const,
      lastSync: "Syncing now...",
      batteryLevel: 67
    },
    {
      id: "3",
      name: "Whoop 4.0",
      type: "tracker" as const,
      status: "disconnected" as const,
      lastSync: "1 hour ago",
      batteryLevel: 23
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {mockDevices.map(device => (
        <DeviceConnectionCard key={device.id} device={device} />
      ))}
    </div>
  )
}
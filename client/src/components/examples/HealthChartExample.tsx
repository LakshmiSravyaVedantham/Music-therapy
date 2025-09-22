import { HealthChart } from '../HealthChart'

export default function HealthChartExample() {
  // todo: remove mock functionality - generate realistic health data
  const heartRateData = [
    { time: "6:00", value: 65 },
    { time: "8:00", value: 78 },
    { time: "10:00", value: 85 },
    { time: "12:00", value: 72 },
    { time: "14:00", value: 88 },
    { time: "16:00", value: 95 },
    { time: "18:00", value: 82 },
    { time: "20:00", value: 68 }
  ]

  const sleepData = [
    { time: "22:00", value: 0 },
    { time: "23:00", value: 20 },
    { time: "00:00", value: 60 },
    { time: "01:00", value: 85 },
    { time: "02:00", value: 90 },
    { time: "03:00", value: 95 },
    { time: "04:00", value: 88 },
    { time: "05:00", value: 75 },
    { time: "06:00", value: 40 },
    { time: "07:00", value: 0 }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      <HealthChart
        title="Heart Rate Today"
        data={heartRateData}
        color="chart-1"
        unit="bpm"
        type="line"
      />
      <HealthChart
        title="Sleep Quality"
        data={sleepData}
        color="chart-4"
        unit="%"
        type="area"
      />
    </div>
  )
}
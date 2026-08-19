import { Bar } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Props = {
  labels: (string | number)[]
  counts: number[]
  color?: string
}

export function HistogramChart({ labels, counts, color = "#2563eb" }: Props) {
  const chartData: ChartData<"bar"> = {
    labels: labels.map(String),
    datasets: [{ label: "빈도", data: counts, backgroundColor: color, borderRadius: 3, barThickness: 18 }],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
    },
    plugins: { legend: { display: false } },
  }

  return <Bar data={chartData} options={options} />
}

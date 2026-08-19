import { Bar } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Series = {
  label: string
  data: number[]
  color: string
}

type Props = {
  labels: string[]
  series: Series[]
}

export function CountBarChart({ labels, series }: Props) {
  const chartData: ChartData<"bar"> = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      backgroundColor: s.color,
      borderRadius: 4,
      barThickness: 24,
    })),
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 12 } } },
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", font: { size: 12 } },
        grid: { color: "#e5e7eb" },
      },
    },
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } },
    },
  }

  return <Bar data={chartData} options={options} />
}

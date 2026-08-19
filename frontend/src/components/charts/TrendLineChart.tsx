import { Line } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Props = {
  labels: string[]
  data: number[]
  seriesLabel: string
  yTitle: string
  lowLine?: number
  highLine?: number
}

export function TrendLineChart({ labels, data, seriesLabel, yTitle, lowLine, highLine }: Props) {
  const hasThresholds = typeof lowLine === "number" && typeof highLine === "number"

  const chartData: ChartData<"line"> = {
    labels,
    datasets: [
      ...(hasThresholds
        ? [
            {
              label: "하한선",
              data: labels.map(() => lowLine as number),
              borderColor: "#6366f1",
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [6, 4],
              tension: 0,
            },
          ]
        : []),
      {
        label: seriesLabel,
        data,
        borderColor: "#e11d48",
        backgroundColor: "#e11d48",
        borderWidth: 1.5,
        pointRadius: 1.5,
        tension: 0,
      },
      ...(hasThresholds
        ? [
            {
              label: "상한선",
              data: labels.map(() => highLine as number),
              borderColor: "#14b8a6",
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [6, 4],
              tension: 0,
            },
          ]
        : []),
    ],
  }

  const rangeValues = hasThresholds ? [...data, lowLine as number, highLine as number] : data
  const minVal = Math.min(...rangeValues)
  const maxVal = Math.max(...rangeValues)
  const padding = Math.max((maxVal - minVal) * 0.15, 0.1)

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: Math.floor(minVal - padding),
        max: Math.ceil(maxVal + padding),
        title: { display: true, text: yTitle },
        grid: { color: "#e5e7eb" },
      },
      x: {
        title: { display: true, text: "TIME" },
        ticks: { maxTicksLimit: 8 },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: hasThresholds, position: "bottom" },
      tooltip: { callbacks: { label: (ctx) => ` ${Number(ctx.parsed.y).toFixed(2)}` } },
    },
  }

  return <Line data={chartData} options={options} />
}

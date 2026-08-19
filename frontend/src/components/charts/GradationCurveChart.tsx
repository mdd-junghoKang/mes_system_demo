import { Line } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"
import { SIEVE_LABELS } from "@/hooks/useGradationCurve"

const PALETTE = ["#e11d48", "#2563eb", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#db2777"]

type Props = {
  series: { label: string; data: number[] }[]
  lowLine?: number[]
  highLine?: number[]
}

export function GradationCurveChart({ series, lowLine, highLine }: Props) {
  const chartData: ChartData<"line"> = {
    labels: SIEVE_LABELS,
    datasets: [
      ...series.map((s, i) => ({
        label: s.label,
        data: s.data,
        borderColor: PALETTE[i % PALETTE.length],
        backgroundColor: PALETTE[i % PALETTE.length],
        borderWidth: 1.5,
        pointRadius: 2,
        tension: 0.2,
      })),
      ...(lowLine
        ? [
            {
              label: "최소값",
              data: lowLine,
              borderColor: "#6366f1",
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [6, 4],
              tension: 0,
            },
          ]
        : []),
      ...(highLine
        ? [
            {
              label: "최대값",
              data: highLine,
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

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20 }, title: { display: true, text: "통과율 (%)" } },
      x: { title: { display: true, text: "체 크기 (mm)" } },
    },
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } },
    },
  }

  return <Line data={chartData} options={options} />
}

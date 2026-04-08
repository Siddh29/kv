import { Line } from 'react-chartjs-2';
import './chartSetup';
import { chartDefaults } from './chartSetup';

interface NDVIChartProps {
  history: { time: string; ndvi: number }[];
}

export function NDVIChart({ history }: NDVIChartProps) {
  const labels = history.map((h) => h.time);
  const values = history.map((h) => h.ndvi);

  const data = {
    labels,
    datasets: [
      {
        label: 'NDVI',
        data: values,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        ...chartDefaults.plugins.legend,
        labels: { ...chartDefaults.plugins.legend.labels },
      },
      title: {
        display: true,
        text: 'NDVI Trend',
        color: '#334155',
        font: { size: 14, family: 'Inter', weight: 600 as const },
        padding: { bottom: 16 },
      },
    },
    scales: {
      ...chartDefaults.scales,
      y: {
        ...chartDefaults.scales.y,
        min: 0,
        max: 1,
        ticks: {
          ...chartDefaults.scales.y.ticks,
          stepSize: 0.1,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}

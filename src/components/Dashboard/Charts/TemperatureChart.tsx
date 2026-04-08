import { Line } from 'react-chartjs-2';
import './chartSetup';
import { chartDefaults } from './chartSetup';

interface TemperatureChartProps {
  history: { time: string; temperature: number }[];
}

export function TemperatureChart({ history }: TemperatureChartProps) {
  const labels = history.map((h) => h.time);
  const values = history.map((h) => h.temperature);

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: values,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f97316',
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
      title: {
        display: true,
        text: 'Temperature Trend',
        color: '#334155',
        font: { size: 14, family: 'Inter', weight: 600 as const },
        padding: { bottom: 16 },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}

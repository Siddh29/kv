import { Bar } from 'react-chartjs-2';
import './chartSetup';
import { chartDefaults } from './chartSetup';

interface RainfallChartProps {
  history: { time: string; rainfall: number }[];
}

export function RainfallChart({ history }: RainfallChartProps) {
  const labels = history.map((h) => h.time);
  const values = history.map((h) => h.rainfall);

  const data = {
    labels,
    datasets: [
      {
        label: 'Rainfall (mm/h)',
        data: values,
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: '#0ea5e9',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: 'Rainfall Trend',
        color: '#334155',
        font: { size: 14, family: 'Inter', weight: 600 as const },
        padding: { bottom: 16 },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
}

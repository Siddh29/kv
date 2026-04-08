import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: '#334155',
        font: { size: 12, family: 'Inter', weight: 600 },
        boxWidth: 8,
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      bodyColor: '#334155',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b', font: { size: 10, family: 'Inter', weight: 500 } },
    },
    y: {
      grid: { color: '#e2e8f0', borderDash: [4, 4] },
      ticks: { color: '#64748b', font: { size: 10, family: 'Inter', weight: 500 } },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

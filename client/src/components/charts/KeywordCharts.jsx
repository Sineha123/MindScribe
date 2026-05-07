import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function KeywordCharts({ keywords }) {
  const labels = Object.keys(keywords || {});
  const data = Object.values(keywords || {});

  const barData = {
    labels,
    datasets: [
      {
        label: 'Keyword Frequency',
        data,
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: '#38bdf8',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(56, 189, 248, 0.5)',
          'rgba(129, 140, 248, 0.5)',
          'rgba(192, 132, 252, 0.5)',
          'rgba(244, 114, 182, 0.5)',
          'rgba(251, 146, 60, 0.5)',
        ],
        borderColor: [
          '#38bdf8',
          '#818cf8',
          '#c084fc',
          '#f472b6',
          '#fb923c',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Keyword Distribution</h3>
        <div className="h-64">
          <Bar data={barData} options={options} />
        </div>
      </div>
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4 text-accent">Top Concepts</h3>
        <div className="h-64 flex justify-center">
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </motion.div>
  );
}

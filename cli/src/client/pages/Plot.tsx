import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PlotPage() {
  const [data, setData] = useState('');

  useEffect(() => {
    const update = async () => {
      const data = await fetch('/api/output/plot_data').then((res) =>
        res.text()
      );
      console.log(data);
      setData(data);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  const xs = [];
  const ys = [];
  for (const line of data.trim().split('\n').slice(1)) {
    const [
      relative_time,
      cycles_done,
      cur_path,
      paths_total,
      pending_total,
      pending_favs,
      map_size,
      unique_crashes,
      unique_hangs,
      max_depth,
      execs_per_sec,
      total_execs,
      edges_found,
    ] = line.split(',');
    xs.push(+relative_time);
    ys.push(+paths_total);
  }

  return (
    <>
      <h2>Plot</h2>
      <Line
        options={{
          scales: {
            y: {
              min: 0,
            },
          },
        }}
        data={{
          labels: xs,
          datasets: [
            {
              label: `Paths Total`,
              data: ys,
            },
          ],
        }}
      />
    </>
  );
}

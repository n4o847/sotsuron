import React, { useEffect, useState } from 'react';

export default function StatsPage() {
  const [stats, setStats] = useState('');

  useEffect(() => {
    const update = async () => {
      const stats = await fetch('/api/output/fuzzer_stats').then((res) =>
        res.text()
      );
      console.log(stats);
      setStats(stats);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Stats</h2>
      <pre>{stats}</pre>
    </>
  );
}

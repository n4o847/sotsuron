import React, { useEffect, useState } from 'react';

export default function CrashesPage() {
  const [crashes, setCrashes] = useState<any[]>([]);

  useEffect(() => {
    const update = async () => {
      const crashes = (await fetch('/api/crashes').then((res) =>
        res.json()
      )) as any[];
      crashes.reverse();
      console.log(crashes);
      setCrashes(crashes);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Crashes</h2>
      <ul className="list-group">
        {crashes.map((info) => (
          <li key={info.id} className="list-group-item">
            <p>{info['filename']}</p>
            <pre>{atob(info['base64'])}</pre>
          </li>
        ))}
      </ul>
    </>
  );
}

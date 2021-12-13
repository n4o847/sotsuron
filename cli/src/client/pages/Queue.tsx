import React, { useEffect, useState } from 'react';

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const update = async () => {
      const queue = await fetch('/api/queue').then((res) => res.json());
      console.log(queue);
      setQueue(queue);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Queue</h2>
      <ul className="list-group">
        {queue.map((info) => (
          <li key={info.id} className="list-group-item">
            {JSON.stringify({ ...info, base64: undefined })}
            <pre>{atob(info.base64)}</pre>
          </li>
        ))}
      </ul>
    </>
  );
}

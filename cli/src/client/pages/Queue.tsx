import React, { useEffect, useState } from 'react';

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [seed, setSeed] = useState('');

  useEffect(() => {
    const update = async () => {
      const queue = (await fetch('/api/queue').then((res) =>
        res.json()
      )) as any[];
      queue.reverse();
      console.log(queue);
      setQueue(queue);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  const sendSeed = async () => {
    const queue = (await fetch('/api/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: btoa(unescape(encodeURIComponent(seed))),
      }),
    }).then((res) => res.json())) as any[];
    queue.reverse();
    setSeed('');
    setQueue(queue);
  };

  return (
    <>
      <h2>Queue</h2>
      <textarea
        className="form-control mb-3"
        rows={3}
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />
      <div className="mb-3 d-flex justify-content-end">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => sendSeed()}
        >
          Send
        </button>
      </div>
      <ul className="list-group">
        {queue.map((info) => (
          <li key={info.id} className="list-group-item">
            <p>{info['filename']}</p>
            <pre>{atob(info['base64'])}</pre>
          </li>
        ))}
      </ul>
    </>
  );
}

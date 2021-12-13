import React, { useEffect, useState } from 'react';

export default function ExplorerPage() {
  const [profile, setProfile] = useState<any[]>([]);

  useEffect(() => {
    const update = async () => {
      const profile = await fetch('/api/target/.aflv/profile.json').then(
        (res) => res.json()
      );
      console.log(profile);
      setProfile(profile);
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Explorer</h2>
      <pre>
        <code>{JSON.stringify(profile, null, 2)}</code>
      </pre>
    </>
  );
}

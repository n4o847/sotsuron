import React, { useEffect, useState } from 'react';

interface Profile {
  basic_blocks: BasicBlock[];
}

interface BasicBlock {
  id: number;
  instructions: Instruction[];
}

interface Instruction {
  directory: string;
  filename: string;
  line: number;
}

interface BlockFreq {
  freq: number[];
}

function getCoverage(profile: Profile, blockFreq: BlockFreq) {
  const coverage = new Map<string, number>();
  for (const block of profile['basic_blocks']) {
    const freq = blockFreq['freq'][block.id];
    for (const inst of block['instructions']) {
      coverage.set(`${inst.filename}:${inst.line}`, freq);
    }
  }
  return coverage;
}

async function getFiles(profile: Profile) {
  const fileMap = new Map<string, string>();
  for (const block of profile['basic_blocks']) {
    for (const inst of block['instructions']) {
      if (fileMap.has(inst['filename'])) {
        continue;
      }
      const content = await fetch(`/api/target/${inst['filename']}`).then(
        (res) => res.text()
      );
      fileMap.set(inst['filename'], content);
    }
  }
  return fileMap;
}

export default function ExplorerPage() {
  const [profile, setProfile] = useState<Profile>();
  const [coverage, setCoverage] = useState<Map<string, number>>(new Map());
  const [fileMap, setFileMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const update = async () => {
      const profile = await fetch('/api/target/.aflv/profile.json').then(
        (res) => res.json()
      ) as Profile;
      console.log(profile);
      const blockFreq = await fetch('/api/output/block_freq.json').then(
        (res) => res.json()
      ) as BlockFreq;
      setProfile(profile);
      setCoverage(getCoverage(profile, blockFreq));
      setFileMap(await getFiles(profile));
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Explorer</h2>
      {Array.from(fileMap.entries(), ([filename, content]) => (
        <div key={filename}>
          <h4>{filename}</h4>
          <pre>
            {content.split('\n').map((line, index) => (
              <div
                key={index}
                style={
                  coverage.has(`${filename}:${index + 1}`)
                    ? coverage.get(`${filename}:${index + 1}`)! >= 1
                      ? { backgroundColor: '#ccffd8' }
                      : { backgroundColor: '#ffd7d5' }
                    : {}
                }
              >
                <code>{line}</code>
              </div>
            ))}
          </pre>
        </div>
      ))}
    </>
  );
}

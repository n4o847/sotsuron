import React, { useEffect, useState } from 'react';
import './Explorer.css';

interface Profile {
  files: File[];
  basic_blocks: BasicBlock[];
}

interface File {
  id: number;
  directory: string;
  filename: string;
  source?: string;
}

interface BasicBlock {
  id: number;
  instructions: Instruction[];
}

interface Instruction {
  directory: string;
  filename: string;
  line: number;
  file_id: number;
}

interface BlockFreq {
  freq: number[];
}

function getCoverage(profile: Profile, blockFreq: BlockFreq) {
  const coverage = new Map<string, number>();
  for (const block of profile['basic_blocks']) {
    const freq = blockFreq['freq'][block.id];
    for (const inst of block['instructions']) {
      coverage.set(`${inst['file_id']}:${inst['line']}`, freq);
    }
  }
  return coverage;
}

function getFiles(profile: Profile) {
  const fileMap = new Map<number, File>();
  for (const file of profile['files']) {
    fileMap.set(file.id, file);
  }
  return fileMap;
}

export default function ExplorerPage() {
  const [profile, setProfile] = useState<Profile>();
  const [fileMap, setFileMap] = useState<Map<number, File>>(new Map());
  const [coverage, setCoverage] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const update = async () => {
      const profile = (await fetch('/api/target/.aflv/profile.json').then(
        (res) => res.json()
      )) as Profile;
      console.log(profile);
      const blockFreq = (await fetch('/api/output/block_freq.json').then(
        (res) => res.json()
      )) as BlockFreq;
      setProfile(profile);
      setFileMap(getFiles(profile));
      setCoverage(getCoverage(profile, blockFreq));
    };
    const timer = setInterval(update, 5000);
    update();
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>Explorer</h2>
      <table className="table">
        <thead>
          <tr>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(fileMap.values(), (file) => (
            <tr>
              <td>{file.filename}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {Array.from(fileMap.values(), (file) => (
        <div key={file.id}>
          <h4>{file.filename}</h4>
          <table className="file-line-container">
            {file.source
              ?.replace(/\n$/, '')
              .split('\n')
              .map((line, index) => (
                <tr
                  key={index}
                  className={[
                    ...(coverage.has(`${file.id}:${index + 1}`)
                      ? coverage.get(`${file.id}:${index + 1}`)! >= 1
                        ? ['line-success']
                        : ['line-danger']
                      : []),
                  ].join(' ')}
                >
                  <td className="file-line-number">{index + 1}</td>
                  <td className="file-line-code">
                    <span className="font-monospace">{line}</span>
                  </td>
                </tr>
              ))}
          </table>
        </div>
      ))}
    </>
  );
}

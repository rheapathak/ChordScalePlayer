import React, { useState } from 'react';
import * as Tone from 'tone';
import './styles.css';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_TYPES = [
  { value: 'major', label: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  { value: 'minor', label: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  { value: 'harmonicMinor', label: 'Harmonic Minor', intervals: [2, 1, 2, 2, 1, 3, 1] },
  { value: 'melodicMinor', label: 'Melodic Minor', intervals: [2, 1, 2, 2, 2, 2, 1] },
];

const INSTRUMENTS = ['Synth', 'AMSynth', 'DuoSynth', 'FMSynth', 'PluckSynth'];

export default function App() {
  const [root, setRoot] = useState('C');
  const [scale, setScale] = useState('major');
  const [instrument, setInstrument] = useState('Synth');
  const [playStyle, setPlayStyle] = useState('sustained');

  function getScaleNotes(root, intervals) {
    const rootIndex = NOTES.indexOf(root);
    let notes = [root];
    let idx = rootIndex;
    for (let step of intervals) {
      idx = (idx + step) % NOTES.length;
      notes.push(NOTES[idx]);
    }
    return notes;
  }

  const scaleData = SCALE_TYPES.find(s => s.value === scale);
  const scaleNotes = getScaleNotes(root, scaleData.intervals);

  function buildChords(scaleNotes) {
    let chords = [];
    for (let i = 0; i < scaleNotes.length - 1; i++) {
      let triad = [
        scaleNotes[i],
        scaleNotes[(i + 2) % scaleNotes.length],
        scaleNotes[(i + 4) % scaleNotes.length]
      ];
      chords.push(triad);
    }
    return chords;
  }

  const chords = buildChords(scaleNotes);

  async function playChord(notes, opts = { style: 'sustained' }) {
    await Tone.start();
    const now = Tone.now();
    const SynthType = Tone[instrument];
    const synth = new SynthType().toDestination();
    const pitchNotes = notes.map(n => `${n}4`);

    if (opts.style === 'sustained') {
      pitchNotes.forEach(p => synth.triggerAttackRelease(p, '2n', now));
    } else if (opts.style === 'arpeggiated') {
      pitchNotes.forEach((p, i) => synth.triggerAttackRelease(p, '8n', now + i * 0.25));
    } else if (opts.style === 'strummed') {
      pitchNotes.forEach((p, i) => synth.triggerAttackRelease(p, '8n', now + i * 0.06));
    }
  }

  return (
    <div className="container">
      <h1>🎵 Chord Scale Player</h1>

      <div className="controls">
        <label>
          Root:
          <select value={root} onChange={e => setRoot(e.target.value)}>
            {NOTES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label>
          Scale:
          <select value={scale} onChange={e => setScale(e.target.value)}>
            {SCALE_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          Instrument:
          <select value={instrument} onChange={e => setInstrument(e.target.value)}>
            {INSTRUMENTS.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>

        <label>
          Play style:
          <select value={playStyle} onChange={e => setPlayStyle(e.target.value)}>
            <option value="sustained">Sustained</option>
            <option value="arpeggiated">Arpeggiated</option>
            <option value="strummed">Strummed</option>
          </select>
        </label>
      </div>

      <div className="scale-display">
        <h2>{root} {scaleData.label}</h2>
        <div className="notes">
          {scaleNotes.map((n, i) => (
            <span key={i} className="note">{n}</span>
          ))}
        </div>
      </div>

      <div className="chords-grid">
        {chords.map((ch, i) => (
          <div key={i} className="chord-card">
            <div className="degree">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}</div>
            <div className="chord-notes">{ch.join(' - ')}</div>
            <button onClick={() => playChord(ch, { style: playStyle })}>Play</button>
          </div>
        ))}
      </div>

      <footer>
        <small>Tip: use headphones 🎧 This demo uses Tone.js for synthesis.</small>
      </footer>
    </div>
  );
}

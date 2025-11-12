import React, { useState } from 'react';
import * as Tone from 'tone';
import './styles.css';

// --- Constants ---
const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// Key signatures for flats and sharps (major and minor)
const FLAT_KEYS = ['F','Bb','Eb','Ab','Db','Gb','Cb',
                   'Dminor','Gminor','Cminor','Fminor','Bbminor','Ebminor','Abminor'];
const SHARP_KEYS = ['G','D','A','E','B','F#','C#',
                    'Eminor','Bminor','F#minor','C#minor','G#minor','D#minor','A#minor'];

const SCALE_TYPES = [
  { value: 'major', label: 'Major', intervals: [2, 2, 1, 2, 2, 2, 1] },
  { value: 'minor', label: 'Natural Minor', intervals: [2, 1, 2, 2, 1, 2, 2] },
  { value: 'harmonicMinor', label: 'Harmonic Minor', intervals: [2, 1, 2, 2, 1, 3, 1] },
  { value: 'melodicMinor', label: 'Melodic Minor', intervals: [2, 1, 2, 2, 2, 2, 1] },
];

const INSTRUMENTS = ['Synth', 'AMSynth', 'FMSynth', 'DuoSynth', 'PluckSynth'];

const SYNTH_TYPES = {
  Synth: Tone.Synth,
  AMSynth: Tone.AMSynth,
  FMSynth: Tone.FMSynth,
  DuoSynth: Tone.DuoSynth,
  PluckSynth: Tone.PluckSynth,
};

// --- App Component ---
export default function App() {
  const [root, setRoot] = useState('C');
  const [scale, setScale] = useState('major');
  const [instrument, setInstrument] = useState('Synth');
  const [playStyle, setPlayStyle] = useState('sustained');

  // --- Compute scale notes with correct enharmonics ---
  function getScaleNotes(root, intervals, scaleType) {
    const keyName = scaleType.includes('minor') ? root + 'minor' : root;
    const useFlats = FLAT_KEYS.includes(keyName);
    const NOTES = useFlats ? NOTES_FLAT : NOTES_SHARP;
    const rootIndex = NOTES.indexOf(root);
    const notes = [root];
    let idx = rootIndex;
    for (let step of intervals) {
      idx = (idx + step) % NOTES.length;
      notes.push(NOTES[idx]);
    }
    return notes.slice(0, -1); // remove duplicate octave
  }

  const scaleData = SCALE_TYPES.find(s => s.value === scale);
  const scaleNotes = getScaleNotes(root, scaleData.intervals, scale);

  // --- Build correct diatonic triads ---
  function buildChords(scaleNotes) {
    const chords = [];
    const n = scaleNotes.length; // 7 notes
    for (let i = 0; i < n; i++) {
      const rootNote = scaleNotes[i];
      const thirdNote = scaleNotes[(i + 2) % n];
      const fifthNote = scaleNotes[(i + 4) % n];
      chords.push([rootNote, thirdNote, fifthNote]);
    }
    return chords;
  }

  const chords = buildChords(scaleNotes);

  // --- Map chord to playable pitches across octaves ---
  function getPitchNotes(triad) {
    return [
      `${triad[0]}3`,
      `${triad[1]}4`,
      `${triad[2]}4`,
    ];
  }

  // --- Play chord ---
  async function playChord(triad, opts = { style: 'sustained', instrument: 'Synth' }) {
    await Tone.start();
    const now = Tone.now();

    const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
    const chorus = new Tone.Chorus(4, 2.5, 0.3).start();
    const delay = new Tone.FeedbackDelay('8n', 0.25);

    const ChosenSynth = SYNTH_TYPES[opts.instrument];
    let synth;
    if (opts.instrument === 'DuoSynth') {
      synth = new Tone.DuoSynth().chain(chorus, delay, reverb, Tone.Destination);
    } else {
      synth = new Tone.PolySynth(ChosenSynth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 1.2 },
      }).chain(chorus, delay, reverb, Tone.Destination);
    }

    const pitchNotes = getPitchNotes(triad);
    const orderedNotes = [...pitchNotes].sort(
      (a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi()
    );

    if (opts.style === 'sustained') {
      synth.triggerAttackRelease(orderedNotes, '2n', now);
    } else if (opts.style === 'arpeggiated') {
      orderedNotes.forEach((n, i) =>
        synth.triggerAttackRelease(n, '8n', now + i * 0.4)
      );
    } else if (opts.style === 'strummed') {
      orderedNotes.forEach((n, i) =>
        synth.triggerAttackRelease(n, '4n', now + i * 0.07)
      );
    }
  }

  return (
    <div className="container">
      <h1 className="title">🎵 Chord Scale Player</h1>

      <div className="controls">
        <label>
          Root:
          <select value={root} onChange={e => setRoot(e.target.value)}>
            {[...new Set([...NOTES_SHARP, ...NOTES_FLAT])].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label>
          Scale:
          <select value={scale} onChange={e => setScale(e.target.value)}>
            {SCALE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>

        <label>
          Instrument:
          <select value={instrument} onChange={e => setInstrument(e.target.value)}>
            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>

        <label>
          Play Style:
          <select value={playStyle} onChange={e => setPlayStyle(e.target.value)}>
            <option value="sustained">Sustained</option>
            <option value="arpeggiated">Arpeggiated</option>
            <option value="strummed">Strummed</option>
          </select>
        </label>
      </div>

      <div className="scale-display">
        <h2>{root} — {scaleData.label}</h2>
        <div className="notes">
          {scaleNotes.map((n, i) => <span key={i} className="note">{n}</span>)}
        </div>
      </div>

      <div className="chords-grid">
        {chords.map((c, i) => (
          <div key={i} className="chord-card">
            <div className="degree">{['I','II','III','IV','V','VI','VII'][i]}</div>
            <div className="chord-notes">{c.join(' - ')}</div>
            <button onClick={() => playChord(c, { style: playStyle, instrument })}>Play</button>
          </div>
        ))}
      </div>

      <footer>
        <small>Tip: use headphones 🎧. Powered by Tone.js</small>
      </footer>
    </div>
  );
}

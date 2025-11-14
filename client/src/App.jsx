import React, { useState } from 'react';
import * as Tone from 'tone';

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

// --- Intro Screen Component ---
function IntroScreen({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: '2rem'
    }}>
      <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 7s ease-in-out infinite' }}>♪</div>
      <div style={{ position: 'absolute', top: '25%', right: '15%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 6s ease-in-out infinite 1s' }}>♫</div>
      <div style={{ position: 'absolute', bottom: '20%', left: '20%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 8s ease-in-out infinite 2s' }}>♪</div>
      <div style={{ position: 'absolute', top: '60%', right: '25%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 7.5s ease-in-out infinite 0.5s' }}>♫</div>
      <div style={{ position: 'absolute', top: '40%', left: '5%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 6.5s ease-in-out infinite 1.5s' }}>♪</div>
      <div style={{ position: 'absolute', bottom: '30%', right: '10%', fontSize: '3rem', color: 'rgba(255,255,255,0.7)', animation: 'float 7s ease-in-out infinite 2.5s' }}>♫</div>
      
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '3px 3px 6px rgba(0,0,0,0.2), 0 0 25px rgba(255,255,255,0.4)',
          animation: 'fadeIn 1s ease-out'
        }}>
          Welcome to Chordially
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: 'rgba(255,255,255,0.95)',
          marginBottom: '3rem',
          fontWeight: 300,
          letterSpacing: '1px'
        }}>
          A Webpage by Rhea Pathak
        </p>
        <button 
          onClick={onStart}
          style={{
            padding: '1.2rem 3rem',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(245,87,108,0.4)',
            transition: 'all 0.3s ease',
            animation: 'pulse 2s ease-in-out infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = '0 12px 35px rgba(245,87,108,0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 8px 25px rgba(245,87,108,0.4)';
          }}
        >
          Start Making Music
        </button>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

// --- App Component ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
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

    // Clean up audio nodes after sound finishes
    setTimeout(() => {
      synth.dispose();
      reverb.dispose();
      chorus.dispose();
      delay.dispose();
    }, 3000);
  }

  if (showIntro) {
    return <IntroScreen onStart={() => setShowIntro(false)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <h1 style={{
        textAlign: 'center',
        color: 'white',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        🎵 Chord Scale Player
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', color: 'white', fontWeight: 600 }}>
          Root:
          <select value={root} onChange={e => setRoot(e.target.value)} style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            {[...new Set([...NOTES_SHARP, ...NOTES_FLAT])].map(n => (
              <option key={n} value={n} style={{ background: '#5a67d8' }}>{n}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', color: 'white', fontWeight: 600 }}>
          Scale:
          <select value={scale} onChange={e => setScale(e.target.value)} style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            {SCALE_TYPES.map(s => <option key={s.value} value={s.value} style={{ background: '#5a67d8' }}>{s.label}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', color: 'white', fontWeight: 600 }}>
          Instrument:
          <select value={instrument} onChange={e => setInstrument(e.target.value)} style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            {INSTRUMENTS.map(i => <option key={i} value={i} style={{ background: '#5a67d8' }}>{i}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', color: 'white', fontWeight: 600 }}>
          Play Style:
          <select value={playStyle} onChange={e => setPlayStyle(e.target.value)} style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            <option value="sustained" style={{ background: '#5a67d8' }}>Sustained</option>
            <option value="arpeggiated" style={{ background: '#5a67d8' }}>Arpeggiated</option>
            <option value="strummed" style={{ background: '#5a67d8' }}>Strummed</option>
          </select>
        </label>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2rem' }}>
          {root} — {scaleData.label}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {scaleNotes.map((n, i) => (
            <span key={i} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {chords.map((c, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ffd700',
              marginBottom: '0.5rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {['I','II','III','IV','V','VI','VII'][i]}
            </div>
            <div style={{
              color: 'white',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              fontWeight: 500
            }}>
              {c.join(' - ')}
            </div>
            <button 
              onClick={() => playChord(c, { style: playStyle, instrument })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
            >
              Play
            </button>
          </div>
        ))}
      </div>

      <footer style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '2rem', padding: '1rem' }}>
        <small style={{ fontSize: '0.9rem' }}>Tip: use headphones 🎧. Powered by Tone.js</small>
      </footer>
      </div>
    </div>
  );
}
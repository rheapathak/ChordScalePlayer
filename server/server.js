const express = require('express');
// Music theory utilities copied from client to keep API logic consistent
const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function indexOfNote(n){
    // normalize flats to sharps (simple handling)
    const map = {Db:'C#',Eb:'D#',Gb:'F#',Ab:'G#',Bb:'A#'};
    if(map[n]) n = map[n];
    return SEMITONES.indexOf(n);
}


function buildScale(root, scaleType){
// steps in semitones for common scales
    const patterns = {
    major: [2,2,1,2,2,2,1],
    natural_minor: [2,1,2,2,1,2,2],
    harmonic_minor: [2,1,2,2,1,3,1],
    melodic_minor_asc: [2,1,2,2,2,2,1]
    };
    const pat = patterns[scaleType];
    if(!pat) return null;
    const start = indexOfNote(root);
    if(start === -1) return null;
    const notes = [SEMITONES[start]];
    let idx = start;
    for(const step of pat){
        idx = (idx + step) % 12;
        notes.push(SEMITONES[idx]);
    }
    notes.pop(); // last repeats root octave
    return notes;
}


function buildDiatonicChords(scaleNotes){
    // triads in each degree: root + 2nd step (third) + 4th step (fifth)
    const chords = [];
    for(let i=0;i<7;i++){
    const root = scaleNotes[i];
    const third = scaleNotes[(i+2)%7];
    const fifth = scaleNotes[(i+4)%7];
    chords.push([root, third, fifth]);
    }
    return chords;
}


app.get('/api/scale', (req, res)=>{
    const root = req.query.root || 'C';
    const scale = req.query.scale || 'major';
    const scaleNotes = buildScale(root, scale);
    if(!scaleNotes) return res.status(400).json({error:'unknown scale type or root'});
    const chords = buildDiatonicChords(scaleNotes);
    res.json({root, scale, scaleNotes, chords});
});


// Serve static client build (if deployed)
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));
app.get('*', (req,res)=>{
    res.sendFile(path.join(clientBuildPath,'index.html'));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Server listening ${PORT}`));
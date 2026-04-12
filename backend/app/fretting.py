from typing import List, Dict

STRING_PITCHES = [40, 45, 50, 55, 59, 64]  # E2, A2, D3, G3, B3, E4
MAX_FRET = 19

def midi_to_guitar_notes(note_events) -> List[Dict]:
    melody = []
    for note in note_events:
        pitch = note.pitch
        start_time = note.start_time
        duration = note.end_time - note.start_time
        
        best_string = -1
        best_fret = -1
        min_fret = MAX_FRET + 1
        
        for string_idx, open_pitch in enumerate(STRING_PITCHES, 1):
            fret = pitch - open_pitch
            if 0 <= fret <= MAX_FRET:
                if fret < min_fret:
                    min_fret = fret
                    best_string = string_idx
                    best_fret = fret
        
        if best_string == -1:
            continue
        
        melody.append({
            "string": best_string,
            "fret": best_fret,
            "timestamp": round(start_time, 2),
            "duration": round(duration, 2)
        })
    return melody
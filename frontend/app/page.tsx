const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsScanning(true);
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    
    let notes;
    try {
      // Try using tablature-parser
      notes = Tablature.parse(text);
    } catch (parseError) {
      // Fallback: simple extraction of numbers from lines like "B|--0--2--"
      console.warn('tablature-parser failed, using fallback');
      const lines = text.split('\n');
      const fallbackNotes: MelodyNote[] = [];
      lines.forEach(line => {
        const match = line.match(/^([eEaAdDgGbB])\|(.*)$/);
        if (match) {
          const stringChar = match[1];
          const stringNum = stringNameToNumber[stringChar];
          if (stringNum) {
            const fretMatches = match[2].match(/\d+/g);
            if (fretMatches) {
              fretMatches.forEach(fretStr => {
                const fret = parseInt(fretStr);
                if (!isNaN(fret)) {
                  fallbackNotes.push({
                    string: stringNum,
                    fret,
                    timestamp: editMelody.length + fallbackNotes.length * 0.5,
                  });
                }
              });
            }
          }
        }
      });
      notes = [fallbackNotes]; // Adapt to expected structure
    }

    const scannedMelody: MelodyNote[] = [];
    // Handle both library output and fallback structure
    if (Array.isArray(notes)) {
      notes.forEach((row: any) => {
        if (Array.isArray(row)) {
          row.forEach((note: any) => {
            scannedMelody.push({
              string: note.s + 1,
              fret: note.f,
              timestamp: editMelody.length + scannedMelody.length * 0.5,
            });
          });
        } else if (row.string !== undefined) {
          // Already in our format from fallback
          scannedMelody.push(row);
        }
      });
    }

    if (scannedMelody.length > 0) {
      const combined = [...editMelody, ...scannedMelody].sort((a, b) => a.timestamp - b.timestamp);
      setEditMelody(combined);
      setMelodyText(combined.map(m => `${m.string} ${m.fret} ${formatTime(m.timestamp)}`).join('\n'));
    } else {
      alert('No tablature found in the image.');
    }
  } catch (error) {
    console.error('OCR or parsing failed:', error);
    alert('Could not read a guitar tab from the image. Make sure the photo is clear.');
  } finally {
    setIsScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};
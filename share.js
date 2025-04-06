// Share Progress Module

const shareBtn = document.getElementById('share-progress-btn');

if (shareBtn) {
  shareBtn.onclick = async () => {
    try {
      const target = document.getElementById('comparison-chart-container');
      if (!target) {
        alert('Nothing to share!');
        return;
      }
      const canvas = await html2canvas(target, { backgroundColor: null, scale: 2 });
      canvas.toBlob(blob => {
        if (!blob) return;
        const file = new File([blob], 'progress.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'My Habit Progress',
            text: 'Check out my habit streaks on ChainTrack!'
          }).catch(console.error);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'progress.png';
          a.click();
          URL.revokeObjectURL(url);
          alert('Image saved. Share it manually!');
        }
      }, 'image/png');
    } catch (e) {
      console.error('Share failed:', e);
      alert('Failed to capture or share progress.');
    }
  };
}

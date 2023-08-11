const canvas = document.getElementById('visualizer');
const volumeCtr = document.querySelector('.volume-ctr');

const ctx = canvas.getContext('2d');

const audioElement = new Audio('tala-al.mp3');

const initializeAudio = async () => {
  // Create an analyser node
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  volumeCtr.addEventListener('input', (ev) => {
    audioElement.volume = ev.target.value / 100;
  });

  audioElement.volume = volumeCtr.value / 100;
  await audioElement.play();

  const audioSource = audioContext.createMediaElementSource(audioElement);
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);

  const barWidth = canvas.width / bufferLength;
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Visualizer animation function
  function draw() {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const r = barHeight + 25 * (i / bufferLength);
      const g = 250 * (i / bufferLength);
      const b = 50;
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight,
        barWidth,
        barHeight
      );
    }

    requestAnimationFrame(draw);
  }

  draw();
};

// Play button click event
const playButton = document.getElementById('playButton');

playButton.addEventListener('click', async () => {
  await initializeAudio();
  playButton.disabled = true;
});

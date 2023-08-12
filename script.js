let audioContext;
let analyser;
const volumeCtr = document.querySelector('.volume-ctr');
const dataArray = new Uint8Array(256);
let audioElement;

const barObjects = [];
let selectedAudio = '';

async function initializeAudio(audioSrc) {
  if (audioContext) {
    audioContext.close();
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  audioElement = new Audio(audioSrc);
  const audioSource = audioContext.createMediaElementSource(audioElement);
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);

  await audioElement.play();
  audioElement.volume = volumeCtr.value / 100;

  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');

  volumeCtr.addEventListener('input', (ev) => {
    audioElement.volume = ev.target.value / 100;
  });
  const barHeights = Array(dataArray.length).fill(0);

  function draw() {
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zeros = dataArray.filter((v) => v === 0);
    const barWidth = canvas.width / (dataArray.length - zeros.length);

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i];
      const hue = (240 * i) / dataArray.length; // Generate hue value
      const color = `hsl(${hue}, 100%, ${barHeight / 3}%)`;
      ctx.fillStyle = color;

      barHeights[i] = Math.max(barHeights[i] - 0.5, barHeight);

      // Drawing the bar
      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeights[i],
        barWidth - 2,
        barHeights[i]
      );
    }

    requestAnimationFrame(draw);
  }

  draw();
}

const audioInput = document.getElementById('audioInput');
audioInput.addEventListener('change', (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    selectedAudio = selectedFile;
    updateSelectedAudioName();
    playButton.disabled = false;
  }
});

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', async () => {
  if (selectedAudio) {
    const audioSrc = URL.createObjectURL(selectedAudio);
    await initializeAudio(audioSrc);
    playButton.disabled = true;
    stopButton.disabled = false;
  }
});

const stopButton = document.getElementById('stopButton');
stopButton.addEventListener('click', () => {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    stopButton.disabled = true;
    playButton.disabled = false;
  }
});

const playDefaultButton = document.getElementById('playDefaultButton');
playDefaultButton.addEventListener('click', () => {
  initializeAudio('tala-al.mp3');
  playButton.disabled = true;
  stopButton.disabled = false;
});

function updateSelectedAudioName() {
  const selectedAudioNameElement = document.getElementById(
    'selected-audio-name'
  );
  selectedAudioNameElement.textContent = selectedAudio.name;
}

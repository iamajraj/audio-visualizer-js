let audioContext;
let analyser;
const volumeCtr = document.querySelector('.volume-ctr');
const dataArray = new Uint8Array(256);
let audioElement;

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

  function draw() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const zeros = dataArray.filter((v) => v === 0);
    const barWidth = canvas.width / (dataArray.length - zeros.length);

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i];
      const r = barHeight + 25 * (i / dataArray.length);
      const g = 250 * (i / dataArray.length);
      const b = 50;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
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

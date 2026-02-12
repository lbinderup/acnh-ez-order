const TARGET_PHRASE = "amazing machine";
const SCAN_INTERVAL_MS = 2200;

const startButton = document.getElementById("start-ocr");
const stopButton = document.getElementById("stop-ocr");
const statusElement = document.getElementById("ocr-status");
const logElement = document.getElementById("ocr-log");
const videoElement = document.getElementById("ocr-video");
const canvasElement = document.getElementById("ocr-canvas");

let cameraStream = null;
let scanIntervalId = null;
let scanInProgress = false;

function setStatus(message, hasMatch = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("match", hasMatch);
}

function prependLogEntry(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  logElement.prepend(item);
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access is not supported on this browser.");
  }

  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  videoElement.srcObject = cameraStream;
  await videoElement.play();
}

async function scanFrame() {
  if (scanInProgress || !videoElement.videoWidth || !videoElement.videoHeight) {
    return;
  }

  scanInProgress = true;

  const ctx = canvasElement.getContext("2d", { willReadFrequently: true });
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  try {
    const result = await Tesseract.recognize(canvasElement, "eng");
    const rawText = result.data.text || "";
    const normalized = rawText.toLowerCase().replace(/\s+/g, " ").trim();
    const hasMatch = normalized.includes(TARGET_PHRASE);

    if (hasMatch) {
      setStatus('✅ Found "Amazing machine" in camera feed.', true);
      prependLogEntry('Match found for "Amazing machine".');
    } else {
      setStatus('Scanning... phrase not found yet.');
      prependLogEntry("No match in this frame.");
    }
  } catch (error) {
    setStatus(`OCR error: ${error.message}`);
    prependLogEntry(`OCR error: ${error.message}`);
  } finally {
    scanInProgress = false;
  }
}

function stopScan() {
  if (scanIntervalId) {
    clearInterval(scanIntervalId);
    scanIntervalId = null;
  }

  if (cameraStream) {
    for (const track of cameraStream.getTracks()) {
      track.stop();
    }
    cameraStream = null;
  }

  videoElement.srcObject = null;
  scanInProgress = false;

  startButton.disabled = false;
  stopButton.disabled = true;
  setStatus("Stopped.");
}

async function startScan() {
  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus("Starting camera...");

  try {
    await startCamera();
    setStatus("Camera active. Scanning every ~2 seconds...");
    await scanFrame();
    scanIntervalId = setInterval(scanFrame, SCAN_INTERVAL_MS);
  } catch (error) {
    setStatus(`Unable to start: ${error.message}`);
    prependLogEntry(`Unable to start scanner: ${error.message}`);
    stopScan();
  }
}

startButton.addEventListener("click", startScan);
stopButton.addEventListener("click", stopScan);
window.addEventListener("beforeunload", stopScan);

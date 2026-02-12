const SCAN_INTERVAL_MS = 2200;
const ROI_WIDTH_RATIO = 0.84;
const ROI_HEIGHT_RATIO = 0.26;
const ACTIVE_LOOKAHEAD_COUNT = 14;

const AUTHORITATIVE_ITEMS = [
  "Amazing machine",
  "Anthurium plant",
  "Arcade combat game",
  "Book stands",
  "Candy machine",
  "Cat grass",
  "Coffee cup",
  "Desktop computer",
  "Digital alarm clock",
  "Double sofa",
  "Fan palm",
  "Floor light",
  "Fragrance diffuser",
  "Garden lantern",
  "Handcart",
  "Ironwood dresser",
  "Knife block",
  "Menu chalkboard",
  "Microwave",
  "Monstera",
  "Mug",
  "Paper lantern",
  "Pet bed",
  "Portable record player",
  "Rattan low table",
  "Refrigerator",
  "Rice cooker",
  "Simple panel",
  "Stand mixer",
  "Table setting",
  "Tea set",
  "Throwback race-car bed",
  "Toaster",
  "Tool cart",
  "Traditional tea set",
  "Wall-mounted TV (50 in.)",
  "Water cooler",
  "Wood-burning stove",
  "Yucca",
].sort((a, b) => a.localeCompare(b));

const startButton = document.getElementById("start-ocr");
const stopButton = document.getElementById("stop-ocr");
const statusElement = document.getElementById("ocr-status");
const logElement = document.getElementById("ocr-log");
const videoElement = document.getElementById("ocr-video");
const canvasElement = document.getElementById("ocr-canvas");
const checklistElement = document.getElementById("ocr-checklist");
const progressElement = document.getElementById("ocr-progress");
const windowElement = document.getElementById("ocr-window");
const preprocessToggleElement = document.getElementById("ocr-preprocess");
const contrastSliderElement = document.getElementById("ocr-contrast");
const thresholdSliderElement = document.getElementById("ocr-threshold");
const contrastValueElement = document.getElementById("ocr-contrast-value");
const thresholdValueElement = document.getElementById("ocr-threshold-value");

let cameraStream = null;
let scanIntervalId = null;
let scanInProgress = false;

const normalizedItems = AUTHORITATIVE_ITEMS.map((name, index) => ({
  index,
  name,
  normalized: normalizeText(name),
}));
const checkedIndices = new Set();
let alphabeticalCursor = 0;

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function setStatus(message, hasMatch = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("match", hasMatch);
}

function prependLogEntry(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  logElement.prepend(item);
}

function renderChecklist() {
  checklistElement.textContent = "";

  for (const item of normalizedItems) {
    const row = document.createElement("li");
    const isChecked = checkedIndices.has(item.index);
    row.className = "ocr-checklist-item";
    row.classList.toggle("is-checked", isChecked);
    row.classList.toggle("is-cursor", item.index === alphabeticalCursor);
    row.textContent = `${isChecked ? "✅" : "⬜"} ${item.name}`;
    checklistElement.append(row);
  }

  progressElement.textContent = `${checkedIndices.size}/${normalizedItems.length} checked`;

  if (alphabeticalCursor >= normalizedItems.length) {
    windowElement.textContent = "All items scanned.";
    return;
  }

  const lastIndex = Math.min(normalizedItems.length - 1, alphabeticalCursor + ACTIVE_LOOKAHEAD_COUNT);
  windowElement.textContent = `Active scan window: ${normalizedItems[alphabeticalCursor].name} → ${normalizedItems[lastIndex].name}`;
}

function updateAlphabeticalCursor() {
  while (checkedIndices.has(alphabeticalCursor) && alphabeticalCursor < normalizedItems.length) {
    alphabeticalCursor += 1;
  }
}

function levenshteinDistance(a, b) {
  if (a === b) {
    return 0;
  }

  const prev = new Array(b.length + 1);
  const next = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) {
    prev[j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    next[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(next[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }

    for (let j = 0; j <= b.length; j += 1) {
      prev[j] = next[j];
    }
  }

  return prev[b.length];
}

function isCloseMatch(candidate, target) {
  if (!candidate || !target) {
    return false;
  }

  if (candidate.includes(target) || target.includes(candidate)) {
    return true;
  }

  const distance = levenshteinDistance(candidate, target);
  const maxAllowedDistance = Math.max(1, Math.floor(target.length * 0.15));
  return distance <= maxAllowedDistance;
}

function extractCandidatePhrases(rawText) {
  const candidates = new Set();
  const lines = rawText.split(/\n+/);

  for (const line of lines) {
    const normalizedLine = normalizeText(line);
    if (!normalizedLine) {
      continue;
    }

    candidates.add(normalizedLine);

    const words = normalizedLine.split(" ").filter(Boolean);
    for (let start = 0; start < words.length; start += 1) {
      for (let length = 2; length <= 5 && start + length <= words.length; length += 1) {
        candidates.add(words.slice(start, start + length).join(" "));
      }
    }
  }

  return [...candidates];
}

function findMatchingItem(rawText) {
  const candidates = extractCandidatePhrases(rawText);
  if (!candidates.length || alphabeticalCursor >= normalizedItems.length) {
    return null;
  }

  const endIndex = Math.min(normalizedItems.length - 1, alphabeticalCursor + ACTIVE_LOOKAHEAD_COUNT);

  for (let i = alphabeticalCursor; i <= endIndex; i += 1) {
    if (checkedIndices.has(i)) {
      continue;
    }

    const item = normalizedItems[i];
    for (const candidate of candidates) {
      if (isCloseMatch(candidate, item.normalized)) {
        return item;
      }
    }
  }

  return null;
}

function getPreprocessSettings() {
  const contrast = Number.parseFloat(contrastSliderElement.value);
  const threshold = Number.parseInt(thresholdSliderElement.value, 10);

  return {
    enabled: preprocessToggleElement.checked,
    contrast: Number.isFinite(contrast) ? contrast : 1.8,
    threshold: Number.isFinite(threshold) ? threshold : 145,
  };
}

function updatePreprocessLabels() {
  const { contrast, threshold } = getPreprocessSettings();
  contrastValueElement.textContent = `${contrast.toFixed(1)}×`;
  thresholdValueElement.textContent = `${threshold}`;
}

function getRoiRect(sourceWidth, sourceHeight) {
  const roiWidth = Math.max(1, Math.floor(sourceWidth * ROI_WIDTH_RATIO));
  const roiHeight = Math.max(1, Math.floor(sourceHeight * ROI_HEIGHT_RATIO));

  return {
    x: Math.floor((sourceWidth - roiWidth) / 2),
    y: Math.floor((sourceHeight - roiHeight) / 2),
    width: roiWidth,
    height: roiHeight,
  };
}

function preprocessCanvasPixels(ctx, width, height, settings) {
  if (!settings.enabled) {
    return;
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    const contrasted = (grayscale - 128) * settings.contrast + 128;
    const binary = contrasted >= settings.threshold ? 255 : 0;

    pixels[i] = binary;
    pixels[i + 1] = binary;
    pixels[i + 2] = binary;
    pixels[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
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
  const sourceWidth = videoElement.videoWidth;
  const sourceHeight = videoElement.videoHeight;
  const roiRect = getRoiRect(sourceWidth, sourceHeight);

  canvasElement.width = roiRect.width;
  canvasElement.height = roiRect.height;
  ctx.drawImage(
    videoElement,
    roiRect.x,
    roiRect.y,
    roiRect.width,
    roiRect.height,
    0,
    0,
    roiRect.width,
    roiRect.height,
  );

  const preprocessSettings = getPreprocessSettings();
  preprocessCanvasPixels(ctx, roiRect.width, roiRect.height, preprocessSettings);

  try {
    const result = await Tesseract.recognize(canvasElement, "eng", {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
    });
    const rawText = result.data.text || "";
    const match = findMatchingItem(rawText);

    if (match) {
      checkedIndices.add(match.index);
      updateAlphabeticalCursor();
      renderChecklist();
      setStatus(`✅ Matched catalog item: ${match.name}`, true);
      prependLogEntry(`Marked collected: ${match.name}`);
    } else {
      setStatus("Scanning inside highlighted rectangle... no new matches yet.");
      prependLogEntry("No new item match in this frame.");
    }

    if (alphabeticalCursor >= normalizedItems.length) {
      setStatus("✅ All authoritative items are checked.", true);
      stopScan();
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

  if (alphabeticalCursor >= normalizedItems.length) {
    setStatus("✅ Complete. All authoritative items checked.", true);
  } else {
    setStatus("Stopped.");
  }
}

async function startScan() {
  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus("Starting camera...");

  try {
    await startCamera();
    setStatus("Camera active. Scanning inside highlighted rectangle...");
    await scanFrame();
    scanIntervalId = setInterval(scanFrame, SCAN_INTERVAL_MS);
  } catch (error) {
    setStatus(`Unable to start: ${error.message}`);
    prependLogEntry(`Unable to start scanner: ${error.message}`);
    stopScan();
  }
}

renderChecklist();
updatePreprocessLabels();
startButton.addEventListener("click", startScan);
stopButton.addEventListener("click", stopScan);
contrastSliderElement.addEventListener("input", updatePreprocessLabels);
thresholdSliderElement.addEventListener("input", updatePreprocessLabels);
window.addEventListener("beforeunload", stopScan);

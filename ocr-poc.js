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
const minConfidenceSliderElement = document.getElementById("ocr-min-confidence");
const debugModeToggleElement = document.getElementById("ocr-debug-mode");
const contrastValueElement = document.getElementById("ocr-contrast-value");
const thresholdValueElement = document.getElementById("ocr-threshold-value");
const minConfidenceValueElement = document.getElementById("ocr-min-confidence-value");

let cameraStream = null;
let scanIntervalId = null;
let scanInProgress = false;
let orientationChangeHandler = null;

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

function getMinConfidenceThreshold() {
  const threshold = Number.parseInt(minConfidenceSliderElement.value, 10);
  return Number.isFinite(threshold) ? threshold : 62;
}

function isDebugModeEnabled() {
  return debugModeToggleElement.checked;
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

function extractCandidatePhrasesFromWords(words, minConfidence) {
  const candidates = new Set();
  const highConfidenceWords = (words || [])
    .filter((word) => (word.confidence ?? 0) >= minConfidence)
    .map((word) => normalizeText(word.text))
    .filter(Boolean);

  for (let start = 0; start < highConfidenceWords.length; start += 1) {
    for (let length = 1; length <= 5 && start + length <= highConfidenceWords.length; length += 1) {
      candidates.add(highConfidenceWords.slice(start, start + length).join(" "));
    }
  }

  return [...candidates];
}

function scoreCandidateAgainstTarget(candidate, target) {
  if (!candidate || !target) {
    return 0;
  }

  if (candidate === target) {
    return 1;
  }

  const distance = levenshteinDistance(candidate, target);
  const maxLen = Math.max(candidate.length, target.length);
  return Math.max(0, 1 - distance / Math.max(1, maxLen));
}

function findMatchingItem(result) {
  const rawText = result.data.text || "";
  const minConfidence = getMinConfidenceThreshold();
  const rawTextCandidates = extractCandidatePhrases(rawText);
  const wordCandidates = extractCandidatePhrasesFromWords(result.data.words || [], minConfidence);
  const candidates = [...new Set([...wordCandidates, ...rawTextCandidates])];

  if (!candidates.length || alphabeticalCursor >= normalizedItems.length) {
    return { match: null, debug: { candidates: [], best: null, avgConfidence: 0 } };
  }

  const endIndex = Math.min(normalizedItems.length - 1, alphabeticalCursor + ACTIVE_LOOKAHEAD_COUNT);
  const debugScored = [];
  let best = null;

  for (let i = alphabeticalCursor; i <= endIndex; i += 1) {
    if (checkedIndices.has(i)) {
      continue;
    }

    const item = normalizedItems[i];
    for (const candidate of candidates) {
      const similarity = scoreCandidateAgainstTarget(candidate, item.normalized);
      const scored = { item, candidate, similarity };
      debugScored.push(scored);

      if (!best || similarity > best.similarity) {
        best = scored;
      }

      if (isCloseMatch(candidate, item.normalized) && similarity >= 0.85) {
        return {
          match: item,
          debug: {
            candidates,
            best: scored,
            avgConfidence: getAverageWordConfidence(result.data.words || []),
          },
        };
      }
    }
  }

  return {
    match: null,
    debug: {
      candidates,
      best,
      avgConfidence: getAverageWordConfidence(result.data.words || []),
      topScored: debugScored.sort((a, b) => b.similarity - a.similarity).slice(0, 5),
    },
  };
}

function getAverageWordConfidence(words) {
  if (!words.length) {
    return 0;
  }

  const total = words.reduce((sum, word) => sum + (word.confidence ?? 0), 0);
  return total / words.length;
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
  minConfidenceValueElement.textContent = `${getMinConfidenceThreshold()}%`;
}

async function lockLandscapeOrientation() {
  if (!screen.orientation?.lock) {
    prependLogEntry("Orientation lock unsupported in this browser.");
    return;
  }

  try {
    await screen.orientation.lock("landscape");
  } catch (error) {
    prependLogEntry(`Unable to lock landscape orientation: ${error.message}`);
  }
}

function watchOrientationChanges() {
  if (orientationChangeHandler) {
    return;
  }

  orientationChangeHandler = async () => {
    if (window.matchMedia("(orientation: portrait)").matches) {
      prependLogEntry("Detected portrait orientation while scanning; trying to relock landscape.");
      await lockLandscapeOrientation();
    }
  };

  window.addEventListener("orientationchange", orientationChangeHandler);
  window.addEventListener("resize", orientationChangeHandler);
}

function stopWatchingOrientationChanges() {
  if (!orientationChangeHandler) {
    return;
  }

  window.removeEventListener("orientationchange", orientationChangeHandler);
  window.removeEventListener("resize", orientationChangeHandler);
  orientationChangeHandler = null;
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
      aspectRatio: { ideal: 16 / 9, min: 1.3 },
      resizeMode: "crop-and-scale",
    },
    audio: false,
  });

  videoElement.srcObject = cameraStream;
  await videoElement.play();

  await lockLandscapeOrientation();
  watchOrientationChanges();
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
    const { match, debug } = findMatchingItem(result);
    const avgConfidenceText = `avg word confidence ${debug.avgConfidence.toFixed(1)}%`;

    if (match) {
      checkedIndices.add(match.index);
      updateAlphabeticalCursor();
      renderChecklist();
      setStatus(`✅ Matched catalog item: ${match.name}`, true);
      prependLogEntry(`Marked collected: ${match.name} (${avgConfidenceText})`);
    } else {
      setStatus("Scanning inside highlighted rectangle... no new matches yet.");
      prependLogEntry(`No new item match in this frame (${avgConfidenceText}).`);
    }

    if (isDebugModeEnabled()) {
      const bestDebugText = debug.best
        ? `best="${debug.best.candidate}" -> "${debug.best.item.name}" (${(debug.best.similarity * 100).toFixed(1)}% similarity)`
        : "best=no candidate";
      prependLogEntry(`DEBUG: ${bestDebugText}; threshold=${getMinConfidenceThreshold()}%`);
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

  stopWatchingOrientationChanges();

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
minConfidenceSliderElement.addEventListener("input", updatePreprocessLabels);
window.addEventListener("beforeunload", stopScan);

import { createWorker } from "https://cdn.jsdelivr.net/npm/emoji-particle@0.0.4/+esm";

const playPanel = document.getElementById("playPanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const answer = document.getElementById("answer");
const romaNode = document.getElementById("roma");
const japanese = document.getElementById("japanese");
const choices = document.getElementById("choices");
const gradeOption = document.getElementById("gradeOption");
const resultNode = document.getElementById("result");
const gameTime = 180;
const mode = document.getElementById("mode");
const emojiParticle = initEmojiParticle();
const maxParticleCount = 10;
let gameTimer;
// https://dova-s.jp/bgm/play14609.html
const bgm = new Audio("mp3/bgm.mp3");
bgm.volume = 0.1;
bgm.loop = true;
let consecutiveWins = 0;
let wordsCount = 0;
let problemCount = 0;
let errorCount = 0;
let mistaken = false;
let problems = [];
let audioContext;
const audioBufferCache = {};
let englishVoices = [];
loadVoices();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") === "1") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
  if (localStorage.getItem("bgm") === "0") {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") === "1") {
    localStorage.setItem("darkMode", "0");
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", "1");
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleBGM() {
  if (localStorage.getItem("bgm") !== "0") {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
    localStorage.setItem("bgm", "0");
    bgm.pause();
  } else {
    document.getElementById("bgmOn").classList.remove("d-none");
    document.getElementById("bgmOff").classList.add("d-none");
    localStorage.setItem("bgm", "1");
    bgm.play();
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("end", "mp3/end.mp3");
    loadAudio("keyboard", "mp3/keyboard.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
    loadAudio("incorrect", "mp3/cat.mp3");
  }
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
  });
}

function loopVoice(text, n) {
  speechSynthesis.cancel();
  text = new Array(n).fill(`${text}.`).join(" ");
  const msg = new globalThis.SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

function initEmojiParticle() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    pointerEvents: "none",
    top: "0px",
    left: "0px",
  });
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  document.body.prepend(canvas);

  const offscreen = canvas.transferControlToOffscreen();
  const worker = createWorker();
  worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

  globalThis.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    worker.postMessage({ type: "resize", width, height });
  });
  return { canvas, offscreen, worker };
}

async function loadProblems() {
  const grade = gradeOption.selectedIndex + 2;
  if (grade > 0) {
    const url = "data/" + mode.textContent.toLowerCase() + "/" + grade + ".tsv";
    const response = await fetch(url);
    const tsv = await response.text();
    problems = tsv.trim().split("\n").map((line) => {
      const [en, jaStr] = line.split("\t");
      const ja = jaStr.split("|").slice(0, 3).join("\n");
      return { en: en, ja: ja };
    });
  }
}

function nextProblem() {
  for (let i = 0; i < Math.min(consecutiveWins, maxParticleCount); i++) {
    emojiParticle.worker.postMessage({
      type: "spawn",
      options: {
        particleType: "popcorn",
        originX: Math.random() * emojiParticle.canvas.width,
        originY: Math.random() * emojiParticle.canvas.height,
      },
    });
  }
  playAudio("correct", 0.3);
  wordsCount = 0;
  problemCount += 1;
  if (mistaken) {
    errorCount += 1;
  } else {
    resultNode.lastChild.classList.remove("table-danger");
  }
  mistaken = false;
  selectable();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  for (let i = array.length; 1 < i; i--) {
    const k = Math.floor(Math.random() * i);
    [array[k], array[i - 1]] = [array[i - 1], array[k]];
  }
  return array;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function selectableWordClickEvent(event) {
  const targetNode = event.target;
  if (targetNode.parentNode == romaNode) {
    if (targetNode.textContent != "　") {
      const romaChildren = [...romaNode.children];
      const choicesChildren = [...choices.children];
      const romaPos = romaChildren.findIndex((e) => e == targetNode);
      let count = 0;
      romaChildren.slice(romaPos).forEach((e) => {
        if (e.hasAttribute("data-pos")) {
          const pos = parseInt(e.dataset.pos);
          choicesChildren[pos].classList.remove("d-none");
          e.textContent = "　";
          e.removeAttribute("data-id");
          e.removeAttribute("data-pos");
          count += 1;
        }
      });
      wordsCount -= count;
    }
  } else {
    const pos = wordsCount;
    const romaChildren = [...romaNode.children];
    let roma = targetNode.textContent;
    if (pos == 0) {
      roma = capitalizeFirstLetter(roma);
    } else {
      const prev = romaChildren[pos].previousSibling;
      if (prev.nodeType == Node.TEXT_NODE) {
        switch (prev.textContent) {
          case ".":
          case "!":
          case "?":
            roma = capitalizeFirstLetter(roma);
        }
      }
    }
    romaChildren[pos].textContent = roma;
    romaChildren[pos].dataset.id = targetNode.dataset.id;
    romaChildren[pos].dataset.pos = targetNode.dataset.pos;
    targetNode.classList.add("d-none");
    wordsCount += 1;
    if (wordsCount == choices.children.length) {
      const correctAll = romaChildren.every((e, i) => {
        return e.dataset.id.split(",").some((id) => i == parseInt(id));
      });
      if (correctAll) {
        consecutiveWins += 1;
        nextProblem();
      } else {
        consecutiveWins = 0;
        mistaken = true;
        playAudio("incorrect", 0.3);
      }
    } else {
      playAudio("keyboard");
    }
  }
}

function initSelectableWord() {
  const span = document.createElement("button");
  span.className = "btn btn-light btn-lg m-1 px-2 choice";
  return span;
}
const selectableWord = initSelectableWord();

function setChoices(roma, choices) {
  const words = roma.split(/\s+/)
    .map((word) => word.replace(/([0-9a-zA-Z]+)[,.!?]$/, "$1"))
    .map((word) => {
      switch (word) {
        case "I":
        case "X":
          return word;
        default:
          return word.toLowerCase();
      }
    });
  const positions = {};
  words.forEach((word, i) => {
    if (word in positions) {
      positions[word].push(i);
    } else {
      positions[word] = [i];
    }
  });
  const indexedWords = words.map((word, _id) => {
    return { en: word, id: positions[word] };
  });
  const shuffled = shuffle(indexedWords);
  while (choices.firstChild) {
    choices.removeChild(choices.firstChild);
  }
  shuffled.forEach((word, pos) => {
    const span = selectableWord.cloneNode(true);
    span.onclick = selectableWordClickEvent;
    span.textContent = word.en;
    span.dataset.id = word.id.join(",");
    span.dataset.pos = pos;
    choices.appendChild(span);
  });
}

function setRoma(roma, romaNode) {
  while (romaNode.firstChild) {
    romaNode.removeChild(romaNode.firstChild);
  }
  roma.split(/\s+/).forEach((word) => {
    const span = selectableWord.cloneNode(true);
    span.onclick = selectableWordClickEvent;
    span.textContent = "　";
    romaNode.appendChild(span);
    if (/[0-9a-zA-Z]+[,.!?]/.test(word)) {
      const symbol = word[word.length - 1];
      const text = document.createTextNode(symbol);
      romaNode.appendChild(text);
    }
  });
}

function addResult(en, ja) {
  const tr = document.createElement("tr");
  tr.className = "table-danger";
  const enNode = document.createElement("td");
  const jaNode = document.createElement("td");
  enNode.textContent = en;
  jaNode.textContent = ja;
  enNode.className = "notranslate";
  tr.appendChild(enNode);
  tr.appendChild(jaNode);
  resultNode.appendChild(tr);
}

function selectable() {
  const problem = problems[getRandomInt(0, problems.length)];
  japanese.textContent = problem.ja;
  const roma = problem.en;
  if (mode.textContent == "EASY") {
    loopVoice(roma, 2);
  }
  answer.classList.add("d-none");
  answer.textContent = roma;
  setChoices(roma, choices);
  setRoma(roma, romaNode);
  addResult(problem.en, problem.ja);
  // resizeFontSize(aa);
}

function countdown() {
  loopVoice("Ready", 1); // unlock
  if (localStorage.getItem("bgm") == 1) bgm.play();
  countPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  infoPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  while (resultNode.firstChild) {
    resultNode.removeChild(resultNode.firstChild);
  }
  counter.textContent = 3;
  const timer = setInterval(() => {
    const counter = document.getElementById("counter");
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      wordsCount = problemCount = errorCount = 0;
      consecutiveWins = 0;
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      selectable();
      startGameTimer();
    }
  }, 1000);
}

function startGame() {
  clearInterval(gameTimer);
  initTime();
  countdown();
}

function startGameTimer() {
  const timeNode = document.getElementById("time");
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      bgm.pause();
      playAudio("end");
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function scoring() {
  document.getElementById("score").textContent = problemCount - errorCount;
  document.getElementById("count").textContent = problemCount;
}

function showAnswer() {
  answer.classList.remove("d-none");
  mistaken = true;
}

async function changeMode(event) {
  if (event.target.textContent == "EASY") {
    event.target.textContent = "HARD";
    document.getElementById("voice").disabled = true;
  } else {
    event.target.textContent = "EASY";
    document.getElementById("voice").disabled = false;
  }
  await loadProblems();
}

await loadProblems();

mode.onclick = changeMode;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleBGM").onclick = toggleBGM;
document.getElementById("startButton").onclick = startGame;
document.getElementById("answerButton").onclick = showAnswer;
document.getElementById("voice").onclick = () => {
  loopVoice(answer.textContent, 1);
};
gradeOption.addEventListener("change", async () => {
  initTime();
  clearInterval(gameTimer);
  await loadProblems();
});
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

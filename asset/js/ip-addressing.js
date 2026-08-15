/* ============================================
   Lab Maya - IP Addressing & Subnetting Module
   ============================================ */

// ============ TAB SWITCHING ============

function switchTab(tabName) {
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ip-nav-item').forEach(b => b.classList.remove('active'));

  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');

  if (tabName === 'quiz' && document.getElementById('quizContainer').innerHTML === '') {
    generateQuiz();
  }
}

// ============ IP CALCULATION ============

function getIP() {
  return [
    clamp(parseInt(document.getElementById('ip1').value) || 0, 0, 255),
    clamp(parseInt(document.getElementById('ip2').value) || 0, 0, 255),
    clamp(parseInt(document.getElementById('ip3').value) || 0, 0, 255),
    clamp(parseInt(document.getElementById('ip4').value) || 0, 0, 255)
  ];
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function cidrToMask(cidr) {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(8, Math.max(0, cidr - i * 8));
    mask.push(256 - Math.pow(2, 8 - bits));
  }
  return mask;
}

function ipToInt(octets) {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function intToIP(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ];
}

function toBinary(octet) {
  return octet.toString(2).padStart(8, '0');
}

function getIPClass(firstOctet) {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  return 'E';
}

function isPrivate(octets) {
  if (octets[0] === 10) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  return false;
}

function calculate() {
  const ip = getIP();
  const cidr = parseInt(document.getElementById('cidr').value);
  const mask = cidrToMask(cidr);

  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const firstHostInt = networkInt + 1;
  const lastHostInt = broadcastInt - 1;
  const totalHosts = Math.pow(2, 32 - cidr) - 2;

  const network = intToIP(networkInt);
  const broadcast = intToIP(broadcastInt);
  const firstHost = intToIP(firstHostInt);
  const lastHost = intToIP(lastHostInt);

  document.getElementById('resIP').textContent = ip.join('.');
  document.getElementById('resMask').textContent = mask.join('.');
  document.getElementById('resNetwork').textContent = network.join('.');
  document.getElementById('resBroadcast').textContent = broadcast.join('.');
  document.getElementById('resFirstHost').textContent = firstHost.join('.');
  document.getElementById('resLastHost').textContent = lastHost.join('.');
  document.getElementById('resTotalHosts').textContent = totalHosts > 0 ? totalHosts.toLocaleString() : '0';
  document.getElementById('resClass').textContent = 'Kelas ' + getIPClass(ip[0]);
  document.getElementById('resType').textContent = isPrivate(ip) ? 'Private' : 'Public';

  renderBinary(ip, mask, network, cidr);
}

// ============ BINARY RENDERING ============

function renderBinary(ip, mask, network, cidr) {
  renderOctetGroup('binaryIP', ip, 'IP');
  renderOctetGroup('binaryMask', mask, 'Mask');
  renderOctetGroup('binaryNetwork', network, 'Network');

  const networkPercent = (cidr / 32) * 100;
  const hostPercent = 100 - networkPercent;

  const networkBar = document.getElementById('subnetNetworkBar');
  const hostBar = document.getElementById('subnetHostBar');

  networkBar.style.width = networkPercent + '%';
  networkBar.textContent = `Network (${cidr} bit)`;
  hostBar.textContent = `Host (${32 - cidr} bit)`;
}

function renderOctetGroup(containerId, octets, label) {
  const container = document.getElementById(containerId);
  let html = '';
  octets.forEach((octet, i) => {
    const binary = toBinary(octet);
    const coloredBinary = binary.split('').map(bit => {
      const color = bit === '1' ? 'var(--accent-cyan)' : 'var(--text-muted)';
      return `<span style="color:${color}">${bit}</span>`;
    }).join('');

    html += `
      <div class="octet-group">
        <div class="octet-label">Oktet ${i + 1}</div>
        <div class="octet-decimal">${octet}</div>
        <div class="octet-binary">${coloredBinary}</div>
      </div>`;
  });
  container.innerHTML = html;
}

// ============ INPUT EVENT LISTENERS ============

['ip1', 'ip2', 'ip3', 'ip4', 'cidr'].forEach(id => {
  document.getElementById(id).addEventListener('change', calculate);
  document.getElementById(id).addEventListener('input', () => {
    const el = document.getElementById(id);
    if (id !== 'cidr') {
      let val = parseInt(el.value);
      if (val > 255) el.value = 255;
      if (val < 0) el.value = 0;
    }
  });
});

['ip1', 'ip2', 'ip3', 'ip4'].forEach((id, index) => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === '.' || e.key === 'Tab') {
      e.preventDefault();
      const nextIds = ['ip1', 'ip2', 'ip3', 'ip4'];
      const nextIndex = (index + 1) % 4;
      document.getElementById(nextIds[nextIndex]).focus();
      document.getElementById(nextIds[nextIndex]).select();
    }
  });
});

// ============ QUIZ SYSTEM ============

let quizScore = 0;
let quizTotal = 0;
let quizAnswered = {};

function generateQuiz() {
  quizScore = 0;
  quizTotal = 0;
  quizAnswered = {};
  updateScore();

  const questions = [];

  questions.push(generateClassQuestion());
  questions.push(generateMaskQuestion());
  questions.push(generateNetworkQuestion());
  questions.push(generateHostCountQuestion());
  questions.push(generatePrivateQuestion());

  const container = document.getElementById('quizContainer');
  container.innerHTML = questions.map((q, i) => `
    <div class="quiz-card" id="quiz-${i}">
      <div class="quiz-question">${i + 1}. ${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, j) => `
          <div class="quiz-option" onclick="checkAnswer(${i}, ${j}, ${q.correct})" id="opt-${i}-${j}">
            <span style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border-color);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.7rem;font-weight:600;">${String.fromCharCode(65 + j)}</span>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
      <div class="quiz-feedback" id="feedback-${i}"></div>
    </div>
  `).join('');

  quizTotal = questions.length;
}

function checkAnswer(qIndex, selected, correct) {
  if (quizAnswered[qIndex] !== undefined) return;
  quizAnswered[qIndex] = selected;

  const options = document.querySelectorAll(`#quiz-${qIndex} .quiz-option`);
  options.forEach((opt, i) => {
    opt.style.cursor = 'default';
    if (i === correct) {
      opt.classList.add('correct');
    } else if (i === selected && selected !== correct) {
      opt.classList.add('wrong');
    }
  });

  const feedback = document.getElementById(`feedback-${qIndex}`);
  if (selected === correct) {
    quizScore++;
    feedback.className = 'quiz-feedback show correct';
    feedback.textContent = 'Benar! Jawaban Anda tepat.';
  } else {
    feedback.className = 'quiz-feedback show wrong';
    feedback.textContent = `Salah. Jawaban yang benar adalah ${String.fromCharCode(65 + correct)}.`;
  }

  updateScore();
}

function updateScore() {
  const answered = Object.keys(quizAnswered).length;
  document.getElementById('scoreCircle').textContent = quizScore;

  const circle = document.getElementById('scoreCircle');
  if (answered === 0) {
    circle.style.borderColor = 'var(--accent-blue)';
    circle.style.color = 'var(--accent-blue)';
  } else if (quizScore / answered >= 0.8) {
    circle.style.borderColor = 'var(--accent-green)';
    circle.style.color = 'var(--accent-green)';
  } else if (quizScore / answered >= 0.5) {
    circle.style.borderColor = 'var(--accent-yellow)';
    circle.style.color = 'var(--accent-yellow)';
  } else {
    circle.style.borderColor = 'var(--accent-red)';
    circle.style.color = 'var(--accent-red)';
  }

  if (answered > 0) {
    document.getElementById('scoreText').textContent =
      `${quizScore} benar dari ${answered} soal dijawab (total ${quizTotal} soal)`;
  } else {
    document.getElementById('scoreText').textContent =
      'Jawab pertanyaan di bawah untuk mendapatkan skor';
  }
}

function resetQuiz() {
  generateQuiz();
  showToast('Soal baru telah digenerate', 'success');
}

// ============ QUESTION GENERATORS ============

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateClassQuestion() {
  const classes = [
    { class: 'A', range: [1, 126] },
    { class: 'B', range: [128, 191] },
    { class: 'C', range: [192, 223] },
    { class: 'D', range: [224, 239] },
    { class: 'E', range: [240, 255] }
  ];

  const chosen = classes[randomInt(0, 4)];
  const octet1 = randomInt(chosen.range[0], chosen.range[1]);
  const ip = `${octet1}.${randomInt(0,255)}.${randomInt(0,255)}.${randomInt(1,254)}`;

  const options = ['Kelas A', 'Kelas B', 'Kelas C', 'Kelas D', 'Kelas E'];
  const correctIndex = classes.findIndex(c => c.class === chosen.class);
  const correct = options[correctIndex];

  const shuffled = shuffle(options.slice(0, 4).includes(correct)
    ? options.slice(0, 4)
    : [...options.slice(0, 3), correct]);

  return {
    question: `IP Address <code style="background:var(--bg-input);padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;color:var(--accent-cyan);">${ip}</code> termasuk ke dalam kelas apa?`,
    options: shuffled,
    correct: shuffled.indexOf(correct)
  };
}

function generateMaskQuestion() {
  const masks = [
    { cidr: 8, mask: '255.0.0.0' },
    { cidr: 16, mask: '255.255.0.0' },
    { cidr: 24, mask: '255.255.255.0' },
    { cidr: 25, mask: '255.255.255.128' },
    { cidr: 26, mask: '255.255.255.192' },
    { cidr: 27, mask: '255.255.255.224' },
    { cidr: 28, mask: '255.255.255.240' },
    { cidr: 30, mask: '255.255.255.252' }
  ];

  const chosen = masks[randomInt(0, masks.length - 1)];
  const allMasks = masks.map(m => m.mask);
  const wrongOptions = allMasks.filter(m => m !== chosen.mask);

  const shuffledWrong = shuffle(wrongOptions).slice(0, 3);
  const options = shuffle([chosen.mask, ...shuffledWrong]);

  return {
    question: `Berapa subnet mask untuk prefix <code style="background:var(--bg-input);padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;color:var(--accent-cyan);">/${chosen.cidr}</code>?`,
    options: options,
    correct: options.indexOf(chosen.mask)
  };
}

function generateNetworkQuestion() {
  const cidr = [24, 25, 26, 27, 28][randomInt(0, 4)];
  const mask = cidrToMask(cidr);

  const ip = [192, 168, randomInt(0, 10), randomInt(1, 254)];
  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);
  const networkInt = (ipInt & maskInt) >>> 0;
  const network = intToIP(networkInt);
  const correctAnswer = network.join('.');

  const wrongAnswers = [];
  for (let i = 0; i < 3; i++) {
    const wrong = [...network];
    wrong[3] = clamp(wrong[3] + randomInt(1, 10) * (Math.random() > 0.5 ? 1 : -1), 0, 255);
    const wrongStr = wrong.join('.');
    if (wrongStr !== correctAnswer && !wrongAnswers.includes(wrongStr)) {
      wrongAnswers.push(wrongStr);
    }
  }

  while (wrongAnswers.length < 3) {
    const wrong = [...network];
    wrong[3] = randomInt(0, 255);
    const wrongStr = wrong.join('.');
    if (wrongStr !== correctAnswer && !wrongAnswers.includes(wrongStr)) {
      wrongAnswers.push(wrongStr);
    }
  }

  const options = shuffle([correctAnswer, ...wrongAnswers.slice(0, 3)]);

  return {
    question: `Berapa network address dari <code style="background:var(--bg-input);padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;color:var(--accent-cyan);">${ip.join('.')}/${cidr}</code>?`,
    options: options,
    correct: options.indexOf(correctAnswer)
  };
}

function generateHostCountQuestion() {
  const cidrs = [24, 25, 26, 27, 28, 29, 30];
  const cidr = cidrs[randomInt(0, cidrs.length - 1)];
  const hostBits = 32 - cidr;
  const totalHosts = Math.pow(2, hostBits) - 2;
  const correctAnswer = totalHosts.toString();

  const wrongs = new Set();
  wrongs.add(String(Math.pow(2, hostBits)));
  wrongs.add(String(Math.pow(2, hostBits) - 1));
  wrongs.add(String(Math.pow(2, hostBits + 1) - 2));
  wrongs.add(String(Math.pow(2, hostBits - 1) - 2));
  wrongs.delete(correctAnswer);

  const wrongArr = shuffle([...wrongs].filter(w => parseInt(w) > 0)).slice(0, 3);
  const options = shuffle([correctAnswer, ...wrongArr]);

  return {
    question: `Berapa jumlah host yang dapat digunakan pada subnet dengan prefix <code style="background:var(--bg-input);padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;color:var(--accent-cyan);">/${cidr}</code>?`,
    options: options,
    correct: options.indexOf(correctAnswer)
  };
}

function generatePrivateQuestion() {
  const privateRanges = [
    () => [10, randomInt(0,255), randomInt(0,255), randomInt(1,254)],
    () => [172, randomInt(16,31), randomInt(0,255), randomInt(1,254)],
    () => [192, 168, randomInt(0,255), randomInt(1,254)]
  ];

  const publicRanges = [
    () => [randomInt(1,9), randomInt(0,255), randomInt(0,255), randomInt(1,254)],
    () => [randomInt(11,126), randomInt(0,255), randomInt(0,255), randomInt(1,254)],
    () => [randomInt(128,171), randomInt(0,255), randomInt(0,255), randomInt(1,254)],
    () => [randomInt(173,191), randomInt(0,255), randomInt(0,255), randomInt(1,254)]
  ];

  const isPrivateQ = Math.random() > 0.5;
  let ip;
  if (isPrivateQ) {
    ip = privateRanges[randomInt(0, 2)]();
  } else {
    ip = publicRanges[randomInt(0, 3)]();
  }

  const correctAnswer = isPrivateQ ? 'Private' : 'Public';
  const options = ['Private', 'Public'];

  return {
    question: `IP Address <code style="background:var(--bg-input);padding:2px 8px;border-radius:4px;font-family:'JetBrains Mono',monospace;color:var(--accent-cyan);">${ip.join('.')}</code> termasuk IP...?`,
    options: options,
    correct: options.indexOf(correctAnswer)
  };
}

// ============ TOAST ============

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// ============ INITIALIZATION ============

calculate();

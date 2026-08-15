/* ============================================
   Lab Maya - Evaluasi / Kuis Komprehensif
   ============================================ */

// ============ QUESTION BANK ============

const questionBank = [
  // === TOPOLOGI ===
  { cat: 'topologi', q: 'Topologi jaringan di mana semua perangkat terhubung ke satu perangkat pusat (misalnya switch) disebut topologi...', opts: ['Star', 'Bus', 'Ring', 'Mesh'], ans: 0, exp: 'Topologi Star menghubungkan semua node ke satu perangkat pusat. Kelebihannya mudah dikelola, kelemahannya jika pusat mati maka semua terputus.' },
  { cat: 'topologi', q: 'Kelemahan utama topologi Bus adalah...', opts: ['Jika kabel utama putus, seluruh jaringan mati', 'Membutuhkan banyak kabel', 'Harus menggunakan router', 'Tidak bisa menghubungkan lebih dari 5 perangkat'], ans: 0, exp: 'Pada topologi Bus, semua perangkat berbagi satu kabel utama (backbone). Jika kabel tersebut putus, seluruh komunikasi terhenti.' },
  { cat: 'topologi', q: 'Pada topologi Ring, data mengalir dengan cara...', opts: ['Satu arah dari node ke node berikutnya', 'Langsung dari pengirim ke penerima', 'Broadcast ke semua node', 'Melalui server pusat'], ans: 0, exp: 'Pada topologi Ring, data bergerak satu arah (unidirectional) dari satu node ke node berikutnya hingga sampai ke tujuan.' },
  { cat: 'topologi', q: 'Topologi yang memiliki redundansi paling tinggi karena setiap perangkat saling terhubung adalah...', opts: ['Mesh', 'Star', 'Tree', 'Bus'], ans: 0, exp: 'Topologi Full Mesh menghubungkan setiap perangkat ke semua perangkat lain, memberikan redundansi maksimal. Jika satu jalur putus, masih ada jalur alternatif.' },
  { cat: 'topologi', q: 'Topologi Tree merupakan kombinasi dari topologi...', opts: ['Star dan Bus', 'Ring dan Mesh', 'Bus dan Ring', 'Star dan Mesh'], ans: 0, exp: 'Topologi Tree menggabungkan beberapa topologi Star yang dihubungkan secara hierarki melalui backbone (Bus). Cocok untuk jaringan skala besar.' },
  { cat: 'topologi', q: 'Jumlah kabel minimum yang dibutuhkan pada topologi Full Mesh dengan 5 perangkat adalah...', opts: ['10', '5', '20', '8'], ans: 0, exp: 'Rumus: n(n-1)/2 = 5(4)/2 = 10 kabel. Setiap perangkat terhubung langsung ke semua perangkat lainnya.' },
  { cat: 'topologi', q: 'Perangkat pusat yang biasa digunakan pada topologi Star adalah...', opts: ['Switch atau Hub', 'Router saja', 'Modem', 'Repeater'], ans: 0, exp: 'Topologi Star menggunakan Switch atau Hub sebagai perangkat pusat yang menghubungkan semua node.' },
  { cat: 'topologi', q: 'Topologi yang paling mudah dalam penambahan perangkat baru tanpa mengganggu jaringan yang ada adalah...', opts: ['Star', 'Bus', 'Ring', 'Mesh'], ans: 0, exp: 'Pada topologi Star, menambah perangkat cukup menghubungkannya ke port kosong di switch tanpa mempengaruhi perangkat lain.' },

  // === IP ADDRESSING ===
  { cat: 'ip', q: 'IP Address 192.168.1.1 termasuk dalam kelas...', opts: ['C', 'A', 'B', 'D'], ans: 0, exp: 'Kelas C memiliki oktet pertama antara 192-223. IP 192.168.1.1 dimulai dengan 192, sehingga termasuk Kelas C.' },
  { cat: 'ip', q: 'Berapa jumlah host yang tersedia pada subnet /24?', opts: ['254', '256', '255', '128'], ans: 0, exp: 'Rumus: 2^(32-24) - 2 = 2^8 - 2 = 254 host. Dikurangi 2 untuk Network Address dan Broadcast Address.' },
  { cat: 'ip', q: 'Subnet mask untuk prefix /16 adalah...', opts: ['255.255.0.0', '255.0.0.0', '255.255.255.0', '255.255.128.0'], ans: 0, exp: '/16 berarti 16 bit pertama adalah 1 (network), sisanya 0 (host). Hasilnya: 255.255.0.0.' },
  { cat: 'ip', q: 'Network address dari IP 192.168.10.130/26 adalah...', opts: ['192.168.10.128', '192.168.10.0', '192.168.10.64', '192.168.10.130'], ans: 0, exp: '/26 berarti subnet mask 255.255.255.192. IP 130 dalam biner = 10000010. Bit network (6 bit) = 10 = 128. Jadi network = 192.168.10.128.' },
  { cat: 'ip', q: 'IP Address 10.0.0.1 termasuk IP...', opts: ['Private', 'Public', 'Multicast', 'Broadcast'], ans: 0, exp: 'Range 10.0.0.0 - 10.255.255.255 adalah IP Private Kelas A yang digunakan untuk jaringan internal/LAN.' },
  { cat: 'ip', q: 'Berapa bit yang digunakan oleh IPv4?', opts: ['32 bit', '64 bit', '128 bit', '16 bit'], ans: 0, exp: 'IPv4 menggunakan 32 bit yang dibagi menjadi 4 oktet (masing-masing 8 bit). Contoh: 11000000.10101000.00000001.00000001' },
  { cat: 'ip', q: 'Broadcast address dari network 192.168.1.0/24 adalah...', opts: ['192.168.1.255', '192.168.1.0', '192.168.1.254', '192.168.255.255'], ans: 0, exp: 'Broadcast address adalah alamat terakhir dalam subnet. Untuk /24, semua 8 bit host diisi 1 = 255. Jadi broadcast = 192.168.1.255.' },
  { cat: 'ip', q: 'Fungsi utama dari subnetting adalah...', opts: ['Membagi jaringan besar menjadi jaringan lebih kecil', 'Meningkatkan kecepatan internet', 'Mengganti IP Address', 'Mengubah IP Private menjadi Public'], ans: 0, exp: 'Subnetting membagi jaringan besar menjadi subnet-subnet yang lebih kecil untuk efisiensi, keamanan, dan kemudahan manajemen.' },
  { cat: 'ip', q: 'Range IP Private untuk Kelas B adalah...', opts: ['172.16.0.0 - 172.31.255.255', '10.0.0.0 - 10.255.255.255', '192.168.0.0 - 192.168.255.255', '169.254.0.0 - 169.254.255.255'], ans: 0, exp: 'IP Private Kelas B: 172.16.0.0 - 172.31.255.255 (16 network). Digunakan untuk jaringan internal skala menengah.' },

  // === OSI LAYER ===
  { cat: 'osi', q: 'Model OSI memiliki berapa layer?', opts: ['7', '4', '5', '6'], ans: 0, exp: 'Model OSI (Open Systems Interconnection) memiliki 7 layer: Physical, Data Link, Network, Transport, Session, Presentation, dan Application.' },
  { cat: 'osi', q: 'Layer yang bertanggung jawab untuk routing dan pengalamatan IP adalah...', opts: ['Network (Layer 3)', 'Transport (Layer 4)', 'Data Link (Layer 2)', 'Session (Layer 5)'], ans: 0, exp: 'Layer 3 (Network) menangani pengalamatan logis (IP Address) dan routing - menentukan jalur terbaik untuk mengirim paket.' },
  { cat: 'osi', q: 'Pada layer berapa MAC Address digunakan?', opts: ['Data Link (Layer 2)', 'Physical (Layer 1)', 'Network (Layer 3)', 'Transport (Layer 4)'], ans: 0, exp: 'MAC Address digunakan pada Layer 2 (Data Link) untuk mengidentifikasi perangkat secara unik dalam satu jaringan lokal.' },
  { cat: 'osi', q: 'PDU (Protocol Data Unit) pada Layer 4 Transport disebut...', opts: ['Segment', 'Packet', 'Frame', 'Bit'], ans: 0, exp: 'Layer 4 menggunakan Segment (TCP) atau Datagram (UDP). Layer 3 = Packet, Layer 2 = Frame, Layer 1 = Bit.' },
  { cat: 'osi', q: 'Protokol HTTP bekerja pada layer...', opts: ['Application (Layer 7)', 'Presentation (Layer 6)', 'Transport (Layer 4)', 'Network (Layer 3)'], ans: 0, exp: 'HTTP (Hypertext Transfer Protocol) bekerja pada Layer 7 (Application), yaitu layer yang langsung berinteraksi dengan pengguna.' },
  { cat: 'osi', q: 'Layer yang bertanggung jawab mengubah data menjadi sinyal listrik atau cahaya adalah...', opts: ['Physical (Layer 1)', 'Data Link (Layer 2)', 'Network (Layer 3)', 'Presentation (Layer 6)'], ans: 0, exp: 'Layer 1 (Physical) menangani transmisi bit mentah melalui media fisik: sinyal listrik (kabel), cahaya (fiber), atau gelombang radio (wireless).' },
  { cat: 'osi', q: 'Proses pembungkusan data dengan header di setiap layer OSI saat pengiriman disebut...', opts: ['Enkapsulasi', 'Dekapsulasi', 'Routing', 'Switching'], ans: 0, exp: 'Enkapsulasi adalah proses menambahkan header (dan trailer) di setiap layer saat data turun dari Layer 7 ke Layer 1 sebelum dikirim.' },
  { cat: 'osi', q: 'Perbedaan utama TCP dan UDP pada Layer Transport adalah...', opts: ['TCP reliable (connection-oriented), UDP tidak reliable (connectionless)', 'TCP lebih cepat dari UDP', 'UDP memiliki lebih banyak fitur', 'TCP hanya untuk web, UDP hanya untuk email'], ans: 0, exp: 'TCP bersifat connection-oriented dan menjamin data sampai dengan urutan benar. UDP connectionless, lebih cepat tapi tidak menjamin pengiriman.' },

  // === PERANGKAT ===
  { cat: 'perangkat', q: 'Perangkat jaringan yang bekerja pada Layer 3 OSI dan menggunakan IP Address untuk meneruskan paket adalah...', opts: ['Router', 'Switch', 'Hub', 'Access Point'], ans: 0, exp: 'Router bekerja pada Layer 3 (Network) dan menggunakan IP Address serta tabel routing untuk menentukan jalur terbaik pengiriman paket.' },
  { cat: 'perangkat', q: 'Perbedaan utama antara Switch dan Hub adalah...', opts: ['Switch meneruskan data ke port tujuan, Hub ke semua port', 'Switch lebih murah dari Hub', 'Hub lebih cepat dari Switch', 'Switch hanya bisa 4 port'], ans: 0, exp: 'Switch menggunakan MAC Address Table untuk meneruskan frame hanya ke port tujuan. Hub meneruskan ke semua port (broadcast), menyebabkan collision.' },
  { cat: 'perangkat', q: 'Perangkat yang mengubah sinyal digital menjadi sinyal analog dan sebaliknya adalah...', opts: ['Modem', 'Router', 'Switch', 'Repeater'], ans: 0, exp: 'Modem (Modulator-Demodulator) mengubah sinyal digital ke analog untuk transmisi melalui saluran telepon/kabel, dan sebaliknya.' },
  { cat: 'perangkat', q: 'Access Point berfungsi sebagai...', opts: ['Jembatan antara jaringan kabel dan nirkabel', 'Pengganti router', 'Penguatan sinyal internet', 'Penyimpan data jaringan'], ans: 0, exp: 'Access Point menjembatani jaringan kabel (Ethernet) dan nirkabel (WiFi), memungkinkan perangkat wireless terhubung ke jaringan kabel.' },
  { cat: 'perangkat', q: 'Firewall berfungsi untuk...', opts: ['Memfilter lalu lintas jaringan berdasarkan aturan keamanan', 'Mempercepat koneksi internet', 'Menghubungkan 2 jaringan berbeda', 'Menyimpan data backup'], ans: 0, exp: 'Firewall memantau dan memfilter traffic berdasarkan rules yang ditetapkan, melindungi jaringan internal dari akses tidak sah.' },
  { cat: 'perangkat', q: 'MAC Address memiliki panjang...', opts: ['48 bit (6 byte)', '32 bit (4 byte)', '64 bit (8 byte)', '128 bit (16 byte)'], ans: 0, exp: 'MAC Address menggunakan 48 bit yang ditulis dalam format heksadesimal: AA:BB:CC:DD:EE:FF (6 pasang = 6 byte).' },
  { cat: 'perangkat', q: 'Perangkat yang berfungsi memperkuat sinyal jaringan agar jangkauan lebih jauh adalah...', opts: ['Repeater', 'Firewall', 'Server', 'Gateway'], ans: 0, exp: 'Repeater bekerja pada Layer 1 (Physical) untuk menerima sinyal yang melemah, memperkuatnya, dan mengirimkannya kembali.' },
  { cat: 'perangkat', q: 'Server DHCP berfungsi untuk...', opts: ['Memberikan IP Address secara otomatis kepada client', 'Menerjemahkan nama domain ke IP', 'Menyimpan halaman web', 'Mengirim email'], ans: 0, exp: 'DHCP (Dynamic Host Configuration Protocol) Server memberikan IP Address, subnet mask, gateway, dan DNS secara otomatis kepada perangkat yang terhubung.' },
];

// ============ STATE ============

let selectedCategory = 'all';
let questionCount = 20;
let questions = [];
let currentQ = 0;
let userAnswers = {};
let timerInterval = null;
let timeLeft = 0;

// ============ CATEGORY & COUNT ============

function toggleCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('.cat-btn[data-cat]').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
}

function setQuestionCount(count) {
  questionCount = count;
  document.querySelectorAll('.cat-btn[data-num]').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.num) === count);
  });
  document.getElementById('infoCount').textContent = count;
  document.getElementById('infoTime').textContent = formatTime(count * 30);
}

// ============ START EVALUATION ============

function startEval() {
  let pool = [...questionBank];

  if (selectedCategory !== 'all') {
    pool = pool.filter(q => q.cat === selectedCategory);
  }

  pool = shuffle(pool);

  pool.forEach(q => {
    const correctAnswer = q.opts[q.ans];
    const shuffledOpts = shuffle([...q.opts]);
    q.opts = shuffledOpts;
    q.ans = shuffledOpts.indexOf(correctAnswer);
  });

  questions = pool.slice(0, Math.min(questionCount, pool.length));
  currentQ = 0;
  userAnswers = {};
  timeLeft = questions.length * 30;

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('quizScreen').style.display = 'block';
  document.getElementById('resultScreen').style.display = 'none';

  renderQuestion();
  startTimer();
}

// ============ TIMER ============

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishEval();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById('progressTimer');
  display.textContent = formatTime(timeLeft);
  if (timeLeft <= 60) {
    display.style.color = 'var(--accent-red)';
  } else if (timeLeft <= 120) {
    display.style.color = 'var(--accent-yellow)';
  } else {
    display.style.color = 'var(--accent-cyan)';
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============ RENDER QUESTION ============

function renderQuestion() {
  const q = questions[currentQ];
  const answered = userAnswers[currentQ] !== undefined;
  const catNames = { topologi: 'Topologi Jaringan', ip: 'IP Addressing', osi: 'OSI Layer', perangkat: 'Perangkat Jaringan' };

  const progress = ((currentQ + 1) / questions.length) * 100;
  document.getElementById('progressText').textContent = `Soal ${currentQ + 1} / ${questions.length}`;
  document.getElementById('progressBar').style.width = progress + '%';

  document.getElementById('btnPrev').disabled = currentQ === 0;

  const isLast = currentQ === questions.length - 1;
  const btnNext = document.getElementById('btnNext');
  if (isLast) {
    btnNext.innerHTML = 'Selesai <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  } else {
    btnNext.innerHTML = 'Selanjutnya <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
  }

  let feedbackHTML = '';
  if (answered) {
    const isCorrect = userAnswers[currentQ] === q.ans;
    feedbackHTML = `<div class="answer-feedback show ${isCorrect ? 'correct' : 'wrong'}">
      ${isCorrect ? '<strong>Benar!</strong> ' : `<strong>Salah.</strong> Jawaban benar: ${q.opts[q.ans]}. `}${q.exp}
    </div>`;
  }

  document.getElementById('questionContainer').innerHTML = `
    <div class="question-card">
      <div class="question-header">
        <div class="question-number">${currentQ + 1}</div>
        <div>
          <div class="question-category">${catNames[q.cat] || q.cat}</div>
        </div>
      </div>
      <div class="question-text">${q.q}</div>
      <div class="answer-options">
        ${q.opts.map((opt, i) => {
          let cls = '';
          if (answered) {
            cls = 'disabled';
            if (i === q.ans) cls += ' correct';
            else if (i === userAnswers[currentQ] && i !== q.ans) cls += ' wrong';
          } else if (userAnswers[currentQ] === i) {
            cls = 'selected';
          }
          return `<div class="answer-option ${cls}" onclick="selectAnswer(${currentQ}, ${i})">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
          </div>`;
        }).join('')}
      </div>
      ${feedbackHTML}
    </div>
  `;
}

// ============ SELECT ANSWER ============

function selectAnswer(qIndex, optIndex) {
  if (userAnswers[qIndex] !== undefined) return;

  userAnswers[qIndex] = optIndex;
  if (window.LabMayaSound) {
    window.LabMayaSound.play(optIndex === questions[qIndex].ans ? 'success' : 'error');
  }
  renderQuestion();
}

// ============ NAVIGATION ============

function nextQuestion() {
  if (currentQ < questions.length - 1) {
    if (window.LabMayaSound) window.LabMayaSound.play('click');
    currentQ++;
    renderQuestion();
  } else {
    finishEval();
  }
}

function prevQuestion() {
  if (currentQ > 0) {
    if (window.LabMayaSound) window.LabMayaSound.play('click');
    currentQ--;
    renderQuestion();
  }
}

// ============ FINISH EVALUATION ============

function finishEval() {
  clearInterval(timerInterval);
  if (window.LabMayaSound) window.LabMayaSound.play('complete');

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const catScores = {};

  questions.forEach((q, i) => {
    if (!catScores[q.cat]) catScores[q.cat] = { correct: 0, total: 0 };
    catScores[q.cat].total++;

    if (userAnswers[i] === undefined) {
      unanswered++;
    } else if (userAnswers[i] === q.ans) {
      correct++;
      catScores[q.cat].correct++;
    } else {
      wrong++;
    }
  });

  const total = questions.length;
  const score = Math.round((correct / total) * 100);
  const elapsed = (total * 30) - timeLeft;

  let grade, gradeColor;
  if (score >= 90) { grade = 'Sangat Baik! (A)'; gradeColor = 'var(--accent-green)'; }
  else if (score >= 80) { grade = 'Baik (B)'; gradeColor = 'var(--accent-cyan)'; }
  else if (score >= 70) { grade = 'Cukup (C)'; gradeColor = 'var(--accent-yellow)'; }
  else if (score >= 60) { grade = 'Kurang (D)'; gradeColor = 'var(--accent-orange)'; }
  else { grade = 'Perlu Belajar Lagi (E)'; gradeColor = 'var(--accent-red)'; }

  const circumference = 2 * Math.PI * 58;
  const offset = circumference - (score / 100) * circumference;

  const catNames = { topologi: 'Topologi Jaringan', ip: 'IP Addressing', osi: 'OSI Layer', perangkat: 'Perangkat Jaringan' };

  const breakdownHTML = Object.entries(catScores).map(([cat, data]) => {
    const pct = Math.round((data.correct / data.total) * 100);
    const color = pct >= 80 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)';
    return `
      <div class="breakdown-item">
        <span class="bd-cat">${catNames[cat] || cat}</span>
        <div class="breakdown-bar">
          <div class="breakdown-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <span class="bd-score" style="color:${color};">${data.correct}/${data.total}</span>
      </div>`;
  }).join('');

  document.getElementById('quizScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'block';
  document.getElementById('resultScreen').innerHTML = `
    <div class="result-screen">
      <div class="result-circle-wrap">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle class="result-circle-bg" cx="70" cy="70" r="58"/>
          <circle class="result-circle-fill" cx="70" cy="70" r="58"
            stroke="${gradeColor}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            id="scoreCircleAnim"/>
        </svg>
        <div class="result-score-text" style="color:${gradeColor};">${score}</div>
        <div class="result-score-label">dari 100</div>
      </div>

      <div class="result-grade" style="color:${gradeColor};">${grade}</div>
      <p style="color:var(--text-secondary);font-size:0.9rem;">
        Kamu menjawab ${correct} dari ${total} soal dengan benar
      </p>

      <div class="result-stats">
        <div class="result-stat">
          <div class="rs-val" style="color:var(--accent-green);">${correct}</div>
          <div class="rs-label">Benar</div>
        </div>
        <div class="result-stat">
          <div class="rs-val" style="color:var(--accent-red);">${wrong}</div>
          <div class="rs-label">Salah</div>
        </div>
        <div class="result-stat">
          <div class="rs-val" style="color:var(--text-muted);">${unanswered}</div>
          <div class="rs-label">Tidak Dijawab</div>
        </div>
        <div class="result-stat">
          <div class="rs-val" style="color:var(--accent-cyan);">${formatTime(elapsed)}</div>
          <div class="rs-label">Waktu</div>
        </div>
      </div>

      <div class="result-breakdown">
        <h3 style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:0.75rem;">Skor per Kategori</h3>
        ${breakdownHTML}
      </div>

      <div style="margin-top:2rem;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="reviewAnswers()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Lihat Pembahasan
        </button>
        <button class="btn btn-secondary" onclick="restartEval()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Ulangi Evaluasi
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    const circle = document.getElementById('scoreCircleAnim');
    if (circle) circle.style.strokeDashoffset = offset;
  }, 100);
}

// ============ REVIEW ANSWERS ============

function reviewAnswers() {
  const catNames = { topologi: 'Topologi Jaringan', ip: 'IP Addressing', osi: 'OSI Layer', perangkat: 'Perangkat Jaringan' };

  let html = `
    <div style="margin-bottom:1.5rem;">
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px;">Pembahasan Soal</h2>
      <p style="color:var(--text-secondary);font-size:0.85rem;">Review jawaban dan pelajari penjelasannya</p>
    </div>
  `;

  questions.forEach((q, i) => {
    const answered = userAnswers[i] !== undefined;
    const isCorrect = answered && userAnswers[i] === q.ans;
    const statusColor = !answered ? 'var(--text-muted)' : isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
    const statusText = !answered ? 'Tidak Dijawab' : isCorrect ? 'Benar' : 'Salah';

    html += `
      <div class="question-card" style="border-left:3px solid ${statusColor};">
        <div class="question-header">
          <div class="question-number" style="background:${statusColor}15;color:${statusColor};border:1px solid ${statusColor}30;">${i + 1}</div>
          <div style="flex:1;">
            <div class="question-category">${catNames[q.cat]}</div>
          </div>
          <span style="font-size:0.75rem;font-weight:600;color:${statusColor};">${statusText}</span>
        </div>
        <div class="question-text" style="font-size:0.9rem;">${q.q}</div>
        <div class="answer-options">
          ${q.opts.map((opt, j) => {
            let cls = 'disabled';
            if (j === q.ans) cls += ' correct';
            else if (answered && j === userAnswers[i] && j !== q.ans) cls += ' wrong';
            return `<div class="answer-option ${cls}">
              <span class="opt-letter">${String.fromCharCode(65 + j)}</span>
              <span>${opt}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="answer-feedback show correct" style="margin-top:12px;">
          <strong>Penjelasan:</strong> ${q.exp}
        </div>
      </div>
    `;
  });

  html += `
    <div style="text-align:center;margin-top:2rem;">
      <button class="btn btn-secondary" onclick="restartEval()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Ulangi Evaluasi
      </button>
    </div>
  `;

  document.getElementById('resultScreen').innerHTML = html;
}

// ============ RESTART ============

function restartEval() {
  clearInterval(timerInterval);
  document.getElementById('startScreen').style.display = 'block';
  document.getElementById('quizScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'none';
}

// ============ UTILS ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

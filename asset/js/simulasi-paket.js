/* ============================================
   Lab Maya - Simulasi Pengiriman Paket Data
   ============================================ */

/*
 * Setiap skenario menyimpan, per-layer:
 *   proto    -> nama protokol (ditampilkan di bawah nama layer)
 *   data     -> potongan data/header ringkas (kolom kanan tiap layer)
 *   desc     -> penjelasan ENKAPSULASI (sisi pengirim, layer turun 7 -> 1)
 *   recvDesc -> penjelasan DEKAPSULASI (sisi penerima, layer naik 1 -> 7)
 * middleDevice menentukan perangkat di tengah jaringan: 'switch' untuk
 * komunikasi satu subnet (tak butuh routing) atau 'router' untuk lintas subnet.
 */
const scenarios = {
  http: {
    name: 'HTTP Request',
    senderIP: '192.168.1.10',
    receiverIP: '203.0.113.50',
    middleDevice: 'router', // beda subnet (192.168.x -> 203.0.113.x) => butuh router
    layers: {
      7: { proto: 'HTTP', data: 'GET /index.html',
           desc: 'Browser menyusun HTTP Request: metode GET, path /index.html, dan header seperti Host serta User-Agent. Inilah "isi" sesungguhnya yang ingin dikirim — belum ada alamat jaringan apa pun.',
           recvDesc: 'Web server menerima HTTP Request yang utuh, membaca metode GET dan path /index.html, lalu menyiapkan halaman web untuk dikirim balik sebagai response.' },
      6: { proto: 'SSL/TLS', data: 'Encrypt + Format',
           desc: 'Data dikodekan ke format standar (mis. UTF-8/HTML) lalu dienkripsi dengan SSL/TLS menjadi ciphertext — kalau disadap di tengah jalan, isinya tak terbaca.',
           recvDesc: 'Server mendekripsi ciphertext memakai kunci sesi TLS dan mengembalikannya ke format asli, sehingga HTTP Request bisa dibaca oleh aplikasi.' },
      5: { proto: 'Session', data: 'Session ID',
           desc: 'Sesi komunikasi client–server dibuka dan diberi Session ID, supaya beberapa permintaan dikenali sebagai bagian dari percakapan yang sama.',
           recvDesc: 'Server mencocokkan Session ID untuk memastikan paket ini milik sesi yang sah, lalu meneruskannya ke layer aplikasi.' },
      4: { proto: 'TCP:80', data: 'Src:49152 Dst:80',
           desc: 'TCP memecah data menjadi segment dan menambah header: port sumber 49152, port tujuan 80 (HTTP), nomor urut (sequence), dan checksum. Three-way handshake (SYN → SYN-ACK → ACK) memastikan koneksi siap.',
           recvDesc: 'TCP penerima memverifikasi checksum, menyusun ulang segment sesuai nomor urut, lalu mengirim ACK ke pengirim. Port tujuan 80 menandai data ini untuk layanan web.' },
      3: { proto: 'IPv4', data: '192.168.1.10→203.0.113.50',
           desc: 'Segment dibungkus menjadi packet dengan header IP: sumber 192.168.1.10, tujuan 203.0.113.50. Karena tujuan beda jaringan, packet dikirim ke default gateway untuk diteruskan router.',
           recvDesc: 'Setelah dilewatkan router demi router di internet, packet tiba di jaringan 203.0.113.x. Penerima memastikan IP tujuan cocok dengan miliknya, lalu melepas header IP.' },
      2: { proto: 'Ethernet', data: 'MAC: AA:BB→CC:DD',
           desc: 'Packet dibungkus menjadi frame dengan MAC sumber dan MAC tujuan (untuk hop berikutnya, yaitu gateway), plus trailer FCS untuk mendeteksi frame yang rusak.',
           recvDesc: 'Kartu jaringan penerima mengecek MAC tujuan pada frame benar miliknya dan memverifikasi FCS. Bila utuh, header/trailer Ethernet dilepas dan packet naik ke atas.' },
      1: { proto: 'Kabel UTP', data: '10101100...',
           desc: 'Frame diubah menjadi deretan bit lalu dikirim sebagai sinyal listrik (kabel UTP), pulsa cahaya (fiber), atau gelombang radio (WiFi) melewati media fisik.',
           recvDesc: 'Sinyal fisik yang diterima diubah kembali menjadi deretan bit, lalu dirakit menjadi frame yang utuh untuk diserahkan ke Layer 2.' }
    }
  },
  ping: {
    name: 'Ping (ICMP)',
    senderIP: '192.168.1.10',
    receiverIP: '192.168.1.1',
    middleDevice: 'switch', // satu subnet (192.168.1.0/24) => cukup switch, tanpa routing
    layers: {
      7: { proto: 'Ping', data: 'Echo Request',
           desc: 'User menjalankan "ping 192.168.1.1". Program membuat pesan ICMP Echo Request berisi identifier, sequence number, dan payload untuk mengukur apakah host tujuan hidup serta berapa lama balasannya (RTT).',
           recvDesc: 'Host tujuan menerima Echo Request (Type 8) dan langsung menyiapkan balasan Echo Reply (Type 0) berisi payload yang sama — inilah yang membuktikan koneksi hidup.' },
      6: { proto: '—', data: 'Tidak dipakai',
           desc: 'ICMP tidak butuh pemformatan atau enkripsi, jadi Layer Presentation dilewati saja.',
           recvDesc: 'Tidak ada proses Presentation pada ICMP — data langsung diteruskan ke atas.' },
      5: { proto: '—', data: 'Tidak dipakai',
           desc: 'Ping bersifat connectionless (tanpa sesi), sehingga Layer Session tidak digunakan.',
           recvDesc: 'Tidak ada sesi yang perlu diverifikasi pada ICMP; proses lanjut ke pemroses ICMP.' },
      4: { proto: 'ICMP', data: 'Type:8 Code:0',
           desc: 'ICMP berjalan langsung di atas IP (bukan lewat TCP/UDP), jadi tidak ada nomor port. Type 8 Code 0 = Echo Request. Ditambahkan checksum untuk memeriksa keutuhan pesan.',
           recvDesc: 'Penerima memeriksa checksum ICMP, mengenali Type 8 (Echo Request), lalu memicu pembuatan Echo Reply (Type 0) sebagai jawaban.' },
      3: { proto: 'IPv4', data: '192.168.1.10→192.168.1.1',
           desc: 'Pesan ICMP diberi header IP. Karena tujuan 192.168.1.1 masih satu subnet (192.168.1.0/24), tidak perlu router — cukup dikirim langsung di jaringan lokal.',
           recvDesc: 'Penerima melihat IP tujuan adalah miliknya sendiri, lalu melepas header IP dan menyerahkan pesan ICMP ke pemroses di atasnya.' },
      2: { proto: 'Ethernet', data: 'MAC: AA:BB→FF:GG',
           desc: 'Frame dibuat dengan MAC tujuan si penerima. Bila MAC-nya belum diketahui, ARP dikirim dulu ("siapa punya 192.168.1.1?") untuk menemukannya.',
           recvDesc: 'Penerima mencocokkan MAC tujuan pada frame dengan MAC kartu jaringannya, memverifikasi FCS, lalu melepas header Ethernet.' },
      1: { proto: 'Kabel UTP', data: '11010010...',
           desc: 'Frame diubah menjadi sinyal listrik dan dikirim lewat kabel UTP menuju switch, yang meneruskannya ke port tujuan.',
           recvDesc: 'Sinyal listrik yang diterima disusun ulang menjadi bit lalu frame di sisi penerima.' }
    }
  },
  email: {
    name: 'Kirim Email (SMTP)',
    senderIP: '10.0.0.5',
    receiverIP: '74.125.200.108',
    middleDevice: 'router', // beda jaringan => lintas internet lewat router
    layers: {
      7: { proto: 'SMTP', data: 'MAIL FROM:<>',
           desc: 'Aplikasi email menyusun percakapan SMTP: EHLO, MAIL FROM, RCPT TO, DATA, lalu isi email (header + body + lampiran). Ini perintah tingkat aplikasi untuk menitipkan email ke mail server.',
           recvDesc: 'Mail server tujuan menerima perintah SMTP, membaca alamat pengirim & penerima, lalu menyimpan isi email ke kotak surat yang tepat.' },
      6: { proto: 'MIME/TLS', data: 'Encode + Encrypt',
           desc: 'Isi email dikodekan dengan MIME (agar teks, HTML, dan lampiran biner aman dikirim) lalu dienkripsi via STARTTLS.',
           recvDesc: 'Mail server mendekripsi TLS dan mendekode MIME, memulihkan teks, HTML, dan lampiran ke bentuk aslinya.' },
      5: { proto: 'Session', data: 'SMTP Session',
           desc: 'Sesi SMTP dibangun lewat handshake EHLO/HELO, menyepakati kemampuan server sebelum email dikirim.',
           recvDesc: 'Server memroses perintah sesi (mis. QUIT) untuk menutup sesi SMTP dengan rapi setelah email diterima.' },
      4: { proto: 'TCP:25', data: 'Src:51234 Dst:25',
           desc: 'TCP menjamin email sampai lengkap dan berurutan. Port tujuan 25 (relay antar-server) atau 587 (submission dari client).',
           recvDesc: 'TCP penerima menyusun ulang segment berurutan, memverifikasi checksum, dan mengirim ACK. Port 25 menandai data untuk layanan email.' },
      3: { proto: 'IPv4', data: '10.0.0.5→74.125.200.108',
           desc: 'Packet diberi IP sumber dan tujuan. Karena mail server berada di jaringan lain, packet dikirim ke gateway untuk diteruskan lintas internet.',
           recvDesc: 'Setelah melewati beberapa router, packet tiba di jaringan tujuan; mail server mencocokkan IP-nya lalu melepas header IP.' },
      2: { proto: 'Ethernet', data: 'MAC: 11:22→33:44',
           desc: 'Frame dialamatkan ke MAC gateway (bukan MAC tujuan akhir), karena tujuan berada di jaringan yang berbeda.',
           recvDesc: 'Kartu jaringan mail server memverifikasi MAC & FCS frame, lalu melepas header Ethernet.' },
      1: { proto: 'Fiber Optic', data: 'Sinyal cahaya',
           desc: 'Frame dikonversi menjadi pulsa cahaya dan dikirim lewat kabel fiber optik berkecepatan tinggi menuju jaringan ISP.',
           recvDesc: 'Pulsa cahaya di sisi penerima diubah kembali menjadi bit dan dirakit menjadi frame.' }
    }
  },
  ftp: {
    name: 'Transfer File (FTP)',
    senderIP: '172.16.0.100',
    receiverIP: '172.16.0.10',
    middleDevice: 'switch', // satu subnet (172.16.0.0/24) => switch, tanpa routing
    layers: {
      7: { proto: 'FTP', data: 'STOR file.zip',
           desc: 'FTP client mengirim perintah STOR untuk mengunggah file.zip ke server. File besar dipecah menjadi blok-blok data yang dikirim berurutan.',
           recvDesc: 'FTP server menerima perintah STOR lalu menulis blok-blok data yang masuk menjadi file.zip yang utuh di penyimpanannya.' },
      6: { proto: 'Binary/ASCII', data: 'Mode: Binary',
           desc: 'FTP memilih mode transfer: Binary untuk file biner (zip, gambar) atau ASCII untuk teks, agar byte file tidak rusak saat dikirim.',
           recvDesc: 'Server memakai mode yang sama (Binary) untuk menulis byte file persis seperti aslinya, tanpa konversi.' },
      5: { proto: 'Session', data: 'Ctrl:21 Data:20',
           desc: 'FTP memakai dua koneksi: Control (port 21) untuk perintah dan Data (port 20) khusus untuk transfer isi file.',
           recvDesc: 'Server memakai koneksi Control untuk membalas status (mis. 226 Transfer complete) dan koneksi Data untuk menerima isi file.' },
      4: { proto: 'TCP:21', data: 'Src:55000 Dst:21',
           desc: 'TCP memastikan tiap blok file tiba berurutan dan tanpa cacat; jika ada blok hilang, TCP mengirim ulang (retransmission) otomatis.',
           recvDesc: 'TCP penerima menyusun blok sesuai sequence number, memverifikasi checksum, dan meminta kirim ulang bila ada yang hilang.' },
      3: { proto: 'IPv4', data: '172.16.0.100→172.16.0.10',
           desc: 'Kedua perangkat berada di subnet yang sama (172.16.0.0/24), jadi packet dikirim langsung tanpa melewati router.',
           recvDesc: 'Server melihat IP tujuan cocok dengan miliknya di subnet yang sama, lalu melepas header IP.' },
      2: { proto: 'Ethernet', data: 'MAC: 55:66→77:88',
           desc: 'Frame dialamatkan langsung ke MAC server. Switch akan meneruskannya ke port tempat server terhubung.',
           recvDesc: 'Server memverifikasi MAC tujuan & FCS frame, lalu melepas header Ethernet dan meneruskan packet ke atas.' },
      1: { proto: 'Kabel UTP', data: '01101001...',
           desc: 'Data dikirim sebagai sinyal listrik lewat kabel UTP Cat 5e/6 (100/1000 Mbps) menuju switch.',
           recvDesc: 'Sinyal listrik diubah kembali menjadi bit dan dirakit menjadi frame di sisi server.' }
    }
  }
};

/* ---- Ikon per-layer OSI (inline SVG, diwarnai sesuai kelompok di legenda OSI vs TCP/IP) ---- */
const LAYER_COLORS = { 7: '#a855f7', 6: '#a855f7', 5: '#a855f7', 4: '#3b82f6', 3: '#22c55e', 2: '#f97316', 1: '#ef4444' };
const LAYER_ICONS = {
  // 7 Application — jendela aplikasi/browser
  7: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01M9 6.5h.01"/></svg>',
  // 6 Presentation — gembok (enkripsi/format)
  6: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  // 5 Session — mata rantai (koneksi/sesi)
  5: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a4 4 0 0 0 5.66 0l2-2a4 4 0 1 0-5.66-5.66l-1 1"/><path d="M14 11a4 4 0 0 0-5.66 0l-2 2a4 4 0 1 0 5.66 5.66l1-1"/></svg>',
  // 4 Transport — kotak/segment (paket data)
  4: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></svg>',
  // 3 Network — node saling terhubung (jaringan/routing)
  3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.2 11l9.6-4M7.2 13l9.6 4"/></svg>',
  // 2 Data Link — perangkat berport (switch/MAC)
  2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="8" rx="1.5"/><path d="M7 15v2.5M11 15v2.5M15 15v2.5M19 15v2.5"/></svg>',
  // 1 Physical — gelombang sinyal (media fisik)
  1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/></svg>'
};

/* ---- Ikon perangkat tengah jaringan (switch vs router) ---- */
const ROUTER_SVG = '<svg width="28" height="28" viewBox="0 0 32 32" fill="none">' +
  '<circle cx="16" cy="16" r="10" stroke="#f97316" stroke-width="2" fill="rgba(249,115,22,0.1)"/>' +
  '<path d="M16 10v4l3-2M16 14l-3-2" stroke="#f97316" stroke-width="1.5"/>' +
  '<path d="M10 16h4l-2 3M14 16l-2-3" stroke="#f97316" stroke-width="1.5"/>' +
  '<path d="M22 16h-4l2-3M18 16l2 3" stroke="#f97316" stroke-width="1.5"/>' +
  '<path d="M16 22v-4l-3 2M16 18l3 2" stroke="#f97316" stroke-width="1.5"/></svg>';
const SWITCH_SVG = '<svg width="28" height="28" viewBox="0 0 32 32" fill="none">' +
  '<rect x="4" y="11" width="24" height="10" rx="2" stroke="#22c55e" stroke-width="2" fill="rgba(34,197,94,0.1)"/>' +
  '<path d="M8 21v3M12 21v3M16 21v3M20 21v3M24 21v3" stroke="#22c55e" stroke-width="1.6"/>' +
  '<circle cx="9" cy="16" r="1" fill="#22c55e"/><circle cx="13" cy="16" r="1" fill="#22c55e"/>' +
  '<circle cx="17" cy="16" r="1" fill="#22c55e"/><circle cx="21" cy="16" r="1" fill="#22c55e"/></svg>';

let currentScenario = 'http';
let simState = 'idle';
let currentStep = -1;
let simTimer = null;

// Total 17 langkah (indeks 0..16):
//   0-6   = enkapsulasi pengirim (layer 7 turun ke 1)
//   7     = frame keluar ke jaringan (pengirim -> perangkat tengah)
//   8     = paket diproses perangkat tengah (switch/router, tergantung skenario)
//   9     = paket tiba di penerima
//   10-16 = dekapsulasi penerima (layer 1 naik ke 7) — kini SIMETRIS, 7 langkah penuh
const totalSteps = 17;
const LAST_STEP = totalSteps - 1;

function renderLayerIcons() {
  ['sender', 'receiver'].forEach(side => {
    for (let l = 1; l <= 7; l++) {
      const row = document.getElementById(`${side}-layer-${l}`);
      if (!row || row.querySelector('.layer-icon')) continue;
      const icon = document.createElement('div');
      icon.className = 'layer-icon';
      icon.style.color = LAYER_COLORS[l];
      icon.innerHTML = LAYER_ICONS[l];
      row.insertBefore(icon, row.querySelector('.layer-info'));
    }
  });
}

function renderMiddleDevice(kind) {
  const el = document.getElementById('networkMiddle');
  if (!el) return;
  const isSwitch = kind === 'switch';
  el.innerHTML = (isSwitch ? SWITCH_SVG : ROUTER_SVG) + `<span>${isSwitch ? 'Switch' : 'Router'}</span>`;
}

function loadScenario() {
  resetSim();
  currentScenario = document.getElementById('scenarioSelect').value;
  const sc = scenarios[currentScenario];

  document.getElementById('senderIP').textContent = sc.senderIP;
  document.getElementById('receiverIP').textContent = sc.receiverIP;

  for (let l = 1; l <= 7; l++) {
    document.getElementById(`sender-proto-${l}`).textContent = sc.layers[l].proto;
    document.getElementById(`receiver-proto-${l}`).textContent = sc.layers[l].proto;
    document.getElementById(`sender-data-${l}`).textContent = '';
    document.getElementById(`receiver-data-${l}`).textContent = '';
  }

  renderMiddleDevice(sc.middleDevice);

  const mid = sc.middleDevice === 'switch' ? 'Switch (satu subnet)' : 'Router (beda subnet)';
  document.getElementById('networkStatus').textContent = `Skenario: ${sc.name} — Siap`;
  updateExplanation(`<p>Skenario <strong style="color:var(--text-primary);">${sc.name}</strong> siap dijalankan. Perangkat tengah: <strong style="color:var(--accent-cyan);">${mid}</strong>.</p><p style="margin-top:8px;">Tekan <strong>Mulai</strong> untuk animasi otomatis atau <strong>Langkah</strong> untuk maju satu tahap OSI setiap kali.</p>`);
}

function resetSim() {
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  clearInterval(simTimer);
  simState = 'idle';
  currentStep = -1;

  for (let l = 1; l <= 7; l++) {
    document.getElementById(`sender-layer-${l}`).className = 'osi-layer';
    document.getElementById(`receiver-layer-${l}`).className = 'osi-layer';
    document.getElementById(`sender-data-${l}`).textContent = '';
    document.getElementById(`receiver-data-${l}`).textContent = '';
  }

  const ball = document.getElementById('packetBall');
  ball.className = 'packet-ball';
  document.getElementById('packetLabel').textContent = 'DATA';

  document.getElementById('networkStatus').textContent = 'Siap untuk memulai simulasi';
  updateExplanation('Pilih skenario dan tekan <strong>Mulai</strong> atau <strong>Langkah</strong> untuk melihat proses pengiriman data melalui 7 layer OSI.');

  document.getElementById('btnPlay').disabled = false;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnStep').disabled = false;
}

// Selesai: hanya atur status + tombol. TIDAK menyentuh penjelasan, supaya
// teks dekapsulasi Layer 7 (data sampai ke aplikasi) yang baru saja ditulis
// executeStep() tetap terbaca — dulu langkah terakhir ini tertimpa pesan "selesai".
function finishSim() {
  clearInterval(simTimer);
  simState = 'done';
  if (window.LabMayaSound) window.LabMayaSound.play('complete');
  document.getElementById('btnPlay').disabled = true;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnStep').disabled = true;
  document.getElementById('networkStatus').textContent = 'Simulasi selesai!';
}

function playSim() {
  if (simState === 'running' || currentStep >= LAST_STEP) return;
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  simState = 'running';
  document.getElementById('btnPlay').disabled = true;
  document.getElementById('btnPause').disabled = false;
  document.getElementById('btnStep').disabled = true;

  simTimer = setInterval(() => {
    currentStep++;
    executeStep(currentStep);
    if (currentStep >= LAST_STEP) finishSim();
  }, 1400);
}

function pauseSim() {
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  clearInterval(simTimer);
  simState = 'paused';
  document.getElementById('btnPlay').disabled = false;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnStep').disabled = false;
  document.getElementById('networkStatus').textContent = 'Simulasi dijeda';
}

function stepSim() {
  if (currentStep >= LAST_STEP) return;
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  currentStep++;
  executeStep(currentStep);
  if (currentStep >= LAST_STEP) finishSim();
}

function executeStep(step) {
  const sc = scenarios[currentScenario];
  const ball = document.getElementById('packetBall');

  if (step >= 0 && step <= 6) {
    // -------- Enkapsulasi pengirim: layer 7 -> 1 --------
    const layerNum = 7 - step;
    const layer = sc.layers[layerNum];

    for (let l = 1; l <= 7; l++) {
      const el = document.getElementById(`sender-layer-${l}`);
      if (el.classList.contains('active')) {
        el.classList.remove('active');
        el.classList.add('done-send');
      }
    }

    const layerEl = document.getElementById(`sender-layer-${layerNum}`);
    layerEl.classList.add('active');
    document.getElementById(`sender-data-${layerNum}`).textContent = layer.data;

    const pdu = { 7: 'Data', 6: 'Data', 5: 'Data', 4: 'Segment', 3: 'Packet', 2: 'Frame', 1: 'Bits' }[layerNum];
    document.getElementById('networkStatus').textContent = `Enkapsulasi Layer ${layerNum}: ${layer.proto}`;
    updateExplanation(
      `<div style="margin-bottom:8px;"><span style="color:var(--accent-blue);font-weight:700;">Layer ${layerNum} — ${getLayerName(layerNum)}</span> <span style="color:var(--text-muted);">(Enkapsulasi &darr;)</span></div>` +
      `<p>${layer.desc}</p>` +
      `<p style="margin-top:8px;color:var(--text-muted);font-size:0.8rem;">PDU: <strong style="color:var(--accent-cyan);">${pdu}</strong> &middot; Protokol: <strong style="color:var(--accent-cyan);">${layer.proto}</strong></p>`
    );

    if (layerNum === 1) {
      setTimeout(() => { layerEl.classList.remove('active'); layerEl.classList.add('done-send'); }, 800);
    }

  } else if (step === 7) {
    // -------- Frame keluar ke jaringan --------
    for (let l = 1; l <= 7; l++) {
      const el = document.getElementById(`sender-layer-${l}`);
      el.classList.remove('active');
      el.classList.add('done-send');
    }
    ball.className = 'packet-ball visible at-top';
    document.getElementById('packetLabel').textContent = 'FRAME';
    document.getElementById('networkStatus').textContent = 'Frame dikirim ke jaringan...';
    updateExplanation(
      '<div style="margin-bottom:8px;"><span style="color:var(--accent-orange);font-weight:700;">Transmisi ke Jaringan</span></div>' +
      '<p>Ketujuh header sudah terpasang. Frame yang lengkap kini meninggalkan kartu jaringan pengirim sebagai sinyal fisik, lalu bergerak melalui media (kabel/serat optik/WiFi) menuju perangkat jaringan pertama.</p>'
    );

  } else if (step === 8) {
    // -------- Perangkat tengah memproses (kontekstual: switch vs router) --------
    const isSwitch = sc.middleDevice === 'switch';
    ball.className = 'packet-ball visible at-middle';
    document.getElementById('packetLabel').textContent = isSwitch ? 'FRAME' : 'PKT';

    if (isSwitch) {
      document.getElementById('networkStatus').textContent = 'Frame diteruskan oleh Switch...';
      updateExplanation(
        '<div style="margin-bottom:8px;"><span style="color:var(--accent-green);font-weight:700;">Switch Meneruskan Frame</span></div>' +
        '<p>Switch membaca <strong>MAC address tujuan</strong> pada frame (Layer 2) — ia tidak membuka header IP sama sekali. Switch mencari MAC itu di tabel MAC-nya, lalu meneruskan frame <strong>hanya ke port yang tepat</strong>.</p>' +
        '<p style="margin-top:8px;color:var(--text-muted);font-size:0.8rem;">Karena bekerja di Layer 2, switch <strong style="color:var(--accent-cyan);">tidak melakukan routing</strong>: pengirim &amp; penerima satu subnet, frame diteruskan apa adanya.</p>'
      );
    } else {
      document.getElementById('networkStatus').textContent = 'Paket diproses oleh Router...';
      updateExplanation(
        '<div style="margin-bottom:8px;"><span style="color:var(--accent-orange);font-weight:700;">Router Memproses Paket</span></div>' +
        '<p>Router membuka header Ethernet (Layer 2), lalu membaca <strong>IP tujuan</strong> di Layer 3. Ia mencari entri terbaik di tabel routing, menurunkan nilai TTL, membungkus ulang paket dengan header Layer 2 <strong>baru</strong> untuk hop berikutnya, lalu meneruskannya.</p>' +
        '<p style="margin-top:8px;color:var(--text-muted);font-size:0.8rem;">Memilih jalur antar-jaringan seperti ini disebut <strong style="color:var(--accent-cyan);">routing</strong> — dibutuhkan karena pengirim &amp; penerima berada di subnet berbeda.</p>'
      );
    }

  } else if (step === 9) {
    // -------- Paket tiba di penerima --------
    ball.className = 'packet-ball visible at-bottom';
    document.getElementById('packetLabel').textContent = 'FRAME';
    document.getElementById('networkStatus').textContent = 'Frame tiba di penerima...';
    updateExplanation(
      '<div style="margin-bottom:8px;"><span style="color:var(--accent-purple);font-weight:700;">Frame Tiba di Penerima</span></div>' +
      '<p>Frame sampai di kartu jaringan penerima. Sekarang urutan dibalik: proses <strong>dekapsulasi</strong> membuka header satu per satu dari Layer 1 (Physical) naik ke Layer 7 (Application) — kebalikan persis dari enkapsulasi tadi.</p>'
    );

  } else if (step >= 10 && step <= 16) {
    // -------- Dekapsulasi penerima: layer 1 -> 7 (7 langkah penuh, simetris) --------
    const layerNum = step - 9; // step10->L1 ... step16->L7
    const layer = sc.layers[layerNum];

    ball.className = 'packet-ball';

    for (let l = 1; l <= 7; l++) {
      const el = document.getElementById(`receiver-layer-${l}`);
      if (el.classList.contains('active')) {
        el.classList.remove('active');
        el.classList.add('done-receive');
      }
    }

    const layerEl = document.getElementById(`receiver-layer-${layerNum}`);
    layerEl.classList.add('active');
    document.getElementById(`receiver-data-${layerNum}`).textContent = layer.data;

    const conv = { 1: 'Sinyal → Bits', 2: 'Bits → Frame', 3: 'Frame → Packet', 4: 'Packet → Segment', 5: 'Segment → Data', 6: 'Dekripsi → Data', 7: 'Data → Aplikasi' }[layerNum];
    document.getElementById('networkStatus').textContent = `Dekapsulasi Layer ${layerNum}: ${layer.proto}`;

    const isLast = (step === LAST_STEP);
    updateExplanation(
      `<div style="margin-bottom:8px;"><span style="color:var(--accent-purple);font-weight:700;">Layer ${layerNum} — ${getLayerName(layerNum)}</span> <span style="color:var(--text-muted);">(Dekapsulasi &uarr;)</span></div>` +
      `<p>Header Layer ${layerNum} dibaca lalu dilepas. ${layer.recvDesc}</p>` +
      `<p style="margin-top:8px;color:var(--text-muted);font-size:0.8rem;">Konversi: <strong style="color:var(--accent-cyan);">${conv}</strong> &middot; Protokol: <strong style="color:var(--accent-cyan);">${layer.proto}</strong></p>` +
      (isLast ? '<p style="margin-top:10px;color:var(--accent-green);font-weight:600;">&#10003; Data lengkap diterima aplikasi — simulasi selesai.</p>' : '')
    );

    if (isLast) {
      setTimeout(() => { layerEl.classList.remove('active'); layerEl.classList.add('done-receive'); }, 800);
    }
  }
}

function getLayerName(num) {
  return { 7: 'Application', 6: 'Presentation', 5: 'Session', 4: 'Transport', 3: 'Network', 2: 'Data Link', 1: 'Physical' }[num] || '';
}

function updateExplanation(html) {
  document.getElementById('explanationText').innerHTML = html;
}

// Init
renderLayerIcons();
loadScenario();

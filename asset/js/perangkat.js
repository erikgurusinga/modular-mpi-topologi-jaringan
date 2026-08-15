/* ============================================
   Lab Maya - Pengenalan Perangkat Jaringan
   ============================================ */

const deviceData = [
  {
    id: 'router',
    name: 'Router',
    category: 'Perangkat Penghubung',
    color: '#f97316',
    osiLayer: [3],
    layerName: 'Network',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><line x1="10" y1="14" x2="7" y2="4" stroke="#f97316" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="14" x2="25" y2="4" stroke="#f97316" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="4" r="1.4" fill="#f97316"/><circle cx="25" cy="4" r="1.4" fill="#f97316"/><rect x="4" y="14" width="24" height="11" rx="2.5" stroke="#f97316" stroke-width="2" fill="rgba(249,115,22,0.1)"/><circle cx="9" cy="19.5" r="1" fill="#f97316"/><circle cx="13" cy="19.5" r="1" fill="#f97316"/><circle cx="17" cy="19.5" r="1" fill="#f97316"/><line x1="21" y1="25" x2="21" y2="28" stroke="#f97316" stroke-width="1.5"/><line x1="25" y1="25" x2="25" y2="28" stroke="#f97316" stroke-width="1.5"/></svg>`,
    description: 'Router adalah perangkat jaringan yang berfungsi menghubungkan dua atau lebih jaringan yang berbeda dan meneruskan paket data antar jaringan tersebut. Router bekerja pada Layer 3 (Network) model OSI dan menggunakan alamat IP untuk menentukan jalur terbaik pengiriman data.',
    functions: [
      'Menghubungkan jaringan yang berbeda (LAN ke WAN, LAN ke LAN)',
      'Menentukan jalur terbaik (routing) untuk pengiriman paket data',
      'Melakukan Network Address Translation (NAT)',
      'Memfilter lalu lintas jaringan (Access Control List)',
      'Membagi broadcast domain',
      'Menghubungkan jaringan lokal ke internet'
    ],
    pros: [
      'Bisa menghubungkan jaringan yang berbeda, termasuk ke internet',
      'Mendukung banyak jalur (routing) sehingga jaringan lebih fleksibel',
      'Bisa memfilter dan mengatur lalu lintas data (ACL, NAT)'
    ],
    cons: [
      'Harga umumnya lebih mahal dari switch/hub setara',
      'Konfigurasi lebih rumit, perlu pemahaman routing',
      'Memproses tiap paket lebih lambat dibanding switch (Layer 2)'
    ],
    brands: ['TP-Link', 'MikroTik', 'Cisco', 'Huawei', 'ASUS'],
    specs: {
      'Layer OSI': { value: 'Layer 3 (Network)', desc: 'Lapisan tempat router mengambil keputusan routing.' },
      'Menggunakan': { value: 'IP Address', desc: 'Alamat logis untuk menentukan jaringan tujuan paket.' },
      'Tabel': { value: 'Routing Table', desc: 'Daftar jalur terbaik menuju tiap jaringan yang diketahui.' },
      'Jenis': { value: 'Core, Edge, Wireless', desc: 'Kategori router berdasarkan posisi & fungsinya di jaringan.' },
      'Port': { value: 'Ethernet, Serial, SFP', desc: 'Jenis konektor fisik untuk menyambung ke perangkat lain.' },
      'Protokol': { value: 'RIP, OSPF, BGP, EIGRP', desc: 'Protokol untuk bertukar informasi rute antar-router.' }
    }
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Perangkat Penghubung',
    color: '#22c55e',
    osiLayer: [2],
    layerName: 'Data Link',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="3" y="12" width="26" height="10" rx="1.5" stroke="#22c55e" stroke-width="2" fill="rgba(34,197,94,0.08)"/><circle cx="7" cy="14.5" r="0.8" fill="#22c55e"/><circle cx="11" cy="14.5" r="0.8" fill="#22c55e"/><circle cx="15" cy="14.5" r="0.8" fill="#22c55e"/><rect x="6" y="17.5" width="2.2" height="3" fill="#22c55e"/><rect x="10" y="17.5" width="2.2" height="3" fill="#22c55e"/><rect x="14" y="17.5" width="2.2" height="3" fill="#22c55e"/><rect x="18" y="17.5" width="2.2" height="3" fill="#22c55e"/><rect x="22" y="17.5" width="2.2" height="3" fill="#22c55e"/><rect x="26" y="17.5" width="1.4" height="3" fill="#22c55e" opacity="0.5"/></svg>`,
    description: 'Switch adalah perangkat jaringan yang menghubungkan beberapa perangkat dalam satu jaringan lokal (LAN). Switch bekerja pada Layer 2 (Data Link) dan menggunakan MAC Address untuk meneruskan frame hanya ke port tujuan yang tepat, bukan ke semua port seperti hub.',
    functions: [
      'Menghubungkan perangkat dalam satu LAN',
      'Meneruskan frame berdasarkan MAC Address',
      'Menyimpan tabel MAC Address (CAM Table)',
      'Mengurangi collision dengan micro-segmentation',
      'Mendukung VLAN untuk segmentasi jaringan',
      'Mendukung Spanning Tree Protocol (STP) untuk mencegah loop'
    ],
    pros: [
      'Mengurangi collision karena tiap port punya jalur sendiri',
      'Performa lebih cepat & efisien dibanding hub',
      'Mendukung VLAN untuk memisahkan jaringan secara logis'
    ],
    cons: [
      'Tidak bisa menghubungkan jaringan berbeda seperti router',
      'Switch managed harganya lebih mahal & perlu konfigurasi',
      'Tetap bisa jadi satu titik kegagalan (single point of failure)'
    ],
    brands: ['Cisco', 'TP-Link', 'D-Link', 'Huawei', 'Ubiquiti'],
    specs: {
      'Layer OSI': { value: 'Layer 2 (Data Link)', desc: 'Lapisan tempat switch meneruskan frame data.' },
      'Menggunakan': { value: 'MAC Address', desc: 'Alamat fisik unik tiap perangkat untuk penerusan frame.' },
      'Tabel': { value: 'MAC Address Table', desc: 'Daftar MAC Address tiap perangkat per port switch.' },
      'Jenis': { value: 'Unmanaged, Managed, L3', desc: 'Tingkat kemampuan konfigurasi switch.' },
      'Port': { value: '8, 16, 24, 48 port', desc: 'Jumlah port yang umum tersedia di pasaran.' },
      'Kecepatan': { value: '100Mbps, 1Gbps, 10Gbps', desc: 'Kecepatan transfer data maksimum per port.' }
    }
  },
  {
    id: 'hub',
    name: 'Hub',
    category: 'Perangkat Penghubung',
    color: '#64748b',
    osiLayer: [1],
    layerName: 'Physical',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="4" y="13" width="24" height="9" rx="2" stroke="#64748b" stroke-width="2" fill="rgba(100,116,139,0.08)"/><circle cx="9" cy="15.2" r="0.9" fill="#64748b"/><rect x="8" y="17.5" width="2" height="2.5" fill="#64748b"/><rect x="13" y="17.5" width="2" height="2.5" fill="#64748b"/><rect x="18" y="17.5" width="2" height="2.5" fill="#64748b"/><rect x="23" y="17.5" width="2" height="2.5" fill="#64748b"/><line x1="16" y1="22" x2="16" y2="25" stroke="#64748b" stroke-width="1.5"/></svg>`,
    description: 'Hub adalah perangkat jaringan sederhana yang bekerja pada Layer 1 (Physical). Hub meneruskan sinyal yang diterima ke SEMUA port lain tanpa memfilter, sehingga menyebabkan collision dan mengurangi efisiensi. Hub sudah jarang digunakan dan digantikan oleh switch.',
    functions: [
      'Menghubungkan perangkat dalam satu jaringan (repeater multiport)',
      'Meneruskan sinyal ke semua port (broadcast)',
      'Memperkuat sinyal yang diterima',
      'Tidak melakukan filtering — semua perangkat menerima semua data'
    ],
    pros: [
      'Harga sangat murah dan cara pakainya sederhana',
      'Mudah dipasang, tidak perlu konfigurasi apa pun'
    ],
    cons: [
      'Rawan collision karena semua port berbagi satu jalur (half-duplex)',
      'Tidak efisien — data dikirim ke semua port, bukan ke tujuan saja',
      'Tidak mendukung VLAN atau fitur keamanan apa pun',
      'Sudah banyak ditinggalkan, digantikan switch'
    ],
    brands: ['D-Link', 'TP-Link', 'Netgear'],
    specs: {
      'Layer OSI': { value: 'Layer 1 (Physical)', desc: 'Hanya meneruskan sinyal listrik, tanpa membaca alamat.' },
      'Menggunakan': { value: 'Sinyal Listrik', desc: 'Meneruskan sinyal apa adanya tanpa pemrosesan data.' },
      'Mode': { value: 'Half-duplex', desc: 'Hanya bisa kirim atau terima data dalam satu waktu.' },
      'Jenis': { value: 'Passive, Active, Intelligent', desc: 'Tingkatan hub dari yang paling sederhana ke paling pintar.' },
      'Port': { value: '4, 8, 16 port', desc: 'Jumlah port yang umum tersedia di pasaran.' },
      'Kelemahan': { value: 'Collision, tidak efisien', desc: 'Semua port berbagi satu jalur, rawan tabrakan data.' }
    }
  },
  {
    id: 'access_point',
    name: 'Access Point',
    category: 'Perangkat Nirkabel',
    color: '#eab308',
    osiLayer: [1, 2],
    layerName: 'Physical & Data Link',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><path d="M7 6a13 13 0 0 1 18 0" stroke="#eab308" stroke-width="1.3" fill="none" opacity="0.4"/><path d="M10 9a8 8 0 0 1 12 0" stroke="#eab308" stroke-width="1.6" fill="none" opacity="0.7"/><ellipse cx="16" cy="14" rx="9" ry="3.2" stroke="#eab308" stroke-width="2" fill="rgba(234,179,8,0.12)"/><circle cx="16" cy="14" r="2" fill="#eab308"/><line x1="16" y1="17.2" x2="16" y2="23" stroke="#eab308" stroke-width="2"/><line x1="12" y1="26" x2="20" y2="26" stroke="#eab308" stroke-width="2" stroke-linecap="round"/></svg>`,
    description: 'Access Point (AP) adalah perangkat yang memungkinkan perangkat nirkabel (laptop, smartphone) terhubung ke jaringan kabel. AP mengubah sinyal wireless menjadi sinyal kabel dan sebaliknya, bertindak sebagai jembatan antara jaringan kabel dan nirkabel.',
    functions: [
      'Menyediakan konektivitas WiFi untuk perangkat nirkabel',
      'Menjembatani jaringan kabel dan nirkabel',
      'Mengatur channel dan frekuensi WiFi (2.4GHz / 5GHz)',
      'Mendukung enkripsi keamanan (WPA2/WPA3)',
      'Mengelola koneksi banyak perangkat secara bersamaan',
      'Mendukung roaming antar AP dalam jaringan besar'
    ],
    pros: [
      'Memungkinkan perangkat mobile terhubung tanpa kabel',
      'Mudah menambah jangkauan WiFi di area yang luas',
      'Mendukung banyak perangkat terhubung sekaligus'
    ],
    cons: [
      'Kecepatan & sinyal mudah terganggu jarak dan penghalang fisik',
      'Rentan interferensi dari perangkat nirkabel lain',
      'Butuh pengaturan keamanan ekstra agar tidak disusupi'
    ],
    brands: ['Ubiquiti', 'TP-Link', 'Cisco Meraki', 'Aruba'],
    specs: {
      'Layer OSI': { value: 'Layer 1 & 2', desc: 'Mengubah sinyal radio menjadi frame data dan sebaliknya.' },
      'Menggunakan': { value: 'Gelombang Radio', desc: 'Media transmisi data ke perangkat nirkabel.' },
      'Standar': { value: 'WiFi 4/5/6 (802.11)', desc: 'Standar teknologi WiFi yang didukung perangkat.' },
      'Frekuensi': { value: '2.4 GHz, 5 GHz, 6 GHz', desc: 'Pita frekuensi radio yang dipakai untuk transmisi.' },
      'Keamanan': { value: 'WPA2, WPA3', desc: 'Protokol enkripsi untuk mengamankan koneksi WiFi.' },
      'Jangkauan': { value: '30-100 meter (indoor)', desc: 'Perkiraan jarak jangkau sinyal dalam ruangan.' }
    }
  },
  {
    id: 'modem',
    name: 'Modem',
    category: 'Perangkat Konversi',
    color: '#06b6d4',
    osiLayer: [1],
    layerName: 'Physical',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><line x1="24" y1="13" x2="24" y2="7" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="6" r="1.3" fill="#06b6d4"/><rect x="5" y="13" width="22" height="10" rx="2" stroke="#06b6d4" stroke-width="2" fill="rgba(6,182,212,0.08)"/><circle cx="9" cy="18" r="1" fill="#06b6d4"/><circle cx="13" cy="18" r="1" fill="#06b6d4"/><circle cx="17" cy="18" r="1" fill="#06b6d4"/><rect x="21" y="20" width="3" height="2" fill="#06b6d4"/></svg>`,
    description: 'Modem (Modulator-Demodulator) adalah perangkat yang mengubah sinyal digital dari komputer menjadi sinyal analog untuk dikirim melalui saluran telepon/kabel, dan sebaliknya. Modem menghubungkan jaringan lokal ke Internet Service Provider (ISP).',
    functions: [
      'Mengubah sinyal digital menjadi analog (modulasi)',
      'Mengubah sinyal analog menjadi digital (demodulasi)',
      'Menghubungkan jaringan lokal ke ISP / Internet',
      'Mendukung berbagai teknologi: DSL, Kabel, Fiber, 4G/5G',
      'Mengatur sinkronisasi koneksi dengan ISP'
    ],
    pros: [
      'Jadi satu-satunya jalan menghubungkan jaringan lokal ke ISP',
      'Mendukung berbagai teknologi koneksi (DSL, fiber, seluler)'
    ],
    cons: [
      'Tidak bisa membagi jaringan ke banyak perangkat sendirian',
      'Kecepatan sangat bergantung pada layanan ISP',
      'Beberapa jenis modem rentan gangguan cuaca (satelit, seluler)'
    ],
    brands: ['TP-Link', 'Huawei', 'ZTE', 'D-Link'],
    specs: {
      'Layer OSI': { value: 'Layer 1 (Physical)', desc: 'Mengubah sinyal digital ke analog dan sebaliknya.' },
      'Fungsi': { value: 'Modulasi / Demodulasi', desc: 'Proses konversi sinyal agar bisa dikirim lewat saluran ISP.' },
      'Jenis': { value: 'DSL, Cable, Fiber, Cellular', desc: 'Jenis modem berdasarkan media koneksi ke ISP.' },
      'Koneksi': { value: 'RJ-11, Coaxial, Fiber, SIM', desc: 'Jenis konektor fisik ke jalur ISP.' },
      'Kecepatan': { value: '1 Mbps — 10 Gbps', desc: 'Kisaran kecepatan tergantung teknologi yang dipakai.' },
      'Output': { value: 'Port Ethernet ke Router', desc: 'Jalur keluar modem menuju router di jaringan lokal.' }
    }
  },
  {
    id: 'server',
    name: 'Server',
    category: 'Perangkat Komputasi',
    color: '#a855f7',
    osiLayer: [7],
    layerName: 'Application',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="5" y="4" width="22" height="24" rx="1.5" stroke="#a855f7" stroke-width="2" fill="rgba(168,85,247,0.06)"/><rect x="8" y="7.5" width="4" height="4" rx="0.5" stroke="#a855f7" stroke-width="1.3"/><rect x="14" y="7.5" width="4" height="4" rx="0.5" stroke="#a855f7" stroke-width="1.3"/><rect x="20" y="7.5" width="4" height="4" rx="0.5" stroke="#a855f7" stroke-width="1.3"/><line x1="8" y1="16.5" x2="24" y2="16.5" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/><line x1="8" y1="19.5" x2="24" y2="19.5" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/><line x1="8" y1="22.5" x2="24" y2="22.5" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/><circle cx="9" cy="25.5" r="0.9" fill="#a855f7"/></svg>`,
    description: 'Server adalah komputer khusus yang menyediakan layanan (service) kepada komputer lain (client) dalam jaringan. Server memiliki spesifikasi hardware yang lebih tinggi dan berjalan 24/7 untuk melayani permintaan dari banyak client secara bersamaan.',
    functions: [
      'Menyimpan dan menyajikan website (Web Server)',
      'Mengelola file bersama (File Server)',
      'Mengelola database (Database Server)',
      'Mengelola email (Mail Server)',
      'Mengatur hak akses jaringan (Domain Controller)',
      'Memberikan IP otomatis (DHCP Server)',
      'Menerjemahkan nama domain (DNS Server)'
    ],
    pros: [
      'Sanggup melayani banyak client sekaligus secara stabil',
      'Bisa menyala terus-menerus (24/7) dengan keandalan tinggi',
      'Mendukung redundansi data (RAID) agar data tidak mudah hilang'
    ],
    cons: [
      'Harga perangkat & biaya perawatan jauh lebih mahal',
      'Butuh daya listrik & pendinginan yang besar',
      'Jika mati, semua layanan yang bergantung padanya ikut terganggu'
    ],
    brands: ['Dell', 'HPE', 'Lenovo', 'Supermicro'],
    specs: {
      'Layer OSI': { value: 'Layer 7 (Application)', desc: 'Menyediakan layanan langsung ke aplikasi client.' },
      'Prosesor': { value: 'Intel Xeon, AMD EPYC', desc: 'CPU kelas server untuk beban kerja berat & 24/7.' },
      'RAM': { value: '16 GB — 2 TB', desc: 'Kapasitas memori, jauh lebih besar dari komputer biasa.' },
      'Penyimpanan': { value: 'SSD/HDD RAID', desc: 'Beberapa disk digabung untuk kecepatan & keandalan data.' },
      'OS': { value: 'Linux, Windows Server', desc: 'Sistem operasi yang dirancang untuk melayani banyak client.' },
      'Uptime': { value: '24/7 (99.99%)', desc: 'Target waktu server harus selalu menyala & tersedia.' }
    }
  },
  {
    id: 'firewall',
    name: 'Firewall',
    category: 'Perangkat Keamanan',
    color: '#ef4444',
    osiLayer: [3, 4, 7],
    layerName: 'Network — Application',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><path d="M16 3.5L6 7.5v7c0 7 4.3 12.8 10 15 5.7-2.2 10-8 10-15v-7L16 3.5z" stroke="#ef4444" stroke-width="2" fill="rgba(239,68,68,0.08)"/><path d="M11.5 15.5l3 3 6-7" stroke="#ef4444" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    description: 'Firewall adalah perangkat keamanan jaringan yang memantau dan memfilter lalu lintas data masuk dan keluar berdasarkan aturan keamanan yang telah ditetapkan. Firewall berfungsi sebagai penghalang antara jaringan internal yang aman dan jaringan eksternal yang tidak terpercaya.',
    functions: [
      'Memfilter lalu lintas berdasarkan IP, port, dan protokol',
      'Mencegah akses tidak sah ke jaringan internal',
      'Melakukan Stateful Packet Inspection (SPI)',
      'Mendeteksi dan mencegah serangan (IDS/IPS)',
      'Mengatur kebijakan keamanan jaringan',
      'Melakukan logging dan monitoring aktivitas jaringan'
    ],
    pros: [
      'Melindungi jaringan internal dari akses & serangan luar',
      'Bisa mengatur kebijakan lalu lintas data secara rinci',
      'Firewall modern (NGFW) bisa mendeteksi ancaman secara real-time'
    ],
    cons: [
      'Bisa memperlambat lalu lintas jika beban inspeksi terlalu berat',
      'Konfigurasi yang salah bisa memblokir data yang seharusnya sah',
      'Tidak bisa melindungi dari ancaman yang sudah ada di dalam jaringan'
    ],
    brands: ['Fortinet', 'Palo Alto Networks', 'Cisco', 'SonicWall', 'MikroTik'],
    specs: {
      'Layer OSI': { value: 'Layer 3, 4, 7', desc: 'Bisa memeriksa header IP hingga isi data aplikasi.' },
      'Jenis': { value: 'Packet Filter, Stateful, NGFW', desc: 'Tingkatan kecanggihan cara firewall memeriksa data.' },
      'Inspeksi': { value: 'Header, Payload, Application', desc: 'Bagian paket data yang diperiksa firewall.' },
      'Fitur': { value: 'NAT, VPN, IDS/IPS', desc: 'Kemampuan tambahan yang sering digabung ke firewall modern.' },
      'Aturan': { value: 'Allow, Deny, Drop', desc: 'Tindakan firewall terhadap lalu lintas yang diperiksa.' },
      'Mode': { value: 'Inline, Transparent, Routed', desc: 'Cara firewall dipasang di jalur jaringan.' }
    }
  },
  {
    id: 'nic',
    name: 'NIC (Network Interface Card)',
    category: 'Komponen Perangkat',
    color: '#14b8a6',
    osiLayer: [1, 2],
    layerName: 'Physical & Data Link',
    icon: `<svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="4" y="7" width="21" height="16" rx="1.5" stroke="#14b8a6" stroke-width="2" fill="rgba(20,184,166,0.06)"/><rect x="7" y="10" width="6" height="5" rx="0.5" fill="rgba(20,184,166,0.18)" stroke="#14b8a6" stroke-width="1.2"/><line x1="16" y1="10" x2="22" y2="10" stroke="#14b8a6" stroke-width="1.3"/><line x1="16" y1="13" x2="22" y2="13" stroke="#14b8a6" stroke-width="1.3"/><line x1="16" y1="16" x2="22" y2="16" stroke="#14b8a6" stroke-width="1.3"/><path d="M25 7v16" stroke="#14b8a6" stroke-width="2"/><rect x="25" y="9.5" width="4" height="5" rx="0.8" stroke="#14b8a6" stroke-width="1.6" fill="rgba(20,184,166,0.1)"/><line x1="6" y1="23" x2="6" y2="27" stroke="#14b8a6" stroke-width="2"/><line x1="9" y1="23" x2="9" y2="27" stroke="#14b8a6" stroke-width="2"/><line x1="12" y1="23" x2="12" y2="27" stroke="#14b8a6" stroke-width="2"/></svg>`,
    description: 'NIC (Network Interface Card) atau Kartu Jaringan adalah komponen hardware yang memungkinkan komputer terhubung ke jaringan. Setiap NIC memiliki MAC Address unik yang digunakan sebagai identitas di Layer 2. NIC bisa berupa kartu fisik (Ethernet) atau built-in di motherboard.',
    functions: [
      'Menyediakan interface fisik untuk koneksi jaringan',
      'Mengubah data menjadi sinyal listrik/optik untuk transmisi',
      'Menyimpan MAC Address unik sebagai identitas perangkat',
      'Menangani pengiriman dan penerimaan frame data',
      'Mendeteksi collision pada jaringan (CSMA/CD)'
    ],
    pros: [
      'Komponen wajib agar perangkat bisa terhubung ke jaringan',
      'NIC modern mendukung kecepatan sangat tinggi (hingga 100 Gbps)',
      'Tersedia dalam banyak pilihan sesuai kebutuhan (kabel/nirkabel)'
    ],
    cons: [
      'Jika rusak, perangkat kehilangan akses jaringan sepenuhnya',
      'NIC kabel & nirkabel biasanya terpisah, perlu dua komponen',
      'Kecepatan maksimal NIC bergantung pada perangkat lain di jaringan'
    ],
    brands: ['Intel', 'Realtek', 'TP-Link', 'ASUS'],
    specs: {
      'Layer OSI': { value: 'Layer 1 & 2', desc: 'Mengubah data jadi sinyal fisik dan menyimpan MAC Address.' },
      'Identitas': { value: 'MAC Address (48-bit)', desc: 'Alamat unik permanen yang tertanam di tiap NIC.' },
      'Jenis': { value: 'Ethernet, WiFi, Fiber', desc: 'Jenis NIC berdasarkan media transmisinya.' },
      'Kecepatan': { value: '100Mbps — 100Gbps', desc: 'Kecepatan transfer data maksimum yang didukung.' },
      'Koneksi': { value: 'RJ-45, SFP, PCIe', desc: 'Jenis port/slot fisik NIC ke kabel atau motherboard.' },
      'Contoh MAC': { value: 'AA:BB:CC:DD:EE:FF', desc: 'Format penulisan MAC Address, 6 pasang heksadesimal.' }
    }
  }
];

const DETAIL_TABS = [
  { id: 'deskripsi', label: 'Deskripsi' },
  { id: 'fungsi', label: 'Fungsi Utama' },
  { id: 'proscons', label: 'Kelebihan & Kekurangan' },
  { id: 'spesifikasi', label: 'Spesifikasi' },
  { id: 'perbandingan', label: 'Perbandingan' }
];

let selectedDeviceId = 'router';
let selectedTab = 'deskripsi';

function renderDeviceList() {
  const list = document.getElementById('deviceList');
  list.innerHTML = deviceData.map(d => `
    <div class="device-list-item ${d.id === selectedDeviceId ? 'active' : ''}"
         onclick="selectDevice('${d.id}')" id="list-${d.id}">
      <div class="device-list-icon" style="background:${d.color}10;border:1px solid ${d.color}25;">
        ${d.icon}
      </div>
      <div class="device-list-info">
        <h4>${d.name}</h4>
        <span>${d.category}</span>
      </div>
    </div>
  `).join('');
}

function selectDevice(id) {
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  selectedDeviceId = id;

  document.querySelectorAll('.device-list-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`list-${id}`).classList.add('active');

  renderDetail(id);
}

function selectTab(tabId) {
  if (window.LabMayaSound) window.LabMayaSound.play('click');
  selectedTab = tabId;
  renderDetail(selectedDeviceId);
}

function renderDetail(id) {
  const d = deviceData.find(dev => dev.id === id);
  if (!d) return;

  const tabsHtml = DETAIL_TABS.map(t => `
    <button class="device-tab ${selectedTab === t.id ? 'active' : ''}" style="--tab-color:${d.color};" onclick="selectTab('${t.id}')">${t.label}</button>
  `).join('');

  document.getElementById('deviceDetail').innerHTML = `
    <div class="detail-hero" style="background:linear-gradient(180deg, ${d.color}08, transparent);">
      <div class="detail-hero-icon" style="background:${d.color}12;border:2px solid ${d.color}30;">
        ${d.icon}
      </div>
      <h2 style="color:${d.color};">${d.name}</h2>
      <div class="detail-category">${d.category}</div>
    </div>

    <div class="device-tabs">${tabsHtml}</div>

    <div class="tab-panel">
      <div class="detail-fade">${renderTabContent(d)}</div>
    </div>
  `;
}

function renderTabContent(d) {
  const layerColors = {
    1: '#ef4444', 2: '#f97316', 3: '#22c55e', 4: '#3b82f6', 5: '#a855f7', 6: '#a855f7', 7: '#a855f7'
  };

  switch (selectedTab) {
    case 'deskripsi': {
      const layerBadges = d.osiLayer.map(l => {
        const names = { 1: 'Physical', 2: 'Data Link', 3: 'Network', 4: 'Transport', 7: 'Application' };
        return `<span class="layer-badge" style="background:${layerColors[l]}15;color:${layerColors[l]};border:1px solid ${layerColors[l]}30;">Layer ${l} — ${names[l] || ''}</span>`;
      }).join('');
      return `
        <div class="detail-section">
          <p>${d.description}</p>
        </div>
        <div class="detail-section">
          <h3>Layer OSI</h3>
          <div>${layerBadges}</div>
        </div>
      `;
    }

    case 'fungsi':
      return `
        <ul class="function-list">
          ${d.functions.map(f => `
            <li>
              <span class="fn-bullet" style="background:${d.color};"></span>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      `;

    case 'proscons':
      return `
        <div class="proscons-grid">
          <div class="proscons-col">
            <h3 class="proscons-title pros">Kelebihan</h3>
            <ul class="proscons-list">
              ${d.pros.map(p => `<li><span class="pc-icon pc-plus">+</span><span>${p}</span></li>`).join('')}
            </ul>
          </div>
          <div class="proscons-col">
            <h3 class="proscons-title cons">Kekurangan</h3>
            <ul class="proscons-list">
              ${d.cons.map(c => `<li><span class="pc-icon pc-minus">&minus;</span><span>${c}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      `;

    case 'spesifikasi': {
      const specEntries = Object.entries(d.specs);
      return `
        <div class="detail-grid">
          ${specEntries.map(([key, s]) => `
            <div class="spec-card">
              <div class="spec-label">${key}</div>
              <div class="spec-value">${s.value}</div>
              <div class="spec-desc">${s.desc}</div>
            </div>
          `).join('')}
        </div>
        <div class="detail-section" style="margin-top:1.5rem;">
          <h3>Merek Populer di Pasaran</h3>
          <div class="brand-chips">
            ${d.brands.map(b => `<span class="brand-chip" style="border-color:${d.color}30;color:${d.color};background:${d.color}0d;">${b}</span>`).join('')}
          </div>
        </div>
      `;
    }

    case 'perbandingan':
      return getComparison(d.id);

    default:
      return '';
  }
}

function getComparison(id) {
  const comparisons = {
    router: {
      headers: ['Fitur', 'Router', 'Switch', 'Hub'],
      rows: [
        ['Layer OSI', 'Layer 3', 'Layer 2', 'Layer 1'],
        ['Menggunakan', 'IP Address', 'MAC Address', 'Sinyal Listrik'],
        ['Broadcast Domain', 'Membagi', 'Tidak', 'Tidak'],
        ['Collision Domain', 'Membagi', 'Membagi', 'Satu untuk semua'],
        ['Kecerdasan', 'Tinggi', 'Sedang', 'Rendah'],
        ['Harga', 'Mahal', 'Menengah', 'Murah']
      ]
    },
    switch: {
      headers: ['Fitur', 'Switch', 'Hub', 'Bridge'],
      rows: [
        ['Layer OSI', 'Layer 2', 'Layer 1', 'Layer 2'],
        ['Forwarding', 'Per port', 'Semua port', 'Per port'],
        ['Tabel', 'MAC Table', 'Tidak ada', 'MAC Table'],
        ['Collision', 'Tiap port terpisah', 'Shared', 'Tiap port terpisah'],
        ['Port', 'Banyak (8-48)', '4-16', '2-4'],
        ['Kecepatan', 'Full-duplex', 'Half-duplex', 'Full-duplex']
      ]
    },
    hub: {
      headers: ['Fitur', 'Hub', 'Switch', 'Repeater'],
      rows: [
        ['Layer OSI', 'Layer 1', 'Layer 2', 'Layer 1'],
        ['Mode', 'Half-duplex', 'Full-duplex', 'Half-duplex'],
        ['Filtering', 'Tidak', 'Ya (MAC)', 'Tidak'],
        ['Collision', 'Tinggi', 'Rendah', 'Tinggi'],
        ['Efisiensi', 'Rendah', 'Tinggi', 'Rendah'],
        ['Port', 'Multi-port', 'Multi-port', '2 port']
      ]
    },
    access_point: {
      headers: ['Fitur', 'Access Point', 'Router WiFi', 'Repeater WiFi'],
      rows: [
        ['Fungsi', 'Bridge Wireless-Wired', 'Routing + WiFi', 'Memperluas sinyal'],
        ['DHCP', 'Tidak', 'Ya', 'Tidak'],
        ['NAT', 'Tidak', 'Ya', 'Tidak'],
        ['Manajemen', 'Controller-based', 'Standalone', 'Standalone'],
        ['Skalabilitas', 'Tinggi', 'Rendah', 'Rendah']
      ]
    },
    modem: {
      headers: ['Fitur', 'Modem', 'Router', 'ONT'],
      rows: [
        ['Fungsi', 'Modulasi/Demodulasi', 'Routing paket', 'Konversi optik'],
        ['Koneksi ISP', 'Ya', 'Tidak langsung', 'Ya (fiber)'],
        ['Teknologi', 'DSL/Cable/4G', 'Ethernet', 'Fiber Optic'],
        ['Output', 'Ethernet port', 'Multi Ethernet', 'Ethernet port']
      ]
    },
    server: {
      headers: ['Fitur', 'Server', 'PC Desktop', 'Workstation'],
      rows: [
        ['Tujuan', 'Melayani client', 'Penggunaan personal', 'Tugas berat'],
        ['Uptime', '24/7', 'Saat digunakan', 'Saat digunakan'],
        ['CPU', 'Multi-prosesor', 'Single CPU', 'CPU high-end'],
        ['RAM', '16 GB — 2 TB', '4 — 32 GB', '16 — 128 GB'],
        ['Redundansi', 'RAID, PSU ganda', 'Tidak', 'Opsional']
      ]
    },
    firewall: {
      headers: ['Fitur', 'Firewall', 'Router ACL', 'Antivirus'],
      rows: [
        ['Inspeksi', 'Layer 3-7', 'Layer 3-4', 'File/Process'],
        ['Stateful', 'Ya', 'Terbatas', 'Tidak'],
        ['IDS/IPS', 'Ya (NGFW)', 'Tidak', 'Terbatas'],
        ['Lokasi', 'Perimeter jaringan', 'Di router', 'Di endpoint'],
        ['Cakupan', 'Seluruh jaringan', 'Per interface', 'Per perangkat']
      ]
    },
    nic: {
      headers: ['Fitur', 'NIC Ethernet', 'NIC WiFi', 'NIC Fiber'],
      rows: [
        ['Media', 'Kabel UTP', 'Gelombang radio', 'Kabel fiber'],
        ['Koneksi', 'RJ-45', 'Antena', 'SFP/LC'],
        ['Kecepatan', '1-10 Gbps', '300 Mbps-6.9 Gbps', '10-100 Gbps'],
        ['Jarak', '100 meter', '30-100 meter', 'Hingga 80 km'],
        ['Penggunaan', 'LAN, Server', 'Laptop, Mobile', 'Data Center']
      ]
    }
  };

  const comp = comparisons[id];
  if (!comp) return '<p style="color:var(--text-muted);font-size:0.8rem;">Tidak ada data perbandingan.</p>';

  return `
    <table class="comparison-table">
      <thead>
        <tr>${comp.headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${comp.rows.map(row => `
          <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Init
renderDeviceList();
renderDetail('router');

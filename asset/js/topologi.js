/* ============================================
   Lab Maya - Topologi Jaringan Module
   ============================================ */

const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let devices = [];
let connections = [];
let selectedDevice = null;
let draggingDevice = null;
let dragOffset = { x: 0, y: 0 };
let connectSource = null;
let currentMode = 'select';
let selectedDeviceType = 'pc';
let deviceCounter = { pc: 0, laptop: 0, switch: 0, router: 0, server: 0, access_point: 0, smartphone: 0, bridge: 0, modem: 0 };

// Simulation state
let pingSource = null;
let pingAnimation = { active: false, path: [], segmentIndex: 0, segmentProgress: 0, speed: 1.6 };
let ambientTime = 0;

// Workspace view state
let zoom = 1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.15;

// Pan offset, in screen pixels — lets the view be shifted so devices pushed
// off-screen by zooming in are still reachable. Panned by dragging empty
// canvas (any mode's "nothing clicked" case doesn't fire this — only
// 'select' mode's empty-space drag and the mode-independent middle-mouse
// drag do, see the mousedown/mousemove handlers below).
let panX = 0;
let panY = 0;
let isPanning = false;
let panDragStart = { x: 0, y: 0 };
let panOrigin = { x: 0, y: 0 };
const PAN_DRAG_THRESHOLD = 4;

// Undo history — snapshots are plain data (not live Device/connection
// references) pushed *before* a mutating action, so undo just restores the
// most recent one. Capped so it can't grow forever in a long session.
let history = [];
const HISTORY_LIMIT = 50;

const DEVICE_SIZE = 50;
const COLORS = {
  pc: '#3b82f6',
  laptop: '#06b6d4',
  switch: '#22c55e',
  router: '#f97316',
  server: '#a855f7',
  access_point: '#eab308',
  smartphone: '#14b8a6',
  bridge: '#64748b',
  modem: '#6366f1'
};

const DEVICE_NAMES = {
  pc: 'PC',
  laptop: 'Laptop',
  switch: 'Switch',
  router: 'Router',
  server: 'Server',
  access_point: 'Access Point',
  smartphone: 'Smartphone',
  bridge: 'Bridge',
  modem: 'Modem'
};

// Devices that only ever talk over WiFi to an Access Point (no Ethernet
// port in this simulation) — used by isWirelessLink() below.
const WIRELESS_CLIENTS = ['pc', 'laptop', 'smartphone'];

// A link is "wireless" if it touches a Smartphone (always WiFi-only), or if
// it's an Access Point talking to a client device. AP-to-Switch/Router is
// the AP's own wired uplink, so that stays a cable — only its client-facing
// side is WiFi. This drives both the rendering and stays irrelevant to
// reachability: BFS still treats wireless links as valid hops, exactly like
// real WiFi carries data just as well as a cable.
function isWirelessLink(conn) {
  const a = conn.from.type;
  const b = conn.to.type;
  if (a === 'smartphone' || b === 'smartphone') return true;
  if (a === 'access_point' && WIRELESS_CLIENTS.includes(b)) return true;
  if (b === 'access_point' && WIRELESS_CLIENTS.includes(a)) return true;
  return false;
}

// ============ IP / SUBNET HELPERS ============
// Every device carries an IP + prefix (default 192.168.1.0/24, auto-assigned
// so a fresh topology "just works" like before) so Uji Koneksi can simulate
// Layer 3 reachability, not just physical cabling.

function ipToInt(ipStr) {
  const parts = String(ipStr).trim().split('.');
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

function cidrToMaskInt(prefix) {
  return prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
}

function getNetworkInt(ipStr, prefix) {
  const ipInt = ipToInt(ipStr);
  if (ipInt === null) return null;
  return (ipInt & cidrToMaskInt(prefix)) >>> 0;
}

function sameSubnet(a, b) {
  const netA = getNetworkInt(a.ip, a.prefix);
  const netB = getNetworkInt(b.ip, b.prefix);
  if (netA === null || netB === null) return true;
  return netA === netB;
}

// Tracked separately from `devices` (rather than scanning it for the next
// free host octet) because several call sites — see loadExample() — build
// a whole batch of `new Device(...)` before ever pushing them into
// `devices`, so scanning `devices` at construction time would just see
// the same "nothing used yet" state and hand out duplicate IPs.
let ipCounters = {};

function resetIPCounters() {
  ipCounters = {};
}

function nextAutoIP(subnet = '192.168.1') {
  const next = (ipCounters[subnet] || 0) + 1;
  ipCounters[subnet] = next > 254 ? 1 : next;
  return `${subnet}.${ipCounters[subnet]}`;
}

// ============ CANVAS SETUP ============

function resizeCanvas() {
  const workspace = document.getElementById('workspaceArea');
  canvas.width = workspace.clientWidth;
  canvas.height = workspace.clientHeight;
  render();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ============ ZOOM ============
// Zoom is a render-time transform (scale around the canvas center), not a
// change to the canvas's own pixel buffer — so screen<->world coordinate
// conversion (screenToWorld) has to mirror whatever transform render()
// applies, or clicks would land on the wrong device once zoomed.

function screenToWorld(sx, sy) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return {
    x: (sx - panX - cx) / zoom + cx,
    y: (sy - panY - cy) / zoom + cy
  };
}

function setZoom(value) {
  zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
  const label = document.getElementById('btnZoomReset');
  if (label) label.textContent = Math.round(zoom * 100) + '%';
  render();
}

function zoomIn() { setZoom(zoom + ZOOM_STEP); }
function zoomOut() { setZoom(zoom - ZOOM_STEP); }

// "Reset ke 100%" resets pan too — a combined "reset view" action, since
// once you've panned around a zoomed-in canvas, zoom alone getting back to
// 100% but leaving the view scrolled off to one side wouldn't feel like a
// real reset.
function resetZoom() {
  panX = 0;
  panY = 0;
  setZoom(1);
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  setZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
}, { passive: false });

// ============ UNDO HISTORY ============

function snapshotState() {
  return {
    devices: devices.map(d => ({
      id: d.id, type: d.type, x: d.x, y: d.y, name: d.name,
      disabled: d.disabled, ip: d.ip, prefix: d.prefix
    })),
    connections: connections.map(c => ({ fromId: c.from.id, toId: c.to.id, cut: c.cut }))
  };
}

function pushHistory() {
  history.push(snapshotState());
  if (history.length > HISTORY_LIMIT) history.shift();
  updateUndoButtonState();
}

function restoreSnapshot(snap) {
  const deviceMap = {};
  devices = snap.devices.map(sd => {
    // Rebuild via Device.prototype (not `new Device(...)`) so restoring a
    // snapshot doesn't burn numbers from deviceCounter/ipCounters that were
    // never really "used" in this timeline.
    const dev = Object.assign(Object.create(Device.prototype), {
      id: sd.id, type: sd.type, x: sd.x, y: sd.y, name: sd.name,
      color: COLORS[sd.type], size: DEVICE_SIZE,
      disabled: sd.disabled, ip: sd.ip, prefix: sd.prefix
    });
    deviceMap[sd.id] = dev;
    return dev;
  });
  connections = snap.connections.map(sc => ({
    from: deviceMap[sc.fromId], to: deviceMap[sc.toId], cut: sc.cut
  }));
}

function updateUndoButtonState() {
  const btn = document.getElementById('btnUndo');
  if (btn) btn.disabled = history.length === 0;
}

function undo() {
  if (history.length === 0) {
    showToast('Tidak ada yang bisa di-undo', 'info');
    return;
  }
  restoreSnapshot(history.pop());
  updateUndoButtonState();
  selectedDevice = null;
  draggingDevice = null;
  connectSource = null;
  resetPingState();
  showDeviceInfo(null);
  resetPingResultPanel();
  hideNetworkAnalysis();
  renderTopologyPanel();
  showToast('Undo berhasil', 'success');
}

// ============ DEVICE CLASS ============

class Device {
  constructor(type, x, y) {
    deviceCounter[type]++;
    this.id = Date.now() + Math.random();
    this.type = type;
    this.x = x;
    this.y = y;
    this.name = DEVICE_NAMES[type] + ' ' + deviceCounter[type];
    this.color = COLORS[type];
    this.size = DEVICE_SIZE;
    this.disabled = false;
    this.ip = nextAutoIP();
    this.prefix = 24;
  }

  containsPoint(px, py) {
    return px >= this.x - this.size / 2 && px <= this.x + this.size / 2 &&
           py >= this.y - this.size / 2 && py <= this.y + this.size / 2;
  }

  draw(ctx, isSelected) {
    const s = this.size;
    const x = this.x;
    const y = this.y;
    const color = this.color;

    ctx.save();
    if (this.disabled) ctx.globalAlpha = 0.35;

    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - s / 2 - 6, y - s / 2 - 6, s + 12, s + 12);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = 'rgba(26, 35, 50, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const r = 8;
    const left = x - s / 2;
    const top = y - s / 2;
    ctx.beginPath();
    ctx.moveTo(left + r, top);
    ctx.lineTo(left + s - r, top);
    ctx.quadraticCurveTo(left + s, top, left + s, top + r);
    ctx.lineTo(left + s, top + s - r);
    ctx.quadraticCurveTo(left + s, top + s, left + s - r, top + s);
    ctx.lineTo(left + r, top + s);
    ctx.quadraticCurveTo(left, top + s, left, top + s - r);
    ctx.lineTo(left, top + r);
    ctx.quadraticCurveTo(left, top, left + r, top);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    this.drawIcon(ctx, x, y, s, color);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, x, y + s / 2 + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(`${this.ip}/${this.prefix}`, x, y + s / 2 + 28);

    ctx.restore();

    if (this.disabled) {
      ctx.save();
      const bx = x + s / 2 - 3;
      const by = y - s / 2 + 3;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0e17';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx - 3.5, by - 3.5); ctx.lineTo(bx + 3.5, by + 3.5);
      ctx.moveTo(bx + 3.5, by - 3.5); ctx.lineTo(bx - 3.5, by + 3.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Detailed, more realistic per-device icon (canvas-drawn). Ports are drawn
  // as small notches on the body so devices with visible ports (switch,
  // router, server) look like real hardware, not abstract symbols.
  drawIcon(ctx, x, y, s, color) {
    const cx = x;
    const cy = y;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;

    switch (this.type) {
      case 'pc':
        // monitor
        ctx.strokeRect(cx - 11, cy - 12, 22, 15);
        ctx.fillStyle = color + '18';
        ctx.fillRect(cx - 11, cy - 12, 22, 15);
        ctx.strokeStyle = color;
        ctx.strokeRect(cx - 9, cy - 10, 18, 11);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx + 7, cy + 0.5, 1, 0, Math.PI * 2); ctx.fill();
        // stand + base
        ctx.beginPath(); ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 7, cy + 8); ctx.lineTo(cx + 7, cy + 8); ctx.stroke();
        break;

      case 'laptop':
        ctx.strokeRect(cx - 10, cy - 11, 20, 13);
        ctx.fillStyle = color + '18';
        ctx.fillRect(cx - 10, cy - 11, 20, 13);
        ctx.strokeStyle = color;
        ctx.strokeRect(cx - 8, cy - 9, 16, 9);
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy + 5);
        ctx.lineTo(cx - 10, cy + 2);
        ctx.lineTo(cx + 10, cy + 2);
        ctx.lineTo(cx + 14, cy + 5);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = color + '12';
        ctx.fill();
        ctx.strokeRect(cx - 3, cy + 3, 6, 1.6);
        break;

      case 'switch': {
        ctx.strokeRect(cx - 16, cy - 7, 32, 14);
        ctx.fillStyle = color + '12';
        ctx.fillRect(cx - 16, cy - 7, 32, 14);
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(cx - 12 + i * 6, cy - 3.5, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = color;
        for (let i = 0; i < 5; i++) {
          const px = cx - 12 + i * 6;
          ctx.strokeRect(px - 1.5, cy + 1.5, 3, 4.5);
        }
        break;
      }

      case 'router':
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(cx - 7, cy - 6); ctx.lineTo(cx - 9, cy - 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 7, cy - 6); ctx.lineTo(cx + 9, cy - 15); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx - 9, cy - 15, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 9, cy - 15, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeRect(cx - 13, cy - 6, 26, 12);
        ctx.fillStyle = color + '12';
        ctx.fillRect(cx - 13, cy - 6, 26, 12);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx - 8, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - 3, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 2, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.strokeRect(cx + 7, cy - 2, 4, 5);
        break;

      case 'server':
        ctx.strokeRect(cx - 9, cy - 14, 18, 28);
        ctx.fillStyle = color + '10';
        ctx.fillRect(cx - 9, cy - 14, 18, 28);
        ctx.strokeStyle = color;
        ctx.strokeRect(cx - 6, cy - 11, 4.5, 4.5);
        ctx.strokeRect(cx + 0.5, cy - 11, 4.5, 4.5);
        ctx.beginPath(); ctx.moveTo(cx - 6, cy - 2); ctx.lineTo(cx + 6, cy - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 6, cy + 3); ctx.lineTo(cx + 6, cy + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 6, cy + 8); ctx.lineTo(cx + 6, cy + 8); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx - 6, cy + 11, 1, 0, Math.PI * 2); ctx.fill();
        break;

      case 'access_point':
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, cy - 4, 10, 3.2, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = color + '15';
        ctx.beginPath(); ctx.ellipse(cx, cy - 4, 10, 3.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx, cy - 4, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.lineTo(cx, cy + 9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 5, cy + 9); ctx.lineTo(cx + 5, cy + 9); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 6, cy - 12, 7, -Math.PI * 0.15, Math.PI * 0.35); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 6, cy - 12, 7, Math.PI * 0.65, Math.PI * 1.15); ctx.stroke();
        break;

      case 'smartphone':
        ctx.strokeRect(cx - 7, cy - 14, 14, 26);
        ctx.fillStyle = color + '18';
        ctx.fillRect(cx - 7, cy - 14, 14, 26);
        ctx.strokeStyle = color;
        ctx.strokeRect(cx - 5.5, cy - 11.5, 11, 19);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx, cy + 9.5, 1.1, 0, Math.PI * 2); ctx.fill();
        break;

      case 'bridge':
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 4);
        ctx.quadraticCurveTo(cx, cy - 13, cx + 10, cy - 4);
        ctx.stroke();
        ctx.strokeRect(cx - 15, cy - 4, 10, 10);
        ctx.strokeRect(cx + 5, cy - 4, 10, 10);
        ctx.fillStyle = color + '15';
        ctx.fillRect(cx - 15, cy - 4, 10, 10);
        ctx.fillRect(cx + 5, cy - 4, 10, 10);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx - 10, cy + 1, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 10, cy + 1, 1.4, 0, Math.PI * 2); ctx.fill();
        break;

      case 'modem':
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(cx + 9, cy - 6); ctx.lineTo(cx + 9, cy - 14); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx + 9, cy - 15, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeRect(cx - 13, cy - 6, 26, 12);
        ctx.fillStyle = color + '12';
        ctx.fillRect(cx - 13, cy - 6, 26, 12);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx - 8, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - 4, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.strokeRect(cx + 5, cy + 8, 4, 3);
        break;
    }
  }
}

// ============ GEOMETRY HELPERS (cable-to-port anchoring) ============

// Point where a ray from a device's center, at a given angle, exits its
// rounded-box outline — used so cables visually terminate at the edge of
// the device (like plugging into a port) instead of floating to its center.
function getBoxEdgePoint(device, angle) {
  const half = device.size / 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const tX = dx !== 0 ? half / Math.abs(dx) : Infinity;
  const tY = dy !== 0 ? half / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: device.x + dx * t, y: device.y + dy * t };
}

function getConnectionPoints(conn) {
  const angle = Math.atan2(conn.to.y - conn.from.y, conn.to.x - conn.from.x);
  return {
    p1: getBoxEdgePoint(conn.from, angle),
    p2: getBoxEdgePoint(conn.to, angle + Math.PI)
  };
}

function drawPortConnector(p, color) {
  ctx.fillStyle = color;
  ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
  ctx.strokeStyle = '#0a0e17';
  ctx.lineWidth = 1;
  ctx.strokeRect(p.x - 2.5, p.y - 2.5, 5, 5);
}

// ============ RENDERING ============

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  const zcx = canvas.width / 2;
  const zcy = canvas.height / 2;
  ctx.translate(zcx + panX, zcy + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-zcx, -zcy);

  connections.forEach(conn => {
    const { p1, p2 } = getConnectionPoints(conn);
    const isSelectedConn = selectedDevice &&
      (conn.from.id === selectedDevice.id || conn.to.id === selectedDevice.id);
    const wireless = isWirelessLink(conn);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (conn.cut) {
      ctx.strokeStyle = '#ef444490';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
    } else if (currentMode === 'delete') {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#ef444480';
      ctx.lineWidth = isSelectedConn ? 2.5 : 2;
    } else if (wireless) {
      // Dashed amber line, no port connectors — a radio link, not a cable.
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = isSelectedConn ? '#eab308' : '#eab30875';
      ctx.lineWidth = isSelectedConn ? 2.2 : 1.7;
    } else {
      ctx.strokeStyle = isSelectedConn ? '#3b82f6' : '#3a4a62';
      ctx.lineWidth = isSelectedConn ? 2.5 : 2;
    }

    ctx.stroke();
    ctx.setLineDash([]);

    if (!conn.cut) {
      if (!wireless) {
        drawPortConnector(p1, conn.from.color);
        drawPortConnector(p2, conn.to.color);
      }

      if (!conn.from.disabled && !conn.to.disabled) {
        drawAmbientTraffic(p1, p2);
      }
    } else {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX - 5, midY - 5); ctx.lineTo(midX + 5, midY + 5);
      ctx.moveTo(midX + 5, midY - 5); ctx.lineTo(midX - 5, midY + 5);
      ctx.stroke();
    }
  });

  if (currentMode === 'connect' && connectSource) {
    ctx.beginPath();
    ctx.moveTo(connectSource.x, connectSource.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = '#3b82f650';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (currentMode === 'ping' && pingSource) {
    ctx.beginPath();
    ctx.moveTo(pingSource.x, pingSource.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = '#22c55e50';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  devices.forEach(device => {
    const isSelected = selectedDevice && device.id === selectedDevice.id;
    device.draw(ctx, isSelected);
  });

  drawPingPacket();
  ctx.restore();
  updateStatus();
}

// Small dot drifting along an active link, purely to make the topology feel
// "alive" once it's wired up — not tied to any specific test.
function drawAmbientTraffic(p1, p2) {
  const t = (ambientTime * 0.35) % 1;
  const x = p1.x + (p2.x - p1.x) * t;
  const y = p1.y + (p2.y - p1.y) * t;
  ctx.fillStyle = 'rgba(96, 165, 250, 0.55)';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPingPacket() {
  if (!pingAnimation.active) return;
  const path = pingAnimation.path;
  const from = path[pingAnimation.segmentIndex];
  const to = path[pingAnimation.segmentIndex + 1];
  if (!from || !to) return;

  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const p1 = getBoxEdgePoint(from, angle);
  const p2 = getBoxEdgePoint(to, angle + Math.PI);
  const t = pingAnimation.segmentProgress;
  const x = p1.x + (p2.x - p1.x) * t;
  const y = p1.y + (p2.y - p1.y) * t;

  ctx.save();
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============ ANIMATION LOOP ============

let lastFrameTime = performance.now();

function animate(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  ambientTime += dt;

  if (pingAnimation.active) {
    pingAnimation.segmentProgress += dt * pingAnimation.speed;
    if (pingAnimation.segmentProgress >= 1) {
      pingAnimation.segmentProgress = 0;
      pingAnimation.segmentIndex++;
      if (pingAnimation.segmentIndex >= pingAnimation.path.length - 1) {
        pingAnimation.active = false;
        showToast('Paket sampai di tujuan', 'success');
      }
    }
  }

  render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ============ MOUSE EVENTS ============

let mousePos = { x: 0, y: 0 };

canvas.addEventListener('mousemove', (e) => {
  if (isPanning) {
    const dx = e.clientX - panDragStart.x;
    const dy = e.clientY - panDragStart.y;
    if (Math.abs(dx) > PAN_DRAG_THRESHOLD || Math.abs(dy) > PAN_DRAG_THRESHOLD) {
      panX = panOrigin.x + dx;
      panY = panOrigin.y + dy;
      canvas.style.cursor = 'grabbing';
      render();
    }
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  mousePos.x = world.x;
  mousePos.y = world.y;

  document.getElementById('statusCoords').textContent =
    `X: ${Math.round(mousePos.x)}, Y: ${Math.round(mousePos.y)}`;

  if (draggingDevice) {
    draggingDevice.x = mousePos.x - dragOffset.x;
    draggingDevice.y = mousePos.y - dragOffset.y;
    return;
  }

  let hovering = false;
  devices.forEach(d => {
    if (d.containsPoint(mousePos.x, mousePos.y)) {
      hovering = true;
    }
  });
  canvas.style.cursor = hovering
    ? (currentMode === 'delete' || currentMode === 'fault' ? 'pointer' : (currentMode === 'connect' || currentMode === 'ping') ? 'crosshair' : 'grab')
    : (currentMode === 'place' ? 'crosshair' : currentMode === 'select' ? 'grab' : 'default');
});

canvas.addEventListener('mousedown', (e) => {
  // Middle-mouse-button drag pans the view in *any* mode, without having
  // to switch to Pilih first — handy when zoomed in while placing/
  // connecting devices and a device you need is off-screen.
  if (e.button === 1) {
    e.preventDefault();
    isPanning = true;
    panDragStart = { x: e.clientX, y: e.clientY };
    panOrigin = { x: panX, y: panY };
    canvas.style.cursor = 'grabbing';
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  const mx = world.x;
  const my = world.y;

  const clickedDevice = devices.find(d => d.containsPoint(mx, my));

  switch (currentMode) {
    case 'select':
      if (clickedDevice) {
        pushHistory();
        selectedDevice = clickedDevice;
        draggingDevice = clickedDevice;
        dragOffset.x = mx - clickedDevice.x;
        dragOffset.y = my - clickedDevice.y;
        canvas.style.cursor = 'grabbing';
        showDeviceInfo(clickedDevice);
      } else {
        selectedDevice = null;
        showDeviceInfo(null);
        // Might just be a click-to-deselect, or the start of a drag to pan
        // the view — mousemove below decides which once it sees whether
        // the mouse actually moved past a small threshold.
        isPanning = true;
        panDragStart = { x: e.clientX, y: e.clientY };
        panOrigin = { x: panX, y: panY };
      }
      break;

    case 'place':
      if (!clickedDevice) {
        pushHistory();
        const device = new Device(selectedDeviceType, mx, my);
        devices.push(device);
        selectedDevice = device;
        showDeviceInfo(device);
        showToast(`${DEVICE_NAMES[selectedDeviceType]} berhasil ditambahkan`, 'success');
        hideNetworkAnalysis();
        renderTopologyPanel();
      }
      break;

    case 'connect':
      if (clickedDevice) {
        if (!connectSource) {
          connectSource = clickedDevice;
          selectedDevice = clickedDevice;
          showToast('Klik perangkat kedua untuk menghubungkan', 'info');
        } else if (clickedDevice.id !== connectSource.id) {
          const exists = connections.some(c =>
            (c.from.id === connectSource.id && c.to.id === clickedDevice.id) ||
            (c.from.id === clickedDevice.id && c.to.id === connectSource.id)
          );
          if (!exists) {
            pushHistory();
            connections.push({ from: connectSource, to: clickedDevice, cut: false });
            showToast('Koneksi berhasil dibuat', 'success');
            if (window.LabMayaSound) window.LabMayaSound.play('success');
            hideNetworkAnalysis();
            renderTopologyPanel();
          } else {
            showToast('Koneksi sudah ada', 'error');
          }
          connectSource = null;
        }
      } else {
        connectSource = null;
      }
      break;

    case 'delete':
      if (clickedDevice) {
        pushHistory();
        devices = devices.filter(d => d.id !== clickedDevice.id);
        connections = connections.filter(c =>
          c.from.id !== clickedDevice.id && c.to.id !== clickedDevice.id
        );
        if (selectedDevice && selectedDevice.id === clickedDevice.id) {
          selectedDevice = null;
          showDeviceInfo(null);
        }
        resetPingState();
        showToast(`${clickedDevice.name} dihapus`, 'success');
        hideNetworkAnalysis();
        renderTopologyPanel();
      } else {
        const clickedConn = findConnectionAt(mx, my);
        if (clickedConn) {
          pushHistory();
          connections = connections.filter(c => c !== clickedConn);
          showToast('Koneksi dihapus', 'success');
          hideNetworkAnalysis();
          renderTopologyPanel();
        }
      }
      break;

    case 'ping':
      if (clickedDevice) {
        if (clickedDevice.disabled) {
          showToast(`${clickedDevice.name} sedang mati`, 'error');
          break;
        }
        if (!pingSource) {
          pingSource = clickedDevice;
          selectedDevice = clickedDevice;
          showToast('Klik perangkat tujuan untuk menguji koneksi', 'info');
        } else if (clickedDevice.id !== pingSource.id) {
          runPingTest(pingSource, clickedDevice);
          pingSource = null;
        }
      } else {
        pingSource = null;
      }
      break;

    case 'fault':
      if (clickedDevice) {
        pushHistory();
        clickedDevice.disabled = !clickedDevice.disabled;
        showToast(
          `${clickedDevice.name} ${clickedDevice.disabled ? 'dimatikan' : 'dinyalakan kembali'}`,
          clickedDevice.disabled ? 'error' : 'success'
        );
        // Fault state now factors into the on-demand card's "Kondisi
        // Jaringan Saat Ini" section, so — unlike a plain select/pan — this
        // has to invalidate it, or a stale disabled/cut list stays on screen.
        hideNetworkAnalysis();
        renderTopologyPanel();
      } else {
        const clickedConn = findConnectionAt(mx, my);
        if (clickedConn) {
          pushHistory();
          clickedConn.cut = !clickedConn.cut;
          showToast(
            `Koneksi ${clickedConn.cut ? 'diputus' : 'disambung kembali'}`,
            clickedConn.cut ? 'error' : 'success'
          );
          hideNetworkAnalysis();
          renderTopologyPanel();
        }
      }
      break;
  }
});

canvas.addEventListener('mouseup', () => {
  draggingDevice = null;
  isPanning = false;
  canvas.style.cursor = currentMode === 'place' ? 'crosshair' : (currentMode === 'select' ? 'grab' : 'default');
});

canvas.addEventListener('mouseleave', () => {
  draggingDevice = null;
  isPanning = false;
});

function findConnectionAt(x, y) {
  for (const conn of connections) {
    const { p1, p2 } = getConnectionPoints(conn);
    const dist = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
    if (dist < 8) return conn;
  }
  return null;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  param = Math.max(0, Math.min(1, param));
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}

// ============ MODE MANAGEMENT ============

function setMode(mode) {
  currentMode = mode;
  connectSource = null;
  pingSource = null;

  document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
  const btnMap = {
    select: 'btnSelect', place: 'btnPlace', connect: 'btnConnect',
    delete: 'btnDelete', ping: 'btnPing', fault: 'btnFault'
  };
  if (btnMap[mode]) document.getElementById(btnMap[mode]).classList.add('active');

  const modeNames = {
    select: 'Pilih', place: 'Tambah', connect: 'Hubungkan',
    delete: 'Hapus', ping: 'Uji Koneksi', fault: 'Gangguan'
  };
  document.getElementById('statusMode').textContent = modeNames[mode] || mode;

  canvas.style.cursor = (mode === 'place' || mode === 'connect' || mode === 'ping') ? 'crosshair' : 'default';
}

// ============ DEVICE PALETTE ============

document.querySelectorAll('.device-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.device-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    selectedDeviceType = item.dataset.type;
    setMode('place');
  });
});

// ============ DEVICE INFO PANEL ============

function showDeviceInfo(device) {
  const container = document.getElementById('deviceInfo');
  if (!device) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p>Klik perangkat pada canvas untuk melihat detailnya</p>
      </div>`;
    return;
  }

  const connCount = connections.filter(c =>
    c.from.id === device.id || c.to.id === device.id
  ).length;

  const connectedTo = connections
    .filter(c => c.from.id === device.id || c.to.id === device.id)
    .map(c => c.from.id === device.id ? c.to.name : c.from.name);

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <div style="width:40px;height:40px;border-radius:8px;background:${device.color}15;border:1px solid ${device.color}30;display:flex;align-items:center;justify-content:center;">
        <div style="width:10px;height:10px;border-radius:50%;background:${device.color}"></div>
      </div>
      <div>
        <div style="font-weight:600;font-size:0.9rem;">${device.name}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${DEVICE_NAMES[device.type]}</div>
      </div>
    </div>
    <ul class="prop-list">
      <li><span class="prop-key">Tipe</span><span class="prop-val">${DEVICE_NAMES[device.type]}</span></li>
      <li><span class="prop-key">Status</span><span class="prop-val" style="color:${device.disabled ? 'var(--accent-red)' : 'var(--accent-green)'};">${device.disabled ? 'Mati' : 'Aktif'}</span></li>
      <li><span class="prop-key">Posisi X</span><span class="prop-val">${Math.round(device.x)}</span></li>
      <li><span class="prop-key">Posisi Y</span><span class="prop-val">${Math.round(device.y)}</span></li>
      <li><span class="prop-key">Koneksi</span><span class="prop-val">${connCount}</span></li>
      ${connectedTo.length > 0
        ? `<li><span class="prop-key">Terhubung ke</span><span class="prop-val" style="text-align:right;max-width:140px;word-wrap:break-word;">${connectedTo.join(', ')}</span></li>`
        : ''
      }
    </ul>
    <div style="margin-top:12px;">
      <label class="form-label" style="font-size:0.68rem;">Nama Perangkat</label>
      <input type="text" class="form-input" value="${device.name}"
        onchange="renameDevice('${device.id}', this.value)"
        placeholder="Nama perangkat" style="font-family:Inter,sans-serif;font-size:0.8rem;">
    </div>
    <div style="margin-top:8px;display:grid;grid-template-columns:2fr 1fr;gap:8px;">
      <div>
        <label class="form-label" style="font-size:0.68rem;">Alamat IP</label>
        <input type="text" class="form-input" value="${device.ip}"
          onchange="setDeviceIP('${device.id}', this.value)"
          placeholder="192.168.1.10" style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;">
      </div>
      <div>
        <label class="form-label" style="font-size:0.68rem;">Prefix</label>
        <select class="form-input" onchange="setDevicePrefix('${device.id}', this.value)" style="font-size:0.78rem;">
          ${[8, 16, 24, 25, 26, 27, 28].map(p => `<option value="${p}" ${device.prefix === p ? 'selected' : ''}>/${p}</option>`).join('')}
        </select>
      </div>
    </div>
    <button class="btn btn-secondary btn-sm btn-block" style="margin-top:10px;" onclick="toggleDeviceDisabled('${device.id}')">
      ${device.disabled ? 'Nyalakan Perangkat' : 'Matikan Perangkat (Simulasi Gangguan)'}
    </button>
  `;
}

function renameDevice(id, name) {
  const device = devices.find(d => String(d.id) === String(id));
  if (device) {
    pushHistory();
    device.name = name;
    showDeviceInfo(device);
  }
}

function setDeviceIP(id, value) {
  const device = devices.find(d => String(d.id) === String(id));
  if (!device) return;
  const trimmed = value.trim();
  if (ipToInt(trimmed) === null) {
    showToast('Format IP tidak valid, gunakan mis. 192.168.1.10', 'error');
    showDeviceInfo(device);
    return;
  }
  pushHistory();
  device.ip = trimmed;
  showDeviceInfo(device);
}

function setDevicePrefix(id, value) {
  const device = devices.find(d => String(d.id) === String(id));
  if (!device) return;
  pushHistory();
  device.prefix = parseInt(value);
  showDeviceInfo(device);
}

function toggleDeviceDisabled(id) {
  const device = devices.find(d => String(d.id) === String(id));
  if (!device) return;
  pushHistory();
  device.disabled = !device.disabled;
  showToast(`${device.name} ${device.disabled ? 'dimatikan' : 'dinyalakan kembali'}`, device.disabled ? 'error' : 'success');
  showDeviceInfo(device);
  // The on-demand card's "Kondisi Jaringan Saat Ini" section reads live
  // fault state, so this has to invalidate an already-open card.
  hideNetworkAnalysis();
  renderTopologyPanel();
}

// ============ CONNECTIVITY GRAPH (used by Uji Koneksi & network summary) ============

function buildAdjacency() {
  const adj = {};
  devices.forEach(d => { adj[d.id] = []; });
  connections.forEach(c => {
    if (c.cut || c.from.disabled || c.to.disabled) return;
    adj[c.from.id].push(c.to.id);
    adj[c.to.id].push(c.from.id);
  });
  return adj;
}

function bfsPath(sourceId, targetId) {
  const adj = buildAdjacency();
  const visited = new Set([sourceId]);
  const queue = [[sourceId]];
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === targetId) return path;
    for (const next of (adj[node] || [])) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }
  return null;
}

// ============ UJI KONEKSI (PING SIMULATION) ============

function runPingTest(source, target) {
  const idPath = bfsPath(source.id, target.id);

  if (!idPath) {
    showPingResult(null, source, target, 'physical');
    showToast('Tidak ada jalur fisik ke tujuan', 'error');
    if (window.LabMayaSound) window.LabMayaSound.play('close');
    return;
  }

  const devicePath = idPath.map(id => devices.find(d => d.id === id));

  // Physically connected doesn't automatically mean reachable: devices in
  // different subnets need a Router somewhere on the path, just like real
  // networks (a switch/hub alone can't route between subnets).
  const crossSubnet = !sameSubnet(source, target);
  const hasRouterInPath = devicePath.some(d => d.type === 'router');

  if (crossSubnet && !hasRouterInPath) {
    showPingResult(devicePath, source, target, 'subnet');
    showToast('Beda subnet, tidak ada Router di jalur', 'error');
    if (window.LabMayaSound) window.LabMayaSound.play('close');
    return;
  }

  showPingResult(devicePath, source, target, 'success');
  pingAnimation = { active: true, path: devicePath, segmentIndex: 0, segmentProgress: 0, speed: 1.6 };
  showToast('Menguji koneksi...', 'info');
  if (window.LabMayaSound) window.LabMayaSound.play('success');
}

function resetPingState() {
  pingSource = null;
  pingAnimation.active = false;
}

function resetPingResultPanel() {
  document.getElementById('pingResult').innerHTML = `
    <div class="empty-state"><p style="font-size:0.8rem;">Gunakan mode Uji Koneksi untuk menguji jalur antar perangkat</p></div>`;
}

function pingPathChips(devicePath) {
  return `
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:0.72rem;margin-top:8px;">
      ${devicePath.map((d, i) => `<span style="padding:3px 9px;border-radius:100px;background:${d.color}15;color:${d.color};border:1px solid ${d.color}30;font-weight:600;">${d.name}</span>${i < devicePath.length - 1 ? '<span style="color:var(--text-muted);">&rarr;</span>' : ''}`).join('')}
    </div>`;
}

function showPingResult(devicePath, source, target, status) {
  const container = document.getElementById('pingResult');
  if (!container) return;

  const ipLine = `<p style="font-size:0.72rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:6px;">${source.ip}/${source.prefix} &rarr; ${target.ip}/${target.prefix}</p>`;

  if (status === 'physical') {
    container.innerHTML = `
      <div class="result-card" style="border-color:rgba(239,68,68,0.3);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div style="font-weight:700;color:#ef4444;font-size:0.9rem;">Tidak Terhubung</div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">Tidak ada jalur fisik dari <strong style="color:var(--text-primary);">${source.name}</strong> ke <strong style="color:var(--text-primary);">${target.name}</strong>. Periksa apakah ada perangkat yang mati atau koneksi yang terputus.</p>
        ${ipLine}
      </div>`;
    return;
  }

  if (status === 'subnet') {
    container.innerHTML = `
      <div class="result-card" style="border-color:rgba(234,179,8,0.3);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(234,179,8,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div style="font-weight:700;color:#eab308;font-size:0.9rem;">Beda Subnet</div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">Terhubung secara fisik, tapi <strong style="color:var(--text-primary);">${source.name}</strong> dan <strong style="color:var(--text-primary);">${target.name}</strong> berada di jaringan (subnet) yang berbeda, dan tidak ada <strong style="color:var(--text-primary);">Router</strong> di jalurnya untuk merutekan data antar-jaringan.</p>
        ${ipLine}
        ${pingPathChips(devicePath)}
      </div>`;
    return;
  }

  const hops = devicePath.length - 1;
  const crossSubnet = !sameSubnet(source, target);
  container.innerHTML = `
    <div class="result-card" style="border-color:rgba(34,197,94,0.3);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style="font-weight:700;color:#22c55e;font-size:0.9rem;">Terhubung &mdash; ${hops} hop${crossSubnet ? ' (lewat Router)' : ''}</div>
      </div>
      <p style="font-size:0.78rem;color:var(--text-muted);">Jalur dari ${source.name} ke ${target.name}${crossSubnet ? ', melintasi 2 subnet berbeda' : ''}:</p>
      ${ipLine}
      ${pingPathChips(devicePath)}
    </div>`;
}

// ============ TOPOLOGY ANALYSIS ============

// Pure detection: reads current devices/connections and returns the
// detected topology's info, without touching the DOM. Used by the "Analisis
// Jaringan" button (runNetworkAnalysis()) — kept separate from rendering so
// the detection logic isn't duplicated between the button handler and
// anything else that needs to know "what topology is this".
function computeTopologyInfo() {
  if (devices.length < 2) {
    return { insufficient: true };
  }

  const n = devices.length;
  const e = connections.length;

  const degreeMap = {};
  devices.forEach(d => { degreeMap[d.id] = 0; });
  connections.forEach(c => {
    degreeMap[c.from.id]++;
    degreeMap[c.to.id]++;
  });
  const degrees = Object.values(degreeMap);
  const maxDegree = Math.max(...degrees);
  const minDegree = Math.min(...degrees);

  let detectedType = 'Tidak Dikenali';
  let typeDesc = '';
  let typeColor = 'var(--text-muted)';

  if (e === 0) {
    detectedType = 'Tidak Terhubung';
    typeDesc = 'Perangkat belum dihubungkan';
    typeColor = 'var(--accent-red)';
  } else if (n >= 3 && e === n && minDegree === 2 && maxDegree === 2) {
    detectedType = 'Ring';
    typeDesc = 'Setiap perangkat terhubung ke 2 tetangga membentuk lingkaran';
    typeColor = 'var(--accent-cyan)';
  } else if (n >= 3 && e === n * (n - 1) / 2) {
    detectedType = 'Full Mesh';
    typeDesc = 'Setiap perangkat terhubung langsung ke semua perangkat lain';
    typeColor = 'var(--accent-purple)';
  } else if (n >= 3 && e === n - 1 && maxDegree === n - 1) {
    detectedType = 'Star';
    typeDesc = 'Semua perangkat terhubung ke satu perangkat pusat';
    typeColor = 'var(--accent-blue)';
  } else if (n >= 3 && e === n - 1 && maxDegree === 2 && (minDegree === 1 || minDegree === 2)) {
    const endNodes = degrees.filter(d => d === 1).length;
    if (endNodes === 2) {
      detectedType = 'Bus';
      typeDesc = 'Perangkat terhubung secara berurutan dalam satu jalur';
      typeColor = 'var(--accent-green)';
    } else {
      detectedType = 'Tree';
      typeDesc = 'Struktur hierarki bertingkat';
      typeColor = 'var(--accent-yellow)';
    }
  } else if (n >= 4 && e === n - 1 && maxDegree >= 2) {
    detectedType = 'Tree';
    typeDesc = 'Struktur hierarki bertingkat';
    typeColor = 'var(--accent-yellow)';
  } else if (e > n - 1 && e < n * (n - 1) / 2) {
    detectedType = 'Partial Mesh';
    typeDesc = 'Beberapa perangkat saling terhubung (bukan semua)';
    typeColor = 'var(--accent-orange)';
  } else if (e === n - 1) {
    detectedType = 'Tree';
    typeDesc = 'Struktur hierarki bertingkat';
    typeColor = 'var(--accent-yellow)';
  }

  const centralDevice = devices.find(d => degreeMap[d.id] === maxDegree);

  // Network status: with current disabled devices / cut links, can every
  // still-active device reach every other still-active device?
  const activeDevices = devices.filter(d => !d.disabled);
  const disabledCount = devices.length - activeDevices.length;
  const cutCount = connections.filter(c => c.cut).length;

  let networkStatusLabel = 'N/A';
  let networkStatusColor = 'var(--text-muted)';
  if (activeDevices.length > 0) {
    const adj = buildAdjacency();
    const visited = new Set([activeDevices[0].id]);
    const queue = [activeDevices[0].id];
    while (queue.length) {
      const cur = queue.shift();
      (adj[cur] || []).forEach(nb => {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      });
    }
    const allReachable = activeDevices.every(d => visited.has(d.id));
    networkStatusLabel = allReachable ? 'Terhubung Penuh' : 'Terputus Sebagian';
    networkStatusColor = allReachable ? 'var(--accent-green)' : 'var(--accent-red)';
  }

  return {
    insufficient: false,
    n, e, maxDegree, minDegree,
    detectedType, typeDesc, typeColor,
    centralDevice,
    networkStatusLabel, networkStatusColor,
    disabledCount, cutCount
  };
}

// Always-on glance panel in the right sidebar — re-rendered on every
// mutation (see the pushHistory()-adjacent call sites throughout this
// file). Deliberately lightweight: detected type + basic stats + live
// status, no explanation/solutions — that deeper read lives in the
// on-demand "Analisis Jaringan" card (runNetworkAnalysis() below), which
// reuses this same computeTopologyInfo() data rather than recomputing it.
function renderTopologyPanel() {
  const container = document.getElementById('topologyAnalysis');
  if (!container) return;

  const info = computeTopologyInfo();

  if (info.insufficient) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="font-size:0.8rem;">Tambahkan minimal 2 perangkat dan hubungkan untuk melihat analisis topologi</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="result-card" style="border-color:${info.typeColor}30;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:36px;height:36px;border-radius:8px;background:${info.typeColor}15;display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:${info.typeColor}"></div>
        </div>
        <div>
          <div style="font-weight:700;font-size:1rem;color:${info.typeColor};">${info.detectedType}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Topologi Terdeteksi</div>
        </div>
      </div>
      <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;margin-bottom:12px;">${info.typeDesc}</p>
      <ul class="prop-list">
        <li><span class="prop-key">Jumlah Node</span><span class="prop-val">${info.n}</span></li>
        <li><span class="prop-key">Jumlah Link</span><span class="prop-val">${info.e}</span></li>
        <li><span class="prop-key">Degree Maks</span><span class="prop-val">${info.maxDegree}</span></li>
        <li><span class="prop-key">Degree Min</span><span class="prop-val">${info.minDegree}</span></li>
        ${info.centralDevice ? `<li><span class="prop-key">Node Pusat</span><span class="prop-val">${info.centralDevice.name}</span></li>` : ''}
      </ul>
    </div>
    <div class="result-card" style="border-color:${info.networkStatusColor}30;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${(info.disabledCount || info.cutCount) ? '10px' : '0'};">
        <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Status Jaringan</span>
        <span style="font-weight:700;font-size:0.85rem;color:${info.networkStatusColor};">${info.networkStatusLabel}</span>
      </div>
      ${(info.disabledCount || info.cutCount) ? `
        <p style="font-size:0.75rem;color:var(--text-muted);">
          ${info.disabledCount ? `${info.disabledCount} perangkat mati` : ''}${info.disabledCount && info.cutCount ? ', ' : ''}${info.cutCount ? `${info.cutCount} koneksi terputus` : ''} (mode Simulasi Gangguan)
        </p>` : ''}
    </div>
  `;
}

// ============ ANALISIS JARINGAN (on-demand, bottom-center card) ============
// Kelebihan/Kekurangan/Solusi content per detected topology type. Kept as
// standard, textbook-grounded facts (same content family as the Panduan
// Topologi reference panel) — not per-device generated, except the central
// node's actual name gets interpolated into Star/Tree's weak point so it
// reads as "your network", not a generic diagram.

function getProsConsSolusi(info) {
  const central = info.centralDevice ? info.centralDevice.name : 'perangkat pusat';

  const byType = {
    Star: {
      pros: [
        'Mudah dikelola dan gampang menambah perangkat baru — tinggal colok ke perangkat pusat.',
        'Kalau satu kabel atau satu perangkat ujung rusak, perangkat lain tetap jalan normal.',
        'Gampang melacak letak kerusakan karena tiap perangkat punya jalur sendiri ke pusat.'
      ],
      cons: [
        {
          issue: `Kalau ${central} (perangkat pusat) mati, seluruh jaringan langsung terputus (single point of failure).`,
          solusi: 'Siapkan perangkat pusat cadangan, atau pertimbangkan topologi Tree/Partial Mesh yang punya jalur alternatif kalau butuh jaringan lebih tahan gangguan.'
        },
        {
          issue: 'Butuh lebih banyak kabel dibanding topologi Bus, terutama kalau perangkat tersebar jauh.',
          solusi: 'Tempatkan perangkat pusat di lokasi tengah/strategis, atau ganti sebagian koneksi berkabel dengan Access Point nirkabel.'
        }
      ]
    },
    Bus: {
      pros: [
        'Hemat kabel — instalasi murah dan sederhana untuk jaringan kecil.',
        'Cocok untuk jumlah perangkat sedikit yang tidak sering berubah.'
      ],
      cons: [
        {
          issue: 'Kalau kabel utama (backbone) putus di satu titik, seluruh jaringan ikut terputus.',
          solusi: 'Pindah ke topologi Star/Tree dengan perangkat pusat (switch), supaya kerusakan satu titik tidak melumpuhkan semua perangkat.'
        },
        {
          issue: 'Rawan collision (tabrakan data) karena semua perangkat berbagi satu jalur kabel yang sama.',
          solusi: 'Ganti kabel bersama itu dengan Switch — tiap perangkat dapat jalur sendiri (micro-segmentation), bukan berbagi satu kabel seperti Hub/Bus.'
        }
      ]
    },
    Ring: {
      pros: [
        'Data mengalir teratur (satu arah berputar), mengurangi risiko tabrakan dibanding Bus.',
        'Performa relatif stabil walau jumlah perangkat bertambah.'
      ],
      cons: [
        {
          issue: 'Kalau satu link atau satu perangkat di lingkaran putus, seluruh jaringan bisa terganggu.',
          solusi: 'Gunakan dual-ring (dua jalur berlawanan arah) atau tambahkan link cadangan, supaya masih ada jalur alternatif saat satu segmen putus.'
        },
        {
          issue: 'Menambah atau mengurangi satu perangkat mengganggu seluruh jaringan sementara (harus buka lingkaran).',
          solusi: 'Rencanakan jumlah perangkat sejak awal, atau pertimbangkan topologi Star kalau jaringan akan sering berubah-ubah.'
        }
      ]
    },
    'Full Mesh': {
      pros: [
        'Sangat andal — kalau satu link putus, masih banyak jalur alternatif lain ke tujuan yang sama.',
        'Performa & keamanan tinggi karena data lewat jalur langsung antar-perangkat, tidak lewat perangkat lain.'
      ],
      cons: [
        {
          issue: 'Butuh kabel dan port yang sangat banyak — makin banyak perangkat, makin cepat membengkak biayanya.',
          solusi: 'Kalau perangkat cukup banyak, pertimbangkan Partial Mesh: cuma node-node penting (mis. server) yang didobel jalurnya, sisanya cukup terhubung seperlunya.'
        },
        {
          issue: 'Instalasi dan pengelolaan jauh lebih rumit dibanding topologi lain.',
          solusi: 'Gunakan perangkat managed (switch yang bisa dikonfigurasi) untuk memudahkan pemantauan banyak jalur sekaligus.'
        }
      ]
    },
    'Partial Mesh': {
      pros: [
        'Lebih hemat kabel dibanding Full Mesh, tapi tetap punya jalur cadangan di titik-titik tertentu.',
        'Fleksibel — bisa memilih sendiri bagian mana yang perlu redundansi ekstra.'
      ],
      cons: [
        {
          issue: 'Tidak semua perangkat punya jalur cadangan, jadi keandalannya tidak semerata Full Mesh.',
          solusi: 'Prioritaskan link cadangan untuk perangkat paling kritis (server, router utama) supaya bagian terpenting tetap tahan gangguan.'
        },
        {
          issue: 'Desainnya lebih rumit karena harus memilih dengan cermat link mana yang perlu didobel.',
          solusi: 'Dokumentasikan topologi dengan jelas (diagram + catatan) supaya mudah dirawat di kemudian hari.'
        }
      ]
    },
    Tree: {
      pros: [
        'Cocok untuk jaringan besar/bertingkat, misalnya kantor dengan banyak lantai atau divisi.',
        'Mudah diperluas — tinggal menambah cabang baru tanpa mengganggu cabang yang lain.'
      ],
      cons: [
        {
          issue: `Kalau ${central} (dekat akar hierarki) mati, seluruh cabang di bawahnya ikut terputus.`,
          solusi: 'Tambahkan link cadangan antar-cabang di bagian penting, atau siapkan perangkat pusat cadangan dekat akar hierarki.'
        },
        {
          issue: 'Makin banyak tingkatan, makin rumit pengkabelan dan perawatannya.',
          solusi: 'Rencanakan jumlah tingkatan sejak awal dan beri label/dokumentasi tiap cabang supaya gampang ditelusuri.'
        }
      ]
    }
  };

  return byType[info.detectedType] || null;
}

function hideNetworkAnalysis() {
  const card = document.getElementById('networkAnalysisCard');
  if (card) card.classList.remove('show');
}

// All separate connected groups among currently-*active* devices (disabled
// devices and cut links excluded, via buildAdjacency()) — used to report
// whether a live fault has actually split the network into unreachable
// clusters, not just "something is off".
function findConnectedComponents() {
  const adj = buildAdjacency();
  const activeDevices = devices.filter(d => !d.disabled);
  const visited = new Set();
  const components = [];

  activeDevices.forEach(d => {
    if (visited.has(d.id)) return;
    const component = [];
    const queue = [d.id];
    visited.add(d.id);
    while (queue.length) {
      const curId = queue.shift();
      const curDevice = devices.find(dv => dv.id === curId);
      if (curDevice) component.push(curDevice);
      (adj[curId] || []).forEach(nb => {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      });
    }
    components.push(component);
  });

  return components;
}

// "Kondisi Jaringan Saat Ini" — reads the *live* Simulasi Gangguan state
// (device.disabled / connection.cut) rather than the static topology shape,
// and reports concretely what's down right now and whether the still-active
// devices can still all reach each other or have been split into isolated
// groups. This is what makes runNetworkAnalysis() an analysis of the
// network *as it's actually running*, not just a lookup of textbook facts
// about the detected shape.
function renderCurrentConditionSection() {
  const disabledDevices = devices.filter(d => d.disabled);
  const cutConnections = connections.filter(c => c.cut);
  const hasFault = disabledDevices.length > 0 || cutConnections.length > 0;

  if (!hasFault) {
    return `
      <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border-color);">
        <div class="proscons-title" style="color:var(--accent-green);">Kondisi Jaringan Saat Ini</div>
        <p style="font-size:0.84rem;color:var(--text-secondary);">Semua perangkat aktif dan seluruh koneksi normal &mdash; belum ada gangguan yang sedang disimulasikan (mode Gangguan).</p>
      </div>`;
  }

  const components = findConnectedComponents();
  const fullyConnected = components.length <= 1;

  const faultParts = [
    disabledDevices.length ? `<strong style="color:var(--text-primary);">${disabledDevices.map(d => d.name).join(', ')}</strong> sedang mati` : '',
    cutConnections.length ? `koneksi <strong style="color:var(--text-primary);">${cutConnections.map(c => `${c.from.name} &harr; ${c.to.name}`).join(', ')}</strong> sedang terputus` : ''
  ].filter(Boolean).join(', dan ');

  const statusLine = fullyConnected
    ? `<p style="font-size:0.84rem;color:var(--accent-green);margin-top:8px;">Meski begitu, semua perangkat yang masih aktif tetap bisa saling terhubung &mdash; topologi ini tahan terhadap gangguan ini.</p>`
    : `<p style="font-size:0.84rem;color:var(--accent-red);margin-top:8px;">Akibatnya, jaringan terbagi menjadi ${components.length} kelompok yang tidak bisa saling menjangkau:</p>
       <ul style="list-style:none;margin-top:6px;">
         ${components.map((comp, i) => `<li style="font-size:0.78rem;color:var(--text-muted);padding:3px 0;">Kelompok ${i + 1}: ${comp.map(d => d.name).join(', ')}</li>`).join('')}
       </ul>`;

  return `
    <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border-color);">
      <div class="proscons-title" style="color:var(--accent-yellow);">Kondisi Jaringan Saat Ini</div>
      <p style="font-size:0.84rem;color:var(--text-secondary);">Saat ini ${faultParts}.</p>
      ${statusLine}
    </div>`;
}

function runNetworkAnalysis() {
  const card = document.getElementById('networkAnalysisCard');
  const info = computeTopologyInfo();

  if (info.insufficient) {
    card.innerHTML = `
      <button class="network-analysis-close" onclick="hideNetworkAnalysis()" title="Tutup">&times;</button>
      <p style="font-size:0.85rem;color:var(--text-secondary);">Tambahkan minimal 2 perangkat dan hubungkan dulu sebelum dianalisis.</p>`;
    card.classList.add('show');
    return;
  }

  if (info.detectedType === 'Tidak Terhubung') {
    card.innerHTML = `
      <button class="network-analysis-close" onclick="hideNetworkAnalysis()" title="Tutup">&times;</button>
      ${renderCurrentConditionSection()}
      <p style="font-size:0.85rem;color:var(--text-secondary);">Perangkat belum saling terhubung. Sambungkan dulu (mode Hubungkan) untuk melihat kelebihan &amp; kekurangannya.</p>`;
    card.classList.add('show');
    return;
  }

  const pc = getProsConsSolusi(info);

  const header = `
    <button class="network-analysis-close" onclick="hideNetworkAnalysis()" title="Tutup">&times;</button>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:${info.typeColor}15;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <div style="width:8px;height:8px;border-radius:50%;background:${info.typeColor}"></div>
      </div>
      <div>
        <div style="font-weight:700;font-size:1rem;color:${info.typeColor};">Topologi ${info.detectedType}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">${info.n} perangkat &middot; ${info.e} koneksi${info.centralDevice ? ` &middot; pusat: ${info.centralDevice.name}` : ''}</div>
      </div>
    </div>`;

  if (!pc) {
    card.innerHTML = header + renderCurrentConditionSection() + `
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${info.typeDesc || 'Struktur ini kombinasi/custom, tidak persis mengikuti satu pola topologi baku (Star/Bus/Ring/Mesh/Tree).'}</p>`;
    card.classList.add('show');
    return;
  }

  card.innerHTML = header + renderCurrentConditionSection() + `
    <div class="proscons-title pros" style="margin-top:2px;">Kelebihan</div>
    <ul class="proscons-list">
      ${pc.pros.map(p => `<li><span class="pc-icon pc-plus">+</span><span>${p}</span></li>`).join('')}
    </ul>
    <div class="proscons-title cons" style="margin-top:12px;">Kekurangan &amp; Solusi</div>
    <ul class="proscons-list proscons-list-solusi">
      ${pc.cons.map(c => `
        <li>
          <span class="pc-icon pc-minus">&minus;</span>
          <span>
            ${c.issue}
            <span class="solusi-line"><strong>Solusi:</strong> ${c.solusi}</span>
          </span>
        </li>`).join('')}
    </ul>`;
  card.classList.add('show');
}

// ============ EXAMPLE TOPOLOGIES ============

function loadExample(type) {
  pushHistory();
  devices = [];
  connections = [];
  deviceCounter = { pc: 0, laptop: 0, switch: 0, router: 0, server: 0, access_point: 0, smartphone: 0, bridge: 0, modem: 0 };
  resetIPCounters();
  resetPingState();

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 150;

  switch (type) {
    case 'star': {
      const center = new Device('switch', cx, cy);
      devices.push(center);
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const dev = new Device('pc', cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        devices.push(dev);
        connections.push({ from: center, to: dev, cut: false });
      }
      break;
    }
    case 'bus': {
      const count = 5;
      const startX = cx - (count - 1) * 100 / 2;
      const devs = [];
      for (let i = 0; i < count; i++) {
        const dev = new Device('pc', startX + i * 100, cy);
        devices.push(dev);
        devs.push(dev);
      }
      for (let i = 0; i < count - 1; i++) {
        connections.push({ from: devs[i], to: devs[i + 1], cut: false });
      }
      break;
    }
    case 'ring': {
      const count = 6;
      const devs = [];
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const dev = new Device('pc', cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        devices.push(dev);
        devs.push(dev);
      }
      for (let i = 0; i < count; i++) {
        connections.push({ from: devs[i], to: devs[(i + 1) % count], cut: false });
      }
      break;
    }
    case 'mesh': {
      const count = 4;
      const devs = [];
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI / count) - Math.PI / 2;
        const dev = new Device('pc', cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        devices.push(dev);
        devs.push(dev);
      }
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          connections.push({ from: devs[i], to: devs[j], cut: false });
        }
      }
      break;
    }
    case 'tree': {
      const root = new Device('router', cx, cy - 140);
      const sw1 = new Device('switch', cx - 140, cy - 20);
      const sw2 = new Device('switch', cx + 140, cy - 20);
      devices.push(root, sw1, sw2);
      connections.push({ from: root, to: sw1, cut: false }, { from: root, to: sw2, cut: false });

      const pc1 = new Device('pc', cx - 210, cy + 100);
      const pc2 = new Device('pc', cx - 100, cy + 100);
      devices.push(pc1, pc2);

      // pc3/pc4 sit behind Switch 2 in a *different* subnet than pc1/pc2,
      // so this example naturally demonstrates why Router 1 (not the
      // switches) is what lets the two sides reach each other.
      const pc3 = new Device('pc', cx + 80, cy + 100);
      pc3.ip = nextAutoIP('192.168.2');
      const pc4 = new Device('pc', cx + 200, cy + 100);
      pc4.ip = nextAutoIP('192.168.2');
      devices.push(pc3, pc4);

      connections.push(
        { from: sw1, to: pc1, cut: false }, { from: sw1, to: pc2, cut: false },
        { from: sw2, to: pc3, cut: false }, { from: sw2, to: pc4, cut: false }
      );
      break;
    }
  }

  selectedDevice = null;
  showDeviceInfo(null);
  hideNetworkAnalysis();
  renderTopologyPanel();
  resetPingResultPanel();
  showToast(`Contoh topologi ${type} dimuat`, 'success');
}

// ============ CLEAR CANVAS ============

function clearCanvas() {
  if (devices.length === 0) return;
  pushHistory();
  devices = [];
  connections = [];
  selectedDevice = null;
  connectSource = null;
  resetPingState();
  deviceCounter = { pc: 0, laptop: 0, switch: 0, router: 0, server: 0, access_point: 0, smartphone: 0, bridge: 0, modem: 0 };
  resetIPCounters();
  showDeviceInfo(null);
  hideNetworkAnalysis();
  renderTopologyPanel();
  resetPingResultPanel();
  showToast('Canvas dibersihkan', 'success');
}

// ============ STATUS BAR ============

function updateStatus() {
  document.getElementById('statusDevices').textContent = devices.length;
  document.getElementById('statusConnections').textContent = connections.length;
}

// ============ TOAST ============

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  toast.innerHTML = (icons[type] || '') + message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// ============ KEYBOARD SHORTCUTS ============

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'v': case 'V': setMode('select'); break;
    case 'a': case 'A': if (!e.ctrlKey) setMode('place'); break;
    case 'c': case 'C': if (!e.ctrlKey) setMode('connect'); break;
    case 'd': case 'D': if (!e.ctrlKey) setMode('delete'); break;
    case 'p': case 'P': if (!e.ctrlKey) setMode('ping'); break;
    case 'f': case 'F': if (!e.ctrlKey) setMode('fault'); break;
    case 'z': case 'Z': if (e.ctrlKey) { e.preventDefault(); undo(); } break;
    case '=': case '+': if (e.ctrlKey) { e.preventDefault(); zoomIn(); } break;
    case '-': if (e.ctrlKey) { e.preventDefault(); zoomOut(); } break;
    case 'Delete':
      if (selectedDevice && currentMode === 'select') {
        pushHistory();
        devices = devices.filter(d => d.id !== selectedDevice.id);
        connections = connections.filter(c =>
          c.from.id !== selectedDevice.id && c.to.id !== selectedDevice.id
        );
        showToast(`${selectedDevice.name} dihapus`, 'success');
        selectedDevice = null;
        showDeviceInfo(null);
        resetPingState();
        hideNetworkAnalysis();
        renderTopologyPanel();
      }
      break;
    case 'Escape':
      connectSource = null;
      pingSource = null;
      selectedDevice = null;
      showDeviceInfo(null);
      break;
  }
});

renderTopologyPanel();

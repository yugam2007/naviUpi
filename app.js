/* ============================================
   GPAY DEMO APP - JavaScript
   Educational / Demo Purpose Only
   No real payments are processed
============================================ */

// ===== STATE =====
const state = {
  balance: 12450.00,
  currentAmount: '',
  currentRecipient: { name: '', upi: '' },
  currentNote: '',
  pinValue: '',
  screenHistory: ['screen-home'],
  qrScanner: null,
  currentFilter: 'all',
};

// ===== SEED DATA =====
const seedTransactions = [
  { id: 'TXN001', name: 'Priya Mehta',  upi: 'priya.mehta@oksbi',   amount: 500,  type: 'sent',     date: Date.now() - 3600000,    note: 'Lunch split', color: '#e8f0fe', textColor: '#1a73e8' },
  { id: 'TXN002', name: 'Salary Credit', upi: 'hdfc.corp@hdfcbank', amount: 45000, type: 'received', date: Date.now() - 86400000,   note: 'April Salary', color: '#e6f4ea', textColor: '#137333' },
  { id: 'TXN003', name: 'Amit Kumar',   upi: 'amit.kumar@paytm',    amount: 200,  type: 'sent',     date: Date.now() - 172800000,  note: 'Movie tickets', color: '#fce8e6', textColor: '#d93025' },
  { id: 'TXN004', name: 'Sneha Rao',   upi: 'sneha.rao@ybl',        amount: 1200, type: 'sent',     date: Date.now() - 259200000,  note: 'Rent share', color: '#e6f4ea', textColor: '#137333' },
  { id: 'TXN005', name: 'Vikram Singh', upi: 'vikram.s@okicici',    amount: 800,  type: 'received', date: Date.now() - 345600000,  note: 'Reimbursement', color: '#fef7e0', textColor: '#b06000' },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  renderHomeTransactions();
  renderHistoryList();
  generateQRCode();
  updateBalanceDisplay();

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Update greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const el = document.querySelector('.greeting');
  if (el) el.textContent = greeting;
});

// ===== LOCAL STORAGE =====
function initStorage() {
  if (!localStorage.getItem('gpay_txns')) {
    localStorage.setItem('gpay_txns', JSON.stringify(seedTransactions));
  }
  const saved = parseFloat(localStorage.getItem('gpay_balance'));
  if (!isNaN(saved)) state.balance = saved;
}

function getTransactions() {
  try { return JSON.parse(localStorage.getItem('gpay_txns')) || []; }
  catch { return []; }
}

function saveTransaction(txn) {
  const txns = getTransactions();
  txns.unshift(txn);
  localStorage.setItem('gpay_txns', JSON.stringify(txns));
}

function saveBalance() {
  localStorage.setItem('gpay_balance', state.balance.toString());
}

// ===== SCREEN NAVIGATION =====
function showScreen(screenId) {
  const current = document.querySelector('.screen.active');
  const next = document.getElementById(screenId);
  if (!next || current?.id === screenId) return;

  if (current) {
    current.classList.remove('active');
    current.classList.add('slide-left');
    setTimeout(() => current.classList.remove('slide-left'), 320);
  }

  next.classList.add('active');

  // Update history
  state.screenHistory.push(screenId);

  // Show/hide bottom nav
  const hideNav = ['screen-processing', 'screen-success', 'screen-pin'];
  const nav = document.getElementById('bottom-nav');
  nav.style.display = hideNav.includes(screenId) ? 'none' : 'flex';

  // Screen-specific init
  if (screenId === 'screen-scan') initScanner();
  if (screenId === 'screen-history') renderHistoryList();
  if (screenId === 'screen-home') renderHomeTransactions();
  if (screenId === 'screen-receive') generateQRCode();
}

function goBack() {
  if (state.screenHistory.length <= 1) return;
  state.screenHistory.pop();
  const prev = state.screenHistory[state.screenHistory.length - 1];

  const current = document.querySelector('.screen.active');
  const prevScreen = document.getElementById(prev);

  if (current) current.classList.remove('active');
  if (prevScreen) prevScreen.classList.add('active');

  // Stop scanner if going back from scan
  if (current?.id === 'screen-scan') stopScanner();

  // Show nav
  const nav = document.getElementById('bottom-nav');
  nav.style.display = 'flex';

  if (prev === 'screen-home') renderHomeTransactions();
}

function goHome() {
  stopScanner();
  // Reset all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'slide-left');
  });
  document.getElementById('screen-home').classList.add('active');
  state.screenHistory = ['screen-home'];
  document.getElementById('bottom-nav').style.display = 'flex';
  resetSendForm();
  renderHomeTransactions();
  updateBalanceDisplay();
}

function setNav(btn) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  btn.classList.add('active');
}

// ===== QR SCANNER =====
function initScanner() {
  if (state.qrScanner) return;
  const el = document.getElementById('qr-reader');
  if (!el) return;

  try {
    state.qrScanner = new Html5Qrcode('qr-reader');
    state.qrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      (decodedText) => {
        stopScanner();
        handleScannedQR(decodedText);
      },
      () => {}
    ).catch(() => showToast('Camera not available – use Demo Scan'));
  } catch (e) {
    showToast('QR library not loaded');
  }
}

function stopScanner() {
  if (state.qrScanner) {
    state.qrScanner.stop().catch(() => {});
    state.qrScanner = null;
  }
}

function simulateScan() {
  stopScanner();
  const demoUPIs = [
    { name: 'Priya Mehta',  upi: 'priya.mehta@oksbi' },
    { name: 'Amit Kumar',   upi: 'amit.kumar@paytm'  },
    { name: 'Coffee Shop',  upi: 'coffeebliss@upi'   },
    { name: 'Vikram Singh', upi: 'vikram.s@okicici'  },
  ];
  const pick = demoUPIs[Math.floor(Math.random() * demoUPIs.length)];
  handleScannedQR(pick.upi + '|' + pick.name);
}

function handleScannedQR(text) {
  let upi = text, name = '';
  if (text.includes('|')) {
    [upi, name] = text.split('|');
  } else if (text.includes('upi://pay')) {
    const params = new URLSearchParams(text.split('?')[1]);
    upi  = params.get('pa') || text;
    name = params.get('pn') || '';
  }

  state.currentRecipient = { name: name || guessName(upi), upi };
  showScreen('screen-send');
  setTimeout(() => populateRecipient(), 300);
}

function guessName(upi) {
  const part = upi.split('@')[0];
  return part.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function toggleFlash() {
  showToast('Flash toggle (device dependent)');
}

// ===== UPI VERIFY =====
function validateUPI(val) {
  const btn = document.getElementById('verify-btn');
  const valid = /^[\w.]+@[a-z]+$/.test(val) || /^\d{10}$/.test(val);
  btn.style.opacity = valid ? '1' : '0.5';
}

function verifyUPI() {
  const val = document.getElementById('upi-input').value.trim();
  if (!val) { showToast('Enter UPI ID or phone number'); return; }

  let upi = val, name = '';
  if (/^\d{10}$/.test(val)) {
    upi  = val + '@paytm';
    name = 'User ' + val.slice(-4);
  } else {
    name = guessName(val);
  }

  state.currentRecipient = { name, upi };
  populateRecipient();
}

function populateRecipient() {
  const card = document.getElementById('recipient-card');
  const amtSec = document.getElementById('amount-section');
  document.getElementById('rec-name').textContent = state.currentRecipient.name;
  document.getElementById('rec-upi').textContent  = state.currentRecipient.upi;
  document.getElementById('rec-avatar').textContent = state.currentRecipient.name[0].toUpperCase();

  card.classList.remove('hidden');
  amtSec.classList.remove('hidden');
  state.currentAmount = '';
  updateAmountDisplay();
}

function quickPay(name, upi) {
  state.currentRecipient = { name, upi };
  showScreen('screen-send');
  setTimeout(() => populateRecipient(), 300);
}

// ===== NUMPAD =====
function numInput(ch) {
  if (ch === '.' && state.currentAmount.includes('.')) return;
  if (state.currentAmount.length >= 7) return;
  if (state.currentAmount === '0' && ch !== '.') state.currentAmount = '';
  if (state.currentAmount === '' && ch === '.') state.currentAmount = '0';
  state.currentAmount += ch;
  updateAmountDisplay();
}

function numDelete() {
  state.currentAmount = state.currentAmount.slice(0, -1);
  updateAmountDisplay();
}

function setAmount(val) {
  state.currentAmount = val;
  updateAmountDisplay();
}

function updateAmountDisplay() {
  document.getElementById('amount-digits').textContent = state.currentAmount || '0';
  const payBtn = document.getElementById('pay-now-btn');
  const amt = parseFloat(state.currentAmount);
  payBtn.style.opacity = (amt > 0 && amt <= state.balance) ? '1' : '0.5';
  payBtn.disabled = !(amt > 0 && amt <= state.balance);
}

// ===== UPI PIN =====
function showPinScreen() {
  const amt = parseFloat(state.currentAmount);
  if (!amt || amt <= 0) { showToast('Enter a valid amount'); return; }
  if (amt > state.balance) { showToast('Insufficient balance'); return; }

  state.pinValue = '';
  updatePinDots();
  document.getElementById('pin-amount-label').textContent = '₹' + formatAmount(amt);
  document.getElementById('pin-to-label').textContent = state.currentRecipient.name;
  showScreen('screen-pin');
}

function pinInput(digit) {
  if (state.pinValue.length >= 6) return;
  state.pinValue += digit;
  updatePinDots();
  vibrate(10);
  if (state.pinValue.length === 6) {
    setTimeout(processPayment, 300);
  }
}

function pinDelete() {
  state.pinValue = state.pinValue.slice(0, -1);
  updatePinDots();
}

function updatePinDots() {
  for (let i = 1; i <= 6; i++) {
    const dot = document.getElementById('dot-' + i);
    dot.classList.toggle('filled', i <= state.pinValue.length);
  }
}

// ===== PAYMENT PROCESSING =====
function processPayment() {
  showScreen('screen-processing');
  const steps = ['Connecting to bank', 'Verifying UPI PIN', 'Completing transfer'];
  const stepEls = ['step-1', 'step-2', 'step-3'];
  let step = 0;

  const interval = setInterval(() => {
    if (step > 0) {
      document.getElementById(stepEls[step - 1]).querySelector('.step-dot').classList.replace('active', 'done');
    }
    if (step < 3) {
      document.getElementById('proc-status').textContent = steps[step];
      document.getElementById(stepEls[step]).querySelector('.step-dot').classList.add('active');
    }
    step++;
    if (step > 3) {
      clearInterval(interval);
      completePayment();
    }
  }, 900);
}

function completePayment() {
  const amt = parseFloat(state.currentAmount);
  const txn = {
    id: 'TXN' + Date.now(),
    name: state.currentRecipient.name,
    upi:  state.currentRecipient.upi,
    amount: amt,
    type: 'sent',
    date: Date.now(),
    note: document.getElementById('payment-note')?.value || '',
    color: '#e8f0fe', textColor: '#1a73e8',
    txnId: 'UPI' + Math.random().toString(36).substr(2, 12).toUpperCase(),
    upiRef: Math.floor(Math.random() * 9e11 + 1e11).toString(),
  };

  // Deduct balance
  state.balance = Math.round((state.balance - amt) * 100) / 100;
  saveBalance();
  saveTransaction(txn);

  // Populate success screen
  document.getElementById('success-amount').textContent = '₹' + formatAmount(amt);
  document.getElementById('success-to').textContent = txn.name;
  document.getElementById('receipt-txnid').textContent = txn.id;
  document.getElementById('receipt-upi').textContent = txn.txnId;
  document.getElementById('receipt-datetime').textContent = formatDate(txn.date);

  showScreen('screen-success');

  // Vibration & sound on success
  vibrate([50, 50, 100]);
  playSuccessSound();
}

// ===== HISTORY =====
function renderHistoryList() {
  const list = document.getElementById('history-list');
  if (!list) return;
  const all = getTransactions();
  const filtered = state.currentFilter === 'all'
    ? all
    : all.filter(t => t.type === state.currentFilter);

  if (!filtered.length) {
    list.innerHTML = `<div class="history-empty"><div class="empty-icon">💸</div><p>No transactions yet</p></div>`;
    return;
  }

  // Group by date
  const groups = {};
  filtered.forEach(t => {
    const key = getDateGroup(t.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  list.innerHTML = Object.entries(groups).map(([label, txns]) => `
    <div class="date-group-label">${label}</div>
    ${txns.map(t => txnHTML(t)).join('')}
  `).join('');
}

function renderHomeTransactions() {
  const list = document.getElementById('home-transactions');
  if (!list) return;
  const all = getTransactions().slice(0, 4);
  if (!all.length) {
    list.innerHTML = '<p style="color:var(--text-hint);font-size:13px;text-align:center;padding:16px">No transactions yet</p>';
    return;
  }
  list.innerHTML = all.map(t => txnHTML(t)).join('');
}

function txnHTML(t) {
  const color = t.color || (t.type === 'received' ? '#e6f4ea' : '#e8f0fe');
  const tcolor = t.textColor || (t.type === 'received' ? '#137333' : '#1a73e8');
  const sign = t.type === 'sent' ? '-' : '+';
  const amtClass = t.type === 'sent' ? 'sent' : 'recv';
  return `
    <div class="txn-item">
      <div class="txn-avatar" style="background:${color};color:${tcolor}">${t.name[0]}</div>
      <div class="txn-info">
        <div class="txn-name">${t.name}</div>
        <div class="txn-date">${t.note ? t.note + ' · ' : ''}${timeAgo(t.date)}</div>
      </div>
      <div class="txn-amount ${amtClass}">${sign}₹${formatAmount(t.amount)}</div>
    </div>`;
}

function filterHistory(type, btn) {
  state.currentFilter = type;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderHistoryList();
}

function clearHistory() {
  if (confirm('Clear all transactions?')) {
    localStorage.removeItem('gpay_txns');
    renderHistoryList();
    renderHomeTransactions();
    showToast('History cleared');
  }
}

// ===== RECEIVE / QR =====
function generateQRCode() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 220;
  ctx.clearRect(0, 0, size, size);

  // Generate a simple visual QR-like pattern (decorative)
  const upi = 'upi://pay?pa=rahul.sharma@okaxis&pn=Rahul+Sharma&cu=INR';
  drawDecorativeQR(ctx, size, upi);
}

function drawDecorativeQR(ctx, size, data) {
  const cells = 21;
  const cell = size / cells;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);

  // Deterministic pattern from data
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;

  const rand = (i, j) => {
    let n = Math.abs(hash + i * 31 + j * 37);
    return (n % 3) === 0;
  };

  ctx.fillStyle = '#202124';

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Position detection patterns (corners)
      if (isDetector(r, c, cells)) {
        drawDetectorCell(ctx, r, c, cell, cells);
        continue;
      }
      if (isDetectorInner(r, c, cells)) continue;

      if (rand(r, c)) {
        ctx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
      }
    }
  }

  // Draw 3 corner finder patterns
  drawFinderPattern(ctx, 0, 0, cell);
  drawFinderPattern(ctx, cells - 7, 0, cell);
  drawFinderPattern(ctx, 0, cells - 7, cell);

  // Center logo
  const logoSize = 36;
  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
  ctx.fillStyle = '#1a73e8';
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Google Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G', size / 2, size / 2);
}

function isDetector(r, c, cells) {
  const inCorner = (row, col) =>
    (row < 7 && col < 7) ||
    (row < 7 && col >= cells - 7) ||
    (row >= cells - 7 && col < 7);
  return inCorner(r, c);
}

function isDetectorInner(r, c, cells) {
  const inCornerInner = (row, col) =>
    (row >= 1 && row < 6 && col >= 1 && col < 6) ||
    (row >= 1 && row < 6 && col >= cells - 6 && col < cells - 1) ||
    (row >= cells - 6 && row < cells - 1 && col >= 1 && col < 6);
  return inCornerInner(r, c);
}

function drawFinderPattern(ctx, row, col, cell) {
  const x = col * cell, y = row * cell;
  ctx.fillStyle = '#202124';
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
  ctx.fillStyle = '#202124';
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function drawDetectorCell() {} // Handled by drawFinderPattern

function shareQR() {
  if (navigator.share) {
    navigator.share({ title: 'My UPI QR', text: 'Scan to pay Rahul Sharma\nUPI: rahul.sharma@okaxis' })
      .catch(() => {});
  } else {
    showToast('Share not supported – screenshot the QR');
  }
}

// ===== PROFILE =====
function showProfile() {
  showToast('Profile settings coming soon!');
}

// ===== RESET =====
function resetSendForm() {
  state.currentAmount = '';
  state.currentRecipient = { name: '', upi: '' };
  state.pinValue = '';
  const upiInput = document.getElementById('upi-input');
  if (upiInput) upiInput.value = '';
  document.getElementById('recipient-card')?.classList.add('hidden');
  document.getElementById('amount-section')?.classList.add('hidden');
  document.getElementById('payment-note').value = '';
  // Reset processing steps
  ['step-1','step-2','step-3'].forEach(id => {
    const dot = document.getElementById(id)?.querySelector('.step-dot');
    if (dot) { dot.className = 'step-dot'; }
  });
  document.getElementById('step-1')?.querySelector('.step-dot')?.classList.add('active');
}

// ===== HELPERS =====
function formatAmount(n) {
  return parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function updateBalanceDisplay() {
  const el = document.getElementById('balance-display');
  if (el) el.textContent = '₹' + formatAmount(state.balance);
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getDateGroup(ts) {
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'This Week';
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
  if (sec < 604800) return Math.floor(sec / 86400) + 'd ago';
  return new Date(ts).toLocaleDateString('en-IN');
}

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function shareReceipt() {
  const amt = document.getElementById('success-amount').textContent;
  const to  = document.getElementById('success-to').textContent;
  const id  = document.getElementById('receipt-txnid').textContent;
  const msg = `Payment of ${amt} to ${to} successful!\nTransaction ID: ${id}\n\n(Demo – No real payment)`;
  if (navigator.share) {
    navigator.share({ title: 'Payment Receipt', text: msg }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(msg).then(() => showToast('Receipt copied!'));
  }
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playNote(523, 0, 0.15);
    playNote(659, 0.15, 0.15);
    playNote(784, 0.3, 0.3);
  } catch (e) {}
}

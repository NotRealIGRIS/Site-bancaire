/**
 * Said Banking — app.js
 * All UI logic, auth, navigation, transfers, and AI advisor.
 */

'use strict';

/* ─── State ─── */
let currentUser = null;
let isLoginMode  = true;
let chatHistory  = [];

/* ─── Helpers ─── */
const $ = id => document.getElementById(id);

function fmt(n) {
  return new Intl.NumberFormat('en-EU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function showMsg(id, text, visible = true) {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.style.display = visible ? 'block' : 'none';
}

/* ════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════ */

$('a-sw').addEventListener('click', toggleAuthMode);

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  $('a-title').textContent    = isLoginMode ? 'Welcome back'                    : 'Open an account';
  $('a-desc').textContent     = isLoginMode ? 'Access your Said Banking account' : 'Join Said Banking today';
  $('a-btn').textContent      = isLoginMode ? 'Sign In'                         : 'Create Account';
  $('a-sw-txt').textContent   = isLoginMode ? 'No account? '                    : 'Have an account? ';
  $('a-sw').textContent       = isLoginMode ? 'Create one'                      : 'Sign in';
  $('name-grp').style.display = isLoginMode ? 'none'                            : 'block';
  $('a-err').style.display    = 'none';
  $('a-suc').style.display    = 'none';
}

$('a-btn').addEventListener('click', handleAuth);
$('a-pass').addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });

function handleAuth() {
  const email = $('a-email').value.trim();
  const pass  = $('a-pass').value;
  $('a-err').style.display = 'none';
  $('a-suc').style.display = 'none';

  if (isLoginMode) {
    const user = DB.users.find(u => u.email === email && u.password === pass);
    if (!user) {
      showMsg('a-err', 'Invalid email or password.');
      return;
    }
    currentUser = user;
    showDashboard();

  } else {
    const name = $('r-name').value.trim();
    if (!name || !email || !pass) {
      showMsg('a-err', 'Please fill in all fields.');
      return;
    }
    if (DB.users.find(u => u.email === email)) {
      showMsg('a-err', 'This email is already registered.');
      return;
    }

    const uid = DB.nextId++;
    const padId = String(uid).padStart(3, '0');
    const newUser = {
      id:        uid,
      name,
      email,
      password:  pass,
      createdAt: today(),
      accounts: [
        { id: 'CHK' + padId, type: 'Checking', balance: 1000 },
        { id: 'SAV' + padId, type: 'Savings',  balance: 500  }
      ],
      transactions: [
        { id: 1, type: 'credit', name: 'Welcome Bonus', amount: 50,
          date: today(), acc: 'CHK' + padId }
      ]
    };
    DB.users.push(newUser);
    showMsg('a-suc', 'Account created successfully. Please sign in.');
    $('a-email').value = '';
    $('a-pass').value  = '';
    isLoginMode = false;
    toggleAuthMode();
  }
}

function logout() {
  currentUser = null;
  $('dash').style.display = 'none';
  $('auth').style.display = 'flex';
  $('a-email').value = '';
  $('a-pass').value  = '';
}

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */

function showDashboard() {
  $('auth').style.display = 'none';
  $('dash').style.display = 'flex';

  $('tb-av').textContent   = initials(currentUser.name);
  $('tb-user').textContent = currentUser.name.split(' ')[0];

  renderAccounts();
  renderStats();
  renderTransactions();
  populateTransferSelects();
  renderProfile();
  initChat();
}

/* ── Navigation ── */
const TAB_ORDER = ['overview', 'transfer', 'advisor', 'profile'];

function tab(name, el, src) {
  // Sync both navs
  document.querySelectorAll('.nt-item').forEach((e, i) => {
    e.classList.toggle('on', TAB_ORDER[i] === name);
  });
  document.querySelectorAll('.nb-item').forEach((e, i) => {
    e.classList.toggle('on', TAB_ORDER[i] === name);
  });

  // Always honour the clicked element
  el.classList.add('on');

  document.querySelectorAll('.tc').forEach(e => e.classList.remove('on'));
  $('tc-' + name).classList.add('on');

  // Scroll body back to top on mobile
  const bodyEl = document.querySelector('.body');
  if (bodyEl) bodyEl.scrollTop = 0;
}

/* ═══════════════════════════════════════════════
   OVERVIEW — Accounts
═══════════════════════════════════════════════ */

function renderAccounts() {
  $('acc-grid').innerHTML = currentUser.accounts.map(a => `
    <div class="acc-card">
      <div class="ac-label">${a.type} Account</div>
      <div class="ac-amount"><span class="ac-currency">€</span>${fmt(a.balance)}</div>
      <div class="ac-number">SAID •••• ${a.id.slice(-4)}</div>
    </div>
  `).join('');
}

/* ── Stats ── */
function renderStats() {
  const credits = currentUser.transactions
    .filter(t => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0);
  const debits = currentUser.transactions
    .filter(t => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);
  const total = currentUser.accounts.reduce((s, a) => s + a.balance, 0);

  $('stat-row').innerHTML = `
    <div class="stat">
      <div class="stat-label">Total assets</div>
      <div class="stat-val">€${fmt(total)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Money in</div>
      <div class="stat-val pos">+€${fmt(credits)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Money out</div>
      <div class="stat-val neg">-€${fmt(debits)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Transactions</div>
      <div class="stat-val">${currentUser.transactions.length}</div>
    </div>
  `;
}

/* ── Transactions ── */
function renderTransactions() {
  const txs = [...currentUser.transactions].reverse().slice(0, 12);
  $('tx-count').textContent = txs.length + ' records';

  if (!txs.length) {
    $('tx-list').innerHTML = '<div class="empty-state">No transactions yet.</div>';
    return;
  }

  $('tx-list').innerHTML = txs.map(t => `
    <div class="tx-row">
      <div class="tx-icon ${t.type === 'credit' ? 'cr' : 'dr'}">
        <i class="ti ${t.type === 'credit' ? 'ti-arrow-down' : 'ti-arrow-up'}" aria-hidden="true"></i>
      </div>
      <div class="tx-info">
        <div class="tx-name">${t.name}</div>
        <div class="tx-meta">${t.date} &nbsp;·&nbsp; ${t.acc}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amt ${t.type === 'credit' ? 'cr' : 'dr'}">
          ${t.type === 'credit' ? '+' : '-'}€${fmt(t.amount)}
        </div>
        <div class="tx-badge ${t.type === 'credit' ? 'cr' : 'dr'}">${t.type}</div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════
   TRANSFER
═══════════════════════════════════════════════ */

function populateTransferSelects() {
  const opts = currentUser.accounts
    .map(a => `<option value="${a.id}">${a.type} — €${fmt(a.balance)}</option>`)
    .join('');
  $('trf-from').innerHTML = opts;
  $('trf-to').innerHTML   = opts;
}

function doTransfer() {
  const fromId = $('trf-from').value;
  const toId   = $('trf-to').value;
  const amount = parseFloat($('trf-amt').value);
  const ref    = $('trf-ref').value.trim() || 'Transfer';

  $('trf-err').style.display = 'none';
  $('trf-suc').style.display = 'none';

  if (fromId === toId) {
    showMsg('trf-err', 'Please select two different accounts.');
    return;
  }
  if (!amount || amount <= 0) {
    showMsg('trf-err', 'Please enter a valid amount greater than zero.');
    return;
  }

  const from = currentUser.accounts.find(a => a.id === fromId);
  const to   = currentUser.accounts.find(a => a.id === toId);

  if (from.balance < amount) {
    showMsg('trf-err', 'Insufficient funds in the selected account.');
    return;
  }

  from.balance -= amount;
  to.balance   += amount;

  const now  = today();
  const next = currentUser.transactions.length + 1;

  currentUser.transactions.push({ id: next,     type: 'debit',  name: ref, amount, date: now, acc: fromId });
  currentUser.transactions.push({ id: next + 1, type: 'credit', name: ref, amount, date: now, acc: toId   });

  showMsg('trf-suc', `Transferred €${fmt(amount)} successfully — ref: ${ref}`);
  $('trf-amt').value = '';
  $('trf-ref').value = '';

  // Refresh views
  renderAccounts();
  renderStats();
  renderTransactions();
  populateTransferSelects();
  renderProfile();
}

/* ═══════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════ */

function renderProfile() {
  const total = currentUser.accounts.reduce((s, a) => s + a.balance, 0);
  $('p-av').textContent    = initials(currentUser.name);
  $('p-name').textContent  = currentUser.name;
  $('p-email').textContent = currentUser.email;
  $('p-accs').textContent  = currentUser.accounts.length;
  $('p-total').textContent = '€' + fmt(total);
  $('p-last').textContent  = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ═══════════════════════════════════════════════
   AI ADVISOR
═══════════════════════════════════════════════ */

function initChat() {
  chatHistory = [];
  $('chat-box').innerHTML = '';
  addBubble('ai',
    'Good day, ' + currentUser.name.split(' ')[0] +
    '. I am your Said Banking private advisor. I have full visibility of your accounts ' +
    'and am here to help with any financial question. How may I assist you today?'
  );
}

function addBubble(role, text) {
  const box = $('chat-box');
  const av  = role === 'ai' ? 'SB' : initials(currentUser.name);
  const div = document.createElement('div');
  div.className = 'bubble-row ' + role;
  div.innerHTML = `<div class="b-av">${av}</div><div class="bubble">${text}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function showTyping() {
  const box = $('chat-box');
  const div = document.createElement('div');
  div.className = 'bubble-row ai';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="b-av">SB</div>
    <div class="bubble">
      <div class="dots"><span></span><span></span><span></span></div>
    </div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  const el = $('typing-indicator');
  if (el) el.remove();
}

function buildContext() {
  const accs  = currentUser.accounts
    .map(a => `${a.type} (${a.id}): €${fmt(a.balance)}`).join('; ');
  const total = currentUser.accounts.reduce((s, a) => s + a.balance, 0);
  const txs   = currentUser.transactions.slice(-6)
    .map(t => `${t.date} ${t.type === 'credit' ? '+' : '-'}€${fmt(t.amount)} ${t.name}`)
    .join(' | ');
  return `Client: ${currentUser.name}. Total assets: €${fmt(total)}. Accounts: ${accs}. Recent transactions: ${txs}.`;
}

async function qa(question) {
  $('chat-in').value = question;
  await sendMsg();
}

$('chat-in').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMsg();
});

async function sendMsg() {
  const input  = $('chat-in');
  const sendBtn = $('send-btn');
  const text   = input.value.trim();
  if (!text) return;

  input.value = '';
  addBubble('me', text);
  chatHistory.push({ role: 'user', content: text });
  sendBtn.disabled = true;
  showTyping();

  const systemPrompt = `You are a professional private banking advisor at Said Banking, a prestigious private bank. ` +
    `You are polished, concise, and knowledgeable. ` +
    `Here is the client's current financial context: ${buildContext()} ` +
    `Answer questions about their accounts, provide tailored financial advice, and assist with banking queries. ` +
    `Keep responses under 130 words. Plain text only — no markdown, no bullet points.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 200,
        system:     systemPrompt,
        messages:   chatHistory
      })
    });

    const data  = await response.json();
    const reply = data.content?.map(c => c.text || '').join('') ||
                  'I encountered an issue processing your request. Please try again.';

    removeTyping();
    chatHistory.push({ role: 'assistant', content: reply });
    addBubble('ai', reply);

  } catch (err) {
    console.error('AI Advisor error:', err);
    removeTyping();
    addBubble('ai', 'I am temporarily unavailable. Please try again shortly.');
  }

  sendBtn.disabled = false;
}

/* =====================================================================
   CHAINPROOF — SAKURA DESIGN SYSTEM
   app.js
   ===================================================================== */

/* ─── FALLING PETALS ─────────────────────────────────────────────────── */
(function initPetals() {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;

  const PETAL_COUNT  = 28;
  const PETAL_COLORS = ['#F2C4CE', '#EDB5C2', '#F7D5DC', '#FADEEA', '#F5C8D4'];

  function makePetalSVG(color, size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="6" rx="5" ry="7" fill="${color}" opacity="0.85" transform="rotate(0   10 10)"/>
      <ellipse cx="10" cy="6" rx="5" ry="7" fill="${color}" opacity="0.75" transform="rotate(72  10 10)"/>
      <ellipse cx="10" cy="6" rx="5" ry="7" fill="${color}" opacity="0.80" transform="rotate(144 10 10)"/>
      <ellipse cx="10" cy="6" rx="5" ry="7" fill="${color}" opacity="0.75" transform="rotate(216 10 10)"/>
      <ellipse cx="10" cy="6" rx="5" ry="7" fill="${color}" opacity="0.70" transform="rotate(288 10 10)"/>
      <circle  cx="10" cy="10" r="2" fill="#F7E0A0" opacity="0.70"/>
    </svg>`;
  }

  function spawnPetal() {
    const el    = document.createElement('div');
    el.className = 'petal';

    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const size  = 14 + Math.random() * 18;
    const dur   = 7  + Math.random() * 10;

    el.innerHTML = makePetalSVG(color, size);

    // Fall animation
    el.style.left            = `${Math.random() * 100}%`;
    el.style.animation       = `fall ${dur}s linear infinite`;
    el.style.animationDelay  = `-${Math.random() * dur}s`;

    // Horizontal sway on the inner SVG
    const svg = el.querySelector('svg');
    svg.style.animation      = `sway ${3 + Math.random() * 4}s ease-in-out infinite alternate`;
    svg.style.display        = 'block';

    canvas.appendChild(el);
  }

  for (let i = 0; i < PETAL_COUNT; i++) spawnPetal();
})();


/* ─── WEB3 STATE ─────────────────────────────────────────────────────── */
let web3, accounts;
let registryContract, repairContract, verificationContract;


/* ─── ABIs ───────────────────────────────────────────────────────────── */
const REGISTRY_ABI = [
  {
    inputs: [
      { name: '_serialNumber', type: 'string' },
      { name: '_imei',         type: 'string' },
      { name: '_model',        type: 'string' }
    ],
    name: 'registerDevice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_partNumber',    type: 'string' },
      { name: '_componentType', type: 'string' }
    ],
    name: 'registerComponent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'deviceExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const REPAIR_ABI = [
  {
    inputs: [
      { name: '_serialNumber', type: 'string' },
      { name: '_removedPart',  type: 'string' },
      { name: '_newPart',      type: 'string' }
    ],
    name: 'logRepair',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'getRepairHistory',
    outputs: [{
      name: '',
      type: 'tuple[]',
      components: [
        { name: 'serialNumber', type: 'string'  },
        { name: 'removedPart',  type: 'string'  },
        { name: 'newPart',      type: 'string'  },
        { name: 'repairer',     type: 'address' },
        { name: 'timestamp',    type: 'uint256' },
        { name: 'status',       type: 'uint8'   }
      ]
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'getRepairCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const VERIFICATION_ABI = [
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'verifyDevice',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'getTrustScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs:  [{ name: '_serialNumber', type: 'string' }],
    name:    'getFullHistory',
    outputs: [
      { name: 'isActive',   type: 'bool'    },
      { name: 'trustScore', type: 'uint256' },
      {
        name: 'repairs',
        type: 'tuple[]',
        components: [
          { name: 'serialNumber', type: 'string'  },
          { name: 'removedPart',  type: 'string'  },
          { name: 'newPart',      type: 'string'  },
          { name: 'repairer',     type: 'address' },
          { name: 'timestamp',    type: 'uint256' },
          { name: 'status',       type: 'uint8'   }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];


/* ─── WALLET ─────────────────────────────────────────────────────────── */
async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not detected. Please install the MetaMask extension.');
    return;
  }

  web3     = new Web3(window.ethereum);
  accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

  const addr  = accounts[0];
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  document.getElementById('dot').classList.add('live');
  document.getElementById('walletInfo').innerHTML =
    `Connected · <span class="addr">${short}</span>`;
}


/* ─── CONTRACT LOADER ────────────────────────────────────────────────── */
function loadContracts() {
  const ra = val('addrRegistry');
  const re = val('addrRepair');
  const rv = val('addrVerification');

  if (!web3)        { set('contractStatus', '↳ Connect MetaMask first.'); return; }
  if (!ra || !re || !rv) { set('contractStatus', '↳ All three addresses are required.'); return; }

  try {
    registryContract     = new web3.eth.Contract(REGISTRY_ABI,     ra);
    repairContract       = new web3.eth.Contract(REPAIR_ABI,       re);
    verificationContract = new web3.eth.Contract(VERIFICATION_ABI, rv);
    set('contractStatus', '✓ Contracts loaded — all three interfaces ready.');
  } catch (e) {
    set('contractStatus', `✗ ${e.message}`);
  }
}


/* ─── OEM: REGISTER DEVICE ───────────────────────────────────────────── */
async function registerDevice() {
  if (!registryContract) { set('regResult', '↳ Load contracts first.'); return; }

  const serial = val('regSerial');
  const imei   = val('regImei');
  const model  = val('regModel');

  if (!serial || !imei || !model) { set('regResult', '↳ Fill all fields.'); return; }

  try {
    set('regResult', '⋯ Broadcasting transaction…');
    await registryContract.methods.registerDevice(serial, imei, model).send({ from: accounts[0] });
    set('regResult', `✓ Device "${serial}" registered on-chain.`);
  } catch (e) {
    set('regResult', `✗ ${e.message}`);
  }
}


/* ─── OEM: REGISTER COMPONENT ────────────────────────────────────────── */
async function registerComponent() {
  if (!registryContract) { set('compResult', '↳ Load contracts first.'); return; }

  const part = val('compPart');
  const type = val('compType');

  if (!part || !type) { set('compResult', '↳ Fill all fields.'); return; }

  try {
    set('compResult', '⋯ Broadcasting transaction…');
    await registryContract.methods.registerComponent(part, type).send({ from: accounts[0] });
    set('compResult', `✓ Component "${part}" (${type}) registered.`);
  } catch (e) {
    set('compResult', `✗ ${e.message}`);
  }
}


/* ─── REPAIR: LOG EVENT ──────────────────────────────────────────────── */
async function logRepair() {
  if (!repairContract) { set('repResult', '↳ Load contracts first.'); return; }

  const serial  = val('repSerial');
  const oldPart = val('repOld');
  const newPart = val('repNew');

  if (!serial || !oldPart || !newPart) { set('repResult', '↳ Fill all fields.'); return; }

  try {
    set('repResult', '⋯ Broadcasting transaction…');
    await repairContract.methods.logRepair(serial, oldPart, newPart).send({ from: accounts[0] });
    set('repResult', `✓ Repair logged for "${serial}".`);
  } catch (e) {
    set('repResult', `✗ ${e.message}`);
  }
}


/* ─── CONSUMER: VERIFY ───────────────────────────────────────────────── */
async function verifyDevice() {
  if (!verificationContract) { set('verResult', '↳ Load contracts first.'); return; }

  const serial = val('verSerial');
  if (!serial) { set('verResult', '↳ Enter a serial number.'); return; }

  try {
    const ok = await verificationContract.methods.verifyDevice(serial).call();
    set('verResult',
      ok
        ? `✓ "${serial}" — ACTIVE on-chain.`
        : `✗ "${serial}" — not found or decommissioned.`
    );
  } catch (e) {
    set('verResult', `✗ ${e.message}`);
  }
}


/* ─── CONSUMER: TRUST SCORE ──────────────────────────────────────────── */
async function getTrustScore() {
  if (!verificationContract) { set('verResult', '↳ Load contracts first.'); return; }

  const serial = val('verSerial');
  if (!serial) { set('verResult', '↳ Enter a serial number.'); return; }

  try {
    const score = parseInt(await verificationContract.methods.getTrustScore(serial).call());
    updateScoreUI(score);

    const msg =
      score === 100 ? 'No repairs on record — all original OEM components.' :
      score >= 75   ? 'Mostly genuine parts. Minor non-OEM components detected.' :
      score >= 40   ? 'Mixed provenance — some unverified components installed.' :
                      'High proportion of unverified parts. Proceed with caution.';

    set('verResult', `Trust Score  ${score}/100\n${msg}`);
  } catch (e) {
    set('verResult', `✗ ${e.message}`);
  }
}


/* ─── CONSUMER: FULL HISTORY ─────────────────────────────────────────── */
async function getFullHistory() {
  if (!verificationContract) { set('verResult', '↳ Load contracts first.'); return; }

  const serial = val('verSerial');
  if (!serial) { set('verResult', '↳ Enter a serial number.'); return; }

  try {
    const r      = await verificationContract.methods.getFullHistory(serial).call();
    const labels = ['VERIFIED', 'FLAGGED'];

    updateScoreUI(parseInt(r.trustScore));

    let out =
      `Serial      ${serial}\n` +
      `Status      ${r.isActive ? 'Active' : 'Decommissioned'}\n` +
      `Trust Score ${r.trustScore}/100\n` +
      `Repairs     ${r.repairs.length}\n`;

    if (r.repairs.length === 0) {
      out += '\nNo repairs on record — all original components.';
    } else {
      out += '\n';
      r.repairs.forEach((rep, i) => {
        const date = new Date(parseInt(rep.timestamp) * 1000)
          .toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

        out +=
          `— Repair #${i + 1}  [${labels[rep.status]}]\n` +
          `  Removed    ${rep.removedPart}\n` +
          `  Installed  ${rep.newPart}\n` +
          `  Repairer   ${rep.repairer}\n` +
          `  Date       ${date}\n\n`;
      });
    }

    set('verResult', out);
  } catch (e) {
    set('verResult', `✗ ${e.message}`);
  }
}


/* ─── SCORE UI UPDATE ────────────────────────────────────────────────── */
function updateScoreUI(n) {
  const panel = document.getElementById('scorePanel');
  const num   = document.getElementById('scoreNum');
  const fill  = document.getElementById('barFill');
  const tag   = document.getElementById('scoreTag');
  const desc  = document.getElementById('scoreDesc');

  panel.style.display = 'block';
  num.textContent     = n;
  fill.style.width    = `${n}%`;

  const color =
    n >= 75 ? 'var(--green)' :
    n >= 40 ? 'var(--amber)' :
              'var(--red)';

  num.style.color       = color;
  fill.style.background = color;

  if (n >= 75) {
    tag.innerHTML   = '<span class="tag tag-ok">TRUSTED</span>';
    desc.textContent = n === 100
      ? 'All original OEM components.'
      : 'Mostly genuine OEM parts.';
  } else if (n >= 40) {
    tag.innerHTML    = '<span class="tag tag-warn">MIXED</span>';
    desc.textContent = 'Some unverified components present.';
  } else {
    tag.innerHTML    = '<span class="tag tag-risk">RISK</span>';
    desc.textContent = 'High proportion of non-OEM parts.';
  }
}


/* ─── UTILS ──────────────────────────────────────────────────────────── */
// Get trimmed input value by element ID
function val(id) {
  return document.getElementById(id).value.trim();
}

// Set element text content by ID
function set(id, msg) {
  document.getElementById(id).textContent = msg;
}

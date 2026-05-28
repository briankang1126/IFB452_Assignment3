/* =====================================================================
   CHAINPROOF — SAKURA DESIGN SYSTEM
   app.js — GANACHE DIRECT CONNECTION (no MetaMask)
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
    el.style.left            = `${Math.random() * 100}%`;
    el.style.animation       = `fall ${dur}s linear infinite`;
    el.style.animationDelay  = `-${Math.random() * dur}s`;

    const svg = el.querySelector('svg');
    if (svg) {
      svg.style.animation      = `sway ${3 + Math.random() * 4}s ease-in-out infinite alternate`;
      svg.style.display        = 'block';
    }

    canvas.appendChild(el);
  }

  for (let i = 0; i < PETAL_COUNT; i++) spawnPetal();
})();


/* ─── GANACHE CONNECTION (Direct, no MetaMask) ───────────────────────── */
let web3, accounts, currentAccount;
let registryContract, repairContract, verificationContract;

// Ganache default RPC URL
const GANACHE_RPC = "http://127.0.0.1:7545";

// Hardcoded Ganache accounts (from default Ganache)
const GANACHE_ACCOUNTS = [
  "0x0A676e37689177ab32f9A409cBC8c6c9ee9F68B7",  // Account 0 (OEM)
  "0xC5dCC502293A5700C095Eb54b65f7dd1AB53177",  // Account 1 (Repairer)
  "0x78544640e3355Bb6A393019A83C74f5B287579f6",  // Account 2 (Consumer)
  "0x3F9b5B72B9D9a517D68fdEA446f658740FB9fDDF",  // Account 3
  "0x047051b9BD818c68CcA03B301bdD16d63a3f83FB",  // Account 4
  "0x2ADF82C6B3542c5402Ab7CFA6f792E5D46191d25",  // Account 5
  "0xe9a7b1B966b78acEbeE6667d5435B19cf9E8899c"   // Account 6
];

// Connect to Ganache automatically on page load
async function connectToGanache() {
  const statusDiv = document.getElementById('connectionStatus');
  if (statusDiv) {
    statusDiv.innerHTML = 'Connecting to Ganache...';
  }

  try {
    // Connect directly to Ganache RPC
    web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC));
    
    // Get accounts from Ganache
    accounts = await web3.eth.getAccounts();
    
    if (accounts.length === 0) {
      throw new Error("No accounts found. Is Ganache running?");
    }
    
    currentAccount = accounts[0];
    
    // Update wallet bar
    const addrShort = `${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}`;
    const walletInfo = document.getElementById('walletInfo');
    const dot = document.getElementById('dot');
    
    if (walletInfo) {
      walletInfo.innerHTML = `Ganache · <span class="addr">${addrShort}</span> (OEM account)`;
    }
    if (dot) {
      dot.classList.add('live');
    }
    
    // Also update the header chip to show Ganache instead of Sepolia
    const headerChips = document.querySelectorAll('.chip');
    if (headerChips.length > 0) {
      headerChips[0].textContent = 'Ganache Local';
    }
    
    // Update connection status
    if (statusDiv) {
      statusDiv.innerHTML = `✅ Connected to Ganache at ${GANACHE_RPC}<br>📋 Using account: ${addrShort}`;
    }
    
    console.log("Connected to Ganache. Accounts:", accounts);
    return true;
    
  } catch (error) {
    console.error("Ganache connection error:", error);
    if (statusDiv) {
      statusDiv.innerHTML = `❌ Failed to connect to Ganache.<br>Make sure Ganache is running at ${GANACHE_RPC}<br>Error: ${error.message}`;
    }
    return false;
  }
}


/* ─── ABIs ───────────────────────────────────────────────────────────── */
const REGISTRY_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_partNumber",
				"type": "string"
			}
		],
		"name": "componentExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "components",
		"outputs": [
			{
				"internalType": "string",
				"name": "partNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "componentType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "manufactureDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "decommission",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "deviceExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "devices",
		"outputs": [
			{
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imei",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "model",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "manufactureDate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "currentOwner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "decommissioned",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "getDevice",
		"outputs": [
			{
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imei",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "model",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "manufactureDate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "currentOwner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "decommissioned",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "oem",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_partNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_componentType",
				"type": "string"
			}
		],
		"name": "registerComponent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imei",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_model",
				"type": "string"
			}
		],
		"name": "registerDevice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const REPAIR_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_deviceRegistryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "repairer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newPart",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "enum RepairEvent.RepairStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "RepairLogged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "getRepairCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "getRepairHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "serialNumber",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "removedPart",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "newPart",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "repairer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum RepairEvent.RepairStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct RepairEvent.Repair[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_removedPart",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_newPart",
				"type": "string"
			}
		],
		"name": "logRepair",
		"outputs": [
			{
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const VERIFICATION_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_deviceRegistryAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_repairEventAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "getFullHistory",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "trustScore",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "string",
						"name": "serialNumber",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "removedPart",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "newPart",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "repairer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum IRepairEvent.RepairStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct IRepairEvent.Repair[]",
				"name": "repairs",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "getTrustScore",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_serialNumber",
				"type": "string"
			}
		],
		"name": "verifyDevice",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


/* ─── CONTRACT LOADER ────────────────────────────────────────────────── */
async function loadContracts() {
  const ra = document.getElementById('addrRegistry')?.value.trim();
  const re = document.getElementById('addrRepair')?.value.trim();
  const rv = document.getElementById('addrVerification')?.value.trim();

  if (!web3) {
    set('contractStatus', '↳ Connect to Ganache first (auto-connecting on page load).');
    return;
  }
  if (!ra || !re || !rv) {
    set('contractStatus', '↳ All three addresses are required.');
    return;
  }

  try {
    registryContract     = new web3.eth.Contract(REGISTRY_ABI, ra);
    repairContract       = new web3.eth.Contract(REPAIR_ABI, re);
    verificationContract = new web3.eth.Contract(VERIFICATION_ABI, rv);
    set('contractStatus', '✓ Contracts loaded — all three interfaces ready.');
    
    // Update the account list display to show available Ganache accounts
    updateAccountDisplay();
  } catch (e) {
    set('contractStatus', `✗ ${e.message}`);
  }
}

function updateAccountDisplay() {
  const accountsList = document.querySelector('.wallet-label');
  if (accountsList && accounts) {
    const roles = ['OEM', 'Repairer', 'Consumer'];
    let html = '';
    for (let i = 0; i < Math.min(accounts.length, 3); i++) {
      const short = `${accounts[i].slice(0, 6)}…${accounts[i].slice(-4)}`;
      html += `<span style="margin-right:12px; font-size:11px;">${roles[i]}: ${short}</span>`;
    }
    accountsList.innerHTML = html;
  }
}


/* ─── OEM: REGISTER DEVICE ───────────────────────────────────────────── */
async function registerDevice() {
  if (!registryContract) { set('regResult', '↳ Load contracts first.'); return; }

  const serial = document.getElementById('regSerial')?.value.trim();
  const imei   = document.getElementById('regImei')?.value.trim();
  const model  = document.getElementById('regModel')?.value.trim();

  if (!serial || !imei || !model) { set('regResult', '↳ Fill all fields.'); return; }

  try {
    set('regResult', '⋯ Broadcasting transaction from OEM account...');
    await registryContract.methods.registerDevice(serial, imei, model)
      .send({ from: accounts[0], gas: 3000000 });
    set('regResult', `✓ Device "${serial}" registered on-chain.`);
  } catch (e) {
    set('regResult', `✗ ${e.message}`);
  }
}


/* ─── OEM: REGISTER COMPONENT ────────────────────────────────────────── */
async function registerComponent() {
  if (!registryContract) { set('compResult', '↳ Load contracts first.'); return; }

  const part = document.getElementById('compPart')?.value.trim();
  const type = document.getElementById('compType')?.value.trim();

  if (!part || !type) { set('compResult', '↳ Fill all fields.'); return; }

  try {
    set('compResult', '⋯ Broadcasting transaction from OEM account...');
    await registryContract.methods.registerComponent(part, type)
      .send({ from: accounts[0], gas: 3000000 });
    set('compResult', `✓ Component "${part}" (${type}) registered.`);
  } catch (e) {
    set('compResult', `✗ ${e.message}`);
  }
}


/* ─── REPAIR: LOG EVENT (using Account 2 — Repairer) ─────────────────── */
async function logRepair() {
  if (!repairContract) { set('repResult', '↳ Load contracts first.'); return; }

  const serial  = document.getElementById('repSerial')?.value.trim();
  const oldPart = document.getElementById('repOld')?.value.trim();
  const newPart = document.getElementById('repNew')?.value.trim();

  if (!serial || !oldPart || !newPart) { set('repResult', '↳ Fill all fields.'); return; }

  try {
    set('repResult', '⋯ Broadcasting transaction from Repairer account (Account 2)...');
    // Use accounts[1] as the repairer (second Ganache account)
    const result = await repairContract.methods.logRepair(serial, oldPart, newPart)
      .send({ from: accounts[1], gas: 3000000 });
    set('repResult', `✓ Repair logged for "${serial}". ${result.events ? 'Event emitted.' : ''}`);
  } catch (e) {
    set('repResult', `✗ ${e.message}`);
  }
}


/* ─── CONSUMER: VERIFY ───────────────────────────────────────────────── */
async function verifyDevice() {
  if (!verificationContract) { set('verResult', '↳ Load contracts first.'); return; }

  const serial = document.getElementById('verSerial')?.value.trim();
  if (!serial) { set('verResult', '↳ Enter a serial number.'); return; }

  try {
    const ok = await verificationContract.methods.verifyDevice(serial).call({ gas: 1000000 });
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

  const serial = document.getElementById('verSerial')?.value.trim();
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

  const serial = document.getElementById('verSerial')?.value.trim();
  if (!serial) { set('verResult', '↳ Enter a serial number.'); return; }

  try {
    const r = await verificationContract.methods.getFullHistory(serial).call();
    const labels = ['VERIFIED', 'FLAGGED'];

    updateScoreUI(parseInt(r.trustScore));

    let out =
      `Serial      ${serial}\n` +
      `Status      ${r.isActive ? 'Active' : 'Decommissioned'}\n` +
      `Trust Score ${r.trustScore}/100\n` +
      `Repairs     ${r.repairs ? r.repairs.length : 0}\n`;

    if (!r.repairs || r.repairs.length === 0) {
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
          `  Repairer   ${rep.repairer.slice(0, 10)}...\n` +
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

  if (!panel) return;
  
  panel.style.display = 'block';
  if (num) num.textContent = n;
  if (fill) fill.style.width = `${n}%`;

  const color =
    n >= 75 ? '#5A8F70' :
    n >= 40 ? '#C4845C' :
              '#B94B5E';

  if (num) num.style.color = color;
  if (fill) fill.style.background = color;

  if (tag) {
    if (n >= 75) {
      tag.innerHTML = '<span class="tag tag-ok">TRUSTED</span>';
    } else if (n >= 40) {
      tag.innerHTML = '<span class="tag tag-warn">MIXED</span>';
    } else {
      tag.innerHTML = '<span class="tag tag-risk">RISK</span>';
    }
  }

  if (desc) {
    if (n === 100) {
      desc.textContent = 'All original OEM components.';
    } else if (n >= 75) {
      desc.textContent = 'Mostly genuine OEM parts.';
    } else if (n >= 40) {
      desc.textContent = 'Some unverified components present.';
    } else {
      desc.textContent = 'High proportion of non-OEM parts.';
    }
  }
}


/* ─── TRANSFER OWNERSHIP (Optional) ──────────────────────────────────── */
async function transferOwnership() {
  if (!registryContract) {
    alert('Load contracts first');
    return;
  }
  const serial = prompt('Enter device serial number:');
  const newOwner = prompt('Enter new owner address:');
  if (!serial || !newOwner) return;
  
  try {
    await registryContract.methods.transferOwnership(serial, newOwner)
      .send({ from: accounts[0], gas: 3000000 });
    alert(`Ownership of ${serial} transferred to ${newOwner.slice(0, 10)}...`);
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
}


/* ─── DECOMMISSION DEVICE (Optional) ─────────────────────────────────── */
async function decommissionDevice() {
  if (!registryContract) {
    alert('Load contracts first');
    return;
  }
  const serial = prompt('Enter device serial number to decommission:');
  if (!serial) return;
  
  try {
    await registryContract.methods.decommission(serial)
      .send({ from: accounts[0], gas: 3000000 });
    alert(`Device ${serial} has been decommissioned.`);
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
}


/* ─── UTILS ──────────────────────────────────────────────────────────── */
function set(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

// Initialize everything when page loads
window.onload = async () => {
  // Connect to Ganache automatically
  const connected = await connectToGanache();
  
  if (connected) {
    // Pre-fill contract addresses if you want to (optional)
    // You can hardcode your deployed addresses here for convenience
    // Example:
    document.getElementById('addrRegistry').value = "0x091ea9CB65fabF1FE6Fe600D1668598D1bbBdB58";
	document.getElementById('addrRepair').value = "0xA9c66D87B7051cbbFF10ddBc542765c5C100CADf";
	document.getElementById('addrVerification').value = "0x6bCbA30D9abA84aE3A35E6413a03dbc62855bfC6";
  }
};

// Expose functions globally for HTML buttons
window.connectWallet = connectToGanache;
window.loadContracts = loadContracts;
window.registerDevice = registerDevice;
window.registerComponent = registerComponent;
window.logRepair = logRepair;
window.verifyDevice = verifyDevice;
window.getTrustScore = getTrustScore;
window.getFullHistory = getFullHistory;
window.transferOwnership = transferOwnership;
window.decommissionDevice = decommissionDevice;
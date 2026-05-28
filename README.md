# Team86_IFB452_Assignment3 - Blockchain-Based Secondhand Electronics Verification System

ChainProof is a decentralised platform that tracks the ownership, repair history, and component authenticity of secondhand electronic devices (smartphones, laptops, etc.). It prevents counterfeit parts from entering the supply chain by recording every device registration, repair event, and component swap on a **private blockchain (Ganache)**.

- 🛡️ **Counterfeit detection** – Replacement parts are cross‑checked against an OEM registry.
- 📜 **Immutable repair history** – Every repair is permanently stored on‑chain.
- ⭐ **Trust score** – A score (0–100) that reflects the proportion of verified parts in a device.
- 🔗 **Three interacting smart contracts** – `DeviceRegistry`, `RepairEvent`, `Verification`.
- 🎨 **Sakura‑themed frontend** – HTML/CSS/JS with Web3.js connecting to Ganache.

## 🧱 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Blockchain   | Ganache (local Ethereum network)    |
| Smart Contracts | Solidity (v0.8.0)                |
| Frontend     | HTML5, CSS3, JavaScript, Web3.js    |
| Wallet       | Direct Ganache RPC (no MetaMask)    |

## 📦 Project Structure
```text
├── contracts/
│ ├── DeviceRegistry.sol
│ ├── RepairEvent.sol
│ └── Verification.sol
│ └── Test_test.sol
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── app.js
└── README.md
```

## ⚙️ Setup Instructions (for local demo)

### Prerequisites
- **Ganache** – download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache)
- **Remix IDE** – browser‑based at [remix.ethereum.org](https://remix.ethereum.org) or download Remix Desktop
- **Web server** – npx serve

### 1. Start Ganache
Launch Ganache and click **Quickstart**.  
Make sure the RPC server is `http://127.0.0.1:7545` and **Autominig** is enabled.

### 2. Deploy and compile contracts using Remix
- In Remix, set **Environment** → **Custom - External Http Provider** → `http://127.0.0.1:7545`.
- **Before compiling:** Open the **Solidity Compiler** tab → **Advanced Configuration** → set **EVM Version** to `london` (or `merge`). This avoids `invalid opcode` errors with Ganache.
- Compile all the contracts:
  1) DeviceRegistry.sol
  2) RepairEvent.sol
  3) Verification.sol
- Deploy in this order:
  1. `DeviceRegistry.sol` – copy its address.
  2. `RepairEvent.sol` – paste the DeviceRegistry address in the constructor.
  3. `Verification.sol` – paste both DeviceRegistry and RepairEvent addresses.
- After each deployment, copy the contract address (you will need them for the frontend).

### 3. Update the frontend
Open `frontend/app.js` and locate the `window.onload` section.  
Replace the three addresses with your deployed addresses:

- javascript
- document.getElementById('addrRegistry').value = "0x...";   // DeviceRegistry
- document.getElementById('addrRepair').value = "0x...";     // RepairEvent
- document.getElementById('addrVerification').value = "0x..."; // Verification


OR

Paste the 3 contract address at the frontend page load contracts section.

### 4. Run Frontend
- Run Frontend Folder at Visual Studio Code.
- Open Terminal and run 'npx serve .' at command prompt not powershell
- Copy the local address to one of the browser.
- You will see the frontend working fine

### 5. Load Contracts and test

After the frontend is running and contracts are loaded, perform these tests to verify the whole system.

#### 5.1 Load the contracts
- Click **Load Contracts** (the three addresses should already be pre‑filled in the Setup section).  
  ✅ You will see: `✓ Contracts loaded — all three interfaces ready.`

#### 5.2 Register a device (OEM section)
- **Serial number**: `PHONE001`  
- **IMEI**: `123456789012345`  
- **Model**: `Samsung Galaxy S23`  
- Click **Register Device**.  
  ✅ Expected: `✓ Device "PHONE001" registered on-chain.`

#### 5.3 Register a genuine component (OEM section)
- **Part number**: `BAT-GEN-001`  
- **Component type**: `battery`  
- Click **Register Component**.  
  ✅ Expected: `✓ Component "BAT-GEN-001" (battery) registered.`

#### 5.4 Log a VERIFIED repair (Repair Centre section)
- **Device serial number**: `PHONE001`  
- **Removed part**: `OLD-BAT-001`  
- **New part installed**: `BAT-GEN-001`  
- Click **Log Repair**.  
  ✅ Expected result shows a **VERIFIED** tag:  
  `✓ Repair logged for "PHONE001". New part BAT-GEN-001 → VERIFIED`

#### 5.5 Log a FLAGGED repair (Repair Centre section)
- **Device serial number**: `PHONE001`  
- **Removed part**: `OLD-SCR-001`  
- **New part installed**: `FAKE-SCR-001` (this part is not registered)  
- Click **Log Repair**.  
  ✅ Expected result shows a **FLAGGED** tag:  
  `✓ Repair logged for "PHONE001". New part FAKE-SCR-001 → FLAGGED`

#### 5.6 Check trust score (Consumer section)
- **Serial number**: `PHONE001`  
- Click **Trust Score**.  
  ✅ The score panel appears with **Trust Score: 50/100** and a half‑filled bar.  
  ✅ Description: “Mixed provenance — some unverified components installed.”

#### 5.7 View full history (Consumer section)
- **Serial number**: `PHONE001`  
- Click **Full History**.  
  ✅ Output shows device status, trust score and the two repairs with their VERIFIED/FLAGGED labels, timestamps, and repairer addresses.

#### 5.8 Transfer ownership (Ownership section)
- **Serial number**: `PHONE001`  
- **New owner wallet address**: copy the second Ganache account address (e.g., from the wallet bar, it looks like `0xC5dCC5...`).  
- Click **Transfer Ownership**.  
  ✅ Expected: `✓ Ownership of "PHONE001" transferred to 0xC5dCC5...`  
- *(Optional)* Try to transfer again from the original owner – it will fail with “Not current Owner”.

#### 5.9 Decommission device (Ownership section)
- **Serial number**: `PHONE001`  
- Click **Decommission**.  
  ✅ Expected: `✓ Device "PHONE001" permanently decommissioned.`  
- After decommission, trying to transfer ownership again will fail because the device is locked.

#### 5.10 Final verification (Consumer section)
- **Serial number**: `PHONE001`  
- **Verify** still returns active (device exists, but decommissioned).  
- **Trust Score** remains 50 (decommission does not alter repair history).  
- **Full History** still shows all repairs.

All these tests should succeed without errors. If any step fails, check the browser console (F12) for details.





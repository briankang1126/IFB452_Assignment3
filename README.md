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

javascript
document.getElementById('addrRegistry').value = "0x...";   // DeviceRegistry
document.getElementById('addrRepair').value = "0x...";     // RepairEvent
document.getElementById('addrVerification').value = "0x..."; // Verification

OR

Paste the 3 contract address at the frontend page load contracts section.

### 4. Run Frontend
- Run Frontend Folder at Visual Studio Code.
- Open Terminal and run 'npx serve .' at command prompt not powershell
- Copy the local address to one of the browser.
- You will see the frontend working fine

### 5. Load Contracts and test
- Click Load Contracts (the addresses should be pre‑filled if you do step 3).
- Use the OEM section to register a device (e.g., PHONE001) and a genuine component (BAT-GEN-001).
- Use the Repair Centre section to log a VERIFIED repair (using the genuine part) and a FLAGGED repair (using a fake part).
- Use the Consumer section to verify the device, check the trust score (100 → 50), and view full history.





# WealthCompare

A privacy-preserving web app where anyone can create a “room” to compare encrypted on-chain wealth with any number of participants. Powered by IncoNetwork confidential smart contracts, your balances remain encrypted—only the winner is revealed.

---

## 🎥 Demo Videos

### Frontend Walkthrough
<video src="web/public/videos/IncoFrontend.mp4" controls width="720">
  Your browser does not support the video tag.
</video>

https://drive.google.com/file/d/1RjxtbOAI9FHod1XBYWKJoebEkhcINZ1j/view?usp=sharing

### Smart Contracts Explanation
<video src="web/public/videos/IncoContracts.mp4" controls width="720" >
  Your browser does not support the video tag.
</video>

https://drive.google.com/file/d/1BPgJu4UpNagaliEh7PmpFqkDoWUVeQ3N/view?usp=sharing

---

## 💡 Features

- **Room Creation**  
  Deploy a new “room” with any number of Ethereum addresses.
- **Encrypted Wealth Submission**  
  Submit your on-chain balance as an encrypted value—no one sees your actual balance.
- **Confidential Winner Selection**  
  IncoNetwork confidential contracts compute the richest participant on-chain without revealing other balances.

---

## 🗂️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS  
- **Contracts**: Solidity, IncoNetwork Confidential SDK, Foundry  
- **Wallet Integration**: Wagmi, RainbowKit  
- **Encryption Libraries**: `euint256`, `ebool` from IncoNetwork

---

## 🚀 Getting Started with the frontend

### 1. Clone the repo
git clone https://github.com/DengreSarthak/IncoRichi.git

cd web

npm install

npm run dev

### Website will be live at http://localhost:3000/

## 🚀 Getting Started with the contracts

cd lightining-rod

bun install

forge build

### To run Solidity checks

cd test

forge build
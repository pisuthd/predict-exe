# Predict.exe

*The project is actively under development*

**Predict.exe** is a fully on-chain prediction market platform built on the **Massa Network**, enabling decentralized, trustless market creation and settlement. By leveraging **Autonomous Smart Contracts (ASC)**, Predict.exe automates the entire lifecycle of a market — from creation to resolution — without any manual intervention or centralized control.

## Problem

Most existing prediction markets rely on centralized oracles or admin intervention to resolve outcomes, creating trust issues and limiting decentralization. Predict.exe removes this dependency by combining on-chain data from **Dusa DEX** and decentralized oracle data from **Umbrella Network**, using Massa’s **ASC** to automatically resolve markets.

## ✨ Features

- 📊 Price predictions using **Dusa DEX** on-chain data  
- 🌐 Token price feeds (BTC, ETH, MAS) via **Umbrella Network**  
- 🔗 On-chain network metrics support  
- 🤖 Autonomous market resolution via **ASC**  
- 🔐 No manual intervention, admin keys, or central authority  
- 🖥️ Retro-styled frontend using **React95**

## 🔁 Flow

1. **Create Market**  
   Predict on Dusa DEX prices, on-chain metrics, or token prices via Umbrella.

2. **Constraints**  
   - Max 1-month settlement window  
   - Max 5 active markets

3. **Initial Liquidity**  
   Creator stakes MAS on "YES" or "NO" to initialize the market.

4. **Share Tokens**  
   Participants stake MAS on either side and receive share tokens representing their position.

5. **Settlement**  
   ASC fetches final price and automatically distributes rewards — no admin, no manual steps.

## How to Test

```
npm install
npm run test
```

For frontend

```
cd client
npm install
npm run dev
```

## Frontend

- Built with **Vite + React** and **React95** for a nostalgic desktop UI  
- Features a shared desktop view of all markets and taskbar controls  
- Live integration with Massa Buildnet smart contract  
- Wallet connection for market creation and participation  


## Next Steps

- Integrate live price feeds from **Umbrella Network**  
- Add more on-chain metrics as prediction sources  
- Finalize share token & reward distribution logic  
- Evaluate deployment via **Deweb**  
- Improve UI/UX for smoother market creation and participation

## Try It Out

Coming soon — we’ll provide a live demo link and setup instructions once ready

## 📄 License

MIT


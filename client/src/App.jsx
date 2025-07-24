import React, { useState } from 'react';
import styled from 'styled-components';
import { mockMarkets } from './data/mockData.js';
import Taskbar from "./components/Taskbar"
import Desktop from "./components/Desktop"

import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';

import AccountProvider from "./contexts/account"
import MarketProvider from "./contexts/market"

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: #008080;
  position: relative;
  overflow: hidden;
`;

const DesktopArea = styled.div`
  height: calc(100vh - 40px);
  width: 100vw;
  position: relative;
`;

function App() {

  const [modals, setModals] = useState({
    about: true,
    newProject: false,
    walletInfo: false,
    marketList: false
  });

  const [activeModalId, setActiveModalId] = useState(null); // Track which modal is currently active

  const closeModal = (name) => {
    setModals(prev => ({ ...prev, [name]: false }));
    // If we're closing the active modal, clear active state
    if (activeModalId === name) {
      setActiveModalId(null);
    }
  };

  const toggleModal = (name) => {
    setModals(prev => {
      const newState = { ...prev, [name]: !prev[name] };

      // If opening a modal, make it active
      if (newState[name]) {
        setActiveModalId(name);
      }

      return newState;
    });
  };

  // const handleProjectClick = (market) => {
  //   const modalId = `projectDetails_${market.id}`;

  //   // Check if this market is already open
  //   const isAlreadyOpen = openMarkets.some(openMarket => openMarket.id === market.id);

  //   if (!isAlreadyOpen) {
  //     // Add market to openMarkets array
  //     setOpenMarkets(prev => [...prev, market]);
  //   }

  //   // Always set this modal as active (bring to front)
  //   setActiveModalId(modalId);
  // };

  // const handleProjectSubmit = (marketData) => {
  //   const newMarket = {
  //     id: `market-${Date.now()}`,
  //     ...marketData,
  //     createdAt: new Date().toISOString(),
  //     totalPool: 0,
  //     yesShares: 0,
  //     noShares: 0,
  //     yesPrice: 0.5,
  //     noPrice: 0.5,
  //     status: 'active',
  //     position: {
  //       x: Math.random() * 400 + 50,
  //       y: Math.random() * 250 + 50
  //     }
  //   };
  //   setMarkets(prev => [...prev, newMarket]);
  //   closeModal('newProject');
  // };


  return (
    <MarketProvider>
      <AccountProvider>
        <AppContainer>
          <DesktopArea>
            <Desktop
              // onMarketClick={handleProjectClick}
              toggleModal={toggleModal}
            />
          </DesktopArea>
          <Taskbar
            modals={modals}
            closeModal={closeModal}
            toggleModal={toggleModal}
            // onProjectSubmit={handleProjectSubmit}
            // openMarkets={openMarkets}
            activeModalId={activeModalId}
          />
        </AppContainer>
      </AccountProvider>
    </MarketProvider>
  );
}

export default App;

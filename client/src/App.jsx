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

  const [selected, setSelected] = useState(undefined)

  const [modals, setModals] = useState({
    about: true,
    newProject: false,
    walletInfo: false,
    marketList: false,
    marketInfo: false
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

  const handleMarketClick = (market) => {

    setModals(prev => {
      const newState = { ...prev, ["marketInfo"]: true };

      // If opening a modal, make it active
      if (newState["marketInfo"]) {
        setActiveModalId("marketInfo");
      }

      setSelected(market)

      return newState;
    });

  }
 


  return (
    <MarketProvider>
      <AccountProvider>
        <AppContainer>
          <DesktopArea>
            <Desktop
              onMarketClick={handleMarketClick}
              toggleModal={toggleModal}
            />
          </DesktopArea>
          <Taskbar
            modals={modals}
            closeModal={closeModal}
            toggleModal={toggleModal}
            selected={selected} 
            activeModalId={activeModalId}
            onMarketClick={handleMarketClick}
          />
        </AppContainer>
      </AccountProvider>
    </MarketProvider>
  );
}

export default App;

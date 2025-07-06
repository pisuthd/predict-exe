import { useState, useEffect } from "react"
import { Modal, TaskBar, List, TitleBar } from "@react95/core"
import { WindowsExplorer, ReaderClosed, Computer3, InfoBubble, Bulb } from "@react95/icons";
import About from "../About"
import ProjectWizard from "../ProjectWizard"
import ProjectDetails from "../ProjectDetails"

const Taskbar = ({
    modals,
    closeModal,
    toggleModal,
    selectedProject,
    onProjectSubmit,
    isWalletConnected = false,
    onWalletToggle = () => {},
    openMarkets = [], // Array of currently open market detail modals
    activeModalId = null // ID of the currently active modal
}) => {

    // Helper function to generate dynamic positions
    const getDynamicPosition = (index, type = 'default') => {
        const basePositions = {
            about: { x: 80, y: 40 },
            newProject: { x: 150, y: 100 },
            projectDetails: { x: 200, y: 150 }
        };
        
        const base = basePositions[type] || basePositions.default;
        const offset = index * 30; // Stagger by 30px each
        
        return {
            x: base.x + offset,
            y: base.y + offset
        };
    };

    // Modal configurations
    const modalConfigs = {
        about: {
            component: <About/>,
            props: {
                width: "400px",
                icon: <InfoBubble variant="32x32_4" />,
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("about")} />],
                title: "Welcome to Predict.exe",
                buttons: [{ value: "Close", onClick: () => closeModal("about") }],
                dragOptions: {
                    defaultPosition: getDynamicPosition(0, 'about')
                }
            }
        },
        newProject: {
            component: (
                <ProjectWizard
                    onSubmit={onProjectSubmit}
                    onCancel={() => closeModal("newProject")}
                />
            ),
            props: {
                icon: <InfoBubble variant="32x32_4" />,
                title: "Create New Prediction Market",
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("newProject")} />],
                width: "500px",
                height: "450px",
                dragOptions: {
                    defaultPosition: getDynamicPosition(1, 'newProject')
                }
            }
        }
    };

    // Generate dynamic modal configs for each open market
    const getMarketModalConfigs = () => {
        const marketModals = {};
        
        openMarkets.forEach((market, index) => {
            const modalKey = `projectDetails_${market.id}`;
            marketModals[modalKey] = {
                component: (
                    <ProjectDetails
                        project={market}
                        onClose={() => closeModal(modalKey)}
                    />
                ),
                condition: true,
                props: {
                    icon: <InfoBubble variant="32x32_4" />,
                    title: market.question || "Market Details",
                    titleBarOptions: [
                        <TitleBar.Close 
                            key="close" 
                            onClick={() => closeModal(modalKey)} 
                        />
                    ],
                    width: "450px",
                    height: "600px",
                    dragOptions: {
                        defaultPosition: getDynamicPosition(index, 'projectDetails')
                    }
                }
            };
        });
        
        return marketModals;
    };

    // Combine all modal configs
    const allModalConfigs = {
        ...modalConfigs,
        ...getMarketModalConfigs()
    };

    // Render active modals
    const renderModals = () => {
        // Sort modals so active one renders last (on top)
        const modalEntries = Object.entries(allModalConfigs);
        const sortedModals = modalEntries.sort(([modalName]) => {
            return modalName === activeModalId ? 1 : -1;
        });

        return sortedModals.map(([modalName, config]) => {
            // Check if modal should be shown
            let isActive;
            
            if (modalName.startsWith('projectDetails_')) {
                // For market detail modals, check if the market is in openMarkets
                const marketId = modalName.replace('projectDetails_', '');
                isActive = openMarkets.some(market => market.id === marketId);
            } else {
                // For other modals, check the modals state
                isActive = modals[modalName];
            }
            
            const hasCondition = config.condition !== undefined ? config.condition : true;

            if (!isActive || !hasCondition) return null;

            // Add a unique key that includes timestamp for newly opened modals
            const modalKey = modalName === activeModalId ? 
                `${modalName}_${Date.now()}` : modalName;

            // Return component with Modal wrapper
            return <Modal key={modalKey} {...config.props}>
                {config.component}
            </Modal>
        });
    };

    return (
        <div>
            {renderModals()}

            <TaskBar list={<List>
                <List.Item
                    icon={<InfoBubble variant="32x32_4" />}
                    onClick={() => toggleModal("newProject")}
                >
                    Create Market
                </List.Item>
                <List.Item
                    icon={<InfoBubble variant="32x32_4" />}
                    onClick={() => toggleModal("about")}
                >
                    About Predict.exe
                </List.Item>
                <List.Divider />
                <List.Item
                    icon={<Computer3 variant="32x32_4" />}
                    onClick={onWalletToggle}
                >
                    {/* {isWalletConnected ? 'Disconnect Wallet' : 'Connect Wallet'} */}
                    Shut Down...
                </List.Item>
            </List>} />
        </div>
    )
}

export default Taskbar

import { useState, useEffect, useContext } from "react"
import { Modal, TaskBar, List, TitleBar } from "@react95/core"
import { Forbidden, Computer, Explore, Appwiz1502, Unmute, Password1000, Computer3, InfoBubble, Bulb, Mailnews21, Progman1, Ulclient1002, Globe } from "@react95/icons";
import About from "../About"
import ProjectWizard from "../ProjectWizard"
import ProjectDetails from "../ProjectDetails"
import WalletInfo from "../WalletInfo";
import MarketList from "../MarketList";
import { getWallets } from "@massalabs/wallet-provider";
import { AccountContext } from "../../contexts/account";
import { MarketContext } from "../../contexts/market";

const TaskbarContainer = ({
    modals,
    closeModal,
    toggleModal,
    selected,
    onMarketClick,
    activeModalId = null // ID of the currently active modal
}) => {

    const [accounts, setAccounts] = useState([])

    const { account, connect, disconnect, setProvider } = useContext(AccountContext)
    const { markets } = useContext(MarketContext) // Add addMarket from context

    useEffect(() => {
        checkWallet()
    }, [])

    const checkWallet = async () => {
        // Get list of available wallets
        const wallets = await getWallets();

        for (let wallet of wallets) {
            const walletName = wallet.name()
            if (walletName === "MASSA WALLET") {
                setProvider(wallet)
                const accounts = await wallet.accounts();
                setAccounts(accounts)
                break
            }
        }
    }

    // Helper function to generate dynamic positions
    const getDynamicPosition = (index, type = 'default') => {
        const basePositions = {
            about: { x: 80, y: 40 },
            newProject: { x: 150, y: 100 },
            projectDetails: { x: 200, y: 40 },
            walletInfo: { x: 250, y: 0 }
        };

        const base = basePositions[type] || basePositions.default || { x: 100, y: 50 };
        const offset = index * 20; // Stagger by 30px each

        return {
            x: base.x + offset,
            y: base.y + offset
        };
    };

    // Modal configurations
    const modalConfigs = {
        about: {
            component: <About />,
            props: {
                width: "400px",
                icon: <InfoBubble variant="32x32_4" />,
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("about")} />],
                title: "Welcome to Predict.exe",
                buttons: [{ value: "See Markets", onClick: () => toggleModal("marketList") }, { value: "Close", onClick: () => closeModal("about") }],
                dragOptions: {
                    defaultPosition: getDynamicPosition(0, 'about')
                }
            }
        },
        newProject: {
            component: (
                <ProjectWizard
                    onSubmit={() => { }}
                    onCancel={() => closeModal("newProject")}
                />
            ),
            props: {
                icon: <InfoBubble variant="32x32_4" />,
                title: "Create New Prediction Market",
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("newProject")} />],
                width: "500px",
                dragOptions: {
                    defaultPosition: getDynamicPosition(1, 'newProject')
                }
            }
        },
        walletInfo: {
            component: (
                <WalletInfo
                    onCopyAddress={(address) => navigator.clipboard.writeText(address)}
                    onClose={() => closeModal("walletInfo")}
                    onMarketClick={onMarketClick}
                />
            ),
            props: {
                icon: <Password1000 variant="32x32_4" />,
                title: "Wallet Information",
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("walletInfo")} />],
                width: "500px",
                dragOptions: {
                    defaultPosition: getDynamicPosition(2, 'walletInfo')
                }
            }
        },
        marketList: {
            component: (
                <MarketList
                    onMarketClick={onMarketClick}
                />
            ),
            props: {
                icon: <Explore variant="32x32_4" />,
                title: "View All Markets",
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("marketList")} />],
                width: "800px",
                buttons: [{ value: "Close", onClick: () => closeModal("marketList") }],
                dragOptions: {
                    defaultPosition: getDynamicPosition(2, 'marketList')
                }
            }
        }
    };

    // Generate dynamic modal configs for each open market
    // const getMarketModalConfigs = () => {
    //     const marketModals = {};

    //     openMarkets.forEach((market, index) => {
    //         const modalKey = `projectDetails_${market.id}`;
    //         marketModals[modalKey] = {
    //             component: (
    //                 <ProjectDetails
    //                     project={market}
    //                     onClose={() => closeModal(modalKey)}
    //                 />
    //             ),
    //             condition: true,
    //             props: {
    //                 icon: <InfoBubble variant="32x32_4" />,
    //                 title: market.question || "Market Details",
    //                 titleBarOptions: [
    //                     <TitleBar.Close
    //                         key="close"
    //                         onClick={() => closeModal(modalKey)}
    //                     />
    //                 ],
    //                 width: "450px", 
    //                 dragOptions: {
    //                     defaultPosition: getDynamicPosition(index, 'projectDetails')
    //                 }
    //             }
    //         };
    //     });

    //     return marketModals;
    // };

    // Combine all modal configs
    const allModalConfigs = {
        ...modalConfigs,
        // ...getMarketModalConfigs(),
        // only one market at a time for now
        marketInfo: {
            component: <ProjectDetails project={selected} onClose={() => closeModal("marketInfo")} />,
            props: {
                width: "450px",
                icon: <InfoBubble variant="32x32_4" />,
                titleBarOptions: [<TitleBar.Close key="close" onClick={() => closeModal("marketInfo")} />],
                title: selected && selected.question || "Market Details",
                dragOptions: {
                    defaultPosition: getDynamicPosition(0, 'projectDetails')
                }
            }
        }
    };

    // Render active modals
    const renderModals = () => {
        // Sort modals so active one renders last (on top)
        const modalEntries = Object.entries(allModalConfigs);
        const sortedModals = modalEntries.sort(([modalName]) => {
            return modalName === activeModalId ? -1 : 1;
        });

        return sortedModals.map(([modalName, config]) => {
            // Check if modal should be shown
            const isActive = modals[modalName]

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

            <TaskBar list={<List style={{ minWidth: "160px" }}>

                <List.Item onClick={() => toggleModal("marketList")} icon={<Explore variant="32x32_4" />}>
                    View All Markets
                </List.Item>
                <List.Item style={{ width: "180px" }} icon={<Unmute variant="32x32_4" />}>
                    <List style={{ width: "360px" }}>
                        {markets.slice(0, 3).map((market) => (
                            <List.Item
                                key={market.id}
                                icon={<InfoBubble variant="32x32_4" />}
                                onClick={() => {
                                    onMarketClick(market)
                                }}
                            >
                                {market.question.slice(0, 50)}...
                            </List.Item>
                        ))}
                        {markets.length === 0 && (
                            <List.Item icon={<InfoBubble variant="32x32_4" />}>
                                No markets available
                            </List.Item>
                        )}
                    </List>
                    Trending
                </List.Item>
                <List.Item
                    icon={<Appwiz1502 variant="32x32_4" />}
                    onClick={() => toggleModal("newProject")}
                >
                    Setup New Market
                </List.Item>

                {account && (
                    <List.Item
                        icon={<Password1000 variant="32x32_4" />}
                        onClick={() => account ? toggleModal("walletInfo") : alert("Please connect to one of your account first")}
                    >
                        My Wallet
                    </List.Item>
                )}

                <List.Item
                    icon={<InfoBubble variant="32x32_4" />}
                    onClick={() => toggleModal("about")}
                >
                    About
                </List.Item>

                <List.Divider />
                {account ?
                    <List.Item
                        icon={<Computer3 variant="32x32_4" />}
                        onClick={(() => disconnect())}
                    >
                        Disconnect...
                    </List.Item>
                    :
                    <List.Item icon={<Mailnews21 variant="32x32_4" />}>
                        <List>
                            {accounts.length === 0 && (
                                <List.Item
                                    icon={<Forbidden variant="32x32_4" />}
                                    style={{ width: "200px" }}
                                >
                                    No MassaStation Found
                                </List.Item>
                            )}
                            {accounts.map((account, index) => {
                                const shortAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
                                return (
                                    <List.Item
                                        key={index}
                                        icon={<Ulclient1002 variant="32x32_4" />}
                                        onClick={() => {
                                            connect(account)
                                            toggleModal("walletInfo")
                                        }}
                                    >
                                        {account.accountName} ({shortAddress})
                                    </List.Item>
                                );
                            })}
                        </List>
                        Connect To
                    </List.Item>
                }

            </List>} />
        </div >
    )
}

export default TaskbarContainer
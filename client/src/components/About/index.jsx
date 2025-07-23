import React from 'react'
import { Modal, Frame, Fieldset, TextArea } from '@react95/core'
import { InfoBubble } from '@react95/icons'
import styled from 'styled-components';


const Logo = styled.img.attrs(() => ({ src: "./logo-alt-1.gif" }))`
     width: 100%;
     position: relative; 
`

const About = () => {
    return (
        <>
            <Logo />
            <Frame
                style={{ marginBottom: 10, fontSize: "14px", lineHeight: "18px" }}
                boxShadow="in"
                height="100%"
                width="100%"
                padding="0px 5px"
            >
                <Fieldset legend="About Predict.exe" >
                    <div style={{ paddingBottom: "10px" }}>
                        Predict.exe is a pure on-chain prediction market on Massa Network. Leveraging Massa's Autonomous Smart Contracts, markets execute trustlessly with no manual intervention.
                        <br /><br />
                        <strong>Features:</strong>
                        <br />• Create a market based on verifiable on-chain data
                        <br />• Such as data from Dusa DEX or Umbrella Network
                        <br />• Automated settlement via ASC
                        <br />• Fully decentralized and transparent
                        <br /><br />
                        <em>Live on Buildnet and supports MassaStation wallet only.</em>
                    </div>
                </Fieldset>
            </Frame>
        </>
    )
}

export default About
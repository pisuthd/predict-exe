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
                <Fieldset legend="Predict.exe - Oracle-Free Prediction Markets" >
                    <div>
                        Predict.exe is a pure on-chain prediction market platform on the Massa Network. Create and trade predictions based on verifiable blockchain metrics without oracles. Autonomous Smart Contracts (ASC) automatically settle markets using Dusa DEX data, network stats, and token metrics.
                        <br/><br/>
                        <strong>Features:</strong>
                        <br/>• Price predictions using Dusa DEX data
                        <br/>• Network performance markets  
                        <br/>• DeFi adoption tracking
                        <br/>• Automatic settlement via ASC
                        <br/>• No oracle dependencies
                    </div>
                </Fieldset> 

            </Frame>
        </>
    )
}

export default About
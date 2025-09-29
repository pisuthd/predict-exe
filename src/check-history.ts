import 'dotenv/config';
import {
    Account,
    Args,
    Mas,
    SmartContract,
    OperationStatus,
    JsonRpcProvider,
    bytesToStr
} from '@massalabs/massa-web3';

const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS || "AS16xjUvqMsrCgXAM3ERKSRvqjtBgWV8cG9bi1jQuCzYe1j1dMma";

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Checking history...');

// Get events to see the market ID
const events = await provider.getEvents({
    smartContractAddress: CONTRACT_ADDR
});

for (const event of events) {
    console.log(
        `Event: "${event.data}" `,
    );
}
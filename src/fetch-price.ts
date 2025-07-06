import 'dotenv/config';
import {
    Account,
    Args,
    Mas,
    SmartContract,
    JsonRpcProvider,
    bytesToStr
} from '@massalabs/massa-web3'; 
import 'dotenv/config';

const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS || "AS14PLuYx1BKQ4hjZqxAvto52QWp4Qp2Wk8DAqHoktvkTJfJkDFy"

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

const mainContract = new SmartContract(provider, CONTRACT_ADDR)

const currentPriceBin = await mainContract.read(
    'getCurrentPrice'
); 

// deserialize message
const message = bytesToStr(currentPriceBin.value);
console.log(`WMAS/USDC Price from Dusa DEX: ${message}`);
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

const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS || "AS14PLuYx1BKQ4hjZqxAvto52QWp4Qp2Wk8DAqHoktvkTJfJkDFy";

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Creating new prediction market...');

// Market parameters
const asset = "MAS";
const direction = true; // true = "reach"
const targetPrice = 0.1; // Target price $0.1
const currentPrice = 0.03; // Current price $0.03
const expirationTimestamp = Date.now() + (24 * 60 * 60 * 1000); // 1 day from now in milliseconds
const dataSource = "UMBRELLA_MAS_PRICE";
const creatorPosition = true; // true = "YES" (betting that MAS will reach $0.1)

console.log(`Market Details:
- Asset: ${asset}
- Direction: ${direction ? "reach" : "drop"}
- Current Price: $${currentPrice}
- Target Price: $${targetPrice}
- Expiration: ${new Date(expirationTimestamp).toISOString()}
- Data Source: ${dataSource}
- Creator Position: ${creatorPosition ? "YES" : "NO"}
- Creator Stake: 1 MAS
`);

// Create market arguments
const createMarketArgs = new Args()
    .addString(asset)
    .addBool(direction)
    .addF64(targetPrice)
    .addF64(currentPrice)
    .addU64(BigInt(expirationTimestamp))
    .addString(dataSource)
    .addBool(creatorPosition)
    .serialize();

const mainContract = new SmartContract(provider, CONTRACT_ADDR);

// Call createMarket with 1 MAS stake
const operation = await mainContract.call(
    'createMarket',
    createMarketArgs,
    { coins: Mas.fromString('1') } // 1 MAS stake
);

console.log(
    'createMarket function called successfully, operation id:',
    operation.id,
);

console.log('Waiting for operation to be finalized...');
const status = await operation.waitFinalExecution();
console.log('Operation status:', OperationStatus[status]);

if (status !== OperationStatus.Success) {
    throw new Error('Operation failed');
}

// Get events to see the market ID
const events = await provider.getEvents({
    smartContractAddress: CONTRACT_ADDR,
    operationId: operation.id,
});

for (const event of events) {
    console.log(
        `Event: "${event.data}" received for operation: ${event.context.origin_operation_id}`,
    );
}

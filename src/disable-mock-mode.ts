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
import { getScByteCode } from './utils';
import 'dotenv/config';

const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS || "AS14PLuYx1BKQ4hjZqxAvto52QWp4Qp2Wk8DAqHoktvkTJfJkDFy"

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Disable Mock mode...');

const mainContract = new SmartContract(provider, CONTRACT_ADDR);
const operation = await mainContract.call(
    'toggleMockPrice',
    new Args().addBool(true).serialize()
);

console.log(
    'toggleMockPrice function called successfully, operation id:',
    operation.id,
);

console.log('Waiting for operation to be finalized...');
const status = await operation.waitFinalExecution();
console.log('Operation status:', OperationStatus[status]);
if (status !== OperationStatus.Success) {
    throw new Error('Operation failed');
}

const events = await provider.getEvents({
    smartContractAddress: CONTRACT_ADDR,
    operationId: operation.id,
});

for (const event of events) {
    console.log(
        `Event: "${event.data}" received for operation: ${event.context.origin_operation_id}`,
    );
}
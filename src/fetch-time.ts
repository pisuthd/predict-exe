import 'dotenv/config';
import {
    Account,
    Args,
    Mas,
    SmartContract,
    OperationStatus,
    JsonRpcProvider,
    bytesToStr,
    PublicAPI
} from '@massalabs/massa-web3';
import 'dotenv/config';
 
const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Fetching blockchain time information...');


try {
    const status = await provider.client.status() 
    console.log("current status:", status)

} catch (error: any) {
    console.error('Error fetching time info:', error.message);
}
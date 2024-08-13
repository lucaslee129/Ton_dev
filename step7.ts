import { mnemonicToWalletKey } from "@ton/crypto";
import { configParseGasLimitsPrices, WalletContractV4 } from "@ton/ton";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const mnemonic: string = process.env.TestPhrase ?? '';
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    
}

main();
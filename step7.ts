import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    // open wallet v4 
    const mnemonic: string = process.env.TestPhrase ?? '';
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0
    });

    // print wallet address
    console.log("Test only true:", wallet.address.toString({testOnly: true}));
    console.log("Test only false:", wallet.address.toString({testOnly: false}));

    // print wallet workchain
    console.log("workchain:", wallet.address.workChain);

}

main();
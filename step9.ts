import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import dotenv from 'dotenv';
dotenv.config();

async function main() { 
    const mnemonic = process.env.TestPhrase?? ''; // Step1. Get Mnemonic from the environment variable
    const walletKey = await mnemonicToWalletKey(mnemonic.split(" ")); // Get key from Mnemonic.
    const wallet = WalletContractV4.create({ // Create Wallet with public key and workchain : 0
        publicKey: walletKey.publicKey,
        workchain: 0
    });

    const endpoint = await getHttpEndpoint({network: 'testnet'}); // Get Endpoint from the TON test network
    const client = new TonClient({endpoint}); // Create the client which is using the testnet endpoint

    if(!await client.isContractDeployed(wallet.address)) { // Check the contract is deployed. This means to check if at least one output transaction was occured in the history
        return console.log("Wallet is not deployed");
    }

    const walletContract = client.open(wallet); // The client open the wallet
    const seqno = await walletContract.getSeqno(); // Get seqno from wallet contract
    await walletContract.sendTransfer({ // Send 0.00005 to TON Wallet NFT Minitng Contract.
        seqno: seqno,
        secretKey: (await walletKey).secretKey,
        messages: [
            internal({
                to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
                value: "0.00005",
                body: "hello",
                bounce: false
            })
        ]
    })

    let currentSeqno = seqno;
    while(currentSeqno == seqno) {
        console.log("Waiting for Transaction to Confirm...");
        await sleep(3000);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("Transaction confirmed!");
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
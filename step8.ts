import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4, TonClient, fromNano } from "@ton/ton";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const mnemonic = process.env.TestPhrase || '';
    const key = await mnemonicToWalletKey(mnemonic?.split(" "));
    const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0
    });

    const endpoint = await getHttpEndpoint({ network: "testnet"});
    const client = new TonClient({ endpoint});

    const balance = await client.getBalance(wallet.address);
    console.log("balance:", fromNano(balance));

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("Seqno:", seqno);
}

main();
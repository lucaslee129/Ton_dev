import { toNano } from '@ton/core';
import { FuncContract } from '../wrappers/FuncContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const funcContract = provider.open(FuncContract.createFromConfig({}, await compile('FuncContract')));

    await funcContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(funcContract.address);

    // run methods on `funcContract`
}

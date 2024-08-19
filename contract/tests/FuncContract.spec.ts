import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { FuncContract } from '../wrappers/FuncContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('FuncContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('FuncContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let funcContract: SandboxContract<FuncContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        funcContract = blockchain.openContract(FuncContract.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await funcContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: funcContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and funcContract are ready to use
    });
});

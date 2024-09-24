import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
import { Proxy } from '../wrappers/Proxy';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Proxy', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Proxy');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let proxy: SandboxContract<Proxy>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        proxy = blockchain.openContract(
            Proxy.createFromConfig(
                {
                    owner: deployer.address,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await proxy.sendDeploy(deployer.getSender(), toNano('0.01'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: proxy.address,
            deploy: true,
            // success: true,
        });
    });

    it("should not forward from owner", async () => {
        const result = await deployer.send({
            to: proxy.address,
            value: toNano('1'),
        });

        expect(result.transactions).not.toHaveTransaction({
            from: proxy.address,
            to: deployer.address,
        })
    })

    it("should forward from another wallet", async () => {
        let user = await blockchain.treasury('user');
        const result =  await user.send({
            to: proxy.address,
            value: toNano("1"),
            body: beginCell().storeStringTail('Hello, World').endCell(),
        });

        expect(result.transactions).toHaveTransaction({
            from: proxy.address,
            to: deployer.address,
            body: beginCell()
                .storeAddress(user.address)
                .storeRef(beginCell().storeStringTail('Hello, World').endCell())
                .endCell(),

            value: (x) => (x ? toNano('0.99') <= x && x <= toNano('1'): false),
        })
    })
});

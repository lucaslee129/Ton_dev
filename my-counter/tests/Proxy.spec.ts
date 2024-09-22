import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
import { Proxy } from '../wrappers/Proxy';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Counter', () => {
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

    
    // it('should not forward from owner', async () => {
    //     const result = await deployer.send({
    //         to: proxy.address,
    //         value: toNano('0.01'),
    //     });

    //     expect(result.transactions).not.toHaveTransaction({
    //         from: proxy.address,
    //         to: deployer.address,
    //     });
    // })

    // it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and proxy are ready to use
    // });

    // it("should update the number", async () => {
    //     const caller = await blockchain.treasury('caller'); // Create the Treasury wallet with milion coins on Local ton network for testing
        
    //     await proxy.sendNumber(caller.getSender(), toNano('0.01'), 10n); // Send transaction with number 10
    //     expect(await proxy.getTotal()).toEqual(10n); // get number from the counter smart contract
        
    //     await proxy.sendNumber(caller.getSender(), toNano("0.01"), 5n);
    //     expect(await proxy.getTotal()).toEqual(15n);

    //     await proxy.sendNumber(caller.getSender(), toNano("0.01"), 1000n);
    //     expect(await proxy.getTotal()).toEqual(1015n);
    // })

    // it("should throw error when number is not 32 bits", async () => {
    //     const caller = await blockchain.treasury("caller"); // Create the tresury wallet

    //     const result = await proxy.sendDeploy(caller.getSender(), toNano('0.01')); // Deploy the smart contract with no data

    //     expect(result.transactions).toHaveTransaction({ // Check whether following information are included on transaction
    //         from: caller.address,
    //         to: proxy.address,
    //         success: false,
    //         exitCode: 35
    //     })
    // })

    // it('should increase proxy', async () => {
    //     const increaseTimes = 3;
    //     for (let i = 0; i < increaseTimes; i++) {
    //         console.log(`increase ${i + 1}/${increaseTimes}`);

    //         const increaser = await blockchain.treasury('increaser' + i);

    //         const counterBefore = await counter.getCounter();

    //         console.log('counter before increasing', counterBefore);

    //         const increaseBy = Math.floor(Math.random() * 100);

    //         console.log('increasing by', increaseBy);

    //         const increaseResult = await counter.sendIncrease(increaser.getSender(), {
    //             increaseBy,
    //             value: toNano('0.05'),
    //         });

    //         expect(increaseResult.transactions).toHaveTransaction({
    //             from: increaser.address,
    //             to: counter.address,
    //             success: true,
    //         });

    //         const counterAfter = await counter.getCounter();

    //         console.log('counter after increasing', counterAfter);

    //         expect(counterAfter).toBe(counterBefore + increaseBy);
    //     }
    // });
});

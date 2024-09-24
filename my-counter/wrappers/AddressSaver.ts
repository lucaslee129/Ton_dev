import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

// export type CounterConfig = {
//     id: number;
//     counter: number;
// };

// export function counterConfigToCell(config: CounterConfig): Cell {
//     return beginCell().storeUint(config.id, 32).storeUint(config.counter, 32).endCell();
// }

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class AddressSaver implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AddressSaver(address);
    }

    static createFromConfig(config: AddressSaverConfig, code: Cell, workchain = 0) {
        const data = addressSaverConfigToCell(config);
        const init = { code, data };
        return new AddressSaver(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async sendChangeAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint, newAddress: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(queryId, 64).storeAddress(newAddress).endCell(),
        });
    }
    

    async sendRequestAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(queryId, 64).endCell(),
        });
    }
}

export type AddressSaverConfig = {
    manager: Address,
}

export function addressSaverConfigToCell(config: AddressSaverConfig) : Cell {
    return beginCell().storeUint(1, 32).storeAddress(config.manager).storeUint(0, 2).endCell();
}
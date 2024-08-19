import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type FuncContractConfig = {};

export function funcContractConfigToCell(config: FuncContractConfig): Cell {
    return beginCell().endCell();
}

export class FuncContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new FuncContract(address);
    }

    static createFromConfig(config: FuncContractConfig, code: Cell, workchain = 0) {
        const data = funcContractConfigToCell(config);
        const init = { code, data };
        return new FuncContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}

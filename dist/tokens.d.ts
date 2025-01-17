import { CrocContext } from "./context";
import { BigNumber } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";
export declare type TokenQty = BigNumber | string | number;
export declare class CrocTokenView {
    constructor(context: Promise<CrocContext>, tokenAddr: string);
    approve(): Promise<TransactionResponse | undefined>;
    wallet(address: string): Promise<BigNumber>;
    walletDisplay(address: string): Promise<string>;
    balance(address: string): Promise<BigNumber>;
    balanceDisplay(address: string): Promise<string>;
    allowance(address: string): Promise<BigNumber>;
    roundQty(qty: TokenQty): Promise<BigNumber>;
    private truncFraction;
    normQty(qty: TokenQty): Promise<BigNumber>;
    toDisplay(qty: TokenQty): Promise<string>;
    private resolve;
    private resolveWrite;
    deposit(qty: TokenQty, recv: string): Promise<TransactionResponse>;
    withdraw(qty: TokenQty, recv: string): Promise<TransactionResponse>;
    transfer(qty: TokenQty, recv: string): Promise<TransactionResponse>;
    private surplusOp;
    readonly tokenAddr: string;
    readonly context: Promise<CrocContext>;
    readonly decimals: Promise<number>;
    readonly isNativeEth: boolean;
}
export declare class CrocEthView extends CrocTokenView {
    constructor(context: Promise<CrocContext>);
    msgValOverSurplus(ethNeeded: BigNumber): Promise<BigNumber>;
}
export declare function sortBaseQuoteViews(tokenA: CrocTokenView, tokenB: CrocTokenView): [
    CrocTokenView,
    CrocTokenView
];

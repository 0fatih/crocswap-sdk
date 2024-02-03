import { BigNumber } from "ethers";
import { TransactionResponse } from '@ethersproject/providers';
import { CrocContext } from './context';
import { CrocPoolView } from './pool';
import { CrocTokenView, TokenQty } from './tokens';
import { CrocSurplusFlags } from "./encoding/flags";
export interface CrocImpact {
    sellQty: string;
    buyQty: string;
    finalPrice: number;
    percentChange: number;
}
export interface CrocSwapOpts {
    surplus?: CrocSurplusFlags;
    surplusOwner?: string;
}
export declare class CrocSwapPlan {
    constructor(sellToken: CrocTokenView, buyToken: CrocTokenView, qty: TokenQty, qtyIsBuy: boolean, slippage: number, context: Promise<CrocContext>);
    swap(args?: CrocSwapOpts): Promise<TransactionResponse>;
    calcImpact(): Promise<CrocImpact>;
    private maskSurplusArgs;
    private buildTxArgs;
    private attachEthMsg;
    calcSlipQty(): Promise<BigNumber>;
    calcLimitPrice(): Promise<BigNumber>;
    readonly baseToken: CrocTokenView;
    readonly quoteToken: CrocTokenView;
    readonly qty: Promise<BigNumber>;
    readonly sellBase: boolean;
    readonly qtyInBase: boolean;
    readonly slippage: number;
    readonly priceSlippage: number;
    readonly poolView: CrocPoolView;
    readonly context: Promise<CrocContext>;
    readonly impact: Promise<CrocImpact>;
}

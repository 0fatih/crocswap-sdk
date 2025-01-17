import { CrocContext } from "./context";
import { CrocTokenView, TokenQty } from './tokens';
import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { CrocSurplusFlags } from "./encoding/flags";
declare type PriceRange = [number, number];
declare type TickRange = [number, number];
declare type BlockTag = number | string;
export declare class CrocPoolView {
    constructor(quoteToken: CrocTokenView, baseToken: CrocTokenView, context: Promise<CrocContext>);
    isInit(): Promise<boolean>;
    spotPrice(block?: BlockTag): Promise<number>;
    displayPrice(block?: BlockTag): Promise<number>;
    spotTick(block?: BlockTag): Promise<number>;
    cumAmbientGrowth(block?: BlockTag): Promise<number>;
    toDisplayPrice(spotPrice: number): Promise<number>;
    fromDisplayPrice(dispPrice: number): Promise<number>;
    displayToPinTick(dispPrice: number): Promise<[number, number]>;
    displayToNeighborTicks(dispPrice: number, nNeighbors?: number): Promise<{
        below: number[];
        above: number[];
    }>;
    displayToNeighborTickPrices(dispPrice: number, nNeighbors?: number): Promise<{
        below: number[];
        above: number[];
    }>;
    displayToOutsidePin(dispPrice: number): Promise<{
        tick: number;
        price: number;
        isTickBelow: boolean;
        isPriceBelow: boolean;
    }>;
    initPool(initPrice: number): Promise<TransactionResponse>;
    mintAmbientBase(qty: TokenQty, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    mintAmbientQuote(qty: TokenQty, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    mintRangeBase(qty: TokenQty, range: TickRange, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    mintRangeQuote(qty: TokenQty, range: TickRange, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    burnAmbientLiq(liq: BigNumber, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    burnAmbientAll(limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    burnRangeLiq(liq: BigNumber, range: TickRange, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    harvestRange(range: TickRange, limits: PriceRange, opts?: CrocLpOpts): Promise<TransactionResponse>;
    private sendCmd;
    private mintAmbient;
    private boundLimits;
    private rangeToPrice;
    private transformLimits;
    private untransformLimits;
    private mintRange;
    private maskSurplusFlag;
    private msgValAmbient;
    private msgValRange;
    private ethToAttach;
    private ethForAmbientQuote;
    private calcEthInQuote;
    private ethForRangeQuote;
    private normEth;
    private normQty;
    private makeEncoder;
    readonly baseToken: CrocTokenView;
    readonly quoteToken: CrocTokenView;
    readonly baseDecimals: Promise<number>;
    readonly quoteDecimals: Promise<number>;
    readonly useTrueBase: boolean;
    readonly context: Promise<CrocContext>;
}
export interface CrocLpOpts {
    surplus?: CrocSurplusFlags;
}
export {};

import { ConnectArg, CrocContext } from './context';
import { CrocPoolView } from './pool';
import { TokenQty, CrocTokenView } from './tokens';
import { CrocSwapPlan } from './swap';
import { Signer } from 'ethers';
import { CrocKnockoutHandle } from './knockout';
export declare class CrocEnv {
    constructor(conn: ConnectArg, signer?: Signer);
    buy(token: string, qty: TokenQty): BuyPrefix;
    buyEth(qty: TokenQty): BuyPrefix;
    sell(token: string, qty: TokenQty): SellPrefix;
    sellEth(qty: TokenQty): SellPrefix;
    pool(tokenA: string, tokenB: string): CrocPoolView;
    poolEth(token: string): CrocPoolView;
    poolEthQuote(token: string): CrocPoolView;
    token(token: string): CrocTokenView;
    tokenEth(): CrocTokenView;
    readonly context: Promise<CrocContext>;
    tokens: TokenRepo;
}
interface SwapArgs {
    slippage: number;
}
declare class BuyPrefix {
    constructor(token: string, qty: TokenQty, repo: TokenRepo, context: Promise<CrocContext>);
    with(token: string, args?: SwapArgs): CrocSwapPlan;
    withEth(args?: SwapArgs): CrocSwapPlan;
    atLimit(token: string, tick: number): CrocKnockoutHandle;
    readonly token: string;
    readonly qty: TokenQty;
    readonly context: Promise<CrocContext>;
    repo: TokenRepo;
}
declare class SellPrefix {
    constructor(token: string, qty: TokenQty, repo: TokenRepo, context: Promise<CrocContext>);
    for(token: string, args?: SwapArgs): CrocSwapPlan;
    forEth(args?: SwapArgs): CrocSwapPlan;
    atLimit(token: string, tick: number): CrocKnockoutHandle;
    readonly token: string;
    readonly qty: TokenQty;
    readonly context: Promise<CrocContext>;
    repo: TokenRepo;
}
declare class TokenRepo {
    constructor(context: Promise<CrocContext>);
    materialize(tokenAddr: string): CrocTokenView;
    tokenViews: Map<string, CrocTokenView>;
    context: Promise<CrocContext>;
}
export {};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrocEnv = void 0;
const context_1 = require("./context");
const pool_1 = require("./pool");
const constants_1 = require("@ethersproject/constants");
const tokens_1 = require("./tokens");
const swap_1 = require("./swap");
const knockout_1 = require("./knockout");
class CrocEnv {
    constructor(conn, signer) {
        this.context = (0, context_1.connectCroc)(conn, signer);
        this.tokens = new TokenRepo(this.context);
    }
    buy(token, qty) {
        return new BuyPrefix(token, qty, this.tokens, this.context);
    }
    buyEth(qty) {
        return new BuyPrefix(constants_1.AddressZero, qty, this.tokens, this.context);
    }
    sell(token, qty) {
        return new SellPrefix(token, qty, this.tokens, this.context);
    }
    sellEth(qty) {
        return new SellPrefix(constants_1.AddressZero, qty, this.tokens, this.context);
    }
    pool(tokenA, tokenB) {
        const viewA = this.tokens.materialize(tokenA);
        const viewB = this.tokens.materialize(tokenB);
        return new pool_1.CrocPoolView(viewA, viewB, this.context);
    }
    poolEth(token) {
        return this.pool(token, constants_1.AddressZero);
    }
    poolEthQuote(token) {
        return this.pool(constants_1.AddressZero, token);
    }
    token(token) {
        return this.tokens.materialize(token);
    }
    tokenEth() {
        return this.tokens.materialize(constants_1.AddressZero);
    }
}
exports.CrocEnv = CrocEnv;
const DFLT_SWAP_ARGS = {
    slippage: 0.01
};
class BuyPrefix {
    constructor(token, qty, repo, context) {
        this.token = token;
        this.qty = qty;
        this.context = context;
        this.repo = repo;
    }
    with(token, args = DFLT_SWAP_ARGS) {
        return new swap_1.CrocSwapPlan(this.repo.materialize(token), this.repo.materialize(this.token), this.qty, true, args.slippage, this.context);
    }
    withEth(args = DFLT_SWAP_ARGS) {
        return this.with(constants_1.AddressZero, args);
    }
    atLimit(token, tick) {
        return new knockout_1.CrocKnockoutHandle(this.repo.materialize(token), this.repo.materialize(this.token), this.qty, false, tick, this.context);
    }
}
class SellPrefix {
    constructor(token, qty, repo, context) {
        this.token = token;
        this.qty = qty;
        this.context = context;
        this.repo = repo;
    }
    for(token, args = DFLT_SWAP_ARGS) {
        return new swap_1.CrocSwapPlan(this.repo.materialize(this.token), this.repo.materialize(token), this.qty, false, args.slippage, this.context);
    }
    forEth(args = DFLT_SWAP_ARGS) {
        return this.for(constants_1.AddressZero, args);
    }
    atLimit(token, tick) {
        return new knockout_1.CrocKnockoutHandle(this.repo.materialize(this.token), this.repo.materialize(token), this.qty, true, tick, this.context);
    }
}
/* Use this to cache the construction of CrocTokenView objects across CrocEnv lifetime.
 * Because token view construction makes on-chain calls to get token metadata, doing this
 * drastically reduces the number of RPC calls. */
class TokenRepo {
    constructor(context) {
        this.tokenViews = new Map();
        this.context = context;
    }
    materialize(tokenAddr) {
        let tokenView = this.tokenViews.get(tokenAddr);
        if (!tokenView) {
            tokenView = new tokens_1.CrocTokenView(this.context, tokenAddr);
            this.tokenViews.set(tokenAddr, tokenView);
        }
        return tokenView;
    }
}
//# sourceMappingURL=croc.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrocKnockoutHandle = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const tokens_1 = require("./tokens");
const constants_1 = require("@ethersproject/constants");
const knockout_1 = require("./encoding/knockout");
const flags_1 = require("./encoding/flags");
const utils_1 = require("./utils");
class CrocKnockoutHandle {
    constructor(sellToken, buyToken, qty, inSellQty, knockoutTick, context) {
        [this.baseToken, this.quoteToken] = (0, tokens_1.sortBaseQuoteViews)(sellToken, buyToken);
        this.sellBase = (this.baseToken === sellToken);
        this.qtyInBase = inSellQty ? this.sellBase : !this.sellBase;
        const tokenView = this.qtyInBase ? this.baseToken : this.quoteToken;
        const specQty = tokenView.normQty(qty);
        this.qty = inSellQty ? specQty :
            calcSellQty(specQty, !this.sellBase, knockoutTick, context);
        this.knockoutTick = knockoutTick;
        this.context = context;
    }
    mint(opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const chain = (yield this.context).chain;
            const encoder = new knockout_1.KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, chain.poolIndex);
            const [lowerTick, upperTick] = this.tickRange(chain);
            const surplus = this.maskSurplusFlags(opts);
            const cmd = encoder.encodeKnockoutMint(yield this.qty, lowerTick, upperTick, this.sellBase, surplus);
            return (yield this.context).dex.userCmd(KNOCKOUT_PATH, cmd, { value: this.msgVal(surplus) });
        });
    }
    burn(opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const chain = (yield this.context).chain;
            const encoder = new knockout_1.KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, chain.poolIndex);
            const [lowerTick, upperTick] = this.tickRange(chain);
            const surplus = this.maskSurplusFlags(opts);
            const cmd = encoder.encodeKnockoutBurnQty(yield this.qty, lowerTick, upperTick, this.sellBase, surplus);
            return (yield this.context).dex.userCmd(KNOCKOUT_PATH, cmd);
        });
    }
    burnLiq(liq, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const chain = (yield this.context).chain;
            const encoder = new knockout_1.KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, chain.poolIndex);
            const [lowerTick, upperTick] = this.tickRange(chain);
            const surplus = this.maskSurplusFlags(opts);
            const cmd = encoder.encodeKnockoutBurnLiq((0, utils_1.roundForConcLiq)(liq), lowerTick, upperTick, this.sellBase, surplus);
            return (yield this.context).dex.userCmd(KNOCKOUT_PATH, cmd);
        });
    }
    recoverPost(pivotTime, opts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const chain = (yield this.context).chain;
            const encoder = new knockout_1.KnockoutEncoder(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, chain.poolIndex);
            const [lowerTick, upperTick] = this.tickRange(chain);
            const surplus = this.maskSurplusFlags(opts);
            const cmd = encoder.encodeKnockoutRecover(pivotTime, lowerTick, upperTick, this.sellBase, surplus);
            return (yield this.context).dex.userCmd(KNOCKOUT_PATH, cmd);
        });
    }
    willMintFail() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const gridSize = this.context.then(c => c.chain.gridSize);
            const marketTick = this.context.then(c => c.query.queryCurveTick(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, c.chain.poolIndex));
            return this.sellBase ?
                (this.knockoutTick + (yield gridSize) >= (yield marketTick)) :
                (this.knockoutTick - (yield gridSize) <= (yield marketTick));
        });
    }
    maskSurplusFlags(opts) {
        if (!opts || !opts.surplus) {
            return (0, flags_1.encodeSurplusArg)(false);
        }
        else {
            return (0, flags_1.encodeSurplusArg)(opts.surplus);
        }
    }
    msgVal(surplusFlags) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.baseToken.tokenAddr !== constants_1.AddressZero || !this.sellBase) {
                return ethers_1.BigNumber.from(0);
            }
            const useSurp = (0, flags_1.decodeSurplusFlag)(surplusFlags)[0];
            if (useSurp) {
                return new tokens_1.CrocEthView(this.context).msgValOverSurplus(yield this.qty);
            }
            else {
                return this.qty;
            }
        });
    }
    tickRange(chain) {
        return tickRange(chain, this.knockoutTick, this.sellBase);
    }
}
exports.CrocKnockoutHandle = CrocKnockoutHandle;
const KNOCKOUT_PATH = 7;
function calcSellQty(buyQty, isQtyInBase, knockoutTick, context) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const sellQty = calcSellFloat((0, utils_1.bigNumToFloat)(yield buyQty), isQtyInBase, knockoutTick, context);
        return sellQty.then(utils_1.floatToBigNum);
    });
}
function calcSellFloat(buyQty, isQtyInBase, knockoutTick, context) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const [lowerTick, upperTick] = tickRange((yield context).chain, knockoutTick, !isQtyInBase);
        const lowerPrice = Math.pow(1.0001, lowerTick);
        const upperPrice = Math.pow(1.0001, upperTick);
        return isQtyInBase ?
            (0, utils_1.baseTokenForQuoteConc)(buyQty, lowerPrice, upperPrice) :
            (0, utils_1.quoteTokenForBaseConc)(buyQty, lowerPrice, upperPrice);
    });
}
function tickRange(chain, knockoutTick, sellBase) {
    return sellBase ?
        [knockoutTick, knockoutTick + chain.gridSize] :
        [knockoutTick - chain.gridSize, knockoutTick];
}
//# sourceMappingURL=knockout.js.map
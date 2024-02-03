"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrocSwapPlan = void 0;
const tslib_1 = require("tslib");
const pool_1 = require("./pool");
const utils_1 = require("./utils");
const tokens_1 = require("./tokens");
const constants_1 = require("@ethersproject/constants");
const flags_1 = require("./encoding/flags");
const constants_2 = require("./constants");
class CrocSwapPlan {
    constructor(sellToken, buyToken, qty, qtyIsBuy, slippage, context) {
        [this.baseToken, this.quoteToken] = (0, tokens_1.sortBaseQuoteViews)(sellToken, buyToken);
        this.sellBase = (this.baseToken === sellToken);
        this.qtyInBase = (this.sellBase !== qtyIsBuy);
        this.poolView = new pool_1.CrocPoolView(this.baseToken, this.quoteToken, context);
        const tokenView = this.qtyInBase ? this.baseToken : this.quoteToken;
        this.qty = tokenView.normQty(qty);
        this.slippage = slippage;
        this.priceSlippage = slippage * PRICE_SLIP_MULT;
        this.context = context;
        this.impact = this.calcImpact();
    }
    swap(args = {}) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const TIP = 0;
            const surplusFlags = this.maskSurplusArgs(args.surplus);
            const gasEst = (yield this.context).dex.estimateGas.swap(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, this.sellBase, this.qtyInBase, yield this.qty, TIP, yield this.calcLimitPrice(), yield this.calcSlipQty(), surplusFlags, yield this.buildTxArgs(surplusFlags));
            return (yield this.context).dex.swap(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, this.sellBase, this.qtyInBase, yield this.qty, TIP, yield this.calcLimitPrice(), yield this.calcSlipQty(), surplusFlags, yield this.buildTxArgs(surplusFlags, yield gasEst));
        });
    }
    calcImpact() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const TIP = 0;
            const limitPrice = this.sellBase ? constants_2.MAX_SQRT_PRICE : constants_2.MIN_SQRT_PRICE;
            const impact = yield (yield this.context).slipQuery.calcImpact(this.baseToken.tokenAddr, this.quoteToken.tokenAddr, (yield this.context).chain.poolIndex, this.sellBase, this.qtyInBase, yield this.qty, TIP, limitPrice);
            const baseQty = this.baseToken.toDisplay(impact.baseFlow.abs());
            const quoteQty = this.quoteToken.toDisplay(impact.quoteFlow.abs());
            const spotPrice = (0, utils_1.decodeCrocPrice)(impact.finalPrice);
            const startPrice = this.poolView.displayPrice();
            const finalPrice = this.poolView.toDisplayPrice(spotPrice);
            return {
                sellQty: this.sellBase ? yield baseQty : yield quoteQty,
                buyQty: this.sellBase ? yield quoteQty : yield baseQty,
                finalPrice: yield finalPrice,
                percentChange: ((yield finalPrice) - (yield startPrice)) / (yield startPrice)
            };
        });
    }
    maskSurplusArgs(args) {
        if (!args) {
            return this.maskSurplusArgs([false, false]);
        }
        return (0, flags_1.encodeSurplusArg)(args, !this.sellBase);
    }
    buildTxArgs(surplusArg, gasEst) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let txArgs = yield this.attachEthMsg(surplusArg);
            if (gasEst) {
                const GAS_PADDING = 15000;
                Object.assign(txArgs, { gasLimit: gasEst.add(GAS_PADDING) });
            }
            return txArgs;
        });
    }
    attachEthMsg(surplusEncoded) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            // Only need msg.val if one token is native ETH (will always be base side)
            if (!this.sellBase || this.baseToken.tokenAddr !== constants_1.AddressZero) {
                return {};
            }
            // Calculate the maximum amount of ETH we'll need. If on the floating side
            // account for potential slippage. (Contract will refund unused ETH)
            const val = this.qtyInBase ? this.qty : this.calcSlipQty();
            if ((0, flags_1.decodeSurplusFlag)(surplusEncoded)[0]) {
                // If using surplus calculate the amount of ETH not covered by the surplus
                // collateral.
                const needed = new tokens_1.CrocEthView(this.context).msgValOverSurplus(yield val);
                return { value: needed };
            }
            else {
                // Othwerise we need to send the entire balance in msg.val
                return { value: yield val };
            }
        });
    }
    calcSlipQty() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const qtyIsBuy = (this.sellBase === this.qtyInBase);
            const slipQty = !qtyIsBuy ?
                parseFloat((yield this.impact).sellQty) * (1 + this.slippage) :
                parseFloat((yield this.impact).buyQty) * (1 - this.slippage);
            return !this.qtyInBase ?
                this.baseToken.roundQty(slipQty) :
                this.quoteToken.roundQty(slipQty);
        });
    }
    calcLimitPrice() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.sellBase ? constants_2.MAX_SQRT_PRICE : constants_2.MIN_SQRT_PRICE;
        });
    }
}
exports.CrocSwapPlan = CrocSwapPlan;
// Price slippage limit multiplies normal slippage tolerance by amount that should
// be reasonable (300%)
const PRICE_SLIP_MULT = 3.0;
//# sourceMappingURL=swap.js.map
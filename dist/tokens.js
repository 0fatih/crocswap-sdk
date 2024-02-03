"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortBaseQuoteViews = exports.CrocEthView = exports.CrocTokenView = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const constants_1 = require("@ethersproject/constants");
const constants_2 = require("./constants");
const token_1 = require("./utils/token");
class CrocTokenView {
    constructor(context, tokenAddr) {
        this.context = context;
        this.tokenAddr = tokenAddr;
        this.isNativeEth = tokenAddr == constants_1.AddressZero;
        if (this.isNativeEth) {
            this.decimals = Promise.resolve(18);
        }
        else {
            this.decimals = this.resolve().then((c) => c.decimals());
        }
    }
    approve() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.isNativeEth) {
                return undefined;
            }
            const weiQty = constants_1.MaxUint256;
            // We want to hardcode the gas limit, so we can manually pad it from the estimated
            // transaction. The default value is low gas calldata, but Metamask and other wallets
            // will often ask users to change the approval amount. Without the padding, approval
            // transactions can run out of gas.
            const gasEst = (yield this.resolveWrite()).estimateGas.approve((yield this.context).dex.address, weiQty);
            return (yield this.resolveWrite()).approve((yield this.context).dex.address, weiQty, { gasLimit: (yield gasEst).add(2000) });
        });
    }
    wallet(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.isNativeEth) {
                return (yield this.context).provider.getBalance(address);
            }
            else {
                return (yield this.resolve()).balanceOf(address);
            }
        });
    }
    walletDisplay(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const balance = this.wallet(address);
            return (0, token_1.toDisplayQty)(yield balance, yield this.decimals);
        });
    }
    balance(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return (yield this.context).query.querySurplus(address, this.tokenAddr);
        });
    }
    balanceDisplay(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const balance = this.balance(address);
            return (0, token_1.toDisplayQty)(yield balance, yield this.decimals);
        });
    }
    allowance(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.isNativeEth) {
                return constants_2.MAX_LIQ;
            }
            return (yield this.resolve()).allowance(address, (yield this.context).dex.address);
        });
    }
    roundQty(qty) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (typeof qty === "number" || typeof qty === "string") {
                return this.normQty(this.truncFraction(qty, yield this.decimals));
            }
            else {
                return qty;
            }
        });
    }
    truncFraction(qty, decimals) {
        if (typeof (qty) === "number") {
            let exp = Math.pow(10, decimals);
            return Math.floor(qty * exp) / exp;
        }
        else {
            return this.truncFraction(parseFloat(qty), decimals);
        }
    }
    normQty(qty) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (typeof qty === "number" || typeof qty === "string") {
                return (0, token_1.fromDisplayQty)(qty.toString(), yield this.decimals);
            }
            else {
                return qty;
            }
        });
    }
    toDisplay(qty) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (typeof qty === "number" || typeof qty === "string") {
                return qty.toString();
            }
            else {
                return (0, token_1.toDisplayQty)(qty, yield this.decimals);
            }
        });
    }
    resolve() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return (yield this.context).erc20Read.attach(this.tokenAddr);
        });
    }
    resolveWrite() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return (yield this.context).erc20Write.attach(this.tokenAddr);
        });
    }
    deposit(qty, recv) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.surplusOp(73, qty, recv, this.isNativeEth);
        });
    }
    withdraw(qty, recv) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.surplusOp(74, qty, recv);
        });
    }
    transfer(qty, recv) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return this.surplusOp(75, qty, recv);
        });
    }
    surplusOp(subCode, qty, recv, useMsgVal = false) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const abiCoder = new ethers_1.ethers.utils.AbiCoder();
            const weiQty = this.normQty(qty);
            const cmd = abiCoder.encode(["uint8", "address", "uint128", "address"], [subCode, recv, yield weiQty, this.tokenAddr]);
            const txArgs = useMsgVal ? { value: yield weiQty } : {};
            let cntx = yield this.context;
            return cntx.dex.userCmd(cntx.chain.proxyPaths.cold, cmd, txArgs);
        });
    }
}
exports.CrocTokenView = CrocTokenView;
class CrocEthView extends CrocTokenView {
    constructor(context) {
        super(context, constants_1.AddressZero);
    }
    /* Returns the amount needed to attach to msg.value when spending
     * ETH from surplus collateral. (I.e. the difference between the
     * two, or 0 if surplus collateral is sufficient) */
    msgValOverSurplus(ethNeeded) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const sender = (yield this.context).senderAddr;
            if (!sender) {
                console.warn("No sender address known, returning 0");
                return ethers_1.BigNumber.from(0);
            }
            const ethView = new CrocTokenView(this.context, constants_1.AddressZero);
            const surpBal = yield ethView.balance(sender);
            const hasEnough = surpBal.gt(ethNeeded);
            return hasEnough ? ethers_1.BigNumber.from(0) :
                ethNeeded.sub(surpBal);
        });
    }
}
exports.CrocEthView = CrocEthView;
function sortBaseQuoteViews(tokenA, tokenB) {
    return tokenA.tokenAddr.toLowerCase() < tokenB.tokenAddr.toLowerCase() ?
        [tokenA, tokenB] : [tokenB, tokenA];
}
exports.sortBaseQuoteViews = sortBaseQuoteViews;
//# sourceMappingURL=tokens.js.map
class MerchantOrderRequestMessage {
    constructor ({amount, fiat_currency, session_id, crypto_currency, version}={}) {
        this.amount = amount;
        this.fiat_currency = fiat_currency;
        this.session_id = session_id;
        this.crypto_currency = crypto_currency;
        this.version = version;
    }

    static fromJSON (json) {
        return Object.assign(new MerchantOrderRequestMessage, JSON.parse(json));
    }

    toJSON () {
        return JSON.stringify({
            amount: this.amount,
            fiat_currency: this.fiat_currency,
            session_id: this.session_id,
            crypto_currency: this.crypto_currency,
            version: this.version,
        });
    }
}

class AckMessage {
    constructor ({txid, status, url, amount, transaction_hash, memo, version}={}) {
        this.txid = txid;
        this.status = status;
        this.url = url;
        this.amount = amount;
        this.transaction_hash = transaction_hash;
        this.memo = memo;
        this.version = version;
    }

    static fromJSON (json) {
        return Object.assign(new AckMessage, JSON.parse(json));
    }

    toJSON () {
        return JSON.stringify({
            txid: this.txid,
            status: this.status,
            url: this.url,
            amount: this.amount,
            transaction_hash: this.transaction_hash,
            memo: this.memo,
            version: this.version,
        });
    }
}

class PaymentRequestMessage {
    constructor ({merchant = {}, amount, fiat_currency, destinations = [], supported_cryptos}={}) {
        this.merchant = merchant;
        this.amount = amount;
        this.fiat_currency = fiat_currency;
        this.destinations = destinations;
        this.supported_cryptos = supported_cryptos;
    }

    static fromJSON (json) {
        return Object.assign(new PaymentRequestMessage, JSON.parse(json));
    }

    toJSON () {
        return JSON.stringify({
            merchant: this.merchant,
            amount: this.amount,
            fiat_currency: this.fiat_currency,
            destinations: this.destinations,
            supported_cryptos: this.supported_cryptos,
        });
    }
}

class PaymentRequestEnvelope {
    constructor ({message, signature, version}={}) {
        this.message = message;
        this.signature = signature;
        this.version = version;
    }

    static fromJSON (json) {
        return Object.assign(new PaymentRequestEnvelope, JSON.parse(json));
    }

    toJSON () {
        return JSON.stringify({
            message: this.message,
            signature: this.signature,
            version: this.version,
        });
    }
}

class PaymentMessage {
    constructor ({crypto_currency, transaction_hash, version}={}) {
        this.crypto_currency = crypto_currency;
        this.transaction_hash = transaction_hash;
        this.version = version;
    }

    static fromJSON (json) {
        return Object.assign(new PaymentMessage, JSON.parse(json));
    }

    toJSON () {
        return JSON.stringify({
            crypto_currency: this.crypto_currency,
            transaction_hash: this.transaction_hash,
            version: this.version,
        });
    }
}

exports.MerchantOrderRequestMessage = MerchantOrderRequestMessage;
exports.AckMessage = AckMessage;
exports.PaymentRequestMessage = PaymentRequestMessage;
exports.PaymentRequestEnvelope = PaymentRequestEnvelope;
exports.PaymentMessage = PaymentMessage;
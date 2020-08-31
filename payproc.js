const mqtt   = require('mqtt');
const yaml   = require('js-yaml');
const fs     = require('fs');
const crypto = require('crypto');

const { MerchantOrderRequestMessage, AckMessage, PaymentRequestMessage, PaymentRequestEnvelope, PaymentMessage } = require('./messages');
 
const config = yaml.safeLoad(fs.readFileSync('payproc_config.yaml', 'utf8'));
const privateKey = fs.readFileSync(config.certificate.key);

const mqtt_uri = config.mqtt_uri;
const client   = mqtt.connect(`mqtt://${mqtt_uri}`);

const destinations = {};
for (let dest of config.destinations) {
  destinations[dest.applicationid] = dest;
}

const supported_crypto = config.supported_crypto;

var sessions = {};
var txid = 0;
 
client.on('connect', function () {
  console.log(`Connected to ${mqtt_uri}`)
  client.subscribe('merchant_order_request/#');
  client.subscribe('certificate');
});
 
client.on('message', function (topic, message) {
  sp = topic.indexOf('/');
  const action = topic.slice(0,sp)
  const params = topic.slice(sp+1);
  switch (action) {
    case 'merchant_order_request':
      onMerchantOrderRequest(params, MerchantOrderRequestMessage.fromJSON(message.toString()));
      break;
    case 'payment_requests':
      sp = params.indexOf('/');
      session_id = params.slice(0,sp);
      crypto_currency = params.slice(sp+1);
      onPaymentRequests(session_id, crypto_currency);
      break;
    case 'payments':
      session_id = params;
      onPayments(session_id, PaymentMessage.fromJSON(message.toString()));
      break;
  }
});

function onMerchantOrderRequest (application_id, request) {
  if (application_id in destinations) {
    client.subscribe(`payment_requests/${request.session_id}/+`)
    client.subscribe(`payments/${request.session_id}`)
    const manta_url = `manta://${mqtt_uri}/${request.session_id}`;
    sessions[request.session_id] = {
      application_id: application_id,
      request: request,
      txid: txid,
    }
    ack(request.session_id, new AckMessage({
      status: "NEW",
      url: manta_url,
      txid: txid,
    }));
    txid++;
  }
}

function onPaymentRequests (session_id, crypto_currency) {
  if (session_id in sessions && (crypto_currency === "all" || crypto_currency in supported_crypto)) {
    const sess = sessions[session_id];
    const dest = destinations[sess.application_id];
    const payment_request = new PaymentRequestMessage({
      merchant: "Vender Machine",
      amount: dest.price,
      fiat_currency: sess.request.fiat_currency,
      destinations: [{
        amount: dest.price,
        destination_address: dest.address,
        crypto_currency: "BLA",
      }]
    });
    client.publish(`payment_requests/${session_id}`, new PaymentRequestEnvelope({
      message: payment_request.toJSON(),
      signature: sign(payment_request.toJSON()),
    }).toJSON());
  }
}

function onPayments (session_id, payment) {
  if (session_id in sessions) {
    const sess = sessions[session_id];
    ack(session_id, new AckMessage({
      status: "PAID",
      transaction_hash: payment.transaction_hash,
      txid: sess.txid,
    }));
  }
}

function ack (session_id, message) {
  client.publish(`acks/${session_id}`, message.toJSON());
}

function sign (message) {
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(message);
  signer.end();
  return signer.sign(privateKey).toString('base64');
}
const { Kafka } = require('kafkajs');

// Since Colima exposes ports to localhost, this works perfectly.
const kafka = new Kafka({
  clientId: 'satya-gateway',
  brokers: ['localhost:9092'] 
});

const producer = kafka.producer();
let isConnected = false;

const connectProducer = async () => {
    if (!isConnected) {
        await producer.connect();
        isConnected = true;
        console.log("✅ Kafka Producer Connected (Colima)");
    }
};

const sendVoteToQueue = async (votePayload) => {
  await connectProducer();
  await producer.send({
    topic: 'vote.cast',
    messages: [
      { 
        key: votePayload.voterID, 
        value: JSON.stringify(votePayload) 
      },
    ],
  });
  console.log(`📨 Vote queued for Voter: ${votePayload.voterID}`);
};

module.exports = { sendVoteToQueue };

const {
  SQSClient,
  DeleteMessageCommand,
  ReceiveMessageCommand
} = require("@aws-sdk/client-sqs");

const env = require('./env');
const client = new SQSClient({ region: "eu-north-1" });

// ...
// Helper function for the "Service Autoscaling" section.
const delay = delayMs => {
  return new Promise(resolve => {
    setTimeout(resolve, delayMs)
  });
};


let running = true;

// TODO Exercise 4-1: Implement SIGINT and SIGTERM handling to stop the processor.
const stopRunning = () => {
  console.log('Exiting processor SQS polling loop');

  running = false;
}

process.on('SIGINT', stopRunning);
process.on('SIGTERM', stopRunning);


const processor = async () => {
  while (running) {
    // TODO Exercise 4-2: Send ReceiveMessageCommand to receive messages.
    // Note: This may take up to 20 (WaitTime)Seconds - what happens if a SIGINT/SIGTERM is received in the meantime?
    
    const out = await client.send(new ReceiveMessageCommand({
      QueueUrl: process.env.COPILOT_QUEUE_URI,
      WaitTimeSeconds: 10,
    }));

    if (!running) {
      break;
    }

    if (out.Messages === undefined || out.Messages.length === 0) {
      continue;
    }

    for(const message of out.Messages) {
      // TODO Exercise 4-3: Process messages (if any).
      //
      // Note: For each message (= processor request), add the following code to simulate "processing":
      // (see more about the structure of an SQS message: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/modules/message.html)
      // ...
      //
      // const {
      //     Body,
      //     ReceiptHandle
      // } = message;
      
      // const body      = JSON.parse(Body);
      // const requestId = body.Message;
      
      const {
        Body,
        ReceiptHandle
      } = message;
      
      const body      = JSON.parse(Body);
      const requestId = body.Message;

      console.log(`Request with ID: ${requestId} processed successfully.`);
      //
      // TODO Exercise 4-4: For each message, send DeleteMessageCommand to instruct the queue the the message has been handled and can be removed.
      // ...
      await client.send( new DeleteMessageCommand({
        QueueUrl: process.env.COPILOT_QUEUE_URI,
        ReceiptHandle: ReceiptHandle,
      }));
    }
  }
}

processor();
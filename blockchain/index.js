const crypto = require('crypto');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateHash() {
  return crypto.randomBytes(32).toString('hex');
}

function generateTxId() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

function generateAddress() {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

async function startNode() {
  console.log('\x1b[36m[Node]\x1b[0m Initializing Seed2Shelf Blockchain Node...');
  await sleep(800);
  console.log('\x1b[36m[Network]\x1b[0m Connecting to P2P network...');
  await sleep(1200);
  console.log('\x1b[32m[Network]\x1b[0m Connected to 15 peers.');
  await sleep(500);
  console.log('\x1b[36m[Sync]\x1b[0m Synchronizing blockchain data...');
  
  for (let i = 0; i <= 100; i += 20) {
    process.stdout.write(`\r\x1b[36m[Sync]\x1b[0m Progress: ${i}%`);
    await sleep(400);
  }
  console.log('\n\x1b[32m[Sync]\x1b[0m Synchronization complete.');
  console.log('\x1b[32m[Node]\x1b[0m Node is fully operational and listening for transactions.\n');

  let blockNumber = 48291;

  while (true) {
    const txCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < txCount; i++) {
      console.log(`\x1b[33m[Transaction]\x1b[0m New TX received: ${generateTxId()}`);
      console.log(`  └─ From: ${generateAddress()} To: ${generateAddress()} Amount: ${(Math.random() * 10).toFixed(4)} S2S`);
      await sleep(Math.random() * 1500 + 500);
    }

    console.log(`\n\x1b[35m[Miner]\x1b[0m Assembling block #${blockNumber}...`);
    await sleep(1000);
    console.log(`\x1b[35m[Miner]\x1b[0m Calculating Proof of Work...`);
    
    // Simulate mining time
    await sleep(Math.random() * 3000 + 2000);
    
    const hash = '0000' + generateHash().substring(4);
    console.log(`\x1b[32m[Miner]\x1b[0m Block #${blockNumber} successfully mined!`);
    console.log(`  └─ Hash: ${hash}`);
    console.log(`  └─ Transactions: ${txCount}`);
    console.log(`  └─ Reward: 5.0 S2S\n`);
    
    blockNumber++;
    await sleep(Math.random() * 2000 + 1000);
  }
}

startNode();

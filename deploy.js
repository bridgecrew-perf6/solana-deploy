const web3 = require("@solana/web3.js");
const { Connection, Keypair, clusterApiUrl } = web3;
const fs = require("fs").promises;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

(async () => {
  console.log("\n#1 Create Payer Account : who will pay for deployment");
  const payerAccount = new Keypair(); // can create from seed if want to deploy to mainnet.
  console.log({
    payerAccount: {
      publicKey: payerAccount.publicKey.toBytes(),
      publicKeyBase58: payerAccount.publicKey.toBase58(),
      secretKey: payerAccount.secretKey,
    },
  });
  console.log("\n#2 Air drop money to Payer Account ...");
  const devnet = clusterApiUrl("devnet"); // "https://api.devnet.solana.com"
  const conn = new Connection(devnet);
  await conn.requestAirdrop(payerAccount.publicKey, 5000000000);
  await sleep(2000);

  console.log(
    "\n#3 Create Program Account : smart contract need separate account to attach."
  );
  const programAccount = new Keypair();
  const programId = programAccount.publicKey;
  console.log("Program loaded to account");
  console.log({
    programAccount: {
      programId: programId.toBytes(),
      programIdBase58: programId.toBase58(),
      secretKey: programAccount.secretKey,
    },
  });
  console.log(
    "\n#4 Loading Program to Account : upload smart contract using BPF LOADER ..."
  );
  const program = await fs.readFile("./smartcontract.so");
  console.log({ program });
  await web3.BpfLoader.load(
    conn,
    payerAccount,
    programAccount,
    program,
    web3.BPF_LOADER_PROGRAM_ID
  );

  console.log("---------------------------------------------------------");
  console.log("program Id: ", programId.toBase58());
  console.log("---------------------------------------------------------");
})();

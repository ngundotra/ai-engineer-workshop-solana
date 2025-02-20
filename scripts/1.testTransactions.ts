/**
 * Introduction to the Solana web3.js
 * Demonstrates how to build and send a simple transaction to the blockchain using web3js.
 * This script will run on mainnet, and will transfer 0.001 SOL from the payer to itself.
 */

import * as dotenv from "dotenv";

import {
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromFile
} from "@solana-developers/helpers";
import { DEFAULT_CLI_KEYPAIR_PATH } from "@/utils";

dotenv.config();

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// create a connection to the Solana blockchain
const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
  "confirmed",
);

const payer = await getKeypairFromFile(DEFAULT_CLI_KEYPAIR_PATH);
console.log("Payer address:", payer.publicKey.toBase58(), "\n");

// Self-transfer lamports
const selfTransferIx = SystemProgram.transfer({
  // 0.001 sol
  lamports: 0.001 * LAMPORTS_PER_SOL,
  // `fromPubkey` - from MUST sign the transaction
  fromPubkey: payer.publicKey,
  // `toPubkey` - does NOT have to sign the transaction
  toPubkey: payer.publicKey,
});

/**
 * build the transaction to send to the blockchain
 */

// get the latest blockhash
let latestBlockhash = (await connection.getLatestBlockhash()).blockhash;

// create a transaction message
const message = new TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: latestBlockhash,
  instructions: [
    // Self-transfer lamports
    selfTransferIx,
  ],
}).compileToV0Message();

/**
 * try changing the order of the instructions inside of the message above...
 * see what happens :)
 */

// create a versioned transaction using the message
const tx = new VersionedTransaction(message);

// If you want to see the transaction before signing it:
// console.log("tx before signing:", tx);

// sign the transaction with our needed Signers (e.g. `payer`)
tx.sign([payer]);

// actually send the transaction
const txSig = await connection.sendTransaction(tx);

console.log("Transaction completed");
console.log(getExplorerLink("transaction", txSig, "mainnet-beta"));

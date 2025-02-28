import type { Request, Response, NextFunction } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";

import { ethers } from "ethers";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";

/**
 * Use this handler when you need to sign a transaction directly with a pre-generated Para wallet,
 * without integrating additional account abstraction clients.
 *
 * Steps for developers:
 * 1. Before calling this handler, ensure that the user's pre-generated wallet and key share are already
 *    created and stored (see `pregen-create.ts` for an example of this process).
 * 2. Provide the user's `email` in the request body so you can look up their pre-generated wallet and key share.
 * 3. Decrypt the user's key share and set it on the Para client. This step enables signing operations.
 * 4. Construct a transaction, RLP-encode it, and convert it to base64. Para's signing methods require base64-encoded input.
 * 5. Use `para.signTransaction` to sign the transaction with the pre-generated wallet.
 *
 * Note:
 * - This example focuses solely on demonstrating a simple signing operation with Para.
 * - You are responsible for implementing authentication, authorization, environment variable management,
 *   and error handling appropriate for your production environment.
 */

// Replace with your Polygon Amoy RPC URL (use Alchemy, Infura, or a public RPC)
const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";
//const ethersProvider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);

export async function paraPregenSignHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract parameters from request body
    const { email, recipientAddress, amountInPOL } = req.body;

    // Validate request body
    if (!email || !recipientAddress || !amountInPOL) {
      res.status(400).json({
        error:
          "Include `email`, `recipientAddress`, and `amountInPOL` in the request body.",
      });
      return;
    }

    // Load API Key from environment
    const PARA_API_KEY = process.env.PARA_API_KEY;
    if (!PARA_API_KEY) {
      res
        .status(500)
        .json({
          error:
            "Set PARA_API_KEY in the environment before using this handler.",
        });
      return;
    }

    // Initialize Para
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    // Ensure the pre-generated wallet exists
    if (
      !(await para.hasPregenWallet({
        pregenIdentifier: email,
        pregenIdentifierType: "EMAIL",
      }))
    ) {
      res
        .status(400)
        .json({ error: "No pre-generated wallet found for this email." });
      return;
    }

    // Get & decrypt user's key share
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res
        .status(400)
        .json({ error: "Key share not found. Confirm wallet initialization." });
      return;
    }
    await para.setUserShare(decrypt(keyShare));

    // Retrieve wallet details
    const wallets = await para.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res
        .status(500)
        .json({ error: "No wallet found after setting the user share." });
      return;
    }
    const walletAddress = wallet.address!;
    console.log("Wallet Address:", walletAddress);

    // Create Ethers provider & signer
    const ethersProvider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
    // @ts-ignore
    const paraEthersSigner = new ParaEthersSigner(para, ethersProvider);

    // Convert amount to Wei
    const amountInWei = ethers.parseEther(amountInPOL.toString());

    // Construct transaction
    const tx = {
      to: recipientAddress,
      from: walletAddress,
      value: amountInWei,
      nonce: await ethersProvider.getTransactionCount(walletAddress),
      gasLimit: 21000, // Standard gas for simple transfer
      gasPrice: (await ethersProvider.getFeeData()).gasPrice,
      chainId: 80002, // Polygon Amoy
    };

    // Sign the transaction
    const signedTx = await paraEthersSigner.signTransaction(tx);
    console.log("Signed Transaction:", signedTx);

    // Broadcast the transaction
    const txResponse = await ethersProvider.broadcastTransaction(signedTx);
    console.log("Transaction Broadcasted! Hash:", txResponse.hash);

    res.status(200).json({
      message: "Transaction signed and broadcasted.",
      transactionHash: txResponse.hash,
    });
  } catch (error) {
    console.error("Error in paraPregenSignHandler:", error);
    next(error);
  }
}

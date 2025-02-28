import { Router } from "express";

import { createPregenWalletHandler } from "./examples/wallets/pregen-create.js";
import { paraPregenSignHandler } from "./examples/para/pregen.js";
import { ethersPregenSignHandler } from "./examples/ethers/pregen.js";
import { ethersSessionSignHandler } from "./examples/ethers/session.js";

const router = Router();

/**
 * Use these routes to demonstrate various workflows with Para and different integrations (Ethers, Viem, CosmJS, Solana-Web3, Alchemy-AA).
 * Each endpoint focuses on a specific scenario (pre-generated wallets vs session-based wallets) and technology stack.
 *
 * Before calling these routes, ensure you meet any prerequisites mentioned in their comments (e.g., having a pre-generated wallet, setting environment variables, or exporting a session).
 */

// Wallet creation route for pre-generated wallets.
router.post("/examples/wallets/pregen/create", createPregenWalletHandler);

// Para-only signing examples
router.post("/examples/para/pregen", paraPregenSignHandler);

// Ethers signing examples
router.post("/examples/ethers/pregen", ethersPregenSignHandler);
router.post("/examples/ethers/session", ethersSessionSignHandler);

export default router;

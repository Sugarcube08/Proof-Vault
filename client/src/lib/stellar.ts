import { rpc, Contract, Address, scValToNative, xdr, TransactionBuilder, Networks } from "stellar-sdk";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";

export function getRpcServer(): rpc.Server {
  return new rpc.Server(RPC_URL);
}

export function getNetworkPassphrase(): string {
  if (NETWORK === "mainnet") {
    return Networks.PUBLIC;
  }
  return Networks.TESTNET;
}

export interface Proof {
  owner: string;
  hash: string;
  timestamp: number;
}

export async function simulateCall(method: string, args: xdr.ScVal[]): Promise<xdr.ScVal | undefined> {
  const server = getRpcServer();
  const passphrase = getNetworkPassphrase();
  const contract = new Contract(CONTRACT_ID);

  // GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF is a valid, empty public key used as a placeholder source account
  const dummySource = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
  
  let account;
  try {
    account = await server.getAccount(dummySource);
  } catch (e) {
    // If the account doesn't exist, we construct a mock Account object with sequence 1
    // which is sufficient for simulation
    account = {
      sequenceNumber: () => "1",
      accountId: () => dummySource,
    } as any;
  }

  const op = contract.call(method, ...args);
  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: passphrase,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationSuccess(sim)) {
    if (sim.result) {
      return sim.result.retval;
    }
  } else if (rpc.Api.isSimulationRestore(sim)) {
    throw new Error("Simulation requires storage restoration.");
  } else {
    const errorMsg = (sim as any).error || "Unknown simulation failure";
    throw new Error(`Simulation failed: ${errorMsg}`);
  }
  return undefined;
}

export async function checkProofExists(hashHex: string): Promise<boolean> {
  try {
    const cleanHash = hashHex.replace(/^0x/, "");
    const hashBytes = Buffer.from(cleanHash, "hex");
    if (hashBytes.length !== 32) {
      throw new Error("Hash must be 32 bytes (64 hex characters)");
    }
    const hashScVal = xdr.ScVal.scvBytes(hashBytes);
    const retval = await simulateCall("exists", [hashScVal]);
    if (!retval) return false;
    return scValToNative(retval) as boolean;
  } catch (error) {
    console.error("Error checking proof exists:", error);
    return false;
  }
}

export async function verifyProof(hashHex: string): Promise<Proof | null> {
  try {
    const cleanHash = hashHex.replace(/^0x/, "");
    const hashBytes = Buffer.from(cleanHash, "hex");
    if (hashBytes.length !== 32) {
      throw new Error("Hash must be 32 bytes (64 hex characters)");
    }
    const hashScVal = xdr.ScVal.scvBytes(hashBytes);
    const retval = await simulateCall("verify", [hashScVal]);
    if (!retval) return null;
    const native = scValToNative(retval);
    return {
      owner: native.owner,
      hash: Buffer.from(native.hash).toString("hex"),
      timestamp: Number(native.timestamp),
    };
  } catch (error) {
    console.error("Error verifying proof:", error);
    return null;
  }
}

export async function getProofsByOwner(ownerAddress: string): Promise<Proof[]> {
  try {
    const ownerScVal = Address.fromString(ownerAddress).toScVal();
    const retval = await simulateCall("get_proofs_by_owner", [ownerScVal]);
    if (!retval) return [];
    const native = scValToNative(retval);
    if (!Array.isArray(native)) return [];
    return native.map((item: any) => ({
      owner: item.owner,
      hash: Buffer.from(item.hash).toString("hex"),
      timestamp: Number(item.timestamp),
    }));
  } catch (error) {
    console.error("Error getting proofs by owner:", error);
    return [];
  }
}

export async function buildRegisterProofTx(userAddress: string, hashHex: string): Promise<string> {
  const server = getRpcServer();
  const passphrase = getNetworkPassphrase();
  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(userAddress);
  const cleanHash = hashHex.replace(/^0x/, "");
  const hashBytes = Buffer.from(cleanHash, "hex");
  const hashScVal = xdr.ScVal.scvBytes(hashBytes);
  const callerScVal = Address.fromString(userAddress).toScVal();

  const op = contract.call("register_proof", callerScVal, hashScVal);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: passphrase,
  })
    .addOperation(op)
    .setTimeout(180)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  return preparedTx.toXDR();
}

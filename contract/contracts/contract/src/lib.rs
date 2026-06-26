#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Symbol, Vec,
};

#[contracttype]
pub enum DataKey {
    Proof(BytesN<32>),
    OwnerProofs(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct Proof {
    pub owner: Address,
    pub hash: BytesN<32>,
    pub timestamp: u64,
}

const EVENT_REGISTER: Symbol = symbol_short!("reg_proof");

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    #[allow(deprecated)]
    pub fn register_proof(env: Env, caller: Address, hash: BytesN<32>) {
        caller.require_auth();
        assert!(
            !env.storage()
                .persistent()
                .has(&DataKey::Proof(hash.clone())),
            "duplicate proof hash"
        );
        let timestamp = env.ledger().timestamp();
        let proof = Proof {
            owner: caller.clone(),
            hash: hash.clone(),
            timestamp,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Proof(hash.clone()), &proof);
        let mut owner_proofs: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerProofs(caller.clone()))
            .unwrap_or(Vec::new(&env));
        owner_proofs.push_back(hash.clone());
        env.storage()
            .persistent()
            .set(&DataKey::OwnerProofs(caller.clone()), &owner_proofs);
        env.events()
            .publish((EVENT_REGISTER,), (caller, hash, timestamp));
    }

    pub fn verify(env: Env, hash: BytesN<32>) -> Proof {
        env.storage()
            .persistent()
            .get(&DataKey::Proof(hash))
            .expect("proof not found")
    }

    pub fn exists(env: Env, hash: BytesN<32>) -> bool {
        env.storage().persistent().has(&DataKey::Proof(hash))
    }

    pub fn get_owner(env: Env, hash: BytesN<32>) -> Address {
        let proof: Proof = env
            .storage()
            .persistent()
            .get(&DataKey::Proof(hash))
            .expect("proof not found");
        proof.owner
    }

    pub fn get_proofs_by_owner(env: Env, owner: Address) -> Vec<Proof> {
        let hashes: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerProofs(owner))
            .unwrap_or(Vec::new(&env));
        let mut proofs: Vec<Proof> = Vec::new(&env);
        for hash in hashes.iter() {
            if let Some(proof) = env
                .storage()
                .persistent()
                .get::<_, Proof>(&DataKey::Proof(hash))
            {
                proofs.push_back(proof);
            }
        }
        proofs
    }
}

mod test;

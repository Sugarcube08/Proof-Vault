#![cfg(test)]
use super::*;
use soroban_sdk::{BytesN, Env};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::testutils::Events as _;

fn create_hash(env: &Env, byte: u8) -> BytesN<32> {
    let mut arr = [0u8; 32];
    arr[0] = byte;
    BytesN::from_array(env, &arr)
}

#[test]
fn test_register_and_verify() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash = create_hash(&env, 1);

    client.register_proof(&owner, &hash);
    let proof = client.verify(&hash);

    assert_eq!(proof.owner, owner);
    assert_eq!(proof.hash, hash);
    assert!(proof.timestamp > 0);
}

#[test]
fn test_exists() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash = create_hash(&env, 2);

    assert!(!client.exists(&hash));
    client.register_proof(&owner, &hash);
    assert!(client.exists(&hash));
}

#[test]
#[should_panic(expected = "duplicate proof hash")]
fn test_duplicate_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash = create_hash(&env, 3);

    client.register_proof(&owner, &hash);
    client.register_proof(&owner, &hash);
}

#[test]
#[should_panic(expected = "proof not found")]
fn test_verify_nonexistent() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let hash = create_hash(&env, 99);
    client.verify(&hash);
}

#[test]
fn test_get_owner() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash = create_hash(&env, 5);

    client.register_proof(&owner, &hash);
    let retrieved = client.get_owner(&hash);
    assert_eq!(retrieved, owner);
}

#[test]
#[should_panic(expected = "proof not found")]
fn test_get_owner_nonexistent() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let hash = create_hash(&env, 6);
    client.get_owner(&hash);
}

#[test]
fn test_get_proofs_by_owner() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash1 = create_hash(&env, 10);
    let hash2 = create_hash(&env, 20);

    client.register_proof(&owner, &hash1);
    client.register_proof(&owner, &hash2);

    let proofs = client.get_proofs_by_owner(&owner);
    assert_eq!(proofs.len(), 2);

    let mut found1 = false;
    let mut found2 = false;
    for proof in proofs.iter() {
        if proof.hash == hash1 { found1 = true; }
        if proof.hash == hash2 { found2 = true; }
    }
    assert!(found1);
    assert!(found2);
}

#[test]
fn test_get_proofs_by_owner_empty() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let proofs = client.get_proofs_by_owner(&owner);
    assert_eq!(proofs.len(), 0);
}

#[test]
fn test_multiple_owners() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let hash_a = create_hash(&env, 100);
    let hash_b = create_hash(&env, 200);

    client.register_proof(&alice, &hash_a);
    client.register_proof(&bob, &hash_b);

    assert_eq!(client.get_proofs_by_owner(&alice).len(), 1);
    assert_eq!(client.get_proofs_by_owner(&bob).len(), 1);
    assert!(client.exists(&hash_a));
    assert!(client.exists(&hash_b));
}

#[test]
fn test_event_emitted() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let hash = create_hash(&env, 7);

    client.register_proof(&owner, &hash);

    let events = env.events().all();
    assert_eq!(events.len(), 1);
    let (contract, _topics, data) = &events.get(0).unwrap();
    assert_eq!(*contract, contract_id);

    let (event_owner, event_hash, _timestamp): (Address, BytesN<32>, u64) =
        soroban_sdk::IntoVal::into_val(data, &env);
    assert_eq!(event_owner, owner);
    assert_eq!(event_hash, hash);
}

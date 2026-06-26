const { xdr } = require('stellar-sdk');

console.log("Keys on TransactionMeta class:");
console.log(Object.keys(xdr.TransactionMeta));

console.log("Prototype keys:");
console.log(Object.keys(xdr.TransactionMeta.prototype));

// Let's check if we can call armForSwitch or inspect switches
try {
  console.log("Switches map size:", xdr.TransactionMeta._switches.size);
  for (const [k, v] of xdr.TransactionMeta._switches.entries()) {
    console.log(`  Switch key: ${k} (${typeof k === 'object' ? k.value : k}) => Arm: ${v}`);
  }
} catch (e) {
  console.log("Error inspecting switches:", e.message);
}

try {
  console.log("Arms keys:", Object.keys(xdr.TransactionMeta._arms));
} catch (e) {
  console.log("Error inspecting arms:", e.message);
}

// // 1. Import packages
const fs = require('fs');
// const solc = require('solc');
// const path = require('path');
// // 2. Get path and load contract
// const source = fs.readFileSync('./contracts/Oracle.sol', 'utf8');

// // 3. Create input object
// const input = {
//    language: 'Solidity',
//    sources: {
//       'Oracle.sol': {
//          content: source,
//       },
//    },
//    settings: {
//       outputSelection: {
//          '*': {
//             '*': ['*'],
//          },
//       },
//    },
// };

// function findImports(relativePath) {
//   //my imported sources are stored under the node_modules folder!
// //   const absolutePath = path.resolve(__dirname, 'node_modules', relativePath);
//   const source = fs.readFileSync(relativePath, 'utf8');
//   console.log("Done reading file");
//   return { contents: source };
// }

// // New syntax (supported from 0.5.12, mandatory from 0.6.0)
// const tempFile = JSON.parse(
//   solc.compile(JSON.stringify(input), {import:findImports('./contracts/Oracle.sol')})
// );

// // 4. Compile the contract
// // const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
// console.log(tempFile);
// const contractFile = tempFile.contracts['Oracle.sol']['Oracle'];

// // 5. Export contract data
// module.exports = contractFile;

var solc = require('solc');

var input = {
  language: 'Solidity',
  sources: {
    'Oracle.sol': {
      content: 'contract C { function f() public { } }'
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
let config =``
// `output` here contains the JSON output as specified in the documentation
for (var contractName in output.contracts['Oracle.sol']) {
   console.log(contractName);
  console.log(
    contractName +
      ': ' +
      output.contracts['Oracle.sol'][contractName].evm.bytecode.object);
   console.log(
    contractName +
      ': ' +
      JSON.stringify(output.contracts['Oracle.sol'][contractName].abi));
   config = `export const bytecode = "${output.contracts['Oracle.sol'][contractName].evm.bytecode.object}";
   export const abi = "${output.contracts['Oracle.sol'][contractName].abi}";`;
}
// const contractFile = output.contracts['Oracle.sol']['C'];
// console.log(contractFile);
// let config = `
//   export const bytecode = "${contractFile.evm.bytecode.object}";
//   export const abi = "${contractFile.abi}";
//   `;

let data = JSON.stringify(config);
fs.writeFileSync('./config.js', JSON.parse(data));

// // 5. Export contract data
// module.exports = contractFile;
// export contractFile;

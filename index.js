console.clear()
require("dotenv").config()
const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    Hbar,
    ContractExecuteTransaction
} = require("@hashgraph/sdk")
const fs = require("fs")

// Configure accounts and client
const opperatorId = AccountId.fromString(process.env.OPERATOR_ID)
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY)

const client = Client.forTestnet().setOperator(opperatorId, operatorKey)

async function main() {
    // Import the compiled contract bytecode
    const contractBytecode = fs.readFileSync("LookupContract_sol_LookupContract.bin")

    // Create a file on Hedera and store the bytecode
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(operatorKey)
    const fileCreateSubmit = await fileCreateSign.execute(client)
    const fileCreateRx = await fileCreateSubmit.getReceipt(client)
    const bytecodeFileId = fileCreateRx.fileId
    console.log(`The bytecode file ID is ${bytecodeFileId} \n`)

    // Instantiate the smart contract 
    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(1000000)
        .setConstructorParameters(new ContractFunctionParameters().addString("Andrei").addUint256(123123))
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client)
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client)
    const contractId = contractInstantiateRx.contractId
    const contractAddress = contractId.toSolidityAddress()
    console.log(`The smart contract ID is ${contractId}`)
    console.log(`The smart contract ID in Solidity is ${contractAddress}`)

    // Query the contract to check the changes in state variable
    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Andrei"))
    const contractQuerySubmit = await contractQueryTx.execute(client)
    const contractQueryResult = contractQuerySubmit.getUint256(0)
    console.log(`Andrei's mobile phone number is: ${contractQueryResult}`)

    // Call contract function to update the state variable
    const contractExectuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString("Vlad").addUint256(74333))
    const contractExecuteSubmit = await contractExectuteTx.execute(client)
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client)
    console.log(`Contract function call status: ${contractExecuteRx.status}`)

    // Query the contract to check changes in state variable
    const contractQueryTx2 = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Vlad"))
    const contractQuerySubmit2 = await contractQueryTx2.execute(client)
    const contractQueryResult2 = contractQuerySubmit2.getUint256(0)
    console.log(`Vlad's mobile phone number is: ${contractQueryResult2}`)


}
main()
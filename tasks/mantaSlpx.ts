import { task } from 'hardhat/config'
import {ethers} from "hardhat";

// yarn hardhat mantaSlpxMint --amount 3000000000000000000 --network manta
// yarn hardhat mantaSlpxRedeem --amount 3000000000000000000 --network manta
// yarn hardhat mantaSetRemoteContract --contract 0x5e2DBf9659b64C135912DB1cb2f5397c611e8002 --network manta
// yarn hardhat mantaSetMinAmount --amount 2000000000000000000 --network manta

const remoteChainId = 126
const contractName = "MantaPacificSlpx";
const contractAddress = "0x95A4D4b345c551A9182289F9dD7A018b7Fd0f940";
const manta = "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5";
const vManta = "0x7746ef546d562b443AE4B4145541a3b1a3D75717";

task("mantaSetRemoteContract")
    .addParam('contract', ``)
    .setAction(async (taskArgs, hre) => {
            let signers = await hre.ethers.getSigners()
            let owner = signers[0]

            console.log(taskArgs.contract)

            // get local contract
            const localContractInstance = await hre.ethers.getContractAt(contractName, contractAddress, owner)
            const remoteContract = await localContractInstance.remoteContract()
            console.log("remoteContract: ",remoteContract)
            // const tx = await localContractInstance.setRemoteContract(taskArgs.contract)
            // console.log(`✅[${owner.address}]: ${tx.hash}`)
    });

task("mantaSetMinAmount")
    .addParam('amount', ``)
    .setAction(async (taskArgs, hre) => {
        let signers = await hre.ethers.getSigners()
        let owner = signers[0]

        console.log(taskArgs.amount)

        // get local contract
        const localContractInstance = await hre.ethers.getContractAt(contractName, contractAddress, owner)
        const minAmount = await localContractInstance.minAmount()
        console.log("minAmount: ",minAmount)
        const tx = await localContractInstance.setMinAmount(BigInt(taskArgs.amount))
        console.log(`✅[${owner.address}]: ${tx.hash}`)
    });

task("mantaSlpxMint")
    .addParam('amount', ``)
    .setAction(async (taskArgs, hre) => {
        let signers = await hre.ethers.getSigners()
        let owner = signers[0]
        let amount = BigInt(taskArgs.amount)

        // get local contract
        const localContractInstance = await hre.ethers.getContractAt(contractName, contractAddress, owner)
        const dstGasForCall = 4000000
        const adapterParams = hre.ethers.utils.solidityPack(["uint16", "uint256"], [1, 4200000])
        console.log("adapterParams", adapterParams)

        // const toAddressBytes32 = hre.ethers.utils.defaultAbiCoder.encode(['address'], [owner.address])
        // const payload = hre.ethers.utils.defaultAbiCoder.encode(['address', 'uint8'], [owner.address, 0])
        // console.log("toAddressBytes32", toAddressBytes32)
        // console.log("payload", payload)

        const channel_id = 0
        const fee = await localContractInstance.estimateSendAndCallFee(manta, amount, channel_id, dstGasForCall, adapterParams)
        console.log("fee:", hre.ethers.utils.formatUnits(fee))

        // Requires approve of manta to the contract
        const tx = await localContractInstance.create_order(
            manta,
            BigInt(taskArgs.amount),
            channel_id,
            dstGasForCall,
            adapterParams,
            { value: fee }
        )
        console.log(`✅${owner.address}]: ${tx.hash}`)
    });

task("mantaSlpxRedeem")
    .addParam('amount', ``)
    .setAction(async (taskArgs, hre) => {
        let signers = await hre.ethers.getSigners()
        let owner = signers[0]
        let amount = BigInt(taskArgs.amount)

        // get local contract
        const localContractInstance = await hre.ethers.getContractAt(contractName, contractAddress, owner)
        const dstGasForCall = 4000000
        const adapterParams = hre.ethers.utils.solidityPack(["uint16", "uint256"], [1, 4200000])
        console.log("adapterParams", adapterParams)

        // const toAddressBytes32 = hre.ethers.utils.defaultAbiCoder.encode(['address'], [owner.address])
        // const payload = hre.ethers.utils.defaultAbiCoder.encode(['address', 'uint8'], [owner.address, 0])
        // console.log("toAddressBytes32", toAddressBytes32)
        // console.log("payload", payload)

        const channel_id = 0
        const fee = await localContractInstance.estimateSendAndCallFee(vManta, amount, channel_id, dstGasForCall, adapterParams)
        console.log("fee:", hre.ethers.utils.formatUnits(fee))
        // Requires approve of vManta to the contract
        const tx = await localContractInstance.create_order(
            vManta,
            BigInt(taskArgs.amount),
            channel_id,
            dstGasForCall,
            adapterParams,
            {value: fee}
        );
        console.log(`✅${owner.address}]: ${tx.hash}`);
    });

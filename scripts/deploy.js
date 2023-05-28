// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [owner, inspector, ...investors] = await ethers.getSigners()

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(owner).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Investment


  const Investment = await ethers.getContractFactory('Investment')
  const investment = await Investment.deploy(realEstate.address, owner.address, inspector.address)
  await investment.deployed()

  console.log(`Deployed Escrow Contract at: ${investment.address}`)
  console.log(`Listing 3 properties...\n`)

  transaction = await realEstate.connect(owner).approve(investment.address, 1)
  await transaction.wait()

  transaction = await investment.connect(owner).list(1, tokens(10), 70, "Property 1", "FRST")
  await transaction.wait()

  transaction = await realEstate.connect(owner).approve(investment.address, 2)
  await transaction.wait()

  transaction = await investment.connect(owner).list(2, tokens(5), 50, "Property 2", "SCND")
  await transaction.wait()


  transaction = await realEstate.connect(owner).approve(investment.address, 3)
  await transaction.wait()

  transaction = await investment.connect(owner).list(3, tokens(7), 40, "Property 3", "THRD")
  await transaction.wait()

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

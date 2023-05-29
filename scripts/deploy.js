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
  const accounts = await ethers.getSigners()

  const owners = accounts.slice(0, 3);
  const inspectors = accounts.slice(3, 6);
  const investors = accounts.slice(6);

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(owners[i]).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Investment


  const Investment = await ethers.getContractFactory('Investment')
  const investment = await Investment.deploy(realEstate.address)
  await investment.deployed()

  console.log(`Deployed Escrow Contract at: ${investment.address}`)
  console.log(`Listing 3 properties...\n`)

  transaction = await realEstate.connect(owners[0]).approve(investment.address, 1)
  await transaction.wait()

  transaction = await investment.connect(owners[0]).list(1, tokens(10), 70, "Property 1", "FRST", inspectors[0].address)
  await transaction.wait()

  transaction = await realEstate.connect(owners[1]).approve(investment.address, 2)
  await transaction.wait()

  transaction = await investment.connect(owners[1]).list(2, tokens(5), 50, "Property 2", "SCND", inspectors[1].address)
  await transaction.wait()


  transaction = await realEstate.connect(owners[2]).approve(investment.address, 3)
  await transaction.wait()

  transaction = await investment.connect(owners[2]).list(3, tokens(7), 40, "Property 3", "THRD", inspectors[2].address)
  await transaction.wait()

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

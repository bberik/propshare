const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let owner, investors, inspector
    let realEstate, investment
    
    beforeEach(async () => {
        [owner, inspector, ...investors] = await ethers.getSigners()
    
            const RealEstate = await ethers.getContractFactory('RealEstate')
            realEstate = await RealEstate.deploy()
        
            let transaction = await realEstate.connect(owner).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
            await transaction.wait()
    
    
            const Investment = await ethers.getContractFactory('Investment')
            investment = await Investment.deploy(realEstate.address, owner.address, inspector.address)

            transaction = await realEstate.connect(owner).approve(investment.address, 1)
            await transaction.wait()

            transaction = await investment.connect(owner).list(1, tokens(10), 70, "TEMP", "Property 1")
            await transaction.wait()



    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await investment.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it('Returns Owner address', async () => {
            const result = await investment.owner()
            expect(result).to.be.equal(owner.address)
        })

        it('Returns Inspector address', async () => {
            const result = await investment.inspector()
            expect(result).to.be.equal(inspector.address)
        })


    })

    describe('Listing', () => {
        it('Updates as listed', async () => {
            const result = await investment.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Returns number of total tokens', async () => {
            const result = await investment.numberOfTotalTokens(1)
            console.log(result)
            // expect(result).to.be.equal()
        })

        it('Returns total price', async () => {
            const result = await investment.totalPrice(1)
            console.log(result)
            // expect(result).to.be.equal()
        })

        it('Returns token price', async () => {
            const result = await investment.tokenPrice(1)
            console.log(result)
            // expect(result).to.be.equal()
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(investment.address)
        })
    })

    describe('Investment', () => {
        beforeEach(async () => {
            let transaction = await investment.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await investment.connect(investors[0]).invest(1, 1000, { value: tokens(1) })
                await transaction.wait()
            
            transaction = await investment.connect(investors[1]).invest(1, 2000, { value: tokens(2) })
                await transaction.wait()
            
        })
        
        it('List of investors', async () => {
            const result = await investment.investors(1, investors[1].address)
            console.log(result)
        })

        it('Updates contract balance', async () => {
            const result = await investment.getBalance()
            expect(result).to.be.equal(tokens(3))
        })

        it('Token Transfered', async () => {
            const tokenAddress = await investment.tokenCollections(1)
            // const result = await tokenCollection.balanceOf(investors[0].address)
            const erc20Contract = await ethers.getContractAt("Token", tokenAddress);
            console.log(await erc20Contract.balanceOf(investors[2].address))
        })
    })
    
    
    
})

const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let investment, realEstate, owners, inspectors, investors
    
    beforeEach(async () => {
        
            const accounts = await ethers.getSigners()

            owners = accounts.slice(0, 3);
            inspectors = accounts.slice(3, 6);
            investors = accounts.slice(6);
        
            const RealEstate = await ethers.getContractFactory('RealEstate')
            realEstate = await RealEstate.deploy()
        
            let transaction = await realEstate.connect(owners[0]).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS/1.json")
            await transaction.wait()

            transaction = await realEstate.connect(owners[1]).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS/2.json")
            await transaction.wait()
    
            const Investment = await ethers.getContractFactory('Investment')
            investment = await Investment.deploy(realEstate.address)

            transaction = await realEstate.connect(owners[0]).approve(investment.address, 1)
            await transaction.wait()

            transaction = await investment.connect(owners[0]).list(1, tokens(10), 70, "Property 1", "FRST", inspectors[0].address)
            await transaction.wait()

            transaction = await realEstate.connect(owners[1]).approve(investment.address, 2)
            await transaction.wait()

            transaction = await investment.connect(owners[1]).list(2, tokens(4), 50, "Property 2", "SCND", inspectors[1].address)
            await transaction.wait()



    })


    describe('Listing', () => {

        it('Returns number of total tokens', async () => {
            const result = await investment.nftData(2)
            console.log(result.numberOfTotalTokens)
            // expect(result).to.be.equal()
        })

        it('Returns total price', async () => {
            const result = await investment.nftData(2)

            console.log(result.totalPrice)
            // expect(result).to.be.equal()
        })

        it('Returns token price', async () => {
            const result = await investment.nftData(2)
            console.log(result.tokenPrice)
            // expect(result).to.be.equal()
        })

    })

    describe('Investment', () => {
        beforeEach(async () => {
            let transaction = await investment.connect(inspectors[0]).updateInspectionStatus(1, true)
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
            const result = await investment.nftData(1)
            const tokenAddress = result.tokenCollection
            // const result = await tokenCollection.balanceOf(investors[0].address)
            const erc20Contract = await ethers.getContractAt("Token", tokenAddress);
            console.log(await erc20Contract.balanceOf(investors[1].address))
        })
    })
    
    
    
})

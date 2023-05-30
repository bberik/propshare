import { useEffect, useContext, useState } from 'react';
import React from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';


// Components
import Navbar from './components/navbar/Navbar';
import Hero from './components/hero/Hero';
import Footer from './components/footer/Footer';
import Properties from './components/properties/Properties';
import PropertyDetails from './components/propertyDetails/PropertyDetails';
import ListProperty from './components/listProperty/ListProperty';
import Dashboard from './components/dashboard/Dashboard';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Investment from './abis/Investment.json'
// import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  // const[escrow, setEscrow] = useState(null)
  // const[homes, setHomes] = useState(null)
  const [investment, setInvestment] = useState(null)


  const LoadBlockChainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // to find out where the contract is deployed from the config file
    const network = await provider.getNetwork()
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    // const totalSupply = await realEstate.totalSupply()

    const investment = new ethers.Contract(config[network.chainId].investment.address, Investment, provider)
    console.log(investment)


    // const homes = []

    // for(var i = 1; i <= totalSupply; i++){
    //   const uri = await realEstate.tokenURI(i)
    //   const response = await fetch(uri)
    //   const metadata = await response.json()
    //   homes.push(metadata)
    // }

    // setHomes(homes)

    // const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    // setEscrow(escrow)


    // console.log(homes)

    // const

    // config[network.chainId].realEstate.address
    // config[network.chainId].escrow.address
    // console.log(totalSupply.toString())
    
    window.ethereum.on('accountsChanged', async () =>{
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(()=>{
      LoadBlockChainData();
  }, [])

  return (
    <div>
      <Routes>
        
        <Route path='/' element={
          <>
            <Navbar account={account} setAccount={setAccount}/>
            <Hero />
            <Properties />
            <Footer />
          </>
        } />

        <Route path='/<id>' element={
          <>
            <Navbar />
            <PropertyDetails />
            <Footer />
          </>
        } />
        <Route path='/dashboard' element={
          <>
            <Navbar />
            <Dashboard />
            <Footer />
          </>
        } />
        <Route path='/list' element={
          <>
            <Navbar />
            <ListProperty />
            <Footer />
          </>
        } />

      </Routes>

    </div>
  );
}

export default App;

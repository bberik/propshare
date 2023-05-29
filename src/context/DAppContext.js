import { ethers } from 'ethers';
import React, { createContext, useEffect, useState } from 'react';


const DAppContext = createContext();

const DAppProvider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // Create the provider when the component mounts
    const createProvider = async () => {
      if (window.ethereum) {
        const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethereumProvider);
      }
    };

    createProvider();

    // Clean up the provider when the component unmounts
    return () => {
      setProvider(null);
    };
  }, []);

  window.ethereum.on('accountsChanged', async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account);
  })


  return (
    <DAppContext.Provider
      value={{
        provider,
        account,
        setAccount,
      }}
    >
      {children}
    </DAppContext.Provider>
  );
};

export { DAppContext, DAppProvider };

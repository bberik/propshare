import React, { useContext, useEffect, useState } from 'react'
import { DAppContext } from '../../context/DAppContext'
import RealEstate from '../../abis/RealEstate.json'
import config from '../../config.json';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage';
import "./Properties.css"

function makeStorageClient() {
    return new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNCOTk0OTY1MWNkQTk5YzYzM2U0QjFEMzgxMmIyNTQzMTlEYzgwQjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODUzNjAwNzQyMzQsIm5hbWUiOiJQcm9wU2hhcmUifQ.nPYnkscXGYZH5hTtAN-hG6YGyIjcfyY3yCI58nWKI2k" })
}


const Properties = () => {
    const [properties, setProperties] = useState([])
    const [provider, setProvider] = useState(null)
    const [imageURL, setImageURL] = useState(null);


    const loadBlockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()
        const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
        const totalSupply = await realEstate.totalSupply()
        const properties = []

        for (var i = 1; i <= totalSupply; i++) {
            const uri = await realEstate.tokenURI(i)
            const nft = await getNFT(uri, i);

            const property = await parseNFT(nft, i);

            properties.push(property)


        }

        setProperties(properties)

    }

    useEffect(() => {
        loadBlockchainData()
    }, [])


    const getNFT = async (uri, i) => {
        let cid = uri.split("/")
        cid = cid[cid.length - 2]

        const client = makeStorageClient()
        const res = await client.get(cid)
        if (!res.ok) {
            throw new Error(`failed to get`)
        }

        const files = await res.files()
        return files[i - 1]
    }

    const parseNFT = (nft, i) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const fileContent = e.target.result;
                    const property = await JSON.parse(fileContent);
                    console.log(property);

                    const image = await getNFT(property.image, i);
                    property.image = URL.createObjectURL(image);

                    resolve(property);
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(nft);
        });
    };



    return (
        <div>
            <div className='cards__section'>

                <h3>Homes For You</h3>
                <hr />

                <div className='cards'>
                    {properties.map((home, index) => (
                        <div className='card' key={index}>
                            <div className='card__image'>
                                <img src={home.image} alt="Home" />
                            </div>
                            <div className='card__info'>
                                <h4>{home.attributes[0].value} ETH</h4>
                                <p>
                                    <strong>{home.attributes[2].value}</strong> bds |
                                    <strong>{home.attributes[3].value}</strong> ba |
                                    <strong>{home.attributes[4].value}</strong> sqft
                                </p>
                                <p>{home.address}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Properties
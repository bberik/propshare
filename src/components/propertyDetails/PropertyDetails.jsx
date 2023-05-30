import React from 'react'
import "./PropertyDetails.css"
import { useContext, useEffect, useState } from 'react'
import { DAppContext } from '../../context/DAppContext'
import RealEstate from '../../abis/RealEstate.json'
import config from '../../config.json';
import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage';
import ETHIcon from '../../assets/ethIcon.png';

function makeStorageClient() {
    return new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNCOTk0OTY1MWNkQTk5YzYzM2U0QjFEMzgxMmIyNTQzMTlEYzgwQjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODUzNjAwNzQyMzQsIm5hbWUiOiJQcm9wU2hhcmUifQ.nPYnkscXGYZH5hTtAN-hG6YGyIjcfyY3yCI58nWKI2k" })
}


const PropertyDetails = () => {

    const [provider, setProvider] = useState(null)
    const [property, setProperty] = useState(null)

    const details = [
        { title: 'Type of Residence', value: property?.attributes[1].value },
        { title: 'Year built', value: property?.attributes[5].value },
        { title: 'Area', value: `${property?.attributes[4].value} sqft` },
        { title: 'Bedrooms', value: property?.attributes[2].value },
        { title: 'Bathrooms', value: property?.attributes[3].value },
    ];


    const loadBlockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()
        const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)

        const uri = await realEstate.tokenURI(1)
        const nft = await getNFT(uri)
        const property = await parseNFT(nft);

        setProperty(property)

    }

    useEffect(() => {
        loadBlockchainData()
    }, [])


    const getNFT = async (uri) => {
        let cid = uri.split("/")
        cid = cid[cid.length - 2]
        cid = cid.split(".")[0]

        const client = makeStorageClient()
        const res = await client.get(cid)
        if (!res.ok) {
            throw new Error(`failed to get`)
        }

        const files = await res.files()
        return files[0]
    }

    const parseNFT = (nft) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const fileContent = e.target.result;
                    const property = await JSON.parse(fileContent);
                    console.log(property);

                    const image = await getNFT(property.image);
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
        <div className='container'>
            <div className='title'>
                <h2>{property?.name}</h2>
            </div>
            <div className='wrapper'>
                <div className='side'>
                    <div>
                        <h3>{property?.attributes[0].value} ETH</h3>
                    </div>
                    <div>
                        {
                            details.map((detail, index) => (
                                <div>
                                    <div key={index} className='side_details'>
                                        <h5>{detail.title}</h5>
                                        <h5>{detail.value}</h5>
                                    </div>
                                    <hr />
                                </div>
                            ))}
                    </div>
                </div>
                <div className='main'>
                    <img src={property?.image} alt="Home" />
                    <h2>Address</h2>
                    <p>{property?.address}</p>
                    <hr />
                    <h2>Description</h2>
                    <p>{property?.description}</p>
                    <hr />
                    <h2>Investment Details</h2>
                    <div className='investment__details'>
                        <div className='details'>
                            <h5>Total value of the asset: </h5>
                            <div>
                                <h5>20 ETH</h5>
                                <img src={ETHIcon}></img>
                            </div>
                        </div>
                        <hr />
                        <div className='details'>
                            <h5>Available tokens:</h5>
                            <h5>2525 out of total 5000 tokens</h5>
                        </div>
                        <hr />
                        <div className='details'>
                            <h5>Token Price: </h5>
                            <div>
                                <h5>20 ETH</h5>
                                <img src={ETHIcon}></img>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PropertyDetails
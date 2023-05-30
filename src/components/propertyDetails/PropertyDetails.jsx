import React from 'react'
import "./PropertyDetails.css"
import { useContext, useEffect, useState } from 'react'
import { DAppContext } from '../../context/DAppContext'
import RealEstate from '../../abis/RealEstate.json'
import Investment from '../../abis/Investment.json'
import config from '../../config.json';
import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage';
import ETHIcon from '../../assets/ethIcon.png';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';



const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

function makeStorageClient() {
    return new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNCOTk0OTY1MWNkQTk5YzYzM2U0QjFEMzgxMmIyNTQzMTlEYzgwQjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODUzNjAwNzQyMzQsIm5hbWUiOiJQcm9wU2hhcmUifQ.nPYnkscXGYZH5hTtAN-hG6YGyIjcfyY3yCI58nWKI2k" })
}


const PropertyDetails = () => {
    const web3 = new Web3();
    const [provider, setProvider] = useState(null)
    const [property, setProperty] = useState(null)
    const [investment, setInvestment] = useState(null)
    const [nftData, setNftData] = useState(null)

    const { account } = useContext(DAppContext)
    const { id } = useParams();

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

        const uri = await realEstate.tokenURI(id)
        const nft = await getNFT(uri)
        const property = await parseNFT(nft);

        setProperty(property)

        const investment = new ethers.Contract(config[network.chainId].investment.address, Investment, provider)
        setInvestment(investment)

        const nftdata = await investment.nftData(id)
        console.log(nftdata)
        const totalPrice = web3.utils.fromWei(nftdata.totalPrice.toString(), 'ether');
        const tokenPrice = web3.utils.fromWei(nftdata.tokenPrice.toString(), 'ether');
        const numberOfTotalTokens = web3.utils.fromWei(nftdata.numberOfTotalTokens.toString(), 'ether') * 10 ** 18;
        const numberOfAvailableTokens = web3.utils.fromWei(nftdata.numberOfAvailableTokens.toString(), 'ether') * 10 ** 18;
        setNftData(
            {
                tokenPrice: tokenPrice,
                totalPrice: totalPrice,
                numberOfAvailableTokens: numberOfAvailableTokens,
                numberOfTotalTokens: numberOfTotalTokens,
                inspectionPassed: nftdata.inspectionPassed,
                owner: nftdata.owner,
                inspector: nftdata.inspector,
                tokenCollection: nftdata.tokenCollection
            }
        )
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
        return files[id - 1]
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



    const [tokens, setTokens] = useState('');
    const [error, setError] = useState('');


    const handleChange = (event) => {
        const { value } = event.target;
        setTokens(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (tokens === '') {
            setError('Please enter the number of tokens you want to purchase.');
        } else if (isNaN(tokens) || Number(tokens) < 1) {
            setError(`You should purchase at least 1 token of this property.`);
        } else if (isNaN(tokens) || Number(tokens) > nftData?.numberOfAvailableTokens) {
            setError(`You can purchase at most ${nftData?.numberOfAvailableTokens}.`);
        } else {
            // Form submission logic here
            setError('');

            const signer = await provider.getSigner()
            const total = tokens * nftData?.tokenPrice
            const weiValue = web3.utils.toWei(total.toString(), 'ether');
            let transaction = await investment.connect(signer).invest(id, tokens, { value: weiValue })
            await transaction.wait()
            alert('Congratulations! You have successfully invested in this property! You can see your tokens in your dashboard or in Metamask!');
            window.location.reload();
        }

    };

    const handleApprove = async () => {
        const signer = await provider.getSigner()
        // Inspector updates status
        const transaction = await investment.connect(signer).updateInspectionStatus(id, true)
        await transaction.wait()
        alert('Property has been successfully approved!');
        window.location.reload();

    }



    return (
        <div className='container'>
            <div className='title'>
                <h2>{property?.name}</h2>
            </div>
            <div className='wrapper'>
                <div className='side'>
                    <div className='price'>
                        <h3>{property?.attributes[0].value} ETH</h3>
                        <img src={ETHIcon}></img>
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
                    <div className='invest'>
                        <div className='investment__details'>
                            <div className='details'>
                                <h5>Total value of the asset: </h5>
                                <div>
                                    <h5> {nftData?.totalPrice} ETH</h5>
                                    <img src={ETHIcon}></img>
                                </div>
                            </div>
                            <hr />
                            <div className='details'>
                                <h5>Available tokens:</h5>
                                <h5>{nftData?.numberOfAvailableTokens} out of total {nftData?.numberOfTotalTokens} tokens</h5>
                            </div>
                            <hr />
                            <div className='details'>
                                <h5>Token Price: </h5>
                                <div>
                                    <h5>{nftData?.tokenPrice} ETH</h5>
                                    <img src={ETHIcon}></img>
                                </div>
                            </div>
                            <hr />
                            <div className='details'>
                                <h5>Token address:</h5>
                                <h5>{nftData?.tokenCollection}</h5>
                            </div>
                            <div class="warning-container">
                                <div class="warning-icon">!</div>
                                <div class="warning-message">If you have invested in this property, import your tokens to your Metamask wallet using the above token address.</div>
                            </div>

                        </div>
                        {nftData?.inspectionPassed ? <div className='invest__form'>
                            <h2>Do you want to invest in this property? </h2>
                            <form onSubmit={handleSubmit}>
                                <label>How many tokens do you want to purchase? </label>
                                <input
                                    type="number"
                                    value={tokens}
                                    onChange={handleChange}
                                    min={1}
                                    max={nftData?.numberOfAvailableTokens}
                                />
                                {error && <p>{error}</p>}

                                <div className='details'>
                                    <h4 className='total'>Your total is </h4>
                                    <div>
                                        <h4>{tokens ? (Number(tokens) * nftData?.tokenPrice).toFixed(5) : 0} ETH</h4>
                                        <img src={ETHIcon} ></img>
                                    </div>
                                </div>
                                <button type="submit">Purchase</button>
                            </form>
                        </div>
                            : nftData?.inspector === account ? <div className='approve'>
                                <h2>You are the inspector of this property</h2>
                                <button onClick={handleApprove}>Approve property</button>
                            </div> : <div className='error'>
                                <h2>This property didn't pass inspection check. You can start investing after the inspector approves this property...</h2></div>}

                    </div>
                </div>
            </div>

        </div>
    )
}

export default PropertyDetails
import React, { useState } from 'react';
import './ListProperty.css';

import { Web3Storage } from 'web3.storage'
function getAccessToken () {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDVFZEZBNjg0YTNBMDExZGZBQWFDMDk5YjQ4NWRjNjZjOWUxMEVGMDMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODUzNjc1MTA5NjIsIm5hbWUiOiJwcm9wc2hhcmUifQ.Sw0NFJPkcgpNpCABESMR0xaTTnQGrgvw4bbOKdhEO78";
}
  
function makeStorageClient () {
    console.log(new Web3Storage({ token: getAccessToken() }));
    return new Web3Storage({ token: getAccessToken() });
}

const ListProperty = () => {
  const [property, setProperty] = useState({
    name: '',
    address: '',
    description: '',
    image: '',
    id: '',
    attributes: [
      { trait_type: 'Purchase Price', value: '' },
      { trait_type: 'Type of Residence', value: '' },
      { trait_type: 'Bed Rooms', value: '' },
      { trait_type: 'Bathrooms', value: '' },
      { trait_type: 'Square Feet', value: '' },
      { trait_type: 'Year Built', value: '' },
    ],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "image") {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProperty((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageClient = makeStorageClient();
    console.log(property)
    const imgF = new File([imageFile], "image.png")
    const imageCid = await imageClient.put([imgF], "yes.png");
    console.log(imageCid)
    setProperty((prevState) => ({
        ...prevState,
        image: "https://dweb.link/ipfs/"+imageCid.toString(),
      }));

    const jsonData = JSON.stringify(property);

    const file = new Blob([jsonData], { type: 'application/json' });
    const jsonFile = new File([file], "metadata.json")
    const client = makeStorageClient()
    const cid = await client.put([jsonFile], "whynot.json")
    console.log('stored files with cid:', cid)
  };

  return (
    <div className="ListProperty">
      <h2>List Property</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
        //   value={property.name}
          onChange={handleInputChange}
        />

        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          name="address"
          value={property.address}
          onChange={handleInputChange}
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={property.description}
          onChange={handleInputChange}
        ></textarea>

        <label htmlFor="image">Image URL:</label>
        <input
          type="file"
          id="image"
          name="image"
        //   accept="image/*"
        //   value={property.image}
          onChange={handleInputChange}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ width: '200px' }} />
        )}

        {/* Render other input fields for the attributes array */}
        {property.attributes.map((attribute, index) => (
          <div key={index}>
            <label htmlFor={attribute.trait_type}>{attribute.trait_type}:</label>
            <input
              type="text"
              id={attribute.trait_type}
              name={attribute.trait_type}
              value={attribute.value}
              onChange={(e) => {
                const { name, value } = e.target;
                setProperty((prevState) => ({
                  ...prevState,
                  attributes: prevState.attributes.map((attr, idx) =>
                    idx === index ? { ...attr, value } : attr
                  ),
                }));
              }}
            />
          </div>
        ))}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ListProperty;

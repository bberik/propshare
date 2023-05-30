import React from 'react'
import { useState } from 'react';
import './Hero.css';
import { useNavigate } from 'react-router-dom';

const cities = ['New York', 'Los Angeles', 'San Francisco'];
const propertyTypes = ['Apartment', 'House', 'Condo'];
const priceRanges = ['0-1000', '1000-2000', '2000+'];

const Hero = () => {
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedPropertyType, setSelectedPropertyType] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const navigate = useNavigate();
    // Event handlers for user selections
    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
    };

    const handlePropertyTypeChange = (e) => {
        setSelectedPropertyType(e.target.value);
    };

    const handlePriceRangeChange = (e) => {
        setSelectedPriceRange(e.target.value);
    };

    const handleRefresh = () => {
        setSelectedCity('');
        setSelectedPropertyType('');
        setSelectedPriceRange('');
    };



    return (
        <div className='container'>
            <div className="bg-container">
                <h2 >Search Investment Opportunities</h2>
                <div className="search-container">
                    <div className="search-field">
                        <label htmlFor="city">City:</label>
                        <select id="city" value={selectedCity} onChange={handleCityChange}>
                            <option value="">Select a city</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="search-field">
                        <label htmlFor="propertyType">Property Type:</label>
                        <select
                            id="propertyType"
                            value={selectedPropertyType}
                            onChange={handlePropertyTypeChange}
                        >
                            <option value="">Select a property type</option>
                            {propertyTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="search-field">
                        <label htmlFor="priceRange">Price Range:</label>
                        <select
                            id="priceRange"
                            value={selectedPriceRange}
                            onChange={handlePriceRangeChange}
                        >
                            <option value="">Select a price range</option>
                            {priceRanges.map((range) => (
                                <option key={range} value={range}>
                                    {range}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="search-button" onClick={() => navigate("/?city=${selectedCity}&type=${selectedPropertyType}&price=${selectedPriceRange}")}>
                        Search
                    </button>
                    {/* <button className="refresh-button" onClick={handleRefresh}>
                        Refresh
                    </button> */}
                </div>

            </div>

        </div>

    )
}

export default Hero
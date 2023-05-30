import { useEffect, useContext } from 'react';
import React from 'react';
import './App.css'
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
import Escrow from './abis/Investment.json'

// Config
import config from './config.json';

function App() {

  return (
    <div>
      <Routes>
        
        <Route path='/' element={
          <>
            <Navbar />
            <Hero />
            <Properties />
            <Footer />
          </>
        } />

        <Route path='/:id' element={
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

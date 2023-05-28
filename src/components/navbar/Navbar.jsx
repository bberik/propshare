import React from 'react'
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png'
import './Navbar.css'

const Navbar = () => {
    // const account = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let account;

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="/list">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <Link to='/' ><img src={Logo} alt="Logo" /></Link>
            </div>


            {account ? (
                <button
                    type="button"
                    className='nav__connect'
                >
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                // onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navbar
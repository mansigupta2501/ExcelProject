import React from "react";
import './navbar.css'
import { NavLink } from "react-router-dom";

const NavBar = () => (
    <header className='navbar'>
        <div className='navbar__title navbar__item'>SnapHire</div>
        {/* <div className='navbar__item'>About Us</div> */}
        {/* <div className='navbar__item'>Contact</div> */}
        <NavLink to='/updateMastersheet' className='navbar__item'>UpdateMastersheet</NavLink>   
        <NavLink to='/profitAndLoss' className='navbar__item'>P&L Report</NavLink>        
    </header>
);

export default NavBar
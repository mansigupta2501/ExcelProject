import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {

    return (
        <>
        <NavLink to="/updateMastersheet"> UpdateMastersheet</NavLink>
        <NavLink to="/profitAndLoss"> P&L Report</NavLink>
        <NavLink to="/"> Home </NavLink>
        </>
    )
}

export default Menu;
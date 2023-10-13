import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import UpdateMastersheet from './UpdateMastersheet';
import ProfitAndLoss from './ProfitAndLoss'; 
// import Menu from './Menu'

function NoMatch() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404: Page Not Found</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adip.</p>
    </div>
  );
} 

const Navigation = () => {
  return (
    <>
    {/* <Menu /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="profitAndLoss" element={<ProfitAndLoss />} />
        <Route path="updateMastersheet" element={<UpdateMastersheet />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
};

export default Navigation;

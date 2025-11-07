import React from 'react';

const Navbar = () => {
  return (
    <div className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <h3 className="text-lg font-semibold">Farmer Dashboard</h3>
      <div>
        <button className="bg-white text-green-700 px-3 py-1 rounded-md">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;

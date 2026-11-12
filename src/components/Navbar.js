import React from 'react';
// Added hover and active styles for navbar items
const navbarStyles = `
  .navbar-item {
    transition: background-color 0.3s ease;
  }
  .navbar-item:hover {
    background-color: #f5f5f5;
  }
  .navbar-item.active {
    color: #007bff;
    font-weight: 600;
    box-shadow: inset 0 -2px 0 0 #007bff;
  }
`;
    <nav className="navbar">
      <style>{navbarStyles}</style>

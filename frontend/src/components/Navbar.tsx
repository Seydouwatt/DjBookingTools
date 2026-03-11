import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/venues', label: 'Lieux' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/settings', label: 'Paramètres' },
];

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-8">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎧</span>
        <span className="font-bold text-lg text-white">DjBookingTools</span>
      </div>
      <div className="flex items-center gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

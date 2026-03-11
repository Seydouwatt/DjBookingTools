import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { VenuesTable } from './pages/VenuesTable';
import { Pipeline } from './pages/Pipeline';
import { VenueDetail } from './pages/VenueDetail';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/venues" element={<VenuesTable />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

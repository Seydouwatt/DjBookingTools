import React from 'react';
import { VenueStatus } from '../types/venue';

const STATUS_CONFIG: Record<VenueStatus, { label: string; className: string }> = {
  to_contact: { label: 'À contacter', className: 'bg-blue-900 text-blue-200' },
  contacted: { label: 'Contacté', className: 'bg-yellow-900 text-yellow-200' },
  discussion: { label: 'En discussion', className: 'bg-orange-900 text-orange-200' },
  booked: { label: 'Booké', className: 'bg-green-900 text-green-200' },
  no_response: { label: 'Pas de réponse', className: 'bg-gray-700 text-gray-300' },
  not_interested: { label: 'Pas intéressé', className: 'bg-red-900 text-red-200' },
};

interface Props {
  status: VenueStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-700 text-gray-300' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
};

export { STATUS_CONFIG };

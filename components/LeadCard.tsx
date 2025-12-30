'use client';

import React from 'react';
import { Phone, Mail, MoreVertical } from 'lucide-react';

interface LeadCardProps {
  name: string;
  timestamp: string;
  phone: string;
  email: string;
  status: 'New' | 'Open' | 'In Progress' | 'Dead' | 'Recycled' | 'Open Deal';
  statusColor: 'orange' | 'blue' | 'cyan' | 'gray' | 'teal' | 'green';
  avatar?: string;
}

const statusStyles = {
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  gray: 'bg-gray-100 text-gray-600',
  teal: 'bg-teal-100 text-teal-600',
  green: 'bg-green-100 text-green-600',
};

export default function LeadCard({ 
  name, 
  timestamp, 
  phone, 
  email, 
  status, 
  statusColor
}: LeadCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{email}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[statusColor]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

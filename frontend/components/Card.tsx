import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon, trend }: { label: string, value: string | number, icon?: React.ReactNode, trend?: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm font-medium text-agri-green mt-2 flex items-center gap-1">
              <span className="text-xs">↑</span> {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-agri-green-100 text-agri-green rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

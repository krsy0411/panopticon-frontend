import React from 'react';

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border hover:border-purple-200 hover:shadow-lg transition group">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
        {icon}
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

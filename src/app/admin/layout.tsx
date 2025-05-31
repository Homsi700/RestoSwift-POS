import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {/* Admin specific layout elements can be added here if needed, e.g., sub-navigation */}
      {children}
    </div>
  );
}

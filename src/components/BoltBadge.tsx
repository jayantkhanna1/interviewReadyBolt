import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <img
          src="/WhatsApp Image 2025-06-28 at 12.54.31.jpeg"
          alt="Powered by Bolt.new"
          className="w-full h-full rounded-full object-cover"
        />
      </a>
    </div>
  );
};

export default BoltBadge;
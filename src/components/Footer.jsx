import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t-2 border-white bg-black py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">NIGHTNOVA</h2>
          <p className="mt-2 text-gray-400 font-mono text-sm max-w-xs">
            The definitive guide to the world's most exclusive nightlife. Find your vibe, book your table.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <p className="text-gray-500 font-mono text-xs">
            © {new Date().getFullYear()} NIGHTNOVA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

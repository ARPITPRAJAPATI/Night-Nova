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
          <div className="group relative px-6 py-2 border-2 border-white bg-transparent text-white font-black uppercase text-sm mb-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] cursor-default">
            <span className="relative z-10">ENGINEERED BY ARU</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </div>
          <p className="text-gray-500 font-mono text-xs">
            © {new Date().getFullYear()} NIGHTNOVA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

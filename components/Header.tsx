import React from 'react';

interface HeaderProps {
    actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ actions }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
            <div className="container mx-auto px-4 h-12 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                        src="/logos/ss-logo-rich-64x64.png"
                        alt="Super Staffer Logo"
                        className="w-7 h-7 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-action text-base md:text-3xl tracking-wide text-white">
                        SUPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibez-blue to-vibez-purple">STAFFER</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {actions}
                </div>
            </div>
        </header>
    );
};

export default Header;

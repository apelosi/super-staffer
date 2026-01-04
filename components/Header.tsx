import React from 'react';
import { VIBEZ_LOGO_SVG } from '../constants';

interface HeaderProps {
    actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ actions }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300">
                        <div dangerouslySetInnerHTML={{ __html: VIBEZ_LOGO_SVG }} />
                    </div>
                    <span className="font-action text-lg md:text-3xl tracking-wide text-gray-900">
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

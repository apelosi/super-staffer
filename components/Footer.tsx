import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0f172a] border-t border-slate-800 pt-8 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Brand Left */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logos/ss-logo-rich-32x32.png"
                                alt="Super Staffer Logo"
                                className="w-8 h-8"
                            />
                            <h3 className="font-action text-xl text-white tracking-wide">
                                SUPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibez-blue to-vibez-purple">STAFFER</span>
                            </h3>
                        </div>
                        <div className="text-sm text-slate-500 md:ml-11">
                            Made with 🫰 in 🇸🇬
                        </div>
                    </div>

                    {/* Copyright Center */}
                    <div className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} <a href="https://vibez.ventures" target="_blank" rel="noopener noreferrer" className="hover:text-vibez-blue transition-colors underline decoration-slate-500 hover:decoration-vibez-blue">Vibez Ventures</a>. All rights reserved.
                    </div>

                    {/* Contact Link Right */}
                    <div className="text-sm">
                        <a
                            href="https://vibez.ventures/#contact"
                            className="text-slate-500 hover:text-vibez-blue transition-colors font-action tracking-wide"
                        >
                            CONTACT
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

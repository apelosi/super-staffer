import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-vibez-blue to-vibez-purple flex items-center justify-center p-6">
            <div className="text-center">
                {/* Spinning Logo - using the shield logo */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity }
                    }}
                    className="mb-8 inline-block"
                >
                    <img
                        src="/logos/ss-logo-rich-128x128.png"
                        alt="Super Staffer Logo"
                        className="w-24 h-24"
                    />
                </motion.div>

                <h2 className="font-action text-4xl md:text-5xl text-white mb-4">
                    LOADING
                </h2>
                <p className="font-comic text-xl text-white/90 mb-8">
                    Busy on a mission...
                </p>

                <div className="flex items-center justify-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 bg-white rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-3 h-3 bg-white rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-3 h-3 bg-white rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;

import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Header actions={
        <>
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-colors font-action tracking-wider border border-gray-300 text-xs whitespace-nowrap">
                  SIGN IN
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 py-1.5 bg-vibez-purple hover:bg-vibez-blue text-white font-bold rounded-full transition-colors font-action tracking-wider shadow-lg text-xs whitespace-nowrap">
                  SIGN UP
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                    userButtonPopoverCard: 'bg-white border border-gray-200 shadow-lg',
                    userButtonPopoverActionButton: 'text-gray-700 hover:bg-gray-100',
                  },
                }}
              />
            </div>
          </SignedIn>
        </>
      } />

      <div className="flex-1 pt-20">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;

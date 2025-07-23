import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              © 2025 SaStays. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
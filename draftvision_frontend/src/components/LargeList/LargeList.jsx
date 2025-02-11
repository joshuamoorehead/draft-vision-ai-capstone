import React from 'react';
import PageTransition from '../Common/PageTransition';

const LargeList = () => {
  return (
    <div className="min-h-screen bg-[#5A6BB0] transition-all duration-300">
      <PageTransition>
        {/* Main Content Placeholder */}
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-3xl text-white text-center">Large List Page Coming Soon</h3>
        </div>
      </PageTransition>
    </div>
  );
};

export default LargeList;

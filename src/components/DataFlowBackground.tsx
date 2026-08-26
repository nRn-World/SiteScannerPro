import React from 'react';

const DataFlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none no-print" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(18,18,18,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,18,18,0.045) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute -top-32 end-[-8%] w-[42rem] h-[42rem] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute top-[40%] -start-32 w-[32rem] h-[32rem] rounded-full bg-[#c9b48a]/20 blur-[110px]" />
      <div className="absolute bottom-[-20%] end-[10%] w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-[100px]" />
    </div>
  );
};

export default React.memo(DataFlowBackground);

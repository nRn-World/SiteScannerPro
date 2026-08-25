import React from 'react';
import { motion } from 'motion/react';

const DataFlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(20, 20, 20, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 20, 20, 0.05) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />
      
      {/* Horizontal data streams */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`stream-h-${i}`}
          className="absolute bg-accent"
          style={{
            height: 1,
            width: Math.random() * 100 + 50,
            top: `${Math.random() * 100}%`,
            left: `-20%`,
          }}
          animate={{
            x: ['0vw', '120vw'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Vertical data streams */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`stream-v-${i}`}
          className="absolute w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent"
          style={{
            height: Math.random() * 200 + 100,
            left: `${Math.random() * 100}%`,
            top: '-20%',
          }}
          animate={{
            y: ['-20vh', '120vh'],
          }}
          transition={{
            duration: Math.random() * 8 + 7,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}

      {/* Processing Nodes (Abstract geometric shapes) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute border border-accent/20 bg-accent/5 backdrop-blur-sm"
          style={{
            width: Math.random() * 60 + 20,
            height: Math.random() * 60 + 20,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
          }}
          animate={{
            rotate: [null, Math.random() * 360 + 180],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* AI Pulse Centers */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full bg-accent/10"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(DataFlowBackground);
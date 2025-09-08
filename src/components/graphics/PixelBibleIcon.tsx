import React from "react";
import { motion } from "framer-motion";

interface PixelBibleIconProps {
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

const PixelBibleIcon: React.FC<PixelBibleIconProps> = ({
  size = 80,
  animated = true,
  glowing = true,
  className = ""
}) => {
  return (
    <motion.div
      className={`relative mx-auto ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {animated && (
        <motion.div
          className="relative"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glowing effect background */}
          {glowing && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.2) 50%, transparent 70%)',
                filter: 'blur(8px)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Bible icon */}
          <motion.img
            src="/glowing-bible-icon.png"
            alt="Glowing Bible"
            className="relative z-10 w-full h-full object-contain pixelated"
            animate={glowing ? {
              filter: [
                'brightness(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
                'brightness(1.1) drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))',
                'brightness(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))'
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Light rays emanating from Bible */}
          {glowing && (
            <motion.div
              className="absolute inset-0"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-400/30 to-transparent"
                  style={{
                    height: `${size * 0.75}px`,
                    left: '50%',
                    top: `-${size * 0.375}px`,
                    transformOrigin: `50% ${size * 0.75}px`,
                    transform: `translateX(-50%) rotate(${i * 45}deg)`
                  }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scaleY: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
      
      {!animated && (
        <img
          src="/glowing-bible-icon.png"
          alt="Bible"
          className={`w-full h-full object-contain pixelated ${glowing ? 'bible-glow' : ''}`}
        />
      )}
    </motion.div>
  );
};

export default PixelBibleIcon;
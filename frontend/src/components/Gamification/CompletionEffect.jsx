import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const generateParticles = (count = 40) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1,
    rotation: Math.random() * 360,
  }));
};

const CompletionEffect = ({ active }) => {
  const particlesRef = useRef(generateParticles());

  useEffect(() => {
    if (active) {
      particlesRef.current = generateParticles();
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="completion-effect-overlay" aria-hidden="true">
          {particlesRef.current.map((p) => (
            <motion.div
              key={p.id}
              className="confetti-particle"
              initial={{
                x: `${p.x}vw`,
                y: '-10px',
                opacity: 1,
                rotate: 0,
                scale: 1,
              }}
              animate={{
                y: '110vh',
                opacity: 0,
                rotate: p.rotation,
                scale: 0.3,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            />
          ))}

          <motion.div
            className="completion-message"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            <span className="completion-icon">✅</span>
            <span className="completion-text">Tarefa concluída!</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompletionEffect;

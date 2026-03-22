import React from 'react';
import { motion } from 'framer-motion';
import { useAuth, getLevelInfo } from '../../contexts/AuthContext.jsx';

const XPBar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const levelInfo = getLevelInfo(user.xp || 0);

  return (
    <div className="xp-bar-wrapper">
      <div className="xp-bar-info">
        <span className="xp-level-badge">{levelInfo.label}</span>
        <span className="xp-amount">{user.xp} XP</span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {levelInfo.next && (
        <span className="xp-next">Próximo: {levelInfo.next} XP</span>
      )}
    </div>
  );
};

export default XPBar;

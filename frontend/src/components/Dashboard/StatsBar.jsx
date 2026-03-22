import React from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ '--stat-color': color }}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </motion.div>
);

const StatsBar = () => {
  const { getStats } = useTasks();
  const { user } = useAuth();
  const stats = getStats();

  return (
    <div className="stats-bar">
      <StatCard
        icon="📋"
        label="Total de tarefas"
        value={stats.total}
        color="#7c3aed"
        delay={0}
      />
      <StatCard
        icon="✅"
        label="Concluídas hoje"
        value={stats.completedToday}
        color="#10b981"
        delay={0.05}
      />
      <StatCard
        icon="⏳"
        label="Pendentes"
        value={stats.totalPending}
        color="#f59e0b"
        delay={0.1}
      />
      <StatCard
        icon="🔥"
        label="Streak"
        value={`${user?.streak || 0} dias`}
        color="#ef4444"
        delay={0.15}
      />
      <StatCard
        icon="⚡"
        label="XP Total"
        value={user?.xp || 0}
        color="#06b6d4"
        delay={0.2}
      />
    </div>
  );
};

export default StatsBar;

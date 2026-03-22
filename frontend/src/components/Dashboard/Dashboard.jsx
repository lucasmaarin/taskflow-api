import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Layout/Navbar.jsx';
import Sidebar from '../Layout/Sidebar.jsx';
import StatsBar from './StatsBar.jsx';
import TaskBoard from '../Tasks/TaskBoard.jsx';
import TaskFilters from '../Tasks/TaskFilters.jsx';
import AIPanel from '../AI/AIPanel.jsx';
import CompletionEffect from '../Gamification/CompletionEffect.jsx';
import { useTasks } from '../../contexts/TaskContext.jsx';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [aiPanelOpen, setAiPanelOpen] = useState(window.innerWidth >= 1280);
  const { completionEffect } = useTasks();

  return (
    <div className="dashboard-layout">
      <Navbar
        onMenuToggle={() => setSidebarOpen((p) => !p)}
        sidebarOpen={sidebarOpen}
      />

      <div className="dashboard-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <motion.main
          className={`dashboard-main ${sidebarOpen ? 'sidebar-pushed' : ''} ${aiPanelOpen ? 'ai-pushed' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StatsBar />
          <TaskFilters />
          <TaskBoard />
        </motion.main>

        <aside className={`ai-sidebar ${aiPanelOpen ? 'ai-sidebar-open' : ''}`}>
          <button
            className="ai-sidebar-toggle"
            onClick={() => setAiPanelOpen((p) => !p)}
            title={aiPanelOpen ? 'Fechar IA' : 'Abrir Assistente IA'}
          >
            {aiPanelOpen ? '→' : '🤖'}
          </button>
          {aiPanelOpen && <AIPanel />}
        </aside>
      </div>

      <CompletionEffect active={completionEffect} />
    </div>
  );
};

export default Dashboard;

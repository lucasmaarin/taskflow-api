import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import { useTasks } from '../../contexts/TaskContext.jsx';
import ProjectModal from '../Projects/ProjectModal.jsx';

const Sidebar = ({ open, onClose }) => {
  const { projects, loading } = useProjects();
  const { filters, applyFilters } = useTasks();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleProjectClick = (projectId) => {
    const same = filters.projectId === projectId;
    applyFilters({ ...filters, projectId: same ? null : projectId });
    if (window.innerWidth < 768) onClose();
  };

  const handleAllClick = () => {
    applyFilters({ projectId: null, priority: null, status: null });
    if (window.innerWidth < 768) onClose();
  };

  const handleEditProject = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowProjectModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${open ? 'sidebar-open' : ''}`}
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">Projetos</h2>
          <button
            className="sidebar-add-btn"
            onClick={() => {
              setEditingProject(null);
              setShowProjectModal(true);
            }}
            title="Novo projeto"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${!filters.projectId ? 'active' : ''}`}
            onClick={handleAllClick}
          >
            <span className="nav-item-emoji">🏠</span>
            <span className="nav-item-label">Todas as tarefas</span>
          </button>

          <div className="sidebar-section-label">Meus Projetos</div>

          {loading ? (
            <div className="sidebar-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" />
              ))}
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`sidebar-nav-item sidebar-project-item ${
                  filters.projectId === project.id ? 'active' : ''
                }`}
                onClick={() => handleProjectClick(project.id)}
              >
                <span
                  className="project-dot"
                  style={{ backgroundColor: project.color }}
                />
                <span className="nav-item-emoji">{project.emoji}</span>
                <span className="nav-item-label">{project.name}</span>
                <button
                  className="project-edit-btn"
                  onClick={(e) => handleEditProject(e, project)}
                  title="Editar projeto"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-filter-section">
            <div className="sidebar-section-label">Filtrar por status</div>
            {['pending', 'completed'].map((s) => (
              <button
                key={s}
                className={`sidebar-nav-item ${filters.status === s ? 'active' : ''}`}
                onClick={() => {
                  applyFilters({ ...filters, status: filters.status === s ? null : s });
                }}
              >
                <span className="nav-item-emoji">{s === 'pending' ? '⏳' : '✅'}</span>
                <span className="nav-item-label">
                  {s === 'pending' ? 'Pendentes' : 'Concluídas'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.aside>

      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;

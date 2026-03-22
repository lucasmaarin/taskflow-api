import React from 'react';
import { useTasks } from '../../contexts/TaskContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';

const PRIORITIES = [
  { value: 1, label: 'P1 Urgente', color: '#ef4444' },
  { value: 2, label: 'P2 Alta', color: '#f59e0b' },
  { value: 3, label: 'P3 Média', color: '#3b82f6' },
  { value: 4, label: 'P4 Baixa', color: '#6b7280' },
];

const TaskFilters = () => {
  const { filters, applyFilters } = useTasks();
  const { projects } = useProjects();

  const handlePriority = (p) => {
    applyFilters({ ...filters, priority: filters.priority === p ? null : p });
  };

  const handleProject = (pid) => {
    applyFilters({ ...filters, projectId: filters.projectId === pid ? null : pid });
  };

  const handleStatus = (s) => {
    applyFilters({ ...filters, status: filters.status === s ? null : s });
  };

  const clearAll = () => {
    applyFilters({ projectId: null, priority: null, status: null });
  };

  const hasFilters = filters.projectId || filters.priority || filters.status;

  return (
    <div className="task-filters">
      <div className="filters-row">
        <div className="filter-group">
          <span className="filter-label">Prioridade</span>
          <div className="filter-chips">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                className={`filter-chip priority-chip ${filters.priority === p.value ? 'active' : ''}`}
                style={{ '--chip-color': p.color }}
                onClick={() => handlePriority(p.value)}
              >
                <span className="chip-dot" style={{ backgroundColor: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Status</span>
          <div className="filter-chips">
            <button
              className={`filter-chip ${filters.status === 'pending' ? 'active' : ''}`}
              onClick={() => handleStatus('pending')}
            >
              ⏳ Pendentes
            </button>
            <button
              className={`filter-chip ${filters.status === 'completed' ? 'active' : ''}`}
              onClick={() => handleStatus('completed')}
            >
              ✅ Concluídas
            </button>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">Projeto</span>
            <div className="filter-chips">
              {projects.map((p) => (
                <button
                  key={p.id}
                  className={`filter-chip ${filters.projectId === p.id ? 'active' : ''}`}
                  style={{ '--chip-color': p.color }}
                  onClick={() => handleProject(p.id)}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <button className="filter-clear-btn" onClick={clearAll}>
            Limpar filtros ×
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;

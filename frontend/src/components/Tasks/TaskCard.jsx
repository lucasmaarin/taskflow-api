import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks } from '../../contexts/TaskContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';

const PRIORITY_CONFIG = {
  1: { label: 'Urgente', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  2: { label: 'Alta', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  3: { label: 'Média', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  4: { label: 'Baixa', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const TaskCard = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTasks();
  const { getProjectById } = useProjects();
  const [deleting, setDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const project = task.projectId ? getProjectById(task.projectId) : null;

  const isDueOverdue =
    !task.completed && task.dueDate && isPast(parseISO(task.dueDate));

  const handleToggle = async (e) => {
    e.stopPropagation();
    await updateTask(task.id, { completed: !task.completed });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    await deleteTask(task.id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.completed ? 'task-completed' : ''} ${isDragging ? 'task-dragging' : ''}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Priority stripe */}
      <div
        className="task-priority-stripe"
        style={{ backgroundColor: priority.color }}
      />

      <div className="task-card-body">
        {/* Drag handle */}
        <div className="task-drag-handle" {...attributes} {...listeners}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        {/* Checkbox */}
        <button
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={handleToggle}
          aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        >
          {task.completed && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="task-content" onClick={() => onEdit(task)}>
          <p className={`task-title ${task.completed ? 'task-title-done' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span
              className="task-priority-badge"
              style={{ color: priority.color, backgroundColor: priority.bg }}
            >
              P{task.priority} {priority.label}
            </span>

            {project && (
              <span
                className="task-project-badge"
                style={{ color: project.color, borderColor: project.color + '40' }}
              >
                {project.emoji} {project.name}
              </span>
            )}

            {task.dueDate && (
              <span className={`task-due-date ${isDueOverdue ? 'overdue' : ''}`}>
                📅{' '}
                {format(parseISO(task.dueDate), 'dd MMM', { locale: ptBR })}
                {isDueOverdue && ' (atrasada)'}
              </span>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map((tag) => (
                  <span key={tag} className="task-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="task-actions">
          <button
            className="task-action-btn edit-btn"
            onClick={() => onEdit(task)}
            title="Editar"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
            </svg>
          </button>
          <button
            className="task-action-btn delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            title="Remover"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;

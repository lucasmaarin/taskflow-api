import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTasks } from '../../contexts/TaskContext.jsx';
import { useProjects } from '../../contexts/ProjectContext.jsx';
import useAI from '../../hooks/useAI.js';

const PRIORITIES = [
  { value: 1, label: 'P1 — Urgente', color: '#ef4444' },
  { value: 2, label: 'P2 — Alta', color: '#f59e0b' },
  { value: 3, label: 'P3 — Média', color: '#3b82f6' },
  { value: 4, label: 'P4 — Baixa', color: '#6b7280' },
];

const TaskModal = ({ task, onClose }) => {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 3);
  const [projectId, setProjectId] = useState(task?.projectId || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split('T')[0] : ''
  );
  const [tags, setTags] = useState((task?.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const { createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const { suggestPriority, loadingPriority } = useAI();

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAISuggest = async () => {
    const result = await suggestPriority({ title, description, dueDate });
    if (result) {
      setPriority(result.priority);
      setAiReasoning(result.reasoning);
      toast.success(`IA sugere P${result.priority}!`, { duration: 2000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);
    const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      projectId: projectId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags: tagsArray,
    };

    try {
      if (isEditing) {
        await updateTask(task.id, payload);
        toast.success('Tarefa atualizada!');
      } else {
        await createTask(payload);
      }
      onClose();
    } catch {
      // toast already shown in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="modal-header">
            <h2 className="modal-title">
              {isEditing ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}
            </h2>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Título <span className="required">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="O que precisa ser feito?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">
                Descrição
              </label>
              <textarea
                id="task-desc"
                className="form-input form-textarea"
                placeholder="Detalhes opcionais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group form-group-half">
                <div className="form-label-row">
                  <label className="form-label">Prioridade</label>
                  <button
                    type="button"
                    className="ai-suggest-btn"
                    onClick={handleAISuggest}
                    disabled={loadingPriority || !title}
                    title="Sugerir prioridade com IA"
                  >
                    {loadingPriority ? (
                      <span className="loading-spinner-sm" />
                    ) : (
                      '🤖'
                    )}
                    {loadingPriority ? 'Analisando...' : 'IA Sugerir'}
                  </button>
                </div>

                <div className="priority-selector">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`priority-option ${priority === p.value ? 'selected' : ''}`}
                      style={{ '--p-color': p.color }}
                      onClick={() => { setPriority(p.value); setAiReasoning(''); }}
                    >
                      <span className="priority-dot" style={{ backgroundColor: p.color }} />
                      {p.label}
                    </button>
                  ))}
                </div>

                {aiReasoning && (
                  <motion.p
                    className="ai-reasoning"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    🤖 {aiReasoning}
                  </motion.p>
                )}
              </div>

              <div className="form-group form-group-half">
                <label className="form-label" htmlFor="task-project">
                  Projeto
                </label>
                <select
                  id="task-project"
                  className="form-input form-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Sem projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label" htmlFor="task-due">
                  Data limite
                </label>
                <input
                  id="task-due"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group form-group-half">
                <label className="form-label" htmlFor="task-tags">
                  Tags (separadas por vírgula)
                </label>
                <input
                  id="task-tags"
                  type="text"
                  className="form-input"
                  placeholder="ex: urgente, cliente, dev"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !title.trim()}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm" />
                    Salvando...
                  </span>
                ) : isEditing ? (
                  'Salvar alterações'
                ) : (
                  'Criar tarefa'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;

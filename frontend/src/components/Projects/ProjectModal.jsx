import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProjects } from '../../contexts/ProjectContext.jsx';

const PRESET_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899',
  '#14b8a6', '#f97316',
];

const PRESET_EMOJIS = [
  '📱', '💰', '🚀', '📁', '🎯', '💡', '🔥', '⚡',
  '🌟', '🎮', '💼', '🏆', '🌱', '🔬', '🎨', '🛒',
];

const ProjectModal = ({ project, onClose }) => {
  const isEditing = !!project;
  const [name, setName] = useState(project?.name || '');
  const [color, setColor] = useState(project?.color || '#7c3aed');
  const [emoji, setEmoji] = useState(project?.emoji || '📁');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { createProject, updateProject, deleteProject } = useProjects();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateProject(project.id, { name: name.trim(), color, emoji });
      } else {
        await createProject({ name: name.trim(), color, emoji });
      }
      onClose();
    } catch {
      // toast already shown
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remover o projeto "${project.name}"? As tarefas serão desvinculadas.`)) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      onClose();
    } catch {
      // toast already shown
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-container modal-sm"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          <div className="modal-header">
            <h2 className="modal-title">
              {isEditing ? '✏️ Editar Projeto' : '📁 Novo Projeto'}
            </h2>
            <button className="modal-close" onClick={onClose}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            {/* Preview */}
            <div className="project-preview">
              <div
                className="project-preview-icon"
                style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
              >
                <span>{emoji}</span>
              </div>
              <span className="project-preview-name">{name || 'Nome do projeto'}</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-name">
                Nome
              </label>
              <input
                id="project-name"
                type="text"
                className="form-input"
                placeholder="Ex: Meu Projeto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emoji</label>
              <div className="emoji-grid">
                {PRESET_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cor</label>
              <div className="color-grid">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-btn ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={c}
                  >
                    {color === c && (
                      <svg viewBox="0 0 20 20" fill="white" width="12" height="12">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              {isEditing && !project.isDefault && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting ? 'Removendo...' : 'Remover'}
                </button>
              )}
              <div className="modal-footer-right">
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
                  disabled={saving || !name.trim()}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar projeto'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectModal;

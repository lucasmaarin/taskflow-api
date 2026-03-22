import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useTasks } from '../../contexts/TaskContext.jsx';
import TaskCard from './TaskCard.jsx';
import TaskModal from './TaskModal.jsx';

const TaskBoard = () => {
  const { getFilteredTasks, reorderTasks, loading } = useTasks();
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const filteredTasks = getFilteredTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const taskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);
  const activeTask = activeId ? filteredTasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
    const newIndex = filteredTasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredTasks, oldIndex, newIndex);
    await reorderTasks(reordered.map((t) => t.id));
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="task-board-loading">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="task-board">
      <div className="task-board-header">
        <h2 className="task-board-title">
          Tarefas
          <span className="task-count-badge">{filteredTasks.length}</span>
        </h2>
        <motion.button
          className="btn btn-primary btn-sm"
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          whileTap={{ scale: 0.97 }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Nova Tarefa
        </motion.button>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div
          className="task-empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="empty-icon">📭</span>
          <p className="empty-title">Nenhuma tarefa encontrada</p>
          <p className="empty-subtitle">Crie sua primeira tarefa ou ajuste os filtros</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setEditingTask(null); setShowModal(true); }}
          >
            Criar tarefa
          </button>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="task-list">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTask && (
              <div className="task-drag-preview">
                <TaskCard task={activeTask} onEdit={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <AnimatePresence>
        {showModal && (
          <TaskModal task={editingTask} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;

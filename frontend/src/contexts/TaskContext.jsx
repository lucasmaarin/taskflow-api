import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ projectId: null, priority: null, status: null });
  const [completionEffect, setCompletionEffect] = useState(false);
  const { updateUserXP } = useAuth();
  const effectTimeout = useRef(null);

  const fetchTasks = useCallback(async (overrideFilters) => {
    try {
      setLoading(true);
      const params = overrideFilters || filters;
      const query = Object.entries(params)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

      const res = await api.get(`/tasks${query ? `?${query}` : ''}`);
      setTasks(res.data);
    } catch (err) {
      toast.error('Falha ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const triggerCompletionEffect = () => {
    setCompletionEffect(true);
    if (effectTimeout.current) clearTimeout(effectTimeout.current);
    effectTimeout.current = setTimeout(() => setCompletionEffect(false), 2500);
  };

  const createTask = async (data) => {
    try {
      const res = await api.post('/tasks', data);
      setTasks((prev) => [...prev, res.data]);
      toast.success('Tarefa criada!');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao criar tarefa';
      toast.error(msg);
      throw err;
    }
  };

  const updateTask = async (id, data) => {
    const originalTasks = tasks;
    try {
      // Optimistic update
      if (data.completed !== undefined) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data, completedAt: data.completed ? new Date().toISOString() : null } : t))
        );
      }

      const res = await api.put(`/tasks/${id}`, data);
      const { task, xpGained, newBadges } = res.data;

      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));

      if (data.completed === true) {
        triggerCompletionEffect();
        if (xpGained > 0) {
          updateUserXP(xpGained, newBadges);
          toast.success(`+${xpGained} XP ganhos! 🎯`, { duration: 2000 });
        }
        if (newBadges && newBadges.length > 0) {
          newBadges.forEach((b) => {
            setTimeout(() => {
              toast(`${b.emoji} Badge desbloqueada: ${b.label}!`, {
                duration: 4000,
                style: {
                  background: '#7c3aed',
                  color: '#fff',
                  border: '1px solid #9f5ef5',
                },
              });
            }, 500);
          });
        }
      }

      return task;
    } catch (err) {
      setTasks(originalTasks);
      const msg = err.response?.data?.error || 'Falha ao atualizar tarefa';
      toast.error(msg);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    const original = tasks.find((t) => t.id === id);
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await api.delete(`/tasks/${id}`);
      toast.success('Tarefa removida');
    } catch (err) {
      if (original) setTasks((prev) => [...prev, original]);
      toast.error('Falha ao remover tarefa');
    }
  };

  const reorderTasks = async (orderedIds) => {
    const original = [...tasks];
    try {
      // Optimistic reorder
      const newOrder = orderedIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean);
      setTasks(newOrder);
      await api.post('/tasks/reorder', { orderedIds });
    } catch (err) {
      setTasks(original);
      toast.error('Falha ao reordenar tarefas');
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const getFilteredTasks = () => {
    return tasks.filter((t) => {
      if (filters.projectId && t.projectId !== filters.projectId) return false;
      if (filters.priority && t.priority !== parseInt(filters.priority)) return false;
      if (filters.status === 'completed' && !t.completed) return false;
      if (filters.status === 'pending' && t.completed) return false;
      return true;
    });
  };

  const getStats = () => {
    const today = new Date().toDateString();
    const completedToday = tasks.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;
    const totalPending = tasks.filter((t) => !t.completed).length;
    const totalCompleted = tasks.filter((t) => t.completed).length;

    return { completedToday, totalPending, totalCompleted, total: tasks.length };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        filters,
        completionEffect,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        reorderTasks,
        applyFilters,
        getFilteredTasks,
        getStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

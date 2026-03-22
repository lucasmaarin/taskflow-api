import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const ProjectContext = createContext(null);

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Falha ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data) => {
    try {
      const res = await api.post('/projects', data);
      setProjects((prev) => [...prev, res.data]);
      toast.success(`Projeto "${res.data.name}" criado!`);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao criar projeto';
      toast.error(msg);
      throw err;
    }
  };

  const updateProject = async (id, data) => {
    try {
      const res = await api.put(`/projects/${id}`, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      toast.success('Projeto atualizado!');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao atualizar projeto';
      toast.error(msg);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    const project = projects.find((p) => p.id === id);
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await api.delete(`/projects/${id}`);
      toast.success(`Projeto "${project?.name}" removido`);
    } catch (err) {
      // Rollback
      if (project) setProjects((prev) => [...prev, project]);
      toast.error('Falha ao remover projeto');
    }
  };

  const getProjectById = (id) => projects.find((p) => p.id === id) || null;

  return (
    <ProjectContext.Provider
      value={{ projects, loading, fetchProjects, createProject, updateProject, deleteProject, getProjectById }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

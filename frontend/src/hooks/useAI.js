import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const useAI = () => {
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const suggestPriority = async ({ title, description, dueDate }) => {
    if (!title) {
      toast.error('Digite o título da tarefa primeiro');
      return null;
    }

    setLoadingPriority(true);
    try {
      const res = await api.post('/ai/suggest-priority', { title, description, dueDate });
      return res.data; // { priority, reasoning }
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao sugerir prioridade';
      toast.error(msg);
      return null;
    } finally {
      setLoadingPriority(false);
    }
  };

  const generateWeeklyReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.post('/ai/weekly-report');
      return res.data; // { report, stats }
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao gerar relatório';
      toast.error(msg);
      return null;
    } finally {
      setLoadingReport(false);
    }
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await api.post('/ai/summary');
      return res.data; // { summary }
    } catch (err) {
      const msg = err.response?.data?.error || 'Falha ao gerar resumo';
      toast.error(msg);
      return null;
    } finally {
      setLoadingSummary(false);
    }
  };

  return {
    suggestPriority,
    generateWeeklyReport,
    generateSummary,
    loadingPriority,
    loadingReport,
    loadingSummary,
  };
};

export default useAI;

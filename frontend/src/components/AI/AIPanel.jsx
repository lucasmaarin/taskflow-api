import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAI from '../../hooks/useAI.js';

const AIPanel = () => {
  const { generateWeeklyReport, generateSummary, loadingReport, loadingSummary } = useAI();
  const [summary, setSummary] = useState('');
  const [report, setReport] = useState('');
  const [reportStats, setReportStats] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const handleSummary = async () => {
    const result = await generateSummary();
    if (result) setSummary(result.summary);
  };

  const handleReport = async () => {
    const result = await generateWeeklyReport();
    if (result) {
      setReport(result.report);
      setReportStats(result.stats);
      setActiveTab('report');
    }
  };

  const renderMarkdown = (text) => {
    // Simple markdown rendering
    return text
      .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
      .replace(/(<li.*<\/li>)/gs, '<ul class="md-ul">$1</ul>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-icon">🤖</span>
          <span>Assistente IA</span>
        </div>
        <div className="ai-panel-tabs">
          <button
            className={`ai-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Resumo
          </button>
          <button
            className={`ai-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Relatório
          </button>
        </div>
      </div>

      <div className="ai-panel-body">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="ai-panel-description">
                Obtenha um resumo inteligente das suas tarefas pendentes e saiba onde focar.
              </p>

              <motion.button
                className="btn btn-ai btn-full"
                onClick={handleSummary}
                disabled={loadingSummary}
                whileTap={{ scale: 0.97 }}
              >
                {loadingSummary ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm" />
                    Analisando tarefas...
                  </span>
                ) : (
                  <>✨ Gerar Resumo</>
                )}
              </motion.button>

              {summary && (
                <motion.div
                  className="ai-result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="ai-result-text">{summary}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="ai-panel-description">
                Relatório semanal com análise de desempenho, conquistas e recomendações.
              </p>

              {reportStats && (
                <div className="report-stats-mini">
                  <div className="report-stat">
                    <span className="report-stat-value">{reportStats.completed}</span>
                    <span className="report-stat-label">Concluídas</span>
                  </div>
                  <div className="report-stat">
                    <span className="report-stat-value">{reportStats.pending}</span>
                    <span className="report-stat-label">Pendentes</span>
                  </div>
                  <div className="report-stat">
                    <span className="report-stat-value">{reportStats.completionRate}%</span>
                    <span className="report-stat-label">Taxa</span>
                  </div>
                </div>
              )}

              <motion.button
                className="btn btn-ai btn-full"
                onClick={handleReport}
                disabled={loadingReport}
                whileTap={{ scale: 0.97 }}
              >
                {loadingReport ? (
                  <span className="btn-loading">
                    <span className="loading-spinner-sm" />
                    Gerando relatório...
                  </span>
                ) : (
                  <>📊 Gerar Relatório Semanal</>
                )}
              </motion.button>

              {report && (
                <motion.div
                  className="ai-result ai-report"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="ai-report-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPanel;

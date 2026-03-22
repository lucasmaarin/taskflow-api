import { validationResult } from 'express-validator';
import openai from '../config/openai.js';
import { db } from '../config/firebase.js';

export const suggestPriority = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, dueDate } = req.body;

  const today = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  const daysUntilDue = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : null;

  const prompt = `You are a productivity assistant. Analyze this task and suggest an appropriate priority level.

Task: "${title}"
${description ? `Description: "${description}"` : ''}
${daysUntilDue !== null ? `Due in: ${daysUntilDue} days` : 'No due date'}

Priority scale:
- 1 (Urgente/Critical): Deadline today/tomorrow, blocking other work, or severe consequences
- 2 (Alta/High): Due within 3 days, important but not blocking
- 3 (Média/Medium): Due within a week, normal importance
- 4 (Baixa/Low): No deadline or far future, low impact

Respond with JSON only in this exact format:
{"priority": <1-4>, "reasoning": "<brief explanation in Portuguese, max 2 sentences>"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (!parsed.priority || parsed.priority < 1 || parsed.priority > 4) {
      return res.status(500).json({ error: 'AI returned invalid priority.' });
    }

    return res.json({
      priority: parsed.priority,
      reasoning: parsed.reasoning || 'Prioridade sugerida com base no contexto da tarefa.',
    });
  } catch (err) {
    console.error('[SuggestPriority]', err);
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({ error: 'OpenAI quota exceeded. Please check your API key.' });
    }
    return res.status(500).json({ error: 'AI service unavailable.' });
  }
};

export const generateWeeklyReport = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Fetch tasks from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const snapshot = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .where('createdAt', '>=', sevenDaysAgo)
      .get();

    const tasks = snapshot.docs.map((doc) => doc.data());

    const completed = tasks.filter((t) => t.completed);
    const pending = tasks.filter((t) => !t.completed);

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const taskSummary = {
      total: tasks.length,
      completed: completed.length,
      pending: pending.length,
      completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
      byPriority: {
        urgent: tasks.filter((t) => t.priority === 1).length,
        high: tasks.filter((t) => t.priority === 2).length,
        medium: tasks.filter((t) => t.priority === 3).length,
        low: tasks.filter((t) => t.priority === 4).length,
      },
    };

    const completedTitles = completed.slice(0, 10).map((t) => `- ${t.title}`).join('\n');
    const pendingTitles = pending.slice(0, 10).map((t) => `- ${t.title} (P${t.priority})`).join('\n');

    const prompt = `You are a productivity coach. Generate a weekly performance report in Portuguese (Brazil) for a user based on their task data.

STATISTICS:
- Total tasks this week: ${taskSummary.total}
- Completed: ${taskSummary.completed} (${taskSummary.completionRate}% completion rate)
- Pending: ${taskSummary.pending}
- Urgent tasks: ${taskSummary.byPriority.urgent}
- High priority: ${taskSummary.byPriority.high}
- XP total: ${userData?.xp || 0}
- Current streak: ${userData?.streak || 0} days
- Level: ${userData?.level || 'Iniciante'}

COMPLETED TASKS:
${completedTitles || '(nenhuma tarefa concluída)'}

PENDING TASKS:
${pendingTitles || '(nenhuma tarefa pendente)'}

Write a markdown report with:
1. A brief performance summary (encouraging tone)
2. Key achievements
3. Areas for improvement
4. 3 specific recommendations for next week
Keep it concise and actionable. Use markdown headers, bullet points and emojis where appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const report = completion.choices[0].message.content;

    return res.json({ report, stats: taskSummary });
  } catch (err) {
    console.error('[GenerateWeeklyReport]', err);
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({ error: 'OpenAI quota exceeded.' });
    }
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .where('completed', '==', false)
      .orderBy('priority', 'asc')
      .limit(20)
      .get();

    const tasks = snapshot.docs.map((doc) => doc.data());

    if (tasks.length === 0) {
      return res.json({
        summary: '🎉 Parabéns! Você não tem tarefas pendentes. Aproveite para planejar suas próximas metas!',
      });
    }

    const taskList = tasks
      .map((t) => `- [P${t.priority}] ${t.title}${t.dueDate ? ` (vence: ${t.dueDate.split('T')[0]})` : ''}`)
      .join('\n');

    const prompt = `You are a productivity assistant. Summarize the following pending tasks in Portuguese (Brazil) in 2-3 sentences. Identify the most critical ones and suggest what to focus on first. Be concise and direct.

PENDING TASKS:
${taskList}

Respond with a brief, motivating summary:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });

    return res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error('[GenerateSummary]', err);
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({ error: 'OpenAI quota exceeded.' });
    }
    return res.status(500).json({ error: 'Failed to generate summary.' });
  }
};

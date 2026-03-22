import { validationResult } from 'express-validator';
import { db } from '../config/firebase.js';

const LEVEL_THRESHOLDS = [
  { min: 0, max: 99, label: 'Iniciante' },
  { min: 100, max: 299, label: 'Explorador' },
  { min: 300, max: 599, label: 'Guerreiro' },
  { min: 600, max: Infinity, label: 'Mestre' },
];

const getLevel = (xp) => {
  for (const tier of LEVEL_THRESHOLDS) {
    if (xp >= tier.min && xp <= tier.max) return tier.label;
  }
  return 'Mestre';
};

const checkAndAwardBadges = (userData, tasksCompleted) => {
  const badges = [...(userData.badges || [])];
  const newBadges = [];

  const award = (id, label, emoji) => {
    if (!badges.find((b) => b.id === id)) {
      const badge = { id, label, emoji, awardedAt: new Date().toISOString() };
      badges.push(badge);
      newBadges.push(badge);
    }
  };

  if (tasksCompleted >= 1) award('first_task', 'Primeira Tarefa', '🎯');
  if (tasksCompleted >= 10) award('ten_tasks', '10 Tarefas', '🔥');
  if (tasksCompleted >= 50) award('fifty_tasks', '50 Tarefas', '⚡');
  if (tasksCompleted >= 100) award('hundred_tasks', '100 Tarefas', '👑');
  if ((userData.streak || 0) >= 7) award('streak_7', 'Streak 7 dias', '📅');
  if ((userData.streak || 0) >= 30) award('streak_30', 'Streak 30 dias', '🏆');

  return { badges, newBadges };
};

export const getAllTasks = async (req, res) => {
  try {
    const { projectId, priority, status } = req.query;

    // Busca apenas por userId (índice simples — não requer índice composto)
    // Filtros adicionais e ordenação são feitos em memória
    const snapshot = await db
      .collection('tasks')
      .where('userId', '==', req.user.uid)
      .get();

    let tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (projectId) tasks = tasks.filter((t) => t.projectId === projectId);
    if (priority) tasks = tasks.filter((t) => t.priority === parseInt(priority));
    if (status === 'completed') tasks = tasks.filter((t) => t.completed === true);
    if (status === 'pending') tasks = tasks.filter((t) => t.completed === false);

    tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return res.json(tasks);
  } catch (err) {
    console.error('[GetAllTasks]', err);
    return res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

export const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, priority, projectId, dueDate, tags } = req.body;

  try {
    // Calcula próximo order em memória (sem orderBy composto)
    const existing = await db
      .collection('tasks')
      .where('userId', '==', req.user.uid)
      .get();

    const maxOrder = existing.empty
      ? 0
      : Math.max(...existing.docs.map((d) => d.data().order ?? 0)) + 1;
    const now = new Date().toISOString();

    const taskData = {
      userId: req.user.uid,
      title,
      description: description || '',
      priority: priority || 3,
      projectId: projectId || null,
      dueDate: dueDate || null,
      tags: tags || [],
      completed: false,
      completedAt: null,
      order: maxOrder,
      createdAt: now,
      updatedAt: now,
    };

    const taskRef = await db.collection('tasks').add(taskData);

    return res.status(201).json({ id: taskRef.id, ...taskData });
  } catch (err) {
    console.error('[CreateTask]', err);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
};

export const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;

  try {
    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const taskData = taskDoc.data();
    if (taskData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { title, description, priority, projectId, dueDate, tags, completed } = req.body;
    const now = new Date().toISOString();

    const updates = { updatedAt: now };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (projectId !== undefined) updates.projectId = projectId;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (tags !== undefined) updates.tags = tags;

    let newBadges = [];
    let xpGained = 0;

    // Handle completion toggle
    if (completed !== undefined && completed !== taskData.completed) {
      updates.completed = completed;
      updates.completedAt = completed ? now : null;

      if (completed) {
        // Award XP
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        const today = new Date().toDateString();
        const lastCompleted = userData.lastCompletedDate
          ? new Date(userData.lastCompletedDate).toDateString()
          : null;

        let streak = userData.streak || 0;
        let streakBonus = 0;

        if (lastCompleted === today) {
          // Same day, no streak change
        } else if (lastCompleted === new Date(Date.now() - 86400000).toDateString()) {
          // Yesterday — extend streak
          streak += 1;
          streakBonus = 5;
        } else {
          // Streak broken
          streak = 1;
        }

        xpGained = 10 + streakBonus;
        const newXP = (userData.xp || 0) + xpGained;
        const tasksCompleted = (userData.tasksCompleted || 0) + 1;
        const { badges, newBadges: awarded } = checkAndAwardBadges(userData, tasksCompleted);
        newBadges = awarded;

        await userRef.update({
          xp: newXP,
          level: getLevel(newXP),
          streak,
          lastCompletedDate: now,
          tasksCompleted,
          badges,
          updatedAt: now,
        });
      }
    }

    await taskRef.update(updates);

    const updatedDoc = await taskRef.get();
    return res.json({
      task: { id: updatedDoc.id, ...updatedDoc.data() },
      xpGained,
      newBadges,
    });
  } catch (err) {
    console.error('[UpdateTask]', err);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const taskRef = db.collection('tasks').doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (taskDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await taskRef.delete();
    return res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('[DeleteTask]', err);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};

export const reorderTasks = async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: 'orderedIds must be a non-empty array.' });
  }

  try {
    const batch = db.batch();

    orderedIds.forEach((id, index) => {
      const ref = db.collection('tasks').doc(id);
      batch.update(ref, { order: index, updatedAt: new Date().toISOString() });
    });

    await batch.commit();
    return res.json({ message: 'Tasks reordered successfully.' });
  } catch (err) {
    console.error('[ReorderTasks]', err);
    return res.status(500).json({ error: 'Failed to reorder tasks.' });
  }
};

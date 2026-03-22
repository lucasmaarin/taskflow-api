import { validationResult } from 'express-validator';
import { db } from '../config/firebase.js';

export const getAllProjects = async (req, res) => {
  try {
    const snapshot = await db
      .collection('projects')
      .where('userId', '==', req.user.uid)
      .get();

    const projects = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    return res.json(projects);
  } catch (err) {
    console.error('[GetAllProjects]', err);
    return res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, color, emoji } = req.body;

  try {
    const now = new Date().toISOString();
    const projectData = {
      userId: req.user.uid,
      name,
      color: color || '#7c3aed',
      emoji: emoji || '📁',
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection('projects').add(projectData);
    return res.status(201).json({ id: ref.id, ...projectData });
  } catch (err) {
    console.error('[CreateProject]', err);
    return res.status(500).json({ error: 'Failed to create project.' });
  }
};

export const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { id } = req.params;

  try {
    const ref = db.collection('projects').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { name, color, emoji } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (emoji !== undefined) updates.emoji = emoji;

    await ref.update(updates);
    const updated = await ref.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('[UpdateProject]', err);
    return res.status(500).json({ error: 'Failed to update project.' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const ref = db.collection('projects').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Disassociate tasks from deleted project
    const taskSnapshot = await db
      .collection('tasks')
      .where('userId', '==', req.user.uid)
      .where('projectId', '==', id)
      .get();

    const batch = db.batch();
    taskSnapshot.docs.forEach((taskDoc) => {
      batch.update(taskDoc.ref, { projectId: null });
    });
    batch.delete(ref);
    await batch.commit();

    return res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('[DeleteProject]', err);
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
};

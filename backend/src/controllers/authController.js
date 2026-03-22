import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { db } from '../config/firebase.js';

const DEFAULT_PROJECTS = [
  { name: 'Mobile Mercado', color: '#06b6d4', emoji: '📱', isDefault: true },
  { name: 'Cripto Moeda', color: '#f59e0b', emoji: '💰', isDefault: true },
  { name: 'Projetos Pessoais', color: '#7c3aed', emoji: '🚀', isDefault: true },
];

const generateToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const seedDefaultProjects = async (userId) => {
  const batch = db.batch();
  const now = new Date().toISOString();

  DEFAULT_PROJECTS.forEach((project) => {
    const ref = db.collection('projects').doc();
    batch.set(ref, {
      ...project,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const userRef = db.collection('users').doc();
    const uid = userRef.id;

    const userData = {
      name,
      email,
      passwordHash,
      xp: 0,
      level: 'Iniciante',
      badges: [],
      streak: 0,
      lastCompletedDate: null,
      tasksCompleted: 0,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(userData);

    // Seed default projects for new user
    await seedDefaultProjects(uid);

    const token = generateToken(uid);

    return res.status(201).json({
      token,
      user: {
        uid,
        name,
        email,
        xp: 0,
        level: 'Iniciante',
        badges: [],
        streak: 0,
        tasksCompleted: 0,
      },
    });
  } catch (err) {
    console.error('[Register]', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    const isMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(uid);

    return res.json({
      token,
      user: {
        uid,
        name: userData.name,
        email: userData.email,
        xp: userData.xp || 0,
        level: userData.level || 'Iniciante',
        badges: userData.badges || [],
        streak: userData.streak || 0,
        tasksCompleted: userData.tasksCompleted || 0,
      },
    });
  } catch (err) {
    console.error('[Login]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();

    return res.json({
      uid: req.user.uid,
      name: userData.name,
      email: userData.email,
      xp: userData.xp || 0,
      level: userData.level || 'Iniciante',
      badges: userData.badges || [],
      streak: userData.streak || 0,
      tasksCompleted: userData.tasksCompleted || 0,
    });
  } catch (err) {
    console.error('[GetMe]', err);
    return res.status(500).json({ error: 'Failed to fetch user data.' });
  }
};

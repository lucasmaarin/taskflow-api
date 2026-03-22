import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Authorization required.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Fetch user from Firestore to ensure they still exist
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();
    req.user = {
      uid: decoded.uid,
      email: userData.email,
      name: userData.name,
      xp: userData.xp || 0,
      badges: userData.badges || [],
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware]', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
};

export default auth;

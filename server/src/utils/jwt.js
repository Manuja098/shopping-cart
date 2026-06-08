import jwt from 'jsonwebtoken';

export const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const authResponse = (user, token) => ({
  token,
  user: {
    id:           user.id,
    name:         user.name,
    email:        user.email,
    role:         user.role,
    authProvider: user.authProvider,
  },
});
const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const result = await authService.register({ name, email, password });
    res.status(201).json({ message: 'Business registered successfully', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await authService.login({ email, password });
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const me = (req, res) => {
  res.json({
    id: req.business._id,
    name: req.business.name,
    email: req.business.email,
  });
};

module.exports = { register, login, me };

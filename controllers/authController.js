const jwt = require('jsonwebtoken');

const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123',
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};

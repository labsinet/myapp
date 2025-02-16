require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb'
});

const User = require('./models/user')(sequelize, DataTypes);
const Analysis = require('./models/analysis')(sequelize, DataTypes);

User.associate = models => {
  User.hasMany(models.Analysis, { foreignKey: 'id_user' });
};
Analysis.associate = models => {
  Analysis.belongsTo(models.User, { foreignKey: 'id_user' });
};

User.associate({ Analysis });
Analysis.associate({ User });

const secretKey = process.env.SECRET_KEY;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         department:
 *           type: string
 *         category:
 *           type: string
 *         role:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Analysis:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         year:
 *           type: integer
 *         semester:
 *           type: integer
 *         subject:
 *           type: string
 *         id_group:
 *           type: string
 *         id_department:
 *           type: string
 *         count_stud:
 *           type: integer
 *         count5:
 *           type: integer
 *         count4:
 *           type: integer
 *         count3:
 *           type: integer
 *         count2:
 *           type: integer
 *         count_passed:
 *           type: integer
 *         count_released:
 *           type: integer
 *         count_not_cert:
 *           type: integer
 *         count_acad_leave:
 *           type: integer
 *         count_expelled:
 *           type: integer
 *         quality:
 *           type: number
 *           format: decimal
 *         overall:
 *           type: number
 *           format: float
 *         average:
 *           type: number
 *           format: float
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         id_user:
 *           type: integer
 *           description: Foreign key to the user table
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Error registering user
 */
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, department, category, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      department,
      category,
      role: role || 'user'
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Error logging in user
 */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in user', error: err.message });
  }
});

// Middleware для перевірки токена
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error fetching users
 */
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
app.put('/users/:id', authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await user.update(req.body);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating user', error: err.message });
    }
  });

  /**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
app.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await user.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
  });

  /**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset initiated
 *       404:
 *         description: User not found
 *       500:
 *         description: Error initiating password reset
 */
app.post('/users/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Процес відновлення паролю, наприклад, надіслати email з посиланням на відновлення паролю
      res.json({ message: 'Password reset initiated' });
    } catch (err) {
      res.status(500).json({ message: 'Error initiating password reset', error: err.message });
    }
  });

  /**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error resetting password
 */
app.post('/users/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error resetting password', error: err.message });
    }
  });
  

/**
 * @swagger
 * /analysis:
 *   post:
 *     summary: Create a new analysis
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Analysis'
 *     responses:
 *       201:
 *         description: Analysis created successfully
 *       500:
 *         description: Error creating analysis
 */
app.post('/analysis', authMiddleware, async (req, res) => {
    try {
      const analysis = await Analysis.create({ ...req.body, id_user: req.user.id });
      res.status(201).json(analysis);
    } catch (err) {
      res.status(500).json({ message: 'Error creating analysis', error: err.message });
    }
  });
  
  /**
   * @swagger
   * /analysis:
   *   get:
   *     summary: Get all analyses
   *     tags: [Analysis]
   *     responses:
   *       200:
   *         description: Successfully retrieved all analyses
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Analysis'
   *       500:
   *         description: Error fetching analyses
   */
  app.get('/analysis', authMiddleware, async (req, res) => {
    try {
      const analyses = await Analysis.findAll({ where: { id_user: req.user.id } });
      res.json(analyses);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching analyses', error: err.message });
    }
  });
  
  /**
   * @swagger
   * /analysis/{id}:
   *   get:
   *     summary: Get analysis by ID
   *     tags: [Analysis]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Analysis ID
   *     responses:
   *       200:
   *         description: Successfully retrieved analysis
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Analysis'
   *       500:
   *         description: Error fetching analysis
   */
  app.get('/analysis/:id', authMiddleware, async (req, res) => {
    try {
      const analysis = await Analysis.findOne({ where: { id: req.params.id, id_user: req.user.id } });
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      res.json(analysis);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching analysis', error: err.message });
    }
  });
  
  /**
   * @swagger
   * /analysis/{id}:
   *   put:
   *     summary: Update an analysis by ID
   *     tags: [Analysis]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Analysis ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Analysis'
   *     responses:
   *       200:
   *         description: Successfully updated analysis
   *       404:
   *         description: Analysis not found
   *       500:
   *         description: Error updating analysis
   */
  app.put('/analysis/:id', authMiddleware, async (req, res) => {
    try {
      const analysis = await Analysis.findOne({ where: { id: req.params.id, id_user: req.user.id } });
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      await analysis.update(req.body);
      res.json({ message: 'Analysis updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating analysis', error: err.message });
    }
  });
  
  /**
   * @swagger
   * /analysis/{id}:
   *   delete:
   *     summary: Delete an analysis by ID
   *     tags: [Analysis]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Analysis ID
   *     responses:
   *       204:
   *         description: Successfully deleted analysis
   *       404:
   *         description: Analysis not found
   *       500:
   *         description: Error deleting analysis
   */
  app.delete('/analysis/:id', authMiddleware, async (req, res) => {
    try {
      const analysis = await Analysis.findOne({ where: { id: req.params.id, id_user: req.user.id } });
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      await analysis.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: 'Error deleting analysis', error: err.message });
    }
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

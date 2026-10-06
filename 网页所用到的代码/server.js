require('dotenv').config();
const express = require('express');
const mysql2 = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tangkang_db',
  port: process.env.DB_PORT || 3306
};

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'tk_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

// ============================================
// 工具函数
// ============================================

// 获取数据库连接（用完即关）
async function getDb() {
  return await mysql2.createConnection(dbConfig);
}

// JWT鉴权中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请先登录' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
}

// ============================================
// 1. 注册接口
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少6位' });
    }

    const connection = await getDb();

    // 检查邮箱是否已注册
    const [existingUser] = await connection.execute(
      'SELECT id FROM user WHERE user_email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      await connection.end();
      return res.status(400).json({ message: '该邮箱已注册' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 写入用户表
    const [result] = await connection.execute(
      'INSERT INTO user (user_name, user_email, user_pwd, create_time) VALUES (?, ?, ?, NOW())',
      [name, email, hashedPassword]
    );

    // 为新用户创建默认桌宠状态
    await connection.execute(
      'INSERT INTO pet_state (user_id, pet_name, pet_type, skills_config) VALUES (?, ?, ?, ?)',
      [result.insertId, '糖糖', 'cat', JSON.stringify({
        sitting_reminder: true,
        water_reminder: true,
        medicine_reminder: true,
        glucose_reminder: false,
        health_tip: true
      })]
    );

    await connection.end();
    res.status(200).json({ message: '注册成功，请登录' });
  } catch (error) {
    console.error('注册失败：', error);
    res.status(500).json({ message: '服务器错误，注册失败' });
  }
});

// ============================================
// 2. 登录接口（返回JWT Token）
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '请输入邮箱和密码' });
    }

    const connection = await getDb();

    const [users] = await connection.execute(
      'SELECT * FROM user WHERE user_email = ?',
      [email]
    );
    if (users.length === 0) {
      await connection.end();
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.user_pwd);
    if (!isPasswordValid) {
      await connection.end();
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    await connection.execute(
      'UPDATE user SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    await connection.end();

    // 生成JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.user_name, email: user.user_email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email,
        gender: user.gender,
        age: user.age,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登录失败：', error);
    res.status(500).json({ message: '服务器错误，登录失败' });
  }
});

// ============================================
// 3. 获取用户信息（需鉴权）
// ============================================
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    const [users] = await connection.execute(
      'SELECT id, user_name, user_email, avatar, gender, age, height, weight, bmi, family_diabetes, create_time, last_login FROM user WHERE id = ?',
      [req.user.id]
    );
    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = users[0];
    res.status(200).json({ user });
  } catch (error) {
    console.error('获取用户信息失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 4. 更新用户档案（需鉴权）
// ============================================
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { gender, age, height, weight, bmi, family_diabetes } = req.body;
    const connection = await getDb();

    await connection.execute(
      'UPDATE user SET gender=?, age=?, height=?, weight=?, bmi=?, family_diabetes=? WHERE id=?',
      [gender, age, height, weight, bmi, family_diabetes, req.user.id]
    );

    await connection.end();
    res.status(200).json({ message: '档案更新成功' });
  } catch (error) {
    console.error('更新档案失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 5. 保存健康评估结果（需鉴权）
// ============================================
app.post('/api/health/assessment', authMiddleware, async (req, res) => {
  try {
    const { source, risk_level, probability, model_probability, symptom_probability, key_factors, medical_advice, raw_data } = req.body;

    const connection = await getDb();
    await connection.execute(
      'INSERT INTO health_assessment (user_id, source, risk_level, probability, model_probability, symptom_probability, key_factors, medical_advice, raw_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [req.user.id, source, risk_level, probability, model_probability || null, symptom_probability || null, JSON.stringify(key_factors), medical_advice, JSON.stringify(raw_data)]
    );

    // 根据风险等级更新桌宠状态
    let mood = 'happy';
    let collarColor = '#10b981';
    if (risk_level === '中风险') {
      mood = 'thinking';
      collarColor = '#f59e0b';
    } else if (risk_level === '高风险') {
      mood = 'worried';
      collarColor = '#ef4444';
    }

    await connection.execute(
      'UPDATE pet_state SET mood=?, collar_color=? WHERE user_id=?',
      [mood, collarColor, req.user.id]
    );

    await connection.end();
    res.status(200).json({ message: '评估结果已保存' });
  } catch (error) {
    console.error('保存评估结果失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 6. 获取健康评估历史（需鉴权）
// ============================================
app.get('/api/health/assessment', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    const [records] = await connection.execute(
      'SELECT * FROM health_assessment WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    await connection.end();

    // 解析JSON字段
    const parsed = records.map(r => ({
      ...r,
      key_factors: typeof r.key_factors === 'string' ? JSON.parse(r.key_factors) : r.key_factors,
      raw_data: typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data
    }));

    res.status(200).json({ records: parsed });
  } catch (error) {
    console.error('获取评估历史失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 7. 获取/更新桌宠状态（需鉴权）
// ============================================
app.get('/api/pet/state', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    const [rows] = await connection.execute(
      'SELECT * FROM pet_state WHERE user_id = ?',
      [req.user.id]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(200).json({
        pet: {
          pet_name: '糖糖',
          pet_type: 'cat',
          collar_color: '#10b981',
          mood: 'happy',
          skills_config: { sitting_reminder: true, water_reminder: true, medicine_reminder: true, glucose_reminder: false, health_tip: true }
        }
      });
    }

    const pet = rows[0];
    pet.skills_config = typeof pet.skills_config === 'string' ? JSON.parse(pet.skills_config) : pet.skills_config;
    res.status(200).json({ pet });
  } catch (error) {
    console.error('获取桌宠状态失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.put('/api/pet/state', authMiddleware, async (req, res) => {
  try {
    const { pet_name, skills_config } = req.body;
    const connection = await getDb();

    await connection.execute(
      'UPDATE pet_state SET pet_name=?, skills_config=? WHERE user_id=?',
      [pet_name, JSON.stringify(skills_config), req.user.id]
    );

    await connection.end();
    res.status(200).json({ message: '桌宠状态已更新' });
  } catch (error) {
    console.error('更新桌宠状态失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 8. 健康提醒 CRUD（需鉴权）
// ============================================
app.get('/api/reminders', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    const [reminders] = await connection.execute(
      'SELECT * FROM health_reminder WHERE user_id = ? ORDER BY time ASC',
      [req.user.id]
    );
    await connection.end();
    res.status(200).json({ reminders });
  } catch (error) {
    console.error('获取提醒失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/reminders', authMiddleware, async (req, res) => {
  try {
    const { type, title, time, note } = req.body;
    const connection = await getDb();
    const [result] = await connection.execute(
      'INSERT INTO health_reminder (user_id, type, title, time, note, active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
      [req.user.id, type, title, time, note]
    );
    await connection.end();
    res.status(200).json({ message: '提醒已添加', id: result.insertId });
  } catch (error) {
    console.error('添加提醒失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.delete('/api/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    await connection.execute(
      'DELETE FROM health_reminder WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    await connection.end();
    res.status(200).json({ message: '提醒已删除' });
  } catch (error) {
    console.error('删除提醒失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.put('/api/reminders/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const connection = await getDb();
    await connection.execute(
      'UPDATE health_reminder SET active = NOT active WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    await connection.end();
    res.status(200).json({ message: '提醒状态已切换' });
  } catch (error) {
    console.error('切换提醒失败：', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ============================================
// 启动服务
// ============================================
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`糖康孪生后端服务已启动，地址：http://localhost:${port}`);
});

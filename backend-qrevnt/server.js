require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 5000;

// Init Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with promise support
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promiseDb = db.promise();

// Test database connection
promiseDb
  .query('SELECT 1')
  .then(() => console.log('✅ Connected to MySQL database'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));

// Store OTP sementara
const otpStore = new Map();

// ========== TEST ROUTE ==========
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to QRvent API!' });
});

// ========== AUTH ROUTES ==========

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi!' });
  }

  if (password.length < 4) {
    return res.status(400).json({ message: 'Password minimal 4 karakter!' });
  }

  try {
    const [existing] = await promiseDb.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await promiseDb.query(
      'INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, name || username]
    );

    res.status(201).json({ message: 'Registrasi berhasil! Silahkan login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi!' });
  }

  try {
    const [users] = await promiseDb.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Username atau password salah!' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// ========== OTP ROUTES (Pakai Resend) ==========

// Endpoint: Kirim OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email required!' });
  }
  
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Simpan OTP dengan expiry 10 menit
  otpStore.set(email, {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Resend punya domain gratis ini
      to: [email],
      subject: '🔐 Kode Verifikasi QRvent',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Kode Verifikasi QRvent</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: white; font-size: 28px; }
            .content { padding: 30px; text-align: center; }
            .otp-code { background: #f0f0f0; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 20px 0; font-family: monospace; }
            .warning { color: #ef4444; font-size: 12px; margin-top: 20px; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 QRvent</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Reset Password Verification</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #333;">Halo,</p>
              <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>
              <div class="otp-code">${otp}</div>
              <p>Masukkan kode di atas untuk melanjutkan proses reset password.</p>
              <p class="warning">⚠️ Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.</p>
            </div>
            <div class="footer">
              <p>© 2026 QRvent - Digital Guest Book Platform</p>
              <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    
    console.log(`📧 OTP ${otp} sent to ${email}`);
    res.json({ message: 'OTP sent successfully', email: email });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP required!' });
  }
  
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return res.status(400).json({ message: 'No OTP found. Please request a new code.' });
  }
  
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
  }
  
  if (storedData.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP code!' });
  }
  
  otpStore.delete(email);
  res.json({ message: 'OTP verified successfully' });
});

// ========== EVENT ROUTES ==========
app.get('/api/events', async (req, res) => {
  try {
    const [events] = await promiseDb.query('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [events] = await promiseDb.query('SELECT * FROM events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    res.json(events[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/events', async (req, res) => {
  const {
    name, type, theme, date, startTime, endTime, location,
    locationType, capacity, description, isPublic, userId,
  } = req.body;

  if (!name || !date || !location) {
    return res.status(400).json({ message: 'Field wajib harus diisi!' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  
  if (eventDate < today) {
    return res.status(400).json({ message: 'Tidak bisa membuat event di tanggal yang sudah lewat!' });
  }

  if (eventDate.getTime() === today.getTime() && startTime) {
    const now = new Date();
    const selectedTime = new Date(`${date}T${startTime}`);
    if (selectedTime < now) {
      return res.status(400).json({ message: 'Tidak bisa memilih jam yang sudah lewat!' });
    }
  }

  try {
    const [result] = await promiseDb.query(
      `INSERT INTO events 
       (name, type, theme, date, startTime, endTime, location, locationType, capacity, description, isPublic, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, type || 'seminar', theme || 'purple', date,
        startTime || null, endTime || null, location,
        locationType || 'offline', capacity || 100,
        description || '', isPublic !== undefined ? isPublic : 1, userId || 1,
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Event berhasil dibuat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const [result] = await promiseDb.query('UPDATE events SET ? WHERE id = ?', [updates, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    res.json({ message: 'Event berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await promiseDb.query('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    res.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// ========== GUEST ROUTES ==========
app.get('/api/guests/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    const [guests] = await promiseDb.query(
      'SELECT * FROM guests WHERE eventId = ? ORDER BY name',
      [eventId]
    );
    res.json(guests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/guests', async (req, res) => {
  const { eventId, name, email, phone, qrCode } = req.body;
  if (!eventId || !name || !email) {
    return res.status(400).json({ message: 'Field wajib harus diisi!' });
  }
  try {
    const [result] = await promiseDb.query(
      'INSERT INTO guests (eventId, name, email, phone, qrCode, status) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, name, email, phone || null, qrCode || `QR${Date.now()}`, 'pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Tamu berhasil ditambahkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.patch('/api/guests/:id/checkin', async (req, res) => {
  const { id } = req.params;
  try {
    const now = new Date();
    const localDate = now.toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await promiseDb.query(
      'UPDATE guests SET status = ?, checkedInAt = ? WHERE id = ?',
      ['checked_in', localDate, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tamu tidak ditemukan' });
    }
    res.json({ message: 'Check-in berhasil!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.delete('/api/guests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await promiseDb.query('DELETE FROM guests WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tamu tidak ditemukan' });
    }
    res.json({ message: 'Tamu berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// ========== DASHBOARD STATS ==========
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [totalEvents] = await promiseDb.query('SELECT COUNT(*) as count FROM events');
    const [totalGuests] = await promiseDb.query('SELECT COUNT(*) as count FROM guests');
    const [totalAttended] = await promiseDb.query(
      "SELECT COUNT(*) as count FROM guests WHERE status = 'checked_in'"
    );
    const [attendanceRate] = await promiseDb.query(
      "SELECT (SELECT COUNT(*) FROM guests WHERE status = 'checked_in') * 100.0 / NULLIF((SELECT COUNT(*) FROM guests), 0) as rate"
    );
    res.json({
      totalEvents: totalEvents[0].count,
      totalGuests: totalGuests[0].count,
      totalAttended: totalAttended[0].count,
      attendanceRate: Math.round(attendanceRate[0].rate || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// ========== FEEDBACK ROUTES ==========
app.get('/api/feedbacks', async (req, res) => {
  try {
    const [feedbacks] = await promiseDb.query(`
      SELECT f.*, e.name as eventName 
      FROM feedbacks f
      JOIN events e ON f.eventId = e.id
      ORDER BY f.createdAt DESC
    `);
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.patch('/api/feedbacks/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query('UPDATE feedbacks SET status = ? WHERE id = ?', ['read', id]);
    res.json({ message: 'Feedback marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.delete('/api/feedbacks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await promiseDb.query('DELETE FROM feedbacks WHERE id = ?', [id]);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// ========== PROFILE ROUTES ==========
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await promiseDb.query(
      'SELECT id, username, email, name, phone, company, position, location, bio, website, avatar, created_at as joinDate FROM users WHERE id = ?',
      [decoded.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.put('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const { name, email, phone, company, position, location, bio, website, avatar } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await promiseDb.query(
      `UPDATE users SET name = ?, email = ?, phone = ?, company = ?, position = ?, location = ?, bio = ?, website = ?, avatar = ? WHERE id = ?`,
      [name, email, phone, company, position, location, bio, website, avatar, decoded.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

app.patch('/api/profile/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await promiseDb.query('SELECT password FROM users WHERE id = ?', [decoded.id]);
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await promiseDb.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// ========== SETTINGS ROUTES ==========
app.get('/api/settings', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [settings] = await promiseDb.query('SELECT settings FROM users WHERE id = ?', [decoded.id]);
    if (settings[0]?.settings) {
      res.json(JSON.parse(settings[0].settings));
    } else {
      res.json({
        notifications: { emailFeedback: true, emailDoorprize: true, pushCheckin: true, weeklyReport: true },
        appearance: { theme: 'light', animations: true },
        security: { twoFactor: false, sessionTimeout: '30' },
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const { type, data } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [current] = await promiseDb.query('SELECT settings FROM users WHERE id = ?', [decoded.id]);
    let currentSettings = {};
    if (current[0]?.settings) currentSettings = JSON.parse(current[0].settings);
    currentSettings[type] = data;
    await promiseDb.query('UPDATE users SET settings = ? WHERE id = ?', [JSON.stringify(currentSettings), decoded.id]);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 API available at http://localhost:${PORT}/api`);
});
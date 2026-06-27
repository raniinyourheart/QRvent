require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const QRCode = require('qrcode');

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
    const [rows] = await promiseDb.query(`
      SELECT e.*, 
             g.id as guest_id, 
             g.name as guest_name, 
             g.status as guest_status
      FROM events e
      LEFT JOIN guests g ON e.id = g.eventId
      ORDER BY e.date DESC
    `);

    const eventsMap = rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          userId: row.userId,
          name: row.name,
          type: row.type,
          theme: row.theme,
          date: row.date,
          startTime: row.startTime,
          endTime: row.endTime,
          location: row.location,
          locationType: row.locationType,
          capacity: row.capacity,
          description: row.description,
          isPublic: row.isPublic,
          bannerUrl: row.bannerUrl,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          guests: []
        };
      }

      if (row.guest_id) {
        acc[row.id].guests.push({
          id: row.guest_id,
          name: row.guest_name,
          status: row.guest_status
        });
      }

      return acc;
    }, {});

    res.json(Object.values(eventsMap));
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
        description || '', isPublic !== undefined ? isPublic : 1, userId,
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

app.post('/api/send-invitation', async (req, res) => {
  const {
    guest_email,
    guest_name,
    event_name,
    event_desc,
    event_date,
    event_startTime,
    event_location,
    qr_data,
    guest_id
  } = req.body;

  const eventId = req.body.event_id || 9;
  const currentGuestId = guest_id || 11;

  try {
    const qrJsonObject = {
      id: Number(currentGuestId),
      name: guest_name,
      email: guest_email,
      eventId: Number(eventId),
      eventName: event_name,
      qrCode: qr_data
    };

    const qrStringData = JSON.stringify(qrJsonObject);

    const qrBuffer = await QRCode.toBuffer(qrStringData, {
      width: 250,
      margin: 1
    });

    const feedbackUrl = `http://localhost:3000/events/${eventId}?guest=${currentGuestId}`;

    const { data, error } = await resend.emails.send({
      from: 'QRvent Ticket <onboarding@resend.dev>',
      to: [guest_email],
      subject: `🎟️ E-Tiket Resmi: ${event_name}`,
      attachments: [
        {
          filename: 'ticket-qrcode.png',
          content: qrBuffer
        }
      ],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; }
            .ticket-card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0; }
            .ticket-header { background: #4f46e5; color: #ffffff; padding: 20px; text-align: center; }
            .ticket-header h2 { margin: 0; font-size: 20px; font-weight: 700; }
            .ticket-body { padding: 20px; }
            .guest-name { font-size: 18px; font-weight: bold; text-align: center; color: #1e293b; margin: 10px 0 20px 0; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px; }
            .info-table { width: 100%; font-size: 14px; margin-bottom: 15px; }
            .info-table td { padding: 6px 0; }
            .label { color: #64748b; font-weight: 500; width: 30%; }
            .value { color: #334155; font-weight: 600; }
            .desc-box { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; margin-top: 10px; line-height: 1.4; }
            .qr-section { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #cbd5e1; }
            .feedback-section { text-align: center; margin-top: 20px; padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; }
            .feedback-btn { display: inline-block; padding: 10px 20px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px; margin-top: 8px; }
            .footer-note { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 15px; }
          </style>
        </head>
        <body>

          <div class="ticket-card">
            <div class="ticket-header">
              <h2>${event_name}</h2>
            </div>
            
            <div class="ticket-body">
              <div class="guest-name">
                <span style="font-size: 11px; color: #94a3b8; display: block; font-weight: normal; margin-bottom: 2px;">NAMA TAMU</span>
                ${guest_name}
              </div>

              <table class="info-table">
                <tr>
                  <td class="label">📅 Tanggal</td>
                  <td class="value">${event_date || '-'}</td>
                </tr>
                <tr>
                  <td class="label">⏰ Waktu</td>
                  <td class="value">${event_startTime || 'Selesai'} WIB</td>
                </tr>
                <tr>
                  <td class="label">📍 Lokasi</td>
                  <td class="value">${event_location || '-'}</td>
                </tr>
              </table>

              <div class="desc-box">
                <strong>Deskripsi:</strong><br>
                ${event_desc || 'Tidak ada deskripsi untuk event ini.'}
              </div>

              <div class="qr-section">
                <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #4f46e5;">QR CODE TERLAMPIR DI EMAIL</p>
                <p style="margin: 0; font-size: 10px; font-family: monospace; color: #94a3b8;">Code: ${qr_data}</p>
              </div>

              <div class="feedback-section">
                <p style="margin: 0; font-size: 12px; color: #166534; font-weight: 500;">Setelah menghadiri acara, mohon luangkan waktu untuk memberikan feedback melalui tautan di bawah ini:</p>
                <a href="${feedbackUrl}" class="feedback-btn">Isi Feedback Acara</a>
              </div>
              
              <div class="footer-note">
                *Silakan unduh file QR Code yang terlampir pada email ini untuk ditunjukkan ke panitia saat check-in di lokasi event.
              </div>
            </div>
          </div>

        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error dari Resend API:', error);
      return res.status(500).json({ message: 'Gagal mengirim email via Resend' });
    }

    res.status(200).json({ message: 'E-Tiket dan QR Code berhasil dikirim!' });

  } catch (err) {
    console.error('Sistem error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan internal server' });
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

app.get('/api/feedbacks', async (req, res) => {
  const { eventId, guestId } = req.query;

  if (!eventId || !guestId) {
    return res.status(400).json({ message: 'Parameter tidak lengkap' });
  }

  try {
    const [guests] = await promiseDb.query(
      'SELECT name, email, status FROM guests WHERE id = ? AND eventId = ? LIMIT 1',
      [Number(guestId), Number(eventId)]
    );

    if (guests.length === 0) {
      return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
    }

    const guest = guests[0];

    if (guest.status !== 'checked_in') {
      return res.status(403).json({ 
        message: 'Dikarenakan anda tidak hadir, anda tidak bisa mengisi feedbacks' 
      });
    }

    const [feedbacks] = await promiseDb.query(
      'SELECT id FROM feedbacks WHERE eventId = ? AND guestId = ? LIMIT 1',
      [Number(eventId), Number(guestId)]
    );

    const hasSubmitted = feedbacks.length > 0;

    res.status(200).json({
      hasSubmitted,
      guestName: guest.name,
      guestEmail: guest.email
    });

  } catch (error) {
    console.error('Error checking feedback status:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.get('/api/feedbacks/check', async (req, res) => {
  const { eventId, guestId } = req.query;

  if (!eventId || !guestId) {
    return res.status(400).json({ message: 'Parameter tidak lengkap.' });
  }

  try {
    const [guests] = await promiseDb.query(
      'SELECT name, email, status FROM guests WHERE id = ? AND eventId = ? LIMIT 1',
      [Number(guestId), Number(eventId)]
    );

    if (guests.length === 0) {
      return res.status(404).json({ message: 'Data tamu tidak ditemukan.' });
    }

    const guest = guests[0];

    if (guest.status !== 'checked_in') {
      return res.status(403).json({ 
        message: 'Dikarenakan anda tidak hadir, anda tidak bisa mengisi feedbacks.' 
      });
    }

    const [feedbacks] = await promiseDb.query(
      'SELECT id FROM feedbacks WHERE eventId = ? AND guestId = ? LIMIT 1',
      [Number(eventId), Number(guestId)]
    );

    const hasSubmitted = feedbacks.length > 0;

    res.status(200).json({
      hasSubmitted,
      guestName: guest.name,
      guestEmail: guest.email
    });

  } catch (error) {
    console.error('Error feedback check:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { eventId, guestId, guestName, guestEmail, rating, comment } = req.body;

  if (!eventId || !guestName || !guestEmail || !rating) {
    return res.status(400).json({ message: 'Semua kolom wajib diisi dengan benar.' });
  }

  const parsedRating = Number(rating);
  if (parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: 'Rating harus berkisar antara 1 sampai 5.' });
  }

  try {
    if (guestId) {
      const [guests] = await promiseDb.query(
        'SELECT status FROM guests WHERE id = ? AND eventId = ? LIMIT 1',
        [Number(guestId), Number(eventId)]
      );

      if (guests.length === 0) {
        return res.status(404).json({ message: 'Data tamu tidak valid.' });
      }

      if (guests[0].status !== 'checked_in') {
        return res.status(403).json({ 
          message: 'Dikarenakan anda tidak hadir, anda tidak bisa mengisi feedbacks.' 
        });
      }

      const [existingFeedback] = await promiseDb.query(
        'SELECT id FROM feedbacks WHERE eventId = ? AND guestId = ? LIMIT 1',
        [Number(eventId), Number(guestId)]
      );

      if (existingFeedback.length > 0) {
        return res.status(400).json({ message: 'Anda sudah mengirimkan feedback untuk acara ini.' });
      }
    }

    await promiseDb.query(
      'INSERT INTO feedbacks (eventId, guestId, guestName, guestEmail, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        Number(eventId),
        guestId ? Number(guestId) : null,
        guestName.trim(),
        guestEmail.trim(),
        parsedRating,
        comment ? comment.trim() : ''
      ]
    );

    res.status(201).json({ message: 'Feedback berhasil dikirim. Terima kasih!' });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengirim feedback.' });
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
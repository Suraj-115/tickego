const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const getTransporter = () => {
  const isBrevo = Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
  const transporter = isBrevo
    ? nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_PASS
        }
      })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  const senderEmail = isBrevo 
    ? (process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER || 'no-reply@tickego.com') 
    : process.env.EMAIL_USER;
  return { transporter, senderEmail };
};

const registrationOtpStore = new Map();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'An account with this email already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registrationOtpStore.set(email.toLowerCase().trim(), {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    const { transporter, senderEmail } = getTransporter();
    await transporter.sendMail({
      from: `"Tickego Support" <${senderEmail}>`,
      to: email,
      subject: 'Department/Club Verification OTP - Tickego',
      text: `Your OTP for Department/Club registration is: ${otp}. It is valid for 10 minutes.`
    });

    res.json({ message: 'Verification OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      clubName, clubType, clubDescription, clubLogo, otp 
    } = req.body;

    // Admin limit check
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({ message: 'An admin already exists for this college.' });
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If club registration with OTP
    if (role === 'club') {
      if (!clubName && !name) {
        return res.status(400).json({ message: 'Club/Department name is required' });
      }
      if (otp) {
        const record = registrationOtpStore.get(email.toLowerCase().trim());
        if (!record || record.otp !== otp.trim() || record.expiresAt < Date.now()) {
          return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        registrationOtpStore.delete(email.toLowerCase().trim());
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      clubName: role === 'club' ? (clubName || name) : undefined,
      clubType: role === 'club' ? (clubType || 'technical') : undefined,
      clubDescription: role === 'club' ? clubDescription : undefined,
      clubLogo: role === 'club' ? clubLogo : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubName: user.clubName,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Build query — filter by role if provided for faster lookup
    const query = { email };
    if (role) query.role = role;

    const user = await User.findOne(query);

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubName: user.clubName,
        token: generateToken(user._id, user.role),
      });
    } else if (!user && role) {
      // Provide a helpful message if no user found with that role
      res.status(401).json({ message: `No ${role} account found with this email` });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const { transporter, senderEmail } = getTransporter();

    await transporter.sendMail({
      from: `"Tickego Support" <${senderEmail}>`,
      to: email,
      subject: 'Password Reset OTP - Tickego',
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClub = async (req, res) => {
  try {
    const { name, email, password, clubName, clubLogo, clubDescription, clubType, motto, clubMotto } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const clubUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'club',
      clubName,
      clubLogo,
      clubDescription,
      clubType,
      clubMotto: motto || clubMotto,
      motto: motto || clubMotto
    });

    res.status(201).json({
      _id: clubUser.id,
      name: clubUser.name,
      email: clubUser.email,
      role: clubUser.role,
      clubName: clubUser.clubName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

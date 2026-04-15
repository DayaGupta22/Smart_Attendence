/**
 * Seed script — creates demo accounts and a sample timetable.
 * Run: node utils/seed.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Timetable = require('../models/Timetable');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing seed data
  await User.deleteMany({ email: { $in: ['student@demo.com', 'teacher@demo.com', 'admin@demo.com'] } });
  await Timetable.deleteMany({ academicYear: 'DEMO' });

  // Create demo users
  const admin = await User.create({
    name: 'Admin User', email: 'admin@demo.com', passwordHash: 'demo1234',
    role: 'admin', department: 'Computer Science',
  });

  const teacher = await User.create({
    name: 'Prof. Sharma', email: 'teacher@demo.com', passwordHash: 'demo1234',
    role: 'teacher', department: 'Computer Science',
  });

  const student = await User.create({
    name: 'Rahul Mehta', email: 'student@demo.com', passwordHash: 'demo1234',
    role: 'student', department: 'Computer Science', semester: 3,
    rollNumber: 'CS2024001',
    interests: ['Machine Learning', 'Web Development'],
    strengths: ['Python', 'Problem Solving'],
    weakSubjects: ['Mathematics', 'DBMS'],
    careerGoals: ['Software Engineer', 'ML Researcher'],
  });

  // Create a sample timetable for Monday
  await Timetable.create({
    department: 'Computer Science',
    semester: 3,
    section: 'A',
    weekDay: 'Monday',
    academicYear: 'DEMO',
    periods: [
      { periodNumber: 1, startTime: '09:00', endTime: '10:00', subject: 'Data Structures', teacherId: teacher._id, roomNo: '101', isFree: false },
      { periodNumber: 2, startTime: '10:00', endTime: '11:00', subject: 'DBMS', teacherId: teacher._id, roomNo: '102', isFree: false },
      { periodNumber: 3, startTime: '11:00', endTime: '12:00', subject: '', roomNo: '', isFree: true },
      { periodNumber: 4, startTime: '13:00', endTime: '14:00', subject: 'Mathematics', teacherId: teacher._id, roomNo: '201', isFree: false },
      { periodNumber: 5, startTime: '14:00', endTime: '15:00', subject: 'Operating Systems', teacherId: teacher._id, roomNo: '301', isFree: false },
    ],
  });

  console.log('\nDemo accounts created:');
  console.log('  Student  → email: student@demo.com  | password: demo1234');
  console.log('  Teacher  → email: teacher@demo.com  | password: demo1234');
  console.log('  Admin    → email: admin@demo.com    | password: demo1234');
  console.log('\nSample Monday timetable created for Computer Science, Semester 3.');

  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });

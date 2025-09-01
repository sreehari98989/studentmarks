// server.js

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK connected successfully! 🔥');
} catch (error) {
  console.error('Firebase initialization failed:', error.message);
  process.exit(1);
}

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/marks', async (req, res) => {
  const { usn, department, semester, subjects: newSubjects } = req.body;

  if (!usn || !semester || !newSubjects) {
    return res.status(400).json({ message: 'Missing USN, semester, or subjects data.' });
  }

  const upperCaseUsn = usn.toUpperCase();
  const docRef = db.collection('students').doc(upperCaseUsn);
  console.log(`[POST] Received request to save marks for USN: ${upperCaseUsn}, Semester: ${semester}`);

  try {
    const doc = await docRef.get();
    let existingSubjects = [];

    if (doc.exists) {
      existingSubjects = doc.data().subjects || [];
    }

    const otherSemesterSubjects = existingSubjects.filter(subject => {
        const semMatch = subject.code.match(/\d/);
        return semMatch && semMatch[0] !== semester;
    });

    const updatedSubjects = [...otherSemesterSubjects, ...newSubjects];

    const dataToSave = {
        usn: upperCaseUsn,
        department,
        subjects: updatedSubjects
    };

    await docRef.set(dataToSave);

    console.log(`[SUCCESS] Marks for ${upperCaseUsn} merged and saved.`);
    res.status(201).json({ message: 'Marks saved successfully!', usn: upperCaseUsn });

  } catch (error) {
    console.error(`[ERROR] Failed to save marks for ${upperCaseUsn}:`, error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/results/:usn', async (req, res) => {
  const usn = req.params.usn.toUpperCase();
  try {
    const docRef = db.collection('students').doc(usn);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'No results found for this USN.' });
    }
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
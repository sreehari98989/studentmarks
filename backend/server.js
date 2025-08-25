// 1. Import necessary packages
const express = require('express');
const cors = require('cors');

// 2. Initialize the Express app
const app = express();
const PORT = 3000; // The port our server will run on

// 3. Set up middleware
app.use(cors()); // Allows your frontend to make requests to this backend
app.use(express.json()); // Allows the server to understand JSON data sent from the frontend

// 4. Define a test route
app.get('/', (req, res) => {
  res.send('Hello from your backend server!');
});

// 5. THIS IS THE IMPORTANT PART: Create the API endpoint for saving marks
app.post('/api/marks', (req, res) => {
  // Get the data that the admin page sent
  const marksData = req.body;

  console.log('Received marks data:', marksData);

  // For now, we'll just log the data and send a success message.
  // In the next step, we will save this data to the database here.

  // Send a response back to the admin page
  res.status(201).json({
    message: 'Marks received successfully!',
    data: marksData
  });
});


// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];
let userId = 1;

// Accessibility profile storage
app.post('/api/profile', (req, res) => {
  const profile = {
    id: userId++,
    ...req.body,
    createdAt: new Date()
  };
  users.push(profile);
  res.json(profile);
});

app.get('/api/profile/:id', (req, res) => {
  const profile = users.find(u => u.id === parseInt(req.params.id));
  if (profile) {
    res.json(profile);
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

// Generate accessibility recommendations
app.post('/api/recommendations', (req, res) => {
  const { disabilities } = req.body;
  const recommendations = [];
  
  if (disabilities.includes('visual')) {
    recommendations.push({
      feature: 'Screen Reader',
      description: 'Enable NVDA or JAWS for text-to-speech',
      priority: 'high'
    });
    recommendations.push({
      feature: 'High Contrast Mode',
      description: 'Increase text contrast for better readability',
      priority: 'high'
    });
  }
  
  if (disabilities.includes('hearing')) {
    recommendations.push({
      feature: 'Captions',
      description: 'Enable closed captions for all video content',
      priority: 'high'
    });
  }
  
  if (disabilities.includes('motor')) {
    recommendations.push({
      feature: 'Keyboard Navigation',
      description: 'Navigate without mouse using Tab and Enter keys',
      priority: 'high'
    });
    recommendations.push({
      feature: 'Voice Control',
      description: 'Use voice commands for navigation',
      priority: 'medium'
    });
  }
  
  if (disabilities.includes('cognitive')) {
    recommendations.push({
      feature: 'Simplified Language',
      description: 'Plain language mode for easier comprehension',
      priority: 'high'
    });
    recommendations.push({
      feature: 'Reading Guide',
      description: 'Highlight current line while reading',
      priority: 'medium'
    });
  }
  
  res.json({ recommendations });
});

const PORT = 3005;
app.listen(PORT, () => console.log(`GovAccess API on port ${PORT}`));

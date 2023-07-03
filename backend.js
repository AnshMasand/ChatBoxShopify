const express = require('express');
const axios = require('axios');
const app = express();
import Pool from 'pg'

const pool = new Pool({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 5432,
});

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // Send the message to the OpenAI API
  const response = await axios.post('https://api.openai.com/v4/engines/davinci-codex/completions', {
    prompt: message,
    max_tokens: 60
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  });

  // Extract the AI's message from the response
   const aiMessage = response.data.choices[0].text.trim();

  // Assume aiMessage contains the new shipping rule
  const newShippingRule = aiMessage;

  // Update the database with the new shipping rules
  const updateQuery = `
    UPDATE shipping_rules
    SET rule = $1
    WHERE user_id = $2
  `;

  const userId = req.user.id; // Assume this is the authenticated user's ID

  try {
    await pool.query(updateQuery, [newShippingRule, userId]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update shipping rule' });
    return;
  }

  res.json({ aiMessage });
});

app.listen(3000, () => console.log('Server is running on port 3000'));

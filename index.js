const express = require('express');
/*const fetch = require('node-fetch');*/ // Import node-fetch
const app = express();
const port = 3000;
const path = require('path');
const { G4F } = require("g4f");
const g4f = new G4F();

// Define the base directory for storing conversations
const conversationsDir = path.join(__dirname, './conversational/chatgpt');


// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", async function (req, res) {
res.sendFile(path.join(__dirname, "index.html"));
});

// Example: Fetch data from an external API and return it to the client
app.get('/api', async (req, res) => {
  try {
    // Fetch data from an external API (e.g., JSONPlaceholder)
    const response = await fetch('https://api.zetsu.xyz/cdp');
    const data = await response.json();
    const one = data.result.one
    const two = data.result.two


    // Send the fetched data back to the client
    res.json({ message: 'Data fetched from external API!', one, two });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

app.get('/aw', async (req, res) => {
  const { betlog } = req.query; // Get query parameter from the request

  try {
    // Fetch data from an external API with query parameters
    const response = await fetch(`https://kaiz-apis.gleeze.com/api/deepseek-v3?ask=${betlog}&uid=1`);
    const data = await response.json();
    const result = data.response;
    console.log(result);

    // Send the fetched data back to the client
    res.json({ message: `Data fetched for userId ${betlog}`, result });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

app.get('/u', async ({ req, res }) => {
    try {
        // Check if there's a query parameter named 'question'
        const question = req.query.question;
        const userId = req.query.userId || 'default'; // Ensure userId is included in the query parameters

        // Define the conversation file path based on user ID
        const conversationFile = path.join(conversationsDir, `${userId}.json`);

        // If no question is provided, return an error
        if (!question) {
            return res.status(400).json({ error: "add ?question=your_question_here" });
        }

        // If the user inputs "clear" or "reset", delete the conversation file
        if (['clear', 'reset'].includes(question.toLowerCase().trim())) {
            if (fs.existsSync(conversationFile)) {
                fs.unlinkSync(conversationFile); // Delete the file
            }
            return res.json({ content: "Conversation reset successfully." });
        }

        // Load existing conversation if available, otherwise create a new one
        let messages = [];
        if (fs.existsSync(conversationFile)) {
            const existingConversation = fs.readFileSync(conversationFile, 'utf-8');
            messages = JSON.parse(existingConversation);
        } else {
            // Start a new conversation if none exists
            messages.push({ role: "system", content: "You are a helpful assistant." });
        }

        // Add the user's message to the conversation
        messages.push({ role: "user", content: question });

        // Use the messages array in generating the response
        const chat = await g4f.chatCompletion(messages);

        // Add the assistant's response to the conversation
        messages.push({ role: "assistant", content: chat });

        // Auto-save the conversation to a file (auto-generates/updates the JSON)
        fs.writeFileSync(conversationFile, JSON.stringify(messages, null, 2));

        // Send the AI's response as JSON
        res.json({ content: chat });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
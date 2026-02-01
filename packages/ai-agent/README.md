# JSCAD AI Agent 🤖

An AI-powered chat interface that generates JSCAD (JavaScript CAD) scripts using Groq API. Simply describe what you want to create, and the AI agent will generate the corresponding JSCAD code!

## Features

- 💬 Interactive chat interface
- 🤖 Powered by Groq's Mixtral-8x7b model
- 🎨 Real-time JSCAD code generation
- 📋 One-click code copying
- 🔄 Conversation history support
- 🎯 Specialized in CAD script generation

## Prerequisites

- Node.js (v14 or higher)
- A Groq API key (get one free at [https://console.groq.com](https://console.groq.com))

## Installation

1. Navigate to the ai-agent package:
```bash
cd packages/ai-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
copy .env.example .env
```

4. Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3001
```

## Getting Your Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Usage

1. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

2. Open your browser and go to:
```
http://localhost:3001
```

3. Start chatting! Try these examples:
   - "Create a simple car"
   - "Make a house with a roof"
   - "Design a coffee mug"
   - "Build a gear wheel with 12 teeth"
   - "Create a chess piece - a knight"

## How It Works

1. **User Input**: You describe what 3D model you want to create
2. **AI Processing**: The Groq API (Mixtral model) processes your request with JSCAD-specific context
3. **Code Generation**: The AI generates valid JSCAD JavaScript code
4. **Display**: The code appears in the right panel, ready to copy and use

## Example Prompts

### Simple Objects
- "Create a cube with rounded edges"
- "Make a sphere with radius 10"
- "Design a cylinder"

### Complex Objects
- "Create a simple car with wheels and body"
- "Make a house with walls, roof, and door"
- "Design a coffee mug with handle"
- "Build a table with 4 legs"

### Mechanical Parts
- "Create a gear wheel"
- "Make a bolt with threads"
- "Design a washer"

## Using Generated Code

1. Copy the generated code from the interface
2. Go to [https://openjscad.xyz](https://openjscad.xyz)
3. Paste the code in the editor
4. Click "Update" to see your 3D model
5. Export as STL, OBJ, or other formats

## API Endpoints

### POST `/api/chat`

Generate JSCAD code from natural language description.

**Request Body:**
```json
{
  "message": "Create a simple car",
  "history": []
}
```

**Response:**
```json
{
  "response": "Full AI response with code",
  "code": "Extracted JSCAD code only"
}
```

## Customization

### Change AI Model

Edit `server.js` and modify the model parameter:
```javascript
model: 'mixtral-8x7b-32768',  // or 'llama2-70b-4096', etc.
```

### Adjust Temperature

Control creativity vs consistency in `server.js`:
```javascript
temperature: 0.7,  // Lower = more consistent, Higher = more creative
```

### Modify System Prompt

Edit the `SYSTEM_PROMPT` in `server.js` to change how the AI generates code.

## Troubleshooting

### "Failed to generate response"
- Check that your GROQ_API_KEY is set correctly in `.env`
- Verify your API key is valid at [https://console.groq.com](https://console.groq.com)
- Check your internet connection

### "Cannot connect to server"
- Make sure the server is running (`npm start`)
- Check that port 3001 is not in use
- Try changing the PORT in `.env`

### Code not appearing
- Check browser console for errors
- Ensure the API response contains code
- Try refreshing the page

## Integration with JSCAD Web

To integrate this with the main JSCAD web interface:

1. The generated code can be directly pasted into the JSCAD web editor
2. Or you can modify the web package to include this chat interface
3. The code follows standard JSCAD conventions and should work seamlessly

## Development

The project structure:
```
packages/ai-agent/
├── server.js           # Express server with Groq API integration
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── public/
│   ├── index.html     # Chat interface HTML
│   ├── styles.css     # Styling
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Technologies Used

- **Backend**: Node.js, Express
- **AI**: Groq API (Mixtral-8x7b)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **CAD**: JSCAD modeling library

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - Same as the main JSCAD project

## Credits

Built on top of the amazing [JSCAD](https://openjscad.xyz) project.

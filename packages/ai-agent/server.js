require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Groq = require('groq-sdk')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Check if API key is set
if (!process.env.GROQ_API_KEY) {
  console.error('⚠️  ERROR: GROQ_API_KEY is not set in .env file')
  console.error('Please add your Groq API key to the .env file')
  console.error('Get your key at: https://console.groq.com')
  process.exit(1)
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const SYSTEM_PROMPT = `You are an expert JSCAD (JavaScript CAD) code generator. Your role is to generate valid JSCAD scripts based on user descriptions.

JSCAD uses JavaScript to create 3D models. Here are the key concepts:

1. Import modeling functions from @jscad/modeling
2. Use primitives like cuboid, sphere, cylinder, etc.
3. Use transforms like translate, rotate, scale
4. Use booleans like union, subtract, intersect
5. Export a main function that returns geometries

Example JSCAD script structure:
\`\`\`javascript
const { cuboid, sphere, cylinder } = require('@jscad/modeling').primitives
const { translate, rotate } = require('@jscad/modeling').transforms
const { union, subtract } = require('@jscad/modeling').booleans

const main = () => {
  // Create your geometry here
  const box = cuboid({ size: [10, 10, 10] })
  return box
}

module.exports = { main }
\`\`\`

Important guidelines:
- Always use proper JSCAD syntax
- Include clear comments explaining each part
- Use appropriate dimensions and proportions
- Combine primitives creatively to match the description
- Use transforms to position elements correctly
- Return the final geometry from the main function

When the user asks for a 3D model:
1. Understand what they want to create
2. Break it down into basic shapes
3. Generate clean, well-commented JSCAD code
4. Always include the main function and proper exports
5. Use appropriate primitives and transformations

Respond with the JSCAD code in a code block. You can add a brief explanation before the code if helpful.`

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    console.log(`📝 User request: ${message.substring(0, 50)}...`)

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ]

    const completion = await groq.chat.completions.create({
      messages,
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 2048
    })

    const response = completion.choices[0]?.message?.content || 'No response generated'
    const code = extractCode(response)

    console.log(`✅ Generated ${code.split('\n').length} lines of code`)

    res.json({
      response,
      code
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    let errorMessage = 'Failed to generate response'
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your GROQ_API_KEY in .env file'
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again'
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiKeySet: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString()
  })
})

function extractCode(text) {
  // Try to extract code from markdown code blocks
  const codeBlockMatch = text.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }
  
  // If no code block, check if the entire response looks like code
  if (text.includes('require(') && text.includes('module.exports')) {
    return text.trim()
  }
  
  return text
}

app.listen(PORT, () => {
  console.log('========================================')
  console.log('🤖 JSCAD AI Agent Server')
  console.log('========================================')
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`✅ API Key: ${process.env.GROQ_API_KEY ? 'Set' : 'Not Set'}`)
  console.log('========================================')
  console.log('Open http://localhost:' + PORT + ' in your browser')
  console.log('========================================')
})

const html = require('nanohtml')

const aiChatView = (state, editorCallbackToStream, i18n) => {
  const isVisible = state.activeTool === 'aiChat'
  
  if (!isVisible) return html`<div></div>`

  const sendMessage = async () => {
    const input = document.getElementById('aiChatInput')
    const message = input.value.trim()
    
    if (!message) return

    const chatContainer = document.getElementById('aiChatMessages')
    const sendBtn = document.getElementById('aiChatSendBtn')
    
    // Disable input
    input.disabled = true
    sendBtn.disabled = true
    sendBtn.textContent = 'Sending...'

    // Add user message
    const userMsg = html`<div class="ai-chat-message ai-chat-user">
      <strong>You:</strong> ${message}
    </div>`
    chatContainer.appendChild(userMsg)
    input.value = ''
    chatContainer.scrollTop = chatContainer.scrollHeight

    try {
      // Get Groq API key from localStorage or prompt user
      let apiKey = localStorage.getItem('GROQ_API_KEY')
      
      if (!apiKey) {
        apiKey = prompt('Please enter your Groq API key (get one free at https://console.groq.com):')
        if (apiKey) {
          localStorage.setItem('GROQ_API_KEY', apiKey)
        } else {
          throw new Error('API key is required')
        }
      }

      // Call Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: `You are an expert JSCAD (JavaScript CAD) code generator. Generate valid JSCAD scripts based on user descriptions.

JSCAD uses JavaScript to create 3D models. Key concepts:
1. Import from @jscad/modeling
2. Use primitives: cuboid, sphere, cylinder
3. Use transforms: translate, rotate, scale
4. Use booleans: union, subtract, intersect
5. Export a main function

Example structure:
\`\`\`javascript
const { cuboid, sphere, cylinder } = require('@jscad/modeling').primitives
const { translate, rotate } = require('@jscad/modeling').transforms
const { union, subtract } = require('@jscad/modeling').booleans

const main = () => {
  const box = cuboid({ size: [10, 10, 10] })
  return box
}

module.exports = { main }
\`\`\`

Respond with JSCAD code in a code block.`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'API request failed')
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || 'No response generated'

      // Extract code from response
      const codeMatch = aiResponse.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
      
      if (codeMatch && editorCallbackToStream) {
        const code = codeMatch[1].trim()
        
        // Create a file tree structure like the editor does (must be an array)
        const fileTree = [{
          ext: 'js',
          fullPath: '/ai-generated.js',
          mimetype: 'javascript',
          name: 'ai-generated.js',
          source: code
        }]
        
        // Trigger code loading and evaluation using the same method as editor
        editorCallbackToStream.callback({ type: 'read', id: 'loadRemote', data: fileTree })
        
        // Show success message in chat
        const successMsg = html`<div class="ai-chat-message ai-chat-bot">
          ✅ Generated and rendered!
        </div>`
        chatContainer.appendChild(successMsg)
        chatContainer.scrollTop = chatContainer.scrollHeight
      } else {
        // If no code found, show the AI response
        const aiMsg = html`<div class="ai-chat-message ai-chat-bot">
          <strong>AI:</strong> ${aiResponse}
        </div>`
        chatContainer.appendChild(aiMsg)
        chatContainer.scrollTop = chatContainer.scrollHeight
      }

    } catch (error) {
      console.error('AI Chat Error:', error)
      const errorMsg = html`<div class="ai-chat-message ai-chat-error">
        <strong>Error:</strong> ${error.message}
      </div>`
      chatContainer.appendChild(errorMsg)
      chatContainer.scrollTop = chatContainer.scrollHeight
    } finally {
      // Re-enable input
      input.disabled = false
      sendBtn.disabled = false
      sendBtn.textContent = 'Send'
      input.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem('GROQ_API_KEY')
    alert('API key cleared. You will be prompted for a new one on next message.')
  }

  return html`
    <section id='aiChatPanel' class='popup-menu'>
      <div id='aiChatContent'>
        <h2>🤖 AI Assistant</h2>
        
        <div class='ai-chat-info'>
          <p>Describe what you want to create:</p>
        </div>

        <div id='aiChatMessages' class='ai-chat-messages'></div>

        <div class='ai-chat-input-section'>
          <textarea 
            id='aiChatInput' 
            placeholder='e.g., "Create a simple car"'
            rows='2'
            onkeypress=${handleKeyPress}
          ></textarea>
          <button id='aiChatSendBtn' onclick=${sendMessage}>Generate</button>
          <button onclick=${clearApiKey} class='ai-chat-clear-key' title='Clear API Key'>Clear Key</button>
        </div>
      </div>
    </section>
  `
}

module.exports = aiChatView

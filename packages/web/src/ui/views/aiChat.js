const html = require('nanohtml')
const { LLMService, LLM_PROVIDERS, LLM_MODELS } = require('../../services/llmService')

const llmService = new LLMService()

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
    sendBtn.textContent = 'Generating...'

    // Add user message
    const userMsg = html`<div class="ai-chat-message ai-chat-user">
      <strong>You:</strong> ${message}
    </div>`
    chatContainer.appendChild(userMsg)
    input.value = ''
    chatContainer.scrollTop = chatContainer.scrollHeight

    try {
      // Check if API key exists
      if (!llmService.getApiKey()) {
        const providerInfo = llmService.getProviderInfo()
        const apiKey = prompt(`Please enter your ${llmService.provider.toUpperCase()} API key:\n\nGet one at: ${providerInfo.apiUrl}`)
        if (apiKey) {
          llmService.setApiKey(apiKey)
        } else {
          throw new Error('API key is required')
        }
      }

      const systemPrompt = `You are an expert JSCAD (JavaScript CAD) code generator. Generate COMPLETE, WORKING, SELF-CONTAINED JSCAD scripts.

CRITICAL RULES:
1. ALL code must be self-contained - define ALL variables and constants
2. NO undefined variables or references
3. Use ONLY @jscad/modeling functions
4. ALWAYS include proper imports
5. ALWAYS export a main function
6. Use reasonable default values for all dimensions

JSCAD Structure:
\`\`\`javascript
const { cuboid, sphere, cylinder } = require('@jscad/modeling').primitives
const { translate, rotate, scale } = require('@jscad/modeling').transforms
const { union, subtract, intersect } = require('@jscad/modeling').booleans

const main = () => {
  // Define ALL dimensions and values here
  const width = 60
  const height = 30
  
  // Create geometry
  const box = cuboid({ size: [width, height, 15] })
  
  return box
}

module.exports = { main }
\`\`\`

Generate ONLY complete, working code with NO undefined variables. Respond with code in a markdown code block.`

      const aiResponse = await llmService.chat([{ role: 'user', content: message }], systemPrompt)

      // Extract code from response - try multiple patterns
      let code = null
      
      // Try markdown code block first
      const codeBlockMatch = aiResponse.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
      if (codeBlockMatch) {
        code = codeBlockMatch[1].trim()
      } else if (aiResponse.includes('const') && aiResponse.includes('module.exports')) {
        // If response looks like raw code (no markdown), use it directly
        code = aiResponse.trim()
      }
      
      if (code && editorCallbackToStream) {
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
      sendBtn.textContent = 'Generate'
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
    llmService.clearApiKey()
    alert('API key cleared. You will be prompted for a new one on next message.')
  }

  const changeProvider = (e) => {
    const newProvider = e.target.value
    llmService.setProvider(newProvider)
    // Update model dropdown
    const modelSelect = document.getElementById('aiModelSelect')
    if (modelSelect) {
      updateModelOptions(modelSelect, newProvider)
    }
  }

  const changeModel = (e) => {
    llmService.setModel(e.target.value)
  }

  const updateModelOptions = (selectElement, provider) => {
    selectElement.innerHTML = ''
    LLM_MODELS[provider].forEach(model => {
      const option = document.createElement('option')
      option.value = model.id
      option.textContent = model.name
      selectElement.appendChild(option)
    })
    selectElement.value = llmService.model
  }

  const providerInfo = llmService.getProviderInfo()

  return html`
    <section id='aiChatPanel' class='ai-chat-sidebar'>
      <div id='aiChatContent'>
        <h2>AI Assistant</h2>
        
        <div class='ai-chat-settings'>
          <div class='ai-chat-setting-row'>
            <label>Provider:</label>
            <select id='aiProviderSelect' onchange=${changeProvider}>
              <option value='${LLM_PROVIDERS.GEMINI}' ${providerInfo.provider === LLM_PROVIDERS.GEMINI ? 'selected' : ''}>Gemini</option>
              <option value='${LLM_PROVIDERS.ANTHROPIC}' ${providerInfo.provider === LLM_PROVIDERS.ANTHROPIC ? 'selected' : ''}>Claude</option>
              <option value='${LLM_PROVIDERS.GROQ}' ${providerInfo.provider === LLM_PROVIDERS.GROQ ? 'selected' : ''}>Groq</option>
            </select>
          </div>
          <div class='ai-chat-setting-row'>
            <label>Model:</label>
            <select id='aiModelSelect' onchange=${changeModel}>
              ${LLM_MODELS[providerInfo.provider].map(model => 
                html`<option value='${model.id}' ${model.id === providerInfo.model ? 'selected' : ''}>${model.name}</option>`
              )}
            </select>
          </div>
        </div>

        <div id='aiChatMessages' class='ai-chat-messages'></div>

        <div class='ai-chat-input-section'>
          <textarea 
            id='aiChatInput' 
            placeholder='Describe what you want to create...'
            rows='3'
            onkeypress=${handleKeyPress}
          ></textarea>
          <div class='ai-chat-buttons'>
            <button id='aiChatSendBtn' onclick=${sendMessage} class='ai-chat-generate-btn'>Generate</button>
            <button onclick=${clearApiKey} class='ai-chat-clear-key'>Clear Key</button>
          </div>
        </div>
      </div>
    </section>
  `
}

module.exports = aiChatView

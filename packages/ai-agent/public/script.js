const API_URL = 'http://localhost:3001/api/chat'
let conversationHistory = []

async function sendMessage() {
  const input = document.getElementById('userInput')
  const message = input.value.trim()
  
  if (!message) return

  const sendBtn = document.getElementById('sendBtn')
  const btnText = document.getElementById('btnText')
  const btnLoader = document.getElementById('btnLoader')
  
  // Disable input and show loading
  input.disabled = true
  sendBtn.disabled = true
  btnText.style.display = 'none'
  btnLoader.style.display = 'inline-block'

  // Add user message to chat
  addMessage(message, 'user')
  input.value = ''

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        history: conversationHistory
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Add AI response to chat
    addMessage(data.response, 'bot')
    
    // Update code output
    if (data.code) {
      document.getElementById('codeOutput').innerHTML = `<code>${escapeHtml(data.code)}</code>`
    }

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.response }
    )

    // Keep only last 10 messages to avoid token limits
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10)
    }

  } catch (error) {
    console.error('Error:', error)
    addMessage(`Error: ${error.message}. Make sure the server is running and GROQ_API_KEY is set.`, 'bot')
  } finally {
    // Re-enable input
    input.disabled = false
    sendBtn.disabled = false
    btnText.style.display = 'inline'
    btnLoader.style.display = 'none'
    input.focus()
  }
}

function addMessage(text, sender) {
  const chatContainer = document.getElementById('chatContainer')
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${sender}-message`
  
  const contentDiv = document.createElement('div')
  contentDiv.className = 'message-content'
  
  if (sender === 'user') {
    contentDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(text)}`
  } else {
    contentDiv.innerHTML = `<strong>AI Agent:</strong> ${escapeHtml(text)}`
  }
  
  messageDiv.appendChild(contentDiv)
  chatContainer.appendChild(messageDiv)
  chatContainer.scrollTop = chatContainer.scrollHeight
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function copyCode() {
  const codeOutput = document.getElementById('codeOutput')
  const code = codeOutput.textContent
  
  navigator.clipboard.writeText(code).then(() => {
    const copyBtn = document.querySelector('.copy-btn')
    const originalText = copyBtn.textContent
    copyBtn.textContent = 'Copied!'
    setTimeout(() => {
      copyBtn.textContent = originalText
    }, 2000)
  }).catch(err => {
    console.error('Failed to copy:', err)
    alert('Failed to copy code')
  })
}

// Allow Enter to send (Shift+Enter for new line)
document.getElementById('userInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})

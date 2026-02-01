/**
 * Unified LLM Service - Supports multiple AI providers
 * Similar to LangChain's approach with a common interface
 */

const LLM_PROVIDERS = {
  GROQ: 'groq',
  GEMINI: 'gemini',
  ANTHROPIC: 'anthropic'
}

const LLM_MODELS = {
  [LLM_PROVIDERS.GROQ]: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
  ],
  [LLM_PROVIDERS.GEMINI]: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash (Latest)' }
  ],
  [LLM_PROVIDERS.ANTHROPIC]: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
  ]
}

class LLMService {
  constructor() {
    this.provider = this.getStoredProvider() || LLM_PROVIDERS.GEMINI
    this.model = this.getStoredModel()
  }

  getStoredProvider() {
    return localStorage.getItem('LLM_PROVIDER')
  }

  getStoredModel() {
    const provider = this.getStoredProvider() || LLM_PROVIDERS.GEMINI
    const stored = localStorage.getItem('LLM_MODEL')
    if (stored) return stored
    // Return default model for provider
    return LLM_MODELS[provider][0].id
  }

  setProvider(provider) {
    this.provider = provider
    localStorage.setItem('LLM_PROVIDER', provider)
    // Set default model for new provider
    this.model = LLM_MODELS[provider][0].id
    localStorage.setItem('LLM_MODEL', this.model)
  }

  setModel(model) {
    this.model = model
    localStorage.setItem('LLM_MODEL', model)
  }

  getApiKey() {
    const keyName = `${this.provider.toUpperCase()}_API_KEY`
    return localStorage.getItem(keyName)
  }

  setApiKey(apiKey) {
    const keyName = `${this.provider.toUpperCase()}_API_KEY`
    localStorage.setItem(keyName, apiKey)
  }

  clearApiKey() {
    const keyName = `${this.provider.toUpperCase()}_API_KEY`
    localStorage.removeItem(keyName)
  }

  async chat(messages, systemPrompt) {
    const apiKey = this.getApiKey()
    
    if (!apiKey) {
      throw new Error(`API key required for ${this.provider}`)
    }

    switch (this.provider) {
      case LLM_PROVIDERS.GROQ:
        return this.chatGroq(messages, systemPrompt, apiKey)
      case LLM_PROVIDERS.GEMINI:
        return this.chatGemini(messages, systemPrompt, apiKey)
      case LLM_PROVIDERS.ANTHROPIC:
        return this.chatAnthropic(messages, systemPrompt, apiKey)
      default:
        throw new Error(`Unknown provider: ${this.provider}`)
    }
  }

  async chatGroq(messages, systemPrompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Groq API request failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  }

  async chatGemini(messages, systemPrompt, apiKey) {
    // Gemini uses a different format - combine system prompt with first message
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Prepend system prompt to first user message
    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Gemini API request failed')
    }

    const data = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || 'No response generated'
  }

  async chatAnthropic(messages, systemPrompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Anthropic API request failed')
    }

    const data = await response.json()
    return data.content[0]?.text || 'No response generated'
  }

  getProviderInfo() {
    const urls = {
      [LLM_PROVIDERS.GROQ]: 'https://console.groq.com',
      [LLM_PROVIDERS.GEMINI]: 'https://aistudio.google.com/apikey',
      [LLM_PROVIDERS.ANTHROPIC]: 'https://console.anthropic.com'
    }

    return {
      provider: this.provider,
      model: this.model,
      apiUrl: urls[this.provider],
      hasApiKey: !!this.getApiKey()
    }
  }
}

module.exports = { LLMService, LLM_PROVIDERS, LLM_MODELS }

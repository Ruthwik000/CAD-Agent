// Test script to list all available Gemini models
const API_KEY = 'AIzaSyB7jFzyPYEWNPDhwo89DFxGDL8M3K0rD-A'

async function listGeminiModels() {
  try {
    console.log('Fetching available Gemini models...\n')
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Error:', error)
      return
    }

    const data = await response.json()
    
    console.log('Available Gemini Models:\n')
    console.log('=' .repeat(80))
    
    data.models.forEach(model => {
      console.log(`\nModel: ${model.name}`)
      console.log(`Display Name: ${model.displayName}`)
      console.log(`Description: ${model.description}`)
      console.log(`Supported Methods: ${model.supportedGenerationMethods.join(', ')}`)
      console.log('-'.repeat(80))
    })

    console.log('\n\nModels that support generateContent:\n')
    const generateContentModels = data.models.filter(m => 
      m.supportedGenerationMethods.includes('generateContent')
    )
    
    generateContentModels.forEach(model => {
      const modelId = model.name.replace('models/', '')
      console.log(`  - ${modelId} (${model.displayName})`)
    })

  } catch (error) {
    console.error('Error fetching models:', error)
  }
}

listGeminiModels()

const express = require('express');
const axios = require('axios');
const Item = require('../models/Item');

const router = express.Router();

// Simple built-in AI for fallback (completely free)
const simpleAI = (query, items) => {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(' ').filter(word => word.length > 2);
  
  // Intent detection
  let intent = 'search';
  let duration = null;
  let category = null;
  
  // Extract duration
  const durationMatch = query.match(/(\d+)\s*(day|days|week|weeks)/i);
  if (durationMatch) {
    duration = durationMatch[1] + ' ' + durationMatch[2];
  }
  
  // Category mapping
  const categoryMap = {
    'drill': 'Tools', 'tool': 'Tools', 'hammer': 'Tools', 'saw': 'Tools',
    'camera': 'Electronics', 'phone': 'Electronics', 'laptop': 'Electronics', 'speaker': 'Electronics',
    'book': 'Books', 'novel': 'Books', 'textbook': 'Books', 'guide': 'Books',
    'tennis': 'Sports', 'football': 'Sports', 'basketball': 'Sports', 'racket': 'Sports',
    'kitchen': 'Kitchen', 'cooking': 'Kitchen', 'mixer': 'Kitchen', 'blender': 'Kitchen',
    'garden': 'Garden', 'plant': 'Garden', 'hose': 'Garden', 'shovel': 'Garden'
  };
  
  // Find category from query
  for (let [keyword, cat] of Object.entries(categoryMap)) {
    if (queryLower.includes(keyword)) {
      category = cat;
      break;
    }
  }
  
  // Score items based on relevance
  const scoredItems = items.map(item => {
    let score = 0;
    const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    
    // Exact title match gets highest score
    if (itemText.includes(queryLower)) score += 10;
    
    // Category match
    if (category && item.category === category) score += 8;
    
    // Keyword matching
    keywords.forEach(keyword => {
      if (itemText.includes(keyword)) score += 3;
    });
    
    // Boost available items
    if (item.available) score += 2;
    
    return { ...item.toObject(), score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Generate response
  let response = '';
  if (scoredItems.length === 0) {
    response = `I couldn't find any items matching "${query}". Try browsing by category or using different keywords.`;
  } else {
    const topItem = scoredItems[0];
    response = `Found ${scoredItems.length} relevant item(s) for "${query}". `;
    
    if (duration) {
      response += `For ${duration}, `;
    }
    
    response += `I recommend "${topItem.title}" in the ${topItem.category} category. `;
    
    if (topItem.pricePerDay > 0) {
      response += `It costs $${topItem.pricePerDay}/day. `;
    } else {
      response += `It's free to borrow! `;
    }
    
    if (scoredItems.length > 1) {
      response += `Other options include: ${scoredItems.slice(1, 3).map(item => item.title).join(', ')}.`;
    }
  }
  
  return { response, items: scoredItems };
};

// AI-powered search using Ollama with built-in fallback
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get all available items
    const allItems = await Item.find({ available: true })
      .populate('owner', 'name')
      .select('title description category pricePerDay available');

    if (allItems.length === 0) {
      return res.json({ 
        items: [], 
        aiResponse: 'No items available for borrowing at the moment.',
        aiType: 'built-in'
      });
    }

    // Try Ollama first (free local LLM)
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      
      // Prepare item data for AI
      const itemsData = allItems.map(item => ({
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.pricePerDay > 0 ? `$${item.pricePerDay}/day` : 'Free'
      }));

      // Create AI prompt for Ollama
      const prompt = `You are a helpful assistant for a community item sharing platform. 
User query: "${query}"

Available items:
${itemsData.map(item => `- ${item.title} (${item.category}): ${item.description} - ${item.price}`).join('\n')}

Respond naturally and helpfully. Recommend the most relevant items based on the user's query. Keep it conversational and friendly. If asking for duration, acknowledge it. Mention if items are free or paid.`;

      console.log('🤖 Trying Ollama AI...');
      
      const ollamaResponse = await axios.post(`${ollamaUrl}/api/generate`, {
        model: 'llama3.2', // Free model
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 200
        }
      }, {
        timeout: 8000 // 8 second timeout
      });

      const aiResponse = ollamaResponse.data.response;

      // Filter items based on AI response and query
      const relevantItems = allItems.filter(item => {
        const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        const queryLower = query.toLowerCase();
        const aiResponseLower = aiResponse.toLowerCase();
        
        return itemText.includes(queryLower) || 
               aiResponseLower.includes(item.title.toLowerCase()) ||
               aiResponseLower.includes(item.category.toLowerCase()) ||
               queryLower.split(' ').some(word => 
                 word.length > 2 && itemText.includes(word)
               );
      });

      console.log('✅ Ollama AI response generated');
      
      return res.json({
        items: relevantItems.length > 0 ? relevantItems : allItems.slice(0, 6),
        aiResponse: aiResponse,
        totalItems: allItems.length,
        aiType: 'ollama',
        model: 'llama3.2 (Free Local LLM)'
      });

    } catch (ollamaError) {
      console.log('⚠️ Ollama not available, using built-in AI:', ollamaError.message);
      
      // Fallback to built-in free AI
      const builtInResult = simpleAI(query, allItems);
      
      return res.json({
        items: builtInResult.items.length > 0 ? builtInResult.items : allItems.slice(0, 6),
        aiResponse: builtInResult.response,
        totalItems: allItems.length,
        aiType: 'built-in',
        model: 'Built-in Smart Search (Always Free)',
        fallback: true
      });
    }

  } catch (error) {
    console.error('AI Search error:', error);
    
    // Final fallback - simple text search
    try {
      const allItems = await Item.find({ available: true })
        .populate('owner', 'name');
      
      const fallbackItems = allItems.filter(item => {
        const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        return itemText.includes(query.toLowerCase());
      });

      res.json({
        items: fallbackItems.length > 0 ? fallbackItems : allItems.slice(0, 6),
        aiResponse: `Basic search results for: "${query}". ${fallbackItems.length > 0 ? 'Found matching items!' : 'Showing all available items.'}`,
        totalItems: allItems.length,
        aiType: 'basic',
        model: 'Basic Text Search',
        error: true
      });
    } catch (finalError) {
      res.status(500).json({ 
        message: 'Search error', 
        error: finalError.message,
        items: []
      });
    }
  }
});

module.exports = router;
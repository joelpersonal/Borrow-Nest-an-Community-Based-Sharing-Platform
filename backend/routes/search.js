const express = require('express');
const axios = require('axios');
const Item = require('../models/Item');

const router = express.Router();

// Simple search helper
const searchItems = (query, items) => {
  const searchTerm = query.toLowerCase();
  const keywords = searchTerm.split(' ').filter(word => word.length > 2);
  
  let category = null;
  let duration = null;
  
  // Extract duration from query
  const durationMatch = query.match(/(\d+)\s*(day|days|week|weeks)/i);
  if (durationMatch) {
    duration = durationMatch[1] + ' ' + durationMatch[2];
  }
  
  // Map keywords to categories
  const categoryMap = {
    'drill': 'Tools', 'tool': 'Tools', 'hammer': 'Tools',
    'camera': 'Electronics', 'phone': 'Electronics', 'laptop': 'Electronics',
    'book': 'Books', 'novel': 'Books', 'guide': 'Books',
    'tennis': 'Sports', 'football': 'Sports', 'sport': 'Sports',
    'kitchen': 'Kitchen', 'cooking': 'Kitchen', 'mixer': 'Kitchen',
    'garden': 'Garden', 'plant': 'Garden', 'hose': 'Garden'
  };
  
  // Find category from keywords
  for (let [keyword, cat] of Object.entries(categoryMap)) {
    if (searchTerm.includes(keyword)) {
      category = cat;
      break;
    }
  }
  
  // Score and filter items
  const scoredItems = items.map(item => {
    let score = 0;
    const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    
    // Exact matches get higher scores
    if (itemText.includes(searchTerm)) score += 10;
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
  
  // Generate response message
  let message = '';
  if (scoredItems.length === 0) {
    message = `No items found for "${query}". Try different keywords.`;
  } else {
    const topItem = scoredItems[0];
    message = `Found ${scoredItems.length} item(s) for "${query}". `;
    
    if (duration) {
      message += `For ${duration}, `;
    }
    
    message += `Top result: "${topItem.title}" in ${topItem.category}. `;
    
    if (topItem.pricePerDay > 0) {
      message += `Price: $${topItem.pricePerDay}/day.`;
    } else {
      message += `Available for free!`;
    }
  }
  
  return { items: scoredItems, message };
};

// AI search endpoint
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    // Get available items
    const allItems = await Item.find({ available: true })
      .populate('owner', 'name')
      .select('title description category pricePerDay available');

    if (allItems.length === 0) {
      return res.json({ 
        items: [], 
        message: 'No items available for borrowing',
        searchType: 'empty'
      });
    }

    // Try Ollama AI first
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      
      const itemsData = allItems.map(item => ({
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.pricePerDay > 0 ? `$${item.pricePerDay}/day` : 'Free'
      }));

      const prompt = `Help find items for: "${query}"

Available items:
${itemsData.map(item => `- ${item.title} (${item.category}): ${item.description} - ${item.price}`).join('\n')}

Recommend the best matches and explain why they fit the request.`;

      console.log('Trying Ollama AI search...');
      
      const response = await axios.post(`${ollamaUrl}/api/generate`, {
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.7, max_tokens: 200 }
      }, { timeout: 8000 });

      const aiMessage = response.data.response;

      // Filter items based on AI response and query
      const relevantItems = allItems.filter(item => {
        const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        const queryLower = query.toLowerCase();
        const aiLower = aiMessage.toLowerCase();
        
        return itemText.includes(queryLower) || 
               aiLower.includes(item.title.toLowerCase()) ||
               aiLower.includes(item.category.toLowerCase()) ||
               queryLower.split(' ').some(word => 
                 word.length > 2 && itemText.includes(word)
               );
      });

      console.log('Ollama AI search completed');
      
      return res.json({
        items: relevantItems.length > 0 ? relevantItems : allItems.slice(0, 6),
        message: aiMessage,
        totalItems: allItems.length,
        searchType: 'ai',
        model: 'Ollama (Local AI)'
      });

    } catch (ollamaError) {
      console.log('Ollama not available, using built-in search');
      
      // Fallback to built-in search
      const searchResult = searchItems(query, allItems);
      
      return res.json({
        items: searchResult.items.length > 0 ? searchResult.items : allItems.slice(0, 6),
        message: searchResult.message,
        totalItems: allItems.length,
        searchType: 'builtin',
        model: 'Built-in Search'
      });
    }

  } catch (error) {
    console.error('Search error:', error);
    
    // Final fallback
    try {
      const allItems = await Item.find({ available: true }).populate('owner', 'name');
      
      const basicResults = allItems.filter(item => {
        const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        return itemText.includes(query.toLowerCase());
      });

      res.json({
        items: basicResults.length > 0 ? basicResults : allItems.slice(0, 6),
        message: `Basic search results for: "${query}"`,
        totalItems: allItems.length,
        searchType: 'basic',
        model: 'Basic Text Search'
      });
    } catch (finalError) {
      res.status(500).json({ 
        message: 'Search failed', 
        error: finalError.message,
        items: []
      });
    }
  }
});

module.exports = router;
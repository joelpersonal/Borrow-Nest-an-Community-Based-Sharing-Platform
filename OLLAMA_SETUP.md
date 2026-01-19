# 🤖 Ollama Setup Guide - Free Local AI

Ollama is a **completely free** tool that runs AI models locally on your computer. No internet required, no API keys, no costs!

## 🚀 Quick Installation

### Windows
1. **Download**: Go to [ollama.ai](https://ollama.ai) 
2. **Install**: Download and run the Windows installer
3. **Verify**: Open Command Prompt and type: `ollama --version`

### Mac
```bash
# Using Homebrew
brew install ollama

# Or download from ollama.ai
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 📦 Install Free Models

After installing Ollama, install these **free** models:

```bash
# Recommended: Fast and efficient (1.5GB)
ollama pull llama3.2

# Alternative options:
ollama pull mistral        # 4GB - Good for complex queries
ollama pull codellama      # 3.8GB - Great for technical searches
ollama pull phi3          # 2.3GB - Microsoft's efficient model
```

## 🔧 Start Ollama Service

```bash
# Start the service (runs in background)
ollama serve

# Test if it's working
ollama list
```

## ✅ Verify Setup

1. **Check if running**: Visit http://localhost:11434 in browser
2. **Test in Borrow Nest**: Go to AI Search and try: "I need a drill"
3. **Look for**: "🤖 Ollama AI (Local LLM)" in the response

## 🎯 Benefits of Local AI

### ✅ **Completely Free**
- No subscription fees
- No API costs
- No usage limits

### 🔒 **Privacy First**
- Data never leaves your computer
- No internet required for AI
- Complete offline functionality

### ⚡ **Fast & Reliable**
- No network delays
- Always available
- No rate limiting

## 🔧 Troubleshooting

### Ollama Not Starting?
```bash
# Check if service is running
ollama ps

# Restart service
ollama serve
```

### Model Not Found?
```bash
# List installed models
ollama list

# Pull the model again
ollama pull llama3.2
```

### Port Issues?
- Default port: 11434
- Check if another service is using the port
- Restart Ollama service

## 🚀 Advanced Usage

### Multiple Models
```bash
# Install multiple models for different use cases
ollama pull llama3.2      # General purpose
ollama pull mistral       # Complex reasoning
ollama pull codellama     # Technical queries
```

### Model Management
```bash
# List all models
ollama list

# Remove a model to save space
ollama rm mistral

# Update a model
ollama pull llama3.2
```

## 💡 Tips for Best Performance

1. **RAM Requirements**:
   - llama3.2: 2GB RAM minimum
   - mistral: 4GB RAM minimum
   - For 8GB+ RAM: Any model works well

2. **Storage Space**:
   - Each model: 1-7GB disk space
   - Install on SSD for faster loading

3. **CPU Usage**:
   - Uses CPU by default
   - GPU acceleration available for NVIDIA cards

## 🔄 Fallback System

Don't worry if Ollama isn't available! Borrow Nest includes:

1. **Built-in Smart AI**: Always works, no setup needed
2. **Basic Text Search**: Simple keyword matching
3. **Graceful Degradation**: App works with or without Ollama

## 🆘 Need Help?

### Common Issues:
- **"Connection refused"**: Ollama service not running → Run `ollama serve`
- **"Model not found"**: Model not installed → Run `ollama pull llama3.2`
- **Slow responses**: Large model on low RAM → Try `ollama pull phi3`

### Resources:
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Model Library](https://ollama.ai/library)
- [Community Support](https://github.com/ollama/ollama/discussions)

---

**🎉 Enjoy your free, private, offline AI assistant!**
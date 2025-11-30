# Archon with Ollama Configuration

## Issue Summary
The Archon application requires a valid OpenAI API key during startup, even when planning to use Ollama as the LLM provider. The application fails during initialization with the error:
`src.server.config.config.ConfigurationError: OpenAI API key must start with 'sk-'`

## Resolution Steps for Using Ollama

### 1. Initial Setup with Valid OpenAI Key
1. First, set a temporary valid OpenAI API key in your .env file:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   (where 'x' represents valid key characters)

2. Start the services:
   ```bash
   docker compose up -d
   ```

### 2. Configure for Ollama via Database Settings
Once services are running and Archon is initialized:
1. Access the Archon UI at http://localhost:3737
2. Complete the onboarding flow
3. Navigate to Settings
4. Change the LLM provider to Ollama
5. Set the base URL to http://host.docker.internal:11434/v1
6. Set the model to llama3.2 (or your preferred Ollama model)

### 3. Alternative: Environment-based Configuration
After first initialization with a valid OpenAI key, you can set these environment variables in docker-compose.yml:

```yaml
archon-server:
  # ... other configuration
  environment:
    - LLM_PROVIDER=ollama
    - LLM_BASE_URL=http://host.docker.internal:11434/v1
    - MODEL_CHOICE=llama3.2
    - EMBEDDING_MODEL=text-embedding-3-small
    # After initial setup, you can use a fake key that has the right format
    - OPENAI_API_KEY=sk-fake4242xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. For Vite Proxy Error Resolution
The proxy error `ECONNREFUSED 172.22.0.2:8181` occurs because the Archon server is not responding properly. This will be resolved once the startup validation passes with a valid API key.

### 5. Complete Configuration Example
```env
# Archon Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Valid key required for startup
LLM_PROVIDER=ollama
LLM_BASE_URL=http://host.docker.internal:11434/v1
MODEL_CHOICE=llama3.2
EMBEDDING_MODEL=text-embedding-3-small
```

## Important Notes
- Archon's architecture requires a valid OpenAI API key format during initial startup
- The actual LLM provider can be changed to Ollama after initial setup
- Once properly configured, the OpenAI key won't be used if Ollama is selected as the provider
- The Supabase configuration is correctly set and working

## Required Next Steps
To fully resolve this issue and use Ollama:
1. Obtain a valid OpenAI API key (even temporary/limited)
2. Run the application with that key to complete initialization
3. Configure the system to use Ollama via the web interface or database settings
4. Optionally, use the environment variables to specify Ollama as the default provider
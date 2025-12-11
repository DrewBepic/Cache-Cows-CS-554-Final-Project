# Cache-Cows-CS554-Final-Project
Cache Cows CS554 Final Project

# Installation Steps

### 1. Install Elasticsearch Server

Add the Elasticsearch tap to Homebrew:
```bash
brew tap elastic/tap
```

Install Elasticsearch 7.17.4:
```bash
brew install elastic/tap/elasticsearch-full@7.17.4
```

### 2. Start Elasticsearch

#### Option A: Start as a Background Service (Recommended)
```bash
brew services start elasticsearch-full
```

This will automatically start Elasticsearch in the background and restart it on system reboot.

#### Option B: Start Manually
If you need more control or want to see logs:
```bash
/opt/homebrew/Cellar/elasticsearch-full/7.17.4/libexec/bin/elasticsearch -E xpack.ml.enabled=false
```


### 3. Verify Installation

Check if Elasticsearch is running:
```bash
curl http://localhost:9200
```
You should see a JSON response

### 4. Install Client Library

Navigate to your project directory and install the Elasticsearch Node.js client:
```bash
npm install @elastic/elasticsearch
# Cache-Cows-CS554-Final-Project
Cache Cows CS554 Final Project

## Installation Steps

### 1. Install Elasticsearch Server

Add the Elasticsearch tap to Homebrew:
```bash
brew tap elastic/tap
```

Install Elasticsearch 7.17.4:
```bash
brew install elastic/tap/elasticsearch-full@7.17.4
```

### 2. Install Project Dependencies

Navigate to your project directory and install required packages:
```bash
npm install
npm install @elastic/elasticsearch
```

### 3. Start Elasticsearch Server

Run your Elasticsearch server on your computer:

```bash
brew services start elasticsearch-full
```

**OR** (if you prefer manual start):

```bash
/opt/homebrew/Cellar/elasticsearch-full/7.17.4/libexec/bin/elasticsearch -E xpack.ml.enabled=false
```

> **Note:** These are commands for macOS. The path may vary on your system. Please search for the appropriate Elasticsearch installation path for your operating system.

### 4. Verify Elasticsearch is Running

Test if Elasticsearch server is running by checking the cities index:

```bash
curl http://localhost:9200/cities/_count
```

#### Expected Responses:

**Before indexing (Elasticsearch is running correctly):**
```json
{
  "error": {
    "root_cause": [
      {
        "type": "index_not_found_exception",
        "reason": "no such index [cities]",
        "resource.type": "index_or_alias",
        "resource.id": "cities",
        "index_uuid": "_na_",
        "index": "cities"
      }
    ],
    "type": "index_not_found_exception",
    "reason": "no such index [cities]",
    "resource.type": "index_or_alias",
    "resource.id": "cities",
    "index_uuid": "_na_",
    "index": "cities"
  },
  "status": 404
}
```

**After indexing (ready to use):**
```json
{
  "count": 162981,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  }
}
```

### 5. Index Cities Data

If you haven't indexed yet, run the indexing script:

```bash
node ./server/src/tests/runindexing.js
```

#### Expected Output:
```
🚀 Starting city indexing...
Success Created cities index
Successfully indexed 162981 cities
Success Indexed 162981 cities
✅ City indexing completed!
```

### 6. You're Ready!

After successful indexing, your Elasticsearch server is ready for searching. You can now use the search cities feature in the application.

---

## Quick Start Summary

```bash
# 1. Start Elasticsearch
brew services start elasticsearch-full

# 2. Verify it's running
curl http://localhost:9200/cities/_count

# 3. Index cities (first time only)
node ./server/src/tests/runindexing.js

# 4. Start your application
npm start
```

## Troubleshooting

- **Elasticsearch won't start**: Check if port 9200 is already in use
- **Index not found error persists**: Make sure you ran the indexing script
- **Path errors**: Update the Elasticsearch path to match your installation directory

## Additional Commands

### Stop Elasticsearch
```bash
brew services stop elasticsearch-full
```

### Restart Elasticsearch
```bash
brew services restart elasticsearch-full
```

### Check Elasticsearch Status
```bash
brew services list | grep elasticsearch
```

### Clear Elasticsearch Index (if needed)
```bash
curl -X DELETE http://localhost:9200/cities
```

Then re-run the indexing script to rebuild the index.
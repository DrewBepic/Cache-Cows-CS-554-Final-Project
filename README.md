# Cache-Cows-CS554-Final-Project

A social travel recommendation platform where users can discover, review, and share places with friends.

---

## 🚀 Setup Instructions

### 1. Install Required Services

**Elasticsearch 7.17.4:**
```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full@7.17.4
```

**ImageMagick:**
```bash
brew install imagemagick
```

### 2. Start Elasticsearch Server

```bash
brew services start elasticsearch-full
```

**Verify Elasticsearch is running:**
```bash
curl http://localhost:9200
```

[Manual start & troubleshooting guide →](#-elasticsearch-setup-details)

### 3. Add `.env` File

Create a `.env` file in the **project root** with your Google Maps API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Install Dependencies & Seed Database 

```bash
npm install

# Seed database (includes indexing cities)
npm run seed

```

### 5. Start the Application

```bash
npm start
```

### 6. Open in Browser

```
http://localhost:5173/
```

---

## 📖 Elasticsearch Setup Details

### Manual Start (Alternative)
```bash
/opt/homebrew/Cellar/elasticsearch-full/7.17.4/libexec/bin/elasticsearch -E xpack.ml.enabled=false
```
> Note: Path may vary on your system.

### Verify Elasticsearch is Working

**Before indexing:**
```bash
curl http://localhost:9200/cities/_count
```
Should return: `"status": 404` (index not found - this is correct)


**Manual indexing:**
```
# Only index cities
npm run index-cities
```
**After running seed file:**
```bash
curl http://localhost:9200/cities/_count
```
Should return: `"count": 162981` (cities indexed successfully)

---

## Tech Stack

- **Frontend:** React + Apollo Client
- **Backend:** Node.js + Express + Apollo Server
- **Database:** MongoDB
- **Cache:** Redis
- **Search:** Elasticsearch
- **API:** Google Maps Places API

---
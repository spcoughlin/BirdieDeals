# 🐦 BirdieDeals

**Smarter golf equipment deals, personalized to your bag and how you play.**

BirdieDeals is a golf-focused affiliate marketplace that helps golfers find better equipment deals by understanding their actual golf bag, playing habits, and skill level.

Instead of blasting generic promotions, BirdieDeals uses golf-specific data like club lofts, distances, play frequency, and budget preferences to recommend deals that actually make sense for each golfer.

---

## How it works

1. **Build your golf profile**
   Golfers create an account and enter:

   * Their clubs and specs
   * Handicap and distances
   * How often and where they play
   * Budget and brand preferences

2. **Golf-specific intelligence**
   BirdieDeals analyzes the bag to detect:

   * Distance gaps
   * Worn wedges and grips
   * Mismatches between skill level and equipment
   * Upgrade timing based on usage, not hype

3. **Personalized deal recommendations**
   Golfers see:

   * Featured deals anyone can browse
   * Suggested deals tailored to their bag and play style
   * Value-first options like used and previous-generation gear

4. **Lifecycle marketing powered by Klaviyo**
   Golf profile data and intent signals are sent to Klaviyo to:

   * Build high-intent segments
   * Trigger email or SMS recommendations
   * Personalize messaging using golf-specific context

---

## Why BirdieDeals

Most golf deal sites treat every golfer the same.

BirdieDeals is built around the idea that **what you should buy depends on what’s already in your bag, how often you play, and what actually improves your game**.

This approach:

* Reduces bad recommendations
* Builds trust with golfers
* Creates higher-quality affiliate traffic for brands

---

## Tech stack

* **Frontend:** React (Vite)
* **Backend:** FastAPI (Python)
* **Database:** MongoDB
* **Personalization & messaging:** Klaviyo APIs
* **Auth:** JWT-based authentication
* **Deployment:** Local or cloud-hosted

---

## Installation

### Prerequisites

* Node.js 18+
* Python 3.10+
* MongoDB (local or cloud)
* Klaviyo API key

---

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

### Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will run at:

```
http://localhost:8000
```

---

## Environment variables

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb://localhost:27017/birdiedeals
JWT_SECRET=your_secret_key
KLAVIYO_API_KEY=your_klaviyo_api_key
```

---

## Project status

This project was built as part of a short winter hackathon.

Current scope:

* Core account creation and login
* Golf bag and player profile survey
* Featured deals (public)
* Suggested deals (personalized)
* Klaviyo integration for profile data and lifecycle messaging

Future work:

* Expanded deal ingestion
* More advanced fit and wear modeling
* Brand-side dashboards
* Deeper Klaviyo flow automation

---

## Disclaimer

BirdieDeals is a prototype and does not currently process purchases.
All outbound links are intended to represent affiliate or partner destinations.

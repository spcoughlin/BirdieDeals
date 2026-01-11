
# BirdieDeals

  https://birdiedealsfrontend.onrender.com/

**A Highly Personalized Golf Affiliate Marketing Website**

  

BirdieDeals is a golf-focused affiliate marketplace that helps golfers find better equipment deals by understanding their golf bag, playing habits, and skill level.

  

Instead of blasting generic promotions, BirdieDeals uses golf-specific data like club lofts, distances, play frequency, and budget preferences to create insights and recommend deals that actually make sense for each golfer.

These insights are used to display relevant deals for each golfer, and are provided to Klaviyo for marketers to run intensely specific and highly successful campaigns.

**Examples**:
A user enters their golf bag, and their wedges are 5 years old. -> [Email via Klaviyo] "It looks like your wedges are getting worn, you could be missing out on spin. Here are some deals on new ones"

A user enters that their driver goes 250 yards, but their next highest club goes 210. -> [Email via Klaviyo] "Never know what to hit from 230 yards out? Here are some deals on new fairway woods."
  

---

  

## How it works

  

1.  **Build your golf profile**

Golfers create an account and enter:

  

* Their clubs and specs

* Handicap and distances

* How often and where they play

* Budget and brand preferences

  

2.  **Golf-specific intelligence**

BirdieDeals analyzes the bag to detect:

  

* Distance gaps

* Worn wedges and grips

* Mismatches between skill level and equipment

* Upgrade timing based on usage

  

3.  **Personalized deal recommendations**

Golfers see:

  

* Featured deals anyone can browse

* Suggested deals tailored to their bag and play style

* Value-first options like used and previous-generation gear

  

4.  **Lifecycle marketing powered by Klaviyo**

Golf profile data and intent signals are sent to Klaviyo to:

  

* Build high-intent segments

* Trigger email or SMS recommendations

* Personalize messaging using golf-specific context

  

---

  



  

## Tech stack

  

*  **Frontend:** React (Vite)

*  **Backend:** FastAPI (Python)

*  **Database:** MongoDB

*  **Personalization & messaging:** Klaviyo APIs

*  **Deployment:** For the hackathon, Render, can be hosted locally

  

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

cd  frontend

npm  install

npm  run  dev

```

  

The frontend will be available at:

  

```

http://localhost:5173

```

  

---

  

### Backend setup

  

```bash

cd  backend

python  -m  venv  venv

source  venv/bin/activate

pip  install  -r  requirements.txt

uvicorn  main:app  --reload

```

  

The API will run at:

  

```

http://localhost:8000

```

  

---


  

---

  

## Project status

  

This project was built as part of a short Klaviyo winter hackathon.

  

Current scope:

  

* Core account creation and login

* Golf bag and player profile survey

* Featured deals (public)

* Suggested deals (personalized)

* Klaviyo integration for profile data and lifecycle messaging

  

Future work:

  

* Expanded deal ingestion, partnerships with big retailers for affiliate promotions

* More advanced fit and wear modeling

* Brand-side dashboards

* Deeper Klaviyo flow automation
---


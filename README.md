# DraftVision AI

DraftVision AI is an intelligent web platform developed to predict NFL draft positions for college football athletes. By integrating machine learning models with a comprehensive player database, the system provides draft round projections based on both historical data and current performance metrics. This tool is designed to assist scouts, analysts, and sports enthusiasts in evaluating collegiate talent and potential NFL outcomes.

Developed as a senior capstone project in the Department of Computer Science and Engineering at the University of South Carolina.

## Live Deployment

A production deployment of the system is available here:  
**[draftvision-ai-cfd79.web.app](https://draftvision-ai-cfd79.web.app/)**

**Admin Demo Credentials:**  
- Email: `draftvisionAI@test.com`  
- Password: `DraftVision123`

## Features

- Interactive draft projection interface
- Historical player lookup and filtering by year, position, and performance
- Machine learning-powered draft round predictions
- Player comparison tool and create-a-player simulator with pro comparisons
- Mock draft simulator with round and year selection
- Community features including:
  - User sign-up and login with Supabase authentication
  - Public and private saved mock drafts
  - Commenting, liking, and LLM-based draft feedback
  - Draft grading and sharing system

## Tech Stack

- **Frontend:** React.js, HTML/CSS, Plotly.js  
- **Backend:** Django, Django REST Framework  
- **Database:** PostgreSQL (via Supabase)  
- **ML Modeling:** scikit-learn, PyTorch  
- **Hosting:** Firebase (frontend), Railway (backend), Supabase (auth & DB)

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Node.js & npm (for frontend)

Install Python:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

**macOS:**
```bash
brew install python3
```

**Windows:**
Download Python from [python.org](https://www.python.org/downloads/)

### Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/joshuamoorehead/draft-vision-ai-capstone.git
cd draft-vision-ai-capstone

# Create and activate a virtual environment
python3 -m venv draftvision_env
source draftvision_env/bin/activate  # On Windows: draftvision_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Import starter stats
python manage.py import_stats

# Run development server
python manage.py runserver
```

Access the app at: `http://localhost:8000`

### Frontend Setup (React)

```bash
cd draftvision_frontend
npm install
npm start
```

## Testing

Tests are located in `dv/db/tests.py`. To run:

```bash
cd dv
python manage.py test --keepdb
```

## Code Style

We follow the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html). To auto-format:

```bash
black .
```

## Contribution Guidelines

- Create a new branch for each feature or bug fix
- Pull latest changes before starting
- Run tests before pushing
- Use clear, concise commit messages
- Update `requirements.txt` if new packages are added:
```bash
pip freeze > requirements.txt
```

## Project Contributors

- **Joshua Moorehead** – moorehj@email.sc.edu  
- **Tyler Super** – tsuper@email.sc.edu  
- **Ryan Karbowniczak** – rkarbow@email.sc.edu  
- **Zak Elguindi** – elguindi@email.sc.edu  
- **Lucas Aust** – laust@email.sc.edu

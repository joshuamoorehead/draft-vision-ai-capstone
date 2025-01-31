# DraftVision AI

DraftVision AI is an intelligent system designed to predict NFL draft positions for college football athletes. Using machine learning algorithms and comprehensive player data, our platform aims to provide accurate draft round projections. This tool will be valuable for scouts, team managers, and football enthusiasts to assess collegiate talent and their potential NFL draft outcomes.

## External Requirements

In order to build and run this project, you need to install:

- [Python](https://www.python.org/downloads/) (3.8 or higher)
- [Django](https://www.djangoproject.com/download/)

For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

For macOS (using Homebrew):
```bash
brew install python3
```

For Windows:
- Download and install Python from python.org

## Setup

1. Clone the repository:
```bash
git clone https://github.com/SCCapstone/draft-vision-ai.git
cd draft-vision-ai
```

2. Create and activate a virtual environment:
```bash
# For Windows
python -m venv draftvision_env
draftvision_env\Scripts\activate

# For macOS/Linux
python3 -m venv draftvision_env
source draftvision_env/bin/activate
```

3. Install required Python packages:
```bash
pip install -r requirements.txt
```

## Running

Navigate to the project directory and run the following commands:

1. Import required statistics:
```bash
python manage.py import_stats
```

2. Start the development server:
```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

If port 8000 is already in use, you can specify a different port:
```bash
python manage.py runserver 8001
```

## Testing
The tests are located in draft-vision-ai\dv\db\tests.py  
To run test: open the project file in your terminal  
navigate to the dv foler with: cd dv  
To run the tests execute this command: python manage.py test --keepdb

## Coding Style

We follow the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) for our Python code. We use the `black` code formatter to maintain consistent code style.

To format your code:
```bash
black .
```

## Authors

- Joshua Moorehead - moorehj@email.sc.edu
- Tyler Super - tsuper@email.sc.edu
- Ryan Karbowniczak - rkarbow@email.sc.edu
- Zak Elguindi - elguindi@email.sc.edu
- Lucas Aust - laust@email.sc.edu

## Notes for Developers

- Make sure to pull the latest changes before starting work
- Create a new branch for each feature
- Run tests before submitting pull requests
- The project uses SQLite for now as the database, which requires no additional configuration
- Always activate the virtual environment before running the project using:
  ```bash
  # Windows
  draftvision_env\Scripts\activate
  # macOS/Linux
  source draftvision_env/bin/activate
  ```
- Don't forget to update requirements.txt if you add new packages:
  ```bash
  pip freeze > requirements.txt
  ```

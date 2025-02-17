# AI Skin Analyzer

A simple web application that analyzes facial skin using AI to provide insights into various skin metrics.

**Students:** Zhumabek Niyazbek, Darkhan Sabyrkhan, Mukhammed Kuanyshbek (9th grade Skillset students)

**Supervisor:** mr. Arman

## Features
- Upload a selfie or use live mode for face capture.
- AI-driven skin analysis with metrics displayed as score circles and a radar chart.
- Intuitive UI built with Tailwind CSS.

## Technologies
- Flask (Python)
- TensorFlow.js & BlazeFace (face detection)
- Chart.js (data visualization)
- Tailwind CSS (styling)

## Getting Started
1. Clone the repository.
2. Install dependencies:
   - Python: `pip install -r requirements.txt`
3. Configure the Gemini API key in a `.env` file.
4. Run the Flask app:
   - `python app.py`
5. Open your browser at `http://localhost:5000`.

## Project Structure
- **/templates**: HTML files.
- **/static/js**: JavaScript for client-side logic.
- **/static/css**: CSS styles.
- **app.py**: Flask application with AI analysis logic.

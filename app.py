from flask import Flask, render_template, request
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv
import json
import time

load_dotenv()
app = Flask(__name__)

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

skin_analysis_prompt = """Analyze the facial skin in the image and return ONLY a valid JSON object without any markdown formatting or additional text. The JSON must match this exact structure:
{
    "predicted_age": <integer>,
    "face_type": "<string>,
    "droopy_lower_eyelid": <integer>,
    "tear_trough": <integer>,
    "wrinkles": <integer>,
    "acne": <integer>,
    "redness": <integer>,
    "moisture": <integer>,
    "oiliness": <integer>,
    "skin_health": <integer>,
    "firmness": <integer>,
    "eye_bags": <integer>,
    "radiance": <integer>,
    "spots": <integer>,
    "texture": <integer>,
    "dark_circles": <integer>,
    "droopy_upper_eyelid": <integer>,
    "pores": <integer>
}
All numeric values should be between 65 (very bad) and 100 (very good). Face type should be one of: normal, oily, dry, combination, sensitive. For recommended_product: 1 = Cleansers, 2 = Moisturizers, 3 = Exfoliants."""

@app.route('/')
def index():    
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'image' not in request.files:
            return {'error': 'No image provided'}, 400
        
        image = Image.open(request.files['image'])
        
        response = model.generate_content([skin_analysis_prompt, image])
        
        try:
            clean_response = response.text.replace('```json', '').replace('```', '').strip()
            analysis_data = json.loads(clean_response)               
            return json.dumps(analysis_data), 200
        except json.JSONDecodeError as e:
            print("JSON Parse Error:", response.text)
            return {'error': 'Invalid response format'}, 500
            
    except Exception as e:
        print("Error:", str(e))
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
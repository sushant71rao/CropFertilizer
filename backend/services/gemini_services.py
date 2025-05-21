# gemini_service.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file (if you have one)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai_configured = False
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        genai_configured = True
        print("Gemini API configured successfully.")
    except Exception as e:
        print(f"Warning: Failed to configure Gemini API: {e}. Gemini functionality will be disabled.")
else:
    print("Warning: GEMINI_API_KEY environment variable is not set. Gemini functionality will be disabled.")

# Default configuration for the generative model (can be overridden)
DEFAULT_GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

DEFAULT_SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

class GeminiServiceError(Exception):
    """Custom exception for Gemini service errors."""
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

async def generate_text_from_gemini_api(
    prompt: str,
    model_name: str = "gemini-1.5-flash-latest",
    generation_config: dict = None,
    safety_settings: list = None
) -> str:
    """
    Generates text using the Google Gemini API.

    Args:
        prompt: The text prompt to send to the API.
        model_name: The Gemini model to use.
        generation_config: Optional custom generation configuration.
        safety_settings: Optional custom safety settings.

    Returns:
        The generated text.

    Raises:
        GeminiServiceError: If the API is not configured or an API error occurs.
    """
    if not genai_configured:
        raise GeminiServiceError("Gemini API is not configured. Check API key and server logs.", status_code=503)

    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=generation_config or DEFAULT_GENERATION_CONFIG,
            safety_settings=safety_settings or DEFAULT_SAFETY_SETTINGS
        )
        
        # Using async version for better performance in FastAPI if called directly from async route
        response = await model.generate_content_async(prompt)

        if response.prompt_feedback.block_reason:
            block_reason_message = response.prompt_feedback.block_reason_message or "No additional message."
            raise GeminiServiceError(
                f"Prompt blocked by Gemini API: {response.prompt_feedback.block_reason}. {block_reason_message}",
                status_code=400
            )
        
        return response.text
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        if isinstance(e, GeminiServiceError):
            raise
        raise GeminiServiceError(f"An unexpected error occurred with the Gemini API: {str(e)}", status_code=500)
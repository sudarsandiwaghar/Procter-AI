import json
import logging
import google.generativeai as genai
from app.config.config import settings

logger = logging.getLogger(__name__)

# Initialize gemini client lazily to prevent server crashes if the key is empty during module loading
_gemini_configured = False

def configure_gemini():
    """
    Configure the Google Generative AI client lazily.
    """
    global _gemini_configured
    if not _gemini_configured:
        api_key = settings.GEMINI_API_KEY
        if api_key and not api_key.startswith("your_"):
            try:
                genai.configure(api_key=api_key)
                _gemini_configured = True
                logger.info("Google Gemini API successfully configured.")
            except Exception as e:
                logger.error(f"Failed to configure Google Gemini API: {e}")
        else:
            logger.warning("GEMINI_API_KEY is not set or has placeholder value. Running AI services in elegant mock/fallback mode.")


def generate_performance_report(student_name: str, exam_title: str, score: float, total_marks: int, wrong_topics: list) -> dict:
    """
    Generates a structured, constructive academic feedback report detailing 
    strengths, weaknesses, and custom study recommendations based on wrong topics.
    Returns a dictionary matching the AIReport schema.
    """
    configure_gemini()
    
    wrong_topics_str = ", ".join(wrong_topics) if wrong_topics else "None (Perfect/Near-Perfect score!)"
    
    prompt = f"""
    You are the ProctorAI Academic Evaluator, built by Google DeepMind.
    Assess the following student's exam performance and generate a professional, encouraging evaluation.
    
    Student Name: {student_name}
    Exam Title: {exam_title}
    Score: {score} out of {total_marks} marks
    Weak Topics Identified: {wrong_topics_str}
    
    You MUST output valid, plain JSON format and absolutely nothing else. Do NOT include markdown code-block tags (like ```json).
    Use the following exact keys:
    {{
        "strengths": "1-2 brief bullet points of concepts or competencies the student demonstrated well based on their exam performance.",
        "weaknesses": "1-2 brief bullet points listing specific knowledge gaps, conceptual areas, or exam topics needing work.",
        "recommendations": "2-3 highly actionable, specific, encouraging, and structured study tips or resources the student can use to master their gaps.",
        "confidence_score": 0.95
    }}
    """
    
    # Return a high-quality fallback report if Gemini is not configured
    if not _gemini_configured:
        return {
            "strengths": f"• Demonstrated solid focus and attempted all core questions under secure proctor conditions.\n• Performed well in the overall structural examination flow of '{exam_title}'.",
            "weaknesses": f"• Encountered some difficulty in questions relating to: {wrong_topics_str}.",
            "recommendations": "• Review incorrect exam questions in your student dashboard to reinforce critical topics.\n• Schedule a 15-minute doubt-clearing session with your course faculty.\n• Practice daily aptitude and logic quizzes of medium difficulty.",
            "confidence_score": 0.80
        }
        
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt, request_options={"timeout": 15.0})
        text = response.text.strip()
        
        # Clean any accidental code fences or headers returned by the model
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        data = json.loads(text)
        return {
            "strengths": data.get("strengths", "Solid exam execution."),
            "weaknesses": data.get("weaknesses", f"Concepts related to: {wrong_topics_str}."),
            "recommendations": data.get("recommendations", "Review exam answers and focus on gaps."),
            "confidence_score": float(data.get("confidence_score", 0.95))
        }
    except Exception as e:
        logger.error(f"Error calling Google Gemini for performance report: {e}")
        # Elegant secondary fallback
        return {
            "strengths": f"• Completed the secure '{exam_title}' examination successfully.\n• Attempted questions under active AI camera and browser tab verification.",
            "weaknesses": f"• Identified knowledge gaps in: {wrong_topics_str}.",
            "recommendations": "• Dedicate 30 minutes daily to active recall on weak subjects.\n• Attempt self-assessments in computer science and aptitude fundamentals.\n• Reference recommended library textbooks for structural core concepts.",
            "confidence_score": 0.75
        }


def generate_chatbot_reply(user_message: str, context: str = "") -> str:
    """
    Answers a student's study or exam preparation doubt, keeping it clear,
    highly professional, concise, encouraging, and focused on educational growth.
    """
    configure_gemini()
    
    prompt = f"""
    You are the ProctorAI Academic Doubt Solver, created by Google DeepMind and Sri Sai Ram Institute of Technology (SSIT).
    Your goal is to answer academic, computer science, or general examination prep doubts clearly and concisely.
    Keep your response to a maximum of 3 short paragraphs. Be encouraging, precise, and highly educational.
    If the student asks something completely unrelated to education, academics, computer science, or exam preparation,
    politely remind them that you are configured exclusively to resolve study doubts and help them prepare for their exams.
    
    Context / Relevant Exam Info: {context}
    Student Query: {user_message}
    """
    
    if not _gemini_configured:
        return f"Hello! I am ProctorAI Academic Solver. Since I am currently operating in Offline mode, here is a general pointer for your query: Always break down complex CS problems into logical pseudocode, analyze time complexity (Big O), and practice edge cases! Let me know if you need any other help once the API key is active."
        
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt, request_options={"timeout": 15.0})
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error calling Google Gemini for chatbot: {e}")
        return "I encountered a minor processing error answering your doubt. Please double check your internet connection or try re-phrasing your question."

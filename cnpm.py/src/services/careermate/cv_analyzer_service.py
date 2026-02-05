# CV Analyzer Service - AI-powered CV/Resume analysis
import json
import os
from typing import Optional, Dict, Any
from infrastructure.models.careermate.resume_model import ResumeModel
from infrastructure.models.careermate.cv_analysis_model import CVAnalysisModel
from infrastructure.databases.factory_database import FactoryDatabase
from services.careermate.llm_providers.llm_factory import get_llm_provider


def get_session():
    """Get database session."""
    return FactoryDatabase.get_database('MSSQL').session


class CVAnalyzerService:
    """Service for AI-powered CV/Resume analysis using Gemini."""
    
    # System prompt for CV analysis
    CV_ANALYSIS_PROMPT = """You are a recruitment and career counseling expert with 15 years of experience. 
Your task is to analyze the candidate's CV/Resume and provide a detailed evaluation.

When analyzing the CV, you need to evaluate:
1. **ATS Score (0-100)**: Compatibility score with Applicant Tracking Systems
2. **Strengths**: Highlights and strong points in the CV
3. **Missing Skills**: Skills that need to be added
4. **Detailed Feedback**: Overall comments and improvement suggestions

Respond in English, clearly and constructively."""

    CV_ANALYSIS_JSON_FORMAT = """
IMPORTANT: Return the result in PURE JSON format. Do not include any markdown formatting (like ```json), explanations, or additional text. Start the response with { and end with }.

Structure:
{
    "ats_score": <number from 0-100>,
    "strengths": ["string", "string"],
    "missing_skills": ["string", "string"],
    "feedback": "string",
    "recommendations": ["string", "string"]
}
"""
    
    def __init__(self, llm_provider=None):
        """Initialize CV Analyzer with LLM provider."""
        self.llm = llm_provider or get_llm_provider()
        
    def _clean_json_response(self, response: str) -> str:
        """Extract JSON part from response string."""
        import re
        
        # Find the first '{' and last '}'
        start = response.find('{')
        end = response.rfind('}')
        
        if start != -1 and end != -1:
            return response[start:end+1]
        return response
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text content from a PDF file.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(file_path)
            text_parts = []
            
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            return "\n".join(text_parts)
            
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """
        Extract text content from a DOCX file.
        
        Args:
            file_path: Path to the DOCX file
            
        Returns:
            Extracted text content
        """
        try:
            from docx import Document
            
            doc = Document(file_path)
            text_parts = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)
            
            return "\n".join(text_parts)
            
        except Exception as e:
            raise Exception(f"Failed to extract DOCX text: {str(e)}")
    
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text from a file based on its extension.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text content
        """
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            return self.extract_text_from_docx(file_path)
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {ext}")
    
    def analyze_cv(
        self,
        cv_text: str,
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze CV content using Gemini AI.
        
        Args:
            cv_text: The CV/Resume text content
            job_description: Optional job description to match against
            target_role: Optional target role for the candidate
            
        Returns:
            Dictionary with analysis results
        """
        # Build the analysis prompt
        prompt_parts = [
            f"CV/Resume Content:\n{cv_text}",
        ]
        
        if job_description:
            prompt_parts.append(f"\nJob Description to match:\n{job_description}")
        
        if target_role:
            prompt_parts.append(f"\nTarget Role: {target_role}")
        
        prompt_parts.append(self.CV_ANALYSIS_JSON_FORMAT)
        
        full_prompt = "\n".join(prompt_parts)
        
        try:
            response = self.llm.generate_response(
                prompt=full_prompt,
                system_instruction=self.CV_ANALYSIS_PROMPT,
                temperature=0.3
            )
            
            # Parse JSON response
            # Clean up response to ensure valid JSON
            cleaned_response = self._clean_json_response(response)
            
            result = json.loads(cleaned_response)
            
            # Ensure required fields exist
            return {
                "ats_score": result.get("ats_score", 0),
                "strengths": result.get("strengths", []),
                "missing_skills": result.get("missing_skills", []),
                "feedback": result.get("feedback", ""),
                "recommendations": result.get("recommendations", [])
            }
            
        except json.JSONDecodeError as e:
            # Log the raw response for debugging
            print(f"JSON Decode Error in CV Analysis: {str(e)}")
            print(f"Raw Response: {response}")
            
            # If JSON parsing fails, return structured response
            return {
                "ats_score": 0,
                "strengths": [],
                "missing_skills": [],
                "feedback": f"Error analyzing CV. AI Response: {response[:500]}...", # Show part of response to user for feedback
                "recommendations": []
            }
        except Exception as e:
            raise Exception(f"CV analysis failed: {str(e)}")
    
    def analyze_resume_by_id(
        self,
        resume_id: int,
        job_description: Optional[str] = None,
        save_result: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze a resume from database by its ID.
        
        Args:
            resume_id: ID of the resume in database
            job_description: Optional job description to match against
            save_result: Whether to save analysis result to database
            
        Returns:
            Analysis result dictionary
        """
        # Get resume from database
        resume = get_session().query(ResumeModel).filter_by(resume_id=resume_id).first()
        if not resume:
            raise ValueError(f"Resume with ID {resume_id} not found")
        
        # Extract text from file
        cv_text = self.extract_text_from_file(resume.file_url)
        
        # Analyze CV
        result = self.analyze_cv(cv_text, job_description)
        
        # Save to database if requested
        if save_result:
            # Check if analysis already exists
            existing = get_session().query(CVAnalysisModel).filter_by(resume_id=resume_id).first()
            
            if existing:
                # Update existing analysis
                existing.ats_score = result["ats_score"]
                existing.feedback = result["feedback"]
                existing.missing_skills = json.dumps(result["missing_skills"], ensure_ascii=False)
                existing.strengths = json.dumps(result["strengths"], ensure_ascii=False)
            else:
                # Create new analysis
                analysis = CVAnalysisModel(
                    resume_id=resume_id,
                    ats_score=result["ats_score"],
                    feedback=result["feedback"],
                    missing_skills=json.dumps(result["missing_skills"], ensure_ascii=False),
                    strengths=json.dumps(result["strengths"], ensure_ascii=False)
                )
                get_session().add(analysis)
            
            get_session().commit()
        
        return result
    
    def get_improvement_suggestions(
        self,
        cv_text: str,
        target_role: str
    ) -> str:
        """
        Get detailed suggestions to improve CV for a specific role.
        
        Args:
            cv_text: The CV/Resume text content
            target_role: The target role to optimize CV for
            
        Returns:
            Detailed improvement suggestions as text
        """
        prompt = f"""
Analyze this CV and provide specific suggestions to improve it for the {target_role} position:

CV Content:
{cv_text}

Please provide:
1. Specific changes that need to be made
2. Keywords that should be added
3. Better presentation approaches
4. Projects/experiences that should be highlighted
"""
        
        return self.llm.generate_response(
            prompt=prompt,
            system_instruction=self.CV_ANALYSIS_PROMPT,
            temperature=0.5
        )

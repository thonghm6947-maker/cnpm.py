# CV Analyzer Service - AI-powered CV/Resume analysis
import json
import os
from typing import Optional, Dict, Any
from infrastructure.models.careermate.resume_model import ResumeModel
from infrastructure.models.careermate.cv_analysis_model import CVAnalysisModel
from infrastructure.databases.factory_database import FactoryDatabase
from services.careermate.gemini_service import GeminiService


def get_session():
    """Get database session."""
    return FactoryDatabase.get_database('POSTGREE').session


class CVAnalyzerService:
    """Service for AI-powered CV/Resume analysis using Gemini."""
    
    # System prompt for CV analysis
    CV_ANALYSIS_PROMPT = """Bạn là một chuyên gia tuyển dụng và tư vấn nghề nghiệp với 15 năm kinh nghiệm. 
Nhiệm vụ của bạn là phân tích CV/Resume của ứng viên và đưa ra đánh giá chi tiết.

Khi phân tích CV, bạn cần đánh giá:
1. **ATS Score (0-100)**: Điểm tương thích với hệ thống ATS (Applicant Tracking System)
2. **Điểm mạnh**: Các điểm nổi bật trong CV
3. **Kỹ năng còn thiếu**: Các kỹ năng cần bổ sung
4. **Phản hồi chi tiết**: Nhận xét tổng quan và gợi ý cải thiện

Trả lời bằng tiếng Việt, rõ ràng và mang tính xây dựng."""

    CV_ANALYSIS_JSON_FORMAT = """
Trả về kết quả theo định dạng JSON sau:
{
    "ats_score": <số từ 0-100>,
    "strengths": ["điểm mạnh 1", "điểm mạnh 2", ...],
    "missing_skills": ["kỹ năng thiếu 1", "kỹ năng thiếu 2", ...],
    "feedback": "Nhận xét tổng quan và gợi ý cải thiện chi tiết",
    "recommendations": ["gợi ý 1", "gợi ý 2", ...]
}
"""
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        """Initialize CV Analyzer with Gemini service."""
        self.gemini = gemini_service or GeminiService()
    
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
            response = self.gemini.generate_json_response(
                prompt=full_prompt,
                system_instruction=self.CV_ANALYSIS_PROMPT,
                temperature=0.3
            )
            
            # Parse JSON response
            # Clean up if wrapped in markdown
            if response.startswith("```"):
                lines = response.split("\n")
                response = "\n".join(lines[1:-1])
            
            result = json.loads(response)
            
            # Ensure required fields exist
            return {
                "ats_score": result.get("ats_score", 0),
                "strengths": result.get("strengths", []),
                "missing_skills": result.get("missing_skills", []),
                "feedback": result.get("feedback", ""),
                "recommendations": result.get("recommendations", [])
            }
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return structured response
            return {
                "ats_score": 0,
                "strengths": [],
                "missing_skills": [],
                "feedback": response,
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
Phân tích CV này và đưa ra gợi ý cụ thể để cải thiện cho vị trí {target_role}:

CV Content:
{cv_text}

Hãy đưa ra:
1. Những thay đổi cụ thể cần thực hiện
2. Các từ khóa nên thêm vào
3. Cách trình bày tốt hơn
4. Các dự án/kinh nghiệm nên highlight
"""
        
        return self.gemini.generate_response(
            prompt=prompt,
            system_instruction=self.CV_ANALYSIS_PROMPT,
            temperature=0.5
        )

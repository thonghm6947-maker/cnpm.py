# Career Coach Service - AI-powered career coaching and guidance
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from infrastructure.models.careermate.chat_session_model import ChatSessionModel
from infrastructure.models.careermate.chat_message_model import ChatMessageModel, SenderType
from infrastructure.models.careermate.career_roadmap_model import CareerRoadmapModel
from infrastructure.models.careermate.candidate_profile_model import CandidateProfileModel
from infrastructure.databases.factory_database import FactoryDatabase
from services.careermate.llm_providers.llm_factory import get_llm_provider
from services.careermate.llm_providers.base_provider import BaseLLMProvider


def get_session():
    """Get database session."""
    return FactoryDatabase.get_database('POSTGREE').session


class CareerCoachService:
    """Service for AI-powered career coaching using configurable LLM providers."""
    
    # System prompt for Career Coach AI
    CAREER_COACH_PROMPT = """Bạn là một Career Coach AI chuyên nghiệp với hơn 20 năm kinh nghiệm tư vấn nghề nghiệp.

Vai trò của bạn:
- Tư vấn định hướng nghề nghiệp
- Hướng dẫn phát triển kỹ năng
- Hỗ trợ chuẩn bị phỏng vấn
- Đưa ra lời khuyên về chuyển đổi nghề nghiệp
- Giúp lập kế hoạch phát triển sự nghiệp

Nguyên tắc:
1. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
2. Đưa ra lời khuyên cụ thể, thực tế và có thể hành động được
3. Hỏi thêm thông tin khi cần thiết để đưa ra tư vấn phù hợp
4. Khuyến khích và tạo động lực cho người dùng
5. Dựa trên dữ liệu thị trường lao động thực tế tại Việt Nam"""

    ROADMAP_GENERATION_PROMPT = """Bạn là chuyên gia lập kế hoạch sự nghiệp. 
Nhiệm vụ: Tạo lộ trình phát triển nghề nghiệp chi tiết, thực tế và có thể thực hiện được.

Lộ trình cần bao gồm:
1. Các giai đoạn phát triển theo timeline
2. Kỹ năng cần học ở mỗi giai đoạn
3. Chứng chỉ/khóa học được khuyến nghị
4. Mốc kiểm tra tiến độ (milestones)
5. Nguồn tài liệu học tập

Trả về kết quả theo định dạng JSON."""
    
    def __init__(self, llm_provider: Optional[BaseLLMProvider] = None):
        """Initialize Career Coach with configurable LLM provider."""
        self.llm = llm_provider or get_llm_provider()
    
    def get_or_create_session(
        self,
        user_id: int,
        topic: Optional[str] = None
    ) -> ChatSessionModel:
        """
        Get existing chat session or create a new one.
        
        Args:
            user_id: User ID
            topic: Optional topic for the session
            
        Returns:
            ChatSessionModel instance
        """
        # Look for recent active session
        session = get_session().query(ChatSessionModel)\
            .filter_by(user_id=user_id)\
            .order_by(ChatSessionModel.updated_at.desc())\
            .first()
        
        if not session:
            # Create new session
            session = ChatSessionModel(
                user_id=user_id,
                topic=topic or "Career Coaching"
            )
            get_session().add(session)
            get_session().commit()
        
        return session
    
    def create_new_session(
        self,
        user_id: int,
        topic: Optional[str] = None
    ) -> ChatSessionModel:
        """
        Always create a new chat session.
        
        Args:
            user_id: User ID
            topic: Optional topic for the session
            
        Returns:
            New ChatSessionModel instance
        """
    def create_new_session(
        self,
        user_id: int,
        topic: Optional[str] = None
    ) -> ChatSessionModel:
        """
        Always create a new chat session.
        
        Args:
            user_id: User ID
            topic: Optional topic for the session
            
        Returns:
            New ChatSessionModel instance
        """
        db = get_session()
        session = ChatSessionModel(
            user_id=user_id,
            topic=topic or "Career Coaching"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    
    def get_session_history(
        self,
        session_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get message history for a chat session.
        
        Args:
            session_id: Session ID
            limit: Maximum number of messages to return
            
        Returns:
            List of message dictionaries
        """
        messages = get_session().query(ChatMessageModel)\
            .filter_by(session_id=session_id)\
            .order_by(ChatMessageModel.sent_at.asc())\
            .limit(limit)\
            .all()
        
        return [
            {
                "msg_id": msg.msg_id,
                "sender": msg.sender.value if hasattr(msg.sender, 'value') else str(msg.sender),
                "content": msg.content,
                "sent_at": msg.sent_at.isoformat() if msg.sent_at else None
            }
            for msg in messages
        ]
    
    def send_message(
        self,
        session_id: int,
        user_message: str,
        user_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Send a message to Career Coach AI and get response.
        """
        db = get_session()
        
        # Get session
        session = db.query(ChatSessionModel).filter_by(session_id=session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Save user message
        user_msg = ChatMessageModel(
            session_id=session_id,
            sender=SenderType.USER,
            content=user_message
        )
        db.add(user_msg)
        db.commit()
        
        # Get conversation history for context
        # Note: We can't reuse self.get_session_history here efficiently because it creates its own session
        # So we implement a quick query here using the SAME session
        history_msgs = db.query(ChatMessageModel)\
            .filter_by(session_id=session_id)\
            .order_by(ChatMessageModel.sent_at.asc())\
            .limit(20)\
            .all()
        
        # Build messages for Gemini
        gemini_messages = []
        for msg in history_msgs:
            role = 'user' if msg.sender == SenderType.USER else 'model'
            gemini_messages.append({
                'role': role,
                'content': msg.content
            })
        
        # Add context if provided
        context_str = ""
        if user_context:
            context_str = f"\n\nThông tin người dùng:\n{json.dumps(user_context, ensure_ascii=False, indent=2)}"
        
        # Generate AI response
        try:
            ai_response = self.llm.generate_chat_response(
                messages=gemini_messages,
                system_instruction=self.CAREER_COACH_PROMPT + context_str,
                temperature=0.7
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            ai_response = f"Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau. (Error: {str(e)})"
        
        # Save AI response
        ai_msg = ChatMessageModel(
            session_id=session_id,
            sender=SenderType.AI,
            content=ai_response
        )
        db.add(ai_msg)
        
        # Update session
        session.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "session_id": session_id,
            "user_message": {
                "msg_id": user_msg.msg_id,
                "content": user_message,
                "sent_at": user_msg.sent_at.isoformat()
            },
            "ai_response": {
                "msg_id": ai_msg.msg_id,
                "content": ai_response,
                "sent_at": ai_msg.sent_at.isoformat()
            }
        }
    
    def get_user_sessions(
        self,
        user_id: int,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get all chat sessions for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of sessions to return
            
        Returns:
            List of session dictionaries
        """
        sessions = get_session().query(ChatSessionModel)\
            .filter_by(user_id=user_id)\
            .order_by(ChatSessionModel.updated_at.desc())\
            .limit(limit)\
            .all()
        
        return [
            {
                "session_id": s.session_id,
                "topic": s.topic,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
                "message_count": len(s.messages) if s.messages else 0
            }
            for s in sessions
        ]
    
    def generate_career_roadmap(
        self,
        user_id: int,
        target_role: str,
        current_skills: Optional[List[str]] = None,
        current_role: Optional[str] = None,
        time_frame: str = "12 months"
    ) -> Dict[str, Any]:
        """
        Generate a personalized career development roadmap.
        
        Args:
            user_id: User ID
            target_role: The target career role
            current_skills: List of current skills
            current_role: Current job role
            time_frame: Target time frame (e.g., "6 months", "1 year")
            
        Returns:
            Career roadmap dictionary
        """
        # Get candidate profile for context
        candidate = get_session().query(CandidateProfileModel)\
            .filter_by(user_id=user_id)\
            .first()
        
        # Build prompt
        prompt = f"""
Tạo lộ trình phát triển nghề nghiệp với thông tin sau:

Mục tiêu: {target_role}
Thời gian dự kiến: {time_frame}
"""
        
        if current_role:
            prompt += f"Vị trí hiện tại: {current_role}\n"
        
        if current_skills:
            prompt += f"Kỹ năng hiện có: {', '.join(current_skills)}\n"
        
        if candidate:
            prompt += f"Tên: {candidate.full_name}\n"
            if candidate.bio:
                prompt += f"Giới thiệu: {candidate.bio}\n"
        
        prompt += """
Trả về JSON với format:
{
    "title": "Tiêu đề lộ trình",
    "target_role": "Vị trí mục tiêu",
    "estimated_duration": "Thời gian ước tính",
    "phases": [
        {
            "phase_number": 1,
            "title": "Tên giai đoạn",
            "duration": "Thời gian",
            "skills_to_learn": ["Kỹ năng 1", "Kỹ năng 2"],
            "courses_recommended": ["Khóa học 1", "Khóa học 2"],
            "milestones": ["Mốc 1", "Mốc 2"],
            "resources": ["Tài liệu 1", "Tài liệu 2"]
        }
    ],
    "summary": "Tóm tắt lộ trình"
}
"""
        
        try:
            json_instruction = "You must respond ONLY with valid JSON. Do not include any text before or after the JSON."
            response = self.llm.generate_response(
                prompt=prompt,
                system_instruction=self.ROADMAP_GENERATION_PROMPT + "\n\n" + json_instruction,
                temperature=0.4
            )
            
            # Parse JSON
            if response.startswith("```"):
                lines = response.split("\n")
                response = "\n".join(lines[1:-1])
            
            roadmap_data = json.loads(response)
            
            # Save to database
            roadmap = CareerRoadmapModel(
                candidate_id=candidate.candidate_id if candidate else None,
                title=roadmap_data.get("title", f"Lộ trình đến {target_role}"),
                content_json=json.dumps(roadmap_data, ensure_ascii=False),
                target_role=target_role,
                estimated_duration=time_frame
            )
            get_session().add(roadmap)
            get_session().commit()
            
            return {
                "roadmap_id": roadmap.roadmap_id,
                **roadmap_data
            }
            
        except json.JSONDecodeError:
            return {
                "title": f"Lộ trình đến {target_role}",
                "target_role": target_role,
                "estimated_duration": time_frame,
                "content": response,
                "error": "Could not parse structured roadmap"
            }
        except Exception as e:
            raise Exception(f"Roadmap generation failed: {str(e)}")
    
    def get_user_roadmaps(
        self,
        user_id: int
    ) -> List[Dict[str, Any]]:
        """
        Get all career roadmaps for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of roadmap dictionaries
        """
        candidate = get_session().query(CandidateProfileModel)\
            .filter_by(user_id=user_id)\
            .first()
        
        if not candidate:
            return []
        
        roadmaps = get_session().query(CareerRoadmapModel)\
            .filter_by(candidate_id=candidate.candidate_id)\
            .order_by(CareerRoadmapModel.created_at.desc())\
            .all()
        
        result = []
        for r in roadmaps:
            item = {
                "roadmap_id": r.roadmap_id,
                "title": r.title,
                "target_role": r.target_role,
                "estimated_duration": r.estimated_duration,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            
            # Parse content JSON if available
            if r.content_json:
                try:
                    item["content"] = json.loads(r.content_json)
                except:
                    item["content"] = r.content_json
            
            result.append(item)
        
        return result

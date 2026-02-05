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
    return FactoryDatabase.get_database('MSSQL').session


class CareerCoachService:
    """Service for AI-powered career coaching using configurable LLM providers."""
    
    # System prompt for Career Coach AI
    CAREER_COACH_PROMPT = """You are a professional AI Career Coach with over 20 years of career consulting experience.

Your role:
- Career guidance and direction
- Skill development guidance
- Interview preparation support
- Career transition advice
- Career development planning

Principles:
1. Always respond in English, be friendly and professional
2. Provide specific, practical and actionable advice
3. Ask for more information when needed to provide appropriate guidance
4. Encourage and motivate users
5. Base advice on real job market data"""

    ROADMAP_GENERATION_PROMPT = """You are a career planning expert.
Task: Create a detailed, realistic and actionable career development roadmap.

The roadmap should include:
1. Development phases with timeline
2. Skills to learn at each phase
3. Recommended certifications/courses
4. Progress checkpoints (milestones)
5. Learning resources

Return the result in JSON format. Always use English for all content."""
    
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
                "sent_at": (msg.sent_at.isoformat() + 'Z') if msg.sent_at else None
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
            content=user_message,
            sent_at=datetime.utcnow()
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
            context_str = f"\n\nUser information:\n{json.dumps(user_context, ensure_ascii=False, indent=2)}"
        
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
            ai_response = f"Sorry, I'm experiencing technical difficulties. Please try again later. (Error: {str(e)})"
        
        # Save AI response
        ai_msg = ChatMessageModel(
            session_id=session_id,
            sender=SenderType.AI,
            content=ai_response,
            sent_at=datetime.utcnow()
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
                "sent_at": (user_msg.sent_at.isoformat() + 'Z')
            },
            "ai_response": {
                "msg_id": ai_msg.msg_id,
                "content": ai_response,
                "sent_at": (ai_msg.sent_at.isoformat() + 'Z')
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
                "created_at": (s.created_at.isoformat() + 'Z') if s.created_at else None,
                "updated_at": (s.updated_at.isoformat() + 'Z') if s.updated_at else None,
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
Create a career development roadmap with the following information:

Target Role: {target_role}
Timeframe: {time_frame}
"""
        
        if current_role:
            prompt += f"Current Position: {current_role}\n"
        
        if current_skills:
            prompt += f"Current Skills: {', '.join(current_skills)}\n"
        
        if candidate:
            prompt += f"Name: {candidate.full_name}\n"
            if candidate.bio:
                prompt += f"Bio: {candidate.bio}\n"
        
        prompt += """
Return JSON with this format (use English for all content):
{
    "title": "Roadmap Title",
    "target_role": "Target Position",
    "estimated_duration": "Estimated Duration",
    "phases": [
        {
            "phase_number": 1,
            "title": "Phase Title",
            "duration": "Duration",
            "skills_to_learn": ["Skill 1", "Skill 2"],
            "courses_recommended": ["Course 1", "Course 2"],
            "milestones": ["Milestone 1", "Milestone 2"],
            "resources": ["Resource 1", "Resource 2"]
        }
    ],
    "summary": "Roadmap Summary"
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
                title=roadmap_data.get("title", f"Roadmap to {target_role}"),
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
                "title": f"Roadmap to {target_role}",
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
            List of roadmap dictionaries with phases as array
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
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "phases": []  # Default empty phases array
            }
            
            # Parse content JSON and flatten phases to top level
            if r.content_json:
                try:
                    content = json.loads(r.content_json)
                    
                    # Extract phases and normalize structure
                    raw_phases = content.get("phases", [])
                    normalized_phases = []
                    
                    for idx, phase in enumerate(raw_phases):
                        normalized_phase = {
                            "phase": phase.get("phase_number", phase.get("phase", idx + 1)),
                            "title": phase.get("title", f"Phase {idx + 1}"),
                            "duration": phase.get("duration", ""),
                            "skills_to_learn": phase.get("skills_to_learn", []),
                            "resources": phase.get("resources", []),
                            "courses_recommended": phase.get("courses_recommended", []),
                            "milestones": phase.get("milestones", [])
                        }
                        normalized_phases.append(normalized_phase)
                    
                    item["phases"] = normalized_phases
                    
                    # Also include summary if available
                    if content.get("summary"):
                        item["summary"] = content["summary"]
                        
                except Exception as e:
                    print(f"Error parsing roadmap content_json: {e}")
                    item["phases"] = []
            
            result.append(item)
        
        return result


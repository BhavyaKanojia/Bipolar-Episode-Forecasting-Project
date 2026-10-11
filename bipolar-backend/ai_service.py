import json
import logging
from groq import Groq
from config import Config

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = None
        self.init_client()

    def init_client(self):
        try:
            if Config.GROQ_API_KEY:
                self.client = Groq(api_key=Config.GROQ_API_KEY)
                logger.info("Groq client initialized successfully.")
            else:
                logger.warning("GROQ_API_KEY is not set.")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self.client = None

    def _normalize_messages(self, messages):
        """Converts incoming frontend message shapes into OpenAI/Groq standard format."""
        normalized = []
        for msg in messages:
            role = msg.get("role", "user")
            if role == "ai":
                role = "assistant"
            content = msg.get("content") or msg.get("text") or ""
            if content.strip():
                normalized.append({"role": role, "content": content.strip()})
        return normalized

    def chat_companion(self, messages, user_context=None):
        """
        Conversational mental health companion fine-tuned for bipolar disorder monitoring.
        Incorporates user context (latest metrics, episode risks, sleep, energy) into the prompt.
        """
        if not self.client:
            self.init_client()
        if not self.client:
            return (
                "I am currently operating in offline mode. Please make sure your GROQ_API_KEY is configured. "
                "In the meantime, remember that regular sleep schedules and grounding techniques like 4-7-8 breathing "
                "can support your emotional balance."
            )

        context_prompt = ""
        if user_context:
            context_prompt = (
                f"\n--- CURRENT USER TELEMETRY & ML METRICS ---\n"
                f"- Mood Stability State: {user_context.get('mood_stability', 'Unknown')}\n"
                f"- Model Classification: {user_context.get('disorder', 'Unknown')}\n"
                f"- Mania Probability: {user_context.get('mania_probability', 0)}%\n"
                f"- Depression Risk: {user_context.get('depression_risk', 0)}%\n"
                f"- Latest Sleep Duration: {user_context.get('sleep_quality', 7)} hours\n"
                f"- Episode Risk Level: {user_context.get('next_episode_risk', 'Low')}\n"
            )
            if user_context.get("recent_notes"):
                context_prompt += f"- Latest Log Notes: \"{user_context.get('recent_notes')}\"\n"
            context_prompt += (
                "Use this contextual telemetry naturally when relevant to offer personalized reflections, "
                "without sounding overly robotic or alarming. For example, if sleep is deficient or mania risk is high, "
                "gently explore how their body and mind are feeling.\n"
            )

        system_prompt = (
            "You are Bipolar AI Companion, an empathetic, evidence-based AI assistant integrated into a bipolar "
            "episode forecasting and mood monitoring platform.\n"
            "Your goals:\n"
            "1. Provide validating, compassionate, and non-judgmental emotional support to individuals living with "
            "Bipolar I, Bipolar II, Cyclothymia, or mood instability.\n"
            "2. Offer evidence-based psychoeducation and behavioral strategies: Social Rhythm Therapy (SRT) principles, "
            "circadian regulation, sleep hygiene, sensory grounding (e.g., 5-4-3-2-1 technique, box breathing), and cognitive reframing.\n"
            "3. Help users recognize prodromal early warning signs (e.g. decreased need for sleep, racing thoughts, sudden withdrawal).\n"
            "4. CLINICAL SAFETY PROTOCOL: If the user expresses suicidal thoughts, severe self-harm, or crisis, immediately "
            "provide warm compassion and provide key crisis resources:\n"
            "   - 988 Suicide & Crisis Lifeline: Call or text 988 (US/Canada, 24/7 free & confidential)\n"
            "   - Crisis Text Line: Text HOME to 741741\n"
            "   - International: findahelpline.com\n"
            "5. Remind the user when appropriate that you are an AI support tool and not a replacement for their psychiatrist, "
            "therapist, or emergency care. Never recommend modifying prescription dosages.\n"
            "Keep responses conversational, concise (2-4 paragraphs max unless guiding a step-by-step exercise), and easy to read."
            + context_prompt
        )

        groq_messages = [{"role": "system", "content": system_prompt}]
        normalized = self._normalize_messages(messages)
        # Keep last 10 messages for conversation continuity
        groq_messages.extend(normalized[-10:])

        try:
            response = self.client.chat.completions.create(
                model=Config.GROQ_MODEL,
                messages=groq_messages,
                max_tokens=600,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error in Groq chat_companion: {e}")
            return (
                f"I'm here for you, but I encountered a temporary connection issue ({str(e)}). "
                "Please take a deep, slow breath, ground your senses, and try again in a moment."
            )

    def generate_clinical_insights(self, metrics, recent_logs=None):
        """
        Generates structured, dynamic clinical insights and coping recommendations
        based on the user's latest ML predictions and behavioral logs.
        """
        if not self.client:
            self.init_client()

        # Heuristic fallback structure if Groq unavailable
        def fallback_insights():
            mania_prob = metrics.get("mania_probability", 0)
            depress_risk = metrics.get("depression_risk", 0)
            sleep = metrics.get("sleep_quality", 7.0)

            if mania_prob >= 50:
                headline = "Elevated Hypomania / Mania Risk Detected"
                analysis = (
                    f"Machine learning indicators suggest an elevated mania risk ({mania_prob}%). "
                    f"Recent sleep ({sleep} hrs) coupled with high activation suggests circadian disruption."
                )
                signals = ["Reduced sleep requirement", "Heightened goal-directed or energetic arousal"]
                strategies = [
                    "Implement a low-stimulation wind-down period 2 hours before bed.",
                    "Postpone major spontaneous life or financial decisions for 48 hours.",
                    "Notify your trusted care partner or psychiatrist about early shift."
                ]
                circadian = "Maintain consistent dark-room bedtimes even if you don't feel tired."
            elif depress_risk >= 50:
                headline = "Depressive Episode Vulnerability"
                analysis = (
                    f"Predictive analysis shows heightened depressive vulnerability ({depress_risk}%). "
                    "Low energy or persistent sadness may indicate a down-phase trajectory."
                )
                signals = ["Lethargy and low motivation", "Social withdrawal tendencies"]
                strategies = [
                    "Engage in micro-tasks: break daily responsibilities into tiny 5-minute steps.",
                    "Practice behavioral activation: take a short 10-minute daylight walk.",
                    "Reach out to one friend or supportive family member today."
                ]
                circadian = "Seek bright natural sunlight within 30 minutes of waking to boost dopamine & circadian rhythm."
            else:
                headline = "Stable Euthymic Phase Maintained"
                analysis = (
                    "Your behavioral metrics align with healthy mood stability. "
                    "Current sleep and energy patterns are in balance with low risk scores."
                )
                signals = ["Consistent sleep schedule", "Balanced daytime energy"]
                strategies = [
                    "Continue logging daily moods to sustain predictive accuracy.",
                    "Maintain regular meal, social, and bedtime routines (Social Rhythm Therapy).",
                    "Acknowledge and celebrate your current baseline stability."
                ]
                circadian = "Keep sleep and wake times within a 30-minute window every day."

            return {
                "headline": headline,
                "analysis": analysis,
                "early_warning_signals": signals,
                "coping_strategies": strategies,
                "circadian_advice": circadian,
                "risk_status": "High" if max(mania_prob, depress_risk) >= 50 else ("Moderate" if max(mania_prob, depress_risk) >= 25 else "Stable")
            }

        if not self.client:
            return fallback_insights()

        logs_summary = ""
        if recent_logs and len(recent_logs) > 0:
            logs_summary = "Recent 3-day history:\n"
            for log in recent_logs[:3]:
                logs_summary += f"- Date: {log.get('date', '?')}, Mood: {log.get('mood', '?')}/2, Sleep: {log.get('sleep', '?')}h, Energy: {log.get('energy', '?')}/10\n"

        prompt = f"""You are a specialized clinical AI expert in bipolar spectrum disorders and longitudinal behavioral psychiatry.
Analyze the following patient telemetry generated by our Random Forest ML Model:
- Primary Classification: {metrics.get('disorder', 'Normal')}
- Mood Stability Status: {metrics.get('mood_stability', 'Stable')}
- Calculated Mania Probability: {metrics.get('mania_probability', 0)}%
- Calculated Depression Risk: {metrics.get('depression_risk', 0)}%
- Overall Next Episode Risk: {metrics.get('next_episode_risk', 'Low')}
- Latest Sleep Duration: {metrics.get('sleep_quality', 7)} hours
- Model Classification Confidence: {metrics.get('confidence', 80)}%
{logs_summary}

Generate an insightful, clinical yet accessible behavioral analysis formatted as strict JSON with exactly these keys:
{{
  "headline": "<Short, punchy 5-10 word clinical summary title>",
  "analysis": "<2-3 clear, compassionate sentences explaining what these scores indicate about their mood trajectory>",
  "early_warning_signals": ["<Specific early behavioral warning sign 1>", "<Specific early behavioral warning sign 2>"],
  "coping_strategies": ["<Actionable behavioral or coping step 1>", "<Actionable step 2>", "<Actionable step 3>"],
  "circadian_advice": "<1 practical sentence on sleep, light exposure, or Social Rhythm Therapy>",
  "risk_status": "Stable" or "Moderate" or "High"
}}
"""

        try:
            response = self.client.chat.completions.create(
                model=Config.GROQ_MODEL,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are a clinical AI health analyst for bipolar episode forecasting. Always respond in valid, parseable JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            raw_text = response.choices[0].message.content
            parsed = json.loads(raw_text)
            return parsed
        except Exception as e:
            logger.error(f"Error generating AI insights via Groq: {e}")
            return fallback_insights()

    def explain_prediction(self, feature_dict, prediction_result):
        """
        Generates an interpretable AI explanation for a specific ML model inference result.
        """
        if not self.client:
            self.init_client()

        if not self.client:
            return f"Model classified as {prediction_result.get('disorder')} based on recorded behavioral indicators."

        prompt = f"""Explain this machine learning bipolar risk prediction for the patient:
Input Behavioral Features: {json.dumps(feature_dict)}
Model Classification: {prediction_result.get('disorder')}
Mania Risk: {prediction_result.get('mania_probability')}%
Depression Risk: {prediction_result.get('depression_risk')}%
Model Confidence: {prediction_result.get('confidence')}%

Provide a concise, 2-3 sentence clinical explanation of why the model arrived at this classification, highlighting the most influential features (like sleep, energy, or mood swing)."""

        try:
            response = self.client.chat.completions.create(
                model=Config.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You explain psychiatric machine learning model outputs clearly to patients."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=250
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error in Groq explain_prediction: {e}")
            return f"Model classified as {prediction_result.get('disorder')} based on your sleep, energy, and mood swing inputs."

    def transcribe_audio(self, audio_file_tuple):
        """
        Transcribes voice audio using Groq's Whisper API model.
        audio_file_tuple is (filename, file_bytes_or_stream, content_type)
        """
        if not self.client:
            self.init_client()
        if not self.client:
            raise RuntimeError("Groq client not available for Whisper transcription.")

        try:
            transcription = self.client.audio.transcriptions.create(
                model=Config.GROQ_WHISPER_MODEL,
                file=audio_file_tuple
            )
            return transcription.text
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            raise e

ai_service = AIService()

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, Mic, MicOff, Sparkles, RotateCcw, AlertCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";

const QUICK_PROMPTS = [
  { label: "🌱 Grounding Exercise", text: "Can you guide me through a 5-4-3-2-1 sensory grounding exercise right now?" },
  { label: "💤 Sleep & Mood Analysis", text: "How does my recent sleep duration impact my risk for mania or depression?" },
  { label: "⚡ Explain My Risk Scores", text: "Can you explain what my current episode risk and mood stability scores mean?" },
  { label: "🧘 Box Breathing Guide", text: "Could you walk me through a calming 4-4-4-4 box breathing technique?" },
  { label: "🛡️ Crisis Resources", text: "What crisis support and helpline resources are available if I need immediate help?" }
];

const ChatArea = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hello! I am your Bipolar AI Companion, powered by Groq. I can analyze your mood patterns, guide you through calming grounding exercises, and support your emotional regulation. How are you feeling today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      if (window.recognitionInstance) {
        window.recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support web speech recognition. You can type your message directly.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      window.recognitionInstance = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isTyping) return;

    setErrorMsg(null);
    const userMessage = { id: Date.now(), role: 'user', text: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!overrideText) setInput("");
    setIsTyping(true);

    try {
      // Format messages for Groq backend API
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          user_id: user?.user_id || 1
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const aiResponse = {
        id: data.id || Date.now() + 1,
        role: 'ai',
        text: data.text || "I'm here to support you. How else can I assist?"
      };

      if (data.user_context) {
        setActiveContext(data.user_context);
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("Chat error:", err);
      setErrorMsg("Unable to connect to AI server. Please check your backend connection.");
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: "I'm having trouble connecting to my neural engine right now. Please verify that the backend is running. In the meantime, remember to take slow, steady breaths."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'ai',
        text: "Conversation reset. I am your Bipolar AI Companion. How can I support your mental well-being right now?"
      }
    ]);
    setErrorMsg(null);
  };

  // Helper function to render text with clean paragraphs and bold formatting
  const renderFormattedText = (text) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, idx) => {
      const lines = para.split("\n");
      return (
        <p key={idx} style={{ margin: idx === 0 ? "0 0 8px 0" : "8px 0", lineHeight: "1.6" }}>
          {lines.map((line, lIdx) => {
            // Replace **bold**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <span key={lIdx} style={{ display: "block" }}>
                {parts.map((part, pIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={pIdx} style={{ color: "#f3f4f6" }}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div style={{ padding: "24px", height: "100%" }}>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981, #34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 20px -5px rgba(16,185,129,0.3)"
          }}>
            <MessageSquare style={{ width: "24px", height: "24px", color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: 0, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
              AI Mental Health Companion
            </h1>
            <p style={{ color: "#6b7280", margin: "4px 0 0 0", fontSize: "14px" }}>
              Powered by Groq High-Speed LLM & telemetry-aware clinical reasoning
            </p>
          </div>
        </div>

        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb",
            padding: "8px 14px", borderRadius: "10px", color: "#4b5563",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s"
          }}
          title="Reset conversation"
        >
          <RotateCcw size={14} /> New Chat
        </button>
      </div>

      {/* Main Chat Box Container */}
      <div style={{ 
        display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", 
        maxWidth: "1000px", margin: "0 auto", backgroundColor: "#1e2235", 
        borderRadius: "16px", overflow: "hidden", border: "1px solid #2a2f47", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)" 
      }}>
        {/* Header Bar */}
        <div style={{ 
          padding: "16px 24px", borderBottom: "1px solid #2a2f47", 
          backgroundColor: "rgba(30,34,53,0.9)", backdropFilter: "blur(10px)", 
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", height: "40px", borderRadius: "12px", 
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)", 
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              <Bot style={{ width: "22px", height: "22px", color: "white" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: "bold", color: "white", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Bipolar AI Companion
                </h2>
                <span style={{ 
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "11px", backgroundColor: "rgba(16,185,129,0.2)", color: "#34d399",
                  padding: "2px 8px", borderRadius: "12px", fontWeight: 600
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34d399", display: "inline-block" }}></span>
                  Groq Active
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#8b90a5", margin: "2px 0 0 0" }}>
                Empathetic, evidence-based mood regulation & psychoeducation
              </p>
            </div>
          </div>

          {/* Context Pill */}
          {activeContext && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
              padding: "6px 12px", borderRadius: "20px", fontSize: "12px", color: "#c4b5fd"
            }}>
              <Sparkles size={13} color="#a855f7" />
              <span>Telemetry: <strong>{activeContext.mood_stability}</strong> | Mania: {activeContext.mania_probability}% | Sleep: {activeContext.sleep_quality}h</span>
            </div>
          )}
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)", borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", color: "#fca5a5", fontSize: "13px"
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div style={{ 
          flex: 1, overflowY: "auto", padding: "24px", 
          display: "flex", flexDirection: "column", gap: "20px" 
        }}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  display: "flex",
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: "12px",
                  alignItems: "flex-end"
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  backgroundColor: msg.role === 'user' ? "#3b82f6" : "#2a2f47",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  {msg.role === 'user' ? 
                    <User style={{ width: "18px", height: "18px", color: "white" }} /> : 
                    <Bot style={{ width: "18px", height: "18px", color: "#a855f7" }} />
                  }
                </div>
                <div style={{
                  maxWidth: "75%",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  backgroundColor: msg.role === 'user' ? "#8b5cf6" : "#24293e",
                  color: "white",
                  fontSize: "14.5px",
                  lineHeight: "1.6",
                  borderBottomRightRadius: msg.role === 'user' ? "4px" : "16px",
                  borderBottomLeftRadius: msg.role === 'ai' ? "4px" : "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: msg.role === 'ai' ? "1px solid #2f354f" : "none"
                }}>
                  {renderFormattedText(msg.text)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                backgroundColor: "#2a2f47", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Bot style={{ width: "18px", height: "18px", color: "#a855f7" }} />
              </div>
              <div style={{
                padding: "14px 20px", borderRadius: "16px", backgroundColor: "#24293e",
                borderBottomLeftRadius: "4px", display: "flex", gap: "8px", alignItems: "center",
                border: "1px solid #2f354f"
              }}>
                <style>
                  {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                </style>
                <Loader2 style={{ width: "16px", height: "16px", color: "#a855f7", animation: "spin 1s linear infinite" }} />
                <span style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 500 }}>Bipolar AI is reflecting...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: "10px 24px",
          borderTop: "1px solid #2a2f47",
          backgroundColor: "#191c2b",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              disabled={isTyping}
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                color: "#c4b5fd",
                padding: "6px 12px",
                borderRadius: "14px",
                fontSize: "12px",
                cursor: isTyping ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.12)"}
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Controls Area */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #2a2f47", backgroundColor: "rgba(30,34,53,0.95)" }}>
          <div style={{ 
            display: "flex", gap: "12px", alignItems: "center", 
            backgroundColor: "#151826", padding: "8px 8px 8px 16px", 
            borderRadius: "24px", border: "1px solid #2a2f47", 
            transition: "border-color 0.2s" 
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your mood patterns, grounding techniques, or sleep..."
              disabled={isTyping}
              style={{
                flex: 1, backgroundColor: "transparent", border: "none", color: "white",
                fontSize: "14.5px", outline: "none", padding: "8px 0"
              }}
            />
            <button
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak your message"}
              style={{
                backgroundColor: isListening ? "rgba(239, 68, 68, 0.2)" : "transparent",
                color: isListening ? "#ef4444" : "#8b90a5", 
                border: "none", width: "38px", height: "38px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", 
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isListening ? <MicOff style={{ width: "19px", height: "19px" }} /> : <Mic style={{ width: "19px", height: "19px" }} />}
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{
                backgroundColor: input.trim() && !isTyping ? "#8b5cf6" : "#2a2f47",
                color: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", 
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                transition: "all 0.2s", transform: input.trim() && !isTyping ? "scale(1)" : "scale(0.95)"
              }}
            >
              <Send style={{ width: "18px", height: "18px", marginLeft: "2px" }} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", padding: "0 8px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
              💡 Clinical disclaimer: Companion AI is for educational & emotional support, not a replacement for clinical diagnosis.
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
              Crisis: Call 988
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

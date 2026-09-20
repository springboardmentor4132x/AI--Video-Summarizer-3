import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { apiClient } from "../api/client";

/**
 * VideoChatBot
 * Floating widget with two tabs:
 *  - Chat: ask questions about the video (POST /chat)
 *  - Quiz: generate a multiple-choice quiz from the video (GET /quiz/:id)
 *
 * Usage:
 *   <VideoChatBot videoId={videoId} videoTitle={file?.name} />
 *
 * Fully self-contained — safe to drop into any screen once a videoId exists.
 * Renders nothing until videoId is set.
 */
export default function VideoChatBot({ videoId, videoTitle }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("chat"); // "chat" | "quiz"

  // --- chat state ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const scrollRef = useRef(null);

  // --- quiz state ---
  const [quiz, setQuiz] = useState(null); // array of questions
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({}); // { [qIndex]: optionIndex }
  const [quizChecked, setQuizChecked] = useState(false);

  useEffect(() => {
    // Reset everything when the user switches to a different video
    setMessages([]);
    setChatError("");
    setQuiz(null);
    setQuizError("");
    setQuizAnswers({});
    setQuizChecked(false);
  }, [videoId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, chatLoading, tab]);

  function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { authorization: `Bearer ${token}` } : {};
  }

  async function sendQuestion(e) {
    e?.preventDefault();
    const question = input.trim();
    if (!question || !videoId || chatLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setChatLoading(true);
    setChatError("");

    try {
      const res = await apiClient.post(
        "/chat",
        { video_id: videoId, question },
        { headers: authHeaders() },
      );
      const answer = res.data?.answer || "Sorry, I couldn't find an answer.";
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch (err) {
      setChatError(
        err?.response?.data?.detail ||
          "Something went wrong reaching the assistant. Please try again.",
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function loadQuiz() {
    if (!videoId || quizLoading) return;
    setQuizLoading(true);
    setQuizError("");
    setQuizAnswers({});
    setQuizChecked(false);

    try {
      const res = await apiClient.get(`/quiz/${videoId}`, {
        headers: authHeaders(),
      });
      setQuiz(res.data?.questions || []);
    } catch (err) {
      setQuizError(
        err?.response?.data?.detail ||
          "Couldn't generate a quiz for this video. Please try again.",
      );
    } finally {
      setQuizLoading(false);
    }
  }

  function selectAnswer(qIndex, optionIndex) {
    if (quizChecked) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  }

  function isCorrectOption(question, option, optionIndex) {
    const correct = (question.correct_answer ?? "").toString().trim();
    if (!correct) return false;
    if (correct.toLowerCase() === (option ?? "").toString().trim().toLowerCase()) {
      return true;
    }
    // Some LLM outputs use a letter label (A/B/C/D) instead of the option text
    const letterIndex = "ABCD".indexOf(correct.toUpperCase());
    return letterIndex === optionIndex;
  }

  const quizScore =
    quiz && quizChecked
      ? quiz.reduce((score, q, i) => {
          const picked = quizAnswers[i];
          if (picked === undefined) return score;
          return isCorrectOption(q, q.options[picked], picked) ? score + 1 : score;
        }, 0)
      : null;

  if (!videoId) return null;

  const tabBtn = (key, label, Icon) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "8px 0",
        fontSize: "11px",
        fontWeight: 700,
        background: tab === key ? "var(--bg)" : "transparent",
        color: tab === key ? "var(--accent)" : "var(--text-muted)",
        border: "none",
        borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent",
        cursor: "pointer",
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close video assistant" : "Ask or quiz about this video"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "999px",
          background: "var(--accent)",
          color: "var(--accent-text)",
          border: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Video assistant"
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "480px",
            maxHeight: "calc(100vh - 120px)",
            background: "var(--bg-elevated)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Bot size={16} color="var(--accent)" />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 700 }}>
                  Video assistant
                </p>
                {videoTitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {videoTitle}
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex" }}>
              {tabBtn("chat", "Chat", MessageCircle)}
              {tabBtn("quiz", "Quiz", HelpCircle)}
            </div>
          </div>

          {/* CHAT TAB */}
          {tab === "chat" && (
            <>
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {messages.length === 0 && !chatLoading && (
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Ask a question about the transcript, summary, or key
                    moments — e.g. "What's the main topic?"
                  </p>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "flex-start",
                      flexDirection: m.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: "22px",
                        height: "22px",
                        borderRadius: "999px",
                        background: m.role === "user" ? "var(--accent)" : "var(--bg)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {m.role === "user" ? (
                        <User size={12} color="var(--accent-text)" />
                      ) : (
                        <Bot size={12} color="var(--text-muted)" />
                      )}
                    </div>
                    <div
                      style={{
                        maxWidth: "75%",
                        background: m.role === "user" ? "var(--accent)" : "var(--bg)",
                        color: m.role === "user" ? "var(--accent-text)" : "var(--text)",
                        border: m.role === "user" ? "none" : "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "7px 10px",
                        fontSize: "11.5px",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={13} className="animate-spin" color="var(--text-muted)" />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Thinking…
                    </span>
                  </div>
                )}

                {chatError && (
                  <p style={{ fontSize: "11px", color: "var(--danger)", margin: 0 }}>
                    {chatError}
                  </p>
                )}
              </div>

              <form
                onSubmit={sendQuestion}
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "10px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question…"
                  disabled={chatLoading}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "8px 10px",
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !input.trim()}
                  aria-label="Send question"
                  style={{
                    width: "34px",
                    height: "34px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--accent-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: chatLoading || !input.trim() ? "not-allowed" : "pointer",
                    opacity: chatLoading || !input.trim() ? 0.6 : 1,
                  }}
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}

          {/* QUIZ TAB */}
          {tab === "quiz" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {!quiz && !quizLoading && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Generate a 5-question quiz from this video's content.
                  </p>
                  <button
                    type="button"
                    onClick={loadQuiz}
                    style={{
                      padding: "8px 16px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "none",
                      background: "var(--accent)",
                      color: "var(--accent-text)",
                      cursor: "pointer",
                    }}
                  >
                    Generate Quiz
                  </button>
                  {quizError && (
                    <p style={{ fontSize: "11px", color: "var(--danger)", marginTop: "10px" }}>
                      {quizError}
                    </p>
                  )}
                </div>
              )}

              {quizLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", padding: "20px 0" }}>
                  <Loader2 size={13} className="animate-spin" color="var(--text-muted)" />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Generating quiz…
                  </span>
                </div>
              )}

              {quiz && quiz.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex}>
                      <p style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 6px" }}>
                        {qIndex + 1}. {q.question}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {q.options.map((option, optionIndex) => {
                          const picked = quizAnswers[qIndex] === optionIndex;
                          const correct = isCorrectOption(q, option, optionIndex);
                          let bg = "var(--bg)";
                          let border = "1px solid var(--border)";
                          if (quizChecked) {
                            if (correct) {
                              bg = "rgba(47,133,90,0.15)";
                              border = "1px solid var(--success)";
                            } else if (picked && !correct) {
                              bg = "rgba(192,57,43,0.15)";
                              border = "1px solid var(--danger)";
                            }
                          } else if (picked) {
                            bg = "rgba(240,162,2,0.15)";
                            border = "1px solid var(--accent)";
                          }
                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() => selectAnswer(qIndex, optionIndex)}
                              style={{
                                textAlign: "left",
                                fontSize: "11.5px",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                background: bg,
                                border,
                                color: "var(--text)",
                                cursor: quizChecked ? "default" : "pointer",
                              }}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!quizChecked ? (
                    <button
                      type="button"
                      onClick={() => setQuizChecked(true)}
                      disabled={Object.keys(quizAnswers).length < quiz.length}
                      style={{
                        padding: "9px 0",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--accent)",
                        color: "var(--accent-text)",
                        cursor:
                          Object.keys(quizAnswers).length < quiz.length
                            ? "not-allowed"
                            : "pointer",
                        opacity: Object.keys(quizAnswers).length < quiz.length ? 0.5 : 1,
                      }}
                    >
                      Check answers
                    </button>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 8px" }}>
                        Score: {quizScore} / {quiz.length}
                      </p>
                      <button
                        type="button"
                        onClick={loadQuiz}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "7px 14px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                          background: "var(--bg)",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <RotateCcw size={12} /> New quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

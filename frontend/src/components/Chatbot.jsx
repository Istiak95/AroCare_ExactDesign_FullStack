import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Headphones,
  Sparkles,
  Minus,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { api } from "../api";

const initial = [
  {
    role: "bot",
    text: "স্বাগতম! আমি AroCare Support। Product, order, prescription, delivery, payment, return, lab, doctor, refill বা account নিয়ে বাংলা, English বা Banglish-এ প্রশ্ন করুন।",
    source: "local",
  },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(initial);
  const [handoff, setHandoff] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState({ loading: true, ready: false, configured: false, mode: "checking" });
  const endRef = useRef(null);

  const loadStatus = async () => {
    setStatus((current) => ({ ...current, loading: true }));
    try {
      const data = await api("/chat/status");
      setStatus({ ...data, loading: false });
    } catch {
      setStatus({ loading: false, ready: false, configured: false, mode: "offline", message: "Backend unavailable" });
    }
  };

  useEffect(() => {
    if (open) loadStatus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, handoff]);

  const send = async (event, text = input) => {
    event?.preventDefault();
    const value = String(text).trim();
    if (!value || loading) return;

    setInput("");
    setHandoff(false);
    const nextMessages = [...messages, { role: "user", text: value }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const data = await api("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history: messages }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: data.reply,
          urgent: data.urgent,
          handoff: data.handoff,
          source: data.source,
          model: data.model,
          product: data.product,
        },
      ]);

      if (data.handoff === true) setHandoff(true);
      if (data.source === "gemini") {
        setStatus((current) => ({ ...current, loading: false, ready: true, configured: true, mode: "gemini", model: data.model || current.model }));
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: "Chat service-এর সঙ্গে সংযোগ পাওয়া যাচ্ছে না। Backend চলছে কি না দেখুন, তারপর আবার চেষ্টা করুন।",
          source: "offline",
        },
      ]);
      setStatus({ loading: false, ready: false, configured: false, mode: "offline", message: "Backend unavailable" });
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const data = await api("/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      setTicket(data);
      setHandoff(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const statusText = status.loading
    ? "Checking AI..."
    : status.ready
      ? `Gemini ready${status.model ? ` • ${status.model}` : ""}`
      : status.mode === "offline"
        ? "Backend offline"
        : "Local support mode";

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)}>
        {open ? <X /> : <><Bot /><span>AroCare Support</span></>}
      </button>

      {open && (
        <section className="chat-window">
          <div className="chat-head">
            <div className="chat-avatar"><Sparkles /></div>
            <div>
              <b>AroCare Support</b>
              <small><i />Online • বাংলা / English / Banglish</small>
            </div>
            <button onClick={() => setOpen(false)}><Minus /></button>
          </div>

          <button className={`chat-status ${status.ready ? "ready" : status.mode === "offline" ? "offline" : "local"}`} onClick={loadStatus} title={status.message || statusText}>
            {status.loading ? <RefreshCw className="spin" /> : status.ready ? <Wifi /> : <WifiOff />}
            <span>{statusText}</span>
            <small>Tap to recheck</small>
          </button>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`msg ${message.role} ${message.urgent ? "urgent" : ""}`}>
                {message.urgent && <ShieldAlert />}
                <span>{message.text}</span>

                {message.product && (
                  <a className="chat-product" href={`/product/${message.product.id}`}>
                    <img
                      src={message.product.image}
                      alt={message.product.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/products/placeholder.png";
                      }}
                    />
                    <span>
                      <b>{message.product.name}</b>
                      <small>{message.product.unit}</small>
                      <strong>৳{message.product.price}</strong>
                    </span>
                  </a>
                )}

                {message.handoff && (
                  <button className="handoff" onClick={() => setHandoff(true)}>
                    <Headphones />Talk to human agent
                  </button>
                )}

                {message.role === "bot" && message.source && (
                  <small className={`answer-source ${message.source}`}>
                    {message.source === "gemini"
                      ? `Gemini answer${message.model ? ` • ${message.model}` : ""}`
                      : message.source === "local"
                        ? "AroCare verified answer"
                        : message.source === "safety"
                          ? "Safety response"
                          : message.source === "offline"
                            ? "Connection error"
                            : "Local fallback"}
                  </small>
                )}
              </div>
            ))}

            {loading && <div className="typing"><span /><span /><span /></div>}

            {handoff && (
              <form className="handoff-form" onSubmit={submitTicket}>
                <b>Human support request</b>
                <input name="name" placeholder="Your name" required />
                <input name="phone" placeholder="Phone number" required />
                <textarea name="issue" placeholder="Briefly describe the issue" required />
                <div>
                  <button type="button" onClick={() => setHandoff(false)}>Cancel</button>
                  <button>Submit</button>
                </div>
              </form>
            )}

            {ticket && (
              <div className="ticket-success">
                <CheckCircle2 />
                <div><b>Request received</b><span>Ticket {ticket.id}</span></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="quick-replies">
            {["AroCare কীভাবে ব্যবহার করব?", "আমার order কোথায়?", "Prescription upload", "Delivery charge", "Human agent"].map((text) => (
              <button key={text} onClick={() => send(null, text)}>{text}</button>
            ))}
          </div>

          <form className="chat-input" onSubmit={send}>
            <button type="button" title="Attachment help"><Paperclip /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="আপনার প্রশ্ন লিখুন..." />
            <button aria-label="Send message"><Send /></button>
          </form>
          <small className="chat-note">Medical emergency হলে স্থানীয় জরুরি সেবায় যোগাযোগ করুন।</small>
        </section>
      )}
    </>
  );
}

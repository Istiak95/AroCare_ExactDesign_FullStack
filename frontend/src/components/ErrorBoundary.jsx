import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("AroCare frontend error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main style={{ maxWidth: 720, margin: "80px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: "#117a4b" }}>AroCare could not load</h1>
        <p>Please refresh the page. If the problem continues, open the browser Console and check the first red error.</p>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f6f8f7", padding: 16, borderRadius: 12 }}>
          {String(this.state.error?.message || this.state.error)}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 18px", border: 0, borderRadius: 8, background: "#117a4b", color: "white", cursor: "pointer" }}>
          Reload website
        </button>
      </main>
    );
  }
}

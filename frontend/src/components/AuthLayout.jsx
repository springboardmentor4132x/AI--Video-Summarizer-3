import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0e12",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "#17191e",
          borderRadius: "12px",
          padding: "12px",
          border: "0.5px solid #2d3139",
          boxShadow: "0 20px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Window Controls Header */}
        <div style={{ display: "flex", gap: "6px", padding: "4px 6px 12px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3d424d",
            }}
          />
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3d424d",
            }}
          />
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3d424d",
            }}
          />
        </div>

        {/* Split Container */}
        <div
          style={{
            display: "flex",
            minHeight: "420px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "0.5px solid #2d3139",
          }}
        >
          {/* Left Dark Branding Panel */}
          <div
            style={{
              flex: "0 0 42%",
              backgroundColor: "#111318",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "28px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#F0A202",
                  }}
                />
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#F4F3EF",
                  }}
                >
                  ClipMind
                </span>
              </div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  color: "#9A9DA5",
                  margin: "0 0 18px",
                }}
              >
                AI VIDEO SUMMARIZER
              </p>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "500",
                  color: "#F4F3EF",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Long videos.
                <br />
                Straight to what matters.
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9A9DA5",
                  lineHeight: "1.6",
                  margin: "16px 0 0",
                }}
              >
                Transcripts, summaries, and key moments — generated the moment
                you upload.
              </p>
            </div>

            {/* Audio Wave Visualizer */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "3px",
                height: "40px",
              }}
            >
              <span
                style={{ width: "3px", height: "14px", background: "#F0A202" }}
              />
              <span
                style={{ width: "3px", height: "26px", background: "#3d3f46" }}
              />
              <span
                style={{ width: "3px", height: "18px", background: "#3d3f46" }}
              />
              <span
                style={{ width: "3px", height: "34px", background: "#F0A202" }}
              />
              <span
                style={{ width: "3px", height: "20px", background: "#3d3f46" }}
              />
              <span
                style={{ width: "3px", height: "12px", background: "#3d3f46" }}
              />
              <span
                style={{ width: "3px", height: "28px", background: "#3d3f46" }}
              />
              <span
                style={{ width: "3px", height: "16px", background: "#F0A202" }}
              />
              <span
                style={{ width: "3px", height: "24px", background: "#3d3f46" }}
              />
            </div>
          </div>

          {/* Right Form Panel */}
          <div
            style={{
              flex: "1",
              backgroundColor: "#FAF9F6",
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export function AuthLayout({ children, formTitle, formSubtitle }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1F2328",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          backgroundColor: "#1A1D24",
          borderRadius: "12px",
          padding: "12px",
          border: "0.5px solid #2D3139",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Top Window Dots */}
        <div style={{ display: "flex", gap: "6px", padding: "4px 6px 12px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3D3F46",
            }}
          ></span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3D3F46",
            }}
          ></span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3D3F46",
            }}
          ></span>
        </div>

        {/* Main Split Container */}
        <div
          style={{
            display: "flex",
            minHeight: "440px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "0.5px solid #2D3139",
          }}
        >
          {/* Left Branding Panel */}
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
                    backgroundColor: "#F0A202",
                  }}
                ></span>
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
              <h2
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
              </h2>
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

            {/* Audio Wave Visualizer Graphic */}
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
              ></span>
              <span
                style={{ width: "3px", height: "26px", background: "#3d3f46" }}
              ></span>
              <span
                style={{ width: "3px", height: "18px", background: "#3d3f46" }}
              ></span>
              <span
                style={{ width: "3px", height: "34px", background: "#F0A202" }}
              ></span>
              <span
                style={{ width: "3px", height: "20px", background: "#3d3f46" }}
              ></span>
              <span
                style={{ width: "3px", height: "12px", background: "#3d3f46" }}
              ></span>
              <span
                style={{ width: "3px", height: "28px", background: "#3d3f46" }}
              ></span>
              <span
                style={{ width: "3px", height: "16px", background: "#F0A202" }}
              ></span>
            </div>
          </div>

          {/* Right Form Container */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#FAF9F6",
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: "100%", maxWidth: "280px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#1F2328",
                  margin: "0 0 4px",
                  textAlign: "left",
                }}
              >
                {formTitle}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6B6F76",
                  margin: "0 0 22px",
                  textAlign: "left",
                }}
              >
                {formSubtitle}
              </p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

import React, { useState } from "react";

export default function VideoUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      alert(`Uploaded ${file.name} successfully!`);
      setFile(null);
    }, 2000);
  };

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
                Instant Insights.
                <br />
                From Any Video.
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9A9DA5",
                  lineHeight: "1.6",
                  margin: "16px 0 0",
                }}
              >
                Upload your file to generate time-stamped summaries, key
                takeaways, and transcripts in real time.
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

          {/* Right Upload Panel */}
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
            <div style={{ maxWidth: "290px", width: "100%", margin: "0 auto" }}>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#1F2328",
                  margin: "0 0 4px",
                }}
              >
                Upload Video
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6B6F76",
                  margin: "0 0 22px",
                }}
              >
                Select an MP4 or MOV file to begin.
              </p>

              <form onSubmit={handleUpload}>
                <div style={{ marginBottom: "18px" }}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="video-file-input"
                  />
                  <label
                    htmlFor="video-file-input"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "#FFFFFF",
                      border: "1px dashed #E4E2DC",
                      borderRadius: "8px",
                      padding: "28px 16px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "20px", color: "#9A9DA5" }}>
                      📁
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: file ? "#1F2328" : "#9A9DA5",
                        fontWeight: file ? "500" : "400",
                      }}
                    >
                      {file ? file.name : "Click to select video"}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!file || uploading}
                  style={{
                    width: "100%",
                    background: !file || uploading ? "#E4E2DC" : "#F0A202",
                    color: !file || uploading ? "#9A9DA5" : "#412402",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "500",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: !file || uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? "Summarizing..." : "Generate Summary"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

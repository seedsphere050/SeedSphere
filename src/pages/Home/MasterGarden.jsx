import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    eyebrow: "Smart Matching",
    title: "Find your perfect match",
    body: "Find plants guaranteed to thrive in your specific environment.",
    img: "/images/smart.jpg",
    btnText: "Get Recommendations",
    path: "/recommendation",
    color: "#aee7b8",
  },
  {
    eyebrow: "AI Diagnosis",
    title: "Is your plant sick?",
    body: "Let our AI compare your plant against 50,000+ botanist records.",
    img: "/images/ai.jpg",
    btnText: "Try AI Diagnosis",
    path: "/disease-detection",
    color: "#e7c0d3",
  },
  {
    eyebrow: "Digital Twin",
    title: "Your Garden's Digital Twin",
    body: "Track hydration levels and growth progress over time.",
    img: "/images/dt.jpg",
    btnText: "Create Digital Twin",
    path: "/digital-twin",
    color: "#b3bfe6",
  },
];

function FeatureCard({ feature, index, navigate }) {
  const isEven = index % 2 === 0;
  const imgRef = useRef(null);
  const [transform, setTransform] = useState("scale(1.05) translate(0px, 0px)");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const moveX = x * 20; // max 20px shift
    const moveY = y * 20;
    setTransform(`scale(1.08) translate(${moveX}px, ${moveY}px)`);
  };

  const handleMouseLeave = () => {
    setTransform("scale(1.05) translate(0px, 0px)");
  };

  return (
    <div
      className="stack-card"
      style={{
        top: `calc(10vh + ${index * 40}px)`,
        zIndex: index + 1,
        backgroundColor: feature.color,
        borderRadius: "3rem",
        padding: "2.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isEven ? "row" : "row-reverse",
          height: "100%",
          width: "100%",
          gap: "8rem",
          alignItems: "center",
        }}
      >
        {/* Image with parallax */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            flex: 0.85,
            height: "75%",
            borderRadius: "4rem",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            cursor: "none",
            marginLeft: isEven ? "8rem" : "9rem",   /* pushes image inward on odd cards */
            marginRight: isEven ? "8rem" : "8rem",
          }}
        >
          <img
            ref={imgRef}
            src={feature.img}
            alt={feature.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: transform,
              transition: "transform 0.15s ease-out",
              willChange: "transform",
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1.5rem",
          }}
        >
          <span style={{
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "2.75rem",
            fontWeight: 700,
            opacity: 0.5,
          }}>
            {feature.eyebrow}
          </span>
          <h3 style={{
            fontSize: "clamp(12.5rem, 5.5vw, 4rem)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.05,
            color: "#1a1a1a",
          }}>
            {feature.title}
          </h3>
          <p style={{
            fontSize: "3.5rem",
            color: "rgba(0,0,0,0.65)",
            maxWidth: "90rem",
            lineHeight: 1.6,
          }}>
            {feature.body}
          </p>
          <button
            onClick={() => navigate(feature.path)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#333"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#111"}
            style={{
              alignSelf: "flex-start",
              padding: "3rem 5.5rem",
              backgroundColor: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "3.0rem",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            {feature.btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MasterGarden() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white" style={{ overflow: "visible" }}>

      {/* Header */}
      <div className="text-center py-32 px-6">
        <span className="text-green-600 font-bold uppercase tracking-[0.3em] text-3xl block mb-4">
          Professional Tools
        </span>
        <h2 className="text-7xl md:text-9xl font-black italic text-black-900">
          Master Your Garden
        </h2>
      </div>

      <div className="stack-wrapper">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            index={index}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}
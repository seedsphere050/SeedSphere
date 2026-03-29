import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { detectDisease, detectDiseaseFromBase64 } from "../../services/plantService";

const severityScheme = (severity = "") => {
  const s = severity?.toLowerCase||"";
  if (s === "high" || s === "severe")
    return { bg: "bg-red-50", border: "border-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700" };
  if (s === "medium" || s === "moderate")
    return { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" };
  if (s === "none")
    return { bg: "bg-green-50", border: "border-green-500", text: "text-green-700", badge: "bg-green-100 text-green-700" };
  return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" };
};

const RichField = ({ value }) => {
  if (!value) return null;
  if (Array.isArray(value))
    return (
      <ul className="list-disc list-inside space-y-2 mt-2">
        {value.map((item, i) => <li key={i} className="text-gray-600 text-3xl leading-relaxed">{item}</li>)}
      </ul>
    );
  if (typeof value === "object")
    return (
      <div className="space-y-4 mt-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <p className="text-3xl font-black text-gray-700 capitalize">{k}:</p>
            <RichField value={v} />
          </div>
        ))}
      </div>
    );
  return <p className="text-gray-600 text-3xl leading-relaxed mt-1">{value}</p>;
};

const StepCard = ({ number, title, desc, icon }) => (
  <div className="p-12 bg-[#fffdd0] rounded-[4rem] hover:bg-green-50 transition-all group border border-transparent hover:border-green-200">
    <div className="flex justify-between items-start mb-10">
      <span className="text-9xl font-black text-green-200 group-hover:text-green-300">{number}</span>
      <span className="text-8xl">{icon}</span>
    </div>
    <h3 className="text-8xl font-black text-gray-900 mb-6 italic" style={{ fontFamily: '"Times New Roman", serif' }}>{title}</h3>
    <p className="text-5xl text-gray-600 leading-relaxed font-medium">{desc}</p>
  </div>
);

const formatName = (raw = "") =>
  raw.replace(/___/g, " › ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function DiseaseDetection() {
  const [image, setImage]             = useState(null);
  const [imageFile, setImageFile]     = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGradcam, setShowGradcam] = useState(false);
  const webcamRef = useRef(null);
  const timesFont = { fontFamily: '"Times New Roman", Times, serif' };

  const startFresh = (capturing = false) => {
    setResult(null); setImage(null); setImageFile(null);
    setError(null); setIsCapturing(capturing); setShowGradcam(false);
  };

  const capture = () => {
    const src = webcamRef.current?.getScreenshot();
    if (src) { setImage(src); setImageFile(null); setIsCapturing(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    startFresh(false);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const analyzePlant = async () => {
    setLoading(true); setError(null);
    try {
      const response = imageFile
        ? await detectDisease(imageFile)
        : await URL.createObjectURL(file);

      if (response.ok) {
        setResult(response.data);
        setShowGradcam(false);
      } else {
        const d = response.data;
        if (d?.error === "low_confidence") {
          setError({ type: "low_confidence", confidence: d.confidence, message: d.message });
        } else {
          setError({ type: "generic", message: d?.error || "Detection failed." });
        }
      }
    } catch {
      setError({ type: "generic", message: "Cannot connect to backend. Make sure Django is running on port 8000." });
    }
    setLoading(false);
  };

  const scheme    = result ? severityScheme(result.severity) : severityScheme("");
  const hasGradcam = !!(result?.gradcam_image);
  const displayedImage = hasGradcam && showGradcam ? result.gradcam_image : image;

  return (
    <div className="w-full min-h-screen bg-[#f4f7f4]">

      {/* HERO */}
      <section className="relative w-full h-screen overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/images/login.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center items-center p-10 z-30 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-white flex flex-col items-center" style={timesFont}>
            <h2 className="text-6xl md:text-[160px] font-black italic drop-shadow-2xl leading-none mb-12">
              Never Wonder Why<br />Your Plant is Dying.
            </h2>
            <div className="h-2 w-96 bg-green-400 mb-12" />
            <p className="text-5xl font-bold opacity-90 max-w-5xl drop-shadow-lg mb-16">
              Upload a clear leaf photo — AI identifies the disease and marks the exact region.
            </p>
            <button onClick={() => { setIsModalOpen(true); startFresh(false); }}
              className="bg-white text-black px-20 py-10 rounded-full text-5xl font-black hover:bg-green-700 hover:text-white transition-all shadow-2xl hover:scale-105">
              Start Diagnosis
            </button>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-9xl font-black italic text-[#1b4332] mb-6" style={timesFont}>How It Works</h2>
            <p className="text-5xl text-gray-500 font-medium">Three steps to save your plants.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <StepCard number="01" title="Snap a Photo" icon="📸" desc="Clear close-up of the affected leaf in good natural light." />
            <StepCard number="02" title="AI Analysis" icon="🔬" desc="Neural network identifies the disease and highlights the region with Grad-CAM." />
            <StepCard number="03" title="Get Treatment" icon="🌿" desc="Complete care plan: symptoms, treatment, and prevention." />
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)} />

            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-[95vw] h-[92vh] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">

              <button onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 z-50 text-5xl text-gray-400 hover:text-black">✕</button>

              {/* LEFT */}
              <div className="w-full md:w-[45%] bg-gray-50 p-10 flex flex-col items-center justify-center border-r border-gray-100 shrink-0">

                {/* Image box — object-contain prevents blur/crop */}
                <div className="w-full aspect-square bg-white rounded-[2.5rem] shadow-inner overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 relative">
                  {isCapturing ? (
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ width: 1280, height: 720, facingMode: "environment"}}
                      className="absolute inset-0 w-full h-full object-cover" />
                  ) : image ? (
                    /* ✅ CHANGE: SIDE-BY-SIDE VIEW */
                      hasGradcam ? (
  <div className="grid grid-cols-2 gap-4 w-full h-full p-2">
    <img
      src={image}
      alt="Original"
      className="w-full h-full object-contain bg-white rounded-xl"
      style={{ imageRendering: "auto" }}
    />
    <img
      src={result.gradcam_image}
      alt="GradCAM"
      className="w-full h-full object-contain bg-white rounded-xl"
      style={{ imageRendering: "auto" }}
    />
  </div>
) : (
  <img
    src={image}
    alt="Uploaded"
    className="absolute inset-0 w-full h-full object-contain bg-white"
    style={{ imageRendering: "auto" }}
  />
)):(<div className="text-center text-gray-300">
      <div className="text-9xl mb-4">🌿</div>
      <p className="text-4xl font-black uppercase">No Image</p>
    </div>
  )}

</div>


                {/* Grad-CAM toggle */}
                {hasGradcam && (
                  <div className="flex gap-3 mt-5 w-full">
                    <button onClick={() => setShowGradcam(false)}
                      className={`flex-1 py-5 rounded-2xl text-3xl font-bold border transition-all
                        ${!showGradcam ? "bg-[#2d6a4f] text-white border-[#2d6a4f]" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                      🖼 Original
                    </button>
                    <button onClick={() => setShowGradcam(true)}
                      className={`flex-1 py-5 rounded-2xl text-3xl font-bold border transition-all
                        ${showGradcam ? "bg-[#2d6a4f] text-white border-[#2d6a4f]" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                      🔬 Disease Map
                    </button>
                  </div>
                )}

                {/* Upload/Camera */}
                {!result && !error && (
                  <div className="flex gap-3 mt-5 w-full">
                    <button onClick={() => startFresh(true)}
                      className="flex-1 py-7 bg-white border border-gray-200 rounded-2xl text-4xl font-bold hover:bg-gray-100">
                      📷 Camera
                    </button>
                    <label className="flex-1 py-7 bg-white border border-gray-200 rounded-2xl text-4xl font-bold hover:bg-gray-100 cursor-pointer text-center flex items-center justify-center">
                      📁 Upload
                      <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                )}

                {error && (
                  <button onClick={() => startFresh(false)}
                    className="w-full mt-5 py-7 bg-white border border-gray-200 rounded-2xl text-4xl font-bold hover:bg-gray-100">
                    ← Try Another Image
                  </button>
                )}

                {isCapturing && (
                  <button onClick={capture}
                    className="w-full mt-5 py-8 bg-green-700 text-white rounded-2xl text-5xl font-black italic">
                    Capture Leaf
                  </button>
                )}

                {image && !isCapturing && !result && !error && (
                  <button onClick={analyzePlant} disabled={loading}
                    className="w-full mt-5 py-8 bg-[#2d6a4f] text-white rounded-2xl text-5xl font-black hover:bg-green-700 disabled:opacity-50">
                    {loading ? "Analyzing…" : "Run AI Diagnosis"}
                  </button>
                )}

                {result && (
                  <button onClick={() => startFresh(false)}
                    className="w-full mt-5 py-6 bg-gray-100 text-gray-700 rounded-2xl text-4xl font-bold hover:bg-gray-200">
                    ← New Scan
                  </button>
                )}
              </div>

              {/* RIGHT */}
              <div className="w-full md:flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {loading && (
                    <motion.div key="loader" className="flex flex-col items-center justify-center h-full"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="w-24 h-24 border-[8px] border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-8" />
                      <p className="text-5xl font-black italic text-gray-700">Analyzing your plant…</p>
                      <p className="text-3xl text-gray-400 mt-3">Running AI model + Grad-CAM</p>
                    </motion.div>
                  )}

                  {!loading && error?.type === "low_confidence" && (
                    <motion.div key="low-conf" className="flex flex-col justify-center h-full space-y-8"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="p-10 bg-yellow-50 rounded-[2rem] border-l-8 border-yellow-400">
                        <p className="text-yellow-700 font-black text-5xl mb-4">⚠️ Image Not Recognised as a Leaf</p>
                        <p className="text-gray-700 text-4xl leading-relaxed mb-4">{error.message}</p>
                        <p className="text-yellow-600 text-3xl font-bold">Confidence: {error.confidence}% (minimum: 60%)</p>
                      </div>
                      <div className="p-8 bg-gray-50 rounded-2xl">
                        <p className="text-gray-700 font-black text-4xl mb-4">Tips for best results:</p>
                        <ul className="space-y-3">
                          {["Fill the frame with the leaf — no background clutter",
                            "Use natural daylight, avoid flash glare",
                            "Leaf should be flat, in focus, and close-up",
                            "Supported: Apple, Tomato, Potato, Grape, Peach, Corn, and more"].map((tip, i) => (
                            <li key={i} className="text-gray-600 text-3xl flex items-start gap-3">
                              <span className="text-green-500 font-black mt-1">✓</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {!loading && error?.type === "generic" && (
                    <motion.div key="error" className="flex flex-col justify-center h-full"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-10 bg-red-50 rounded-[2rem] border-l-8 border-red-400">
                        <p className="text-red-700 font-black text-5xl mb-3">⚠️ Error</p>
                        <p className="text-gray-700 text-4xl leading-relaxed">{error.message}</p>
                      </div>
                    </motion.div>
                  )}

                  {!loading && !error && result && (
                    <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className="space-y-8">
                      <div>
                        <span className={`inline-block px-6 py-2 rounded-full text-3xl font-black uppercase tracking-wider mb-4 ${scheme.badge}`}>
                          {result.severity || "Detected"}
                        </span>
                        <h2 className="text-6xl font-black italic text-gray-900 leading-tight mb-3" style={timesFont}>
                          {formatName(result.name)}
                        </h2>
                        <p className="text-4xl text-gray-500">🌿 {result.plant_name}</p>
                        <p className="text-4xl text-gray-500 mt-1">🎯 Confidence: <strong className="text-gray-700">{result.confidence}%</strong></p>
                        {result.gradcam_image ? (
        <p className="text-green-600 text-2xl mt-2 font-bold">
          ✔ Grad-CAM generated successfully
        </p>
      ) : (
        <p className="text-red-500 text-2xl mt-2 font-bold">
          ✖ Grad-CAM not available (low activation)
        </p>
      )}

                      </div>

                      <div className={`p-8 ${scheme.bg} rounded-[2rem] border-l-8 ${scheme.border}`}>
                        <p className={`${scheme.text} text-4xl leading-relaxed`}>{result.description}</p>
                      </div>

                      <div><p className="text-4xl font-black text-gray-800 mb-2">🔍 Symptoms</p><RichField value={result.symptoms} /></div>
                      <div><p className="text-4xl font-black text-gray-800 mb-2">💊 Treatment</p><RichField value={result.treatment} /></div>
                      <div><p className="text-4xl font-black text-gray-800 mb-2">🛡️ Prevention</p><RichField value={result.prevention} /></div>

                      {result.gradcam_image  && (
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                          <p className="text-3xl text-green-700 font-bold">
                            🔬 The right image shows where the AI detected the disease.

                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!loading && !error && !result && (
                    <motion.div key="idle" className="flex flex-col items-center justify-center h-full"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-[10rem] mb-6 opacity-10">🔬</div>
                      <p className="text-5xl font-medium text-gray-300">Ready for Diagnosis</p>
                      <p className="text-3xl text-gray-300 mt-3">Upload or capture a clear leaf image</p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

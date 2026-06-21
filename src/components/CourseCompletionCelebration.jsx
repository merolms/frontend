import { PartyPopper, Sparkles, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const CourseCompletionCelebration = ({ courseTitle, onClose }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showContent, setShowContent] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    // Stagger the content reveal
    const contentTimer = setTimeout(() => setShowContent(true), 300);

    // Stop confetti after 6 seconds
    const confettiTimer = setTimeout(() => setConfettiActive(false), 6000);

    // Auto-close after 8 seconds
    const closeTimer = setTimeout(onClose, 8000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(contentTimer);
      clearTimeout(confettiTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      {confettiActive && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={400}
          recycle={false}
          colors={[
            "#FFD700",
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#96CEB4",
            "#FFEAA7",
            "#DDA0DD",
            "#98D8C8",
            "#F7DC6F",
            "#BB8FCE",
          ]}
          gravity={0.15}
          initialVelocityY={8}
          tweenDuration={5000}
        />
      )}

      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "48px 64px",
          borderRadius: 24,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          maxWidth: 480,
          transform: showContent ? "scale(1) translateY(0)" : "scale(0.5) translateY(40px)",
          opacity: showContent ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating icons */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 8px 32px rgba(255, 215, 0, 0.4)",
              animation: "bounceIn 0.6s ease-out 0.2s both, pulse 2s ease-in-out 1s infinite",
            }}
          >
            <Trophy size={48} color="#fff" strokeWidth={2.5} />
          </div>

          {/* Orbiting stars */}
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              marginLeft: 32,
              animation: "orbitStar 3s ease-in-out infinite",
            }}
          >
            <Star size={20} fill="#FFD700" color="#FFD700" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: -8,
              animation: "orbitStar 3s ease-in-out 0.5s infinite",
            }}
          >
            <Sparkles size={18} color="#4ECDC4" />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: -12,
              animation: "orbitStar 3s ease-in-out 1s infinite",
            }}
          >
            <PartyPopper size={20} color="#FF6B6B" />
          </div>
        </div>

        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: "0 0 8px",
            lineHeight: 1.2,
            animation: "slideUp 0.5s ease-out 0.4s both",
          }}
        >
          🎉 Course Completed!
        </h2>

        <p
          style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            margin: "0 0 8px",
            animation: "slideUp 0.5s ease-out 0.5s both",
          }}
        >
          You&apos;ve successfully completed
        </p>

        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--primary)",
            margin: "0 0 24px",
            animation: "slideUp 0.5s ease-out 0.6s both",
          }}
        >
          {courseTitle}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
            animation: "slideUp 0.5s ease-out 0.7s both",
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={24}
              fill="#FFD700"
              color="#FFD700"
              style={{
                animation: `starPop 0.3s ease-out ${0.8 + i * 0.1}s both`,
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "12px 32px",
            borderRadius: 12,
            border: "none",
            background: "var(--primary)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            animation: "slideUp 0.5s ease-out 0.9s both",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          Continue Learning →
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes orbitStar {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(10deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(6px) rotate(-10deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseCompletionCelebration;

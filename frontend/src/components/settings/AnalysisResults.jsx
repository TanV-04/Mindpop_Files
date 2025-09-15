import React from "react";

const AnalysisResults = ({ analysis }) => {
  const {
    fileName,
    analysisDate,
    overallScore,
    armflapping,
    headbanging,
    spinning,
  } = analysis;

  const interpretConfidence = (conf) => {
    if (conf < 0.3)
      return { label: "Low", color: "green", description: "Rarely observed" };
    if (conf < 0.6)
      return {
        label: "Moderate",
        color: "orange",
        description: "Sometimes observed",
      };
    return { label: "High", color: "red", description: "Frequently observed" };
  };

  const interpretOverall = (score) => {
    if (score < 30) return { label: "Low", color: "green" };
    if (score < 60) return { label: "Moderate", color: "orange" };
    return { label: "High", color: "red" };
  };

  const overall = interpretOverall(overallScore);

  const behaviors = {
    armflapping,
    headbanging,
    spinning,
  };

  const behaviorNames = {
    armflapping: "Arm Flapping",
    headbanging: "Head Banging",
    spinning: "Spinning",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-[#66220B]">
            {fileName || "Video Analysis"}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(analysisDate).toLocaleDateString()} •{" "}
            {new Date(analysisDate).toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: overall.color }}>
            {overallScore}%
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full bg-${overall.color}-100 text-${overall.color}-800`}
          >
            {overall.label} likelihood
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {Object.entries(behaviors).map(([behavior, data]) => {
          if (!data) return null;

          const interp = interpretConfidence(data.confidence || 0);

          return (
            <div
              key={behavior}
              className="text-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="font-medium text-sm mb-1">
                {behaviorNames[behavior]}
              </div>
              <div
                className={`text-lg ${
                  data.detected ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.detected ? "Detected" : "Not Detected"}
              </div>
              <div className="text-xs text-gray-500">
                Confidence: {Math.round((data.confidence || 0) * 100)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded p-3">
        <h5 className="font-medium text-blue-800 mb-2">Recommendations</h5>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          {armflapping?.detected && (
            <li>
              Arm flapping detected. Consider consulting with an occupational
              therapist.
            </li>
          )}
          {headbanging?.detected && (
            <li>
              Head banging observed. Safety measures and professional
              consultation recommended.
            </li>
          )}
          {spinning?.detected && (
            <li>
              Spinning detected. Consider providing safe alternatives for
              vestibular needs.
            </li>
          )}
          {!armflapping?.detected &&
            !headbanging?.detected &&
            !spinning?.detected && (
              <li>
                No autism-related behaviors detected. Continue monitoring as
                needed.
              </li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisResults;
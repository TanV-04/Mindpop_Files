import React from "react";
import { motion } from "framer-motion";
import { formatPercentage } from "../../../utils/helpers";

const Results = ({ state, errors, accuracyPercentage, total, className }) => {
  const initial = { opacity: 0 };
  const animate = { opacity: 1 };
  const duration = { duration: 0.3 };

  if (state !== "finish") {
    return null;
  }

  return (
    <motion.ul
      className={`flex flex-col items-center text-yellow-400 space-y-3 ${className}`}
    >
      <motion.li
        initial={initial}
        animate={animate}
        className="text-xl font-bold"
        transition={{ ...duration, delay: 0 }}
      >
        Results
      </motion.li>

      <motion.li
        initial={initial}
        animate={animate}
        transition={{ ...duration, delay: 0.5 }}
      >
        Accuracy: {formatPercentage(accuracyPercentage)}
      </motion.li>

      <motion.li
        initial={initial}
        animate={animate}
        className="text-red-500"
        transition={{ ...duration, delay: 1 }}
      >
        Errors: {errors}
      </motion.li>
      <motion.li
        initial={initial}
        animate={animate}
        transition={{ ...duration, delay: 1.4 }}
      >
        Typed: {total}
      </motion.li>
    </motion.ul>
  );
};

export default Results;

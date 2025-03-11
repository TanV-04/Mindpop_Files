import React from "react";
import { motion } from "framer-motion";

const Caret = () => {
  return (
    <motion.div
      aria-hidden={true}
      className="inline-block bg-yellow-500 w-0.5 h-7"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
    />
  );
};

export default Caret;

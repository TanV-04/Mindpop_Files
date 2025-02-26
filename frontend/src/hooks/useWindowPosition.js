import { useLayoutEffect, useState } from "react";

// Original animation trigger functionality
export default function useWindowPosition(id) {
  const [animation, setAnimation] = useState(false);

  useLayoutEffect(() => {
    function updatePosition() {
      const element = window.document.getElementById(id);
      if (!element) return;

      const offsetHeight = element.offsetHeight;

      //adjust the trigger threshold based on the screen width
      const scrollThreshold = window.innerWidth < 600 ? 0.3 : 0.4; //0.2 for smaller screens, 0.4 for larger ones

      //check if the page is scrolled past the adjusted threshold
      if (window.pageYOffset > offsetHeight * scrollThreshold) {
        setAnimation(true);
      } else {
        setAnimation(false);
      }
    }

    window.addEventListener("scroll", updatePosition);
    //call the function once to check if it should be visible
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, [id]);

  return animation;
}

// Added scroll position tracker for the game - with a different name
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    scrollX: 0,
    scrollY: 0,
  });

  useLayoutEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      });
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial position
    handleScroll();

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
};
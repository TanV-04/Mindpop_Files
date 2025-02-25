import { useLayoutEffect, useState } from "react";

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

// this is a custom hook is used to trigger an animation or some other state change when a specific element comes into view as the user scrolls down the page

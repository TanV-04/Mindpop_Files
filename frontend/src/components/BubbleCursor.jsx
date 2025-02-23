'use client';
import React, { useEffect, useRef } from 'react';

class Particle {
  lifeSpan;
  initialLifeSpan;
  velocity;
  position;
  baseDimension;

  constructor(x, y) {
    this.initialLifeSpan = Math.floor(Math.random() * 60 + 60); // Particle lifespan between 60 and 120
    this.lifeSpan = this.initialLifeSpan;
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
      y: -0.4 + Math.random() * -1, // Create random velocity for y (upward)
    };
    this.position = { x, y };
    this.baseDimension = 12; // Increased size of the particle (previously 4)
  }

  update(context) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75; // Small random movement in x direction
    this.velocity.y -= Math.random() / 600; // Add upward velocity
    this.lifeSpan--; // Decrease lifespan of the particle

    // Scale the particle's size based on how much life is remaining
    const scale =
      0.2 + (this.initialLifeSpan - this.lifeSpan) / this.initialLifeSpan;

    // Draw the particle with a smooth transition
    context.fillStyle = 'rgba(218, 112, 214, 0.6)'; // Translucent light pink
    context.strokeStyle = 'rgba(230, 230, 250, 0.6)'; // Translucent dark purple stroke
    context.beginPath();
    context.arc(
      this.position.x - (this.baseDimension / 2) * scale,
      this.position.y - this.baseDimension / 2,
      this.baseDimension * scale,
      0,
      2 * Math.PI
    );
    context.stroke();
    context.fill();
    context.closePath();
  }
}

const BubbleCursor = ({ wrapperElement }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]); // Store particles in a ref
  const cursorRef = useRef({ x: 0, y: 0 }); // Store cursor position
  const animationFrameRef = useRef(null); // Store animation frame reference

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    let canvas = null;
    let context = null;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const init = () => {
      if (prefersReducedMotion.matches) {
        console.log(
          'This browser has prefers reduced motion turned on, so the cursor did not init'
        );
        return false;
      }
      canvas = canvasRef.current;
      if (!canvas) return;
      context = canvas.getContext('2d');
      if (!context) return;

      // Set canvas styles
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.pointerEvents = 'none'; // Prevent the canvas from interfering with interactions

      // Position the canvas
      if (wrapperElement) {
        canvas.style.position = 'absolute';
        wrapperElement.appendChild(canvas);
        canvas.width = wrapperElement.clientWidth;
        canvas.height = wrapperElement.clientHeight;
      } else {
        canvas.style.position = 'fixed';
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
      }

      bindEvents();
      loop();
    };

    const bindEvents = () => {
      const element = wrapperElement || document.body;
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('touchmove', onTouchMove, { passive: true });
      element.addEventListener('touchstart', onTouchMove, { passive: true });
      window.addEventListener('resize', onWindowResize);
    };

    const onWindowResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (!canvasRef.current) return;
      if (wrapperElement) {
        canvasRef.current.width = wrapperElement.clientWidth;
        canvasRef.current.height = wrapperElement.clientHeight;
      } else {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          addParticle(e.touches[i].clientX, e.touches[i].clientY);
        }
      }
    };

    const onMouseMove = (e) => {
      if (wrapperElement) {
        const boundingRect = wrapperElement.getBoundingClientRect();
        cursorRef.current.x = e.clientX - boundingRect.left;
        cursorRef.current.y = e.clientY - boundingRect.top;
      } else {
        cursorRef.current.x = e.clientX;
        cursorRef.current.y = e.clientY;
      }
      addParticle(cursorRef.current.x, cursorRef.current.y);
    };

    const addParticle = (x, y) => {
      particlesRef.current.push(new Particle(x, y));
    };

    const updateParticles = () => {
      if (!canvas || !context) return;
      if (particlesRef.current.length === 0) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing new frame
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update(context); // Update each particle
      }
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        if (particlesRef.current[i].lifeSpan < 0) {
          particlesRef.current.splice(i, 1); // Remove expired particles
        }
      }
      if (particlesRef.current.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas if no particles
      }
    };

    const loop = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(loop); // Request next animation frame
    };

    init(); // Initialize the cursor effect

    return () => {
      if (canvas) {
        canvas.remove();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Clean up animation frame
      }
      const element = wrapperElement || document.body;
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchstart', onTouchMove);
      window.removeEventListener('resize', onWindowResize);
    };
  }, [wrapperElement]);

  return <canvas ref={canvasRef} />;
};

export default BubbleCursor;

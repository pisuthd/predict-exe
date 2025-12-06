"use client"

import React, { useEffect, useRef } from 'react';

export const AnimatedLines = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const lines: {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
    }[] = [];

    // Create horizontal and vertical lines
    for (let i = 0; i < 15; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 200 + 100,
        speed: Math.random() * 2 + 0.5,
        angle: Math.random() > 0.5 ? 0 : Math.PI / 2, // Horizontal or vertical
        opacity: Math.random() * 0.3 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line) => {
        ctx.strokeStyle = `rgba(6, 182, 212, ${line.opacity})`; // cyan-500
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (line.angle === 0) {
          // Horizontal line
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + line.length, line.y);
        } else {
          // Vertical line
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
        }

        ctx.stroke();

        // Move lines
        if (line.angle === 0) {
          line.x += line.speed;
          if (line.x > canvas.width) {
            line.x = -line.length;
          }
        } else {
          line.y += line.speed;
          if (line.y > canvas.height) {
            line.y = -line.length;
          }
        }

        // Fade in and out
        line.opacity += (Math.random() - 0.5) * 0.01;
        line.opacity = Math.max(0.1, Math.min(0.4, line.opacity));
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

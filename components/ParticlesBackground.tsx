"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

interface ParticlesBackgroundProps {
  className?: string;
}

export default function ParticlesBackground({ className = "" }: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    const particlesCount = 400;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 10 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      const t = Math.random();
      colors[i] = 0.4 + t * 0.3;
      colors[i + 1] = 0.5 + t * 0.35;
      colors[i + 2] = 0.9 + t * 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0.4, 0.5, 0.9),
      transparent: true,
      opacity: 0.08,
    });
    const linePositions = new Float32Array(particlesCount * 3);
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    lineGeometry.setAttribute("position", linePosAttr);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const mouse = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationX = mouse.y * 0.1;
      targetRotationY = mouse.x * 0.1;
    };

    window.addEventListener("mousemove", handleMouse);

    const cameraZ = 18;
    let rotX = 0;
    let rotY = 0;

    const resize = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      camera.position.z = cameraZ;
    };

    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      rotX += (targetRotationX - rotX) * 0.02;
      rotY += (targetRotationY - rotY) * 0.02;

      particles.rotation.x = rotX + elapsed * 0.02;
      particles.rotation.y = rotY + elapsed * 0.015;

      const pos = particles.geometry.attributes.position.array as Float32Array;
      const lineArr = linePosAttr.array as Float32Array;

      for (let i = 0; i < particlesCount * 3; i += 3) {
        lineArr[i] = pos[i];
        lineArr[i + 1] = pos[i + 1];
        lineArr[i + 2] = pos[i + 2];
      }

      const distances: number[] = [];
      const threshold = 3.5;
      let lineCount = 0;

      for (let i = 0; i < particlesCount; i += 2) {
        const i3 = i * 3;
        const closest = { index: -1, dist: threshold };

        for (let j = i + 1; j < particlesCount; j++) {
          const j3 = j * 3;
          const dx = pos[i3] - pos[j3];
          const dy = pos[i3 + 1] - pos[j3 + 1];
          const dz = pos[i3 + 2] - pos[j3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < closest.dist) {
            closest.index = j;
            closest.dist = dist;
          }
        }

        if (closest.index !== -1) {
          distances.push(closest.dist);
          const j3 = closest.index * 3;
          const idx = lineCount * 6;
          lineArr[idx] = pos[i3];
          lineArr[idx + 1] = pos[i3 + 1];
          lineArr[idx + 2] = pos[i3 + 2];
          lineArr[idx + 3] = pos[j3];
          lineArr[idx + 4] = pos[j3 + 1];
          lineArr[idx + 5] = pos[j3 + 2];
          lineCount++;
        }
      }

      linePosAttr.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineCount * 2);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

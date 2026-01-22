import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'electricity' | 'glow';
}

interface Lightning {
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
  width: number;
}

interface ParticleExplosionProps {
  isActive: boolean;
  buttonRef: React.RefObject<HTMLElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  intensity?: number; // 0 to 1
}

export function ParticleExplosion({ isActive, buttonRef, containerRef, intensity = 0.5 }: ParticleExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lightningsRef = useRef<Lightning[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Scale intensity for effects
  const effectIntensity = Math.max(0.3, intensity);

  const colors = {
    spark: ['#00d4ff', '#00ffff', '#ffffff', '#4da6ff', '#80dfff'],
    electricity: ['#00d4ff', '#00ffff', '#ffffff', '#87CEEB'],
    glow: ['rgba(0, 212, 255, 0.3)', 'rgba(255, 100, 100, 0.3)', 'rgba(255, 255, 255, 0.2)']
  };

  // Add red colors as intensity increases
  const getSparkColors = useCallback(() => {
    if (intensity > 0.7) {
      return [...colors.spark, '#ff6b6b', '#ff4444', '#ff8800'];
    } else if (intensity > 0.4) {
      return [...colors.spark, '#ff6b6b'];
    }
    return colors.spark;
  }, [intensity]);

  const createSpark = useCallback((originX: number, originY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = 3 + Math.random() * 12;
    const speed = baseSpeed * (0.5 + effectIntensity);
    const sparkColors = getSparkColors();
    return {
      x: originX + (Math.random() - 0.5) * 40,
      y: originY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 3,
      life: 1,
      maxLife: 0.5 + Math.random() * (1 + effectIntensity),
      size: (1 + Math.random() * 3) * (0.8 + effectIntensity * 0.5),
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      type: 'spark'
    };
  }, [effectIntensity, getSparkColors]);

  const createElectricityParticle = useCallback((originX: number, originY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1 + Math.random() * 4) * (0.5 + effectIntensity);
    return {
      x: originX + (Math.random() - 0.5) * 60 * (1 + effectIntensity),
      y: originY + (Math.random() - 0.5) * 30 * (1 + effectIntensity),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.3 + Math.random() * 0.5,
      size: (2 + Math.random() * 4) * (0.8 + effectIntensity * 0.4),
      color: colors.electricity[Math.floor(Math.random() * colors.electricity.length)],
      type: 'electricity'
    };
  }, [effectIntensity]);

  const createGlow = useCallback((originX: number, originY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 2) * (0.5 + effectIntensity);
    return {
      x: originX + (Math.random() - 0.5) * 100 * (1 + effectIntensity),
      y: originY + (Math.random() - 0.5) * 50 * (1 + effectIntensity),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1 + Math.random() * 1.5,
      size: (20 + Math.random() * 40) * (0.8 + effectIntensity * 0.5),
      color: colors.glow[Math.floor(Math.random() * colors.glow.length)],
      type: 'glow'
    };
  }, [effectIntensity]);

  const createLightning = useCallback((startX: number, startY: number, endX: number, endY: number): Lightning => {
    const points: { x: number; y: number }[] = [];
    const segments = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const jitter = 60 * (0.5 + effectIntensity);
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * jitter * Math.sin(t * Math.PI);
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * jitter * Math.sin(t * Math.PI);
      points.push({ x, y });
    }

    return {
      points,
      life: 1,
      maxLife: 0.1 + Math.random() * 0.2,
      width: (1 + Math.random() * 3) * (0.7 + effectIntensity * 0.5)
    };
  }, [effectIntensity]);

  const drawLightning = useCallback((ctx: CanvasRenderingContext2D, lightning: Lightning) => {
    if (lightning.points.length < 2) return;

    const alpha = lightning.life;

    // Main bolt
    ctx.beginPath();
    ctx.moveTo(lightning.points[0].x, lightning.points[0].y);

    for (let i = 1; i < lightning.points.length; i++) {
      ctx.lineTo(lightning.points[i].x, lightning.points[i].y);
    }

    // Glow effect - intensity affects glow
    ctx.shadowColor = intensity > 0.6 ? '#ff6b6b' : '#00d4ff';
    ctx.shadowBlur = 20 * (0.8 + effectIntensity);
    ctx.strokeStyle = `rgba(${intensity > 0.6 ? '255, 107, 107' : '0, 212, 255'}, ${alpha})`;
    ctx.lineWidth = lightning.width * 3;
    ctx.stroke();

    // Core
    ctx.shadowBlur = 10;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = lightning.width;
    ctx.stroke();

    ctx.shadowBlur = 0;
  }, [effectIntensity, intensity]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life;

    if (particle.type === 'spark') {
      // Draw spark with trail
      ctx.beginPath();
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10 * (0.8 + effectIntensity);
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      if (!particle.color.startsWith('rgba')) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
      }
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.size * 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    } else if (particle.type === 'electricity') {
      ctx.beginPath();
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15 * (0.8 + effectIntensity);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (particle.type === 'glow') {
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      gradient.addColorStop(0, particle.color.replace('0.3', String(0.3 * alpha)));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(
        particle.x - particle.size,
        particle.y - particle.size,
        particle.size * 2,
        particle.size * 2
      );
    }
  }, [effectIntensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    const container = containerRef.current;
    if (!canvas || !button || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isActive) {
      // Clear everything instantly
      particlesRef.current = [];
      lightningsRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const getButtonCenter = () => {
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        x: buttonRect.left - containerRect.left + buttonRect.width / 2,
        y: buttonRect.top - containerRect.top + buttonRect.height / 2
      };
    };

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const buttonCenter = getButtonCenter();

      // Spawn rate increases with intensity
      const sparkRate = 0.4 + effectIntensity * 0.6;
      const electricityRate = 0.2 + effectIntensity * 0.5;
      const glowRate = 0.05 + effectIntensity * 0.1;
      const lightningRate = 0.1 + effectIntensity * 0.4;

      // Spawn new particles
      if (Math.random() < sparkRate) {
        particlesRef.current.push(createSpark(buttonCenter.x, buttonCenter.y));
      }
      if (Math.random() < electricityRate) {
        particlesRef.current.push(createElectricityParticle(buttonCenter.x, buttonCenter.y));
      }
      if (Math.random() < glowRate) {
        particlesRef.current.push(createGlow(buttonCenter.x, buttonCenter.y));
      }

      // Spawn lightning - distance increases with intensity
      if (Math.random() < lightningRate) {
        const angle = Math.random() * Math.PI * 2;
        const baseDistance = 150;
        const maxDistance = 300 + effectIntensity * 400; // Goes much further with intensity
        const distance = baseDistance + Math.random() * maxDistance;
        const endX = buttonCenter.x + Math.cos(angle) * distance;
        const endY = buttonCenter.y + Math.sin(angle) * distance;
        lightningsRef.current.push(createLightning(buttonCenter.x, buttonCenter.y, endX, endY));
      }

      // Update and draw glow particles first (behind everything)
      particlesRef.current
        .filter(p => p.type === 'glow')
        .forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= deltaTime / particle.maxLife;
          drawParticle(ctx, particle);
        });

      // Draw lightnings
      lightningsRef.current.forEach(lightning => {
        lightning.life -= deltaTime / lightning.maxLife;
        drawLightning(ctx, lightning);
      });

      // Update and draw sparks and electricity
      particlesRef.current
        .filter(p => p.type !== 'glow')
        .forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.1; // gravity for sparks
          particle.vx *= 0.99;
          particle.life -= deltaTime / particle.maxLife;
          drawParticle(ctx, particle);
        });

      // Remove dead particles and lightnings
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      lightningsRef.current = lightningsRef.current.filter(l => l.life > 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, buttonRef, containerRef, effectIntensity, createSpark, createElectricityParticle, createGlow, createLightning, drawParticle, drawLightning]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

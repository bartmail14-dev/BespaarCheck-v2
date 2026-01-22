import { useRef, useEffect } from 'react';

interface ElectricityOverlayProps {
  isActive: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  buttonRef: React.RefObject<HTMLElement | null>;
  intensity?: number; // 0 to 1
}

interface ArcPoint {
  x: number;
  y: number;
}

interface ElectricArc {
  points: ArcPoint[];
  life: number;
  color: string;
  width: number;
  glow: number;
}

export function ElectricityOverlay({ isActive, containerRef, buttonRef, intensity = 0.5 }: ElectricityOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcsRef = useRef<ElectricArc[]>([]);
  const animationRef = useRef<number | null>(null);

  // Scale intensity for effects
  const effectIntensity = Math.max(0.3, intensity);

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
    };
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const button = buttonRef.current;

    if (!canvas || !container || !button) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isActive) {
      arcsRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const getButtonBounds = () => {
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        x: buttonRect.left - containerRect.left,
        y: buttonRect.top - containerRect.top,
        width: buttonRect.width,
        height: buttonRect.height,
        centerX: buttonRect.left - containerRect.left + buttonRect.width / 2,
        centerY: buttonRect.top - containerRect.top + buttonRect.height / 2
      };
    };

    const generateArc = (startX: number, startY: number, endX: number, endY: number, segments: number = 12): ArcPoint[] => {
      const points: ArcPoint[] = [];
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Jitter increases with intensity
      const jitterMultiplier = 0.1 + effectIntensity * 0.15;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const offsetMagnitude = (dist * jitterMultiplier) * Math.sin(t * Math.PI);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const offset = (Math.random() - 0.5) * 2 * offsetMagnitude;

        points.push({
          x: startX + dx * t + perpX * offset + (Math.random() - 0.5) * (10 + effectIntensity * 20),
          y: startY + dy * t + perpY * offset + (Math.random() - 0.5) * (10 + effectIntensity * 20)
        });
      }
      return points;
    };

    const createArc = (): ElectricArc => {
      const bounds = getButtonBounds();

      // Colors shift from blue to red as intensity increases
      let colors: string[];
      if (intensity > 0.7) {
        colors = ['#ff6b6b', '#ff4444', '#ff8800', '#ffaa00', '#ffffff'];
      } else if (intensity > 0.4) {
        colors = ['#00d4ff', '#00ffff', '#4da6ff', '#ff6b6b', '#ffffff'];
      } else {
        colors = ['#00d4ff', '#00ffff', '#4da6ff', '#ffffff'];
      }

      // Random angle from button center
      const angle = Math.random() * Math.PI * 2;

      // Distance increases dramatically with intensity
      const baseDistance = 150;
      const maxExtraDistance = 200 + effectIntensity * 500; // Much bigger reach at high intensity
      const distance = baseDistance + Math.random() * maxExtraDistance;

      const startX = bounds.centerX + (Math.random() - 0.5) * bounds.width * 0.8;
      const startY = bounds.centerY + (Math.random() - 0.5) * bounds.height * 0.8;
      const endX = bounds.centerX + Math.cos(angle) * distance;
      const endY = bounds.centerY + Math.sin(angle) * distance;

      return {
        points: generateArc(startX, startY, endX, endY, 10 + Math.floor(Math.random() * 10)),
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: (1 + Math.random() * 2) * (0.8 + effectIntensity * 0.5),
        glow: (15 + Math.random() * 20) * (0.8 + effectIntensity * 0.5)
      };
    };

    const drawArc = (arc: ElectricArc) => {
      if (arc.points.length < 2) return;

      ctx.save();
      ctx.globalAlpha = arc.life;

      // Outer glow
      ctx.beginPath();
      ctx.moveTo(arc.points[0].x, arc.points[0].y);
      for (let i = 1; i < arc.points.length; i++) {
        ctx.lineTo(arc.points[i].x, arc.points[i].y);
      }
      ctx.shadowColor = arc.color;
      ctx.shadowBlur = arc.glow;
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = arc.width * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Inner core (white)
      ctx.beginPath();
      ctx.moveTo(arc.points[0].x, arc.points[0].y);
      for (let i = 1; i < arc.points.length; i++) {
        ctx.lineTo(arc.points[i].x, arc.points[i].y);
      }
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = arc.width;
      ctx.stroke();

      ctx.restore();
    };

    // Create branching arcs
    const createBranchingArc = (): ElectricArc[] => {
      const mainArc = createArc();
      const branches: ElectricArc[] = [mainArc];

      // More branches at higher intensity
      const branchCount = 1 + Math.floor(Math.random() * (2 + effectIntensity * 3));
      for (let i = 0; i < branchCount; i++) {
        if (mainArc.points.length < 3) continue;

        const branchIndex = Math.floor(Math.random() * (mainArc.points.length - 2)) + 1;
        const branchStart = mainArc.points[branchIndex];
        const angle = Math.random() * Math.PI * 2;

        // Branch distance also increases with intensity
        const distance = (50 + Math.random() * 150) * (0.8 + effectIntensity * 0.8);

        const branchEnd = {
          x: branchStart.x + Math.cos(angle) * distance,
          y: branchStart.y + Math.sin(angle) * distance
        };

        branches.push({
          points: generateArc(branchStart.x, branchStart.y, branchEnd.x, branchEnd.y, 5 + Math.floor(Math.random() * 5)),
          life: mainArc.life,
          color: mainArc.color,
          width: mainArc.width * 0.6,
          glow: mainArc.glow * 0.7
        });
      }

      return branches;
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn rate increases with intensity
      const spawnRate = 0.2 + effectIntensity * 0.5;
      if (Math.random() < spawnRate) {
        arcsRef.current.push(...createBranchingArc());
      }

      // Update and draw
      arcsRef.current.forEach(arc => {
        arc.life -= deltaTime * 3;

        // Jitter effect - intensity affects jitter amount
        const jitterAmount = 2 + effectIntensity * 4;
        arc.points.forEach(point => {
          point.x += (Math.random() - 0.5) * jitterAmount;
          point.y += (Math.random() - 0.5) * jitterAmount;
        });

        drawArc(arc);
      });

      // Remove dead arcs
      arcsRef.current = arcsRef.current.filter(arc => arc.life > 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, containerRef, buttonRef, effectIntensity, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const frameCount = 151;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    const imagePaths = [];
    for (let i = 1; i <= frameCount; i++) {
      if (i === 146) continue;
      const indexStr = i.toString().padStart(3, '0');
      imagePaths.push(`/home/frame_${indexStr}.png`);
    }

    imagePaths.forEach((path, i) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedImages[i] = img;
        if (i === 0) {
          drawFrame(img);
        }
      };
    });
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    const unsubscribe = frameIndex.on("change", (latest) => {
      const idx = Math.floor(latest);
      if (images[idx]) drawFrame(images[idx]);
    });
    return () => unsubscribe();
  }, [images, frameIndex]);

  const drawFrame = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const handleResize = () => {
      const idx = Math.floor(frameIndex.get());
      if (images[idx]) drawFrame(images[idx]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameIndex]);

  // Map scroll progress for scattered points
  const point1Opacity = useTransform(scrollYProgress, [0.05, 0.1, 0.15], [0, 1, 0]);
  const point2Opacity = useTransform(scrollYProgress, [0.1, 0.15, 0.2], [0, 1, 0]);
  const point3Opacity = useTransform(scrollYProgress, [0.15, 0.2, 0.25], [0, 1, 0]);
  const point4Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.3], [0, 1, 0]);
  const point5Opacity = useTransform(scrollYProgress, [0.25, 0.3, 0.35], [0, 1, 0]);
  const point6Opacity = useTransform(scrollYProgress, [0.3, 0.35, 0.4], [0, 1, 0]);

  // Timeline opacity map
  const timelineOpacity = useTransform(scrollYProgress, [0.45, 0.5, 0.95, 1], [0, 1, 1, 0]);
  const step1Op = useTransform(scrollYProgress, [0.5, 0.55], [0, 1]);
  const step2Op = useTransform(scrollYProgress, [0.55, 0.6], [0, 1]);
  const step3Op = useTransform(scrollYProgress, [0.6, 0.65], [0, 1]);
  const step4Op = useTransform(scrollYProgress, [0.65, 0.7], [0, 1]);
  const step5Op = useTransform(scrollYProgress, [0.7, 0.75], [0, 1]);
  const step6Op = useTransform(scrollYProgress, [0.75, 0.8], [0, 1]);

  return (
    <div className="bg-black text-white selection:bg-[#9CAF88] selection:text-white">
      <Head>
        <title>Seed2Shelf | Blockchain Supply Chain</title>
      </Head>

      {/* Top Section */}
      <section className="h-screen w-full bg-[#8A9A5B] flex flex-col justify-center items-center text-center p-8 relative z-20">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "'Bentham', serif" }}>Food With Proof.</h1>
        <p className="text-2xl md:text-4xl text-white/90 italic" style={{ fontFamily: "'Bentham', serif" }}>Because every harvest has a story..</p>
      </section>

      {/* Animation Container */}
      <div style={{ height: "600vh" }} className="relative z-10" ref={containerRef}>
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-fill z-0" />

          {/* Scattered Points */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <motion.div style={{ opacity: point1Opacity }} className="absolute top-[20%] left-[10%] md:left-[20%] text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">Built on Trust</motion.div>
            <motion.div style={{ opacity: point2Opacity }} className="absolute top-[40%] right-[10%] md:right-[20%] text-3xl md:text-5xl font-bold text-[#B2C29D] drop-shadow-2xl">Powered by Blockchain</motion.div>
            <motion.div style={{ opacity: point3Opacity }} className="absolute top-[60%] left-[15%] md:left-[25%] text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">100% Traceable</motion.div>
            <motion.div style={{ opacity: point4Opacity }} className="absolute top-[30%] right-[15%] md:right-[30%] text-3xl md:text-5xl font-bold text-[#B2C29D] drop-shadow-2xl">Verified at Every Step</motion.div>
            <motion.div style={{ opacity: point5Opacity }} className="absolute top-[70%] left-[30%] text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">Direct. Transparent. Secure.</motion.div>
            <motion.div style={{ opacity: point6Opacity }} className="absolute top-[50%] right-[25%] text-3xl md:text-5xl font-bold text-[#B2C29D] drop-shadow-2xl">No Middlemen. Just Trust.</motion.div>
          </div>

          {/* Timeline Glassmorphism */}
          <motion.div 
            style={{ opacity: timelineOpacity }} 
            className="absolute inset-0 z-20 flex flex-col justify-center items-center pointer-events-none p-4"
          >
            <div className="glass-dark border border-white/20 p-8 md:p-12 rounded-3xl max-w-2xl w-full relative">
              <div className="absolute left-10 md:left-14 top-12 bottom-12 w-0.5 bg-[#8A9A5B]/50"></div>
              
              <div className="space-y-8 relative">
                <motion.div style={{ opacity: step1Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Grow</h3>
                    <p className="text-white/70">Seeds are planted and crops are cultivated.</p>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: step2Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Harvest</h3>
                    <p className="text-white/70">Fresh produce is collected and verified.</p>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: step3Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Process</h3>
                    <p className="text-white/70">Cleaned, graded, and packaged.</p>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: step4Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Distribute</h3>
                    <p className="text-white/70">Securely transported across the network.</p>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: step5Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Retail</h3>
                    <p className="text-white/70">Delivered to stores with complete traceability.</p>
                  </div>
                </motion.div>

                <motion.div style={{ opacity: step6Op }} className="flex items-start gap-6">
                  <div className="w-4 h-4 rounded-full bg-[#9CAF88] mt-1.5 shadow-[0_0_10px_#9CAF88] relative z-10 shrink-0"></div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Enjoy</h3>
                    <p className="text-white/70">Consumers scan and verify the journey.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <footer className="bg-black text-white text-center py-16 border-t border-white/10 relative z-20">
        <p className="text-xl md:text-2xl mb-4 italic font-light text-[#B2C29D]">Every harvest tells a story. We make it visible.</p>
        <p className="text-sm text-white/40 tracking-widest">SEED2SHELF | 2026</p>
      </footer>

      {/* Global Scroll Indicator */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-80 z-50 pointer-events-none">
        <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-2 h-2 bg-white rounded-full"
          />
        </div>
        <span className="text-sm font-medium tracking-widest uppercase text-white" style={{ fontFamily: "'Bentham', serif" }}>Scroll</span>
      </div>
    </div>
  )
}

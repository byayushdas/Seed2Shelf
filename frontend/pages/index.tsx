import Head from 'next/head'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const yOffset = useTransform(scrollYProgress, [0.3, 0.4], [50, 0]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-black text-white selection:bg-green-500 selection:text-white">
      <Head>
        <title>Seed2Shelf | Blockchain Supply Chain</title>
      </Head>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Video */}
       <video 
  autoPlay 
  loop 
  muted 
  playsInline
  poster="https://images.pexels.com/photos/158179/lake-constance-sheep-pasture-sheep-blue-158179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-60"
>
  <source src="https://cdn.coverr.co/videos/preview/720p/coverr-drone-shot-of-a-field-of-wheat-5231.mp4" type="video/mp4" />
</video>
        
        {/* Glassmorphism Panel overlay */}
        <div className="relative z-10 glass-dark p-12 md:p-20 rounded-3xl text-center max-w-3xl transform hover:scale-[1.01] transition-transform duration-500">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-yellow-400">
              From Seed to Shelf
            </h1>
            <p className="text-xl md:text-2xl font-light text-stone-200 mb-10">
              A Blockchain-Based Agricultural Supply Chain Platform
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium transition shadow-lg shadow-green-900/20">
                Sign Up
              </Link>
              <Link href="/login" className="px-8 py-3 glass hover:bg-white/20 text-white rounded-full font-medium transition">
                Login
              </Link>
              <button onClick={() => alert("Please use the top-right button to connect metamask")} className="px-8 py-3 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-full font-medium transition">
                Connect Wallet
              </button>
              <Link href="/customer/marketplace" className="px-8 py-3 bg-stone-100 text-stone-900 hover:bg-white rounded-full font-medium transition shadow-xl mt-4 md:mt-0 lg:ml-4 w-full md:w-auto">
                Explore Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vertical Animated Timeline Section */}
      <section className="py-32 bg-stone-950 relative overflow-hidden">
        {/* Background Image for Timeline */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.pexels.com/photos/158179/lake-constance-sheep-pasture-sheep-blue-158179.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500/50 via-yellow-500/50 to-transparent -translate-x-1/2"></div>
          
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-20 text-white">
            The Traceable Journey
          </h2>

          <div className="space-y-24">
            {[
              { role: "Farmer", icon: "🌱", desc: "Logs harvest details, quality specs, and GPS origin on-chain." },
              { role: "Processor", icon: "🏭", desc: "Inspects quality, processes goods, and adds value on-chain." },
              { role: "Distributor", icon: "🚚", desc: "Manages logistics and temperature-controlled tracking." },
              { role: "Retailer", icon: "🏪", desc: "Receives final product and lists it on the consumer marketplace." },
              { role: "Customer", icon: "🛍️", desc: "Scans QR code or explores UI to verify the full journey securely." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`relative flex items-center justify-between md:justify-normal gap-8 w-full ${idx % 2 === 0 ? "md:flex-row-reverse left-timeline" : "right-timeline"}`}
              >
                <div className="order-1 md:w-5/12"></div>
                
                <div className="z-20 flex items-center order-1 matte-glass w-16 h-16 rounded-full shadow-xl border-2 border-green-500 absolute left-0 md:left-1/2 -translate-x-4 md:-translate-x-1/2 justify-center text-2xl">
                  {step.icon}
                </div>
                
                <div className="order-1 matte-glass rounded-2xl shadow-xl w-full md:w-5/12 px-6 py-6 border border-white/5 ml-12 md:ml-0 hover:border-green-500/30 transition-colors">
                  <h3 className="mb-3 font-bold text-green-400 text-xl">{step.role}</h3>
                  <p className="text-sm leading-snug text-stone-300 font-light text-opacity-100">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section w/ Video 2 */}
      {mounted && (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src="https://images.pexels.com/photos/1031700/pexels-photo-1031700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-50"
          >
            <source src="https://cdn.coverr.co/videos/preview/720p/coverr-farm-landscape-with-a-red-barn-5230.mp4" type="video/mp4" />
          </video>
          
          <motion.div 
            style={{ opacity, y: yOffset }}
            className="relative z-10 matte-glass p-10 md:p-16 rounded-2xl text-center max-w-4xl mx-4"
          >
            <h2 className="text-2xl md:text-5xl font-light leading-relaxed text-stone-100">
              "Our mission is to bring <span className="text-green-400 font-medium">transparency, trust, and traceability</span> into agricultural supply chains using blockchain technology."
            </h2>
          </motion.div>
        </section>
      )}

    </div>
  )
}

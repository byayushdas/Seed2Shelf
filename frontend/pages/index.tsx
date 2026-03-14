import Head from "next/head";
import Link from 'next/link';
import { Leaf, Activity, ShieldCheck, Store, Wallet, Play, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef } from 'react';

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <div className="bg-agri-green-50 overflow-hidden font-sans text-gray-900 scroll-smooth">
      <Head>
        <title>Seed2Shelf | Transparent Agricultural Marketplace</title>
      </Head>

      {/* 1. Hero Section */}
      <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-agri-green-900/60 via-agri-green-900/40 to-agri-green-50 z-10" />
          <img 
            src="/images/hero_bg_1773483921678.png" 
            alt="Lush green agricultural fields at sunrise" 
            className="w-full h-[120%] object-cover object-center"
          />
        </motion.div>

        <motion.div 
          className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-agri-green-100/50 bg-agri-green-900/30 backdrop-blur-sm text-agri-green-50 text-sm font-medium tracking-widest uppercase">
            A New Era of Fair Trade
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
            Transparent Agricultural <br/><span className="text-agri-green-100">Marketplace</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-agri-green-50 mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg">
            Seed2Shelf connects farmers directly to consumers through immutable blockchain technology, ensuring 100% pricing transparency and eliminating middlemen scams.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-agri-green-800 hover:bg-agri-green-900 text-white px-8 py-4 rounded-xl font-bold tracking-wide text-lg transition-all hover:scale-105 shadow-xl hover:shadow-agri-green-900/30">
              <Wallet className="w-6 h-6" />
              Connect Wallet
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-medium tracking-wide text-lg transition-all hover:scale-105">
              <Play className="w-6 h-6" />
              See How It Works
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* 2. How it Works Section */}
      <section id="how-it-works" className="py-32 px-4 relative bg-agri-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-agri-green-900 mb-4"
            >
              How It Works
            </motion.h2>
            <p className="text-xl text-agri-green-800/80 max-w-2xl mx-auto">The step-by-step journey of your food, cryptographically secured at every handoff.</p>
          </div>

          <div className="space-y-32">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                variants={slideInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-agri-green-900/10 border-4 border-white aspect-[4/3] bg-agri-green-100">
                  <img src="/images/farmer_step_1773483939317.png" alt="Farmer" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              <motion.div 
                variants={slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2"
              >
                <div className="w-16 h-16 bg-agri-green-800 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-agri-green-800/20">1</div>
                <h3 className="text-3xl font-bold text-agri-green-900 mb-4">Origin Logging</h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Farmers harvest their crops and immediately log the batch onto the Seed2Shelf blockchain. The system records the GPS coordinates, weight, and the original "Farm-Gate" price they requested.
                </p>
                <ul className="space-y-3">
                  {['Immutable GPS Tagging', 'Initial Price Locking', 'Smart Contract Escrow Generation'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-agri-green-800 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-agri-green-DEFAULT" /> {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                variants={slideInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2 text-right md:text-left"
              >
                <div className="w-16 h-16 bg-agri-green-800 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-agri-green-800/20 md:ml-0 ml-auto">2</div>
                <h3 className="text-3xl font-bold text-agri-green-900 mb-4">Quality Processing</h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  The raw materials arrive at the processing facility. Graders verify the weight against the blockchain record and certify the quality standard.
                </p>
                <ul className="space-y-3 inline-block text-left">
                  {['Weight Verification Logging', 'Organic Standard Certification', 'Price markup transparency'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-agri-green-800 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-agri-green-DEFAULT" /> {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                variants={slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-agri-green-900/10 border-4 border-white aspect-[4/3] bg-agri-green-100">
                  <img src="/images/factory_step_1773483957027.png" alt="Processor Facility" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
            
            {/* Consumer Step */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                variants={slideInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-agri-green-900/10 border-4 border-white aspect-[4/3] bg-agri-green-100">
                  <img src="/images/consumer_step_1773484014202.png" alt="Consumer Scanning QR" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              <motion.div 
                variants={slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="w-full md:w-1/2"
              >
                <div className="w-16 h-16 bg-agri-green-800 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-agri-green-800/20">3</div>
                <h3 className="text-3xl font-bold text-agri-green-900 mb-4">Consumer Verification</h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Shoppers scan the product QR code in the supermarket. They instantly see the exact farm it came from, how much the farmer was originally paid, and who handled it along the way.
                </p>
                <Link href="/trace/1" className="inline-flex items-center gap-2 text-agri-green-DEFAULT font-bold hover:text-agri-green-800 transition-colors">
                  Try a Demo Scan <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Flow Chain Diagram */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-agri-green-900 mb-4">The Transparent Chain</h2>
            <p className="text-xl text-gray-500">Total visibility from the soil to your plate.</p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto">
            {/* The connective line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-agri-green-100 via-agri-green-DEFAULT to-agri-green-800 origin-left z-0"
            />

            {[
              { id: 1, title: "Farmer", icon: Leaf, tooltip: "Plants & Logs Batch" },
              { id: 2, title: "Factory", icon: Activity, tooltip: "Processes & Grades" },
              { id: 3, title: "Distributor", icon: ShieldCheck, tooltip: "Transports" },
              { id: 4, title: "Market", icon: Store, tooltip: "Shelves & Prices" },
              { id: 5, title: "Consumer", icon: Wallet, tooltip: "Scans & Verifies" }
            ].map((node, index) => (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="group relative z-10 flex flex-col items-center mb-10 md:mb-0 cursor-pointer"
              >
                <div className="w-32 h-32 rounded-3xl bg-white border-4 border-agri-green-50 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-4 group-hover:border-agri-green-DEFAULT group-hover:shadow-agri-green-DEFAULT/20">
                  <node.icon className="w-12 h-12 text-agri-green-800 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h4 className="mt-4 font-bold text-xl text-gray-800">{node.title}</h4>
                
                {/* Hover Tooltip */}
                <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-agri-green-900 text-white text-sm font-medium py-2 px-4 rounded-lg pointer-events-none whitespace-nowrap">
                  {node.tooltip}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-agri-green-900" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Product Prices */}
      <section className="py-32 bg-agri-green-900 text-agri-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Live Market Pricing</h2>
            <p className="text-xl text-agri-green-100/80">Monitor current agricultural valuation directly from the blockchain orderbook.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { id: 'MK-01', name: 'Organic Toor Dal', origin: 'Maharashtra, IN', price: '₹120 / kg', trend: '+2.4%' },
              { id: 'BR-44', name: 'Basmati Rice', origin: 'Punjab, IN', price: '₹95 / kg', trend: '-1.1%' },
              { id: 'WT-92', name: 'Durum Wheat', origin: 'Haryana, IN', price: '₹45 / kg', trend: 'Stable' },
              { id: 'ON-22', name: 'Red Onions', origin: 'Nashik, IN', price: '₹60 / kg', trend: '+15.0%' },
              { id: 'TM-08', name: 'Roma Tomatoes', origin: 'Karnataka, IN', price: '₹30 / kg', trend: '-5.2%' },
              { id: 'SO-11', name: 'Soybeans', origin: 'MP, IN', price: '₹55 / kg', trend: '+0.5%' },
            ].map((product) => (
              <motion.div 
                key={product.id}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-agri-gold-DEFAULT transition-colors">{product.name}</h3>
                    <p className="text-agri-green-100 font-mono text-sm">{product.origin}</p>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/20">{product.id}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-4xl font-black text-white">{product.price}</div>
                  <div className={`text-sm font-bold ${product.trend.startsWith('+') ? 'text-green-400' : product.trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>{product.trend}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-32 bg-agri-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-agri-green-900 mb-4">Trusted by the Ecosystem</h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-8 overflow-x-auto pb-12 snap-x hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { role: "Farmer", text: "Before Seed2Shelf, middlemen ate 40% of my profits. Now the smart contract escrows my payment instantly. Absolute game changer.", author: "Rajesh K." },
              { role: "Consumer", text: "Scanning the QR code and seeing the exact farm in Nashik where my grapes came from gives me incredible peace of mind.", author: "Priya S." },
              { role: "Retailer", text: "Our customers love the transparency. They are willing to pay a slight premium knowing the farmers are treated fairly.", author: "FreshMart Org." },
              { role: "Distributor", text: "The immutable logs protect us from liability. If produce spoils before we take custody, the blockchain proves it wasn't us.", author: "ExpressLogistics" }
            ].map((review, i) => (
              <div key={i} className="min-w-[350px] md:min-w-[450px] bg-white p-10 rounded-3xl shadow-lg border border-gray-100 snap-center">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-agri-gold-DEFAULT text-agri-gold-DEFAULT" />)}
                </div>
                <p className="text-xl text-gray-700 italic mb-8 leading-relaxed">"{review.text}"</p>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-agri-green-900">{review.author}</span>
                  <span className="text-agri-green-DEFAULT bg-agri-green-50 px-3 py-1 rounded-full">{review.role}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-agri-green-900 text-agri-green-50 border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-agri-gold-DEFAULT" />
              <span className="text-3xl font-black text-white tracking-tight">Seed2Shelf</span>
            </div>
            <p className="text-agri-green-100/60 max-w-sm mb-8 leading-relaxed">
              Empowering farmers and enlightening consumers through cryptographically secure supply chain transparency.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4 text-agri-green-100/80">
              <li><Link href="/login" className="hover:text-white transition-colors">Stakeholder Login</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Register Farm</Link></li>
              <li><Link href="/trace/1" className="hover:text-white transition-colors">Trace Scanner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal & Connect</h4>
            <ul className="space-y-4 text-agri-green-100/80">
              <li><a href="#" className="hover:text-white transition-colors">Smart Contract Audit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-agri-green-100/40">
          <p>© 2026 Seed2Shelf Decentralized Network. All rights reserved.</p>
          <div className="mt-4 md:mt-0 px-4 py-2 border border-white/10 rounded-full bg-white/5">
            Running on Sepolia Testnet
          </div>
        </div>
      </footer>

      {/* Inject custom utilities for scrollbar hiding */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}

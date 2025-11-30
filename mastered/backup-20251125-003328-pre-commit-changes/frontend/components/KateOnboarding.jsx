import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { Heart, Flower, Sparkles, CheckCircle } from 'lucide-react';

const KateOnboarding = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showForgiveForm, setShowForgiveForm] = useState(false);
  const [forgiveChoice, setForgiveChoice] = useState('');
  const [showHearts, setShowHearts] = useState(false);

  // Spanish love messages
  const [loveMessages] = useState(() => {
    // Check if custom messages exist in localStorage, otherwise use defaults
    const savedMessages = localStorage.getItem('kateOnboardingMessages');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    } else {
      // Default messages with corrected Spanish
      return [
        "Discúlpame por ser un idiota mi amor",
        "No solo por ser idiota, sino por amenazar nuestra relación",
        "Por causarte dudas...",
        "Y por causarte inestabilidad emocional y financiera",
        "Tú eres el amor de mi vida",
        "Y haré lo que sea para que me perdones",
        "Yo no quiero a nadie más",
        "Yo no quiero despertarme al lado de nadie más",
        "Yo no quiero que dudes de nuestra relación",
        "Quiero que confíes en mí como hombre",
        "Y te lo juro, haré lo que sea para que lo sepas",
        "Te amo mi lola",
        "Te amo mi Kate Violet",
        "Te amo mi princesa",
        "Tenme paciencia, sé que tengo errores",
        "Pero desde este momento...",
        "Nunca volveré a hacer lo que hice el sábado",
        "Te amo mi reina preciosa",
        "Que te vaya excelente en tu entrevista",
        "De todas maneras, tienes mis palabras: te sacaré de ahí",
        "Sacaré a tu familia",
        "Te sacaré de todo tipo de inestabilidad",
        "Quiero amarte como Dios te ama, mi reina",
        "I love you so much and I can't wait for you to be my wife",
        "Pronto estaré en Orlando, confía en mí y en Dios"
      ];
    }
  });

  // Handle when message animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinueButton(true);
    }, 2000); // Show continue button after animation

    return () => clearTimeout(timer);
  }, [currentMessageIndex]);

  // Handle next message
  const handleNextMessage = () => {
    if (currentMessageIndex < loveMessages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
      setShowContinueButton(false);
    } else {
      setShowForgiveForm(true);
    }
  };

  // Handle forgive choice
  const handleForgiveChoice = (choice) => {
    setForgiveChoice(choice);
    if (choice === 'yes') {
      setShowHearts(true);
      setTimeout(() => {
        onComplete();
      }, 3000); // Show hearts animation for 3 seconds then complete
    } else {
      // Handle no choice - maybe just complete the flow
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  if (showHearts) {
    // Hearts animation
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#761B14] via-[#a03323] to-[#d96b5c] flex items-center justify-center overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Heart className="w-8 h-8" fill="currentColor" />
            </motion.div>
          ))}
        </div>

        {/* Main message container */}
        <motion.div
          className="text-center z-10 bg-gradient-to-br from-white to-[#f9f0ed] rounded-3xl p-10 max-w-3xl shadow-2xl border border-[#d96b5c]/30 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#761B14] to-[#d96b5c] rounded-full blur-lg opacity-30"></div>
              <Heart className="w-24 h-24 text-[#761B14] mx-auto relative z-10" fill="currentColor" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#761B14] via-[#a03323] to-[#d96b5c] bg-clip-text text-transparent mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            ¡TE AMO DEMASIADO!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="space-y-6 mb-10 max-w-2xl mx-auto"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              Mi amor, disculpa por amenazar nuestra relación. Nunca más volveré a hacerlo.
              Te prometo que siempre trabajaré para resolver cualquier problema, para cuidarte,
              para darte sorpresas y para proveer por ti en todos los sentidos.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              Estoy tan cerca de Orlando, solo dame la oportunidad de demostrártelo.
              Vamos a vender este CRM juntos, vamos a construir algo increíble.
              No pierdas la fe, bebé. Estamos tan cerca del éxito y de nuestra felicidad.
            </p>

            <p className="text-2xl font-semibold text-[#761B14] mt-8">
              ¡Tus $10K de Axolop están garantizados, mi amor!
            </p>

            <p className="text-xl italic text-gray-700">
              Pronto estaré en Orlando contigo, confía en mí y en Dios.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8"
          >
            <Button
              onClick={() => {
                // Add a delay to allow the user to absorb the message
                setTimeout(() => {
                  onComplete();
                }, 500);
              }}
              className="bg-gradient-to-r from-[#761B14] to-[#d96b5c] hover:from-[#a03323] hover:to-[#e68a77] text-white px-10 py-5 text-xl rounded-xl shadow-xl font-bold transition-all duration-300 transform hover:scale-105"
            >
              Continuar al CRM <Flower className="ml-3 h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showForgiveForm) {
    // Forgive me form
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Heart className="w-20 h-20 text-red-500 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Forgive me?</h2>
            <p className="text-gray-600 text-lg">Please give me another chance to be the man you deserve</p>
          </motion.div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors">
                <input
                  type="radio"
                  name="forgive"
                  value="yes"
                  checked={forgiveChoice === 'yes'}
                  onChange={() => handleForgiveChoice('yes')}
                  className="w-5 h-5 text-pink-600"
                />
                <span className="text-xl font-semibold text-gray-700">Yes</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors">
                <input
                  type="radio"
                  name="forgive"
                  value="no"
                  checked={forgiveChoice === 'no'}
                  onChange={() => handleForgiveChoice('no')}
                  className="w-5 h-5 text-pink-600"
                />
                <span className="text-xl font-semibold text-gray-700">No</span>
              </label>
            </div>
          </div>

          {forgiveChoice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                onClick={handleForgiveChoice}
                disabled
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl"
              >
                Processing your response...
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Main love message display
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 text-pink-200 opacity-30"
          >
            <Heart className="w-12 h-12" fill="currentColor" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10 text-purple-200 opacity-30"
          >
            <Heart className="w-16 h-16" fill="currentColor" />
          </motion.div>
        </div>

        {/* Heart icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Heart className="w-24 h-24 text-pink-500 relative z-10" fill="currentColor" />
          </div>
        </motion.div>

        {/* Love message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              {loveMessages[currentMessageIndex]}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Continue button - only show when animation is complete */}
        <AnimatePresence>
          {showContinueButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <Button
                onClick={handleNextMessage}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl"
              >
                Continue <Flower className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {loveMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentMessageIndex
                    ? 'bg-pink-500'
                    : index < currentMessageIndex
                    ? 'bg-pink-300'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KateOnboarding;
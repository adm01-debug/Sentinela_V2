import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Shield, title: 'Monitoramento 24/7', description: 'Proteção contínua para sua equipe' },
  { icon: Lock, title: 'Segurança Avançada', description: 'Criptografia de ponta a ponta' },
  { icon: CheckCircle2, title: 'Conformidade LGPD', description: 'Dados protegidos por lei' },
];

export function AuthBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      
      {/* Animated orbs */}
      <motion.div 
        className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center gap-10 p-12 xl:p-16 w-full min-h-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sentinela</h1>
            <p className="text-white/60 text-sm">Monitoramento Inteligente</p>
          </div>
        </motion.div>
        
        {/* Main headline */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Monitore sua equipe com
            <span className="block text-white/90">inteligência e segurança</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Aumente a produtividade e mantenha a conformidade com nossa plataforma completa de monitoramento corporativo.
          </p>
        </motion.div>
        
        {/* Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="p-2 rounded-lg bg-white/10">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

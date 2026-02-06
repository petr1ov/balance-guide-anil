import { Sparkles, Heart } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="relative py-12 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white/80">Balance Guide</span>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>Создано с</span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>для тех, кто хочет расти</span>
          </div>

          {/* Copyright */}
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Balance Guide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

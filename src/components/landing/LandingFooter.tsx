import { Sparkles, MessageCircle, FileText } from "lucide-react";

const documents = [
  { label: "Договор публичной оферты", url: "https://cloud.mail.ru/public/WuxT/VEuhEiRM7" },
  { label: "Согласие на обработку персональных данных", url: "https://cloud.mail.ru/public/n9PR/h4eADBQoi" },
  { label: "Политика в отношении обработки персональных данных", url: "https://cloud.mail.ru/public/Mny1/xqg7SXe26" },
  { label: "Согласие на получение информационной и рекламной рассылки", url: "https://cloud.mail.ru/public/an1n/w3Xewwu9s" },
];

const LandingFooter = () => {
  return (
    <footer className="relative py-16 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top row: Logo + Support */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white/80">Balance Guide</span>
          </div>

          <div className="flex items-center gap-2 text-white/60 text-sm">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span>Служба заботы:</span>
            <a
              href="https://t.me/Wheelofbalance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              @Wheelofbalance
            </a>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Документы
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {documents.map((doc, i) => (
              <a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                {doc.label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal entity info */}
        <div className="border-t border-white/5 pt-8 space-y-4">
          <div className="text-white/30 text-xs leading-relaxed">
            <p>ИП Андреева Ирина Владимировна</p>
            <p>ИНН: 543320389775 &nbsp;·&nbsp; ОГРНИП: 325547600133072</p>
          </div>

          <p className="text-white/20 text-[11px] leading-relaxed max-w-2xl">
            Услуга является цифровой и предоставляется в момент получения доступа к Telegram-боту.
            После предоставления доступа услуга считается оказанной в полном объёме.
            Возврат денежных средств возможен до момента предоставления доступа.
          </p>

          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Balance Guide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

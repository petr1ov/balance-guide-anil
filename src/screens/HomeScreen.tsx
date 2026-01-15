import MentorHeader, { MentorAvatar } from "@/components/MentorHeader";
import BalanceWheel from "@/components/BalanceWheel";
import FloatingActionButton from "@/components/FloatingActionButton";
import { BalanceScores } from "@/types/balance";
import { t, Language } from "@/lib/i18n";

interface HomeScreenProps {
  scores: BalanceScores;
  language: Language;
  onUpdateScores: () => void;
  onSectorClick: (sector: keyof BalanceScores) => void;
}

const HomeScreen = ({ scores, language, onUpdateScores, onSectorClick }: HomeScreenProps) => {
  const hasScores = Object.values(scores).some((score) => score > 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      <MentorHeader />
      
      <div className="flex flex-col items-center px-6 pt-4">
        <MentorAvatar />
        
        <div className="mt-8 w-full flex justify-center animate-fade-in-up">
          {hasScores ? (
            <BalanceWheel scores={scores} onSectorClick={onSectorClick} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-spirituality-light via-relationships-light to-health-light opacity-30 animate-pulse" />
              <div className="mt-6 text-center">
                <p className="text-lg font-display font-semibold text-foreground">
                  {t("home.startAssessment", language)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("home.tapToStart", language)}
                </p>
              </div>
            </div>
          )}
        </div>

        {hasScores && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              {t("home.tapSectorDetails", language)}
            </p>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={onUpdateScores} />
    </div>
  );
};

export default HomeScreen;

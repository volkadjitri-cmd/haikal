import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, Timer, Trophy, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChallengeState = "intro" | "countdown" | "ready" | "waiting" | "success" | "failed" | "complete";

export default function Challenge() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<ChallengeState>("intro");
  const [countdown, setCountdown] = useState(3);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const studentName = sessionStorage.getItem("studentName");

  useEffect(() => {
    if (!studentName) {
      setLocation("/home");
    }
  }, [studentName, setLocation]);

  const startChallenge = useCallback(() => {
    setState("countdown");
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (state === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (state === "countdown" && countdown === 0) {
      const randomDelay = Math.floor(Math.random() * 3000) + 1500;
      setState("waiting");
      const timer = setTimeout(() => {
        setState("ready");
        setStartTime(Date.now());
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [state, countdown]);

  const handleClick = () => {
    if (state === "waiting") {
      setState("failed");
      setAttempts(attempts + 1);
    } else if (state === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
      setState("success");
      setAttempts(attempts + 1);
    }
  };

  const getReactionRating = (time: number): { label: string; color: string; icon: React.ReactNode } => {
    if (time < 200) return { label: "LUAR BIASA!", color: "text-yellow-500", icon: <Trophy className="w-8 h-8" /> };
    if (time < 300) return { label: "Sangat Cepat!", color: "text-green-500", icon: <Zap className="w-8 h-8" /> };
    if (time < 400) return { label: "Cepat!", color: "text-blue-500", icon: <Target className="w-8 h-8" /> };
    if (time < 500) return { label: "Bagus!", color: "text-purple-500", icon: <Timer className="w-8 h-8" /> };
    return { label: "Bisa Lebih Cepat!", color: "text-orange-500", icon: <Timer className="w-8 h-8" /> };
  };

  const handleContinue = () => {
    setLocation("/quiz");
  };

  const handleRetry = () => {
    setState("intro");
    setReactionTime(0);
  };

  if (!studentName) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {state === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Tantangan Refleks!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-center text-muted-foreground">
                    Sebelum memulai kuis, uji kecepatan refleksmu!
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Cara bermain:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Tunggu layar berubah menjadi hijau</li>
                      <li>Tekan tombol secepat mungkin</li>
                      <li>Jangan tekan sebelum layar hijau!</li>
                    </ol>
                  </div>
                  <Button onClick={startChallenge} className="w-full" size="lg">
                    <Target className="w-4 h-4 mr-2" />
                    Mulai Tantangan
                  </Button>
                  <Button variant="ghost" onClick={handleContinue} className="w-full">
                    Lewati Tantangan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <Card className="border-2 border-primary">
                <CardContent className="py-16">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-bold text-primary"
                  >
                    {countdown}
                  </motion.div>
                  <p className="mt-4 text-muted-foreground">Bersiap-siap...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card 
                className="border-4 border-red-500 bg-red-500/10 cursor-pointer"
                onClick={handleClick}
              >
                <CardContent className="py-24 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <p className="text-3xl font-bold text-red-500">TUNGGU...</p>
                    <p className="mt-2 text-muted-foreground">Jangan tekan dulu!</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card 
                className="border-4 border-green-500 bg-green-500/20 cursor-pointer"
                onClick={handleClick}
              >
                <CardContent className="py-24 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                  >
                    <p className="text-4xl font-bold text-green-500">TEKAN!</p>
                    <p className="mt-2 text-green-600">Sekarang!</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-destructive">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="text-6xl">😅</div>
                  <p className="text-2xl font-bold text-destructive">Terlalu Cepat!</p>
                  <p className="text-muted-foreground">
                    Kamu menekan sebelum layar berubah hijau
                  </p>
                  <div className="pt-4 space-y-2">
                    <Button onClick={handleRetry} className="w-full">
                      Coba Lagi
                    </Button>
                    <Button variant="ghost" onClick={handleContinue} className="w-full">
                      Lanjut ke Kuis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-green-500">
                <CardContent className="py-8 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className={getReactionRating(reactionTime).color}
                  >
                    {getReactionRating(reactionTime).icon}
                  </motion.div>
                  <p className={`text-2xl font-bold ${getReactionRating(reactionTime).color}`}>
                    {getReactionRating(reactionTime).label}
                  </p>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Waktu Reaksi</p>
                    <p className="text-4xl font-bold text-primary">{reactionTime} ms</p>
                  </div>
                  {bestTime && attempts > 1 && (
                    <p className="text-sm text-muted-foreground">
                      Waktu terbaik: <span className="font-bold text-primary">{bestTime} ms</span>
                    </p>
                  )}
                  <div className="pt-4 space-y-2">
                    <Button onClick={handleContinue} className="w-full" size="lg">
                      <Rocket className="w-4 h-4 mr-2" />
                      Mulai Kuis Sekarang!
                    </Button>
                    <Button variant="outline" onClick={handleRetry} className="w-full">
                      Coba Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {(state === "intro" || state === "success" || state === "failed") && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4 text-sm text-muted-foreground"
          >
            Selamat datang, <span className="font-medium text-foreground">{studentName}</span>!
          </motion.p>
        )}
      </div>
    </div>
  );
}

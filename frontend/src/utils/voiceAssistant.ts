import { LanguageCode } from "../types";

export class VoiceAssistant {
  private static synth: SpeechSynthesis | null =
    typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null;

  public static speak(
    text: string,
    lang: LanguageCode = "en",
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      console.warn("SpeechSynthesis API not supported in this environment");
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const langTag = lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    utterance.lang = langTag;

    // Pick matching voice if available
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(lang) || v.lang.includes(langTag)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }
}

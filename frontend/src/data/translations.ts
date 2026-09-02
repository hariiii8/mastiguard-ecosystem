import { LanguageCode } from "../types";

export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  connectionLive: string;
  connectionOffline: string;
  navDashboard: string;
  navHerd: string;
  navAiStudio: string;
  navLiveSensors: string;
  navAlerts: string;
  navSmsEngine: string;
  triageAlert: string;
  triageAction: string;
  isolateAndSms: string;
  quarantined: string;
  notQuarantined: string;
  overallHealth: string;
  totalHeadcount: string;
  gradeACount: string;
  criticalAttention: string;
  milkYieldChart: string;
  morningMilking: string;
  eveningMilking: string;
  voiceBriefing: string;
  listeningVoice: string;
  searchPlaceholder: string;
  allCows: string;
  healthyFilter: string;
  watchlistFilter: string;
  riskFilter: string;
  quarantinedFilter: string;
  cardView: string;
  tableView: string;
  tagId: string;
  name: string;
  breed: string;
  temp: string;
  health: string;
  conductivity: string;
  yield: string;
  risk: string;
  actions: string;
  analyzeWithAi: string;
  analyzing: string;
  shapExplanation: string;
  clinicalRx: string;
  hardwareStatus: string;
  esp32Status: string;
  gsmStatus: string;
  smsDispatchHeader: string;
  smsRecipient: string;
  smsMessagePreview: string;
  sendSmsAlert: string;
  smsHistory: string;
  addCow: string;
  clinicalExam: string;
  farmerHelp: string;
  installApp: string;
  riskHigh: string;
  riskMedium: string;
  riskHealthy: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    appName: "MastiGuard AI",
    appSubtitle: "Aarogya Bovine Mastitis Sentinel",
    connectionLive: "IoT Sentinel Mesh Active",
    connectionOffline: "Telemetry Link Offline",
    navDashboard: "Command Center",
    navHerd: "Herd Roster",
    navAiStudio: "AI Diagnostic Studio",
    navLiveSensors: "Edge Telemetry",
    navAlerts: "Clinical Triage",
    navSmsEngine: "SMS Alert Engine",
    triageAlert: "CRITICAL BOVINE MASTITIS DETECTED",
    triageAction: "Immediate veterinary isolation required for infected quarters.",
    isolateAndSms: "Isolate & Dispatch Alert",
    quarantined: "Quarantined",
    notQuarantined: "In Milking Cycle",
    overallHealth: "Herd Health Index",
    totalHeadcount: "Total Cohort",
    gradeACount: "Grade-A Healthy",
    criticalAttention: "Critical Risk",
    milkYieldChart: "Continuous Barn Milk Production (L)",
    morningMilking: "Morning Session",
    eveningMilking: "Evening Session",
    voiceBriefing: "Voice Assistant Briefing",
    listeningVoice: "Synthesizing vocal diagnostic report...",
    searchPlaceholder: "Search Tag ID, Cow Name, Breed, Sector...",
    allCows: "All Cattle (54)",
    healthyFilter: "Healthy Grade-A",
    watchlistFilter: "Observation",
    riskFilter: "Mastitis Flag",
    quarantinedFilter: "Quarantined Pen",
    cardView: "Card Matrix",
    tableView: "Dense Grid Table",
    tagId: "Tag ID",
    name: "Cow Name",
    breed: "Breed",
    temp: "Body Temp",
    health: "Health Score",
    conductivity: "Conductivity",
    yield: "Daily Yield",
    risk: "Risk Tier",
    actions: "Actions",
    analyzeWithAi: "Run TreeSHAP Diagnostic",
    analyzing: "Executing Neural Inference & SHAP...",
    shapExplanation: "TreeSHAP Local Biometric Attribution",
    clinicalRx: "Veterinary Protocol & Action Plan",
    hardwareStatus: "Edge Hardware Grid Status",
    esp32Status: "ESP32 Flex Array: Active (40ms polling)",
    gsmStatus: "Quectel 4G GSM Gateway: Ready",
    smsDispatchHeader: "Instant Farmer Early-Warning Gateway",
    smsRecipient: "Recipient Mobile Number",
    smsMessagePreview: "Simulated Hardware AT Message Buffer",
    sendSmsAlert: "Transmit Immediate SMS",
    smsHistory: "SMS Transmission Logs",
    addCow: "Register Cow",
    clinicalExam: "CMT / SCC Log",
    farmerHelp: "Farmer Help & Vet Hotline",
    installApp: "Install Android WebAPK",
    riskHigh: "Mastitis Risk",
    riskMedium: "Watchlist",
    riskHealthy: "Healthy"
  },
  ta: {
    appName: "மாஸ்டிகார்ட் AI",
    appSubtitle: "ஆரோக்யா மடிநோய் முன்னெச்சரிக்கை தளம்",
    connectionLive: "IoT நேரலை இணைப்பு செயலில் உள்ளது",
    connectionOffline: "இணைப்பு துண்டிக்கப்பட்டது",
    navDashboard: "கட்டுப்பாட்டு மையம்",
    navHerd: "மாடுகள் பட்டியல்",
    navAiStudio: "AI பரிசோதனை மையம்",
    navLiveSensors: "சென்சார் கண்காணிப்பு",
    navAlerts: "அவசர எச்சரிக்கை",
    navSmsEngine: "SMS எச்சரிக்கை",
    triageAlert: "தீவிர மடிநோய் தொற்று கண்டறியப்பட்டது",
    triageAction: "பாதிக்கப்பட்ட மாட்டை உடனடியாக தனிமைப்படுத்தி சிகிச்சை அளிக்கவும்.",
    isolateAndSms: "தனிமைப்படுத்தி SMS அனுப்பு",
    quarantined: "தனிமைப்படுத்தப்பட்டது",
    notQuarantined: "வழக்கமான பால் கறவை",
    overallHealth: "மந்தையின் ஆரோக்கியக் குறியீடு",
    totalHeadcount: "மொத்த மாடுகள்",
    gradeACount: "முழு ஆரோக்கியம்",
    criticalAttention: "தீவிர ஆபத்து",
    milkYieldChart: "தினசரி பால் உற்பத்தி வரைபடம் (லிட்டர்)",
    morningMilking: "காலை கறவை",
    eveningMilking: "மாலை கறவை",
    voiceBriefing: "குரல் உதவியாளர் அறிக்கை",
    listeningVoice: "மருத்துவ அறிக்கை பேசப்படுகிறது...",
    searchPlaceholder: "குறிச்சொல், பெயர், இனம் மூலம் தேடுக...",
    allCows: "அனைத்து மாடுகள் (54)",
    healthyFilter: "ஆரோக்கியமானவை",
    watchlistFilter: "கண்காணிப்பில்",
    riskFilter: "மடிநோய் ஆபத்து",
    quarantinedFilter: "தனிமைப்படுத்தப்பட்டவை",
    cardView: "அட்டை பார்வை",
    tableView: "அட்டவணை பார்வை",
    tagId: "அடையாள எண்",
    name: "பெயர்",
    breed: "இனம்",
    temp: "உடல் வெப்பநிலை",
    health: "ஆரோக்கிய நிலை",
    conductivity: "மின்கடத்து திறன்",
    yield: "பால் அளவு",
    risk: "ஆபத்து நிலை",
    actions: "செயல்கள்",
    analyzeWithAi: "AI ஆய்வு செய்க (TreeSHAP)",
    analyzing: "AI ஆய்வு செய்கிறது...",
    shapExplanation: "காரணிகள் ஆய்வு (TreeSHAP)",
    clinicalRx: "கால்நடை மருத்துவர் பரிந்துரை",
    hardwareStatus: "வன்பொருள் நிலை",
    esp32Status: "ESP32 சென்சார் வலை: இயங்குகிறது",
    gsmStatus: "4G GSM இணைப்பு: தயார்",
    smsDispatchHeader: "விவசாயிக்கு உடனடி SMS எச்சரிக்கை",
    smsRecipient: "கைபேசி எண்",
    smsMessagePreview: "SMS முன்னோட்டம்",
    sendSmsAlert: "உடனே SMS அனுப்பு",
    smsHistory: "SMS அனுப்பிய வரலாறு",
    addCow: "புதிய மாடு சேர்க்க",
    clinicalExam: "CMT / SCC பதிவு",
    farmerHelp: "உதவி & அவசர எண்கள்",
    installApp: "செயலி பதிவிறக்கம் (PWA)",
    riskHigh: "மடிநோய் ஆபத்து",
    riskMedium: "கண்காணிப்பு",
    riskHealthy: "ஆரோக்கியம்"
  },
  hi: {
    appName: "मास्टीगार्ड AI",
    appSubtitle: "आरोग्य गोजातीय थनेला रोग संतरी प्रणाली",
    connectionLive: "IoT लाइव टेलीमेट्री सक्रिय",
    connectionOffline: "टेलीमेट्री डिस्कनेक्ट",
    navDashboard: "कमांड सेंटर",
    navHerd: "पशुधन सूची",
    navAiStudio: "AI निदान केंद्र",
    navLiveSensors: "सेंसर निगरानी",
    navAlerts: "आपातकालीन चेतावनी",
    navSmsEngine: "SMS चेतावनी इंजन",
    triageAlert: "गंभीर थनेला (मस्टाइटिस) संक्रमण का पता चला",
    triageAction: "संक्रमित गाय को तुरंत अलग बाड़े में करें और उपचार शुरू करें।",
    isolateAndSms: "अलग करें और SMS भेजें",
    quarantined: "पृथक (क्वारंटाइन)",
    notQuarantined: "सामान्य दुग्ध चक्र",
    overallHealth: "झुंड स्वास्थ्य सूचकांक",
    totalHeadcount: "कुल गायें",
    gradeACount: "पूर्णतः स्वस्थ",
    criticalAttention: "गंभीर खतरा",
    milkYieldChart: "दैनिक दुग्ध उत्पादन चार्ट (लीटर)",
    morningMilking: "सुबह का दुग्ध",
    eveningMilking: "शाम का दुग्ध",
    voiceBriefing: "वॉयस असिस्टेंट रिपोर्ट",
    listeningVoice: "स्वास्थ्य रिपोर्ट का उच्चारण किया जा रहा है...",
    searchPlaceholder: "टैग आईडी, नाम, नस्ल से खोजें...",
    allCows: "सभी गायें (54)",
    healthyFilter: "स्वस्थ ग्रेड-ए",
    watchlistFilter: "निगरानी में",
    riskFilter: "थनेला जोखिम",
    quarantinedFilter: "अलग बाड़े में",
    cardView: "कार्ड दृश्य",
    tableView: "तालिका दृश्य",
    tagId: "टैग आईडी",
    name: "नाम",
    breed: "नस्ल",
    temp: "तापमान",
    health: "स्वास्थ्य स्कोर",
    conductivity: "विद्युत चालकता",
    yield: "दैनिक दूध",
    risk: "जोखिम स्तर",
    actions: "कार्रवाई",
    analyzeWithAi: "AI द्वारा विश्लेषण करें (TreeSHAP)",
    analyzing: "AI मॉडल द्वारा विश्लेषण जारी...",
    shapExplanation: "जोखिम कारक प्रभाव (TreeSHAP XAI)",
    clinicalRx: "पशु चिकित्सक प्रोटोकॉल व सलाह",
    hardwareStatus: "हार्डवेयर ग्रिड स्थिति",
    esp32Status: "ESP32 सेंसर नेटवर्क: सक्रिय",
    gsmStatus: "4G GSM मॉडम: तैयार",
    smsDispatchHeader: "किसान तत्काल SMS चेतावनी",
    smsRecipient: "मोबाइल नंबर",
    smsMessagePreview: "SMS संदेश पूर्वावलोकन",
    sendSmsAlert: "तुरंत SMS भेजें",
    smsHistory: "SMS प्रेषण इतिहास",
    addCow: "नई गाय पंजीकृत करें",
    clinicalExam: "CMT / SCC रिकॉर्ड",
    farmerHelp: "किसान सहायता व आपातकालीन हेल्पलाइन",
    installApp: "ऐप इंस्टॉल करें (Android PWA)",
    riskHigh: "थनेला जोखिम",
    riskMedium: "निगरानी",
    riskHealthy: "स्वस्थ"
  }
};

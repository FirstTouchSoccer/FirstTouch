export type Language = 'en' | 'ru'

export const LANGUAGES: { value: Language; label: string; nativeLabel: string }[] = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'ru', label: 'Russian', nativeLabel: 'Русский' },
]

export interface Dictionary {
  common: {
    logIn: string
    signUp: string
    cancel: string
    save: string
    back: string
    loading: string
    tryAgain: string
    somethingWentWrong: string
    continueBtn: string
    close: string
  }
  nav: {
    home: string
    vault: string
    upload: string
    train: string
    profile: string
    uploadClipAria: string
  }
  landing: {
    navLogIn: string
    navSignUp: string
    eyebrow: string
    heroTitle1: string
    heroTitle2: string
    heroLede: string
    ctaCreateAccount: string
    ctaSeePlans: string
    metaFree: string
    metaFreeBold: string
    metaFounding: string
    metaFoundingBold: string
    metaFoundingAfter: string
    metaCancel: string
    step01Tag: string
    step01Eyebrow: string
    step01Title: string
    step01Body: string
    step01ReadNum: string
    step01ReadLabel: string
    step02Tag: string
    step02Eyebrow: string
    step02Title: string
    step02Body: string
    step02ReadNum: string
    step02ReadLabel: string
    step03Tag: string
    step03Eyebrow: string
    step03Title: string
    step03Body: string
    step03ReadNum: string
    step03ReadLabel: string
    step04Tag: string
    step04Eyebrow: string
    step04Title: string
    step04Body: string
    step04ReadLabel: string
    step04ReadWord: string
    step05Tag: string
    step05Eyebrow: string
    step05Title: string
    step05Body: string
    step05ReadNum: string
    step05ReadLabel: string
    sampleEyebrow: string
    sampleTitle: string
    sampleLede: string
    sampleStat1Delta: string
    sampleStat1Val: string
    sampleStat1Label: string
    sampleStat2Delta: string
    sampleStat2Suffix: string
    sampleStat2Label: string
    sampleStat3Delta: string
    sampleStat3Label: string
    sampleStat4Delta: string
    sampleStat4Suffix: string
    sampleStat4Label: string
    sampleNote: string
    pricingEyebrow: string
    pricingTitle: string
    pricingLede: string
    planName: string
    planPricePer: string
    planSub: string
    planFeature1: string
    planFeature2: string
    planFeature3: string
    planFeature4: string
    planFeature5: string
    planFeature6: string
    planCta: string
    planFoot: string
    trialLine: string
    trialLineBold: string
    signupEyebrow: string
    signupTitle: string
    signupLede: string
    faq1Q: string
    faq1A: string
    faq2Q: string
    faq2A: string
    faq3Q: string
    faq3A: string
    faq4Q: string
    faq4A: string
    faq5Q: string
    faq5A: string
    formTitle: string
    formLede: string
    formCta: string
    formHaveAccount: string
    formLogIn: string
    formFine: string
    formPrivacy: string
    footTagline: string
    footPrivacy: string
    footTerms: string
    footLogIn: string
  }
  auth: {
    signupTitle: string
    loginTitle: string
    signupSubtitle: string
    loginSubtitle: string
    alreadyHaveAccount: string
    newHere: string
    createAccount: string
    demoModeNote: string
    yourInfo: string
    firstName: string
    lastName: string
    addYourPlayer: string
    email: string
    password: string
    createAccountBtn: string
    logInBtn: string
    continueWithDemo: string
    termsOfService: string
    privacyPolicy: string
    checkEmailTitle: string
    checkEmailBody: string
    resendEmail: string
    resentEmail: string
    backToSignup: string
    consentPrefixGuardian: string
    consentPrefixSelf: string
    consentMiddle: string
    registeringForLabel: string
    registeringForSelf: string
    registeringForChild: string
    demoStartError: string
  }
  playerFields: {
    firstName: string
    lastName: string
    age: string
    experience: string
  }
  callback: {
    confirming: string
    confirmed: string
    expiredError: string
    goToLogin: string
  }
  home: {
    greeting: string
    ovr: string
    playerRating: string
    autoCalculated: (clips: number, notes: number) => string
    newHereActivity: string
    improvingActivity: (count: number) => string
    steadyActivity: string
    viewFullCard: string
    uploads: string
    coachNotes: string
    sessions: string
    dayStreak: string
    thisMonth: string
    plusThisMonth: (n: number) => string
    total: string
    noneBooked: string
    onCalendar: string
    booked: string
    startToday: string
    keepItUp: string
    onFire: string
    days: string
    formProgression: string
    uploadFirstClipToTrack: string
    uploadsAndNotesIn: string
    activityTrendOver: (range: string) => string
    last: string
    gettingStarted: string
    uploadFirstClip: string
    getCoachFeedback: string
    bookASession: string
    goalDetail: (done: number, total: number) => string
    goalDone: string
    activityAndReviews: string
    seeAll: string
    noActivityYet: string
    uploadClipToSeeActivity: string
    justNow: string
    hoursAgo: (n: number) => string
    daysAgo: (n: number) => string
    sentToCoach: string
    uploaded: string
    yourCoach: string
    addPlayer: string
    signOut: string
    notifications: string
  }
  aiLab: {
    title: string
    subtitle: string
    singleSkill: string
    fullMatch: string
    pickSkill: string
    howToRecord: string
    tipLandscape: string
    tipFullBody: string
    tipLighting: string
    tipLength: string
    notIdentifyNote: string
    dropClip: string
    dropClipSub: string
    tapDifferentFile: string
    analyzeButton: string
    freeAnalysesLeft: (count: number) => string
    upgradeButton: string
    redirecting: string
    paywallNotice: string
    proCapNotice: string
    uploadFullSession: string
    dragDropFootage: string
    fullMatchSub: string
    whatHappensNext: string
    matchStep1: string
    matchStep2: string
    matchStep3: string
    sendToCoach: string
    fullMatchSessionTitle: string
    percentComplete: (pct: number) => string
    analyzingClip: string
    sendingSession: string
    uploadStep1: string
    uploadStep2: string
    uploadStep3: string
    uploadStep4: string
    matchUploadStep1: string
    matchUploadStep2: string
    matchUploadStep3: string
    matchUploadStep4: string
    clipTooLong: string
    couldNotReadFile: string
    fileTooLarge: string
    couldNotReadVideoFile: string
    uploadError: string
    clipSaved: string
    clipSavedBody: string
    matchSentToCoach: string
    matchSentToCoachBody: string
    sendAnotherSession: string
    turnaround: string
    savedInVault: string
    coachReviews: string
    seeInCoaches: string
    analyzeAnother: string
    summary: string
    strengths: string
    improvements: string
    trainingPlan: string
    askAnything: string
    chatPlaceholder: string
    chatSend: string
    chatCapReached: string
    chatMonthlyCapReached: string
    chatUsedCount: string
    movementRead: string
    simulatedDataNote: string
    aiCoachSummary: string
    aiCoachSummaryPreview: string
    previewFeedbackNote: string
    aiDisclaimer: string
    bandDeveloping: string
    bandSolid: string
    bandStrong: string
    readBalance: string
    readSymmetry: string
    readWorkrate: string
    readPosture: string
  }
  coaches: {
    title: string
    subtitle: string
    newFeedbackFrom: string
    timestampedNotes: (count: number) => string
    proCoaches: string
    comingSoonTitle: string
    comingSoonBody: string
    bookSession: string
    perSession: string
    defaultCoachTitle: string
    profileComingSoon: string
  }
  vault: {
    title: string
    subtitle: string
    searchPlaceholder: string
    yourUploads: string
    sentToCoach: string
    uploaded: string
    aiPlaylist: string
    clipsPicked: (count: number) => string
    allVideos: string
    clips: string
    noClipsFound: string
    tryDifferentSearch: string
    views: string
  }
  profile: {
    title: string
    sessions: string
    uploads: string
    coachNotes: string
    dayStreak: string
    changePhoto: string
    language: string
    couldNotUpdatePhoto: string
    ageLabel: string
    mediaGallery: string
    items: (n: number) => string
  }
  billing: {
    title: string
    subtitle: string
    demoNote: string
    freePlan: string
    upgradeToPro: string
    manageBilling: string
    renews: string
    proBadge: string
  }
  addPlayer: {
    title: string
    subtitle: string
    close: string
    addButton: string
    recoverTitle: string
    recoverSubtitle: string
  }
  appShell: {
    loading: string
    demoModeBar: string
  }
  playerSwitcher: {
    addPlayer: string
  }
  bookingFlow: {
    backToCoaches: string
    title: string
    perSession: string
    dateAndTime: string
    focus: string
    selectDate: string
    availableSlots: string
    continue: string
    focusQuestion: string
    focusSubtitle: string
    currentLevel: string
    levelRecreational: string
    levelCompetitive: string
    levelAcademy: string
    anythingElse: string
    notesPlaceholder: string
    booking: string
    confirmBooking: string
    sessionBooked: string
    allSetWith: string
    videoCall: string
    date: string
    time: string
    focusLabel: string
    generalReview: string
    total: string
    addToCalendar: string
    done: string
    focusOption1: string
    focusOption2: string
    focusOption3: string
    focusOption4: string
    focusOption5: string
    focusOption6: string
    monthlyCapReached: string
    bookingFailed: string
  }
  feedbackHub: {
    backToCoaches: string
    noFeedbackYet: string
    title: string
    review: string
    coachNotes: string
    tapMarker: string
    frameNote: string
    voiceMemo: string
    videoResponse: string
    yourCoach: string
    play: string
    pause: string
    feedbackAtFrame: (frame: number) => string
  }
  activityHistory: {
    title: string
    seeAll: string
    noSessions: string
    bookOrUpload: string
    oneOnOneWith: string
    feedbackFrom: string
    feedback: string
    min: string
  }
  skillRadar: {
    title: string
    avg: string
    pace: string
    shooting: string
    dribbling: string
    passing: string
    physicality: string
  }
  videoPlayer: {
    closePlayer: string
    previewOnly: string
    noPreview: string
    aiMetadata: string
  }
  experience: {
    new: string
    developing: string
    club: string
    elite: string
  }
  skillTags: {
    shotVelocity: string
    freeKickCurve: string
    penaltyPlacement: string
    oneVOneDribble: string
  }
  specializations: {
    all: string
    firstTouch: string
    dribbling: string
    finishing: string
    positioning: string
    sprintMechanics: string
  }
  mockFeedback: {
    dayLabels: [string, string, string, string]
    hipsStrength: string
    hipsImprove: string
    kneeStrength: string
    kneeImprove: string
    intensityStrength: string
    intensityImprove: string
    postureStrength: string
    postureImprove: string
    summary: (firstName: string, position: string, strengthCount: number, improvementCount: number) => string
    puttingTogether: string
    circuitDrillName: string
    circuitDrillDesc: string
  }
  onboarding: {
    stepOf: (current: number, total: number) => string
    step1Title: string
    step1Body: string
    step2Title: string
    step2Body: (name: string) => string
    step2Cta: string
    step3Title: string
    step3Body: string
    step4Title: string
    step4Body: string
    back: string
    next: string
    skip: string
    getStarted: string
  }
}

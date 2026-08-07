import type { UiLocale } from "@/lib/i18n";

export type BillingCopy = {
  backToStudio: string;
  pricingTitle: string;
  pricingSubtitle: string;
  signedInAs: string;
  signInWhenPrompted: string;
  billingNotConfiguredEnv: string;
  billingNotConfiguredServer: string;
  checkoutFailed: string;
  openingCheckout: string;
  account: string;
  loading: string;
  choosePlan: string;
  pricingLink: string;
  manageSubscription: string;
  portalError: string;
  branding: string;
  signOut: string;
  signIn: string;
  viewPricing: string;
  noPlan: string;
  creditsCount: string;
  planCreditPack: string;
  planMonthly: string;
  planYearly: string;
  planFree: string;
  payPerUseCreditPack: string;
  creditsRemainingAccess: string;
  noActivePlanOrCredits: string;
  loadingAccount: string;
  signInBeforeCheckout: string;
  sessionDetectedTitle: string;
  sessionDetectedBody: string;
  yourAccount: string;
  emailLabel: string;
  accessLabel: string;
  pickPlanBelow: string;
  creditPackTitle: string;
  monthlyTitle: string;
  yearlyTitle: string;
  perCredits: string;
  perMonth: string;
  perYearSave: string;
  badgePopular: string;
  badgeBestValue: string;
  featureHighResExports: string;
  featureWatermarkFree: string;
  featureAiCopy: string;
  featureCustomBrandingExcluded: string;
  featureVideoReelsDemo: string;
  featureVideoReelsPro: string;
  featureAiVision: string;
  featureUnlimitedGenerations: string;
  featureFullBranding: string;
  featurePrioritySpeed: string;
  featureAnnualDiscount: string;
  featureAudioDictationTrial: string;
  featureGeocodedLocation: string;
  featureUnlimitedVoice: string;
  featureAutomatedLocationPoi: string;
  freeTrialCardTitle: string;
  freeTrialPriceLabel: string;
  freeTrialFeaturePdfCredits: string;
  freeTrialCta: string;
  voiceUpgradeTitle: string;
  voiceUpgradeBody: string;
  ctaBuyCredits: string;
  ctaSubscribeMonthly: string;
  ctaSubscribeYearly: string;
  authTitle: string;
  authSubtitle: string;
  authMagicLinkSent: string;
  authSendFailed: string;
  authClose: string;
  authSending: string;
  authSendMagicLink: string;
  upgradeTitle: string;
  upgradeSubtitleSubscriptionOnly: string;
  upgradeSubtitleGeneral: string;
  upgradeBillingDisabled: string;
  upgradeOpenPricing: string;
  upgradeOrPrefix: string;
  settingsBranding: string;
  settingsPlansBilling: string;
  proFeatureAria: string;
  proFeatureBadge: string;
  proGateTitle: string;
  proGateBody: string;
  upgradeToPro: string;
  comparePlans: string;
  creditPackPanelTitle: string;
  creditPackUsedOf: string;
  creditPackOfTotal: string;
  creditPackHint: string;
  creditPackCompact: string;
  creditPackTrialSuffix: string;
  dangerZoneTitle: string;
  dangerZoneDescription: string;
  deleteAccountButton: string;
  deleteAccountModalTitle: string;
  deleteAccountModalWarning: string;
  deleteAccountModalSubscriptionNote: string;
  deleteAccountConfirmLabel: string;
  deleteAccountConfirmPlaceholder: string;
  deleteAccountConfirmButton: string;
  deleteAccountCancel: string;
  deleteAccountDeleting: string;
  deleteAccountSuccess: string;
  deleteAccountFailed: string;
  deleteAccountTypeHint: string;
};

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

const en: BillingCopy = {
  backToStudio: "← Back to studio",
  pricingTitle: "Pricing & Plans",
  pricingSubtitle:
    "Choose credits for occasional use or subscribe for unlimited generation, custom branding, and watermark-free PDFs.",
  signedInAs:
    "Signed in as {email} — checkout opens with this email pre-filled.",
  signInWhenPrompted:
    "Sign in when prompted — your email will be pre-filled at checkout.",
  billingNotConfiguredEnv:
    "Set BILLING_ENABLED=true with Supabase and Lemon Squeezy keys to enable checkout.",
  billingNotConfiguredServer: "Billing is not configured on this server.",
  checkoutFailed: "Checkout failed.",
  openingCheckout: "Opening checkout…",
  account: "Account",
  loading: "Loading…",
  choosePlan: "Choose plan",
  pricingLink: "Pricing",
  manageSubscription: "Manage subscription",
  portalError: "Could not open subscription portal.",
  branding: "Branding",
  signOut: "Sign out",
  signIn: "Sign in",
  viewPricing: "View pricing",
  noPlan: "No plan",
  creditsCount: "{count} credits",
  planCreditPack: "Credit pack",
  planMonthly: "Monthly plan",
  planYearly: "Yearly plan",
  planFree: "Free",
  payPerUseCreditPack: "Pay-per-use (credit pack)",
  creditsRemainingAccess: "{count} credits remaining",
  noActivePlanOrCredits: "No active plan or credits",
  loadingAccount: "Loading account…",
  signInBeforeCheckout:
    "Use Account (top right) to sign in before checkout.",
  sessionDetectedTitle: "Session detected",
  sessionDetectedBody:
    "You appear signed in in this browser. Click a plan below — we will sync your session automatically. If checkout still asks you to sign in, use Sign out above and open a fresh magic link.",
  yourAccount: "Your account",
  emailLabel: "Email:",
  accessLabel: "Access:",
  pickPlanBelow: "Pick a plan below to generate exposés.",
  creditPackTitle: "Credit Pack",
  monthlyTitle: "Monthly Subscription",
  yearlyTitle: "Yearly Subscription",
  perCredits: "/ {count} Credits",
  perMonth: "/ month",
  perYearSave: "/ year (Save ~23%)",
  badgePopular: "Popular for Agents",
  badgeBestValue: "Best Value",
  featureHighResExports: "{count} High-res PDF Exports",
  featureWatermarkFree: "Watermark-Free PDF Exports",
  featureAiCopy: "AI Exposé Copy & Social Captions",
  featureCustomBrandingExcluded:
    "Custom Logo & Agency Branding (Pro Subscriptions Only)",
  featureVideoReelsDemo: "AI Property Video Reels (Includes demo watermark)",
  featureVideoReelsPro:
    "Unlimited Watermark-Free HD Video Reels with Agency Branding",
  featureAiVision:
    "AI Vision Engine (Auto-detects materials, lighting, & luxury finishes from photos)",
  featureUnlimitedGenerations: "Unlimited / High-volume Generations",
  featureFullBranding: "Full Custom Agency Logo & Brand Colors",
  featurePrioritySpeed: "Priority AI Generation Speed",
  featureAnnualDiscount: "Discounted Annual Rate (€10/mo equivalent)",
  featureAudioDictationTrial: "2 Audio Dictation Credits",
  featureGeocodedLocation: "Geocoded Location Insights",
  featureUnlimitedVoice: "Unlimited Voice Dictation & AI Parsing",
  featureAutomatedLocationPoi: "Automated Location & POI Descriptions",
  freeTrialCardTitle: "Free Trial",
  freeTrialPriceLabel: "€0",
  freeTrialFeaturePdfCredits: "2 Free PDF Exposé Credits",
  freeTrialCta: "Sign Up Free",
  voiceUpgradeTitle: "Upgrade for unlimited voice dictation",
  voiceUpgradeBody:
    "You've used your 2 free voice credits! Upgrade to Pro for unlimited voice dictation.",
  ctaBuyCredits: "Buy credits",
  ctaSubscribeMonthly: "Subscribe monthly",
  ctaSubscribeYearly: "Subscribe yearly",
  authTitle: "Sign in with email",
  authSubtitle: "Passwordless login — we'll email you a secure magic link.",
  authMagicLinkSent:
    "Check your inbox for the magic link. Open it in this same browser on this device (do not switch to phone or another app).",
  authSendFailed: "Could not send magic link.",
  authClose: "Close",
  authSending: "Sending…",
  authSendMagicLink: "Send magic link",
  upgradeTitle: "Upgrade to Pro",
  upgradeSubtitleSubscriptionOnly:
    "Unlock custom logo, brand colors, and broker signatures on every PDF with a monthly or yearly plan.",
  upgradeSubtitleGeneral:
    "Unlock custom logo & brand colors with a monthly or yearly plan. Credit packs and subscriptions also remove PDF watermarks.",
  upgradeBillingDisabled: "Billing is not enabled on this deployment.",
  upgradeOpenPricing: "open pricing page",
  upgradeOrPrefix: "Or",
  settingsBranding: "Branding",
  settingsPlansBilling: "Plans & billing",
  proFeatureAria: "Pro feature",
  proFeatureBadge: "Pro feature",
  proGateTitle: "Custom Branding is available on Monthly & Yearly Pro plans",
  proGateBody:
    "Upgrade to add your agency logo, custom colors, and broker signatures to your PDFs. Your credit pack includes watermark-free exports and AI copy — branding unlocks with a Pro subscription.",
  upgradeToPro: "Upgrade to Pro",
  comparePlans: "Compare plans",
  creditPackPanelTitle: "Credit pack",
  creditPackUsedOf: "{used} used · {remaining} remaining",
  creditPackOfTotal: "(of {total} total)",
  creditPackHint:
    "Each successful exposé generation uses one credit when you are on a pay-per-use plan.",
  creditPackCompact: "Credits: {used} used · {remaining} left",
  creditPackTrialSuffix: "({count} trial)",
  dangerZoneTitle: "Danger zone",
  dangerZoneDescription:
    "Permanently delete your account and all associated data. This cannot be undone.",
  deleteAccountButton: "Delete account",
  deleteAccountModalTitle: "Delete Account & Data",
  deleteAccountModalWarning:
    "Warning: This action is permanent and cannot be undone. All your saved property data, exposés, and media files will be deleted immediately.",
  deleteAccountModalSubscriptionNote:
    "If you have an active paid subscription, it will be canceled immediately and remaining time will be forfeited without refund.",
  deleteAccountConfirmLabel: 'Type "DELETE" to confirm',
  deleteAccountConfirmPlaceholder: "DELETE",
  deleteAccountConfirmButton: "Confirm deletion",
  deleteAccountCancel: "Cancel",
  deleteAccountDeleting: "Deleting account…",
  deleteAccountSuccess: "Account successfully deleted",
  deleteAccountFailed: "Could not delete account. Please try again or contact support.",
  deleteAccountTypeHint: 'Enter DELETE to enable confirmation.',
};

const de: Partial<BillingCopy> = {
  backToStudio: "← Zurück zum Studio",
  pricingTitle: "Preise & Tarife",
  pricingSubtitle:
    "Credits für gelegentliche Nutzung oder Abo für unbegrenzte Generierung, individuelles Branding und PDFs ohne Wasserzeichen.",
  signedInAs:
    "Angemeldet als {email} — Checkout öffnet sich mit dieser E-Mail.",
  signInWhenPrompted:
    "Bei Aufforderung anmelden — Ihre E-Mail wird im Checkout vorausgefüllt.",
  billingNotConfiguredEnv:
    "Setzen Sie BILLING_ENABLED=true mit Supabase- und Lemon-Squeezy-Schlüsseln.",
  billingNotConfiguredServer: "Abrechnung ist auf diesem Server nicht konfiguriert.",
  checkoutFailed: "Checkout fehlgeschlagen.",
  openingCheckout: "Checkout wird geöffnet…",
  account: "Konto",
  loading: "Lädt…",
  choosePlan: "Tarif wählen",
  pricingLink: "Preise",
  manageSubscription: "Abo verwalten",
  portalError: "Abo-Portal konnte nicht geöffnet werden.",
  branding: "Branding",
  signOut: "Abmelden",
  signIn: "Anmelden",
  viewPricing: "Preise ansehen",
  noPlan: "Kein Tarif",
  creditsCount: "{count} Credits",
  planCreditPack: "Credit-Paket",
  planMonthly: "Monatsabo",
  planYearly: "Jahresabo",
  planFree: "Kostenlos",
  payPerUseCreditPack: "Pay-per-use (Credit-Paket)",
  creditsRemainingAccess: "{count} Credits verbleibend",
  noActivePlanOrCredits: "Kein aktiver Tarif oder Credits",
  loadingAccount: "Konto wird geladen…",
  signInBeforeCheckout:
    "Melden Sie sich über Konto (oben rechts) an, bevor Sie zur Kasse gehen.",
  sessionDetectedTitle: "Sitzung erkannt",
  sessionDetectedBody:
    "Sie scheinen in diesem Browser angemeldet zu sein. Wählen Sie unten einen Tarif — wir synchronisieren Ihre Sitzung automatisch. Falls der Checkout erneut zur Anmeldung auffordert, melden Sie sich oben ab und öffnen Sie einen neuen Magic Link.",
  yourAccount: "Ihr Konto",
  emailLabel: "E-Mail:",
  accessLabel: "Zugang:",
  pickPlanBelow: "Wählen Sie unten einen Tarif, um Exposés zu erstellen.",
  creditPackTitle: "Credit-Paket",
  monthlyTitle: "Monatsabo",
  yearlyTitle: "Jahresabo",
  perCredits: "/ {count} Credits",
  perMonth: "/ Monat",
  perYearSave: "/ Jahr (ca. 23 % sparen)",
  badgePopular: "Beliebt bei Maklern",
  badgeBestValue: "Bestes Preis-Leistungs-Verhältnis",
  featureHighResExports: "{count} hochauflösende PDF-Exporte",
  featureWatermarkFree: "PDF-Exporte ohne Wasserzeichen",
  featureAiCopy: "KI-Exposé-Texte & Social Captions",
  featureCustomBrandingExcluded:
    "Individuelles Logo & Agentur-Branding (nur Pro-Abo)",
  featureVideoReelsDemo: "KI Property-Video-Reels (mit Demo-Wasserzeichen)",
  featureVideoReelsPro:
    "Unbegrenzte HD-Video-Reels ohne Wasserzeichen mit Agentur-Branding",
  featureAiVision:
    "KI-Vision-Engine (Material, Beleuchtung & Luxus-Details aus Fotos)",
  featureUnlimitedGenerations: "Unbegrenzte / hohe Generierungsmenge",
  featureFullBranding: "Volles Agentur-Logo & Markenfarben",
  featurePrioritySpeed: "Priorisierte KI-Generierung",
  featureAnnualDiscount: "Ermäßigter Jahrestarif (ca. 10 €/Monat)",
  featureAudioDictationTrial: "2 Sprach-Diktat-Credits",
  featureGeocodedLocation: "Geokodierte Lage-Insights",
  featureUnlimitedVoice: "Unbegrenztes Sprach-Diktat & KI-Parsing",
  featureAutomatedLocationPoi: "Automatische Lage- & POI-Beschreibungen",
  freeTrialCardTitle: "Kostenlose Testversion",
  freeTrialPriceLabel: "0 €",
  freeTrialFeaturePdfCredits: "2 kostenlose PDF-Exposé-Credits",
  freeTrialCta: "Kostenlos registrieren",
  voiceUpgradeTitle: "Upgrade für unbegrenztes Sprach-Diktat",
  voiceUpgradeBody:
    "Sie haben Ihre 2 kostenlosen Sprach-Credits aufgebraucht! Upgraden Sie auf Pro für unbegrenztes Sprach-Diktat.",
  ctaBuyCredits: "Credits kaufen",
  ctaSubscribeMonthly: "Monatlich abonnieren",
  ctaSubscribeYearly: "Jährlich abonnieren",
  authTitle: "Mit E-Mail anmelden",
  authSubtitle: "Passwortlos — wir senden Ihnen einen sicheren Magic Link.",
  authMagicLinkSent:
    "Prüfen Sie Ihren Posteingang. Öffnen Sie den Link im selben Browser auf diesem Gerät.",
  authSendFailed: "Magic Link konnte nicht gesendet werden.",
  authClose: "Schließen",
  authSending: "Wird gesendet…",
  authSendMagicLink: "Magic Link senden",
  upgradeTitle: "Auf Pro upgraden",
  upgradeSubtitleSubscriptionOnly:
    "Schalten Sie Logo, Markenfarben und Makler-Signaturen mit Monats- oder Jahresabo frei.",
  upgradeSubtitleGeneral:
    "Logo & Markenfarben mit Monats- oder Jahresabo. Credit-Pakete und Abos entfernen PDF-Wasserzeichen.",
  upgradeBillingDisabled: "Abrechnung ist in dieser Umgebung nicht aktiv.",
  upgradeOpenPricing: "Preisseite öffnen",
  upgradeOrPrefix: "Oder",
  settingsBranding: "Branding",
  settingsPlansBilling: "Tarife & Abrechnung",
  proFeatureAria: "Pro-Funktion",
  proFeatureBadge: "Pro-Funktion",
  proGateTitle: "Individuelles Branding mit Monats- & Jahres-Pro-Tarifen",
  proGateBody:
    "Upgraden Sie für Agentur-Logo, Farben und Signaturen in PDFs. Ihr Credit-Paket enthält export ohne Wasserzeichen und KI-Texte — Branding freischalten mit Pro-Abo.",
  upgradeToPro: "Auf Pro upgraden",
  comparePlans: "Tarife vergleichen",
  creditPackPanelTitle: "Credit-Paket",
  creditPackUsedOf: "{used} genutzt · {remaining} verbleibend",
  creditPackOfTotal: "(von {total} gesamt)",
  creditPackHint:
    "Jede erfolgreiche Exposé-Generierung verbraucht ein Credit im Pay-per-use-Tarif.",
  creditPackCompact: "Credits: {used} genutzt · {remaining} übrig",
  creditPackTrialSuffix: "({count} Test)",
  dangerZoneTitle: "Gefahrenzone",
  dangerZoneDescription:
    "Konto und alle zugehörigen Daten dauerhaft löschen. Dies kann nicht rückgängig gemacht werden.",
  deleteAccountButton: "Konto löschen",
  deleteAccountModalTitle: "Konto & Daten löschen",
  deleteAccountModalWarning:
    "Achtung: Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden. Alle gespeicherten Objektdaten, Exposés und Mediendateien werden sofort gelöscht.",
  deleteAccountModalSubscriptionNote:
    "Bei einem aktiven kostenpflichtigen Abo wird dieses sofort gekündigt; verbleibende Laufzeit verfällt ohne Erstattung.",
  deleteAccountConfirmLabel: '"DELETE" zur Bestätigung eingeben',
  deleteAccountConfirmPlaceholder: "DELETE",
  deleteAccountConfirmButton: "Löschung bestätigen",
  deleteAccountCancel: "Abbrechen",
  deleteAccountDeleting: "Konto wird gelöscht…",
  deleteAccountSuccess: "Konto erfolgreich gelöscht",
  deleteAccountFailed:
    "Konto konnte nicht gelöscht werden. Bitte erneut versuchen oder Support kontaktieren.",
  deleteAccountTypeHint: "Geben Sie DELETE ein, um die Bestätigung zu aktivieren.",
};

const fr: Partial<BillingCopy> = {
  backToStudio: "← Retour au studio",
  pricingTitle: "Tarifs & offres",
  pricingSubtitle:
    "Crédits à l'usage ou abonnement pour génération illimitée, branding personnalisé et PDF sans filigrane.",
  signedInAs: "Connecté en tant que {email} — l'e-mail est prérempli au paiement.",
  signInWhenPrompted:
    "Connectez-vous quand demandé — votre e-mail sera prérempli au checkout.",
  billingNotConfiguredEnv:
    "Définissez BILLING_ENABLED=true avec les clés Supabase et Lemon Squeezy.",
  billingNotConfiguredServer: "La facturation n'est pas configurée sur ce serveur.",
  checkoutFailed: "Échec du paiement.",
  openingCheckout: "Ouverture du checkout…",
  account: "Compte",
  loading: "Chargement…",
  choosePlan: "Choisir une offre",
  pricingLink: "Tarifs",
  manageSubscription: "Gérer l'abonnement",
  portalError: "Impossible d'ouvrir le portail d'abonnement.",
  branding: "Branding",
  signOut: "Se déconnecter",
  signIn: "Se connecter",
  viewPricing: "Voir les tarifs",
  noPlan: "Aucune offre",
  creditsCount: "{count} crédits",
  planCreditPack: "Pack de crédits",
  planMonthly: "Abonnement mensuel",
  planYearly: "Abonnement annuel",
  planFree: "Gratuit",
  payPerUseCreditPack: "Pay-per-use (pack de crédits)",
  creditsRemainingAccess: "{count} crédits restants",
  noActivePlanOrCredits: "Aucune offre ou crédit actif",
  loadingAccount: "Chargement du compte…",
  signInBeforeCheckout:
    "Utilisez Compte (en haut à droite) pour vous connecter avant le paiement.",
  sessionDetectedTitle: "Session détectée",
  sessionDetectedBody:
    "Vous semblez connecté dans ce navigateur. Cliquez sur une offre ci-dessous — nous synchroniserons votre session. Si le checkout demande encore une connexion, déconnectez-vous et ouvrez un nouveau lien magique.",
  yourAccount: "Votre compte",
  emailLabel: "E-mail :",
  accessLabel: "Accès :",
  pickPlanBelow: "Choisissez une offre ci-dessous pour générer des exposés.",
  creditPackTitle: "Pack de crédits",
  monthlyTitle: "Abonnement mensuel",
  yearlyTitle: "Abonnement annuel",
  perCredits: "/ {count} crédits",
  perMonth: "/ mois",
  perYearSave: "/ an (économisez ~23 %)",
  badgePopular: "Populaire chez les agents",
  badgeBestValue: "Meilleur rapport qualité-prix",
  featureHighResExports: "{count} exports PDF haute résolution",
  featureWatermarkFree: "Exports PDF sans filigrane",
  featureAiCopy: "Textes exposé IA & légendes social",
  featureCustomBrandingExcluded:
    "Logo & branding agence (abonnements Pro uniquement)",
  featureVideoReelsDemo: "Reels vidéo IA (avec filigrane démo)",
  featureVideoReelsPro:
    "Reels vidéo HD sans filigrane illimités avec branding agence",
  featureAiVision:
    "Moteur vision IA (matériaux, éclairage & finitions haut de gamme)",
  featureUnlimitedGenerations: "Générations illimitées / volume élevé",
  featureFullBranding: "Logo agence & couleurs de marque complets",
  featurePrioritySpeed: "Génération IA prioritaire",
  featureAnnualDiscount: "Tarif annuel réduit (équiv. 10 €/mois)",
  featureAudioDictationTrial: "2 crédits de dictée vocale",
  featureGeocodedLocation: "Informations de localisation géocodée",
  featureUnlimitedVoice: "Dictée vocale & analyse IA illimitées",
  featureAutomatedLocationPoi: "Descriptions automatiques de lieu & POI",
  freeTrialCardTitle: "Essai gratuit",
  freeTrialPriceLabel: "0 €",
  freeTrialFeaturePdfCredits: "2 crédits exposé PDF gratuits",
  freeTrialCta: "Inscription gratuite",
  voiceUpgradeTitle: "Passez à Pro pour une dictée illimitée",
  voiceUpgradeBody:
    "Vous avez utilisé vos 2 crédits vocaux gratuits ! Passez à Pro pour une dictée vocale illimitée.",
  ctaBuyCredits: "Acheter des crédits",
  ctaSubscribeMonthly: "S'abonner mensuellement",
  ctaSubscribeYearly: "S'abonner annuellement",
  authTitle: "Connexion par e-mail",
  authSubtitle: "Sans mot de passe — nous vous enverrons un lien magique sécurisé.",
  authMagicLinkSent:
    "Vérifiez votre boîte mail. Ouvrez le lien dans ce même navigateur sur cet appareil.",
  authSendFailed: "Impossible d'envoyer le lien magique.",
  authClose: "Fermer",
  authSending: "Envoi…",
  authSendMagicLink: "Envoyer le lien magique",
  upgradeTitle: "Passer à Pro",
  upgradeSubtitleSubscriptionOnly:
    "Débloquez logo, couleurs et signatures sur chaque PDF avec un abonnement mensuel ou annuel.",
  upgradeSubtitleGeneral:
    "Logo & couleurs avec abonnement mensuel ou annuel. Packs et abos suppriment les filigranes PDF.",
  upgradeBillingDisabled: "La facturation n'est pas activée sur ce déploiement.",
  upgradeOpenPricing: "ouvrir la page tarifs",
  upgradeOrPrefix: "Ou",
  settingsBranding: "Branding",
  settingsPlansBilling: "Offres & facturation",
  proFeatureAria: "Fonction Pro",
  proFeatureBadge: "Fonction Pro",
  proGateTitle: "Branding personnalisé avec les offres Pro mensuelles & annuelles",
  proGateBody:
    "Passez à Pro pour logo, couleurs et signatures dans vos PDF. Votre pack inclut exports sans filigrane et textes IA — le branding nécessite un abonnement Pro.",
  upgradeToPro: "Passer à Pro",
  comparePlans: "Comparer les offres",
  creditPackPanelTitle: "Pack de crédits",
  creditPackUsedOf: "{used} utilisés · {remaining} restants",
  creditPackOfTotal: "(sur {total} au total)",
  creditPackHint:
    "Chaque exposé généré utilise un crédit en mode pay-per-use.",
  creditPackCompact: "Crédits : {used} utilisés · {remaining} restants",
  creditPackTrialSuffix: "({count} essai)",
};

const es: Partial<BillingCopy> = {
  backToStudio: "← Volver al estudio",
  pricingTitle: "Precios y planes",
  pricingSubtitle:
    "Créditos ocasionales o suscripción para generación ilimitada, branding personalizado y PDF sin marca de agua.",
  signedInAs: "Sesión iniciada como {email} — el correo se rellena en el checkout.",
  signInWhenPrompted:
    "Inicie sesión cuando se le pida — su correo se rellenará en el checkout.",
  billingNotConfiguredEnv:
    "Configure BILLING_ENABLED=true con claves de Supabase y Lemon Squeezy.",
  billingNotConfiguredServer: "La facturación no está configurada en este servidor.",
  checkoutFailed: "Error en el checkout.",
  openingCheckout: "Abriendo checkout…",
  account: "Cuenta",
  loading: "Cargando…",
  choosePlan: "Elegir plan",
  pricingLink: "Precios",
  manageSubscription: "Gestionar suscripción",
  portalError: "No se pudo abrir el portal de suscripción.",
  branding: "Branding",
  signOut: "Cerrar sesión",
  signIn: "Iniciar sesión",
  viewPricing: "Ver precios",
  noPlan: "Sin plan",
  creditsCount: "{count} créditos",
  planCreditPack: "Pack de créditos",
  planMonthly: "Plan mensual",
  planYearly: "Plan anual",
  planFree: "Gratis",
  payPerUseCreditPack: "Pay-per-use (pack de créditos)",
  creditsRemainingAccess: "{count} créditos restantes",
  noActivePlanOrCredits: "Sin plan activo ni créditos",
  loadingAccount: "Cargando cuenta…",
  signInBeforeCheckout:
    "Use Cuenta (arriba a la derecha) para iniciar sesión antes del checkout.",
  sessionDetectedTitle: "Sesión detectada",
  sessionDetectedBody:
    "Parece que ha iniciado sesión en este navegador. Elija un plan abajo — sincronizaremos su sesión. Si el checkout pide iniciar sesión, cierre sesión y abra un nuevo enlace mágico.",
  yourAccount: "Su cuenta",
  emailLabel: "Correo:",
  accessLabel: "Acceso:",
  pickPlanBelow: "Elija un plan abajo para generar exposés.",
  creditPackTitle: "Pack de créditos",
  monthlyTitle: "Suscripción mensual",
  yearlyTitle: "Suscripción anual",
  perCredits: "/ {count} créditos",
  perMonth: "/ mes",
  perYearSave: "/ año (ahorra ~23 %)",
  badgePopular: "Popular entre agentes",
  badgeBestValue: "Mejor valor",
  featureHighResExports: "{count} exportaciones PDF en alta resolución",
  featureWatermarkFree: "Exportaciones PDF sin marca de agua",
  featureAiCopy: "Textos exposé IA y captions sociales",
  featureCustomBrandingExcluded:
    "Logo y branding de agencia (solo suscripciones Pro)",
  featureVideoReelsDemo: "Reels de vídeo IA (incluye marca de agua demo)",
  featureVideoReelsPro:
    "Reels HD sin marca de agua ilimitados con branding de agencia",
  featureAiVision:
    "Motor de visión IA (materiales, iluminación y acabados de lujo)",
  featureUnlimitedGenerations: "Generaciones ilimitadas / alto volumen",
  featureFullBranding: "Logo de agencia y colores de marca completos",
  featurePrioritySpeed: "Generación IA prioritaria",
  featureAnnualDiscount: "Tarifa anual con descuento (equiv. 10 €/mes)",
  featureAudioDictationTrial: "2 créditos de dictado por voz",
  featureGeocodedLocation: "Información de ubicación geocodificada",
  featureUnlimitedVoice: "Dictado por voz y análisis IA ilimitados",
  featureAutomatedLocationPoi: "Descripciones automáticas de ubicación y POI",
  freeTrialCardTitle: "Prueba gratuita",
  freeTrialPriceLabel: "0 €",
  freeTrialFeaturePdfCredits: "2 créditos de exposé PDF gratis",
  freeTrialCta: "Registrarse gratis",
  voiceUpgradeTitle: "Actualiza a Pro para dictado ilimitado",
  voiceUpgradeBody:
    "¡Has usado tus 2 créditos de voz gratis! Actualiza a Pro para dictado por voz ilimitado.",
  ctaBuyCredits: "Comprar créditos",
  ctaSubscribeMonthly: "Suscribirse mensualmente",
  ctaSubscribeYearly: "Suscribirse anualmente",
  authTitle: "Iniciar sesión con correo",
  authSubtitle: "Sin contraseña — le enviaremos un enlace mágico seguro.",
  authMagicLinkSent:
    "Revise su bandeja de entrada. Abra el enlace en este mismo navegador en este dispositivo.",
  authSendFailed: "No se pudo enviar el enlace mágico.",
  authClose: "Cerrar",
  authSending: "Enviando…",
  authSendMagicLink: "Enviar enlace mágico",
  upgradeTitle: "Actualizar a Pro",
  upgradeSubtitleSubscriptionOnly:
    "Desbloquee logo, colores y firmas en cada PDF con plan mensual o anual.",
  upgradeSubtitleGeneral:
    "Logo y colores con plan mensual o anual. Packs y suscripciones eliminan marcas de agua PDF.",
  upgradeBillingDisabled: "La facturación no está activa en este despliegue.",
  upgradeOpenPricing: "abrir página de precios",
  upgradeOrPrefix: "O",
  settingsBranding: "Branding",
  settingsPlansBilling: "Planes y facturación",
  proFeatureAria: "Función Pro",
  proFeatureBadge: "Función Pro",
  proGateTitle: "Branding personalizado en planes Pro mensual y anual",
  proGateBody:
    "Actualice para logo, colores y firmas en PDFs. Su pack incluye exportaciones sin marca de agua y textos IA — el branding requiere suscripción Pro.",
  upgradeToPro: "Actualizar a Pro",
  comparePlans: "Comparar planes",
  creditPackPanelTitle: "Pack de créditos",
  creditPackUsedOf: "{used} usados · {remaining} restantes",
  creditPackOfTotal: "(de {total} en total)",
  creditPackHint:
    "Cada exposé generado usa un crédito en el plan pay-per-use.",
  creditPackCompact: "Créditos: {used} usados · {remaining} restantes",
  creditPackTrialSuffix: "({count} prueba)",
};

const it: Partial<BillingCopy> = {
  backToStudio: "← Torna allo studio",
  pricingTitle: "Prezzi e piani",
  pricingSubtitle:
    "Crediti occasionali o abbonamento per generazioni illimitate, branding personalizzato e PDF senza watermark.",
  signedInAs: "Accesso come {email} — l'e-mail è precompilata al checkout.",
  signInWhenPrompted:
    "Accedi quando richiesto — la tua e-mail sarà precompilata al checkout.",
  billingNotConfiguredEnv:
    "Imposta BILLING_ENABLED=true con chiavi Supabase e Lemon Squeezy.",
  billingNotConfiguredServer: "La fatturazione non è configurata su questo server.",
  checkoutFailed: "Checkout non riuscito.",
  openingCheckout: "Apertura checkout…",
  account: "Account",
  loading: "Caricamento…",
  choosePlan: "Scegli piano",
  pricingLink: "Prezzi",
  manageSubscription: "Gestisci abbonamento",
  portalError: "Impossibile aprire il portale abbonamenti.",
  branding: "Branding",
  signOut: "Esci",
  signIn: "Accedi",
  viewPricing: "Vedi prezzi",
  noPlan: "Nessun piano",
  creditsCount: "{count} crediti",
  planCreditPack: "Pacchetto crediti",
  planMonthly: "Piano mensile",
  planYearly: "Piano annuale",
  planFree: "Gratuito",
  payPerUseCreditPack: "Pay-per-use (pacchetto crediti)",
  creditsRemainingAccess: "{count} crediti rimanenti",
  noActivePlanOrCredits: "Nessun piano attivo o crediti",
  loadingAccount: "Caricamento account…",
  signInBeforeCheckout:
    "Usa Account (in alto a destra) per accedere prima del checkout.",
  sessionDetectedTitle: "Sessione rilevata",
  sessionDetectedBody:
    "Sembri connesso in questo browser. Scegli un piano sotto — sincronizzeremo la sessione. Se il checkout chiede di accedere, esci e apri un nuovo magic link.",
  yourAccount: "Il tuo account",
  emailLabel: "E-mail:",
  accessLabel: "Accesso:",
  pickPlanBelow: "Scegli un piano sotto per generare exposé.",
  creditPackTitle: "Pacchetto crediti",
  monthlyTitle: "Abbonamento mensile",
  yearlyTitle: "Abbonamento annuale",
  perCredits: "/ {count} crediti",
  perMonth: "/ mese",
  perYearSave: "/ anno (risparmia ~23 %)",
  badgePopular: "Popolare tra gli agenti",
  badgeBestValue: "Miglior valore",
  featureHighResExports: "{count} export PDF ad alta risoluzione",
  featureWatermarkFree: "Export PDF senza watermark",
  featureAiCopy: "Testi exposé IA e caption social",
  featureCustomBrandingExcluded:
    "Logo e branding agenzia (solo abbonamenti Pro)",
  featureVideoReelsDemo: "Reel video IA (include filigrana demo)",
  featureVideoReelsPro:
    "Reel video HD senza filigrana illimitati con branding agenzia",
  featureAiVision:
    "Motore visione IA (materiali, illuminazione e finiture di lusso)",
  featureUnlimitedGenerations: "Generazioni illimitate / alto volume",
  featureFullBranding: "Logo agenzia e colori brand completi",
  featurePrioritySpeed: "Generazione IA prioritaria",
  featureAnnualDiscount: "Tariffa annuale scontata (equiv. 10 €/mese)",
  featureAudioDictationTrial: "2 crediti di dettatura vocale",
  featureGeocodedLocation: "Insight sulla posizione geocodificata",
  featureUnlimitedVoice: "Dettatura vocale e analisi IA illimitate",
  featureAutomatedLocationPoi: "Descrizioni automatiche di zona e POI",
  freeTrialCardTitle: "Prova gratuita",
  freeTrialPriceLabel: "0 €",
  freeTrialFeaturePdfCredits: "2 crediti exposé PDF gratuiti",
  freeTrialCta: "Registrati gratis",
  voiceUpgradeTitle: "Passa a Pro per dettatura illimitata",
  voiceUpgradeBody:
    "Hai usato i tuoi 2 crediti vocali gratuiti! Passa a Pro per dettatura vocale illimitata.",
  ctaBuyCredits: "Acquista crediti",
  ctaSubscribeMonthly: "Abbonati mensilmente",
  ctaSubscribeYearly: "Abbonati annualmente",
  authTitle: "Accedi con e-mail",
  authSubtitle: "Senza password — ti invieremo un magic link sicuro.",
  authMagicLinkSent:
    "Controlla la posta. Apri il link nello stesso browser su questo dispositivo.",
  authSendFailed: "Impossibile inviare il magic link.",
  authClose: "Chiudi",
  authSending: "Invio…",
  authSendMagicLink: "Invia magic link",
  upgradeTitle: "Passa a Pro",
  upgradeSubtitleSubscriptionOnly:
    "Sblocca logo, colori e firme su ogni PDF con piano mensile o annuale.",
  upgradeSubtitleGeneral:
    "Logo e colori con piano mensile o annuale. Pacchetti e abbonamenti rimuovono i watermark PDF.",
  upgradeBillingDisabled: "La fatturazione non è attiva in questo deployment.",
  upgradeOpenPricing: "apri pagina prezzi",
  upgradeOrPrefix: "Oppure",
  settingsBranding: "Branding",
  settingsPlansBilling: "Piani e fatturazione",
  proFeatureAria: "Funzione Pro",
  proFeatureBadge: "Funzione Pro",
  proGateTitle: "Branding personalizzato con piani Pro mensili e annuali",
  proGateBody:
    "Passa a Pro per logo, colori e firme nei PDF. Il pacchetto include export senza watermark e testi IA — il branding richiede abbonamento Pro.",
  upgradeToPro: "Passa a Pro",
  comparePlans: "Confronta piani",
  creditPackPanelTitle: "Pacchetto crediti",
  creditPackUsedOf: "{used} usati · {remaining} rimanenti",
  creditPackOfTotal: "(su {total} totali)",
  creditPackHint:
    "Ogni exposé generato usa un credito nel piano pay-per-use.",
  creditPackCompact: "Crediti: {used} usati · {remaining} rimasti",
  creditPackTrialSuffix: "({count} prova)",
};

const nl: Partial<BillingCopy> = {
  backToStudio: "← Terug naar studio",
  pricingTitle: "Prijzen & abonnementen",
  pricingSubtitle:
    "Credits voor incidenteel gebruik of abonnement voor onbeperkt genereren, branding en PDF's zonder watermerk.",
  signedInAs: "Ingelogd als {email} — e-mail wordt vooringevuld bij checkout.",
  signInWhenPrompted:
    "Log in wanneer gevraagd — uw e-mail wordt vooringevuld bij checkout.",
  billingNotConfiguredEnv:
    "Stel BILLING_ENABLED=true in met Supabase- en Lemon Squeezy-sleutels.",
  billingNotConfiguredServer: "Facturering is niet geconfigureerd op deze server.",
  checkoutFailed: "Checkout mislukt.",
  openingCheckout: "Checkout openen…",
  account: "Account",
  loading: "Laden…",
  choosePlan: "Kies abonnement",
  pricingLink: "Prijzen",
  manageSubscription: "Abonnement beheren",
  portalError: "Kon abonnementsportaal niet openen.",
  branding: "Branding",
  signOut: "Uitloggen",
  signIn: "Inloggen",
  viewPricing: "Prijzen bekijken",
  noPlan: "Geen abonnement",
  creditsCount: "{count} credits",
  planCreditPack: "Creditpakket",
  planMonthly: "Maandabonnement",
  planYearly: "Jaarabonnement",
  planFree: "Gratis",
  payPerUseCreditPack: "Pay-per-use (creditpakket)",
  creditsRemainingAccess: "{count} credits resterend",
  noActivePlanOrCredits: "Geen actief abonnement of credits",
  loadingAccount: "Account laden…",
  signInBeforeCheckout:
    "Gebruik Account (rechtsboven) om in te loggen vóór checkout.",
  sessionDetectedTitle: "Sessie gedetecteerd",
  sessionDetectedBody:
    "U lijkt ingelogd in deze browser. Kies hieronder een abonnement — we synchroniseren uw sessie. Vraagt checkout opnieuw om inloggen, log uit en open een nieuwe magic link.",
  yourAccount: "Uw account",
  emailLabel: "E-mail:",
  accessLabel: "Toegang:",
  pickPlanBelow: "Kies hieronder een abonnement om exposés te genereren.",
  creditPackTitle: "Creditpakket",
  monthlyTitle: "Maandabonnement",
  yearlyTitle: "Jaarabonnement",
  perCredits: "/ {count} credits",
  perMonth: "/ maand",
  perYearSave: "/ jaar (bespaar ~23 %)",
  badgePopular: "Populair bij makelaars",
  badgeBestValue: "Beste waarde",
  featureHighResExports: "{count} PDF-exporten in hoge resolutie",
  featureWatermarkFree: "PDF-exporten zonder watermerk",
  featureAiCopy: "AI-exposéteksten & social captions",
  featureCustomBrandingExcluded:
    "Logo & bureau-branding (alleen Pro-abonnementen)",
  featureVideoReelsDemo: "AI property-video-reels (inclusief demo-watermerk)",
  featureVideoReelsPro:
    "Onbeperkte HD-video-reels zonder watermerk met bureau-branding",
  featureAiVision:
    "AI Vision Engine (materialen, belichting & luxe afwerking uit foto's)",
  featureUnlimitedGenerations: "Onbeperkt / hoog volume genereren",
  featureFullBranding: "Volledig bureau-logo & huisstijlkleuren",
  featurePrioritySpeed: "Prioritaire AI-generatie",
  featureAnnualDiscount: "Voordelig jaartarief (ca. €10/maand)",
  featureAudioDictationTrial: "2 spraakdictatie-credits",
  featureGeocodedLocation: "Geocodeerde locatie-inzichten",
  featureUnlimitedVoice: "Onbeperkte spraakdictatie & AI-parsing",
  featureAutomatedLocationPoi: "Automatische locatie- & POI-beschrijvingen",
  freeTrialCardTitle: "Gratis proefperiode",
  freeTrialPriceLabel: "€ 0",
  freeTrialFeaturePdfCredits: "2 gratis PDF-exposé-credits",
  freeTrialCta: "Gratis registreren",
  voiceUpgradeTitle: "Upgrade naar Pro voor onbeperkte spraakdictatie",
  voiceUpgradeBody:
    "Je hebt je 2 gratis spraakcredits gebruikt! Upgrade naar Pro voor onbeperkte spraakdictatie.",
  ctaBuyCredits: "Credits kopen",
  ctaSubscribeMonthly: "Maandelijks abonneren",
  ctaSubscribeYearly: "Jaarlijks abonneren",
  authTitle: "Inloggen met e-mail",
  authSubtitle: "Wachtwoordloos — we sturen een beveiligde magic link.",
  authMagicLinkSent:
    "Controleer uw inbox. Open de link in dezelfde browser op dit apparaat.",
  authSendFailed: "Kon magic link niet verzenden.",
  authClose: "Sluiten",
  authSending: "Verzenden…",
  authSendMagicLink: "Magic link verzenden",
  upgradeTitle: "Upgrade naar Pro",
  upgradeSubtitleSubscriptionOnly:
    "Ontgrendel logo, kleuren en handtekeningen op elke PDF met maand- of jaarabonnement.",
  upgradeSubtitleGeneral:
    "Logo & kleuren met maand- of jaarabonnement. Creditpakketten en abonnementen verwijderen PDF-watermerken.",
  upgradeBillingDisabled: "Facturering is niet ingeschakeld in deze omgeving.",
  upgradeOpenPricing: "prijspagina openen",
  upgradeOrPrefix: "Of",
  settingsBranding: "Branding",
  settingsPlansBilling: "Abonnementen & facturering",
  proFeatureAria: "Pro-functie",
  proFeatureBadge: "Pro-functie",
  proGateTitle: "Aangepaste branding met maandelijkse & jaarlijkse Pro-abonnementen",
  proGateBody:
    "Upgrade voor logo, kleuren en handtekeningen in PDF's. Uw pakket bevat export zonder watermerk en AI-teksten — branding vereist Pro-abonnement.",
  upgradeToPro: "Upgrade naar Pro",
  comparePlans: "Abonnementen vergelijken",
  creditPackPanelTitle: "Creditpakket",
  creditPackUsedOf: "{used} gebruikt · {remaining} resterend",
  creditPackOfTotal: "(van {total} totaal)",
  creditPackHint:
    "Elke succesvolle exposé-generatie gebruikt één credit bij pay-per-use.",
  creditPackCompact: "Credits: {used} gebruikt · {remaining} over",
  creditPackTrialSuffix: "({count} proef)",
};

const pl: Partial<BillingCopy> = {
  backToStudio: "← Powrót do studia",
  pricingTitle: "Cennik i plany",
  pricingSubtitle:
    "Kredyty na okazjonalne użycie lub subskrypcja dla nieograniczonej generacji, brandingu i PDF bez znaku wodnego.",
  signedInAs: "Zalogowano jako {email} — e-mail jest wstępnie uzupełniony przy płatności.",
  signInWhenPrompted:
    "Zaloguj się po monicie — e-mail zostanie wstępnie uzupełniony przy checkout.",
  billingNotConfiguredEnv:
    "Ustaw BILLING_ENABLED=true z kluczami Supabase i Lemon Squeezy.",
  billingNotConfiguredServer: "Rozliczenia nie są skonfigurowane na tym serwerze.",
  checkoutFailed: "Checkout nie powiódł się.",
  openingCheckout: "Otwieranie checkout…",
  account: "Konto",
  loading: "Ładowanie…",
  choosePlan: "Wybierz plan",
  pricingLink: "Cennik",
  manageSubscription: "Zarządzaj subskrypcją",
  portalError: "Nie można otworzyć portalu subskrypcji.",
  branding: "Branding",
  signOut: "Wyloguj",
  signIn: "Zaloguj",
  viewPricing: "Zobacz cennik",
  noPlan: "Brak planu",
  creditsCount: "{count} kredytów",
  planCreditPack: "Pakiet kredytów",
  planMonthly: "Plan miesięczny",
  planYearly: "Plan roczny",
  planFree: "Bezpłatny",
  payPerUseCreditPack: "Pay-per-use (pakiet kredytów)",
  creditsRemainingAccess: "{count} kredytów pozostało",
  noActivePlanOrCredits: "Brak aktywnego planu lub kredytów",
  loadingAccount: "Ładowanie konta…",
  signInBeforeCheckout:
    "Użyj Konta (góra po prawej), aby zalogować się przed checkout.",
  sessionDetectedTitle: "Wykryto sesję",
  sessionDetectedBody:
    "Wygląda na to, że jesteś zalogowany w tej przeglądarce. Wybierz plan poniżej — zsynchronizujemy sesję. Jeśli checkout nadal prosi o logowanie, wyloguj się i otwórz nowy magic link.",
  yourAccount: "Twoje konto",
  emailLabel: "E-mail:",
  accessLabel: "Dostęp:",
  pickPlanBelow: "Wybierz plan poniżej, aby generować exposé.",
  creditPackTitle: "Pakiet kredytów",
  monthlyTitle: "Subskrypcja miesięczna",
  yearlyTitle: "Subskrypcja roczna",
  perCredits: "/ {count} kredytów",
  perMonth: "/ miesiąc",
  perYearSave: "/ rok (oszczędność ~23 %)",
  badgePopular: "Popularny wśród agentów",
  badgeBestValue: "Najlepsza wartość",
  featureHighResExports: "{count} eksportów PDF w wysokiej rozdzielczości",
  featureWatermarkFree: "Eksport PDF bez znaku wodnego",
  featureAiCopy: "Teksty exposé AI i opisy social",
  featureCustomBrandingExcluded:
    "Logo i branding agencji (tylko subskrypcje Pro)",
  featureVideoReelsDemo: "Reels wideo AI (z demo znakiem wodnym)",
  featureVideoReelsPro:
    "Nieograniczone reels HD bez znaku wodnego z brandingiem agencji",
  featureAiVision:
    "Silnik AI Vision (materiały, oświetlenie i luksusowe wykończenia)",
  featureUnlimitedGenerations: "Nieograniczone / duża liczba generacji",
  featureFullBranding: "Pełne logo agencji i kolory marki",
  featurePrioritySpeed: "Priorytetowa generacja AI",
  featureAnnualDiscount: "Obniżona stawka roczna (ok. 10 €/mies.)",
  featureAudioDictationTrial: "2 kredyty dyktowania głosowego",
  featureGeocodedLocation: "Geokodowane informacje o lokalizacji",
  featureUnlimitedVoice: "Nielimitowane dyktowanie głosowe i analiza AI",
  featureAutomatedLocationPoi: "Automatyczne opisy lokalizacji i POI",
  freeTrialCardTitle: "Bezpłatna wersja próbna",
  freeTrialPriceLabel: "0 €",
  freeTrialFeaturePdfCredits: "2 bezpłatne kredyty exposé PDF",
  freeTrialCta: "Zarejestruj się za darmo",
  voiceUpgradeTitle: "Przejdź na Pro, aby uzyskać nielimitowane dyktowanie",
  voiceUpgradeBody:
    "Wykorzystałeś 2 bezpłatne kredyty głosowe! Przejdź na Pro, aby uzyskać nielimitowane dyktowanie głosowe.",
  ctaBuyCredits: "Kup kredyty",
  ctaSubscribeMonthly: "Subskrybuj miesięcznie",
  ctaSubscribeYearly: "Subskrybuj rocznie",
  authTitle: "Zaloguj e-mailem",
  authSubtitle: "Bez hasła — wyślemy bezpieczny magic link.",
  authMagicLinkSent:
    "Sprawdź skrzynkę. Otwórz link w tej samej przeglądarce na tym urządzeniu.",
  authSendFailed: "Nie można wysłać magic link.",
  authClose: "Zamknij",
  authSending: "Wysyłanie…",
  authSendMagicLink: "Wyślij magic link",
  upgradeTitle: "Przejdź na Pro",
  upgradeSubtitleSubscriptionOnly:
    "Odblokuj logo, kolory i podpisy na każdym PDF z planem miesięcznym lub rocznym.",
  upgradeSubtitleGeneral:
    "Logo i kolory z planem miesięcznym lub rocznym. Pakiety i subskrypcje usuwają znaki wodne PDF.",
  upgradeBillingDisabled: "Rozliczenia nie są włączone w tym wdrożeniu.",
  upgradeOpenPricing: "otwórz stronę cennika",
  upgradeOrPrefix: "Lub",
  settingsBranding: "Branding",
  settingsPlansBilling: "Plany i rozliczenia",
  proFeatureAria: "Funkcja Pro",
  proFeatureBadge: "Funkcja Pro",
  proGateTitle: "Własny branding w planach Pro miesięcznych i rocznych",
  proGateBody:
    "Przejdź na Pro, aby dodać logo, kolory i podpisy do PDF. Pakiet obejmuje eksport bez znaku wodnego i teksty AI — branding wymaga subskrypcji Pro.",
  upgradeToPro: "Przejdź na Pro",
  comparePlans: "Porównaj plany",
  creditPackPanelTitle: "Pakiet kredytów",
  creditPackUsedOf: "{used} użytych · {remaining} pozostało",
  creditPackOfTotal: "(z {total} łącznie)",
  creditPackHint:
    "Każda udana generacja exposé zużywa jeden kredyt w planie pay-per-use.",
  creditPackCompact: "Kredyty: {used} użytych · {remaining} pozostało",
  creditPackTrialSuffix: "({count} próbnych)",
};


const billingTranslations: Partial<Record<UiLocale, Partial<BillingCopy>>> = {
  de,
  fr,
  es,
  it,
  nl,
  pl,
};

export function getBillingCopy(locale: UiLocale): BillingCopy {
  return { ...en, ...(billingTranslations[locale] ?? {}) };
}

export function planDisplayNameLocalized(
  planId: string | null,
  locale: UiLocale,
): string {
  const copy = getBillingCopy(locale);
  switch (planId) {
    case "credits_pack":
      return copy.planCreditPack;
    case "monthly":
      return copy.planMonthly;
    case "yearly":
      return copy.planYearly;
    default:
      return planId ?? copy.planFree;
  }
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar' | 'hi' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'pl' | 'tr' | 'he';

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  pt: { name: 'Português', flag: '🇧🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  da: { name: 'Dansk', flag: '🇩🇰' },
  no: { name: 'Norsk', flag: '🇳🇴' },
  fi: { name: 'Suomi', flag: '🇫🇮' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  he: { name: 'עברית', flag: '🇮🇱' }
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    
    // URL Shortener
    lightning: 'Lightning fast URL shortening',
    shortenAnyUrl: 'Shorten Any URL',
    description: 'Transform long, complex URLs into short, shareable links instantly. No signup required, links never expire.',
    enterUrl: 'Enter your long URL here...',
    shorten: 'Shorten',
    customEnding: 'Custom ending (optional):',
    customName: 'custom-name',
    
    // Results
    urlReady: 'Your shortened URL is ready!',
    originalUrl: 'Original URL',
    shortenedUrl: 'Shortened URL',
    copy: 'Copy',
    qrCode: 'QR Code',
    download: 'Download',
    
    // Features
    instant: 'Instant',
    instantDesc: 'Get your shortened URL in seconds',
    noExpiry: 'No Expiry',
    noExpiryDesc: 'Your links work forever',
    noSignup: 'No Signup',
    noSignupDesc: 'Start shortening immediately',
    
    // Promotional section
    wantMoreTitle: 'Want more out of your link shortener?',
    wantMoreDescription: 'Track link analytics, use branded domains for fully custom links, and manage your links with our paid plans.',
    viewPlans: 'View Plans',
    createFreeAccount: 'Create Free Account',
    plansInclude: 'Minify-URL.com plans include:',
    detailedAnalytics: 'Detailed Link Analytics',
    bulkShortUrls: 'Bulk Short URLs',
    brandedDomains: 'Fully Branded Domains',
    linkManagement: 'Link Management Features',
    
    // Auth
    welcomeTo: 'Welcome to Minify-URL.com',
    signInDesc: 'Sign in to your account or create a new one',
    
    // Toasts
    pleaseEnterUrl: 'Please enter a URL',
    enterValidUrl: 'Enter a valid URL to shorten',
    invalidUrl: 'Invalid URL',
    pleaseEnterValidUrl: 'Please enter a valid URL',
    invalidCustomEnding: 'Invalid custom ending',
    onlyAlphanumeric: 'Only letters, numbers, and hyphens are allowed',
    customEndingUnavailable: 'Custom ending unavailable',
    customEndingTaken: 'This custom ending is already taken. Please try another.',
    urlShortenedSuccess: 'URL shortened successfully!',
    urlSavedToDashboard: 'URL saved to your dashboard',
    signInToSave: 'Sign in to save and manage your URLs',
    copiedToClipboard: 'Copied to clipboard!',
    shortenedUrlCopied: 'The shortened URL has been copied',
    failedToCopy: 'Failed to copy',
    copyManually: 'Please copy the URL manually',
    qrDownloaded: 'QR Code downloaded!',
    qrSavedToDownloads: 'The QR code has been saved to your downloads',
    error: 'Error',
    failedToShortenUrl: 'Failed to shorten URL',
    
    // Subscription
    plans: 'Plans',
    findPlanTitle: 'Find a plan that meets your needs',
    billingCycle: 'Billing cycle',
    monthly: 'Monthly',
    annual: 'Annual',
    mostPopular: 'Most Popular',
    links: 'Links',
    unlimitedClicksTrackable: 'Unlimited Trackable Clicks',
    trackClicks: 'Track up to {{count}} Clicks',
    signUp: 'Sign Up',
    contactUs: 'Contact Us',
    custom: 'Custom',
    perMonth: '/ mo *',
    perYear: '/ yr',
    linkAnalytics: 'Link Analytics',
    advancedLinkManagement: 'Advanced Link Management',
    shortenUrlsBrandedDomains: 'Shorten URLs Using Branded Domains',
    linkEditingDeletion: 'Link Editing & Deletion',
    customLinkExpiration: 'Custom Link Expiration Dates',
    proDescription: 'Get full access to our Pro features including:',
    proAdditionalInfo: 'Enjoy 500 links with unlimited clicks and track up to 9.5K clicks on 9.5K additional links.',
    bulkDescription: 'Our bulk plan for users who need to generate a ton of short-term, branded links to support their marketing or operations.',
    bulkAdditionalInfo: 'Enjoy all Pro features, 90-day default link expiration, and track up to 100K clicks across 100K branded short links.',
    enterpriseDescription: 'Need a larger limit, dedicated customer support, custom solutions, or specific compliance requirements?',
    enterpriseAdditionalInfo: 'We offer tailor-made plans for enterprises that need more than what our regular plans can offer. Have a chat with our experts to get started on an enterprise plan.',
    needHelpChoosing: 'Need help choosing a plan?',
    needHelpDescription: 'Not sure which plan is right for you? Our team is here to help you find the perfect solution for your needs.',
    contactSupport: 'Contact Support'
  },
  pt: {
    // Navigation
    dashboard: 'Painel',
    signIn: 'Entrar',
    signOut: 'Sair',
    
    // URL Shortener
    lightning: 'Encurtamento de URL ultrarrápido',
    shortenAnyUrl: 'Encurte Qualquer URL',
    description: 'Transforme URLs longas e complexas em links curtos e compartilháveis instantaneamente. Não é necessário cadastro, os links nunca expiram.',
    enterUrl: 'Digite sua URL longa aqui...',
    shorten: 'Encurtar',
    customEnding: 'nome-personalizado',
    customName: 'nome-personalizado',
    
    // Results
    urlReady: 'Sua URL encurtada está pronta!',
    originalUrl: 'URL Original',
    shortenedUrl: 'URL Encurtada',
    copy: 'Copiar',
    qrCode: 'Código QR',
    download: 'Baixar',
    
    // Features
    instant: 'Instantâneo',
    instantDesc: 'Obtenha sua URL encurtada em segundos',
    noExpiry: 'Sem Expiração',
    noExpiryDesc: 'Seus links funcionam para sempre',
    noSignup: 'Sem Cadastro',
    noSignupDesc: 'Comece a encurtar imediatamente',
    
    // Promotional section
    wantMoreTitle: 'Quer mais do seu encurtador de links?',
    wantMoreDescription: 'Acompanhe análises de links, use domínios personalizados para links totalmente customizados e gerencie seus links com nossos planos pagos.',
    viewPlans: 'Ver Planos',
    createFreeAccount: 'Criar Conta Gratuita',
    plansInclude: 'Os planos do Minify-URL.com incluem:',
    detailedAnalytics: 'Análises Detalhadas de Links',
    bulkShortUrls: 'URLs Encurtadas em Massa',
    brandedDomains: 'Domínios Totalmente Personalizados',
    linkManagement: 'Recursos de Gerenciamento de Links',
    
    // Auth
    welcomeTo: 'Bem-vindo ao Minify-URL.com',
    signInDesc: 'Entre em sua conta ou crie uma nova',
    
    // Toasts
    pleaseEnterUrl: 'Por favor, digite uma URL',
    enterValidUrl: 'Digite uma URL válida para encurtar',
    invalidUrl: 'URL inválida',
    pleaseEnterValidUrl: 'Por favor, digite uma URL válida',
    invalidCustomEnding: 'Terminação personalizada inválida',
    onlyAlphanumeric: 'Apenas letras, números e hífens são permitidos',
    customEndingUnavailable: 'Terminação personalizada indisponível',
    customEndingTaken: 'Esta terminação personalizada já está em uso. Tente outra.',
    urlShortenedSuccess: 'URL encurtada com sucesso!',
    urlSavedToDashboard: 'URL salva no seu painel',
    signInToSave: 'Entre para salvar e gerenciar suas URLs',
    copiedToClipboard: 'Copiado para a área de transferência!',
    shortenedUrlCopied: 'A URL encurtada foi copiada',
    failedToCopy: 'Falha ao copiar',
    copyManually: 'Por favor, copie a URL manualmente',
    qrDownloaded: 'Código QR baixado!',
    qrSavedToDownloads: 'O código QR foi salvo na pasta de downloads',
    error: 'Erro',
    failedToShortenUrl: 'Falha ao encurtar URL',
    
    // Subscription
    plans: 'Planos',
    findPlanTitle: 'Encontre um plano que atenda às suas necessidades',
    billingCycle: 'Ciclo de cobrança',
    monthly: 'Mensal',
    annual: 'Anual',
    mostPopular: 'Mais Popular',
    links: 'Links',
    unlimitedClicksTrackable: 'Cliques Rastreáveis Ilimitados',
    trackClicks: 'Rastreie até {{count}} Cliques',
    signUp: 'Assinar',
    contactUs: 'Contate-nos',
    custom: 'Personalizado',
    perMonth: '/ mês *',
    perYear: '/ ano',
    linkAnalytics: 'Análise de Links',
    advancedLinkManagement: 'Gerenciamento Avançado de Links',
    shortenUrlsBrandedDomains: 'Encurte URLs Usando Domínios Personalizados',
    linkEditingDeletion: 'Edição e Exclusão de Links',
    customLinkExpiration: 'Datas de Expiração de Links Personalizadas',
    proDescription: 'Obtenha acesso completo aos nossos recursos Pro, incluindo:',
    proAdditionalInfo: 'Aproveite 500 links com cliques ilimitados e rastreie até 9.5K cliques em 9.5K links adicionais.',
    bulkDescription: 'Nosso plano em massa para usuários que precisam gerar muitos links de marca de curto prazo para apoiar seu marketing ou operações.',
    bulkAdditionalInfo: 'Aproveite todos os recursos Pro, expiração de link padrão de 90 dias e rastreie até 100K cliques em 100K links de marca curtos.',
    enterpriseDescription: 'Precisa de um limite maior, suporte dedicado ao cliente, soluções personalizadas ou requisitos específicos de conformidade?',
    enterpriseAdditionalInfo: 'Oferecemos planos sob medida para empresas que precisam de mais do que nossos planos regulares podem oferecer. Converse com nossos especialistas para começar com um plano empresarial.',
    needHelpChoosing: 'Precisa de ajuda para escolher um plano?',
    needHelpDescription: 'Não tem certeza de qual plano é o certo para você? Nossa equipe está aqui para ajudá-lo a encontrar a solução perfeita para suas necessidades.',
    contactSupport: 'Contatar Suporte'
  },
  es: {
    // Navigation
    dashboard: 'Panel',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    
    // URL Shortener
    lightning: 'Acortamiento de URL ultrarrápido',
    shortenAnyUrl: 'Acorta Cualquier URL',
    description: 'Transforma URLs largas y complejas en enlaces cortos y compartibles al instante. No se requiere registro, los enlaces nunca expiran.',
    enterUrl: 'Ingresa tu URL larga aquí...',
    shorten: 'Acortar',
    customEnding: 'Terminación personalizada (opcional):',
    customName: 'nombre-personalizado',
    
    // Results
    urlReady: '¡Tu URL acortada está lista!',
    originalUrl: 'URL Original',
    shortenedUrl: 'URL Acortada',
    copy: 'Copiar',
    qrCode: 'Código QR',
    download: 'Descargar',
    
    // Features
    instant: 'Instantáneo',
    instantDesc: 'Obtén tu URL acortada en segundos',
    noExpiry: 'Sin Expiración',
    noExpiryDesc: 'Tus enlaces funcionan para siempre',
    noSignup: 'Sin Registro',
    noSignupDesc: 'Comienza a acortar inmediatamente',
    
    // Promotional section
    wantMoreTitle: '¿Quieres más de tu acortador de enlaces?',
    wantMoreDescription: 'Rastrea análisis de enlaces, usa dominios personalizados para enlaces totalmente customizados y gestiona tus enlaces con nuestros planes de pago.',
    viewPlans: 'Ver Planes',
    createFreeAccount: 'Crear Cuenta Gratuita',
    plansInclude: 'Los planes de Minify-URL.com incluyen:',
    detailedAnalytics: 'Análisis Detallados de Enlaces',
    bulkShortUrls: 'URLs Acortadas en Masa',
    brandedDomains: 'Dominios Totalmente Personalizados',
    linkManagement: 'Funciones de Gestión de Enlaces',
    
    // Auth
    welcomeTo: 'Bienvenido a Minify-URL.com',
    signInDesc: 'Inicia sesión en tu cuenta o crea una nueva',
    
    // Toasts
    pleaseEnterUrl: 'Por favor, ingresa una URL',
    enterValidUrl: 'Ingresa una URL válida para acortar',
    invalidUrl: 'URL inválida',
    pleaseEnterValidUrl: 'Por favor, ingresa una URL válida',
    invalidCustomEnding: 'Terminación personalizada inválida',
    onlyAlphanumeric: 'Solo se permiten letras, números y guiones',
    customEndingUnavailable: 'Terminación personalizada no disponible',
    customEndingTaken: 'Esta terminación personalizada ya está tomada. Prueba con otra.',
    urlShortenedSuccess: '¡URL acortada exitosamente!',
    urlSavedToDashboard: 'URL guardada en tu panel',
    signInToSave: 'Inicia sesión para guardar y gestionar tus URLs',
    copiedToClipboard: '¡Copiado al portapapeles!',
    shortenedUrlCopied: 'La URL acortada ha sido copiada',
    failedToCopy: 'Error al copiar',
    copyManually: 'Por favor, copia la URL manualmente',
    qrDownloaded: '¡Código QR descargado!',
    qrSavedToDownloads: 'El código QR se ha guardado en tus descargas',
    error: 'Error',
    failedToShortenUrl: 'Error al acortar URL',
    
    // Subscription
    plans: 'Planes',
    findPlanTitle: 'Encuentra un plan que se adapte a tus necesidades',
    billingCycle: 'Ciclo de facturación',
    monthly: 'Mensual',
    annual: 'Anual',
    mostPopular: 'Más Popular',
    links: 'Enlaces',
    unlimitedClicksTrackable: 'Clics Rastreables Ilimitados',
    trackClicks: 'Rastrea hasta {{count}} Clics',
    signUp: 'Registrarse',
    contactUs: 'Contáctanos',
    custom: 'Personalizado',
    perMonth: '/ mes *',
    perYear: '/ año',
    linkAnalytics: 'Análisis de Enlaces',
    advancedLinkManagement: 'Gestión Avanzada de Enlaces',
    shortenUrlsBrandedDomains: 'Acorta URLs Usando Dominios de Marca',
    linkEditingDeletion: 'Edición y Eliminación de Enlaces',
    customLinkExpiration: 'Fechas de Expiración de Enlaces Personalizadas',
    proDescription: 'Obtén acceso completo a nuestras funciones Pro incluyendo:',
    proAdditionalInfo: 'Disfruta de 500 enlaces con clics ilimitados y rastrea hasta 9.5K clics en 9.5K enlaces adicionales.',
    bulkDescription: 'Nuestro plan masivo para usuarios que necesitan generar muchos enlaces de marca a corto plazo para apoyar su marketing u operaciones.',
    bulkAdditionalInfo: 'Disfruta de todas las funciones Pro, expiración de enlaces predeterminada de 90 días, y rastrea hasta 100K clics en 100K enlaces cortos de marca.',
    enterpriseDescription: '¿Necesitas un límite mayor, soporte dedicado al cliente, soluciones personalizadas o requisitos específicos de cumplimiento?',
    enterpriseAdditionalInfo: 'Ofrecemos planes hechos a medida para empresas que necesitan más de lo que nuestros planes regulares pueden ofrecer. Habla con nuestros expertos para comenzar con un plan empresarial.',
    needHelpChoosing: '¿Necesitas ayuda para elegir un plan?',
    needHelpDescription: '¿No estás seguro de qué plan es el adecuado para ti? Nuestro equipo está aquí para ayudarte a encontrar la solución perfecta para tus necesidades.',
    contactSupport: 'Contactar Soporte'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    
    // URL Shortener
    lightning: 'Raccourcissement d\'URL ultra-rapide',
    shortenAnyUrl: 'Raccourcir n\'importe quelle URL',
    description: 'Transformez des URLs longues et complexes en liens courts et partageables instantanément. Aucune inscription requise, les liens n\'expirent jamais.',
    enterUrl: 'Entrez votre URL longue ici...',
    shorten: 'Raccourcir',
    customEnding: 'Terminaison personnalisée (optionnel) :',
    customName: 'nom-personnalise',
    
    // Results
    urlReady: 'Votre URL raccourcie est prête !',
    originalUrl: 'URL Originale',
    shortenedUrl: 'URL Raccourcie',
    copy: 'Copier',
    qrCode: 'Code QR',
    download: 'Télécharger',
    
    // Features
    instant: 'Instantané',
    instantDesc: 'Obtenez votre URL raccourcie en secondes',
    noExpiry: 'Sans Expiration',
    noExpiryDesc: 'Vos liens fonctionnent pour toujours',
    noSignup: 'Sans Inscription',
    noSignupDesc: 'Commencez à raccourcir immédiatement',
    
    // Promotional section
    wantMoreTitle: 'Vous voulez plus de votre raccourcisseur de liens ?',
    wantMoreDescription: 'Suivez les analyses de liens, utilisez des domaines personnalisés pour des liens entièrement personnalisés et gérez vos liens avec nos plans payants.',
    viewPlans: 'Voir les Plans',
    createFreeAccount: 'Créer un Compte Gratuit',
    plansInclude: 'Les plans Minify-URL.com incluent :',
    detailedAnalytics: 'Analyses Détaillées de Liens',
    bulkShortUrls: 'URLs Raccourcies en Masse',
    brandedDomains: 'Domaines Entièrement Personnalisés',
    linkManagement: 'Fonctionnalités de Gestion de Liens',
    
    // Auth
    welcomeTo: 'Bienvenue sur Minify-URL.com',
    signInDesc: 'Connectez-vous à votre compte ou créez-en un nouveau',
    
    // Toasts
    pleaseEnterUrl: 'Veuillez entrer une URL',
    enterValidUrl: 'Entrez une URL valide à raccourcir',
    invalidUrl: 'URL invalide',
    pleaseEnterValidUrl: 'Veuillez entrer une URL valide',
    invalidCustomEnding: 'Terminaison personnalisée invalide',
    onlyAlphanumeric: 'Seules les lettres, chiffres et traits d\'union sont autorisés',
    customEndingUnavailable: 'Terminaison personnalisée indisponible',
    customEndingTaken: 'Cette terminaison personnalisée est déjà prise. Veuillez en essayer une autre.',
    urlShortenedSuccess: 'URL raccourcie avec succès !',
    urlSavedToDashboard: 'URL sauvegardée dans votre tableau de bord',
    signInToSave: 'Connectez-vous pour sauvegarder et gérer vos URLs',
    copiedToClipboard: 'Copié dans le presse-papiers !',
    shortenedUrlCopied: 'L\'URL raccourcie a été copiée',
    failedToCopy: 'Échec de la copie',
    copyManually: 'Veuillez copier l\'URL manuellement',
    qrDownloaded: 'Code QR téléchargé !',
    qrSavedToDownloads: 'Le code QR a été sauvegardé dans vos téléchargements',
    error: 'Erreur',
    failedToShortenUrl: 'Échec du raccourcissement de l\'URL',
    
    // Subscription
    plans: 'Plans',
    findPlanTitle: 'Trouvez un plan qui répond à vos besoins',
    billingCycle: 'Cycle de facturation',
    monthly: 'Mensuel',
    annual: 'Annuel',
    mostPopular: 'Le Plus Populaire',
    links: 'Liens',
    unlimitedClicksTrackable: 'Clics Traçables Illimités',
    trackClicks: 'Suivez jusqu\'à {{count}} Clics',
    signUp: 'S\'inscrire',
    contactUs: 'Nous Contacter',
    custom: 'Personnalisé',
    perMonth: '/ mois *',
    perYear: '/ an',
    linkAnalytics: 'Analyses de Liens',
    advancedLinkManagement: 'Gestion Avancée de Liens',
    shortenUrlsBrandedDomains: 'Raccourcir les URLs avec des Domaines de Marque',
    linkEditingDeletion: 'Édition et Suppression de Liens',
    customLinkExpiration: 'Dates d\'Expiration de Liens Personnalisées',
    proDescription: 'Obtenez un accès complet à nos fonctionnalités Pro incluant :',
    proAdditionalInfo: 'Profitez de 500 liens avec des clics illimités et suivez jusqu\'à 9.5K clics sur 9.5K liens supplémentaires.',
    bulkDescription: 'Notre plan en masse pour les utilisateurs qui ont besoin de générer beaucoup de liens de marque à court terme pour soutenir leur marketing ou leurs opérations.',
    bulkAdditionalInfo: 'Profitez de toutes les fonctionnalités Pro, expiration de lien par défaut de 90 jours, et suivez jusqu\'à 100K clics sur 100K liens courts de marque.',
    enterpriseDescription: 'Besoin d\'une limite plus élevée, d\'un support client dédié, de solutions personnalisées ou d\'exigences de conformité spécifiques ?',
    enterpriseAdditionalInfo: 'Nous offrons des plans sur mesure pour les entreprises qui ont besoin de plus que ce que nos plans réguliers peuvent offrir. Discutez avec nos experts pour commencer avec un plan entreprise.',
    needHelpChoosing: 'Besoin d\'aide pour choisir un plan ?',
    needHelpDescription: 'Vous n\'êtes pas sûr de quel plan vous convient ? Notre équipe est là pour vous aider à trouver la solution parfaite pour vos besoins.',
    contactSupport: 'Contacter le Support'
  },
  de: {
    // Navigation
    dashboard: 'Dashboard',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    
    // URL Shortener
    lightning: 'Blitzschnelle URL-Verkürzung',
    shortenAnyUrl: 'Jede URL kürzen',
    description: 'Verwandeln Sie lange, komplexe URLs sofort in kurze, teilbare Links. Keine Anmeldung erforderlich, Links laufen nie ab.',
    enterUrl: 'Geben Sie hier Ihre lange URL ein...',
    shorten: 'Kürzen',
    customEnding: 'Benutzerdefiniertes Ende (optional):',
    customName: 'benutzerdefinierter-name',
    
    // Results
    urlReady: 'Ihre gekürzte URL ist bereit!',
    originalUrl: 'Ursprüngliche URL',
    shortenedUrl: 'Gekürzte URL',
    copy: 'Kopieren',
    qrCode: 'QR-Code',
    download: 'Herunterladen',
    
    // Features
    instant: 'Sofort',
    instantDesc: 'Erhalten Sie Ihre gekürzte URL in Sekunden',
    noExpiry: 'Läuft nie ab',
    noExpiryDesc: 'Ihre Links funktionieren für immer',
    noSignup: 'Keine Anmeldung',
    noSignupDesc: 'Sofort mit dem Kürzen beginnen',
    
    // Promotional section
    wantMoreTitle: 'Wollen Sie mehr aus Ihrem Link-Verkürzer herausholen?',
    wantMoreDescription: 'Verfolgen Sie Link-Analysen, verwenden Sie gebrandete Domains für vollständig angepasste Links und verwalten Sie Ihre Links mit unseren kostenpflichtigen Plänen.',
    viewPlans: 'Pläne Anzeigen',
    createFreeAccount: 'Kostenloses Konto Erstellen',
    plansInclude: 'Minify-URL.com Pläne umfassen:',
    detailedAnalytics: 'Detaillierte Link-Analysen',
    bulkShortUrls: 'Massen-URL-Verkürzung',
    brandedDomains: 'Vollständig Gebrandete Domains',
    linkManagement: 'Link-Management-Funktionen',
    
    // Auth
    welcomeTo: 'Willkommen bei Minify-URL.com',
    signInDesc: 'Melden Sie sich in Ihrem Konto an oder erstellen Sie ein neues',
    
    // Toasts
    pleaseEnterUrl: 'Bitte geben Sie eine URL ein',
    enterValidUrl: 'Geben Sie eine gültige URL zum Kürzen ein',
    invalidUrl: 'Ungültige URL',
    pleaseEnterValidUrl: 'Bitte geben Sie eine gültige URL ein',
    invalidCustomEnding: 'Ungültiges benutzerdefiniertes Ende',
    onlyAlphanumeric: 'Nur Buchstaben, Zahlen und Bindestriche sind erlaubt',
    customEndingUnavailable: 'Benutzerdefiniertes Ende nicht verfügbar',
    customEndingTaken: 'Dieses benutzerdefinierte Ende ist bereits vergeben. Bitte versuchen Sie ein anderes.',
    urlShortenedSuccess: 'URL erfolgreich gekürzt!',
    urlSavedToDashboard: 'URL in Ihrem Dashboard gespeichert',
    signInToSave: 'Melden Sie sich an, um Ihre URLs zu speichern und zu verwalten',
    copiedToClipboard: 'In Zwischenablage kopiert!',
    shortenedUrlCopied: 'Die gekürzte URL wurde kopiert',
    failedToCopy: 'Kopieren fehlgeschlagen',
    copyManually: 'Bitte kopieren Sie die URL manuell',
    qrDownloaded: 'QR-Code heruntergeladen!',
    qrSavedToDownloads: 'Der QR-Code wurde in Ihren Downloads gespeichert',
    error: 'Fehler',
    failedToShortenUrl: 'URL-Verkürzung fehlgeschlagen',
    
    // Subscription
    plans: 'Pläne',
    findPlanTitle: 'Finden Sie einen Plan, der Ihren Bedürfnissen entspricht',
    billingCycle: 'Abrechnungszyklus',
    monthly: 'Monatlich',
    annual: 'Jährlich',
    mostPopular: 'Am Beliebtesten',
    links: 'Links',
    unlimitedClicksTrackable: 'Unbegrenzte Verfolgbare Klicks',
    trackClicks: 'Verfolgen Sie bis zu {{count}} Klicks',
    signUp: 'Anmelden',
    contactUs: 'Kontaktieren Sie uns',
    custom: 'Benutzerdefiniert',
    perMonth: '/ Mon *',
    perYear: '/ Jahr',
    linkAnalytics: 'Link-Analysen',
    advancedLinkManagement: 'Erweiterte Link-Verwaltung',
    shortenUrlsBrandedDomains: 'URLs mit gebrandeten Domains kürzen',
    linkEditingDeletion: 'Link-Bearbeitung & Löschung',
    customLinkExpiration: 'Benutzerdefinierte Link-Ablaufdaten',
    proDescription: 'Erhalten Sie vollen Zugang zu unseren Pro-Funktionen einschließlich:',
    proAdditionalInfo: 'Genießen Sie 500 Links mit unbegrenzten Klicks und verfolgen Sie bis zu 9.5K Klicks auf 9.5K zusätzlichen Links.',
    bulkDescription: 'Unser Massenplan für Nutzer, die viele kurzfristige, gebrandete Links zur Unterstützung ihres Marketings oder ihrer Operationen generieren müssen.',
    bulkAdditionalInfo: 'Genießen Sie alle Pro-Funktionen, 90-Tage Standard-Link-Ablauf und verfolgen Sie bis zu 100K Klicks auf 100K gebrandeten kurzen Links.',
    enterpriseDescription: 'Benötigen Sie ein höheres Limit, dedizierten Kundensupport, individuelle Lösungen oder spezifische Compliance-Anforderungen?',
    enterpriseAdditionalInfo: 'Wir bieten maßgeschneiderte Pläne für Unternehmen, die mehr benötigen, als unsere regulären Pläne bieten können. Sprechen Sie mit unseren Experten, um mit einem Enterprise-Plan zu beginnen.',
    needHelpChoosing: 'Benötigen Sie Hilfe bei der Auswahl eines Plans?',
    needHelpDescription: 'Sind Sie sich nicht sicher, welcher Plan der richtige für Sie ist? Unser Team ist hier, um Ihnen zu helfen, die perfekte Lösung für Ihre Bedürfnisse zu finden.',
    contactSupport: 'Support kontaktieren'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL parameter first
    const urlLang = searchParams.get('lang') as Language;
    if (urlLang && Object.keys(languages).includes(urlLang)) {
      return urlLang;
    }
    
    // Check localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && Object.keys(languages).includes(savedLang)) {
      return savedLang;
    }
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (Object.keys(languages).includes(browserLang)) {
      return browserLang;
    }
    
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update URL parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('lang', lang);
    setSearchParams(newSearchParams);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Update language when URL parameter changes
  useEffect(() => {
    const urlLang = searchParams.get('lang') as Language;
    if (urlLang && Object.keys(languages).includes(urlLang) && urlLang !== language) {
      setLanguageState(urlLang);
      localStorage.setItem('language', urlLang);
    }
  }, [searchParams, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
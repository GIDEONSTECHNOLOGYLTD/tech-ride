import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';

// Translations for multiple Nigerian languages
const resources = {
  en: {
    translation: {
      // Common
      'welcome': 'Welcome to TechRide',
      'ride_requested': 'Ride requested successfully',
      'driver_found': 'Driver found',
      'ride_completed': 'Ride completed',
      'payment_successful': 'Payment successful',
      
      // Referral
      'referral_bonus': 'You earned ₦{{amount}} referral bonus!',
      'new_referral': '{{name}} joined using your referral code',
      
      // Notifications
      'driver_arriving': 'Your driver is arriving',
      'ride_started': 'Your ride has started',
      'promo_applied': 'Promo code applied successfully',
    }
  },
  yo: { // Yoruba
    translation: {
      'welcome': 'Ẹ káàbọ̀ sí TechRide',
      'ride_requested': 'A ti bèrè ìrìnàjò rẹ',
      'driver_found': 'A ti rí awakọ̀',
      'ride_completed': 'Ìrìnàjò ti parí',
      'payment_successful': 'Ìsanwó ti yọrí sí',
      'driver_arriving': 'Awakọ̀ rẹ ń bọ̀',
      'ride_started': 'Ìrìnàjò rẹ ti bẹ̀rẹ̀',
    }
  },
  ig: { // Igbo
    translation: {
      'welcome': 'Nnọọ na TechRide',
      'ride_requested': 'E nyere njem gị',
      'driver_found': 'Achọtala ọkwọ ụgbọala',
      'ride_completed': 'Njem agwụla',
      'payment_successful': 'Ịkwụ ụgwọ gara nke ọma',
      'driver_arriving': 'Ọkwọ ụgbọala gị na-abịa',
      'ride_started': 'Njem gị amalitela',
    }
  },
  ha: { // Hausa
    translation: {
      'welcome': 'Maraba da TechRide',
      'ride_requested': 'An nemi tafiya',
      'driver_found': 'An sami direba',
      'ride_completed': 'Tafiya ta ƙare',
      'payment_successful': 'Biyan kuɗi yayi nasara',
      'driver_arriving': 'Direban ku yana zuwa',
      'ride_started': 'Tafiyar ku ta fara',
    }
  },
  fr: { // French (for neighboring countries)
    translation: {
      'welcome': 'Bienvenue sur TechRide',
      'ride_requested': 'Course demandée avec succès',
      'driver_found': 'Chauffeur trouvé',
      'ride_completed': 'Course terminée',
      'payment_successful': 'Paiement réussi',
      'driver_arriving': 'Votre chauffeur arrive',
      'ride_started': 'Votre course a commencé',
    }
  }
};

i18next.use(i18nextMiddleware.LanguageDetector).init({
  resources,
  fallbackLng: 'en',
  supportedLngs: ['en', 'yo', 'ig', 'ha', 'fr'],
  detection: {
    order: ['header', 'querystring'],
    caches: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;

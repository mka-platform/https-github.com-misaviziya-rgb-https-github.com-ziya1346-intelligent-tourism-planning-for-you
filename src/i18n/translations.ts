// i18n dictionaries. English is the fallback for any unlisted language.
// Implements the Multi-Language First requirement (MOS-0000).

export type TranslationKey =
  | "nav.locations"
  | "nav.about"
  | "nav.contact"
  | "nav.bookNow"
  | "nav.language"
  | "booking.eyebrow"
  | "booking.title"
  | "booking.subtitle"
  | "booking.location"
  | "booking.selectLocation"
  | "booking.guests"
  | "booking.selectGuests"
  | "booking.guest_one"
  | "booking.guest_other"
  | "booking.continue"
  | "booking.dates"
  | "booking.nightsSelected"
  | "booking.calendarSystem"
  | "booking.fullName"
  | "booking.phone"
  | "booking.email"
  | "booking.postcode"
  | "booking.back"
  | "booking.submit"
  | "booking.submitting"
  | "booking.confirmed"
  | "booking.thankYou"
  | "booking.summary"
  | "booking.summaryLocation"
  | "booking.summaryDates"
  | "booking.summaryGuests"
  | "booking.summaryEmail"
  | "booking.confirmationEmail"
  | "booking.bookAnother"
  | "booking.errorStep1"
  | "booking.errorStep2"
  | "calendar.gregorian"
  | "calendar.jalali"
  | "calendar.hijri";

export type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  "nav.locations": "Locations",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.bookNow": "Book Now",
  "nav.language": "Language",
  "booking.eyebrow": "Reservations",
  "booking.title": "Book Your Escape",
  "booking.subtitle": "Choose your dates and let nature work its magic",
  "booking.location": "Location",
  "booking.selectLocation": "Select a location",
  "booking.guests": "Guests",
  "booking.selectGuests": "Select guests",
  "booking.guest_one": "{count} Guest",
  "booking.guest_other": "{count} Guests",
  "booking.continue": "Continue",
  "booking.dates": "Check-in & Check-out",
  "booking.nightsSelected": "{count} nights selected",
  "booking.calendarSystem": "Calendar",
  "booking.fullName": "Full Name",
  "booking.phone": "Phone Number",
  "booking.email": "Email Address",
  "booking.postcode": "Postcode",
  "booking.back": "Back",
  "booking.submit": "Submit Booking",
  "booking.submitting": "Submitting...",
  "booking.confirmed": "Booking Confirmed",
  "booking.thankYou": "Thank you, {name}! Your reservation has been submitted.",
  "booking.summary": "Booking Summary",
  "booking.summaryLocation": "Location:",
  "booking.summaryDates": "Dates:",
  "booking.summaryGuests": "Guests:",
  "booking.summaryEmail": "Email:",
  "booking.confirmationEmail": "A confirmation email will be sent to {email}",
  "booking.bookAnother": "Book Another Stay",
  "booking.errorStep1": "Please fill in all fields including check-in and check-out dates",
  "booking.errorStep2": "Please fill in all contact details",
  "calendar.gregorian": "Gregorian",
  "calendar.jalali": "Jalali",
  "calendar.hijri": "Hijri",
};

const fa: Dictionary = {
  "nav.locations": "مقاصد",
  "nav.about": "درباره ما",
  "nav.contact": "تماس",
  "nav.bookNow": "رزرو کنید",
  "nav.language": "زبان",
  "booking.eyebrow": "رزرو",
  "booking.title": "سفر خود را رزرو کنید",
  "booking.subtitle": "تاریخ سفر را انتخاب کنید و از طبیعت لذت ببرید",
  "booking.location": "مقصد",
  "booking.selectLocation": "یک مقصد انتخاب کنید",
  "booking.guests": "تعداد مهمان",
  "booking.selectGuests": "تعداد مهمان را انتخاب کنید",
  "booking.guest_one": "{count} مهمان",
  "booking.guest_other": "{count} مهمان",
  "booking.continue": "ادامه",
  "booking.dates": "تاریخ ورود و خروج",
  "booking.nightsSelected": "{count} شب انتخاب شد",
  "booking.calendarSystem": "تقویم",
  "booking.fullName": "نام و نام خانوادگی",
  "booking.phone": "شماره تماس",
  "booking.email": "ایمیل",
  "booking.postcode": "کد پستی",
  "booking.back": "بازگشت",
  "booking.submit": "ثبت رزرو",
  "booking.submitting": "در حال ثبت...",
  "booking.confirmed": "رزرو ثبت شد",
  "booking.thankYou": "{name} عزیز، درخواست رزرو شما ثبت شد.",
  "booking.summary": "خلاصه رزرو",
  "booking.summaryLocation": "مقصد:",
  "booking.summaryDates": "تاریخ:",
  "booking.summaryGuests": "مهمان‌ها:",
  "booking.summaryEmail": "ایمیل:",
  "booking.confirmationEmail": "ایمیل تأیید به {email} ارسال خواهد شد",
  "booking.bookAnother": "رزرو جدید",
  "booking.errorStep1": "لطفاً همه فیلدها شامل تاریخ ورود و خروج را تکمیل کنید",
  "booking.errorStep2": "لطفاً اطلاعات تماس را کامل کنید",
  "calendar.gregorian": "میلادی",
  "calendar.jalali": "شمسی",
  "calendar.hijri": "قمری",
};

const ar: Dictionary = {
  ...en,
  "nav.locations": "الوجهات",
  "nav.about": "من نحن",
  "nav.contact": "اتصل بنا",
  "nav.bookNow": "احجز الآن",
  "nav.language": "اللغة",
  "booking.eyebrow": "الحجوزات",
  "booking.title": "احجز رحلتك",
  "booking.subtitle": "اختر التواريخ ودع الطبيعة تفعل سحرها",
  "booking.location": "الوجهة",
  "booking.selectLocation": "اختر وجهة",
  "booking.guests": "الضيوف",
  "booking.selectGuests": "اختر عدد الضيوف",
  "booking.guest_one": "{count} ضيف",
  "booking.guest_other": "{count} ضيوف",
  "booking.continue": "متابعة",
  "booking.dates": "الوصول والمغادرة",
  "booking.nightsSelected": "تم اختيار {count} ليالٍ",
  "booking.calendarSystem": "التقويم",
  "booking.fullName": "الاسم الكامل",
  "booking.phone": "رقم الهاتف",
  "booking.email": "البريد الإلكتروني",
  "booking.postcode": "الرمز البريدي",
  "booking.back": "رجوع",
  "booking.submit": "إرسال الحجز",
  "booking.submitting": "جارٍ الإرسال...",
  "booking.confirmed": "تم تأكيد الحجز",
  "booking.thankYou": "شكرًا {name}! تم إرسال حجزك.",
  "booking.summary": "ملخص الحجز",
  "calendar.gregorian": "ميلادي",
  "calendar.jalali": "شمسي",
  "calendar.hijri": "هجري",
};

const tr: Dictionary = {
  ...en,
  "nav.locations": "Lokasyonlar",
  "nav.about": "Hakkımızda",
  "nav.contact": "İletişim",
  "nav.bookNow": "Rezervasyon",
  "booking.title": "Kaçamağınızı Rezerve Edin",
  "booking.location": "Lokasyon",
  "booking.guests": "Misafirler",
  "booking.continue": "Devam",
  "booking.submit": "Rezervasyonu Gönder",
  "booking.confirmed": "Rezervasyon Onaylandı",
  "calendar.gregorian": "Miladi",
  "calendar.jalali": "Celali",
  "calendar.hijri": "Hicri",
};

const fr: Dictionary = {
  ...en,
  "nav.locations": "Destinations",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.bookNow": "Réserver",
  "booking.title": "Réservez votre évasion",
  "booking.location": "Destination",
  "booking.guests": "Voyageurs",
  "booking.continue": "Continuer",
  "booking.submit": "Envoyer la réservation",
  "booking.confirmed": "Réservation confirmée",
  "calendar.gregorian": "Grégorien",
  "calendar.jalali": "Persan",
  "calendar.hijri": "Hégirien",
};

const es: Dictionary = {
  ...en,
  "nav.locations": "Destinos",
  "nav.about": "Nosotros",
  "nav.contact": "Contacto",
  "nav.bookNow": "Reservar",
  "booking.title": "Reserva tu escapada",
  "booking.location": "Destino",
  "booking.guests": "Huéspedes",
  "booking.continue": "Continuar",
  "booking.submit": "Enviar reserva",
  "booking.confirmed": "Reserva confirmada",
};

const de: Dictionary = {
  ...en,
  "nav.locations": "Orte",
  "nav.about": "Über uns",
  "nav.contact": "Kontakt",
  "nav.bookNow": "Buchen",
  "booking.title": "Buchen Sie Ihre Auszeit",
  "booking.location": "Ort",
  "booking.guests": "Gäste",
  "booking.continue": "Weiter",
  "booking.submit": "Buchung senden",
  "booking.confirmed": "Buchung bestätigt",
};

const ru: Dictionary = {
  ...en,
  "nav.locations": "Направления",
  "nav.about": "О нас",
  "nav.contact": "Контакты",
  "nav.bookNow": "Забронировать",
  "booking.title": "Забронируйте отдых",
  "booking.location": "Направление",
  "booking.guests": "Гости",
  "booking.continue": "Далее",
  "booking.submit": "Отправить бронь",
  "booking.confirmed": "Бронирование подтверждено",
};

const zh: Dictionary = {
  ...en,
  "nav.locations": "目的地",
  "nav.about": "关于我们",
  "nav.contact": "联系我们",
  "nav.bookNow": "立即预订",
  "booking.title": "预订您的旅程",
  "booking.location": "目的地",
  "booking.guests": "入住人数",
  "booking.continue": "继续",
  "booking.submit": "提交预订",
  "booking.confirmed": "预订成功",
};

export const RTL_LANGUAGES = ["fa", "ar", "he", "ur", "ps", "ckb", "dv", "yi"] as const;

export const dictionaries: Record<string, Dictionary> = {
  en,
  fa,
  ar,
  tr,
  fr,
  es,
  de,
  ru,
  zh,
};

/** Languages offered in the switcher. Any other BCP-47 tag still works via fallback. */
export const SUPPORTED_LANGUAGES = Object.keys(dictionaries);

export const DEFAULT_LANGUAGE = "en";

export const getDictionary = (language: string): Dictionary =>
  dictionaries[language] ?? dictionaries[language.split("-")[0]] ?? en;

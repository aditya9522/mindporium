import { useThemeStore } from '../store/theme.store';
import { translations } from '../locales/translations';
import type { Language, TranslationKey } from '../locales/translations';

export const useTranslation = () => {
    const { language } = useThemeStore();

    const t = (key: TranslationKey): string => {
        const langCode = (language || 'en') as Language;
        const dict = translations[langCode] || translations['en'];
        return dict[key] || key;
    };

    return { t, language };
};

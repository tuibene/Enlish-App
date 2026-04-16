import { useAuth } from './useAuth';
import { en } from '../locales/en';
import { vi } from '../locales/vi';

export const useTranslation = () => {
    const { user } = useAuth();

    const locale = user?.language === 'vi' ? 'vi' : 'en';
    const t = locale === 'vi' ? vi : en;

    return { t, locale };
};

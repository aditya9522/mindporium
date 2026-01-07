export const translations = {
    en: {
        'common.save': 'Save Changes',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.loading': 'Loading...',

        'nav.dashboard': 'Dashboard',
        'nav.courses': 'Courses',
        'nav.instructors': 'Instructors',
        'nav.community': 'Community',
        'nav.news': 'News',
        'nav.ai_assistant': 'AI Assistant',
        'nav.users': 'Users',
        'nav.announcements': 'Announcements',
        'nav.system': 'System',
        'nav.feedback': 'Feedback',
        'nav.tests': 'Tests',
        'nav.classrooms': 'Classrooms',
        'nav.attendance': 'Attendance',
        'nav.analytics': 'Analytics',
        'nav.my_profile': 'My Profile',
        'nav.my_learning': 'My Learning',
        'nav.notifications': 'Notifications',
        'nav.settings': 'Settings',

        'settings.title': 'System Settings',
        'settings.subtitle': 'Configure platform-wide settings, appearance, and feature flags.',
        'settings.tabs.general': 'General',
        'settings.tabs.appearance': 'Appearance',
        'settings.tabs.localization': 'Localization',
        'settings.tabs.advanced': 'Advanced',

        'settings.general.app_name': 'Application Name',
        'settings.general.app_icon': 'Application Icon',
        'settings.general.maintenance': 'Maintenance Mode',
        'settings.general.registration': 'Allow Registration',

        'settings.appearance.mode': 'Display Mode',
        'settings.appearance.theme': 'Theme Color',

        'settings.localization.language': 'Default Language',
        'settings.localization.timezone': 'Timezone',
    },
    es: {
        'common.save': 'Guardar Cambios',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.create': 'Crear',
        'common.loading': 'Cargando...',

        'nav.dashboard': 'Panel',
        'nav.courses': 'Cursos',
        'nav.settings': 'Configuración',

        'settings.title': 'Configuración del Sistema',
        'settings.subtitle': 'Configure los ajustes de la plataforma, la apariencia y las funciones.',
        'settings.tabs.general': 'General',
        'settings.tabs.appearance': 'Apariencia',
        'settings.tabs.localization': 'Localización',
        'settings.tabs.advanced': 'Avanzado',

        'settings.general.app_name': 'Nombre de la Aplicación',
        'settings.general.app_icon': 'Icono de la Aplicación',
        'settings.general.maintenance': 'Modo de Mantenimiento',
        'settings.general.registration': 'Permitir Registro',

        'settings.appearance.mode': 'Modo de Visualización',
        'settings.appearance.theme': 'Color del Tema',

        'settings.localization.language': 'Idioma Predeterminado',
        'settings.localization.timezone': 'Zona Horaria',
    },
    fr: {
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'common.edit': 'Éditer',
        'common.create': 'Créer',
        'common.loading': 'Chargement...',

        'nav.dashboard': 'Tableau de bord',
        'nav.courses': 'Cours',
        'nav.settings': 'Paramètres',

        'settings.title': 'Paramètres Système',
        'settings.subtitle': 'Configurer les paramètres de la plateforme, l\'apparence et les fonctionnalités.',
        'settings.tabs.general': 'Général',
        'settings.tabs.appearance': 'Apparence',
        'settings.tabs.localization': 'Localisation',
        'settings.tabs.advanced': 'Avancé',

        'settings.general.app_name': 'Nom de l\'application',
        'settings.general.app_icon': 'Icône de l\'application',
        'settings.general.maintenance': 'Mode Maintenance',
        'settings.general.registration': 'Autoriser l\'inscription',

        'settings.appearance.mode': 'Mode d\'affichage',
        'settings.appearance.theme': 'Couleur du thème',

        'settings.localization.language': 'Langue par défaut',
        'settings.localization.timezone': 'Fuseau horaire',
    }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

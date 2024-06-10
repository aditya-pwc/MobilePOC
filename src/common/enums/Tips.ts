import { t } from '../i18n/t'

export enum LandingTips {
    INITIALIZING_SOUP = 'Initializing Soup',
    GETTING_USER_INFO = 'Getting User Info',
    INITIALIZING_APP_CONFIG = 'Initializing App Config',
    SYNCING_BASE_DATA = 'Syncing Base Data',
    INITIALIZING_SUCCESSFULLY = 'Initializing Successfully'
}

export const getI18nLandingTips = (tip: LandingTips, language?) => {
    let result = ''
    switch (tip) {
        case LandingTips.INITIALIZING_SOUP:
            result = t.labels.PBNA_MOBILE_INITIALIZING_SOUP
            break
        case LandingTips.GETTING_USER_INFO:
            if (language === 'French') {
                result = "Obtenir des informations d'utilisateur"
            } else {
                result = LandingTips.GETTING_USER_INFO
            }
            break
        case LandingTips.INITIALIZING_APP_CONFIG:
            if (language === 'French') {
                result = "Initialisation de la configuration de l'application"
            } else {
                result = LandingTips.INITIALIZING_APP_CONFIG
            }
            break
        case LandingTips.SYNCING_BASE_DATA:
            result = t.labels.SYNCING_BASE_DATA
            break
        case LandingTips.INITIALIZING_SUCCESSFULLY:
            result = t.labels.PBNA_MOBILE_INITIALIZING_SUCCESSFULLY
            break
        default:
    }
    return result
}

/**
 * Picklists and their i18n value in Contact Object.
 */

import { t } from '../t'

const PreferredContactMethod = () => {
    return {
        'Text Primary': t.labels.PBNA_MOBILE_TEXT_PRIMARY,
        'Text Secondary': t.labels.PBNA_MOBILE_TEXT_SECONDARY,
        'Phone Primary': t.labels.PBNA_MOBILE_PHONE_PRIMARY,
        'Phone Secondary': t.labels.PBNA_MOBILE_PHONE_SECONDARY,
        Email: t.labels.PBNA_MOBILE_EMAIL
    }
}

export default {
    PreferredContactMethod
}

import { Persona } from '../../common/enums/Persona'
import { CommonParam } from '../../common/CommonParam'

const config = {
    FsmDashboard: [Persona.FS_MANAGER],
    CrmaDashboard: [Persona.CRM_BUSINESS_ADMIN],
    InnovationDistributionPanel: [Persona.PSR],
    FsrDashboard: [Persona.FSR]
}

type configType = typeof config
type configKeys = keyof configType

export const checkPersonaPermission = (componentName: configKeys) => {
    return !!config[componentName].includes(CommonParam.PERSONA__c)
}

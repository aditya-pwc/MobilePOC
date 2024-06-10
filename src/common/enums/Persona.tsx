/*
 * @Description: Persona Enum
 * @Author: Shangmin Dou
 * @Date: 2021-04-28 06:51:09
 * @LastEditTime: 2023-09-18 13:22:17
 * @LastEditors: Aimee Zhang
 */

import { CommonParam } from '../CommonParam'
import React from 'react'
import MerchManagerNormalIcon from '../../../assets/image/persona-icon/Merch-Manager-Normal.svg'
import MerchManagerSelectIcon from '../../../assets/image/persona-icon/Merch-Manager-Select.svg'
import MerchandiserNormalIcon from '../../../assets/image/persona-icon/Merchandiser-Normal.svg'
import MerchandiserSelectIcon from '../../../assets/image/persona-icon/Merchandiser-Select.svg'
import SDLNormalIcon from '../../../assets/image/persona-icon/SDL-Normal.svg'
import SDLSelectIcon from '../../../assets/image/persona-icon/SDL-Select.svg'
import SalesRepNormalIcon from '../../../assets/image/persona-icon/Sales-Rep-Normal.svg'
import SalesRepSelectIcon from '../../../assets/image/persona-icon/Sales-Rep-Select.svg'
import FSManagerNormalIcon from '../../../assets/image/persona-icon/FS-Manager-Normal.svg'
import FSManagerSelectIcon from '../../../assets/image/persona-icon/FS-Manager-Select.svg'
import FoodServiceRepNormalIcon from '../../../assets/image/persona-icon/Food-Service-Rep-Normal.svg'
import FoodServiceRepSelectIcon from '../../../assets/image/persona-icon/Food-Service-Rep-Select.svg'
import DeliveryManagerNormalIcon from '../../../assets/image/persona-icon/Delivery-Manager-Normal.svg'
import DeliveryManagerSelectIcon from '../../../assets/image/persona-icon/Delivery-Manager-Select.svg'
import DeliveryDriverNormalIcon from '../../../assets/image/persona-icon/Delivery-Driver-Normal.svg'
import DeliveryDriverSelectIcon from '../../../assets/image/persona-icon/Delivery-Driver-Select.svg'
import { t } from '../i18n/t'

export enum Persona {
    FSR = 'FSR',
    PSR = 'PSR',
    FS_MANAGER = 'FS Manager',
    MERCH_MANAGER = 'Merch Manager',
    DELIVERY_SUPERVISOR = 'Delivery Supervisor',
    SALES_DISTRICT_LEADER = 'Sales District Leader',
    MERCHANDISER = 'Merchandiser',
    SYSTEM_ADMINISTRATOR = 'System Administrator',
    DRIVER = 'Driver',
    UNIT_GENERAL_MANAGER = 'UGM',
    CRM_BUSINESS_ADMIN = 'CRM Business Admin',
    KEY_ACCOUNT_MANAGER = 'Key Account Manager'
}

export const getPersonaMap = () => {
    return {
        'Merch Manager': {
            persona: Persona.MERCH_MANAGER,
            title: t.labels.PBNA_MOBILE_MERCH_MANAGER,
            icon: <MerchManagerNormalIcon />,
            selIcon: <MerchManagerSelectIcon />
        },
        UGM: {
            persona: Persona.UNIT_GENERAL_MANAGER,
            title: t.labels.PBNA_MOBILE_MERCH_UNIT_GENERAL_MANAGER,
            icon: <></>,
            selIcon: <></>
        },
        Merchandiser: {
            persona: Persona.MERCHANDISER,
            title: t.labels.PBNA_MOBILE_MERCH_MERCHANDISER,
            icon: <MerchandiserNormalIcon />,
            selIcon: <MerchandiserSelectIcon />
        },
        'Sales District Leader': {
            persona: Persona.SALES_DISTRICT_LEADER,
            title: t.labels.PBNA_MOBILE_MERCH_SALES_DISTRICT_LEAD,
            icon: <SDLNormalIcon />,
            selIcon: <SDLSelectIcon />
        },
        'FS Manager': {
            persona: Persona.FS_MANAGER,
            title: t.labels.PBNA_MOBILE_MERCH_FOOD_SERVICE_MANAGER,
            icon: <FSManagerNormalIcon />,
            selIcon: <FSManagerSelectIcon />
        },
        FSR: {
            persona: Persona.FSR,
            title: t.labels.PBNA_MOBILE_MERCH_FOOD_SERVICE_REPRESENTATIVE,
            icon: <FoodServiceRepNormalIcon />,
            selIcon: <FoodServiceRepSelectIcon />
        },
        PSR: {
            persona: Persona.PSR,
            title: t.labels.PBNA_MOBILE_SALES_REPRESENTATIVE,
            icon: <SalesRepNormalIcon />,
            selIcon: <SalesRepSelectIcon />
        },
        'Delivery Supervisor': {
            persona: Persona.DELIVERY_SUPERVISOR,
            title: t.labels.PBNA_MOBILE_DELIVERY_MANAGER,
            icon: <DeliveryManagerNormalIcon />,
            selIcon: <DeliveryManagerSelectIcon />
        },
        Driver: {
            persona: Persona.DRIVER,
            title: t.labels.PBNA_MOBILE_DELIVERY_DRIVER,
            icon: <DeliveryDriverNormalIcon />,
            selIcon: <DeliveryDriverSelectIcon />
        }
    }
}

export const judgePersona = (personaList: Persona[]) => {
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaManager = () => {
    const managers: string[] = [
        Persona.MERCH_MANAGER,
        Persona.DELIVERY_SUPERVISOR,
        Persona.SALES_DISTRICT_LEADER,
        Persona.UNIT_GENERAL_MANAGER
    ]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaDelSupOrSDL = () => {
    const personaList: string[] = [Persona.DELIVERY_SUPERVISOR, Persona.SALES_DISTRICT_LEADER]
    return personaList.includes(CommonParam.PERSONA__c)
}
export const isPersonaUGMOrSDL = () => {
    const personaList: string[] = [Persona.UNIT_GENERAL_MANAGER, Persona.SALES_DISTRICT_LEADER]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaUGMOrDelSupOrSDL = () => {
    const personaList: string[] = [
        Persona.DELIVERY_SUPERVISOR,
        Persona.SALES_DISTRICT_LEADER,
        Persona.UNIT_GENERAL_MANAGER
    ]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isTabDelSupOrSDL = () => {
    const personaList: string[] = [Persona.DELIVERY_SUPERVISOR, Persona.SALES_DISTRICT_LEADER]
    return personaList.includes(CommonParam.selectedTab)
}

export const isPersonaSDL = () => {
    const personaList: string[] = [Persona.SALES_DISTRICT_LEADER]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaDelSup = () => {
    const personaList: string[] = [Persona.DELIVERY_SUPERVISOR]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaUGM = () => {
    const personaList: string[] = [Persona.UNIT_GENERAL_MANAGER]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isDelSupTab = () => {
    const personaList: string[] = [Persona.DELIVERY_SUPERVISOR]
    return personaList.includes(CommonParam.selectedTab)
}

export const isSDLTab = () => {
    const personaList: string[] = [Persona.SALES_DISTRICT_LEADER]
    return personaList.includes(CommonParam.selectedTab)
}

export const isPersonaMD = () => {
    const personaList: string[] = [Persona.MERCHANDISER]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaMerchManager = () => {
    const managers: string[] = [Persona.MERCH_MANAGER]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaPSRorFSRorSDLorKAM = () => {
    const personaList: string[] = [Persona.SALES_DISTRICT_LEADER, Persona.FSR, Persona.PSR, Persona.KEY_ACCOUNT_MANAGER]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaPSRorSDLorKAM = () => {
    const personaList: string[] = [Persona.SALES_DISTRICT_LEADER, Persona.PSR]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaFSR = () => {
    const managers: string[] = [Persona.FSR]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaPSR = () => {
    const managers: string[] = [Persona.PSR]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaFSManager = () => {
    const managers: string[] = [Persona.FS_MANAGER]
    return managers.includes(CommonParam.PERSONA__c)
}
export const isPersonaPsrOrFsrOrFsManager = () => {
    const personaList: string[] = [Persona.FS_MANAGER, Persona.FSR, Persona.PSR]
    return personaList.includes(CommonParam.PERSONA__c)
}

export const isPersonaCRMBusinessAdmin = () => {
    const managers: string[] = [Persona.CRM_BUSINESS_ADMIN]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaKAM = () => {
    const managers: string[] = [Persona.KEY_ACCOUNT_MANAGER]
    return managers.includes(CommonParam.PERSONA__c)
}

export const isPersonaPSROrKAM = () => {
    return judgePersona([Persona.PSR, Persona.KEY_ACCOUNT_MANAGER])
}

export const isPersonaFSROrFSMOrCRM = () => {
    return judgePersona([Persona.FSR, Persona.FS_MANAGER, Persona.CRM_BUSINESS_ADMIN])
}

export const isPersonaFSROrFSM = () => {
    return judgePersona([Persona.FSR, Persona.FS_MANAGER])
}

export const isPersonaSDLOrPsrOrMDOrKAM = () => {
    return judgePersona([Persona.SALES_DISTRICT_LEADER, Persona.PSR, Persona.MERCHANDISER, Persona.KEY_ACCOUNT_MANAGER])
}

export const isPersonaSDLOrPsrOrMDOrKAMOrUGM = () => {
    return judgePersona([
        Persona.SALES_DISTRICT_LEADER,
        Persona.PSR,
        Persona.MERCHANDISER,
        Persona.KEY_ACCOUNT_MANAGER,
        Persona.UNIT_GENERAL_MANAGER
    ])
}

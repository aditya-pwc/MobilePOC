import React, { FC } from 'react'
import CText from '../../../../../common/components/CText'
import { StyleSheet, View } from 'react-native'
import ExchangeBlue from '../../../../../../assets/image/Exchange-Blue.svg'
import ExchangeWhite from '../../../../../../assets/image/Exchange-White.svg'
import MoveBlue from '../../../../../../assets/image/Move-Blue.svg'
import MoveWhite from '../../../../../../assets/image/Move-White.svg'
import PickupBlue from '../../../../../../assets/image/Pickup-Blue.svg'
import PickupWhite from '../../../../../../assets/image/Pickup-White.svg'
import RepairBlue from '../../../../../../assets/image/Repair-Blue.svg'
import RepairWhite from '../../../../../../assets/image/Repair-White.svg'
import { t } from '../../../../../common/i18n/t'

interface ServiceBadgeProps {
    serviceType: any
}

const styles = StyleSheet.create({
    marginRight_8: {
        marginRight: 8
    },
    iconContainer: {
        paddingHorizontal: 20,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#DCE5EE',
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 1,
        borderRadius: 25,
        shadowRadius: 6,
        flexDirection: 'row'
    },
    activeBackgroundColor: {
        backgroundColor: '#01A2DA'
    },
    inactiveBackgroundColor: {
        backgroundColor: '#FFFFFF'
    },
    typeContainer: {
        fontWeight: '500',
        textTransform: 'uppercase'
    },
    activeColor: {
        color: 'white'
    },
    inactiveColor: {
        color: 'black'
    }
})
const ServiceBadge: FC<ServiceBadgeProps> = (props: ServiceBadgeProps) => {
    const { serviceType } = props

    const renderIcon = () => {
        switch (serviceType.serviceIndex) {
            case 0:
                return serviceType.serviceActive ? <MoveWhite /> : <MoveBlue />
            case 1:
                return serviceType.serviceActive ? <PickupWhite /> : <PickupBlue />
            case 2:
                return serviceType.serviceActive ? <RepairWhite /> : <RepairBlue />
            case 3:
                return serviceType.serviceActive ? <ExchangeWhite /> : <ExchangeBlue />
            default:
                break
        }
    }
    const renderType = () => {
        switch (serviceType.serviceIndex) {
            case 0:
                return t.labels.PBNA_MOBILE_MOVE.toUpperCase()
            case 1:
                return t.labels.PBNA_MOBILE_PICKUP.toUpperCase()
            case 2:
                return t.labels.PBNA_MOBILE_REPAIR.toUpperCase()
            case 3:
                return t.labels.PBNA_MOBILE_EXCHANGE.toUpperCase()
            default:
                break
        }
    }
    return (
        <View
            style={[
                styles.iconContainer,
                serviceType.serviceActive ? styles.activeBackgroundColor : styles.inactiveBackgroundColor
            ]}
        >
            <View style={styles.marginRight_8}>{renderIcon()}</View>
            <CText
                style={[styles.typeContainer, serviceType.serviceActive ? styles.activeColor : styles.inactiveColor]}
            >
                {renderType()}
            </CText>
        </View>
    )
}
export default ServiceBadge

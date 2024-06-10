/**
 * @description Screen to show Customer detail header.
 * @author Shangmin Dou
 * @date 2021-09-27
 */
import React, { FC } from 'react'
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SoupService } from '../../../service/SoupService'
import { CommonActions } from '@react-navigation/native'
import { isPersonaCRMBusinessAdmin } from '../../../../common/enums/Persona'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { useDispatch } from 'react-redux'
import { clearCustomerPOSRequest, clearPepsiDirectOrder } from '../../../redux/action/CustomerActionType'
import { clearCustomerDetail } from '../../../redux/Slice/CustomerDetailSlice'

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        paddingHorizontal: '5%',
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
        paddingBottom: 10
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        height: 30
    },
    activityContainer: {
        marginLeft: 20,
        maxWidth: '65%',
        flexDirection: 'row'
    },
    marginRight_10: {
        marginRight: 10
    },
    companyText: {
        fontSize: 18,
        fontWeight: '900',
        overflow: 'hidden'
    },
    chevron: {
        marginLeft: 4,
        marginTop: 2,
        width: 16,
        height: 16,
        borderTopWidth: 2,
        borderRightWidth: 2,
        transform: [{ rotate: '-135deg' }]
    }
})

const navigateToHome = (navigation) => {
    navigation.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                {
                    name: 'SalesRepTab',
                    params: { isGoBackToCustomer: true }
                }
            ]
        })
    )
}

interface CustomerDetailScreenHeaderProps {
    headerBackgroundColor: any
    headerLeftChevronColor: any
    headerTitleColor: any
    navigation: any
    company: string
    needDelete: boolean
    customerDetail: any
    showLoading: boolean
    isGoBackToCustomer?: any
    onShowDetailScreen?: Function
}

const CustomerDetailScreenHeader: FC<CustomerDetailScreenHeaderProps> = (props: CustomerDetailScreenHeaderProps) => {
    const {
        headerBackgroundColor,
        headerLeftChevronColor,
        headerTitleColor,
        navigation,
        company,
        needDelete,
        customerDetail,
        showLoading,
        onShowDetailScreen
    } = props

    const dispatch = useDispatch()

    return (
        <Animated.View style={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}>
            <SafeAreaView style={commonStyle.fullWidth}>
                <Animated.View style={styles.container}>
                    <TouchableOpacity
                        onPress={async () => {
                            if (needDelete || isPersonaCRMBusinessAdmin()) {
                                global.$globalModal.openModal()
                                try {
                                    await SoupService.removeRecordFromSoup('RetailStore', [customerDetail._soupEntryId])
                                } catch (e) {}
                                global.$globalModal.closeModal()
                            }
                            if (props.isGoBackToCustomer.isGoBack) {
                                navigateToHome(navigation)
                            } else {
                                onShowDetailScreen && onShowDetailScreen()
                                navigation.goBack()
                            }
                            dispatch(clearPepsiDirectOrder())
                            dispatch(clearCustomerDetail())
                            dispatch(clearCustomerPOSRequest())
                        }}
                        hitSlop={{
                            left: 30,
                            right: 30,
                            top: 30,
                            bottom: 30
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.chevron,
                                {
                                    borderTopColor: headerLeftChevronColor,
                                    borderRightColor: headerLeftChevronColor
                                }
                            ]}
                        />
                    </TouchableOpacity>

                    <View style={styles.activityContainer}>
                        {showLoading && <ActivityIndicator style={styles.marginRight_10} />}
                        <Animated.Text
                            allowFontScaling={false}
                            style={[styles.companyText, { color: headerTitleColor }]}
                            numberOfLines={1}
                        >
                            {company}
                        </Animated.Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </Animated.View>
    )
}

export default CustomerDetailScreenHeader

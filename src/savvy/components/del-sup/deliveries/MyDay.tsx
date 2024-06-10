import React, { useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import { CommonParam } from '../../../../common/CommonParam'
import { Persona } from '../../../../common/enums/Persona'
import { t } from '../../../../common/i18n/t'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import NewScheduleList from '../../manager/schedule/NewScheduleList'
import SDLMyDay from '../../sales/my-day/SDLMyDay'
import Deliveries from './Deliveries'
import StarIcon from '../../../../../assets/image/icon_lead_tab_highlight.svg'
import SwipeCollapsible from '../../common/SwipeCollapsible'
interface MyDayPros {
    navigation?: any
    route?: any
}
const { width } = Dimensions.get('window')
const selectedColor = baseStyle.color.tabBlue
const unSelTextColor = baseStyle.color.black
const unSelBolderColor = baseStyle.color.bgGray
const bottomLineHeight = 2
const tabHeight = 44
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    con: {
        width: width,
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    whiteBox: {
        zIndex: 1,
        height: 46,
        backgroundColor: '#fff'
    },
    img: {
        width: 15,
        height: 15,
        marginRight: 5
    },
    contentCon: { flexDirection: 'row', alignItems: 'center' },
    rowCon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 3.0,
        height: tabHeight,
        borderBottomWidth: bottomLineHeight
    },
    text: { fontSize: 12, fontWeight: 'bold' }
})

const MyDay = (props: MyDayPros) => {
    const [selectTab, setSelectTab] = useState(
        CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER ? Persona.SALES_DISTRICT_LEADER : CommonParam.PERSONA__c
    )
    const [isLandscapePage, setIsLandscapePage] = useState(false)
    const SwipeCollapsibleRef: any = useRef()

    const arr = [
        {
            title: t.labels.PBNA_MOBILE_SALES,
            persona: Persona.SALES_DISTRICT_LEADER
        },
        {
            title: t.labels.PBNA_MOBILE_DELIVERY,
            persona: Persona.DELIVERY_SUPERVISOR
        },
        {
            title: t.labels.PBNA_MOBILE_MERCH,
            persona: Persona.MERCH_MANAGER
        }
    ]
    useEffect(() => {
        CommonParam.selectedTab =
            CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER
                ? Persona.SALES_DISTRICT_LEADER
                : CommonParam.PERSONA__c
    }, [])
    const onItemPress = (item) => {
        if (!isLandscapePage) {
            CommonParam.selectedTab = item.persona
            setSelectTab(item.persona)
        }
    }
    useEffect(() => {}, [isLandscapePage])
    return (
        <View style={styles.container}>
            {!isLandscapePage && <View style={styles.whiteBox} />}
            <SwipeCollapsible topToBottom cRef={SwipeCollapsibleRef} height={-42}>
                <View style={[styles.con]}>
                    {arr.map((item) => {
                        const isTabSel = selectTab === item.persona
                        const defaultStar =
                            CommonParam.PERSONA__c === Persona.UNIT_GENERAL_MANAGER
                                ? item.persona === Persona.SALES_DISTRICT_LEADER
                                : item.persona === CommonParam.PERSONA__c
                        return (
                            <TouchableOpacity
                                activeOpacity={1.0}
                                key={item.persona}
                                style={[styles.rowCon, { borderColor: isTabSel ? selectedColor : unSelBolderColor }]}
                                onPress={() => onItemPress(item)}
                            >
                                <View style={styles.contentCon}>
                                    {defaultStar && <StarIcon style={styles.img} width={15} height={15} />}
                                    <CText style={[styles.text, { color: !isTabSel ? selectedColor : unSelTextColor }]}>
                                        {item.title}
                                    </CText>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </SwipeCollapsible>
            {selectTab === Persona.SALES_DISTRICT_LEADER && (
                <SDLMyDay navigation={props.navigation} cRef={SwipeCollapsibleRef} />
            )}
            {selectTab === Persona.DELIVERY_SUPERVISOR && (
                <Deliveries navigation={props.navigation} cRef={SwipeCollapsibleRef} />
            )}
            {selectTab === Persona.MERCH_MANAGER && (
                <NewScheduleList
                    setIsLandscapePage={setIsLandscapePage}
                    navigation={props.navigation}
                    cRef={SwipeCollapsibleRef}
                />
            )}
        </View>
    )
}
export default MyDay

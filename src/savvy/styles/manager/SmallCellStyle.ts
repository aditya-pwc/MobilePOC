import { StyleSheet } from 'react-native'
import { baseStyle } from '../../../common/styles/BaseStyle'
import { commonStyle } from '../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    selectedContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    },
    itemCell: {
        flexDirection: 'row',
        backgroundColor: baseStyle.color.bgGray,
        marginBottom: 10,
        marginRight: 10,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 15
    },
    clearItemContainer: {
        marginLeft: 10
    },
    imgClear: {
        width: 18,
        height: 19
    },
    readonlyShowMoreCell: {
        backgroundColor: baseStyle.color.white,
        borderColor: baseStyle.color.tabBlue,
        borderWidth: 1,
        ...commonStyle.flexRowAlignCenter
    },
    attendeesText: {
        flexShrink: 1
    },
    showMoreText: {
        fontWeight: baseStyle.fontWeight.fw_700,
        color: baseStyle.color.tabBlue
    }
})

export default styles

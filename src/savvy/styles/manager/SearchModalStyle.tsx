import { StyleSheet } from 'react-native'
import { commonStyle } from '../../../common/styles/CommonStyle'
import { baseStyle } from '../../../common/styles/BaseStyle'

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        paddingTop: 60,
        paddingLeft: 22,
        paddingRight: 22,
        backgroundColor: baseStyle.color.white
    },
    topTitle: {
        paddingBottom: 24,
        ...commonStyle.alignCenter
    },
    topTitleText: {
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: 'bold',
        marginTop: 3
    },
    backButton: {
        width: 30,
        height: 30,
        position: 'absolute',
        left: 0,
        top: 0
    },
    backButtonImage: {
        width: 12,
        height: 21
    },
    metrics: {
        marginTop: 20,
        marginBottom: 20
    },
    dataListContainer: {
        flex: 1,
        paddingTop: 22
    },
    paddingVertical_22: {
        paddingVertical: 22
    }
})

export default styles

/**
 * @description In map view show visit sequence and map marks
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-02
 * @lastModifiedDate 2021-04-17
 */

import React, { FC, ReactElement } from 'react'
import { View, StyleSheet, ImageBackground, ImageSourcePropType } from 'react-native'
import CText from '../../../common/components/CText'

const styles = StyleSheet.create({
    sequenceText: {
        width: 16,
        height: 16,
        fontSize: 12,
        color: '#000',
        fontWeight: '700',
        textAlign: 'center'
    },
    sequenceView: {
        position: 'absolute',
        top: -3,
        left: -3,
        backgroundColor: '#FFF',
        borderColor: '#FFF',
        borderWidth: 2,
        borderRadius: 5
    },
    sequenceViewForSVG: {
        position: 'absolute',
        top: -7,
        left: -7,
        backgroundColor: '#FFF',
        borderColor: '#FFF',
        borderWidth: 2,
        borderRadius: 5
    },
    locationImg: {
        width: 40,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

interface CMarkWithSeqProps {
    sequence?: number
    sourceStr?: ImageSourcePropType
    showSequence: boolean
    isSVG: boolean
    ChildrenSVG?: ReactElement
}

const CMarkWithSeq: FC<CMarkWithSeqProps> = (props: CMarkWithSeqProps) => {
    if (props.isSVG) {
        return (
            <View>
                {props.ChildrenSVG}
                {props.showSequence && (
                    <View style={styles.sequenceViewForSVG}>
                        <CText style={styles.sequenceText} adjustsFontSizeToFit>
                            {props.sequence}
                        </CText>
                    </View>
                )}
            </View>
        )
    }
    return (
        <ImageBackground style={styles.locationImg} resizeMode={'contain'} source={props.sourceStr}>
            {props.showSequence && (
                <View style={styles.sequenceView}>
                    <CText style={styles.sequenceText} adjustsFontSizeToFit>
                        {props.sequence}
                    </CText>
                </View>
            )}
        </ImageBackground>
    )
}

export default CMarkWithSeq

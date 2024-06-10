/**
 * @description In order to use custom font family in text, so here it is ctext.
 * @author Hao Xiao
 * @email hao.xiao@pwc.com
 * @date 2021-03-02
 * @lastModifiedDate 2021-04-17
 * @lastModifiedBy Shangmin Dou add a numberOfLines to interface.
 */

import React, { FC } from 'react'
import { Text, TextProps } from 'react-native'

interface CTextProps extends TextProps {
    fontFamily?: string
}

const CText: FC<CTextProps & TextProps> = (props: CTextProps) => {
    const fontFamily = { fontFamily: props.fontFamily ? props.fontFamily : 'Gotham-Book' }
    return (
        <Text
            allowFontScaling={false}
            {...props}
            style={[fontFamily, props.style]}
            adjustsFontSizeToFit={props.adjustsFontSizeToFit}
        >
            {props.children}
        </Text>
    )
}

export default CText

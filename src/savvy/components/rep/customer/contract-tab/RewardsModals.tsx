import React, { RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View, Image, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native'
import SurveyQuestionsStyle from '../../../../styles/manager/SurveyQuestionsStyle'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import FastImage from 'react-native-fast-image'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { TargetsForecastsValueType } from '../../../../enums/Contract'
import { t } from '../../../../../common/i18n/t'
import { VisitStatus } from '../../../../../orderade/enum/VisitType'

export type RewardDetailRefType = RefObject<{
    openModal: (item: RewardData) => void
}>

const styles = StyleSheet.create({
    ...SurveyQuestionsStyle
})

export interface RewardData {
    Id: string
    // eslint-disable-next-line camelcase
    SUBTYPE__c: string
    // SF Field name not match naming convention
    /* eslint-disable camelcase */
    VALUE__c: string | null
    VALUE_TYPE__c: TargetsForecastsValueType | null
    CDA_Admin_Display_Order__c: string | null
    Image_Link__c: string | null
    Rewards_Description__c: string | null
    TARGET_NAME__c: string
    Status__c: string
    /* eslint-enable camelcase */
}

interface RewardsModalInterface {
    rewardDetailRef: any
    visible: boolean
    rewardData: RewardData[]
    selectRewards: { [x: string]: boolean | undefined }
    setSelectRewards: (obj: { [x: string]: boolean | undefined }) => void
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    sharepointToken: string
}

export const handleRewardValue = (item: RewardData) => {
    let text = ''
    if (item.VALUE__c) {
        if (item.VALUE_TYPE__c === TargetsForecastsValueType.FREE_CASES) {
            text = item.VALUE__c + t.labels.PBNA_MOBILE_ORDER_CS.toLocaleLowerCase()
        } else if (item.VALUE_TYPE__c === TargetsForecastsValueType.FUNDING) {
            text = t.labels.PBNA_MOBILE_ORDER_D + item.VALUE__c
        } else {
            text = item.VALUE__c
        }
    }
    return text
}

export const getImageSourceObj = (data: RewardData, sharepointToken: string) =>
    data.Image_Link__c && sharepointToken
        ? {
              uri: encodeURI(data.Image_Link__c),
              headers: { Authorization: `Bearer ${sharepointToken}` },
              cache: FastImage.cacheControl.web
          }
        : undefined // Return undefined if data.Image_Link__c && sharepointToken is null

export const RewardDetailModal = ({
    cRef,
    sharepointToken
}: {
    cRef: RewardDetailRefType
    sharepointToken: string
}) => {
    const [visible, setVisible] = useState(false)
    const [data, setData] = useState<RewardData>()

    useImperativeHandle(cRef, () => ({
        openModal: (item: RewardData) => {
            setVisible(true)
            setData(item)
        }
    }))

    const handleClose = () => setVisible(false)
    if (data) {
        return (
            <>
                <Modal transparent visible={visible}>
                    <View style={commonStyle.transparentModalContainer}>
                        <View style={styles.rewardModalContainer}>
                            <View style={styles.height55}>
                                <CText style={styles.modalNameText}>{data.TARGET_NAME__c?.toLocaleUpperCase()}</CText>
                            </View>
                            <View style={styles.modalImgContainer} />
                            <FastImage
                                resizeMode="contain"
                                style={styles.modalImg}
                                source={getImageSourceObj(data, sharepointToken)}
                            />
                            <View style={styles.modalRequirementRow}>
                                <CText style={styles.modalRequirementText}>{t.labels.PBNA_MOBILE_REQUIREMENTS}</CText>
                                <CText style={styles.modalValue}>{handleRewardValue(data)}</CText>
                            </View>
                            <ScrollView>
                                <CText style={styles.modalDescription}>{data.Rewards_Description__c}</CText>
                            </ScrollView>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                                <CText style={styles.modalCloseBtnText}>
                                    {t.labels.PBNA_MOBILE_CLOSE.toLocaleUpperCase()}
                                </CText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </>
        )
    }
    return null
}
RewardDetailModal.displayName = 'RewardDetailModal'

interface RewardTileProps {
    item: RewardData
    tempSelection: { [x: string]: boolean | undefined }
    setTempSelection: React.Dispatch<React.SetStateAction<{ [x: string]: boolean | undefined }>>
    sharepointToken: string
}
const ListRewardTile: React.FC<RewardTileProps & { rewardDetailRef?: RewardDetailRefType }> = ({
    item,
    rewardDetailRef,
    tempSelection,
    setTempSelection,
    sharepointToken
}) => {
    const openRewardDetail = () => rewardDetailRef?.current?.openModal(item)
    const isShowContinued = item.Status__c !== VisitStatus.PUBLISHED

    return (
        <View key={item.Id} style={styles.listContainer}>
            <FastImage resizeMode="contain" style={styles.listImg} source={getImageSourceObj(item, sharepointToken)} />
            <View style={styles.listNameValueC}>
                <CText style={styles.listNameText}>{item.TARGET_NAME__c}</CText>
                <CText style={styles.listValueText}>{handleRewardValue(item)}</CText>
                <TouchableOpacity onPress={openRewardDetail}>
                    <CText style={styles.blueBoldText12}>
                        {t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS.toLocaleUpperCase()}
                    </CText>
                </TouchableOpacity>
                {isShowContinued && (
                    <View style={styles.listReward}>
                        <CText style={styles.gridRewardText}>{t.labels.PBNA_MOBILE_DISCONTINUED.toUpperCase()}</CText>
                    </View>
                )}
            </View>
            <CCheckBox
                containerStyle={styles.listCheckBox}
                checked={tempSelection[item.TARGET_NAME__c]}
                readonly={isShowContinued && !tempSelection[item.TARGET_NAME__c]}
                disabled={isShowContinued && !tempSelection[item.TARGET_NAME__c]}
                onPress={() =>
                    setTempSelection({ ...tempSelection, [item.TARGET_NAME__c]: !tempSelection[item.TARGET_NAME__c] })
                }
            />
        </View>
    )
}
const GridRewardTile: React.FC<RewardTileProps> = ({ item, tempSelection, setTempSelection, sharepointToken }) => {
    const [expanded, setExpanded] = useState(false)
    const [numberOfLines, setNumberOfLines] = useState(0)
    const isShowContinued = item.Status__c !== VisitStatus.PUBLISHED

    const handleToggle = () => {
        setExpanded(!expanded)
    }

    const handleTextLayout = (event: { nativeEvent: { lines: any } }) => {
        const { lines } = event.nativeEvent
        setNumberOfLines(lines.length)
    }

    return (
        <View key={item.Id} style={styles.gridContainer}>
            <FastImage resizeMode="contain" style={styles.gridImg} source={getImageSourceObj(item, sharepointToken)} />
            <CText style={styles.gridNameText}>{item.TARGET_NAME__c}</CText>
            <CText style={styles.gridValueText}>{handleRewardValue(item)}</CText>
            {isShowContinued && (
                <View style={styles.gridReward}>
                    <CText style={styles.gridRewardText}>{t.labels.PBNA_MOBILE_DISCONTINUED.toUpperCase()}</CText>
                </View>
            )}
            <View style={styles.gridMiddleContainer}>
                <CText style={styles.gridRequirementText}>{t.labels.PBNA_MOBILE_ADDITIONAL_INFORMATION + ':'}</CText>
                <CCheckBox
                    containerStyle={styles.gridCheckBox}
                    checked={tempSelection[item.TARGET_NAME__c]}
                    readonly={isShowContinued && !tempSelection[item.TARGET_NAME__c]}
                    disabled={isShowContinued && !tempSelection[item.TARGET_NAME__c]}
                    onPress={() =>
                        setTempSelection({
                            ...tempSelection,
                            [item.TARGET_NAME__c]: !tempSelection[item.TARGET_NAME__c]
                        })
                    }
                />
            </View>
            <CText style={styles.gridDescriptionText} onTextLayout={handleTextLayout} numberOfLines={expanded ? 0 : 2}>
                {item.Rewards_Description__c}
            </CText>
            {numberOfLines > 1 && (
                <TouchableOpacity onPress={handleToggle}>
                    <CText style={styles.blueBoldText12}>
                        {expanded
                            ? t.labels.PBNA_MOBILE_SHOW_LESS.toLocaleUpperCase()
                            : t.labels.PBNA_MOBILE_SHOW_MORE.toLocaleUpperCase()}
                    </CText>
                </TouchableOpacity>
            )}
        </View>
    )
}

interface RewardCardListProps {
    rewardsData: RewardData[]
    selectRewards: { [x: string]: boolean | undefined }
    setSelectRewards: (obj: { [x: string]: boolean | undefined }) => void
    handleOpenDetail: (item: RewardData) => () => void
    sharepointToken: string
}
export const RewardCardList: React.FC<RewardCardListProps> = ({
    rewardsData,
    selectRewards,
    setSelectRewards,
    handleOpenDetail,
    sharepointToken
}) => {
    const getHandleRemoveRewardFunc = (item: RewardData) => () => {
        return Alert.alert(t.labels.PBNA_MOBILE_REMOVE_REWARD, t.labels.PBNA_MOBILE_REMOVE_REWARD_MSG, [
            {
                text: t.labels.PBNA_MOBILE_NO
            },
            {
                text: t.labels.PBNA_MOBILE_REMOVE.charAt(0) + t.labels.PBNA_MOBILE_REMOVE.slice(1).toLocaleLowerCase(),
                onPress: () => setSelectRewards({ ...selectRewards, [item.TARGET_NAME__c]: false })
            }
        ])
    }
    return (
        <>
            {rewardsData
                .filter((item) => selectRewards[item.TARGET_NAME__c])
                .map((item) => (
                    <View key={item.Id} style={styles.rewardCardContainer}>
                        <FastImage
                            style={styles.rewardCardImg}
                            resizeMode="contain"
                            source={getImageSourceObj(item, sharepointToken)}
                        />
                        <View style={styles.rewardCardMiddleContainer}>
                            <CText style={styles.rewardCardNameText}>{item.TARGET_NAME__c}</CText>
                            <View style={commonStyle.flexRowAlignCenter}>
                                <TouchableOpacity onPress={handleOpenDetail(item)}>
                                    <CText style={styles.blueBoldText12}>
                                        {t.labels.PBNA_MOBILE_METRICS_VIEW_DETAILS.toLocaleUpperCase()}
                                    </CText>
                                </TouchableOpacity>
                                <View style={styles.rewardCardSeparator} />
                                <TouchableOpacity onPress={getHandleRemoveRewardFunc(item)}>
                                    <CText style={styles.removeButton}>{t.labels.PBNA_MOBILE_REMOVE}</CText>
                                </TouchableOpacity>
                            </View>
                            {item.Status__c !== VisitStatus.PUBLISHED && (
                                <View style={styles.listReward}>
                                    <CText style={styles.gridRewardText}>
                                        {t.labels.PBNA_MOBILE_DISCONTINUED.toUpperCase()}
                                    </CText>
                                </View>
                            )}
                        </View>
                        <CText style={styles.rewardCardValue14}>{handleRewardValue(item)}</CText>
                    </View>
                ))}
        </>
    )
}

export const AddRewardsModal = ({
    rewardData,
    visible,
    setVisible,
    selectRewards,
    setSelectRewards,
    sharepointToken
}: RewardsModalInterface) => {
    const rewardDetailRef = useRef(null)
    const [isListView, setIsListView] = useState(true)
    const [tempSelection, setTempSelection] = useState({ ...selectRewards })
    useEffect(() => {
        setTempSelection({ ...selectRewards })
    }, [selectRewards])

    return (
        <>
            <Modal visible={visible}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.addRewardHeaderC}>
                        <CText style={styles.addRewardHeader}>{t.labels.PBNA_MOBILE_REWARDS}</CText>
                        <TouchableOpacity style={styles.marginLeftAuto} onPress={() => setIsListView(!isListView)}>
                            {isListView ? (
                                <Image
                                    resizeMode="contain"
                                    style={styles.gridIcon}
                                    source={require('../../../../../../assets/image/icon-grid-view.png')}
                                />
                            ) : (
                                <Image
                                    resizeMode="contain"
                                    style={styles.listIcon}
                                    source={require('../../../../../../assets/image/icon-list-view.png')}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    {isListView && (
                        <FlatList
                            contentContainerStyle={styles.listViewContainer}
                            data={rewardData}
                            renderItem={({ item }) => (
                                <ListRewardTile
                                    item={item}
                                    tempSelection={tempSelection}
                                    setTempSelection={setTempSelection}
                                    rewardDetailRef={rewardDetailRef}
                                    sharepointToken={sharepointToken}
                                />
                            )}
                            keyExtractor={(item) => item.Id}
                        />
                    )}
                    {!isListView && (
                        <FlatList
                            data={rewardData}
                            renderItem={({ item }) => (
                                <GridRewardTile
                                    item={item}
                                    tempSelection={tempSelection}
                                    setTempSelection={setTempSelection}
                                    sharepointToken={sharepointToken}
                                />
                            )}
                            keyExtractor={(item) => item.Id}
                        />
                    )}
                    <FormBottomButton
                        onPressCancel={() => {
                            setTempSelection({ ...selectRewards })
                            setVisible(false)
                        }}
                        onPressSave={() => {
                            setSelectRewards({ ...tempSelection })
                            setVisible(false)
                        }}
                        rightButtonLabel={t.labels.PBNA_MOBILE_SAVE.toLocaleLowerCase()}
                        leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL.toLocaleUpperCase()}
                        relative
                    />
                </SafeAreaView>
                <RewardDetailModal sharepointToken={sharepointToken} cRef={rewardDetailRef} />
            </Modal>
        </>
    )
}

export function removeFileNameExtension(filename: string | null) {
    if (!filename) {
        return ''
    }
    const lastIndex = filename.lastIndexOf('.')
    if (lastIndex !== -1) {
        return filename.substring(0, lastIndex)
    }
    return filename
}

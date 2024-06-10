/**
 * @description Components for KAM Customer List filter GEO selector.
 * @author Dashun Fu
 * @date 2023-04-16
 */

import React, { useEffect, useState } from 'react'
import { FlatList, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { baseStyle } from '../../../../common/styles/BaseStyle'
import CText from '../../../../common/components/CText'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import { useGetKamCustomerFilterGEOs } from '../../../hooks/KamCustomerHooks'
import { t } from '../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../common/CommonParam'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import CCheckBox from '../../../../common/components/CCheckBox'
import _ from 'lodash'
import Collapsible from 'react-native-collapsible'
import ChevronBlue from '../../../../../assets/image/ios-chevron-blue.svg'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    eHeader: {
        width: '90%',
        height: 700,
        borderRadius: 8,
        paddingBottom: 0,
        overflow: 'hidden',
        backgroundColor: baseStyle.color.white
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        lineHeight: 60
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    bottomButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    smallFontSize: {
        fontSize: 14
    },
    midFontSize: {
        fontSize: 16
    },
    borderRightShadow: {
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    shadowButton: {
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    },
    GEOCheckBoxContainer: {
        // height: 18,
        // justifyContent: 'center',
        marginVertical: 8,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row'
    },
    GEOTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        paddingTop: 30,
        paddingBottom: 20,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    selectorListContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        flexWrap: 'wrap'
    },
    expandIcon: {
        marginRight: 8
    },
    formButtonWrapper: {
        bottom: -30,
        position: 'relative',
        width: '100%',
        height: 60,
        borderRadius: 8
    }
})

interface KamGeographySelectorProps {
    onBack: Function
    selectedGEOs: any
    setSelectedGEOs: any
    setIsGEOChange?: (isGEOChange: boolean) => void
    isShowSelector: boolean
}

interface SelectedGEOItem {
    CcId: string[]
    level: string
    parentUId: string
    uId: string
}

interface GEOTreeItem {
    CcId: string[]
    Name: string
    children: GEOTreeItem[]
    level: string
    uId: string
    parentUId?: string
}

const computeSelectedData = (list: any[]) => {
    if (list.length) {
        return list.map((li) => {
            return {
                CcId: li.CcId,
                level: li.level,
                parentUId: li.parentUId,
                uId: li.uId
            }
        })
    }
    return []
}

const dfsFindParentNode = (treeList: any[], targetNode: any): GEOTreeItem | null => {
    for (const node of treeList) {
        if (node === targetNode) {
            return null // no parent node
        }
        if (node.children && node.children.findIndex((child) => child.uId === targetNode.uId) > -1) {
            return node
        }
        if (node.children) {
            const parentNode: GEOTreeItem | null = dfsFindParentNode(node.children, targetNode)
            if (parentNode) {
                return parentNode
            }
        }
    }
    return null
}

const computeExpandedIconNodes = (geoList: any[]) => {
    return geoList.map((geo) => geo.uId)
}

// init node expand status
const computeExpandedNodes = (geoList: any[], tree: any[]) => {
    const res: string[] = []
    geoList.forEach((geo) => {
        if (geo.level !== 'Market') {
            res.push(geo.uId)
            const parentNodes = []
            const parentNode = dfsFindParentNode(tree, geo)
            if (parentNode) {
                const grandParentNode = dfsFindParentNode(tree, parentNode)
                parentNodes.push(parentNode, grandParentNode)
            }
            const totalSiblingNodes: any[] = []
            parentNodes &&
                parentNodes.filter(Boolean).forEach((parentNode) => {
                    const siblingNodes: any = parentNode?.children.filter((sibling) => sibling.uId !== geo.uId)
                    totalSiblingNodes.push(...siblingNodes)
                })

            if (totalSiblingNodes) {
                res.push(...totalSiblingNodes?.map((sib) => sib.uId))
            }
        }
    })
    return res
}

const LOCATION_MARGIN = 22
const TERRITORY_MARGIN = 80

const KamGeographySelector = (props: KamGeographySelectorProps) => {
    const { onBack, selectedGEOs, setSelectedGEOs, setIsGEOChange, isShowSelector } = props
    const geographyTree = useGetKamCustomerFilterGEOs(isShowSelector)
    const [selectedGEO, setSelectedGEO] = useState<SelectedGEOItem[]>(computeSelectedData(selectedGEOs))
    const [expandedNodes, setExpandedNodes] = useState<any[]>([])
    const [expandedIconNodes, setExpandedIconNodes] = useState<string[]>(computeExpandedIconNodes(selectedGEOs))

    const saveSelectedGEO = async () => {
        if (setIsGEOChange) {
            setIsGEOChange(true)
        }
        const mapData: any[] = selectedGEO.map((sGeo) => {
            return {
                // add Id and Name for reuse CustomerCell component
                Id: sGeo.uId,
                Name: sGeo.uId,
                ...sGeo
            }
        })
        setSelectedGEOs(mapData)
        onBack()
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
    }

    useEffect(() => {
        setExpandedNodes(computeExpandedNodes(selectedGEOs, geographyTree))
    }, [geographyTree])

    // check item is in selected geo list, for `CCheckBox` checked
    const checkSelected = (item: GEOTreeItem) => {
        return !!selectedGEO.find((obj) => item.uId === obj.uId)
    }

    const checkChildExpanded = (item: GEOTreeItem) => {
        return !expandedIconNodes.includes(item.uId)
    }

    const handleExpandIconPress = (item: GEOTreeItem) => {
        item.children.forEach((ccl) => {
            if (expandedNodes.includes(ccl.uId)) {
                setExpandedNodes((expandedNodes) => expandedNodes.filter((uId) => uId !== ccl.uId))
            } else {
                setExpandedNodes((expandedNodes) => [...expandedNodes, ccl.uId])
            }
        })

        const iconList = _.cloneDeep(expandedIconNodes)
        if (!iconList.find((ic: any) => ic === item.uId)) {
            iconList.push(item.uId)
            setExpandedIconNodes(iconList)
        } else {
            setExpandedIconNodes(iconList.filter((ic: any) => ic !== item.uId))
        }
    }

    const dfsGetItemAndAllChildren = (node: any, resultList: any[]) => {
        if (node !== null) {
            resultList.push({ uId: node.uId, CcId: node.CcId, parentUId: node?.parentUId, level: node.level })
            const children = node.children || []
            for (let i = 0; i < children.length; i++) {
                dfsGetItemAndAllChildren(children[i], resultList)
            }
        }
        return resultList
    }

    const toggleChecked = (item: GEOTreeItem) => {
        const itemAndChildren = dfsGetItemAndAllChildren(item, [])
        let tempSelectedGEO = _.cloneDeep(selectedGEO)
        // find parent node
        const parentNode = dfsFindParentNode(geographyTree, item)
        // find sibling node(s)
        const siblingNodes: any = parentNode?.children.filter((sibling) => sibling.uId !== item.uId)
        if (tempSelectedGEO.find((sGeoItem) => sGeoItem.uId === item.uId)) {
            // item is already selected, so set item and it's children all 'deselected'
            const itemAndChildren = dfsGetItemAndAllChildren(item, [])
            itemAndChildren.forEach((li) => {
                tempSelectedGEO = tempSelectedGEO.filter((obj) => obj.uId !== li.uId)
            })
            // if it has parent node, set parent node 'deselected'
            if (parentNode) {
                tempSelectedGEO = tempSelectedGEO.filter((obj) => obj.uId !== parentNode.uId)
                const grandParentNode = dfsFindParentNode(geographyTree, parentNode)
                if (grandParentNode) {
                    tempSelectedGEO = tempSelectedGEO.filter((obj) => obj.uId !== grandParentNode.uId)
                }
            }
        } else {
            // item is already 'deselected', so set item and it's children all 'selected'
            itemAndChildren.forEach((li) => {
                if (!tempSelectedGEO.find((temp) => temp.uId === li.uId)) {
                    tempSelectedGEO = [...tempSelectedGEO, li]
                }
            })
            // if it has parent node, and also all sibling nodes in selected nodes, need to set parent node to selected
            if (
                parentNode &&
                _.intersectionBy(tempSelectedGEO, siblingNodes, 'uId').length === parentNode.children.length - 1
            ) {
                if (!tempSelectedGEO.find((sGeo) => sGeo.uId === parentNode.uId)) {
                    const selectedParent: any = {
                        uId: parentNode.uId,
                        CcId: parentNode.CcId,
                        parentUId: parentNode?.parentUId,
                        level: parentNode.level
                    }
                    tempSelectedGEO = [...tempSelectedGEO, selectedParent]
                }
                const grandParentNode = dfsFindParentNode(geographyTree, parentNode)
                const parentSiblingNodes: any = grandParentNode?.children.filter(
                    (sibling) => sibling.uId !== parentNode.uId
                )
                if (
                    grandParentNode &&
                    _.intersectionBy(tempSelectedGEO, parentSiblingNodes, 'uId').length ===
                        grandParentNode.children.length - 1
                ) {
                    const selectedGrandParent: any = {
                        uId: grandParentNode.uId,
                        CcId: grandParentNode.CcId,
                        parentUId: grandParentNode?.parentUId,
                        level: grandParentNode.level
                    }
                    tempSelectedGEO = [...tempSelectedGEO, selectedGrandParent]
                }
            }
        }
        setSelectedGEO(tempSelectedGEO)
    }

    const handleCheckBoxPress = (item: GEOTreeItem) => {
        toggleChecked(item)
    }

    const calculateMargin = (level: string) => {
        if (level === 'Location') {
            return LOCATION_MARGIN
        } else if (level === 'Territory') {
            return TERRITORY_MARGIN
        }
        return 0
    }

    const renderCheckBox = (item: GEOTreeItem) => {
        return (
            <View style={[styles.GEOCheckBoxContainer, { marginLeft: calculateMargin(item.level) }]}>
                {item.children.length > 0 && (
                    <TouchableOpacity onPress={() => handleExpandIconPress(item)}>
                        <ChevronBlue
                            width={14}
                            height={14}
                            style={[
                                {
                                    transform: [{ rotate: checkChildExpanded(item) ? '90deg' : '180deg' }]
                                },
                                styles.expandIcon
                            ]}
                        />
                    </TouchableOpacity>
                )}
                <CCheckBox
                    onPress={() => {
                        handleCheckBoxPress(item)
                    }}
                    title={<CText style={styles.smallFontSize}>{item.Name}</CText>}
                    checked={checkSelected(item)}
                    containerStyle={commonStyle.transparentBG}
                />
            </View>
        )
    }

    const renderParentGEOItem = (geoItem: any) => {
        const isExpanded = expandedNodes.includes(geoItem.uId)
        const ROOT_LEVEL = 'Market'
        return (
            <Collapsible
                key={geoItem.uId}
                collapsed={geoItem.level !== ROOT_LEVEL ? !isExpanded : false}
                renderChildrenCollapsed={geoItem.level !== ROOT_LEVEL ? isExpanded : true}
            >
                {renderCheckBox(geoItem)}
                {geoItem?.children
                    ? geoItem.children.map((child: any) => renderParentGEOItem(child))
                    : renderCheckBox(geoItem)}
            </Collapsible>
        )
    }

    const renderItem = (item: any) => {
        return renderParentGEOItem(item.item)
    }

    return (
        <Modal visible animationType="fade" transparent>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={styles.GEOTitleContainer}>
                        <View style={[commonStyle.flex_1, commonStyle.alignItemsCenter]}>
                            <CText style={[styles.navTitle]}>
                                {t.labels.PBNA_MOBILE_FILTER_SELECT_GEOGRAPHY.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                    <View style={styles.selectorListContainer}>
                        <FlatList
                            style={[commonStyle.marginTop_20, commonStyle.fullWidth]}
                            data={geographyTree}
                            extraData={selectedGEO}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.uId}
                        />
                    </View>
                    <View style={styles.formButtonWrapper}>
                        <FormBottomButton
                            rightButtonLabel={t.labels.PBNA_MOBILE_KA_SAVE}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                            onPressCancel={() => {
                                onBack()
                            }}
                            onPressSave={() => {
                                saveSelectedGEO()
                            }}
                            roundedBottom
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export default KamGeographySelector

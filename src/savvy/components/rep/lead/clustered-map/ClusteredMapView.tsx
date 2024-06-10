/* eslint-disable react/prop-types */
import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, LayoutAnimation, Platform } from 'react-native'
import MapView, { MapViewProps } from 'react-native-maps'
import SuperCluster from 'supercluster'

import { MapClusteringProps } from './ClusteredMapViewTypes'
import ClusterMarker from './ClusteredMarker'
import { boundariesToBBox, isMarker, markerToGeoJSONFeature, returnMapZoom } from './ClusteredMaphelpers'
import _ from 'lodash'

const ClusteredMapView = React.forwardRef<MapClusteringProps & MapViewProps, any>(
    (
        {
            radius,
            maxZoom,
            minZoom,
            minPoints,
            extent,
            nodeSize,
            children,
            onMarkersChange,
            onClusterPress,
            onRegionChangeComplete,
            preserveClusterPressBehavior,
            clusteringEnabled,
            clusterColor,
            clusterGroupColor,
            clusterTextColor,
            clusterFontFamily,
            layoutAnimationConf,
            animationEnabled,
            renderCluster,
            tracksViewChanges,
            ...restProps
        },
        ref: any
    ) => {
        const [otherChildren, updateChildren] = useState([])
        const [superCluster, setSuperCluster] = useState(null)
        const [markers, setMarkers] = useState(null)
        const [currentRegion, updateRegion] = useState(restProps.region || restProps.initialRegion)
        const mapRef = useRef(null)

        const propsChildren = useMemo(() => React.Children.toArray(children), [children])

        useEffect(() => {
            const rawData = []
            const tempOtherChildren = []

            if (!clusteringEnabled) {
                setMarkers(null)
                updateChildren(propsChildren)
                setSuperCluster(null)
                return
            }

            propsChildren.forEach((child: any, index) => {
                if (isMarker(child) && child?.props?.identifier !== undefined) {
                    rawData.push(markerToGeoJSONFeature(child, index))
                } else {
                    tempOtherChildren.push(child)
                }
            })
            const dataGroup = _.groupBy(rawData, 'properties.identifier')
            const clusters = {}
            _.keys(dataGroup).forEach((k) => {
                _.assign(clusters, {
                    [k]: new SuperCluster({
                        radius,
                        maxZoom,
                        minZoom,
                        minPoints,
                        extent,
                        nodeSize
                    }).load(dataGroup[k] || [])
                })
            })

            mapRef.current?.getMapBoundaries().then((v) => {
                const bBox = boundariesToBBox(v)
                const zoom = returnMapZoom(currentRegion, bBox, minZoom)
                const mapMarkers = {}
                _.keys(clusters).forEach((k) => {
                    _.assign(mapMarkers, {
                        [k]: clusters[k].getClusters(bBox, zoom)
                    })
                })
                setMarkers(mapMarkers)
                setSuperCluster(clusters)
                updateChildren(tempOtherChildren)
            })

            // superClusterRef.current = superCluster
        }, [propsChildren, clusteringEnabled])

        useEffect(() => {
            restProps.needUpdateRegion &&
                restProps.initialRegion &&
                mapRef?.current?.animateToRegion(restProps.initialRegion)
        }, [restProps.initialRegion])

        const _onRegionChangeComplete = (region) => {
            if (superCluster && region) {
                mapRef.current?.getMapBoundaries().then((v) => {
                    const bBox = boundariesToBBox(v)
                    const zoom = returnMapZoom(region, bBox, minZoom)
                    const regionChangeMarkers = {}
                    Object.keys(superCluster).forEach((k) => {
                        Object.assign(regionChangeMarkers, {
                            [k]: superCluster[k].getClusters(bBox, zoom)
                        })
                    })
                    if (animationEnabled && Platform.OS === 'ios') {
                        LayoutAnimation.configureNext(layoutAnimationConf)
                    }
                    setMarkers(regionChangeMarkers)
                    onMarkersChange(regionChangeMarkers)
                    onRegionChangeComplete(region)
                    updateRegion(region)
                })
            } else {
                onRegionChangeComplete(region)
            }
        }

        const _onClusterPress = (cluster, key) => () => {
            const clusterChildren = superCluster[key]?.getLeaves(cluster.id, Infinity)

            if (preserveClusterPressBehavior) {
                onClusterPress(cluster[key], clusterChildren)
                return
            }

            const coordinates = clusterChildren.map(({ geometry }) => ({
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0]
            }))

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: restProps.edgePadding
            })

            onClusterPress(cluster, clusterChildren)
        }

        return (
            <MapView
                liteMode
                {...restProps}
                ref={(map) => {
                    mapRef.current = map
                    if (ref) {
                        ref.current = map
                    }
                    restProps.mapRef(map)
                }}
                onRegionChangeComplete={_onRegionChangeComplete}
            >
                {_.keys(markers).map((k) => {
                    return markers[k].map((marker) => {
                        if (marker.properties.point_count === 0) {
                            return propsChildren[marker.properties.index]
                        } else if (renderCluster) {
                            return renderCluster({
                                onPress: _onClusterPress(marker, k),
                                clusterColor,
                                clusterTextColor,
                                clusterFontFamily,
                                k,
                                ...marker
                            })
                        }
                        return (
                            <ClusterMarker
                                key={`cluster-${marker.id}`}
                                {...marker}
                                onPress={_onClusterPress(marker, k)}
                                clusterColor={clusterGroupColor[k] || clusterColor}
                                clusterTextColor={clusterTextColor}
                                clusterFontFamily={clusterFontFamily}
                                tracksViewChanges={tracksViewChanges}
                            />
                        )
                    })
                })}
                {otherChildren}
            </MapView>
        )
    }
)

ClusteredMapView.defaultProps = {
    clusteringEnabled: true,
    needUpdateRegion: false,
    spiralEnabled: true,
    animationEnabled: true,
    preserveClusterPressBehavior: false,
    layoutAnimationConf: LayoutAnimation.Presets.spring,
    tracksViewChanges: false,
    // SuperCluster parameters
    radius: Dimensions.get('window').width * 0.2,
    maxZoom: 15,
    minZoom: 0,
    minPoints: 4,
    extent: 512,
    nodeSize: 64,
    // Map parameters
    edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
    // Cluster styles
    clusterColor: '#00B386',
    clusterGroupColor: null,
    clusterTextColor: '#FFFFFF',
    // Callbacks
    onRegionChangeComplete: () => {},
    onClusterPress: () => {},
    onMarkersChange: () => {},
    superClusterRef: {},
    mapRef: () => {}
}

ClusteredMapView.displayName = 'ClusteredMapView'

export default memo(ClusteredMapView)

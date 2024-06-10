//
//  RNTMapstedView.swift
//
//  Created by Jiaxiang Wang on 2023/11/14.
//  Copyright © 2023 SAVVY. All rights reserved.
//

import UIKit
import Foundation
import CoreLocation
import MapstedCore
import MapstedMap
import MapstedMapUi

@objc class RNTMapstedView: UIView {

    var spinnerView: UIActivityIndicatorView!
    var mapPlaceholderView: UIView!
    let screen_width = UIScreen.main.bounds.width
    let screen_height = UIScreen.main.bounds.height
    var _propertyId: Int = 0
    var initSuccess: Bool = false
    @objc var onLoadCallback: RCTBubblingEventBlock?
    @objc var onSelectLocation: RCTBubblingEventBlock?
    @objc var onUnloadCallback: RCTBubblingEventBlock?
    @objc var _onInitialCallback: RCTBubblingEventBlock?
    @objc var onInitialCallback: RCTBubblingEventBlock? {
        get {
            return self._onInitialCallback
        }
        set (newVal) {
            self._onInitialCallback = newVal
            if (self.initSuccess) {
                self._onInitialCallback!(["isSuccess": true])
            }
        }
    }

    @objc var propertyId: Int {
        get {
            return self._propertyId
        }
        set (newVal) {
            if (self.propertyId != newVal) {
                self._propertyId = newVal
                if (self.initSuccess) {
                    DispatchQueue.main.async {
                        self.setupUI()
                    }
                }
            }
        }
    }
  
    @objc var unloadMap: Bool {
        get {
            return false
        }
        set (newVal) {
            if (newVal == true) {
                removePropertyAndResourcesBeforeDownload()
            }
        }
    }
    
    //View controller in charge of map view
    private let mapViewController = MNMapViewController()
    
    //MARK: - init
    @objc override init(frame: CGRect) {
        super.init(frame: frame)
        createSubViews()
    }

    @objc init (labelText: String) {
        super.init(frame: .zero)
        createSubViews()
    }

    @objc required init?(coder: NSCoder) {
        super.init(coder: coder)
        createSubViews()
    }
    
    /**
     Create subviews
     */
    private func createSubViews() {

        self.mapPlaceholderView = UIView(frame: self.frame);
        self.mapPlaceholderView.backgroundColor = UIColor.white;
        addSubview(self.mapPlaceholderView);
        self.spinnerView = UIActivityIndicatorView(frame: CGRect(origin: CGPoint(x: (self.bounds.size.width - 20)/2, y: (self.bounds.size.height - 20)/2), size: CGSize(width: 20, height: 20)))
        addSubview(self.spinnerView)
        
        showSpinner()
        // Set up mapsted
        if CoreApi.hasInit() {
            self.onSuccess()
        }
        else {
            MapstedMapApi.shared.setUp(prefetchProperties: false, callback: self)
        }
    }

    /**
     Layout subviews
     */
    override func layoutSubviews() {
        self.mapPlaceholderView.frame = self.frame
        self.spinnerView.frame = CGRect(origin: CGPoint(x: (self.bounds.size.width - 20)/2, y: (self.bounds.size.height - 20)/2), size: CGSize(width: 20, height: 20))
        mapViewController.view.bounds = CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height);
        mapViewController.view.frame = CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height);
    }
    
    //MARK: - Show & Hide Spinner
    /**
     Show spinner
     */
    func showSpinner() {
        DispatchQueue.main.async {
            self.spinnerView?.startAnimating()
        }
    }
    
    /**
     Hide spinner
     */
    func hideSpinner() {
        DispatchQueue.main.async {
            self.spinnerView?.stopAnimating()
        }
    }
    
    //MARK: - Setup UI
    /**
     Set up UI
     */
    func setupUI() {
        //Whether or not you want to show compass
        MapstedMapMeta.showCompass = true
        //UI Stuff
        self.findViewController()?.addChild(mapViewController)
        mapViewController.view.translatesAutoresizingMaskIntoConstraints = false
        mapViewController.view.bounds = CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height);
        mapViewController.view.frame = CGRect(x: 0, y: 0, width: self.bounds.size.width, height: self.bounds.size.height);
        self.mapPlaceholderView.addSubview(mapViewController.view)
        addParentsConstraints(view: mapViewController.view)
        mapViewController.didMove(toParent: self.findViewController())
        // Add map click listener
        mapViewController.addMapTileEventListenerDelegate(delegate: self)
        mapViewController.addMapVectorElementListenerDelegate(delegate: self)
        mapViewController.addMapListenerDelegate(delegate: self)
        //Added handleSuccess once MapView is ready to avoid any plotting issues.
        downloadPropertyAndDraw()
    }

    /**
     Download property and draw it on map
     */
    func downloadPropertyAndDraw() {
        if (self.propertyId != 0) {
            self.startDownload(propertyId: self.propertyId)
        }
    }
  
    /**
     Start download map resource of propertyId
     - Parameter propertyId: the propertyId of store
     */
    func startDownload(propertyId: Int) {
        MapstedMapApi.shared.downloadPackage(propertyId: propertyId)
        // For showing the store map view instead of the world map
        let _ = MapstedMapApi.shared.centerOnProperty(propertyId: propertyId)
        CoreApi.PropertyManager.startDownload(propertyId: propertyId, propertyDownloadListener: self)
    }

    /**
     Unload map resource
     */
    func removePropertyAndResourcesBeforeDownload() {
        MapstedMapApi.shared.removeProperty(propertyId: self.propertyId)
        CoreApi.PropertyManager.unload(propertyId: self.propertyId, listener: self)
        MapstedMapApi.shared.unloadMapResources()
    }
    
    //MARK: - Download Property and Draw Property on Success
    /**
     Handler for initial success
     */
    fileprivate func handleSuccess() {
        self.initSuccess = true
        DispatchQueue.main.async {
            if self.propertyId != 0 {
                self.setupUI()
            }
        }
    }
    
    /**
     Helper method of draw property
     */
    func drawProperty(propertyId: Int, completion: @escaping (() -> Void)) {
        
        guard let propertyData = CoreApi.PropertyManager.getCached(propertyId: propertyId) else {
            self.hideSpinner()
            return
        }
        DispatchQueue.main.async {
          // remove property first in case draw again
            MapstedMapApi.shared.removeProperty(propertyId: propertyId)
            MapstedMapApi.shared.drawProperty(isSelected: true, propertyData: propertyData)
            if let propertyInfo = PropertyInfo(propertyId: propertyId) {
                MapstedMapApi.shared.mapView()?.moveToLocation(mercator: propertyInfo.getCentroid(), zoom: 18, duration: 0.2)
                completion();
            }
            self.hideSpinner()
        }
    }
}

//MARK: - UI Constraints Helper method
extension RNTMapstedView {
    /**
     Help method
     */
    func addParentsConstraints(view: UIView?) {
        guard let superview = view?.superview else {
            return
        }
        
        guard let view = view else {return}
        
        view.translatesAutoresizingMaskIntoConstraints = false
        
        let viewDict: [String: Any] = Dictionary(dictionaryLiteral: ("self", view))
        let horizontalLayout = NSLayoutConstraint.constraints(
            withVisualFormat: "|[self]|", options: NSLayoutConstraint.FormatOptions.directionLeadingToTrailing, metrics: nil, views: viewDict)
        let verticalLayout = NSLayoutConstraint.constraints(
            withVisualFormat: "V:|[self]|", options: NSLayoutConstraint.FormatOptions.directionLeadingToTrailing, metrics: nil, views: viewDict)
        superview.addConstraints(horizontalLayout)
        superview.addConstraints(verticalLayout)
    }
}

//MARK: - Core Init Callback methods
extension RNTMapstedView : CoreInitCallback {
    func onSuccess() {
        //Once the Map API Setup is complete, Setup the Mapview
        if (self.onInitialCallback != nil) {
            self.onInitialCallback!(["isSuccess": true])
        }
        self.handleSuccess()
    }
    
    func onFailure(errorCode: EnumSdkError) {
        if (self.onInitialCallback != nil) {
            self.onInitialCallback!(["isSuccess": false, "errorMessage": "Failed with \(errorCode)"])
        }
    }
    
    func onStatusUpdate(update: EnumSdkUpdate) {
    }
    
    func onStatusMessage(messageType: StatusMessageType) {
    }
}

//MARK: - Property Download Listener Callback methods
extension RNTMapstedView : PropertyDownloadListener {
    func onSuccess(propertyId: Int) {
        self.drawProperty(propertyId: propertyId, completion: {
        })
    }
    
    func onSuccess(propertyId: Int, buildingId: Int) {
        if (self.onLoadCallback != nil) {
            self.onLoadCallback!(["isSuccess": true, "propertyId": propertyId, "buildingId": buildingId])
        }
    }
    
    func onFailureWithProperty(propertyId: Int) {
        self.onLoadCallback!(["isSuccess": false, "errorMessage": "Failed to download \(propertyId)"])
    }
    
    func onFailureWithBuilding(propertyId: Int, buildingId: Int) {
    }
    
    func onProgress(propertyId: Int, percentage: Float) {
    }
}

//MARK: - Map Tap Listener Callback methods
/**
 Your view controller hosting the Mapsted map viewcontroller will
 automatically receive map event notifications if it conforms to the
 MNMapListenerDelegate delegate. When user taps on the map outside any
 vector elements, outsideBuildingTapped gets called with the tap position
 and the tap type.
 */
extension RNTMapstedView: MNMapListenerDelegate {
    func onMapMoved() {
    }
    
    func onMapStable() {
    }
    
    func onMapIdle() {
    }
    
    func onMapInteraction() {
    }
  
    func outsideBuildingTapped(tapPos: MNMercator, tapType: MapstedMapApi.TapType) {
        DispatchQueue.main.async {
            if tapType == .eSingle {
                //handle single tap
                if (self.onSelectLocation != nil) {
                    self.onSelectLocation!(["coordinateInfo": ["x":tapPos.x, "y":tapPos.y, "z":tapPos.z]])
                }
            }
        }
    }
}

//MARK: - Map click Listener Callback methods
extension RNTMapstedView: MNMapVectorElementListenerDelegate {
    func onPolygonTapped(polygon: MNMapPolygon, tapType: MapstedMap.MapstedMapApi.TapType, tapPos: MNMercator) {
    }
    
    func onEntityTapped(entity: MNMapEntity, tapType: MapstedMap.MapstedMapApi.TapType, tapPos: MNMercator) {
        
        DispatchQueue.main.async {
            MapstedMapApi.shared.selectSearchEntity(entity: entity, showPopup: false)
            if (self.onSelectLocation != nil) {
                self.onSelectLocation!(["locationInfo": ["entityName":entity.name, "propertyId":entity.propertyId(), "entityId":entity.propertyId(), "buildingId":entity.buildingId(), "floorId":entity.floorId()]])
            }
        }
    }
    
    func onBalloonClicked(searchEntity: MNSearchEntity) {
    }
    
    func onMarkerTapped(markerName: String, markerType: String) {
    }
}

//MARK: - Map click Vector Tile Event Listener Callback methods
extension RNTMapstedView: MNMapVectorTileEventListenerDelegate {
    public func onTileBalloonClicked(searchEntity: MNSearchEntity) {
        self.onBalloonClicked(searchEntity: searchEntity)
    }
    
    public func onTileMarkerTapped(markerName: String, markerType: String) {
        self.onMarkerTapped(markerName: markerName, markerType: markerType)
    }

    public func onTileEntityTapped(entity: MNMapEntity, tapType: MapstedMapApi.TapType, tapPos: MNMercator) {
        self.onEntityTapped(entity: entity, tapType: tapType, tapPos: tapPos)
    }
    
    public func onTilePolygonTapped(polygon: MNMapPolygon, tapType: MapstedMapApi.TapType, tapPos: MNMercator) {
        self.onPolygonTapped(polygon: polygon, tapType: tapType, tapPos: tapPos)
    }
}

//MARK: - Property Action Complete Listener
extension RNTMapstedView : PropertyActionCompleteListener {
    /**
     Handler of unload map success callback
     - Parameter action: MapstedCore.PropertyAction
     - Parameter propertyId: The property Id of store
     - Parameter sucessfully: Successfully callback
     - Parameter error: Error when failed
     */
    func completed(action: MapstedCore.PropertyAction, propertyId: Int, sucessfully: Bool, error: Error?) {
        if (self.onUnloadCallback != nil) {
            self.onUnloadCallback!(["isSuccess": true])
        }
    }
}

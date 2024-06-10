//
//  RNTMapstedNavigateView.swift
//
//  Created by Jiaxiang Wang on 2023/12/22.
//  Copyright © 2023 SAVVY. All rights reserved.
//

import UIKit
import MapstedCore
import MapstedMap
import MapstedMapUi
import LocationMarketing

class RNTMapstedNavigateView: UIView {
    
    private var containerVC: ContainerViewController?
    private var mapsVC: MapstedMapUiViewController?
    private var spinnerView: UIActivityIndicatorView!
    var mapPlaceholderView: UIView!
    var _propertyId: Int = 0
    var initSuccess: Bool = false
    @objc var onLoadCallback: RCTBubblingEventBlock?
    @objc var onSelectLocation: RCTBubblingEventBlock?
    @objc var onUnloadCallback: RCTBubblingEventBlock?

    @objc var propertyId: Int {
        get {
            return self._propertyId
        }
        set (newVal) {
            if (self.propertyId != newVal) {
                self._propertyId = newVal
                if (!self.initSuccess) {
                    self.handleSuccess()
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

    let Logger = DebugLog()
    //MARK: - init
    override init(frame: CGRect) {
        super.init(frame: frame)
        createSubViews()
    }

    init (labelText: String) {
        super.init(frame: .zero)
        createSubViews()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        createSubViews()
    }

    /**
     Unload map resource
     */
    func removePropertyAndResourcesBeforeDownload() {
        MapstedMapApi.shared.removeProperty(propertyId: self.propertyId)
        CoreApi.PropertyManager.unload(propertyId: self.propertyId, listener: self)
        MapstedMapApi.shared.unloadMapResources()
    }

    /**
     Create subviews
     */
    private func createSubViews() {
        self.mapPlaceholderView = UIView(frame: self.frame);
        addSubview(self.mapPlaceholderView);
        self.spinnerView = UIActivityIndicatorView(frame: CGRect(origin: CGPoint(x: (self.frame.size.width - 20)/2, y: (self.frame.size.height - 20)/2), size: CGSize(width: 20, height: 20)))
        addSubview(self.spinnerView)
        self.containerVC = ContainerViewController();
        showSpinner()
        if CoreApi.hasInit() {
            DispatchQueue.main.async {
                self.addMapView()
            }
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
        self.spinnerView.frame = CGRect(origin: CGPoint(x: (self.frame.size.width - 20)/2, y: (self.frame.size.height - 20)/2), size: CGSize(width: 20, height: 20))
        mapsVC?.view.bounds = self.bounds;
        mapsVC?.view.frame = self.frame;
        containerVC?.view.bounds = self.bounds;
        containerVC?.view.frame = self.frame;
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
    
    //MARK: - Intialize and add MapView and display property
    func addMapView() {
        if self.mapsVC == nil {
            if let mapsVC = MapstedMapUiViewController.shared as? MapstedMapUiViewController {
                mapsVC.setAlertDelegate(alertDelegate: self)
                self.mapsVC = mapsVC
                self.mapsVC?.view.frame = self.frame
                self.mapsVC?.view.bounds = self.bounds
                self.containerVC?.addController(controller: mapsVC, yOffset: 0, isNew: false)
                self.containerVC?.view.frame = self.frame
                self.containerVC?.view.bounds = self.bounds
                self.mapPlaceholderView.addSubview(self.containerVC!.view)
                self.containerVC?.didMove(toParent: self.findViewController())
                self.mapsVC?.didMove(toParent: self.findViewController())
            }
        }
        if (self.propertyId != 0) {
            self.handleSuccess()
        }
    }
    
    /**
     Draw and display property on map
     - Parameter propertyId: The propertyId of store
     - Parameter completion: Complete callback
     */
    func displayProperty(propertyId: Int, completion: (() -> ())? = nil) {
        // For showing the store map view instead of the world map
        let _ = MapstedMapApi.shared.centerOnProperty(propertyId: propertyId)
        //zoom to property
        self.mapsVC?.showLoadingSpinner(text: "")
        self.hideSpinner()
        
        self.mapsVC?.selectAndDrawProperty(propertyId: propertyId, callback: {[weak self] status in
            DispatchQueue.main.async {
                self?.mapsVC?.hideLoadingSpinner()
                if status {
                    self?.mapsVC?.displayPropertyOnMap {
                        completion?()
                    }
                }
                else {
                    self?.Logger.Log("Problem with status on select and draw", status)
                }
            }
        })
    }
    
    /**
     Method to handle success callback after sdk initializing
     */
    fileprivate func handleSuccess() {
        self.initSuccess = true
        self.displayProperty(propertyId: self.propertyId) {
            self.mapsVC?.displayPropertyOnMap(propertyId: self.propertyId, completion: {
            })
            self.mapsVC?.displayPropertyOnMap()
            self.mapsVC?.displayMap(propertyId: self.propertyId)
        }
    }
}

//MARK: - Core Init Callback methods
extension RNTMapstedNavigateView : CoreInitCallback {
    func onSuccess() {
        //Once the Map API Setup is complete, Setup the Mapview
        DispatchQueue.main.async {
            self.addMapView()
        }
    }
    
    func onFailure(errorCode: EnumSdkError) {
        self.Logger.Log("Failed with", errorCode)
    }
    
    func onStatusUpdate(update: EnumSdkUpdate) {
        self.Logger.Log("OnStatusUpdate", update)
    }
    
    func onStatusMessage(messageType: StatusMessageType) {
    }
}

//MARK: - MN Alert Delegate methods
extension RNTMapstedNavigateView : MNAlertDelegate {
    func showAlerts() {
    }
    
    func loadingAlerts() -> Bool {
        return false
    }
}

//MARK: - Property Action Complete Listener
extension RNTMapstedNavigateView : PropertyActionCompleteListener {
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


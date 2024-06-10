# PBNA SAVVY Mobile App

## Dev Environment Configuration

### Mac

##### Prerequisites

1. [Node.JS](https://nodejs.org/en/)
2. Xcode 13
3. [Homebrew](https://brew.sh/)
4. JDK 8-11
5. Android Studio

##### Install

1. Open terminal
2. Run `brew install watchman`
3. Run `npm install -g yarn`
4. Run `sudo gem install cocoapods` or `brew install cocoapods`
5. Run `gem install cocoapods-user-defined-build-types`
6. Make sure that JDK and Android SDK is in your System Path.

##### Test

1. Clone Halo_Mobile to your local directory.
2. Run `cd Halo_Mobile && git checkout PBNA/mergedev`
3. Run `yarn install`, if stop at `$ tsc —build`, run `npm install -g typescript@4.1.5`, and then run `yarn install` again.
4. Run `rm -rf ios/Pods && rm -rf ios/build && cd ios && pod install && cd ../`
5. Run `yarn start`
6. Open a new terminal tab
7. Run `yarn react-native run-ios --simulator "iPhone 13 Pro"`
8. Run `yarn react-native run-android`
9. The Android and the iOS simulator should appear.
10. The login page of the Salesforce should appear, choose the Sandbox and ask Admin to get Username&Password.
11. Login and the Contact list of your org should appear.


## Tips
1. Pure build for iOS may take 100-150 seconds. (1068NG7) 
2. Pure build for Android my take 130-180 seconds. (1068NG7)
3. Incremental build may take 10-30 seconds.
4. If you'd like to import third-party library, please check if the library is still being maintained.
5. If you have imported any third-party libraries, please add to track below. Please also run `xcodebuild -sdk iphoneos -configuration Release -workspace ./ios/HALO.xcworkspace -scheme HALO clean archive` to check if it can be built successfully before push the code.
   



## Third-party libraries track
* @react-native-community/async-storage
* react-native-elements
* react-native-vector-icons
* @react-navigation/bottom-tabs
* react-native-progress
* moment
* react-native-maps
* react-native-qrcode-scanner
* react-native-camera
* react-native-permissions
* react-native-device-info
* react-native-pdf
* rn-fetch-blob
* @react-native-community/progress-bar-android
* react-native-maps-directions
* @react-native-community/progress-view
* react-native-signature-canvas
* react-native-html-to-pdf
* react-native-geolocation-service
* moment-timezone
* react-native-localize
* @react-native-picker/picker
* react-native-draggable
* @react-native-community/push-notification-ios
* react-native-collapsible
* react-native-carousel-control

## 3rd Libraries need to add React.framework manually
* @react-native-community/progress-view
* react-native-geolocation-service
* react-native-html-to-pdf
* RNSVG

## Warn to Solve

* Sending `onAnimatedValueUpdate` with no listeners registered.



## Tech Components Approach

| Tech Components                                              | 3rd Party Library             |
| ------------------------------------------------------------ | ----------------------------- |
| Develop camera functions                                     | react-native-camera           |
| Develop Bar Code/QR Code scan functions                      | react-native-qrcode-scanner   |
| Develop eSingature functions                                 | react-native-signature-canvas |
| Develop Google Map functions                                 | react-native-maps             |
| Develop Geo Location functions                               | react-native-maps             |
| Develop File Opener functions                                | react-native-file-viewer      |
| Develop Chart functions by including Chart components (npm module) | victory-native                |
| Develop Notification functions                               |                               |


## Tricky bugs and solutions
1. When you use react-native-modalize, if you get the error 'Illegal node ID set as an Input for Animated.DiffClamp node', just remove the 'SafeAreaView' in the 'Modalize'.


## UI Components Reference

| UI Component             | Native Support | React Native Elements Approach | 3rd Party Libarary              | Mainteance Frequency |
| ------------------------ | -------------- | ------------------------------ | ------------------------------- | -------------------- |
| Badge                    |                | Badge                          |                                 |                      |
| Button                   |                | Button                         |                                 |                      |
| Card                     |                | Card                           |                                 |                      |
| Checkbox                 |                | Checkbox                       |                                 |                      |
| Chip                     |                |                                | react-native-material-chip      | Low                  |
| Date & Time Pickers      |                |                                | react-native-datetimepicker     | High                 |
| Floating Action Button   |                |                                | react-native-floating-action    | Low                  |
| Infinite Scroll          |                |                                | react-native-infinite-scrolling | Medium               |
| Input                    |                | Input                          |                                 |                      |
| Item                     |                |                                |                                 |                      |
| List                     |                | List                           |                                 |                      |
| Avatar                   |                | Avatar                         |                                 |                      |
| Icons                    |                | Icons                          |                                 |                      |
| Thumbnail                | Image          |                                |                                 |                      |
| Modal                    | Modal          |                                |                                 |                      |
| Navigation               |                |                                | react native navigation         |                      |
| Popover/ More Options    |                |                                | react-native-popover-view       | Low                  |
| Popover/ Message Windows |                | Overlay                        |                                 |                      |
| Progress Indicator       |                | Progress Bar                   |                                 |                      |
| Radio                    |                |                                | radio-buttons-react-native      | Low                  |
| Range                    |                | Slider                         |                                 |                      |
| Refresher                | RefreshControl |                                |                                 |                      |
| Reorder                  |                |                                | react-native-draggable-flatlist | Medium               |
| Search Bar               |                | Search Bar                     |                                 |                      |
| Segment Bar              |                | Button Group                   |                                 |                      |
| Select                   |                |                                | react-native-picker-select      | Medium               |
| Slides                   |                |                                | react-native-swiper             | High                 |
| Tabs - Bottom Navigation |                |                                | react native navigation         |                      |
| Tabs - Top Navigation    |                |                                | react native navigation         |                      |
| Toast                    |                |                                | react-native-toast-message      | Medium               |
| Toggle                   | Switch         |                                |                                 |                      |
| Tiles                    |                |                                |                                 |                      |



## Modification to mobile_sdk

Shangmin, 2021-03-23, commented line 153 to make mobile sdk not change `__locally_updated__` to true when executing upsert data
mobile_sdk/SalesforceMobileSDK-iOS/native/SampleApps/MobileSyncExplorer/MobileSyncExplorerCommon/SObjectDataManager.m
set createBackButton return value to nil
mobile_sdk/SalesforceMobileSDK-iOS/libs/SalesforceSDKCore/SalesforceSDKCore/Classes/Login/SFLoginViewController.m

Bao, 2022-08-16, delete `&& ![self isScreenLockWindow]` to resolve SIGABRT crash issue.
/mobile_sdk/SalesforceMobileSDK-iOS/libs/SalesforceSDKCore/SalesforceSDKCore/Classes/Views/SFSDKWindowManager.m

Bao, 2022-08-16, comment out code `[self.loginHostList addObject:production]; [self.loginHostList addObject:sandbox];` to disable 'production' and 'sandbox' picklist in login screen setting.
/mobile_sdk/SalesforceMobileSDK-iOS/libs/SalesforceSDKCore/SalesforceSDKCore/Classes/Login/LoginHost/SFSDKLoginHostStorage.m line 72, 73

Shangmin, 2023-01-05, comment out code `handleLogout` to avoid multiple user lists.
/mobile_sdk/SalesforceMobileSDK-iOS/libs/SalesforceSDKCore/SalesforceSDKCore/Classes/Util/SFSDKAuthHelper.m line 95-110

Bao, 2023-07-31, change code `handleLogout` to fix multi login notification.
/mobile_sdk/SalesforceMobileSDK-iOS/libs/SalesforceSDKCore/SalesforceSDKCore/Classes/Util/SFSDKAuthHelper.m line 93-95


## QA Deploy manual step
1. Change connected app token to 3MVG9vDPWAliPr7rwWgUaJcKePhcSmtCJGmG4VAMzyYSRTvEyliMkx8VWYfYPji2ebE6CsA2Pp.K_dNvdJRQH in bootconfig.plist
2. Change Bundle ID for HALO Dev Target to com.pepsico.HALOCRMFit
3. Change Display name for HALO Dev Target to HALO QA
4. Change version number for HALO Dev Target
5. Change domain to pbna--qa.my.salesforce.com in HALO Dev-Info.plist

## UAT
1. Change connected app token to 3MVG9SM6_sNwRXqtTE8sHg7LWJvyDuF4IyDhdaGTqgd6VNDphbcdvpUR4stKr7TQsE.C1NgmkXtfTUd46lg5V in bootconfig.plist
2. Change Bundle ID for HALO Dev Target to com.pepsico.HALOCRMUAT
3. Change Display name for SAVVY Dev Target to SAVVY 1.5
4. Change version number for SAVVY Dev Target
5. Change domain to pbna--uat.my.salesforce.com in SAVVY Dev-Info.plist

## PreProd Deploy manual step
1. Change connected app token to 3MVG9jBOyAOWY5bVUQJ0la6WTK23nbkkehXRxAHrv9PLD15No7fHeofcfZ_jcBPeGuaMg8z2cIrnBPCBqO3xw in bootconfig.plist
2. Change Bundle ID for HALO Dev Target to com.pepsico.HALOCRMPreProd
3. Change Display name for SAVVY Dev Target to SAVVY PreProd
4. Change version number for SAVVY Dev Target
5. Change domain to pbna--preprod.my.salesforce.com in SAVVY Dev-Info.plist

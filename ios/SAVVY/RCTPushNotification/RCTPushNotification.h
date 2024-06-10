//
//  RCTPushNotification.h
//  HALO
//
//  Created by XupengBao on 6/11/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTPushNotification : RCTEventEmitter <RCTBridgeModule>

+ (void)didReciveRemoteNotification:(NSDictionary *)userInfo;
+ (void)didReceiveLeadRemoteNotification;
+ (void)didReceiveMerchAndManagerRemoteNotification;

@end

NS_ASSUME_NONNULL_END

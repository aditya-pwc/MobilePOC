//
//  RCTAppTerminateTime.h
//  SAVVY
//
//  Created by Jianmin Shen on 2022/11/1.
//  Copyright © 2022 HALOOrganizationName. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTAppTerminateTime : RCTEventEmitter <RCTBridgeModule>

+ (void)recordRNSscreenTerminateTime;

@end

NS_ASSUME_NONNULL_END

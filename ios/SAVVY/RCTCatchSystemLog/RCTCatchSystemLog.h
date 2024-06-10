//
//  RCTCatchSystemLog.h
//  SAVVY
//
//  Created by Xupeng Bao on 2022/8/17.
//  Copyright © 2022 HALOOrganizationName. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import <MetricKit/MXMetricManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTCatchSystemLog : RCTEventEmitter <RCTBridgeModule>

- (void)didReceiveDiagnostic:(NSDictionary *)logs;

@end

NS_ASSUME_NONNULL_END

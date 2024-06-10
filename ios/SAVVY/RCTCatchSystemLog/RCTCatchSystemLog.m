//
//  RCTCatchSystemLog.m
//  SAVVY
//
//  Created by Xupeng Bao on 2022/8/17.
//  Copyright © 2022 HALOOrganizationName. All rights reserved.
//

#import "RCTCatchSystemLog.h"
#import "React/RCTConvert.h"
@interface RCTCatchSystemLog ()

@end
@implementation RCTCatchSystemLog
RCT_EXPORT_MODULE();

+ (id)allocWithZone:(NSZone *)zone {
    static RCTCatchSystemLog *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super allocWithZone:zone];
    });
    return sharedInstance;
}

- (void)didReceiveDiagnostic:(NSDictionary *)logs {
  NSLog(@"receive diagnostic: %@", logs);
  [self sendEventWithName:@"reveiveDiagnostic" body:logs];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"reveiveDiagnostic"
  ];
}

@end

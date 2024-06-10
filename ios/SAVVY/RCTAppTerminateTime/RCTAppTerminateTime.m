//
//  RCTAppTerminateTime.m
//  SAVVY
//
//  Created by Jianmin Shen on 2022/11/1.
//  Copyright © 2022 HALOOrganizationName. All rights reserved.
//

#import "RCTAppTerminateTime.h"
#import "React/RCTConvert.h"
@interface RCTAppTerminateTime ()

@end

@implementation RCTAppTerminateTime
RCT_EXPORT_MODULE();

+ (void)recordRNSscreenTerminateTime {
    NSUserDefaults *userTerminateTime = [NSUserDefaults standardUserDefaults];
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    df.dateFormat  = @"yyyy/MM/dd HH:mm:ss";
    NSString *str = [df stringFromDate:[NSDate date]];
  NSLog(@"app terminate time:%@", str);
    [userTerminateTime setObject:str forKey:@"AppTerminateTime"];
    [userTerminateTime synchronize];
}

RCT_EXPORT_METHOD(getTerminateTime) {
    NSUserDefaults *userTerminateTime = [NSUserDefaults standardUserDefaults];
    NSDictionary *time = [userTerminateTime objectForKey: @"AppTerminateTime"];
    NSLog(@"app terminate time1:%@", time);
    [self sendEventWithName:@"appLastTerminateTime" body:time];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"appLastTerminateTime"
  ];
}

@end

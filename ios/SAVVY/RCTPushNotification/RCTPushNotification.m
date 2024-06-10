//
//  RCTPushNotification.m
//  HALO
//
//  Created by Christopher on 6/11/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import "RCTPushNotification.h"
#import "React/RCTConvert.h"
#import "SalesforceSDKCore/SFSDKPushNotificationDecryption.h"
@interface RCTPushNotification ()

@end
@implementation RCTPushNotification
RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationReceived:)
                                               name:@"nativeReciveRemoteNotification"
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteLeadNotificationReceived)
                                               name:@"nativeReceiveLeadRemoteNotification"
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteMerchAndManagerNotificationReceived)
                                               name:@"nativeReceiveMerchAndManagerRemoteNotification"
                                             object:nil];
}

- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (void)didReciveRemoteNotification:(NSDictionary *)userInfo {
  NSLog(@"didReciveRemoteNotification: %@", userInfo);
  [[NSNotificationCenter defaultCenter] postNotificationName:@"nativeReciveRemoteNotification" object:self userInfo:userInfo];
}

+ (void)didReceiveLeadRemoteNotification {
  NSLog(@"nativeReceiveLeadRemoteNotification");
  [[NSNotificationCenter defaultCenter] postNotificationName:@"nativeReceiveLeadRemoteNotification" object:self userInfo:nil];
}

+ (void)didReceiveMerchAndManagerRemoteNotification {
  NSLog(@"nativeReceiveMerchAndManagerRemoteNotification");
  [[NSNotificationCenter defaultCenter] postNotificationName:@"nativeReceiveMerchAndManagerRemoteNotification" object:self userInfo:nil];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification {
  NSLog(@"handleRemoteNotificationReceived: %@", notification);
  [self sendEventWithName:@"reciveRemoteNotification" body:notification.userInfo];
}

- (void)handleRemoteLeadNotificationReceived {
  NSLog(@"handleRemoteNotificationReceived");
  [self sendEventWithName:@"receiveLeadRemoteNotification" body:nil];
}

- (void)handleRemoteMerchAndManagerNotificationReceived {
  NSLog(@"handleRemoteMerchAndManagerNotificationReceived");
  [self sendEventWithName:@"receiveMerchAndManagerRemoteNotification" body:nil];
}

RCT_EXPORT_METHOD(requestPermission) {
  [self addListener:@"reciveRemoteNotification"];
}

RCT_EXPORT_METHOD(sendPushNotification) {
    NSUserDefaults *userNotification = [NSUserDefaults standardUserDefaults];
    NSDictionary *userInfo = [userNotification objectForKey: @"RNPushNotification"];
    NSLog(@"user default notification info:%@", userInfo);
    [self sendEventWithName:@"CustomNotification" body:userInfo];
}

RCT_EXPORT_METHOD(cleanNotification) {
    NSUserDefaults *userNotification = [NSUserDefaults standardUserDefaults];
    [userNotification setObject:nil forKey:@"RNPushNotification"];
    [userNotification synchronize];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"CustomNotification",
    @"reciveRemoteNotification",
    @"receiveLeadRemoteNotification",
    @"receiveMerchAndManagerRemoteNotification"
  ];
}

@end

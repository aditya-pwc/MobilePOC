//
//  RCTMapManager.m
//  HALO
//
//  Created by Christopher on 7/26/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import "RCTFootmarksManager.h"
#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>
@import FTMCore;

@interface RCTFootmarksManager ()


@end

@implementation RCTFootmarksManager

RCT_EXPORT_MODULE(RCTFootmarksManager);

RCT_EXPORT_METHOD(registerFootmarks:(NSString *)gpid resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Sign-in with: %@", gpid);
  if(gpid == nil || [gpid  isEqual: @""]){
      reject(@"Failure", @"GPID is null", nil);
    return;
  }
  [FTMSession signInWithAppKey:@"XBG6716232HSB" appSecret:@"QhSMeLkKTDDeCgBSDJdLGxhQreTPWuk2" globalRegion:FTMGlobalRegionNorthAmerica
    username:gpid completion:^(NSError *error)
  {
    if (error != nil) {
      NSLog(@"Sign-in error: %@", error);
      reject(@"Failure", @"Footmarks signin failed", error);
    }
    else {
      NSLog(@"Sign-in success");
      resolve(@"Sign-in success");
    }
  }];
}

@end

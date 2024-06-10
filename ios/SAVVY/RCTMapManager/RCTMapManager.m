//
//  RCTMapManager.m
//  HALO
//
//  Created by XupengBao on 7/9/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import "RCTMapManager.h"
#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>

@interface RCTMapManager ()

@end

@implementation RCTMapManager

RCT_EXPORT_MODULE(RCTMapManager);

RCT_EXPORT_METHOD(getLocationWithAddress:(NSString *)address resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (address == nil || address == NULL || [address isEqual: @""]) {
    resolve(@"Have no address");
    return;
  }
  CLGeocoder *geocoder = [[CLGeocoder alloc] init];
  [geocoder geocodeAddressString:address completionHandler:^(NSArray<CLPlacemark *> * _Nullable placemarks, NSError * _Nullable error) {
    if (error != nil) {
      reject(@"Failure", @"Get location Error - Wrong address.", nil);
    }
    if (!error) {
      CLPlacemark *firstPlacemark = [placemarks firstObject];
      CLLocationDegrees latitude = firstPlacemark.location.coordinate.latitude;
      CLLocationDegrees longitude = firstPlacemark.location.coordinate.longitude;
      NSString *latStr = [[NSString alloc] initWithFormat:@"%f", latitude];
      NSString *lonStr = [[NSString alloc] initWithFormat:@"%f", longitude];
      NSDictionary *location = @{@"latitude": latStr, @"longitude": lonStr};
      resolve(location);
      NSLog(@"latitude is %f, longitude is %f", latitude, longitude);
      NSLog(@"this is placemarks: %@", placemarks);
    }
  }];
}

RCT_EXPORT_METHOD(calculateWithPoints:(NSArray *)pointArr resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if ([pointArr count] < 2) {
    resolve(@{});
//    reject(@"Failure", @"Query Error - Points less than 2.", nil);
    return;
  }
  
  __block double distance = 0;
  __block double travelTime = 0;
  NSMutableArray *detailArray = [[NSMutableArray alloc] init];
  NSArray *points = [[NSArray alloc] initWithArray:pointArr];
  NSDecimalNumberHandler *roundingBehavior = [NSDecimalNumberHandler decimalNumberHandlerWithRoundingMode:NSRoundPlain
                   scale:0
            raiseOnExactness:NO
             raiseOnOverflow:NO
            raiseOnUnderflow:NO
           raiseOnDivideByZero:NO];

  dispatch_queue_t serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
  dispatch_async(serialQueue, ^{
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    for (int i = 0; i < [points count] - 1; i++) {
      if (![points[i] objectForKey:@"latitude"] || ![points[i] objectForKey:@"longitude"]) {
        distance += 1;
        NSDictionary *dictionary = @{@"distance":@(1), @"travelTime":@(0)};
        [detailArray addObject:dictionary];
        continue;
      }
      CLLocation *startLocation = [[CLLocation alloc] initWithLatitude:[[points[i] objectForKey:@"latitude"] doubleValue] longitude:[[points[i] objectForKey:@"longitude"] doubleValue]];
      CLLocation *endLocation = [[CLLocation alloc] initWithLatitude:[[points[i + 1] objectForKey:@"latitude"] doubleValue] longitude:[[points[i + 1] objectForKey:@"longitude"] doubleValue]];
      MKDirectionsRequest *request = [[MKDirectionsRequest alloc] init];
      MKPlacemark *startMark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake(startLocation.coordinate.latitude, startLocation.coordinate.longitude)];
      MKPlacemark *endMark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake(endLocation.coordinate.latitude, endLocation.coordinate.longitude)];
      request.source = [[MKMapItem alloc] initWithPlacemark:startMark];
      request.destination = [[MKMapItem alloc] initWithPlacemark:endMark];
      request.transportType = MKDirectionsTransportTypeAutomobile;
      MKDirections *direction = [[MKDirections alloc] initWithRequest:request];
      __weak typeof(self) weakSelf = self;
      [direction calculateDirectionsWithCompletionHandler:^(MKDirectionsResponse * _Nullable response, NSError * _Nullable error) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (error != nil) {
          distance += 1;
          NSDictionary *dictionary = @{@"distance":@(1), @"travelTime":@(0)};
          
          [detailArray addObject:dictionary];
        }
        if (!error) {
//          distance += response.routes.firstObject.distance;
//          travelTime += response.routes.firstObject.expectedTravelTime;
          
          NSDecimalNumber *originDistanceNum = [[NSDecimalNumber alloc] initWithDouble:((response.routes.firstObject.distance / 1000) * 0.62137)];
          NSDecimalNumber *distanceNum = [originDistanceNum decimalNumberByRoundingAccordingToBehavior:roundingBehavior];
          
          NSDecimalNumber *originTravalTimeNum = [[NSDecimalNumber alloc] initWithDouble:(response.routes.firstObject.expectedTravelTime / 60)];
          NSDecimalNumber *travelTimeNum = [originTravalTimeNum decimalNumberByRoundingAccordingToBehavior:roundingBehavior];
          distance += [distanceNum doubleValue];
          travelTime += [travelTimeNum doubleValue];
          NSDictionary *dictionary = @{@"distance":[distanceNum stringValue], @"travelTime":[travelTimeNum stringValue]};
          
          [detailArray addObject:dictionary];
        }
        dispatch_semaphore_signal(sema);
      }];
      dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    }
    NSLog(@"TEST");
    NSDecimalNumber *originTotalDistance = [[NSDecimalNumber alloc] initWithDouble:distance];
    NSDecimalNumber *totalDistance = [originTotalDistance decimalNumberByRoundingAccordingToBehavior:roundingBehavior];
    
    NSDecimalNumber *originTravelTime = [[NSDecimalNumber alloc] initWithDouble:travelTime];
    NSDecimalNumber *totalTravelTime = [originTravelTime decimalNumberByRoundingAccordingToBehavior:roundingBehavior];
    
    NSDictionary *resolveInfo = @{@"totalDistance": totalDistance, @"totalTravelTime": totalTravelTime, @"detailList": detailArray};
    
    resolve(resolveInfo);
  });
}

@end

//
//  RCTMultiBundleLoad.m
//  SAVVY
//
//  Created by Xupeng Bao on 2023/6/27.
//  Copyright © 2023 SAVVYOrganizationName. All rights reserved.
//

#import "RCTMultiBundleLoad.h"
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>
#import <SalesforceSDKCore/SFSDKAuthHelper.h>
#import <SalesforceSDKCore/SFSDKWindowManager.h>
#import "RCTBridge.h"
#import <React/RCTBridge+Private.h>
#import "AppDelegate.h"

@implementation RCTMultiBundleLoad
RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(LoadingBundleWithName:(NSString *)bundleName) {
  [self loadBuzBundleWithName:bundleName];
}

RCT_EXPORT_METHOD(isMultiBundleExist:(RCTResponseSenderBlock)callback) {
  NSString *bundleFileName = @"bundle/common";
  NSString *bundleFileExtension = @"jsbundle";

  // Get the bundle file path
  NSBundle *mainBundle = [NSBundle mainBundle];
  NSString *bundlePath = [mainBundle pathForResource:bundleFileName ofType:bundleFileExtension];

  // Determine if a file exists
  NSFileManager *fileManager = [NSFileManager defaultManager];
  if ([fileManager fileExistsAtPath:bundlePath]) {
    callback(@[@"YES"]);
  } else {
    callback(@[@"NO"]);
  }
}

- (void)loadBuzBundleWithName:(NSString *)bundleName {
  NSLog(@"RCTCXXBridge loadBuzBundle");
  NSURL *jsCodeLocationBuz;
  AppDelegate *delegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIWindow *window = (UIWindow *)[UIApplication sharedApplication].delegate.window;
  if ([bundleName isEqual:@"SAVVY"]) {
    jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:@"bundle/savvy.ios" withExtension:@"jsbundle"];
  } else if ([bundleName isEqual:@"Orderade"]) {
    jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:@"bundle/orderade.ios" withExtension:@"jsbundle"];
  }
  NSError *error = nil;
  NSData *sourceBuz = [NSData dataWithContentsOfFile:jsCodeLocationBuz.path
                                             options:NSDataReadingMappedIfSafe
                                               error:&error];
  [delegate.bridge.batchedBridge executeSourceCode:sourceBuz withSourceURL:jsCodeLocationBuz sync:NO];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:delegate.bridge moduleName:bundleName initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  window.rootViewController = rootViewController;
  return;
}

@end

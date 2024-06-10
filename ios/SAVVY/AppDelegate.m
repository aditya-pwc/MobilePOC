/*
 Copyright (c) 2020-present, salesforce.com, inc. All rights reserved.
 
 Redistribution and use of this software in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list of conditions
 and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 conditions and the following disclaimer in the documentation and/or other materials provided
 with the distribution.
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to
 endorse or promote products derived from this software without specific prior written
 permission of salesforce.com, inc.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#import "AppDelegate.h"
#import "Orientation.h"
#import "InitialViewController.h"
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>
#import <SalesforceSDKCore/SFSDKAppConfig.h>
#import <SalesforceSDKCore/SFPushNotificationManager.h>
#import <SalesforceSDKCore/SFDefaultUserManagementViewController.h>
#import <SalesforceSDKCore/SalesforceSDKManager.h>
#import <SalesforceSDKCore/SFUserAccountManager.h>
#import <SalesforceReact/SalesforceReactSDKManager.h>
#import <SalesforceSDKCore/SFLoginViewController.h>
#import <SalesforceReact/SFSDKReactLogger.h>
#import <SalesforceSDKCore/SFSDKAuthHelper.h>
#import <UserNotifications/UserNotifications.h>
#import <ADEUMInstrumentation/ADEUMInstrumentation.h>
#import "SalesforceSDKCore/SFSDKPushNotificationDecryption.h"
#import <UserNotifications/UNNotificationServiceExtension.h>
#import "RCTPushNotification.h"
#import "RCTCatchSystemLog.h"
#import "RCTAppTerminateTime.h"
#import <React/RCTLinkingManager.h>
#import "RCTBridge.h"
#import <React/RCTBridge+Private.h>
#import <RNFSManager.h>

@import FTMCore;

@interface AppDelegate ()
{
  UIViewController *rootViewController;
  BOOL isBuzLoaded;
}
@end


@implementation AppDelegate

- (id)init
{
    self = [super init];
    if (self) {
      // Need to use SalesforceReactSDKManager in Salesforce Mobile SDK apps using React Native
      [SalesforceReactSDKManager initializeSDK];
      
      //App Setup for any changes to the current authenticated user
      [SFSDKAuthHelper registerBlockForCurrentUserChangeNotifications:^{
        [self resetViewState:^{
          [self setupRootViewController];
        }];
      }];
    }
    return self;
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}

- (void)applicationWillTerminate:(UIApplication *)application {
  [RCTAppTerminateTime recordRNSscreenTerminateTime];
};

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
    ADEumAgentConfiguration *config = [[ADEumAgentConfiguration alloc]
                                       initWithAppKey:@"AD-AAB-ABD-TNW"];
    config.collectorURL = @"https://col.eum-appdynamics.com";
    config.screenshotURL = @"https://image.eum-appdynamics.com";
    [ADEumInstrumentation initWithConfiguration: config];
    [self initMetric];
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    [self initializeAppViewState];
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    
    // If you wish to register for push notifications, uncomment the line below.  Note that,
    // if you want to receive push notifications from Salesforce, you will also need to
    // implement the application:didRegisterForRemoteNotificationsWithDeviceToken: method (below).
    [self registerForRemotePushNotifications];
    
    //Uncomment the code below to see how you can customize the color, textcolor, font and fontsize of the navigation bar
//    [self customizeLoginView];
  
  [SFSDKAuthHelper loginIfRequired:^{
    [self setupRootViewController];
  }];
    return YES;
}

- (void)initMetric {
  if (@available(iOS 14.0, *)) {
    MXMetricManager *manager = [MXMetricManager sharedManager];
    if (self && manager && [manager respondsToSelector:@selector(addSubscriber:)]) {
      [manager addSubscriber:self];
    }
  }
}

- (void)registerForRemotePushNotifications {
    [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [[SFPushNotificationManager sharedInstance] registerForRemoteNotifications];
             });
        }

        if (error) {
            [SFLogger e:[self class] format:@"Push notification authorization error: %@", error];
        }
    }];
}

- (void)customizeLoginView {
    SFSDKLoginViewControllerConfig *loginViewConfig = [[SFSDKLoginViewControllerConfig  alloc] init];
    // Set showSettingsIcon to NO if you want to hide the settings icon on the nav bar
    loginViewConfig.showSettingsIcon = YES;
    // Set showNavBar to NO if you want to hide the top bar
    loginViewConfig.showNavbar = YES;
    loginViewConfig.navBarColor = [UIColor colorWithRed:0.051 green:0.765 blue:0.733 alpha:1.0];
    loginViewConfig.navBarTitleColor = [UIColor whiteColor];
    loginViewConfig.navBarFont = [UIFont fontWithName:@"Helvetica" size:16.0];
    [SFUserAccountManager sharedInstance].loginViewControllerConfig = loginViewConfig;
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    // Uncomment the code below to register your device token with the push notification manager
    [self didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [[SFPushNotificationManager sharedInstance] didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
    if ([SFUserAccountManager sharedInstance].currentUser.credentials.accessToken != nil) {
     [[SFPushNotificationManager sharedInstance] registerSalesforceNotificationsWithCompletionBlock:nil failBlock:nil];
    }
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    // Respond to any push notification registration errors here.
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    // Uncomment following block to enable IDP Login flow
    // return [self enableIDPLoginFlowForURL:url options:options];
    return [RCTLinkingManager application:app openURL:url options:options];
    // return NO;
}

- (BOOL)enableIDPLoginFlowForURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
     return [[SFUserAccountManager sharedInstance] handleIDPAuthenticationResponse:url options:options];
}
#pragma mark - Private methods

- (void)initializeAppViewState
{
    if (![NSThread isMainThread]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self initializeAppViewState];
        });
        return;
    }

    self.window.rootViewController = [[InitialViewController alloc] initWithNibName:nil bundle:nil];
    [self.window makeKeyAndVisible];
}

- (void)setupRootViewController
{
  self.bridge = [[RCTBridge alloc] initWithDelegate:self
                                          launchOptions:self.launchOptions];


#if DEBUG
//  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
//                                                          moduleName:@"SAVVY"
//                                                   initialProperties:nil
//                                                       launchOptions:self.launchOptions];
    
      RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                                       moduleName:@"SAVVY"
                                                initialProperties: nil ];
    
      rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
#else
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                                   moduleName:@"Common"
                                            initialProperties: nil ];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"bundle/common" withExtension:@"jsbundle"];
#endif
}

- (void)resetViewState:(void (^)(void))postResetBlock
{
    if ([self.window.rootViewController presentedViewController]) {
        [self.window.rootViewController dismissViewControllerAnimated:NO completion:^{
            postResetBlock();
        }];
    } else {
        postResetBlock();
    }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"reciveRomoteNotification: %@", userInfo);
//  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
    UNNotificationServiceExtension *extensions = [[UNNotificationServiceExtension alloc] init];
    UNNotification* notification = response.notification;
    [extensions didReceiveNotificationRequest:notification.request withContentHandler:^(UNNotificationContent * _Nonnull contentToDeliver) {
      UNMutableNotificationContent *content = [contentToDeliver mutableCopy];
      NSString *originBody = @"";
      if (content.userInfo && content.userInfo[@"aps"] && content.userInfo[@"aps"][@"alert"] && content.userInfo[@"aps"][@"alert"][@"body"]) {
        originBody = [content.userInfo[@"aps"][@"alert"][@"body"] mutableCopy];
      }
      [SFSDKPushNotificationDecryption decryptNotificationContent:content error:nil];
      NSUserDefaults *userNotification = [NSUserDefaults standardUserDefaults];
      [userNotification setObject:content.userInfo forKey:@"RNPushNotification"];
      [userNotification synchronize];
      //  [UIApplication sharedApplication].applicationIconBadgeNumber=0;
      NSLog(@"nb=======%@", content.userInfo);
      NSLog(@"origin body=======%@", originBody);
      NSDictionary *noti = [content.userInfo mutableCopy];
      [noti setValue:originBody forKey:@"NotificationTitle"];
      [RCTPushNotification didReciveRemoteNotification:noti];
    }];
}
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  UNNotificationContent *content = notification.request.content;
  if ([content.title isEqualToString: @"Visit Duration Update"]) {
    UIApplicationState state = [UIApplication sharedApplication].applicationState;
    if (state == UIApplicationStateActive) {
      NSString *message = [content.body stringByAppendingString:@" Ensure you complete your visit when finished."];
      UIAlertView *alert = [[UIAlertView alloc] initWithTitle:content.title message:message delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
      [alert show];
      return;
    } else {
      completionHandler(UNNotificationPresentationOptionSound |
                        UNNotificationPresentationOptionAlert |  UNNotificationPresentationOptionBadge);
      return;
    }
  }

  [RCTPushNotification didReceiveLeadRemoteNotification];
  [RCTPushNotification didReceiveMerchAndManagerRemoteNotification];
  completionHandler(UNNotificationPresentationOptionSound |
                    UNNotificationPresentationOptionAlert |  UNNotificationPresentationOptionBadge);
}

- (void)didReceiveDiagnosticPayloads:(NSArray<MXDiagnosticPayload *> *)payloads  API_AVAILABLE(ios(14.0)){
  if (@available(iOS 14.0, *)) {
    RCTCatchSystemLog *log = [RCTCatchSystemLog allocWithZone:nil];
    NSLog(@"The diagnostic array: %@", payloads);
    NSMutableArray *logs = [NSMutableArray new];
    for (MXDiagnosticPayload *payload in payloads) {
      NSDictionary *payloadDic = [payload dictionaryRepresentation];
      NSLog(@"the diagnostic payload:%@", payloadDic);
      [log didReceiveDiagnostic:payloadDic];
      [logs addObject:payloadDic];
    }
    NSLog(@"the diagnostic payload:%@", logs);
  }
}

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)(void))completionHandler
{
  [RNFSManager setCompletionHandlerForIdentifier:identifier completionHandler:completionHandler];
}

@end

//
//  RCTRefreshToken.m
//  HALO
//
//  Created by XupengBao on 6/6/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import "RCTRefreshToken.h"
#import <SFOAuthSessionRefresher.h>

@interface RCTRefreshToken ()

@property (nonatomic, strong) SFOAuthSessionRefresher *oauthSessionRefresher;
@property (nonatomic, assign) int retryCount;

@end

@implementation RCTRefreshToken
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(doTest:(NSString *)testString) {
  NSLog(@"iOS function: %@", testString);
}

- (SFOAuthSessionRefresher *)sessionRefresherForUser:(SFUserAccount *)user {
    @synchronized (self) {

        /*
         * Session refresher should be a class level property because it gets de-allocated before
         * the callback is triggered otherwise, leading to a timeout or cancellation.
         */
        if (!self.oauthSessionRefresher) {
            self.oauthSessionRefresher = [[SFOAuthSessionRefresher alloc] initWithCredentials:user.credentials];
        }
    }
    return self.oauthSessionRefresher;
}

- (void) requestWithSuccessBlock:(RCTPromiseResolveBlock)successBlock failureBlock:(RCTPromiseRejectBlock)failedBlock{
  SFOAuthSessionRefresher *sessionRefresher = [self sessionRefresherForUser:[SFUserAccountManager sharedInstance].currentUser];
  __weak __typeof(self) weakSelf = self;
  [sessionRefresher refreshSessionWithCompletion:^(SFOAuthCredentials * updatedCredentials) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    strongSelf.oauthSessionRefresher = nil;
    successBlock(updatedCredentials.accessToken);
    NSLog(@"Refresh token successed: %@", updatedCredentials.accessToken);
  } error:^(NSError * refreshError) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    if (strongSelf.retryCount > 0) {
      strongSelf.retryCount = strongSelf.retryCount - 1;
      [strongSelf requestWithSuccessBlock:successBlock failureBlock:failedBlock];
    }else{
      failedBlock(@"failure", @"refresh failed", refreshError);
    }
  }];
}

RCT_EXPORT_METHOD(rnRefreshToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @synchronized (self) {
    self.retryCount = 1;
    [self requestWithSuccessBlock:resolve failureBlock:reject];

  }
}

@end

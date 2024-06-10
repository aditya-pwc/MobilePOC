//
//  RCTBridge.h
//  SAVVY
//
//  Created by Xupeng Bao on 2023/6/27.
//  Copyright © 2023 SAVVYOrganizationName. All rights reserved.
//

#import <Foundation/Foundation.h>

// RN private class, exposes interface
@interface RCTBridge (RnLoadJS)

- (void)executeSourceCode:(NSData *)sourceCode sync:(BOOL)sync;

- (void)executeSourceCode:(NSData *)sourceCode withSourceURL:(NSURL *)url sync:(BOOL)sync;

@end

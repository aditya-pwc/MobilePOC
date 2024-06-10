//
//  UtilsManager.m
//  HALO
//
//  Created by Mengying Qian on 6/20/21.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//


#import "UtilsManager.h"

@implementation UtilsManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(convertBase64ToFile : (NSDictionary *)data findEvents : (RCTResponseSenderBlock)callback)
{
    NSString *base64String = [data valueForKey: @"Base64String"];
    NSString *fileName = [data valueForKey: @"FileName"];
    NSString *targetFolderName = [data valueForKey: @"TargetFolderName"];
    NSData *baseData = [[NSData alloc]initWithBase64EncodedString: base64String options: NSDataBase64DecodingIgnoreUnknownCharacters];
    NSArray *documentPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,  NSUserDomainMask,YES);
    NSString *documentDirectory = [documentPaths objectAtIndex: 0];
    NSString *sourceFilePath = [documentDirectory stringByAppendingPathComponent: fileName];
    NSString *targetFilePath = [documentDirectory stringByAppendingPathComponent: targetFolderName];

    [baseData writeToFile: sourceFilePath atomically: YES];
    NSDictionary *dict = @{
      @"sourcePath": sourceFilePath,
      @"targetPath": targetFilePath
    };
    
    callback(@[[NSNull null], dict]);
}

RCT_EXPORT_METHOD(getDocumentDirectory: (RCTResponseSenderBlock)callback)
{
    NSArray *documentPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,  NSUserDomainMask,YES);
    if ([documentPaths count] > 0) {
      NSString *documentDirectory = [documentPaths objectAtIndex: 0];
      callback(@[[NSNull null], documentDirectory]);
    } else {
      callback(@[[NSNull null], @""]);
    }
}

@end


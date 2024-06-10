//
//  CompressImageManager.m
//  HALO
//
//  Created by jifangfang on 2021/6/4.
//  Copyright © 2021 HALOOrganizationName. All rights reserved.
//

#import "CompressImageManager.h"
#import <UIKit/UIKit.h>
@implementation CompressImageManager
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(compressImageWithData:(NSString *)bas64Data toKB:(NSUInteger)length callback:(RCTResponseSenderBlock)callback)
{
  NSUInteger maxLength = length * 1024;
  NSData *_decodedImageData   = [[NSData alloc] initWithBase64EncodedString:bas64Data options:NSDataBase64DecodingIgnoreUnknownCharacters];
  UIImage *resultImage = [UIImage imageWithData:_decodedImageData];
   NSData *data = UIImageJPEGRepresentation(resultImage, 1);
   NSUInteger lastDataLength = 0;
   while (data.length > maxLength && data.length != lastDataLength) {
   lastDataLength = data.length;
   CGFloat ratio = (CGFloat)maxLength / data.length;
   CGSize size = CGSizeMake((NSUInteger)(resultImage.size.width * sqrtf(ratio)), (NSUInteger)(resultImage.size.height * sqrtf(ratio))); // Use NSUInteger to prevent white blank
   UIGraphicsBeginImageContext(size);
   // Use image to draw (drawInRect:), image is larger but more compression time
   // Use result image to draw, image is smaller but less compression time
   [resultImage drawInRect:CGRectMake(0, 0, size.width, size.height)];
   resultImage = UIGraphicsGetImageFromCurrentImageContext();
   UIGraphicsEndImageContext();
   data = UIImageJPEGRepresentation(resultImage, 1);
   }
  NSString * base64Data = [data base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
  callback(@[base64Data, [NSNull null]]);
}
@end

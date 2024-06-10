// RNTMapManager.m
#import <React/RCTViewManager.h>

#ifdef SAVVY
#import "SAVVY-Swift.h"
#endif

#ifdef SAVVY_Dev
#import "SAVVY_Dev-Swift.h"
#endif

#ifdef SAVVY_QA
#import "SAVVY_QA-Swift.h"
#endif

#ifdef SAVVY_PreProd
#import "SAVVY_PreProd-Swift.h"
#endif

#ifdef SAVVY_UAT
#import "SAVVY_UAT-Swift.h"
#endif

#ifdef SAVVY_ProdS
#import "SAVVY_ProdS-Swift.h"
#endif

@interface RNTMapstedManager : RCTViewManager
@end

@implementation RNTMapstedManager

RCT_EXPORT_MODULE(RNTMap)

- (UIView *)view
{
  return [[RNTMapstedView alloc] init];
}
RCT_EXPORT_VIEW_PROPERTY(propertyId, int)
RCT_EXPORT_VIEW_PROPERTY(unloadMap, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onLoadCallback, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSelectLocation, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnloadCallback, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onInitialCallback, RCTBubblingEventBlock)

@end

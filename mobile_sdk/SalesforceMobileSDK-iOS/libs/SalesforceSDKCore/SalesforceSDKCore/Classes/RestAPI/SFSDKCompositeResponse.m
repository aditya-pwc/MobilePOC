/*
Copyright (c) 2019-present, salesforce.com, inc. All rights reserved.

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

#import "SFSDKCompositeResponse+Internal.h"

NSString * const kCompositeResponse = @"compositeResponse";
NSString * const kHttpStatusCode = @"httpStatusCode";
NSString * const kHttpHeaders = @"httpHeaders";
NSString * const kReferenceId = @"referenceId";
NSString * const kBody = @"body";

@implementation SFSDKCompositeSubResponse

-(instancetype)initWith:(NSDictionary *)dict {
    if (self=[super init]) {
        _dict = dict;
        _body =  [dict objectForKey:kBody];
        _httpHeaders = [dict objectForKey:kHttpHeaders];
        _httpStatusCode = [[dict objectForKey:kHttpStatusCode] integerValue];
        _referenceId =  [dict objectForKey:kReferenceId];
    }
    return self;
}

- (NSString*)description {
    return [self.dict description];
}

@end

@implementation SFSDKCompositeResponse

-(instancetype)initWith:(NSDictionary *)dict {
    if (self=[super init]) {
        NSArray<NSDictionary *> *results =  [dict objectForKey:kCompositeResponse];
        if (results) {
            NSMutableArray  *subResponses = [[NSMutableArray alloc] init];
            [results enumerateObjectsUsingBlock:^(NSDictionary * obj, NSUInteger idx, BOOL *stop) {
                [subResponses addObject:[[SFSDKCompositeSubResponse alloc] initWith:obj]];
            }];
           _subResponses = subResponses;
        }
    }
    return self;
}
@end

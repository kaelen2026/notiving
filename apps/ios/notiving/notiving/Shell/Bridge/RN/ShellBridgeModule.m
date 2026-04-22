#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShellBridge, NSObject)

RCT_EXTERN_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getUserId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(navigate:(NSString *)url)
RCT_EXTERN_METHOD(back)
RCT_EXTERN_METHOD(ready)

@end

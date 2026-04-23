#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ShellBridge, NSObject)

// Session
RCT_EXTERN_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getUserId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(NSInteger)count)

// Navigation
RCT_EXTERN_METHOD(navigate:(NSString *)url opts:(NSDictionary *)opts)
RCT_EXTERN_METHOD(back)
RCT_EXTERN_METHOD(setTitle:(NSString *)title)
RCT_EXTERN_METHOD(setNavBarHidden:(BOOL)hidden)

// Analytics
RCT_EXTERN_METHOD(track:(NSString *)event params:(NSDictionary *)params)
RCT_EXTERN_METHOD(pageView:(NSString *)pageName)

// Permission
RCT_EXTERN_METHOD(requestPermission:(NSString *)type resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(checkPermission:(NSString *)type resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// Lifecycle
RCT_EXTERN_METHOD(ready)

// Device
RCT_EXTERN_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAppVersion:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

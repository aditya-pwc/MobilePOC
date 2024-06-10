# Modularization

## Roadmap

1. build base/UI component/file. DONE
2. summarize the image src. DONE
3. load module based on business. IN PROGRESS
4. Business Entry. IN PROGRESS
5. Business Component Abstract.
6. async task enhancement(scheduler). 
7. minimize the config
8. sync down enhancement(native).


## Release Notes

### 2023-07-06
* Changed the way the RN loads jsbundle to multi-bundle according to the persona of the login, added a multi-bundle packaging script, and backed up the original packaging script of the RN.

>Please add to the `Build React Native code and images` of your iOS project when you need to use it.

multi-bundle packaging script:
```
../build_multi_bundle.sh
```

original packaging script:
```
../node_modules/react-native/scripts/react-native-xcode.sh
```

### 2023-06-28
* Switch


### 2023-06-28
* Rating


### 2023-06-23
* update the form bottom button location.

### 2023-06-21
* update the babel config
* add a new base UI component Badge.

### 2023-06-14
* the location of get user info 
* the location of the exeAsyncFunc
* Landing Screen


### 2023-06-13
* redundant code
* login screen
* persona
* get location utils

### 2023-06-12
* OrderManagerUtils
* Loading
* icon helper to render different behaviour based on the icon
* CModal
* date pick view
* Quick Link
* week bar

### 2023-06-06
#### path update
* store log and store class log
* Log enum
* label

### 2023-06-05
#### path update
* DateUtils

### 2023-06-03
#### path update
* GlobalModal
* TimeFormat
* MomentStartOf
* MomentUnit
* Checkbox
* CommonStyle

### 2023-06-02

#### path update
* ImageSrc
* BrandingLoading
* Loading
* CText
* Collpsible
* TitleModal

#### rebuild depth
* Now the depth can be built during the retrieving phase, default to true.
* Add a param to let the developer choose if rebuild the depth during the retrieving phase.
* For compatibility, the default value of the param is false is old SoupService.retrieveDataFromSoup.

### 2023-06-01
* Now rebuildObjectDepth supports multi level transfer.

### 2023-05-31
* update the project structure


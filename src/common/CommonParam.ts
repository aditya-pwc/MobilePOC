/*
 * @Description:
 * @Author: Shangmin Dou
 * @Date: 2021-09-07 21:42:35
 * @LastEditTime: 2024-01-26 15:13:58
 * @LastEditors: Tom tong.jiang@pwc.com
 */
import { UserAccount } from 'common-mobile-lib/@common-mobile-lib/sf-oauth-engine/src/Interface'
import { Languages, FeatureToggle } from '../savvy/enums/Contract'
import { Persona } from './enums/Persona'

export const CommonParam = {
    /* <========== Application ==========> */
    /* <=================================> */
    // salesforce api version
    apiVersion: 'v51.0',
    // instance url
    endpoint: '',
    // application tab that needs to be displayed
    tab: [],
    // The obj needs to be pulled to the local database
    objs: [],
    // application locale
    locale: '',
    // application sync configuration json assignment
    syncConfig: null,
    // used to check if the sync process is in progress
    isSyncing: false,
    // When init sync occurs on the application, this value is updated to the date when sync was completed
    lastModifiedDate: new Date('2021-01-01').toISOString(),
    // Different levels of Toggle switches
    FeatureToggleBundle: {
        Persona: null,
        Location: null,
        Route: null,
        GPID: null
    },
    // Is to support any mobile toggles, current (ATC, Ordering, and CDA Map View) or future, at any of the levels (Route, Location, Market, Region, Persona, GPID)
    FeatureToggle: {} as Record<FeatureToggle, boolean>,

    /* <========== User ==========> */
    /* <==========================> */
    // login user information returned when authorizing login to the app
    user: null as unknown as UserAccount,
    // location name of login user returned when logging in to the app and switch location
    userLocationName: '',
    // login user name
    userName: '',
    // login user id
    userId: '',
    // login user email which is used in delivery time window email.
    Email: '',
    // login user info which is used in my profile and copilot page.
    userInfo: {
        Name: '',
        FirstName: '',
        LastName: '',
        userStatsId: ''
    },
    // time zone of login user
    userTimeZone: '',
    currentLocationTimeZone: '',
    // user time zone offset set of login user
    userTimeZoneOffset: 'localtime',
    // time zone Z of login user
    userTimeZoneZ: 'Z',
    // used to check if user can change location
    multiLocation: false,
    // login user location picklist
    locationArr: [],
    // Authorization information access token which is used to get the image URL from salesforce
    accessToken: '',
    // user persona
    selectedTab: '',
    // The current Location Id selected by the user
    userLocationId: '',
    // Indicates the route id selected by the user
    userRouteId: '',
    // Indicates the route name selected by the user
    userRouteGTMUId: '',
    // login user profile name
    profileName: '',
    // login user persona
    PERSONA__c: '' as Persona,
    // login user business unit
    BU_ID__c: '',
    // login user Employee Id
    GPID__c: '',
    // stores successful or unsuccessful registrations status
    footmarkRegistered: false,
    // login user countrycode
    CountryCode: null,
    // login user mobile phone
    MobilePhone: null,
    // login user language
    currentLanguage: Languages.English.toString(),
    // login user email
    UserEmail: '',

    /* <========== Integration/Tools - okta ==========> */
    /* <==============================================> */
    // okta token last refreshed time
    breadcrumbsLastSyncTime: '',
    // okta token
    breadcrumbsAccessToken: '',
    // okta token validity time
    breadcrumbsRefreshHours: '',

    /* <========== Integration/Tools - share point ==========> */
    /* <=====================================================> */
    // Share Point Equipment Access
    equipmentSharePointToken: '',

    /* <========== Integration/Tools - planogram ==========> */
    /* <===================================================> */
    // Used to connect the integrated planogram system to obtain the desired PDF for MM/MD
    planogram: {
        PBNA_PLANOGRAM_BEVOPT: '',
        PBNA_PLANOGRAM_POG: '',
        PBNA_PLANOGRAM_COOKIE: '',
        PBNA_PLANOGRAM_USERNAME: '',
        PBNA_PLANOGRAM_PASSWORD: ''
    },
    mapsted: {
        PBNA_MAPSTEDTWEAKS_USERNAME: '',
        PBNA_MAPSTEDTWEAKS_PASSWORD: ''
    },
    /* <========== Integration/Tools - DAM ==========> */
    /* <=============================================> */
    // Authentication information for the DAM system used to store the images needed for the innovation product
    innovation: {
        // Authentication information client id used to connect to the image database DAM
        PBNA_INNOVATION_CLIENT_ID: '',
        // Authentication information client secret used to connect to the image database DAM
        PBNA_INNOVATION_CLIENT_SECRET: ''
    },

    /* <========== Business Module ==========> */
    /* <=====================================> */
    // in progress visit
    visitStatus: {},
    // Initialization complete status in Visit?
    isProcessInitialJobDone: false,
    /* When init sync occurs on the application,
    this value is updated to the today date, When the user refreshes the data on the 'MyLead' page,
    incremental updates are made based on this value, synchronizing the record of Contact, Task, Customer_to_Route__c */
    lastMyLeadsRefreshDate: new Date().toISOString(),
    // used to check if the current user switch location
    isSwitchLocation: false,
    // used to check if the current user switch route
    isSwitchRoute: false,
    // Used to store whether the user has switched Persona
    isSwitchPersona: false,
    // used to check if the current user can switch persona
    canSwitchPersona: false,
    // used to check if user login for the first time.
    isFirstTimeUser: true,
    /* When the PSR switches the front and background of the app,
    the system checks whether the last init sync time and the current time are the same day,
    and the same set 'true'; otherwise the value set 'false'. When the user switches to the front using the app,
    if this value is 'true', an init sync is triggered */
    isPSRForceDailySync: false,

    /* <========== Business Module - MM ==========> */
    /* <==========================================> */
    // weekly working hour threshold
    weeklyHourThreshold: 50,
    // daily working hour threshold
    dailyHourThreshold: 10,
    // Store the Visit List Id of the manager user
    svgId: '',
    // Used to determine whether the current user is focused on the 'ReviewNewSchedule' page
    inRNSScreen: false,

    /* <========== Business Module - MD ==========> */
    /* <==========================================> */
    // the value of PBNA Merchandiser Area
    LocationArea: '001',
    // MD's visit page, meeting is in progress
    inMeeting: false,
    // A list of stores with geofence exists
    geoLocationList: [],
    // used in init sync build query related logic
    uniqueAccountIds: [],
    // used in init sync build query related logic
    uniqueStoreIds: [],
    // used in visit related logic
    Is_Night_Shift__c: false,
    // Prefix of the image address in InStoreMap
    ImageFilesPath: '',

    /* <========== Business Module - Rep ==========> */
    /* <===========================================> */
    // used to check if user can see the 'Add To Cart' button.
    isATC: false,
    // Describes whether the "Leads" is included in the additional feature pack requested by the user when "persona switching" to a different feature set in Savvy
    leadFuncBundle: false,

    /* <========== Business Module - Visit ==========> */
    /* <=============================================> */
    // Visit's weekly Record Type Id
    weeklyRcdId: null,
    // Visit's daily Record Type Id
    dailyRcdId: null,
    // Current Weekly Visit List
    weeklyList: null,
    // The visit list of the user
    visitList: null,
    // Sales visit record type id
    salesVisitRTId: null,
    // Merchandising visit record type id
    merchVisitRTId: null,
    // visit offline data in md requires Sync
    pendingSync: {
        visitList: false,
        visit: false,
        workOrder: false,
        scheduledMeeting: false
    },
    // visit status; started/ended
    shiftStatus: '',

    /* <========== Business Module - Orderade ==========> */
    /* <================================================> */
    // Check whether the login user has enabled the feature toggle function
    OrderingFeatureToggle: false,
    /* When a PSR creates an order, a copy of the order will be sent to a third party system called OCH.
    These variables store value for settings like how many times the user should retry or the period of times
    that the user waits for the next request when the user send the orders that did not went through to OCH.
    We will pull down the data from backend to overwrite these values if the values are valid.
    These default value available when starting the app in case there's no valid value return from backend. */
    OCHConnectTimeOut: 8000,
    OCHRetryInterVal: 3,
    OCHretryTimes: 3,
    OCHRetryTiming: 2,
    Orderade37FeatureToggle: false,

    /* <========== Remove ==========> */
    /* <============================> */
    customerMetricsToken: '',
    PBNA_P4MDominUrl: '',
    PBNA_P4MMISCDominUrl: '',
    PBNA_CertBase64String: '',
    taskIds: '',
    todayVisits: [],
    uniqueCustomerIds: [],
    uniqueVLIds: [],
    storeLocationIds: [],
    hasCheckinVisit: false
}

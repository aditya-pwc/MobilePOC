/**
 * @description Main entry of the app.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 * @date 2021-02-11
 * @lastModifiedDate 2021-07-06 Shangmin format.
 */
import React from 'react'
import { createStackNavigator, TransitionPresets, StackNavigationProp } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import TabComponent from './components/TabComponent'
import { Provider } from 'react-redux'
import Store from './redux/store/Store'
import AddVisit from './components/merchandiser/AddVisit'
import VisitDetail from './components/merchandiser/VisitDetail'
import PremierTaskScreen from './pages/PremierTaskScreen'
import SignaturePad from './components/merchandiser/Signature'
import SelectSchedule from './components/manager/schedule/SelectSchedule'
import ReviewNewSchedule from './components/manager/schedule/ReviewNewSchedule'
import AddAVisit from './components/manager/schedule/AddAVisit'
import SearchModal from './components/manager/common/SearchModal'
import NoAccessScreen from './pages/NoAccessScreen'
import CreateNewLead from './components/rep/lead/creation/NewLeadCreation'
import OpenTaskListTab from './components/rep/lead/OpenTaskListTab'
import LoginScreen from '../common/pages/LoginScreen/LoginScreen'
import { DropDownComponentProvider } from '../common/contexts/DropdownContext'
import LeadDetailScreen from './pages/rep/lead/LeadDetailScreen'
import NetInfo from '@react-native-community/netinfo'
import StatusCode from './enums/StatusCode'
import MyTeam from './components/manager/my-team/MyTeam'
import EmployeeDetail from './components/manager/my-team/EmployeeDetail'
import GlobalModal from '../common/components/GlobalModal'
import EmployeeScheduleList from './components/manager/schedule/EmployeeScheduleList'
import DelEmployeeSchedule from './components/del-sup/deliveries/DelEmployeeSchedule'
import AddEmployee from './components/manager/my-team/AddEmployee'
import AddCustomer from './components/manager/my-customers/AddCustomer'
import CustomerDetail from './components/manager/my-customers/CustomerDetail'
import AddRecurringVisit from './components/manager/my-customers/AddRecurringVisit'
import DeliveryInformation from './components/merchandiser/DeliveryInformation'
import VisitDetails from './components/manager/schedule/VisitDetails'
import RecurringVisitDetail from './components/manager/my-customers/RecurringVisitDetail'
import UnassignVisit from './components/manager/schedule/UnassignVisit'
import UnassignEmployee from './components/manager/schedule/UnassignEmployee'
import SalesRepTab from './components/rep/SalesRepTab'
import ScheduleSummary from './components/manager/schedule/ScheduleSummary'
import AddAMeeting from './components/manager/schedule/AddAMeeting'
import AddAttendees from './components/manager/schedule/AddAttendees'
import NotificationPreferences from './components/manager/notifications/NotificationPreferences'
import ReviewNewMeeting from './components/manager/schedule/ReviewNewMeeting'
import LocationConsent from './components/merchandiser/LocationConsent'
import MyProfile from './pages/rep/MyProfile'
import CustomerListScreen from './pages/rep/CustomerListScreen'
import CustomerDetailScreen from './pages/rep/customer/CustomerDetailScreen'
import SettingsScreen from './pages/rep/SettingsScreen'
import MileageBreakdown from './components/manager/copilot/mileage-breakdown/MileageBreakdown'
import InnovationProductDetail from './components/rep/customer/innovation-tab/InnovationProductDetail'
import AddToCartScreen from './components/rep/customer/innovation-tab/AddToCartScreen'
import InnovationProductArchiveDetail from './components/rep/customer/innovation-tab/InnovationProductArchiveDetail'
import CustomerCarouselDetailScreen from './pages/rep/atc/CustomerCarouselDetailScreen'
import CopilotWorkOrder from './components/manager/copilot/CopilotWorkOrder'
import MyMetricsScreen from './pages/rep/customer/MyMetricsScreen'
import EmployeeProfileOverview from './components/del-sup/employee-profile/EmployeeProfileOverview'
import InnovaProdFilterSortForm from './components/rep/customer/innovation-tab/InnovaProdFilterSortForm'
import DeliveryVisitDetail from './components/del-sup/delivery-visit-detail/DeliveryVisitDetail'
import SDLVisitDetails from './components/sales/sdl-visit-details/SDLVisitDetails'
import SDLEmployeeSchedule from './components/sales/my-day/SDLEmployeeSchedule'
import LocationList from './components/common/LocationList'
import DispatchReport from './components/del-sup/dispatch-report/DispatchReport'
import DispatchAction from './components/del-sup/dispactch-action/DispatchAction'
import UpdateNoticeScreen from './pages/UpdateNoticeScreen'
import LeadCustomerVisibilityScreen from './pages/rep/LeadCustomerVisibilityScreen'
import DeliveryRoute from './components/merchandiser/DeliveryRoute'
import { fixTimeWithServer } from './utils/TimeZoneUtils'
import ExportSchedule from './components/manager/schedule/ExportSchedule'
import { GlobalModalComponentProvider } from './contexts/GlobalModalContext'
import OptimizedVisitScreen from './components/manager/schedule/OptimizedVisitScreen'
import AddToCartView from './components/rep/customer/metrics/AddToCartView'
import OrderInformation from './components/del-sup/deliveries/OrderInformation'
import ChooseRoutes from './components/rep/customer/innovation-tab/ChooseRoutes'
import PepsiDirectOrderDetail from './components/rep/customer/activity-tab/PepsiDirectOrderDetail'
import SalesDocuments from './components/rep/customer/innovation-tab/SalesDocuments'
import KamTab from './components/kam/KamTab'
import AddNewVisitScreen from '../orderade/pages/MyDayScreen/AddNewVisitScreen'
import ProductSellingScreen from '../orderade/pages/MyDayScreen/ProductSellingScreen'
import OrderSummaryScreen from '../orderade/pages/OrderSummaryScreen/OrderSummaryScreen'
import BCDMyVisitDetail from '../orderade/pages/MyDayScreen/MyVisitDetail'
import ReleaseNotes from './components/common/releaseNotesFiles/ReleaseNotes'
import { LandingScreenSavvy } from './pages/LandingScreenSavvy'
import { ContractPDFPage } from './components/rep/customer/contract-tab/ContractPDF'
import ResetVisitScreen from './components/rep/customer/contract-tab/ResetVisitScreen'
import OrderInformationScreen from '../orderade/pages/OrderInformationScreen/OrderInformationScreen'
import { CompletedVisitScreen } from '../orderade/pages/MyDayScreen/CompletedVisitScreen'
import { SDLASASPage } from '../savvy/components/manager/copilot/SDL/SDLASASPage'
import { UploadContract, UploadFSContract } from './components/rep/customer/contract-tab/UploadFSContract'
import AuditScreen from './components/rep/customer/contract-tab/AuditScreen'
import Realm from 'realm'
import { RealmProvider } from '@realm/react'
import SDLOffSchedulePage from './components/manager/copilot/SDL/SDLOffSchedulePage'
import RequestNewPOSScreen from '../orderade/pages/RequestNewPOSScreen/RequestNewPOSScreen'
import ComingSoon from './components/common/releaseNotesFiles/ComingSoon'
import RequestReturnScreen from '../orderade/pages/MyDayScreen/ReturnProduct/ReturnProductScreen/ReturnProductScreen'
import InactiveProductScreen from '../orderade/pages/InactiveProductScreen/InactiveProductScreen'
import MyCustomerFilter from './components/sales/my-customer/MyCustomerFilter'
import PriorityPhotoExecution from './components/rep/customer/innovation-tab/PriorityPhotoExecution'
import { AMASPage } from '../savvy/components/manager/copilot/AMASPage'
import RealogramScreen from './components/rep/customer/store-tab/RealogramScreen'
import { RealogramView } from './components/rep/customer/store-tab/RealogramView'
import EditDeliveryTimeWindow from './components/rep/customer/profile-tab/EditDeliveryTimeWindow'
import CustomerMyStoreMapScreen from './components/rep/customer/store-tab/CustomerMyStoreMapScreen'
import EditGeoFence from './components/rep/customer/profile-tab/EditGeoFence/EditGeoFence'
import UpdatePin from './components/rep/customer/profile-tab/EditGeoFence/UpdatePin'

declare global {
    namespace NodeJS {
        interface Global {
            $globalModal: any
            $locationModal: any
        }
    }
}
export type RootStackParamList = {
    Tab: {
        screen?: string
    }
}

export type RootStackNavigation = StackNavigationProp<RootStackParamList>

// Fix local time
fixTimeWithServer()
const Stack = createStackNavigator()

const realmConfig: Realm.Configuration = {
    schema: []
}

export const App = function () {
    NetInfo.configure({
        // Disable for static url
        // eslint-disable-next-line no-restricted-syntax
        reachabilityUrl: 'https://www.salesforce.com',
        reachabilityTest: async (response) => response.status === StatusCode.SuccessOK,
        reachabilityLongTimeout: 60 * 1000, // 60s
        reachabilityShortTimeout: 5 * 1000, // 5s
        reachabilityRequestTimeout: 15 * 1000, // 15s
        useNativeReachability: false
    })
    return (
        <RealmProvider {...realmConfig}>
            <DropDownComponentProvider>
                <GlobalModalComponentProvider>
                    <Provider store={Store}>
                        <NavigationContainer>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                                {__DEV__ && <Stack.Screen name="Login" component={LoginScreen} />}
                                {/* <Stack.Screen
                                name="Landing"
                                component={LandingScreen}
                                options={() => ({ gestureEnabled: false })}
                            /> */}
                                <Stack.Screen
                                    name="LandingSavvy"
                                    component={LandingScreenSavvy}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="Tab" component={TabComponent} />
                                <Stack.Screen name="SalesRepTab" component={SalesRepTab} />
                                <Stack.Screen name="KamTab" component={KamTab} />
                                <Stack.Screen
                                    name="AddVisit"
                                    component={AddVisit}
                                    options={() => ({
                                        gestureEnabled: false,
                                        ...TransitionPresets.ModalSlideFromBottomIOS
                                    })}
                                />
                                <Stack.Screen name="MileageBreakdown" component={MileageBreakdown} />
                                <Stack.Screen name="CopilotWorkOrder" component={CopilotWorkOrder} />

                                <Stack.Screen
                                    name="SelectSchedule"
                                    component={SelectSchedule}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="ReviewNewSchedule"
                                    component={ReviewNewSchedule}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="AddAVisit"
                                    component={AddAVisit}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="SearchModal" component={SearchModal} />
                                <Stack.Screen name="EmployeeDetail" component={EmployeeDetail} />
                                <Stack.Screen name="CustomerDetail" component={CustomerDetail} />
                                <Stack.Screen
                                    name="AddEmployee"
                                    component={AddEmployee}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="AddCustomer"
                                    component={AddCustomer}
                                    options={() => ({ gestureEnabled: false })}
                                />

                                <Stack.Screen
                                    name="EditGeoFence"
                                    component={EditGeoFence}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="UpdatePin"
                                    component={UpdatePin}
                                    options={() => ({ gestureEnabled: false })}
                                />

                                <Stack.Screen name="MyTeam" component={MyTeam} />
                                <Stack.Screen
                                    name="NotificationPreferences"
                                    component={NotificationPreferences}
                                    options={() => ({
                                        gestureEnabled: false,
                                        ...TransitionPresets.ModalSlideFromBottomIOS
                                    })}
                                />
                                <Stack.Screen
                                    name="ReleaseNotes"
                                    component={ReleaseNotes}
                                    options={() => ({
                                        gestureEnabled: false,
                                        ...TransitionPresets.ModalSlideFromBottomIOS
                                    })}
                                />
                                <Stack.Screen name="UnassignVisit" component={UnassignVisit} />
                                <Stack.Screen name="UnassignEmployee" component={UnassignEmployee} />
                                <Stack.Screen
                                    name="VisitDetail"
                                    component={VisitDetail}
                                    options={() => ({ gestureEnabled: true })}
                                />
                                <Stack.Screen
                                    name="VisitDetails"
                                    component={VisitDetails}
                                    options={() => ({
                                        gestureEnabled: false,
                                        ...TransitionPresets.ModalSlideFromBottomIOS
                                    })}
                                />
                                <Stack.Screen
                                    name="SDLVisitDetails"
                                    component={SDLVisitDetails}
                                    options={() => ({
                                        gestureEnabled: false,
                                        ...TransitionPresets.ModalSlideFromBottomIOS
                                    })}
                                />
                                <Stack.Screen name="SignaturePad" component={SignaturePad} />
                                <Stack.Screen name="PremierTaskScreen" component={PremierTaskScreen} />
                                <Stack.Screen name="NoAccessScreen" component={NoAccessScreen} />
                                <Stack.Screen
                                    name="UpdateNoticeScreen"
                                    component={UpdateNoticeScreen}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="OpenTaskListTab" component={OpenTaskListTab} />
                                <Stack.Screen name="MyProfile" component={MyProfile} />
                                <Stack.Screen name="Settings" component={SettingsScreen} />
                                <Stack.Screen name="CreateNewLead" component={CreateNewLead} />
                                <Stack.Screen
                                    name="LeadDetailScreen"
                                    component={LeadDetailScreen}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="EmployeeScheduleList"
                                    component={EmployeeScheduleList}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="DelEmployeeSchedule"
                                    component={DelEmployeeSchedule}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name="SDLEmployeeSchedule"
                                    component={SDLEmployeeSchedule}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="EditDeliveryTimeWindow" component={EditDeliveryTimeWindow} />
                                <Stack.Screen name="AddRecurringVisit" component={AddRecurringVisit} />
                                <Stack.Screen name="DeliveryInformation" component={DeliveryInformation} />
                                <Stack.Screen name="RecurringVisitDetail" component={RecurringVisitDetail} />
                                <Stack.Screen name="ScheduleSummary" component={ScheduleSummary} />
                                <Stack.Screen
                                    name="AddAMeeting"
                                    component={AddAMeeting}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="AddAttendees" component={AddAttendees} />
                                <Stack.Screen name="ReviewNewMeeting" component={ReviewNewMeeting} />
                                <Stack.Screen name="LocationConsent" component={LocationConsent} />
                                <Stack.Screen name="CustomerListScreen" component={CustomerListScreen} />
                                <Stack.Screen name="CustomerDetailScreen" component={CustomerDetailScreen} />
                                <Stack.Screen name="CustomerCarouselDetail" component={CustomerCarouselDetailScreen} />
                                <Stack.Screen name="InnovationProductDetail" component={InnovationProductDetail} />
                                <Stack.Screen name="AddToCartScreen" component={AddToCartScreen} />
                                <Stack.Screen name="SalesDocuments" component={SalesDocuments} />
                                <Stack.Screen
                                    name="InnovationProductArchiveDetail"
                                    component={InnovationProductArchiveDetail}
                                />
                                <Stack.Screen name="MyMetricsScreen" component={MyMetricsScreen} />
                                <Stack.Screen
                                    name="EmployeeProfileOverview"
                                    component={EmployeeProfileOverview}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="InnovaProdFilterSortForm" component={InnovaProdFilterSortForm} />
                                <Stack.Screen name="DeliveryVisitDetail" component={DeliveryVisitDetail} />
                                <Stack.Screen name="LocationList" component={LocationList} />
                                <Stack.Screen name="DispatchReport" component={DispatchReport} />
                                <Stack.Screen name="DispatchAction" component={DispatchAction} />
                                <Stack.Screen
                                    name="LeadCustomerVisibilityScreen"
                                    component={LeadCustomerVisibilityScreen}
                                />
                                <Stack.Screen name="DeliveryRoute" component={DeliveryRoute} />
                                <Stack.Screen
                                    name="ExportSchedule"
                                    component={ExportSchedule}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name="OptimizedVisitScreen" component={OptimizedVisitScreen} />
                                <Stack.Screen
                                    name="AddToCartView"
                                    component={AddToCartView}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen name="OrderInformation" component={OrderInformation} />
                                <Stack.Screen name="ChooseRoutes" component={ChooseRoutes} />
                                <Stack.Screen name="PepsiDirectOrderDetail" component={PepsiDirectOrderDetail} />
                                <Stack.Screen name={'AddNewVisitScreen'} component={AddNewVisitScreen} />
                                <Stack.Screen
                                    name={'ProductSellingScreen'}
                                    component={ProductSellingScreen}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen name={'BCDMyVisitDetail'} component={BCDMyVisitDetail} />
                                <Stack.Screen name={'CompletedVisitScreen'} component={CompletedVisitScreen} />
                                <Stack.Screen
                                    name={'OrderSummaryScreen'}
                                    component={OrderSummaryScreen}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen
                                    name={'OrderInformationScreen'}
                                    component={OrderInformationScreen}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen
                                    name={'ContractPDFPage'}
                                    component={ContractPDFPage}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name={'ResetVisitScreen'}
                                    component={ResetVisitScreen}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name={'SDLASASPage'} component={SDLASASPage} />
                                <Stack.Screen name={'SDLOffSchedulePage'} component={SDLOffSchedulePage} />
                                <Stack.Screen
                                    name={'UploadFSContract'}
                                    component={UploadFSContract}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen
                                    name={'UploadContract'}
                                    component={UploadContract}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen
                                    name={'AuditScreen'}
                                    component={AuditScreen}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name={'RequestNewPOSScreen'} component={RequestNewPOSScreen} />
                                <Stack.Screen name={'ComingSoon'} component={ComingSoon} />
                                <Stack.Screen
                                    name={'RequestReturnScreen'}
                                    component={RequestReturnScreen}
                                    options={() => ({ gestureEnabled: false })}
                                />
                                <Stack.Screen name={'InactiveProductScreen'} component={InactiveProductScreen} />
                                <Stack.Screen
                                    name={'MyCustomerFilter'}
                                    component={MyCustomerFilter}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen name={'PriorityPhotoExecution'} component={PriorityPhotoExecution} />
                                <Stack.Screen name={'AMASPage'} component={AMASPage} />
                                <Stack.Screen
                                    name={'RealogramScreen'}
                                    component={RealogramScreen}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen
                                    name={'RealogramView'}
                                    component={RealogramView}
                                    options={{ gestureEnabled: false }}
                                />
                                <Stack.Screen
                                    name={'CustomerMyStoreMapScreen'}
                                    component={CustomerMyStoreMapScreen}
                                    options={{ gestureEnabled: false }}
                                />
                            </Stack.Navigator>
                        </NavigationContainer>
                        <GlobalModal
                            ref={(globalModalRef) => {
                                global.$globalModal = globalModalRef
                            }}
                        />
                        <LocationConsent
                            ref={(locationModalRef) => {
                                global.$locationModal = locationModalRef
                            }}
                        />
                    </Provider>
                </GlobalModalComponentProvider>
            </DropDownComponentProvider>
        </RealmProvider>
    )
}

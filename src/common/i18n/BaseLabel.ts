/*
 * @Description:
 * @Author: Mary Qian
 * @Date: 2022-02-15 00:34:33
 * @LastEditTime: 2024-02-21 11:20:31
 * @LastEditors: Mary Qian
 */
export const BaseLabel = {
    en_US: {
        PBNA_MOBILE_LOADING: 'Loading',
        PBNA_MOBILE_OK: 'OK',
        PBNA_MOBILE_YES: 'Yes',
        PBNA_MOBILE_NO: 'No',
        PBNA_MOBILE_START: 'Start',
        PBNA_MOBILE_SYNC: 'Sync',
        PBNA_MOBILE_LOGOUT: 'Logout',
        PBNA_MOBILE_REFRESH_DATA: 'Refresh Data',
        PBNA_MOBILE_DAY_STARTED_AT: 'Day started at',
        PBNA_MOBILE_DAY_ENDED_AT: 'Day ended at',
        PBNA_MOBILE_SALES_ROUTE: 'Sales Route',
        PBNA_MOBILE_LOC_ROUTE: 'Loc Route',
        PBNA_MOBILE_LANGUAGE_HAS_BEEN: 'Your language has been',
        PBNA_MOBILE_LANGUAGE_CHANGED_TO: 'changed to',
        PBNA_MOBILE_LANGUAGE: 'Language',
        PBNA_MOBILE_DASHBOARD: 'Dashboard',
        PBNA_MOBILE_SHIP_DATE: 'Ship Date',
        PBNA_MOBILE_Multi: 'Multi',
        PBNA_MOBILE_NON_DIS_PROMOTIONS: 'Non-Display Promotions',
        PBNA_MOBILE_COPILOT_TAB: 'Copilot',
        PBNA_MOBILE_ABBR_DAY_OF_SUNDAY: 'Sun',
        PBNA_MOBILE_ABBR_DAY_OF_MONDAY: 'Mon',
        PBNA_MOBILE_ABBR_DAY_OF_TUESDAY: 'Tue',
        PBNA_MOBILE_ABBR_DAY_OF_WEDNESDAY: 'Wed',
        PBNA_MOBILE_ABBR_DAY_OF_THURSDAY: 'Thu',
        PBNA_MOBILE_ABBR_DAY_OF_FRIDAY: 'Fri',
        PBNA_MOBILE_ABBR_DAY_OF_SATURDAY: 'Sat',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_SUNDAY: 'S',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_MONDAY: 'M',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_TUESDAY: 'T',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_WEDNESDAY: 'W',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_THURSDAY: 'T',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_FRIDAY: 'F',
        PBNA_MOBILE_ONE_LETTER_CODE_OF_SATURDAY: 'S',
        PBNA_MOBILE_PUNCH_NOT_FEED: 'Kronos punch did not feed SAVVY',
        PBNA_MOBILE_GATE_FENCE_IN: 'Gate Fence In',
        PBNA_MOBILE_GATE_CHECK_IN: 'Gate Check In',
        PBNA_MOBILE_ACTUAL_ON_PROPERTY_TIME: 'Actual On Property Time',
        PBNA_MOBILE_GATE_CHECK_OUT: 'Gate Check Out',
        PBNA_MOBILE_GATE_FENCE_OUT: 'Gate Fence Out',

        // Copilot
        PBNA_MOBILE_R_U_SURE: 'Are You Sure?',
        PBNA_MOBILE_SWITCH_PERSONA_CONFIRM_PREFIX: 'You have selected',
        PBNA_MOBILE_SWITCH_PERSONA_CONFIRM_SUFFIX: 'persona. Are you sure you would like to switch to this persona?',

        // Notifications

        // MM
        // scheduling updates
        // {0} has added {1} to their day.
        PBNA_MOBILE_SCHEDULING_UPDATES_T: 'SCHEDULE UPDATE',
        PBNA_MOBILE_SCHEDULING_UPDATES_M_1: 'has added',
        PBNA_MOBILE_SCHEDULING_UPDATES_M_2: 'to their day',

        // employee updates
        // {0} started their day 5 minutes ago but has not checked in.
        PBNA_MOBILE_CHECK_IN_UPDATES_T: 'CHECK-IN UPDATE',
        PBNA_MOBILE_CHECK_IN_UPDATES_M: 'started their day 5 minutes ago but has not checked in.',
        // {0} ended their day {1} minutes after servicing their last customer.
        PBNA_MOBILE_CHECK_OUT_UPDATES_T: 'CHECK-OUT UPDATE',
        PBNA_MOBILE_CHECK_OUT_UPDATES_M_1: 'ended their day',
        PBNA_MOBILE_CHECK_OUT_UPDATES_M_2: 'minutes after servicing their last customer.',

        // visit updates
        // {0} has ended their day with {1} incomplete visits.
        PBNA_MOBILE_VISIT_INCOMPLETE_T: 'STORE VISIT INCOMPLETE',
        PBNA_MOBILE_VISIT_INCOMPLETE_M_1: 'has ended their day with',
        PBNA_MOBILE_VISIT_INCOMPLETE_M_2: 'incomplete visits.',

        // SDL
        // Not Start Day
        // {0} has not started their day.
        PBNA_MOBILE_NO_START_DAY_T: 'NO-START DAY',
        PBNA_MOBILE_NO_START_DAY_M: 'has not started their day.',

        // Off-schedule
        // {0} has written an off-schedule order.
        PBNA_MOBILE_OFF_SCHEDULE_T: 'OFF-SCHEDULE ORDERS',
        PBNA_MOBILE_OFF_SCHEDULE_M: 'has written an off-schedule order.',

        // DEL
        // late start
        // {0} had a late start.
        PBNA_MOBILE_LATE_START_T: 'LATE START',
        PBNA_MOBILE_LATE_START_M: 'had a late start.',

        // gate delay
        // {0} had a gate delay.
        PBNA_MOBILE_GATE_DELAY_T: 'GATE DELAY',
        PBNA_MOBILE_GATE_DELAY_M: 'had a gate delay.',

        // stem-time delay
        // {0} had a stem time delay.
        PBNA_MOBILE_STEM_TIME_DELAY_T: 'STEM-TIME DELAY',
        PBNA_MOBILE_STEM_TIME_DELAY_M: 'had a stem time delay.',

        // over hours
        // {0} has gone over on their planned hours.
        PBNA_MOBILE_OVER_HOURS_T: 'OVER-HOURS',
        PBNA_MOBILE_OVER_HOURS_M: 'has gone over on their planned hours.',

        // reset visit.
        PBNA_MOBILE_RESETS_VISIT: 'RESETS VISIT',
        PBNA_MOBILE_RESET_MESSAGE: 'Reset scheduled for today was not completed for',

        // FORM KPI.
        PBNA_MOBILE_FORM_KPI: 'Image Recognition Results',
        PBNA_MOBILE_FORM_KPI_MESSAGE_PREFIX: 'IR Results for',
        PBNA_MOBILE_FORM_KPI_MESSAGE_SUFFIX: 'are ready',
        PBNA_MOBILE_FORM_AUDIT_TYPE_POST: 'Post Contract Audit',
        PBNA_MOBILE_FORM_AUDIT_TYPE_GENERAL: 'General Audit',
        PBNA_MOBILE_FORM_NOT_LOAD: 'Did Not Load Successfully. Please resubmit mission.',
        PBNA_MOBILE_SALES_FORM_POST_KPI_MESSAGE: 'IR Results for {0} Post Contract Audit are ready',
        PBNA_MOBILE_SALES_FORM_GENERAL_KPI_MESSAGE: 'IR Results for {0} General Audit are ready',
        PBNA_MOBILE_SALES_FORM_NOT_LOAD_POST:
            'IR Results for {0} Post Contract Audit Did Not Load Successfully. Please resubmit mission.',
        PBNA_MOBILE_SALES_FORM_NOT_LOAD_GENERAL:
            'IR Results for {0} General Audit Did Not Load Successfully. Please resubmit mission.',
        // Realogram Results
        PBNA_MOBILE_REALOGRAM_RESULTS: 'Realogram Results for {0} are ready',
        PBNA_MOBILE_REALOGRAM_RESULTS_FAILED:
            'Realogram Results for {0} Did Not Load Successfully. Please delete the stocking location and resubmit Realogram.',
        PBNA_MOBILE_REALOGRAM_MESSAGE_PREFIX: 'Realogram Results for',
        PBNA_MOBILE_REALOGRAM_RESULTS_FAILED_SUFFIX:
            'Did Not Load Successfully. Please delete the stocking location and resubmit Realogram.',

        // PSR
        PBNA_MOBILE_LEAD_ACTION_REQUIRED_T: 'Lead Action Required',
        PBNA_LEAD_ACTION_REQUIRED_TITLE: '{0} is ready to be worked on as it has reached the date for re-engagement',

        PBNA_MOBILE_LEAD_APPROVED_T: 'Request Approved',
        PBNA_LEAD_APPROVED_TITLE: '{0} has successfully been converted as Customer  {1}',

        PBNA_MOBILE_LEAD_CUSTOMER_ASSOCIATED_T: 'Customer Number Created',
        PBNA_LEAD_CUSTOMER_ASSOCIATED_TITLE: '{0} has been removed from My Leads and created as Customer {1}',

        PBNA_MOBILE_LEAD_INACTIVITY_T: 'Lead Inactivity',
        PBNA_LEAD_INACTIVITY_TITLE: '{0} will be moved to Open Leads in {1} days due to lack of activity',

        PBNA_MOBILE_LEAD_REJECTED_T: 'Request Rejected',
        PBNA_LEAD_REJECTED_TITLE: '{0} customer request has been rejected',

        PBNA_MOBILE_LEAD_DRAFT_REQUEST_T: 'Request Approved & Action Required',
        PBNA_LEAD_DRAFT_REQUEST_TITLE:
            '{0} has successfully been converted as Customer {1} and has a draft equipment request',
        PBNA_REJECTED_PRICE_GROUP_TITLE: 'Requested Price Group was Rejected ',
        PBNA_LEAD_REJECTEDPG_CONTENT:
            '{0}on Customer {1}was Rejected. {2} Please submit a new Request if still needed.',
        PBNA_LEAD_REJECTEDPG_DETAIL1: 'on Customer',
        PBNA_LEAD_REJECTEDPG_DETAIL2: 'was Rejected',
        PBNA_LEAD_REJECTEDPG_DETAIL3: 'Please submit a new Request if still needed.',
        PBNA_MOBILE_EDIT_GEO_FENCE: 'EDIT GEOFENCE',
        PBNA_MOBILE_SELECT_GEO_FENCE_TYPE: 'Select the geofence to edit',
        PBNA_MOBILE_SALES_GEO_FENCE: 'Sales Geofence',
        PBNA_MOBILE_DEL_GEO_FENCE: 'Delivery Geofence',
        PBNA_MOBILE_EDIT_SALES_GEO_FENCE: 'Edit Sales Geofence',
        PBNA_MOBILE_EDIT_DEL_GEO_FENCE: 'Edit Delivery Geofence',
        PBNA_MOBILE_EDIT_GEO_FENCE_SUCCESS: 'Your geofence edit request has been submitted.',
        PBNA_MOBILE_CURRENT_INFORMATION: 'Current Information',
        PBNA_MOBILE_CURRENT_GEO_CODE: 'Current Geo Code',
        PBNA_MOBILE_LATITUDE: 'Latitude',
        PBNA_MOBILE_LONGITUDE: 'Longitude',
        PBNA_MOBILE_REQUESTING_DATE: 'Requesting Date',
        PBNA_MOBILE_REQUESTED_BY: 'Requested By',
        PBNA_MOBILE_REQUESTOR_PHONE: 'Requestor Phone',
        PBNA_MOBILE_REQUESTOR_EMAIL: 'Requestor Email',
        PBNA_MOBILE_PEPSICO_LOCATION_NAME: 'Pepsico Location Name',
        PBNA_MOBILE_PEPSICO_LOCATION_ID: 'Pepsico Location ID',
        PBNA_MOBILE_UPDATE_CUSTOMER_PIN: 'UPDATE CUSTOMER PIN',
        PBNA_MOBILE_ENTER_COMMENTS: 'Enter Comments',
        PBNA_MOBILE_REDO_CODE_PIN: 'Redo Geo Code Pin',
        PBNA_MOBILE_REDO_ALERT_MSG: 'You are about to clear the form and start again, do you want to proceed?',
        PBNA_MOBILE_REQUESTED_CODE: 'Requested Geo Code',
        PBNA_MOBILE_DEFAULT: 'DEFAULT',
        PBNA_MOBILE_SATELLITE: 'SATELLITE',
        PBNA_MOBILE_UPDATE_PIN: 'UPDATE PIN',
        PBNA_MOBILE_UPDATE_PIN_MSG:
            'To edit the current pin, tap on the map on the desired location to drop a new pin.',
        PBNA_MOBILE_EMPTY_STRING: '',
        PBNA_MOBILE_DASH: '-',
        PBNA_MOBILE_ADD_CHAR: '+',
        PBNA_MOBILE_MINS: 'mins',
        PBNA_MOBILE_MIN: 'min',
        PBNA_MOBILE_HOUR: 'Hour',
        PBNA_MOBILE_MI: 'mi.',
        PBNA_MOBILE_MI_UNIT: ' mi',
        PBNA_MOBILE_KM: 'km.',
        PBNA_MOBILE_KM_UNIT: ' km',
        PBNA_MOBILE_HR: 'hr',
        PBNA_MOBILE_HRS: 'hrs',
        PBNA_MOBILE_HOURS: 'Hours',
        PBNA_MOBILE_ORDERING_COPILOT: 'Copilot',
        PBNA_MOBILE_ORDERING_MY_DAY: 'My Day',
        PBNA_MOBILE_ORDERING_LEADS: 'Leads',
        PBNA_MOBILE_ORDERING_EXPLORE: 'Explore',
        PBNA_MOBILE_ORDERING_MY_TEAM: 'My Team',
        PBNA_MOBILE_ORDERING_MY_CUSTOMERS: 'Customers',
        PBNA_MOBILE_ORDERING_NOTIFICATIONS: 'Notifications',
        PBNA_MOBILE_SAVE: 'SAVE',
        PBNA_MOBILE_CANCEL: 'Cancel',
        PBNA_MOBILE_DELETE: 'Delete',
        PBNA_MOBILE_EXECUTE: 'EXECUTE',
        PBNA_MOBILE_REMOVE: 'Remove',
        PBNA_MOBILE_IP_NEW: 'New',
        PBNA_MOBILE_EDIT: 'Edit',
        PBNA_MOBILE_CART: 'Cart',
        PBNA_MOBILE_FUTURE: 'Future',
        PBNA_MOBILE_PAST: 'Past',
        PBNA_MOBILE_ORDER_CS: 'Cs',
        PBNA_MOBILE_ADD: 'Add',
        PBNA_MOBILE_NEW: 'New',
        PBNA_MOBILE_TODAY: 'Today',
        PBNA_MOBILE_ORDERING_BACK: 'Back',
        PBNA_MOBILE_ORDERING_PROCEED: 'Proceed',
        PBNA_MOBILE_ORDERING_UNITS_AVAILABLE: 'Units available',
        PBNA_MOBILE_ORDERING_VOICE_SEARCH: 'Voice Search',
        PBNA_MOBILE_ORDERING_ARCHIVE_BUTTON: 'Archive',
        PBNA_MOBILE_ORDER_UN: 'Un',
        PBNA_MOBILE_VISITS: 'Visits',
        PBNA_MOBILE_DELIVERY_ORDERS: 'Orders',
        PBNA_MOBILE_INIT_SYNC_ERR: 'Initial Sync Error',
        PBNA_MOBILE_NETWORK_ERR: 'Network Error',
        PBNA_MOBILE_NUMBER_SIGN: '#',
        PBNA_MOBILE_DELIVERY_DATE: 'Delivery Date',
        PBNA_MOBILE_NEXT: 'Next',
        PBNA_MOBILE_VISIT_OVERVIEW: 'Visit Overview',
        PBNA_MOBILE_VISIT_TYPE: 'Visit Type',
        PBNA_MOBILE_VISIT_TYPE_ORDER: 'Order',
        PBNA_MOBILE_VISIT_TYPE_MERCH: 'Merchandising',
        PBNA_MOBILE_SALES_ACTIONS: 'Sales Actions',
        PBNA_MOBILE_NO_SELLING_OBJECTIVES: 'No Selling Objectives',
        PBNA_MOBILE_NO_SELLING_OBJECTIVES_MSG: 'This customer has no selling objectives at this time',
        PBNA_MOBILE_SNAPSHOT_NOT_AVAILABLE: 'Sales Snapshot data is not available at the source at this time.',
        PBNA_MOBILE_INVOICE_NOT_AVAILABLE: 'Invoice data is not available at the source at this time.'
    }
}

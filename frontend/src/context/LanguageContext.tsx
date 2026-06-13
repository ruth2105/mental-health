import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// UI Translations for all pages
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assessment': 'Assessment',
    'nav.therapists': 'Find Therapists',
    'nav.appointments': 'Appointments',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    
    // Assessment
    'assessment.title': 'Mental Health Assessment',
    'assessment.subtitle': 'Please answer the following questions honestly',
    'assessment.start': 'Start Assessment',
    'assessment.question': 'Question',
    'assessment.of': 'of',
    'assessment.complete': 'Complete Assessment',
    'assessment.result': 'Assessment Result',
    'assessment.confidence': 'AI Confidence',
    'assessment.recommendation': 'Recommendation',
    
    // Assessment Questions
    'assessment.q1': 'Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?',
    'assessment.q2': 'How often have you been bothered by feeling down, depressed, or hopeless?',
    'assessment.q3': 'How often have you had trouble falling or staying asleep, or sleeping too much?',
    'assessment.q4': 'Over the past 2 weeks, how often have you felt tired or had little energy?',
    'assessment.q5': 'How often have you been bothered by poor appetite or overeating?',
    'assessment.q6': 'How often have you felt bad about yourself, or that you are a failure or have let yourself or your family down?',
    'assessment.q7': 'How often have you had trouble concentrating on things, such as reading the newspaper or watching television?',
    'assessment.q8': 'How often have you been bothered by feeling nervous, anxious, or on edge?',
    'assessment.q9': 'How often have you not been able to stop or control worrying?',
    'assessment.q10': 'How often have you been worrying too much about different things?',
    'assessment.q11': 'How often have you had trouble relaxing?',
    'assessment.q12': 'How often have you been so restless that it is hard to sit still?',
    'assessment.q13': 'How often have you become easily annoyed or irritable?',
    'assessment.q14': 'How often have you felt afraid as if something awful might happen?',
    'assessment.q15': 'Have you experienced a decreased need for sleep?',
    'assessment.q16': 'Have you been more talkative or felt pressure to keep talking?',
    'assessment.q17': 'Have you had racing thoughts or a flight of ideas?',
    'assessment.q18': 'Are you more easily distracted than usual?',
    'assessment.q19': 'Have you had a noticeable increase in goal-directed activity (socially, at work, or sexually)?',
    'assessment.q20': 'Have you engaged in activities with a high potential for painful consequences?',
    'assessment.q21': 'Have you felt persistently sad or empty?',
    'assessment.q22': 'Have you lost interest in activities you once enjoyed?',
    'assessment.q23': 'Have you experienced significant weight loss or gain, or a decrease or increase in appetite?',
    'assessment.q24': 'Have you felt slowed down or restless almost every day?',
    'assessment.q25': 'Have you had feelings of worthlessness or excessive guilt?',
    'assessment.q26': 'Have you had recurrent thoughts of death or suicide?',
    'assessment.q27': 'Do you find it difficult to handle your daily responsibilities due to stress?',
    'assessment.q28': 'Do you feel overwhelmed and unable to cope?',
    'assessment.q29': 'Have you been feeling jumpy or easily startled?',
    
    // Assessment Options
    'assessment.select_option': 'Select the option that best describes your experience',
    'assessment.not_at_all': 'Not at all',
    'assessment.several_days': 'Several days',
    'assessment.more_than_half': 'More than half the days',
    'assessment.nearly_every_day': 'Nearly every day',
    'assessment.previous': 'Previous',
    'assessment.next': 'Next',
    'assessment.complete_assessment': 'Complete Assessment',
    
    // Therapists
    'therapists.title': 'Find Therapists',
    'therapists.subtitle': 'Connect with licensed mental health professionals',
    'therapists.book': 'Book Appointment',
    'therapists.view_profile': 'View Profile',
    'therapists.specialization': 'Specialization',
    'therapists.rating': 'Rating',
    'therapists.price': 'Price per session',
    
    // Appointments
    'appointments.title': 'My Appointments',
    'appointments.upcoming': 'Upcoming',
    'appointments.past': 'Past',
    'appointments.cancelled': 'Cancelled',
    'appointments.reschedule': 'Reschedule',
    'appointments.cancel': 'Cancel',
    'appointments.join': 'Join Session',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.full_name': 'Full Name',
    'auth.language': 'Language',
    'auth.role': 'Role',
    'auth.patient': 'Patient',
    'auth.therapist': 'Therapist',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.recent_assessment': 'Recent Assessment',
    'dashboard.next_appointment': 'Next Appointment',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.ai_assessment': 'AI Assessment',
    'dashboard.ai_assessment_desc': 'Get instant mental health insights',
    'dashboard.find_therapist': 'Find Therapist',
    'dashboard.find_therapist_desc': 'Connect with professionals',
    'dashboard.my_appointments': 'My Appointments',
    'dashboard.my_appointments_desc': 'View your bookings',
    'dashboard.settings_desc': 'Manage your profile',
    'dashboard.start_here': 'Start Here',
    'dashboard.popular': 'Popular',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.profile_info': 'Profile Information',
    'settings.profile_desc': 'Update your personal information and preferences',
    'settings.therapist_profile_desc': 'Update your professional profile details',
    'settings.full_name': 'Full Name',
    'settings.email': 'Email',
    'settings.email_readonly': 'Email cannot be changed',
    'settings.phone': 'Phone',
    'settings.dob': 'Date of Birth',
    'settings.bio': 'Bio',
    'settings.bio_placeholder': 'Tell patients about your experience and approach...',
    'settings.specialization': 'Specialization',
    'settings.session_price': 'Session Price (ETB)',
    'settings.languages': 'Languages',
    'settings.license_number': 'License Number',
    'settings.years_experience': 'Years of Experience',
    'settings.education': 'Education',
    'settings.education_placeholder': 'Your educational background and qualifications...',
    'settings.patient_badge': 'Patient',
    'settings.verified_therapist': 'Verified Therapist',
    'settings.profile_updated': 'Profile updated successfully',
    'settings.error_loading': 'Failed to load settings',
    'settings.error_updating': 'Failed to update profile',
    'settings.language_changed': 'Language changed successfully',
    'settings.saving': 'Saving...',
    
    // Profile Picture
    'settings.remove_picture': 'Remove Picture',
    'settings.profile_picture_updated': 'Profile picture updated successfully',
    'settings.profile_picture_removed': 'Profile picture removed successfully',
    'settings.invalid_image_type': 'Please select a valid image file',
    'settings.image_too_large': 'Image size must be less than 5MB',
    'settings.error_uploading_image': 'Failed to upload image',
    'settings.error_removing_image': 'Failed to remove image',
    
    // Preferences
    'settings.preferences': 'Preferences',
    'settings.preferences_desc': 'Customize your app experience',
    'settings.language': 'Language',
    'settings.language_help': 'Choose your preferred language for the interface',
    'settings.dark_mode': 'Dark Mode',
    'settings.dark_mode_desc': 'Switch between light and dark themes',
    'settings.sound_effects': 'Sound Effects',
    'settings.sound_effects_desc': 'Enable notification sounds and audio feedback',
    'settings.privacy_mode': 'Privacy Mode',
    'settings.privacy_mode_desc': 'Hide sensitive information in screenshots',
    'settings.auto_accept_appointments': 'Auto-accept Appointments',
    'settings.auto_accept_desc': 'Automatically accept new appointment requests',
    'settings.show_online_status': 'Show Online Status',
    'settings.show_online_desc': 'Let patients see when you are available',
    'settings.preferences_updated': 'Preferences updated successfully',
    'settings.error_updating_preferences': 'Failed to update preferences',
    
    // Notifications
    'settings.notifications': 'Notifications',
    'settings.notification_settings': 'Notification Settings',
    'settings.notification_settings_desc': 'Manage how you receive notifications',
    'settings.therapist_notification_desc': 'Configure notifications for appointments and messages',
    'settings.enable_notifications': 'Enable Notifications',
    'settings.enable_notifications_desc': 'Receive notifications for important updates',
    'settings.notification_types': 'Notification Types',
    'settings.email_notifications': 'Email Notifications',
    'settings.email_notifications_desc': 'Receive notifications via email',
    'settings.therapist_email_desc': 'Get notified about new appointments and messages',
    'settings.sms_notifications': 'SMS Notifications',
    'settings.sms_notifications_desc': 'Receive notifications via text message',
    'settings.therapist_sms_desc': 'Get urgent notifications via SMS',
    'settings.notification_schedule': 'Notification Schedule',
    'settings.notification_schedule_desc': 'Set quiet hours when you don\'t want to receive notifications',
    'settings.quiet_hours_start': 'Quiet Hours Start',
    'settings.quiet_hours_end': 'Quiet Hours End',
    
    // Security
    'settings.security': 'Security',
    'settings.security_privacy': 'Security & Privacy',
    'settings.security_privacy_desc': 'Manage your account security and privacy settings',
    'settings.therapist_security_desc': 'Protect your professional account with advanced security',
    'settings.two_factor_auth': 'Two-Factor Authentication',
    'settings.two_factor_auth_desc': 'Add an extra layer of security to your account',
    'settings.login_alerts': 'Login Alerts',
    'settings.login_alerts_desc': 'Get notified when someone logs into your account',
    'settings.session_timeout': 'Session Timeout',
    'settings.session_timeout_desc': 'Automatically log out after period of inactivity',
    'settings.minutes': 'minutes',
    'settings.hour': 'hour',
    'settings.hours': 'hours',
    'settings.never': 'Never',
    'settings.security_updated': 'Security settings updated successfully',
    'settings.error_updating_security': 'Failed to update security settings',
    
    // Availability
    'settings.availability': 'Availability',
    'settings.availability_schedule': 'Availability Schedule',
    'settings.availability_desc': 'Set your working hours for each day of the week',
    'settings.monday': 'Monday',
    'settings.tuesday': 'Tuesday',
    'settings.wednesday': 'Wednesday',
    'settings.thursday': 'Thursday',
    'settings.friday': 'Friday',
    'settings.saturday': 'Saturday',
    'settings.sunday': 'Sunday',
    'settings.availability_updated': 'Availability updated successfully',
    'settings.error_updating_availability': 'Failed to update availability',
    
    // Data Management
    'settings.data_management': 'Data Management',
    'settings.export_data': 'Export My Data',
    'settings.data_exported': 'Data exported successfully',
    'settings.error_exporting_data': 'Failed to export data',
    'settings.view_privacy_policy': 'View Privacy Policy',
    'settings.privacy': 'Privacy',
    'settings.privacy_help': 'Review our privacy policy and data handling practices',
    
    // Danger Zone
    'settings.danger_zone': 'Danger Zone',
    'settings.deactivate_account': 'Deactivate Account',
    'settings.deactivate_account_desc': 'Permanently deactivate your account and remove your data',
    'settings.confirm_delete_account': 'Are you sure you want to deactivate your account? This action cannot be undone.',
    'settings.account_deactivated': 'Account deactivated successfully',
    'settings.error_deleting_account': 'Failed to deactivate account',
    
    // Appointments in Settings
    'settings.appointments': 'Appointments',
    'settings.my_appointments': 'My Appointments',
    'settings.appointments_desc': 'View and manage your upcoming appointments',
    'settings.no_appointments': 'No upcoming appointments',
    'settings.book_appointment': 'Book New Appointment',
    'settings.view_all_appointments': 'View All Appointments',
    
    // FAQ
    'settings.faq': 'FAQ',
    'settings.faq_title': 'Frequently Asked Questions',
    'settings.faq_desc': 'Find answers to common questions',
    'settings.need_more_help': 'Need more help?',
    'settings.contact_support': 'Contact Support',
    'settings.coming_soon': 'Coming Soon',
    
    // FAQ Questions
    'faq.how_to_book': 'How do I book an appointment?',
    'faq.how_to_book_answer': 'Go to the "Find Therapists" page, browse available therapists, and click "Book Appointment" on your preferred therapist\'s profile.',
    'faq.cancel_appointment': 'How can I cancel an appointment?',
    'faq.cancel_appointment_answer': 'You can cancel appointments from your "Appointments" page up to 24 hours before the scheduled time.',
    'faq.payment_methods': 'What payment methods are accepted?',
    'faq.payment_methods_answer': 'We accept various payment methods including mobile money, bank transfers, and credit cards.',
    'faq.session_duration': 'How long is each therapy session?',
    'faq.session_duration_answer': 'Standard therapy sessions are 50 minutes long, but this may vary depending on your therapist and treatment plan.',
    'faq.privacy_security': 'Is my information secure?',
    'faq.privacy_security_answer': 'Yes, we use industry-standard encryption and follow strict privacy protocols to protect your personal and medical information.',
    'faq.emergency_help': 'What should I do in a mental health emergency?',
    'faq.emergency_help_answer': 'In case of emergency, please contact your local emergency services or crisis hotline immediately. This platform is not for emergency situations.',
  },
  
  amharic: {
    // Navigation
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.assessment': 'ግምገማ',
    'nav.therapists': 'ሐኪሞችን ፈልግ',
    'nav.appointments': 'ቀጠሮ�ች',
    'nav.chat': 'ውይይት',
    'nav.profile': 'መገለጫ',
    'nav.logout': 'ውጣ',
    
    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ሰርዝ',
    'common.submit': 'አስገባ',
    'common.back': 'ተመለስ',
    'common.next': 'ቀጣይ',
    'common.previous': 'ቀዳሚ',
    'common.close': 'ዝጋ',
    'common.edit': 'አርም',
    'common.delete': 'ሰርዝ',
    'common.view': 'ተመልከት',
    'common.search': 'ፈልግ',
    'common.filter': 'አጣራ',
    
    // Assessment
    'assessment.title': 'የአእምሮ ጤና ግምገማ',
    'assessment.subtitle': 'እባክዎ የሚከተሉትን ጥያቄዎች በታማኝነት ይመልሱ',
    'assessment.question': 'ጥያቄ',
    'assessment.of': 'ከ',
    'assessment.select_option': 'እባክዎ ይህ ምን ያህል ጊዜ እንደሚተገበርብዎት ይምረጡ:',
    'assessment.not_at_all': 'በፍጹም',
    'assessment.several_days': 'ጥቂት ቀናት',
    'assessment.more_than_half': 'ከግማሽ በላይ ቀናት',
    'assessment.nearly_every_day': 'ሁሉንም ቀናት ማለት ይቻላል',
    'assessment.previous': 'ቀዳሚ',
    'assessment.next': 'ቀጣይ',
    'assessment.complete_assessment': 'ግምገማ አጠናቅቅ',
    
    // Assessment Questions (19 reduced questions)
    'assessment.q1': 'ባለፉት 2 ሳምንታት ውስጥ፣ ነገሮችን በማድረግ ላይ ትንሽ ፍላጎት ወይም ደስታ ምን ያህል ጊዜ ተሰምቶዎታል?',
    'assessment.q2': 'በመውደቅ፣ በመጨነቅ ወይም ተስፋ በማጣት ምን ያህል ጊዜ ተጨንቀዋል?',
    'assessment.q3': 'ለመተኛት ወይም እንቅልፍ ለመቆየት ችግር፣ ወይም በጣም ብዙ መተኛት ምን ያህል ጊዜ ነበረዎት?',
    'assessment.q4': 'ባለፉት 2 ሳምንታት ውስጥ፣ ምን ያህል ጊዜ ደክመዋል ወይም ትንሽ ኃይል ነበረዎት?',
    'assessment.q5': 'በደካማ ምግብ ፍላጎት ወይም በመብላት ምን ያህል ጊዜ ተጨንቀዋል?',
    'assessment.q6': 'ስለራስዎ መጥፎ ስሜት፣ ወይም ውድቀት እንደሆኑ ምን ያህል ጊዜ ተሰምቶዎታል?',
    'assessment.q7': 'ነገሮች ላይ ለማተኮር ችግር ምን ያህል ጊዜ ነበረዎት?',
    'assessment.q8': 'በመጨነቅ፣ በጭንቀት ወይም በጫፍ ላይ በመሆን ምን ያህል ጊዜ ተጨንቀዋል?',
    'assessment.q9': 'ጭንቀትን ለማቆም ወይም ለመቆጣጠር ምን ያህል ጊዜ አልቻሉም?',
    'assessment.q10': 'ስለተለያዩ ነገሮች በጣም ምን ያህል ጊዜ ይጨነቃሉ?',
    'assessment.q11': 'ለመዝናናት ችግር ምን ያህል ጊዜ ነበረዎት?',
    'assessment.q12': 'በቀላሉ የተበሳጩ ወይም የተበሳጩ ምን ያህል ጊዜ ሆነዋል?',
    'assessment.q13': 'አስከፊ ነገር እንደሚከሰት ፈርተው ምን ያህል ጊዜ ተሰምቶዎታል?',
    'assessment.q14': 'ተደጋጋሚ የሞት ወይም የራስ ግድያ ሀሳቦች ነበረዎት?',
    'assessment.q15': 'ተጨንቀው እና መቋቋም አለመቻል ይሰማዎታል?',
    'assessment.q16': 'ዝላይ ወይም በቀላሉ የሚደነግጡ ይሰማዎታል?',
    'assessment.q17': 'በአንድ ወቅት በሚወዷቸው እንቅስቃሴዎች ላይ ፍላጎት አጥተዋል?',
    'assessment.q18': 'ጉልህ የስሜት ለውጦች አጋጥሞዎታል?',
    'assessment.q19': 'በጭንቀት ምክንያት የዕለት ተዕለት ኃላፊነቶችዎን መቋቋም አስቸጋሪ ይመስልዎታል?',

    
    // Therapists
    'therapists.title': 'ሐኪሞችን ፈልግ',
    'therapists.subtitle': 'ከፈቃድ ያላቸው የአእምሮ ጤና ባለሙያዎች ጋር ተገናኝ',
    'therapists.book': 'ቀጠሮ ይዘዙ',
    'therapists.view_profile': 'መገለጫ ተመልከት',
    'therapists.specialization': 'ስፔሻላይዜሽን',
    'therapists.rating': 'ደረጃ',
    'therapists.price': 'በአንድ ክፍለ ጊዜ ዋጋ',
    
    // Appointments
    'appointments.title': 'የእኔ ቀጠሮዎች',
    'appointments.upcoming': 'ቀጣይ',
    'appointments.past': 'ያለፈ',
    'appointments.cancelled': 'የተሰረዘ',
    'appointments.reschedule': 'እንደገና ይርቀቡ',
    'appointments.cancel': 'ሰርዝ',
    'appointments.join': 'ክፍለ ጊዜ ተቀላቀል',
    
    // Auth
    'auth.login': 'ግባ',
    'auth.register': 'ተመዝገብ',
    'auth.email': 'ኢሜይል',
    'auth.password': 'የይለፍ ቃል',
    'auth.full_name': 'ሙሉ ስም',
    'auth.language': 'ቋንቋ',
    'auth.role': 'ሚና',
    'auth.patient': 'ታካሚ',
    'auth.therapist': 'ሐኪም',
    
    // Dashboard
    'dashboard.welcome': 'እንኳን ደህና መጡ',
    'dashboard.recent_assessment': 'የቅርብ ጊዜ ግምገማ',
    'dashboard.next_appointment': 'ቀጣይ ቀጠሮ',
    'dashboard.quick_actions': 'ፈጣን እርምጃዎች',
    'dashboard.ai_assessment': 'የAI ግምገማ',
    'dashboard.ai_assessment_desc': 'ፈጣን የአእምሮ ጤና ግንዛቤዎችን ያግኙ',
    'dashboard.find_therapist': 'ሐኪም ፈልግ',
    'dashboard.find_therapist_desc': 'ከባለሙያዎች ጋር ተገናኝ',
    'dashboard.my_appointments': 'የእኔ ቀጠሮዎች',
    'dashboard.my_appointments_desc': 'የእርስዎን ቦታ ማስያዝ ይመልከቱ',
    'dashboard.settings_desc': 'መገለጫዎን ያስተዳድሩ',
    'dashboard.start_here': 'እዚህ ጀምር',
    'dashboard.popular': 'ተወዳጅ',

    // Settings
    'settings.title': 'ቅንብሮች',
    'settings.profile': 'መገለጫ',
    'settings.profile_info': 'የመገለጫ መረጃ',
    'settings.profile_desc': 'የግል መረጃዎችዎን እና ምርጫዎችዎን ያዘምኑ',
    'settings.therapist_profile_desc': 'የሙያ መገለጫ ዝርዝሮችዎን ያዘምኑ',
    'settings.full_name': 'ሙሉ ስም',
    'settings.email': 'ኢሜይል',
    'settings.email_readonly': 'ኢሜይል መቀየር አይቻልም',
    'settings.phone': 'ስልክ',
    'settings.dob': 'የልደት ቀን',
    'settings.bio': 'ባዮግራፊ',
    'settings.bio_placeholder': 'ለታካሚዎች ስለ ልምድዎ እና አቀራረብዎ ይንገሩ...',
    'settings.specialization': 'ስፔሻላይዜሽን',
    'settings.session_price': 'የክፍለ ጊዜ ዋጋ (ብር)',
    'settings.languages': 'ቋንቋዎች',
    'settings.license_number': 'የፍቃድ ቁጥር',
    'settings.years_experience': 'የልምድ ዓመታት',
    'settings.education': 'ትምህርት',
    'settings.education_placeholder': 'የትምህርት ዳራዎ እና ብቃቶችዎ...',
    'settings.patient_badge': 'ታካሚ',
    'settings.verified_therapist': 'የተረጋገጠ ሐኪም',
    'settings.profile_updated': 'መገለጫ በተሳካ ሁኔታ ተዘምኗል',
    'settings.error_loading': 'ቅንብሮችን መጫን አልተሳካም',
    'settings.error_updating': 'መገለጫን ማዘመን አልተሳካም',
    'settings.language_changed': 'ቋንቋ በተሳካ ሁኔታ ተቀይሯል',
    'settings.saving': 'በማስቀመጥ ላይ...',
    
    // Profile Picture
    'settings.remove_picture': 'ምስል አስወግድ',
    'settings.profile_picture_updated': 'የመገለጫ ምስል በተሳካ ሁኔታ ተዘምኗል',
    'settings.profile_picture_removed': 'የመገለጫ ምስል በተሳካ ሁኔታ ተወግዷል',
    'settings.invalid_image_type': 'እባክዎ ትክክለኛ የምስል ፋይል ይምረጡ',
    'settings.image_too_large': 'የምስል መጠን ከ5MB ያነሰ መሆን አለበት',
    'settings.error_uploading_image': 'ምስል መጫን አልተሳካም',
    'settings.error_removing_image': 'ምስል ማስወገድ አልተሳካም',
    
    // Preferences
    'settings.preferences': 'ምርጫዎች',
    'settings.preferences_desc': 'የመተግበሪያ ልምድዎን ያበጁ',
    'settings.language': 'ቋንቋ',
    'settings.language_help': 'ለበይነገጹ የሚመርጡትን ቋንቋ ይምረጡ',
    'settings.dark_mode': 'ጨለማ ሁነታ',
    'settings.dark_mode_desc': 'በብርሃን እና በጨለማ ገጽታዎች መካከል ይቀያይሩ',
    'settings.sound_effects': 'የድምጽ ተጽእኖዎች',
    'settings.sound_effects_desc': 'የማሳወቂያ ድምጾችን እና የድምጽ ግብረመልስን ያንቁ',
    'settings.privacy_mode': 'የግላዊነት ሁነታ',
    'settings.privacy_mode_desc': 'በስክሪን ሾቶች ውስጥ ሚስጥራዊ መረጃን ደብቅ',
    'settings.auto_accept_appointments': 'ቀጠሮዎችን በራስ-ሰር ተቀበል',
    'settings.auto_accept_desc': 'አዲስ የቀጠሮ ጥያቄዎችን በራስ-ሰር ተቀበል',
    'settings.show_online_status': 'የመስመር ላይ ሁኔታን አሳይ',
    'settings.show_online_desc': 'ታካሚዎች መቼ እንደሚገኙ እንዲያዩ ያድርጉ',
    'settings.preferences_updated': 'ምርጫዎች በተሳካ ሁኔታ ተዘምነዋል',
    'settings.error_updating_preferences': 'ምርጫዎችን ማዘመን አልተሳካም',
    
    // Notifications
    'settings.notifications': 'ማሳወቂያዎች',
    'settings.notification_settings': 'የማሳወቂያ ቅንብሮች',
    'settings.notification_settings_desc': 'ማሳወቂያዎችን እንዴት እንደሚቀበሉ ያስተዳድሩ',
    'settings.therapist_notification_desc': 'ለቀጠሮዎች እና መልዕክቶች ማሳወቂያዎችን ያዋቅሩ',
    'settings.enable_notifications': 'ማሳወቂያዎችን አንቃ',
    'settings.enable_notifications_desc': 'ለአስፈላጊ ዝመናዎች ማሳወቂያዎችን ይቀበሉ',
    'settings.notification_types': 'የማሳወቂያ አይነቶች',
    'settings.email_notifications': 'የኢሜይል ማሳወቂያዎች',
    'settings.email_notifications_desc': 'በኢሜይል ማሳወቂያዎችን ይቀበሉ',
    'settings.therapist_email_desc': 'ስለ አዲስ ቀጠሮዎች እና መልዕክቶች ማሳወቂያ ይቀበሉ',
    'settings.sms_notifications': 'የኤስኤምኤስ ማሳወቂያዎች',
    'settings.sms_notifications_desc': 'በጽሁፍ መልዕክት ማሳወቂያዎችን ይቀበሉ',
    'settings.therapist_sms_desc': 'አስቸኳይ ማሳወቂያዎችን በኤስኤምኤስ ይቀበሉ',
    'settings.notification_schedule': 'የማሳወቂያ መርሃ ግብር',
    'settings.notification_schedule_desc': 'ማሳወቂያዎችን መቀበል የማይፈልጉበትን ጸጥታ ሰዓቶች ያዘጋጁ',
    'settings.quiet_hours_start': 'የጸጥታ ሰዓቶች መጀመሪያ',
    'settings.quiet_hours_end': 'የጸጥታ ሰዓቶች መጨረሻ',
    
    // Security
    'settings.security': 'ደህንነት',
    'settings.security_privacy': 'ደህንነት እና ግላዊነት',
    'settings.security_privacy_desc': 'የመለያ ደህንነት እና የግላዊነት ቅንብሮችዎን ያስተዳድሩ',
    'settings.therapist_security_desc': 'የሙያ መለያዎን በላቀ ደህንነት ይጠብቁ',
    'settings.two_factor_auth': 'ባለሁለት-ደረጃ ማረጋገጫ',
    'settings.two_factor_auth_desc': 'ለመለያዎ ተጨማሪ የደህንነት ሽፋን ይጨምሩ',
    'settings.login_alerts': 'የመግቢያ ማንቂያዎች',
    'settings.login_alerts_desc': 'አንድ ሰው ወደ መለያዎ ሲገባ ማሳወቂያ ይቀበሉ',
    'settings.session_timeout': 'የክፍለ ጊዜ ማብቂያ',
    'settings.session_timeout_desc': 'ከተወሰነ የእረፍት ጊዜ በኋላ በራስ-ሰር ይውጡ',
    'settings.minutes': 'ደቂቃዎች',
    'settings.hour': 'ሰዓት',
    'settings.hours': 'ሰዓቶች',
    'settings.never': 'በጭራሽ',
    'settings.security_updated': 'የደህንነት ቅንብሮች በተሳካ ሁኔታ ተዘምነዋል',
    'settings.error_updating_security': 'የደህንነት ቅንብሮችን ማዘመን አልተሳካም',
    
    // Availability
    'settings.availability': 'ተገኝነት',
    'settings.availability_schedule': 'የተገኝነት መርሃ ግብር',
    'settings.availability_desc': 'ለሳምንቱ እያንዳንዱ ቀን የስራ ሰዓቶችዎን ያዘጋጁ',
    'settings.monday': 'ሰኞ',
    'settings.tuesday': 'ማክሰኞ',
    'settings.wednesday': 'ረቡዕ',
    'settings.thursday': 'ሐሙስ',
    'settings.friday': 'አርብ',
    'settings.saturday': 'ቅዳሜ',
    'settings.sunday': 'እሁድ',
    'settings.availability_updated': 'ተገኝነት በተሳካ ሁኔታ ተዘምኗል',
    'settings.error_updating_availability': 'ተገኝነትን ማዘመን አልተሳካም',
    
    // Data Management
    'settings.data_management': 'የመረጃ አስተዳደር',
    'settings.export_data': 'መረጃዬን ላክ',
    'settings.data_exported': 'መረጃ በተሳካ ሁኔታ ተላከ',
    'settings.error_exporting_data': 'መረጃ መላክ አልተሳካም',
    'settings.view_privacy_policy': 'የግላዊነት ፖሊሲን ይመልከቱ',
    'settings.privacy': 'ግላዊነት',
    'settings.privacy_help': 'የግላዊነት ፖሊሲያችንን እና የመረጃ አያያዝ ልምዶችን ይገምግሙ',
    
    // Danger Zone
    'settings.danger_zone': 'የአደጋ ዞን',
    'settings.deactivate_account': 'መለያን አቦዝን',
    'settings.deactivate_account_desc': 'መለያዎን በቋሚነት ያቦዝኑ እና መረጃዎን ያስወግዱ',
    'settings.confirm_delete_account': 'መለያዎን ማቦዝን እርግጠኛ ነዎት? ይህ ተግባር መልሰው ማድረግ አይቻልም።',
    'settings.account_deactivated': 'መለያ በተሳካ ሁኔታ ተቦዝኗል',
    'settings.error_deleting_account': 'መለያን ማቦዝን አልተሳካም',
    
    // Appointments in Settings
    'settings.appointments': 'ቀጠሮዎች',
    'settings.my_appointments': 'የእኔ ቀጠሮዎች',
    'settings.appointments_desc': 'ቀጣይ ቀጠሮዎችዎን ይመልከቱ እና ያስተዳድሩ',
    'settings.no_appointments': 'ቀጣይ ቀጠሮዎች የሉም',
    'settings.book_appointment': 'አዲስ ቀጠሮ ይዘዙ',
    'settings.view_all_appointments': 'ሁሉንም ቀጠሮዎች ይመልከቱ',
    
    // FAQ
    'settings.faq': 'ተደጋጋሚ ጥያቄዎች',
    'settings.faq_title': 'ተደጋጋሚ ጥያቄዎች',
    'settings.faq_desc': 'ለተለመዱ ጥያቄዎች መልሶችን ያግኙ',
    'settings.need_more_help': 'ተጨማሪ እርዳታ ይፈልጋሉ?',
    'settings.contact_support': 'ድጋፍን ያነጋግሩ',
    'settings.coming_soon': 'በቅርቡ',
    
    // FAQ Questions
    'faq.how_to_book': 'እንዴት ቀጠሮ እዘዛለሁ?',
    'faq.how_to_book_answer': 'ወደ "ሐኪሞችን ፈልግ" ገጽ ይሂዱ፣ ያሉትን ሐኪሞች ይመልከቱ፣ እና በሚመርጡት ሐኪም መገለጫ ላይ "ቀጠሮ ይዘዙ" የሚለውን ይጫኑ።',
    'faq.cancel_appointment': 'ቀጠሮን እንዴት መሰረዝ እችላለሁ?',
    'faq.cancel_appointment_answer': 'ከታቀደው ጊዜ በፊት እስከ 24 ሰዓት ድረስ ከ"ቀጠሮዎች" ገጽዎ ቀጠሮዎችን መሰረዝ ይችላሉ።',
    'faq.payment_methods': 'ምን አይነት የክፍያ ዘዴዎች ይቀበላሉ?',
    'faq.payment_methods_answer': 'የሞባይል ገንዘብ፣ የባንክ ዝውውሮች እና የክሬዲት ካርዶችን ጨምሮ የተለያዩ የክፍያ ዘዴዎችን እንቀበላለን።',
    'faq.session_duration': 'እያንዳንዱ የሕክምና ክፍለ ጊዜ ምን ያህል ጊዜ ይወስዳል?',
    'faq.session_duration_answer': 'መደበኛ የሕክምና ክፍለ ጊዜዎች 50 ደቂቃ ይወስዳሉ፣ ነገር ግን ይህ በሐኪምዎ እና በሕክምና እቅድዎ ላይ በመመስረት ሊለያይ ይችላል።',
    'faq.privacy_security': 'መረጃዬ ደህንነቱ የተጠበቀ ነው?',
    'faq.privacy_security_answer': 'አዎ፣ የግል እና የሕክምና መረጃዎን ለመጠበቅ የኢንዱስትሪ-መደበኛ ምስጠራ እንጠቀማለን እና ጥብቅ የግላዊነት ፕሮቶኮሎችን እንከተላለን።',
    'faq.emergency_help': 'በአእምሮ ጤና ድንገተኛ አደጋ ጊዜ ምን ማድረግ አለብኝ?',
    'faq.emergency_help_answer': 'በድንገተኛ አደጋ ጊዜ፣ እባክዎ የአካባቢዎን የድንገተኛ አደጋ አገልግሎቶችን ወይም የቀውስ ሆትላይንን ወዲያውኑ ያነጋግሩ። ይህ መድረክ ለድንገተኛ አደጋ ሁኔታዎች አይደለም።',
  },
  
  afan_oromo: {
    // Navigation
    'nav.dashboard': 'Gabatee',
    'nav.assessment': 'Madaallii',
    'nav.therapists': 'Hakiimota Barbaadi',
    'nav.appointments': 'Beellama',
    'nav.chat': 'Haasawa',
    'nav.profile': 'Seenaa',
    'nav.logout': 'Ba\'i',
    
    // Common
    'common.loading': 'Fe\'aa jira...',
    'common.save': 'Olkaa\'i',
    'common.cancel': 'Dhiisi',
    'common.submit': 'Galchi',
    'common.back': 'Deebi\'i',
    'common.next': 'Itti aansu',
    'common.previous': 'Dura',
    'common.close': 'Cufii',
    'common.edit': 'Fooyyessi',
    'common.delete': 'Haqi',
    'common.view': 'Ilaali',
    'common.search': 'Barbaadi',
    'common.filter': 'Cali',
    
    // Assessment
    'assessment.title': 'Madaallii Fayyaa Sammuu',
    'assessment.subtitle': 'Maaloo gaaffilee armaan gadii amanamummaadhaan deebisaa',
    'assessment.start': 'Madaallii Jalqabi',
    'assessment.question': 'Gaaffii',
    'assessment.of': 'keessaa',
    'assessment.complete': 'Madaallii Xumuri',
    'assessment.result': 'Bu\'aa Madaallii',
    'assessment.confidence': 'Amanamummaa AI',
    'assessment.recommendation': 'Gorsaa',
    
    // Therapists
    'therapists.title': 'Hakiimota Barbaadi',
    'therapists.subtitle': 'Ogeessota fayyaa sammuu hayyamaa ta\'an waliin wal qunnamaa',
    'therapists.book': 'Beellama Galmeessi',
    'therapists.view_profile': 'Seenaa Ilaali',
    'therapists.specialization': 'Addaa',
    'therapists.rating': 'Sadarkaa',
    'therapists.price': 'Gatii tokkoo yeroof',
    
    // Appointments
    'appointments.title': 'Beellamni Koo',
    'appointments.upcoming': 'Dhufuuf jiru',
    'appointments.past': 'Darbe',
    'appointments.cancelled': 'Dhiifame',
    'appointments.reschedule': 'Irra deebi\'ii beellami',
    'appointments.cancel': 'Dhiisi',
    'appointments.join': 'Yeroo itti makamuu',
    
    // Auth
    'auth.login': 'Seeni',
    'auth.register': 'Galmaa\'i',
    'auth.email': 'Imeelii',
    'auth.password': 'Jecha icciitii',
    'auth.full_name': 'Maqaa guutuu',
    'auth.language': 'Afaan',
    'auth.role': 'Gahee',
    'auth.patient': 'Dhukkubsataa',
    'auth.therapist': 'Hakiima',
    
    // Dashboard
    'dashboard.welcome': 'Baga nagaan dhuftan',
    'dashboard.recent_assessment': 'Madaallii dhiyoo',
    'dashboard.next_appointment': 'Beellama itti aanu',
    'dashboard.quick_actions': 'Gocha saffisaa',
    'dashboard.ai_assessment': 'Madaallii AI',
    'dashboard.ai_assessment_desc': 'Hubannoo fayyaa sammuu ariifataa argadhu',
    'dashboard.find_therapist': 'Hakiima Barbaadi',
    'dashboard.find_therapist_desc': 'Ogeessota waliin wal qunnamaa',
    'dashboard.my_appointments': 'Beellamni Koo',
    'dashboard.my_appointments_desc': 'Beellama keessan ilaali',
    'dashboard.settings_desc': 'Seenaa keessan bulchaa',
    'dashboard.start_here': 'Asii jalqabi',
    'dashboard.popular': 'Jaallatamaa',
  },
  
  tigrigna: {
    // Navigation
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.assessment': 'ምዘና',
    'nav.therapists': 'ሓኪማት ድለ',
    'nav.appointments': 'ቀጠሮታት',
    'nav.chat': 'ዝርርብ',
    'nav.profile': 'መገለጺ',
    'nav.logout': 'ወጽእ',
    
    // Common
    'common.loading': 'ይጽዕን ኣሎ...',
    'common.save': 'ዓቅብ',
    'common.cancel': 'ሰርዝ',
    'common.submit': 'ኣእቱ',
    'common.back': 'ተመለስ',
    'common.next': 'ቀጻሊ',
    'common.previous': 'ቀዳማይ',
    'common.close': 'ዓጽወ',
    'common.edit': 'ኣርም',
    'common.delete': 'ሰርዝ',
    'common.view': 'ርአ',
    'common.search': 'ድለ',
    'common.filter': 'ፍልተር',
    
    // Assessment
    'assessment.title': 'ምዘና ጥዕና ኣእምሮ',
    'assessment.subtitle': 'በጃኻ ነዞም ዝስዕቡ ሕቶታት ብሓቂ መልስ',
    'assessment.start': 'ምዘና ጀምር',
    'assessment.question': 'ሕቶ',
    'assessment.of': 'ካብ',
    'assessment.complete': 'ምዘና ዛዝም',
    'assessment.result': 'ውጽኢት ምዘና',
    'assessment.confidence': 'እምነት AI',
    'assessment.recommendation': 'ምኽሪ',
    
    // Therapists
    'therapists.title': 'ሓኪማት ድለ',
    'therapists.subtitle': 'ምስ ፍቓድ ዘለዎም ኣብያተ ሓኪማት ጥዕና ኣእምሮ ተራኸብ',
    'therapists.book': 'ቀጠሮ ምዝገባ',
    'therapists.view_profile': 'መገለጺ ርአ',
    'therapists.specialization': 'ስፔሻላይዜሽን',
    'therapists.rating': 'ደረጃ',
    'therapists.price': 'ዋጋ ንሓደ ክፍለ ግዜ',
    
    // Appointments
    'appointments.title': 'ቀጠሮታተይ',
    'appointments.upcoming': 'ዝመጽእ',
    'appointments.past': 'ዝሓለፈ',
    'appointments.cancelled': 'ዝተሰረዘ',
    'appointments.reschedule': 'ደጊምካ ምርጋብ',
    'appointments.cancel': 'ሰርዝ',
    'appointments.join': 'ክፍለ ግዜ ተሳተፍ',
    
    // Auth
    'auth.login': 'እቶ',
    'auth.register': 'ተመዝገብ',
    'auth.email': 'ኢመይል',
    'auth.password': 'ቃል ምሕላፍ',
    'auth.full_name': 'ምሉእ ስም',
    'auth.language': 'ቋንቋ',
    'auth.role': 'ተራ',
    'auth.patient': 'ሕሙም',
    'auth.therapist': 'ሓኪም',
    
    // Dashboard
    'dashboard.welcome': 'እንቋዕ ብደሓን መጻእካ',
    'dashboard.recent_assessment': 'ናይ ቀረባ ግዜ ምዘና',
    'dashboard.next_appointment': 'ቀጻሊ ቀጠሮ',
    'dashboard.quick_actions': 'ቅልጡፍ ተግባራት',
    'dashboard.ai_assessment': 'ናይ AI ምዘና',
    'dashboard.ai_assessment_desc': 'ቅልጡፍ ናይ ኣእምሮ ጥዕና ርድኢት ረኽብ',
    'dashboard.find_therapist': 'ሓኪም ድለ',
    'dashboard.find_therapist_desc': 'ምስ ኣብያተ ሓኪማት ተራኸብ',
    'dashboard.my_appointments': 'ቀጠሮታተይ',
    'dashboard.my_appointments_desc': 'ናይ ቦታ ምሕዝነትካ ርአ',
    'dashboard.settings_desc': 'መገለጺኻ ኣመሓድር',
    'dashboard.start_here': 'ኣብዚ ጀምር',
    'dashboard.popular': 'ተፈታዊ',
  },
  
  somali: {
    // Navigation
    'nav.dashboard': 'Shabakada',
    'nav.assessment': 'Qiimayn',
    'nav.therapists': 'Raadi Takhaatiirta',
    'nav.appointments': 'Ballamaha',
    'nav.chat': 'Sheeko',
    'nav.profile': 'Astaan',
    'nav.logout': 'Ka bax',
    
    // Common
    'common.loading': 'Waa la rarayo...',
    'common.save': 'Kaydi',
    'common.cancel': 'Jooji',
    'common.submit': 'Dir',
    'common.back': 'Dib u noqo',
    'common.next': 'Xiga',
    'common.previous': 'Hore',
    'common.close': 'Xir',
    'common.edit': 'Wax ka beddel',
    'common.delete': 'Tirtir',
    'common.view': 'Eeg',
    'common.search': 'Raadi',
    'common.filter': 'Kala saar',
    
    // Assessment
    'assessment.title': 'Qiimaynta Caafimaadka Maskaxda',
    'assessment.subtitle': 'Fadlan su\'aalahan soo socda si daacad ah ugu jawaab',
    'assessment.start': 'Bilow Qiimaynta',
    'assessment.question': 'Su\'aal',
    'assessment.of': 'ka mid ah',
    'assessment.complete': 'Dhammaystir Qiimaynta',
    'assessment.result': 'Natiijada Qiimaynta',
    'assessment.confidence': 'Kalsoonida AI',
    'assessment.recommendation': 'Talo',
    
    // Therapists
    'therapists.title': 'Raadi Takhaatiirta',
    'therapists.subtitle': 'Kula xiriir takhaatiirta caafimaadka maskaxda ee ruqsad leh',
    'therapists.book': 'Ballam Samee',
    'therapists.view_profile': 'Eeg Astaamaha',
    'therapists.specialization': 'Takhasuska',
    'therapists.rating': 'Qiimayn',
    'therapists.price': 'Qiimaha hal fadhiga',
    
    // Appointments
    'appointments.title': 'Ballamahaygii',
    'appointments.upcoming': 'Soo socda',
    'appointments.past': 'Hore u dhacay',
    'appointments.cancelled': 'La joojiyay',
    'appointments.reschedule': 'Dib u qorshe',
    'appointments.cancel': 'Jooji',
    'appointments.join': 'Ku biir fadhiga',
    
    // Auth
    'auth.login': 'Gal',
    'auth.register': 'Isdiiwaangeli',
    'auth.email': 'Iimayl',
    'auth.password': 'Furaha sirta ah',
    'auth.full_name': 'Magaca buuxa',
    'auth.language': 'Luqadda',
    'auth.role': 'Doorka',
    'auth.patient': 'Bukaan',
    'auth.therapist': 'Takhtaar',
    
    // Dashboard
    'dashboard.welcome': 'Soo dhawoow',
    'dashboard.recent_assessment': 'Qiimaynta dhowaan',
    'dashboard.next_appointment': 'Ballamka xiga',
    'dashboard.quick_actions': 'Ficillada degdegga ah',
    'dashboard.ai_assessment': 'Qiimaynta AI',
    'dashboard.ai_assessment_desc': 'Hel fahamka degdegga ah ee caafimaadka maskaxda',
    'dashboard.find_therapist': 'Raadi Takhtaar',
    'dashboard.find_therapist_desc': 'Kula xiriir takhaatiirta',
    'dashboard.my_appointments': 'Ballamahaygii',
    'dashboard.my_appointments_desc': 'Eeg ballantaada',
    'dashboard.settings_desc': 'Maamul astaamahaaga',
    'dashboard.start_here': 'Halkan ka bilow',
    'dashboard.popular': 'Caanka ah',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<string>(() => {
    // Try to get language from localStorage first, then default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  // Translation function
  const t = (key: string): string => {
    // When English is selected, always return English translations
    if (language === 'en') {
      const englishTranslations = translations.en;
      return englishTranslations[key as keyof typeof englishTranslations] || key;
    }
    
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
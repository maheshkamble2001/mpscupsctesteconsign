// ======================================================================
// 🚀 MPSC/UPSC TEST SERIES ADMIN - GLOBAL APPLICATION CONSTANTS
// ======================================================================

/**
 * @description 1. App Core Identity Settings
 */
export const APP_NAME = "MPSC/UPSC TEST SERIES ADMIN";
export const APP_SHORT_NAME = "MPSC/UPSC ADMIN";
export const APP_KEY = "tailux_admin_session";
export const VERSION = "1.0.0";

/**
 * @description 2. Authentication & Core Route Redirect Paths
 */
export const REDIRECT_URL_KEY = "redirect";
export const HOME_PATH = "/";
// export const GHOST_ENTRY_PATH = "/login";
export const GHOST_ENTRY_PATH = "/home";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const UNAUTHORIZED_PATH = "/403";

/**
 * @description 3. Sidebar Layout & Navigation Structural Types
 */
export const NAV_TYPE_ROOT = 'root';
export const NAV_TYPE_GROUP = 'group';
export const NAV_TYPE_COLLAPSE = 'collapse';
export const NAV_TYPE_ITEM = 'item';
export const NAV_TYPE_DIVIDER = 'divider';

/**
 * @description 4. Theme Semantic Names Array (Tailwind-compatible mapping)
 */
export const COLORS = ['neutral', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

/**
 * @description 5. Brand Identity Exact Hex Colors (For Charts, Inline Styles, Canvas)
 */
export const BRAND_HEX_COLORS = {
    primary: "#3567AE",     // Royal Blue (Buttons, Active States, Navigation Layout)
    secondary: "#DC2626",   // Crimson Red (Live Alerts, Test Status Indicators)
    success: "#10B981",     // Emerald Green (Published Question Papers, Approved Payments)
    warning: "#F59E0B",     // Amber Yellow (Draft Tests, Pending Approvals, Scheduled)
    error: "#EF4444",       // Bright Red (Deletions, Role Restrictions, System Failures)
    info: "#06B6D4",        // Cyber Cyan (Syllabus Data, Help Manuals, Info Boxes)
    neutral: {
        lightBg: "#F8FAFC",   // Canvas Light Background (Slate 50)
        darkBg: "#0F172A",    // Canvas Dark Mode Background (Slate 900)
        border: "#E2E8F0",    // Global Fine Outline Border (Slate 200)
        text: "#334155"       // Highly Readable Body Text (Slate 700)
    }
};

/**
 * @description 6. Typography Profiles (Tailwind Utility Composition Presets)
 */
export const FONT_PROFILES = {
    // Title & Section Headers (e.g., MPSC / UPSC TEST SERIES ADMIN Header Layouts)
    titleFont: "font-black tracking-tight uppercase",

    // High Readability for MCQs, Question Layouts, Options, and Admin Tables
    bodyFont: "font-sans antialiased text-slate-700 dark:text-slate-200",

    // Technical Logs & Metadata (e.g., Test Codes, Paper IDs, JSON Responses, Permissions)
    codeFont: "font-mono text-xs font-bold text-slate-500"
};

/**
 * @description 7. Test Engine Business Rules & Parameters (MPSC/UPSC Pattern Spec)
 */
export const TEST_ENGINE_CONFIG = {
    DEFAULT_NEGATIVE_MARKING: "0.25",            // Standard MPSC/UPSC 1/4th penalty formula
    MAX_QUESTIONS_PER_PAGE: 50,                  // Form builder pagination threshold
    ALLOWED_EXAM_STREAMS: ["MPSC", "UPSC", "COMBINED_EXAMS"],
    SUPPORTED_LANGUAGES: ["MARATHI", "ENGLISH", "BILINGUAL"]
};

export const APP_CONFIG = {
    // COLOR CONFIGS
    COLOR1: "#F8FAFC", 
}
export const BUTTON_CONFIG = {
    // 🔵 VARIANT 1: PRIMARY ACTION (रॉयल ब्लू थीम - फॉर्म सबमिट, टेस्ट सेव, ऐड क्वेश्चन)
    PRIMARY_BG: "#3567AE",
    PRIMARY_HOVER: "#2A538F",
    PRIMARY_ACTIVE: "#1E3D6B",
    PRIMARY_DISABLED: "#9CA3AF",

    // 🔴 VARIANT 2: SECONDARY ACTION (क्रिमसन रेड थीम - गो लाइव, अलर्ट्स, पब्लिश)
    SECONDARY_BG: "#DC2626",
    SECONDARY_HOVER: "#B91C1C",
    SECONDARY_ACTIVE: "#991B1B",
    SECONDARY_DISABLED: "#E5E7EB",

    // 🟢 VARIANT 3: SUCCESS (एम्परर ग्रीन थीम - अप्रूवल्स, मार्क्स वेरिफिकेशन, पेमेंट्स सक्सेस)
    SUCCESS_BG: "#10B981",
    SUCCESS_HOVER: "#059669",
    SUCCESS_ACTIVE: "#047857",
    SUCCESS_DISABLED: "#D1FAE5",

    // 🟡 VARIANT 4: WARNING (एम्बर येलो थीम - ड्राफ्ट्स, शेड्यूल टेस्ट, पेंडिंग रिव्यूज)
    WARNING_BG: "#F59E0B",
    WARNING_HOVER: "#D97706",
    WARNING_ACTIVE: "#B45309",
    WARNING_DISABLED: "#FEF3C7",

    // 🛑 VARIANT 5: DANGER (ब्राइट रेड थीम - टेस्ट डिलीट करना, रोल्स रिस्ट्रिक्ट/ब्लॉक करना)
    DANGER_BG: "#EF4444",
    LIVE_HOVER: "#DC2626",
    LIVE_ACTIVE: "#B91C1C",
    LIVE_DISABLED: "#FEE2E2",

    // ⚪ VARIANT 6: OUTLINE / NEUTRAL (ग्रे/बॉर्डर थीम - कैंसिलेशन, बैक टू लिस्ट, क्लोज मोडल)
    NEUTRAL_BG: "#FFFFFF",
    NEUTRAL_HOVER: "#F8FAFC",
    NEUTRAL_ACTIVE: "#F1F5F9",
    NEUTRAL_BORDER: "#E2E8F0",
    NEUTRAL_TEXT: "#334155",

    BUTTON_COLOR1: "linear-gradient(135deg, rgb(54, 109, 176), rgb(255, 69, 66))", // Royal Blue (Primary Action Buttons)
    HOVER_COLOR1: "#2C5282", // Darker Royal Blue (Hover State)
    ACTIVE_COLOR1: "#1E40AF", // Even Darker Royal Blue (Active State)
    DISABLED_COLOR1: "#9CA3AF", // Even Darker Royal Blue (Active State)

    BUTTON_COLOR2: "linear-gradient(135deg, #3368AF, #FE4543)", // Royal Blue (Primary Action Buttons)
};
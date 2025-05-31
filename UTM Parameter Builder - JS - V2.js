// main.js - Consolidated JavaScript for Unified Marketing URL & Tracking Builder

document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL CONSTANTS & DOM ELEMENTS ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentDateElement = document.getElementById('currentDate');
    const currentYearElement = document.getElementById('currentYear');

    // Configuration Save/Load Elements
    const configNameInput = document.getElementById('configName');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const loadConfigSelect = document.getElementById('loadConfigSelect');
    const loadConfigBtn = document.getElementById('loadConfigBtn');
    const deleteConfigBtn = document.getElementById('deleteConfigBtn');
    const configActionFeedback = document.getElementById('configActionFeedback');
    const CONFIG_STORAGE_KEY = 'utmBuilderConfigurations';

    // --- GLOBAL HELPER FUNCTIONS ---

    /**
     * Toggles the theme between light and dark mode.
     * Updates localStorage and the theme icon.
     */
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
        initLucideIcons(); // Re-render icons as they might change with theme
    }

    /**
     * Applies the saved theme from localStorage on page load.
     * Defaults to system preference if no theme is saved.
     */
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcon(isDark);
    }

    /**
     * Updates the theme toggle button's icon (sun/moon).
     * @param {boolean} isDark - True if dark mode is active, false otherwise.
     */
    function updateThemeIcon(isDark) {
        if (themeToggleIcon) {
            themeToggleIcon.innerHTML = isDark ?
                '<i data-lucide="sun"></i> Light' : // Show sun icon in dark mode, meaning click for light
                '<i data-lucide="moon"></i> Dark';  // Show moon icon in light mode, meaning click for dark
        }
        // Ensure Lucide icons are re-rendered after changing innerHTML
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    /**
     * Sets the current date and year in the footer.
     */
    function setCurrentDateAndYear() {
        const now = new Date();
        if (currentDateElement) {
            currentDateElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        if (currentYearElement) {
            currentYearElement.textContent = now.getFullYear();
        }
    }

    /**
     * Initializes or re-renders Lucide icons on the page.
     */
    function initLucideIcons() {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        } else {
            console.warn("Lucide icons library not found or createIcons method is missing.");
        }
    }

    /**
     * Copies text to the clipboard.
     * Shows success or error messages in the provided elements.
     * @param {string} textToCopy - The text to be copied.
     * @param {HTMLElement} successMsgEl - The HTML element to display the success message.
     * @param {HTMLElement} errorMsgEl - The HTML element to display the error message.
     */
    async function copyToClipboard(textToCopy, successMsgEl, errorMsgEl) {
        if (!textToCopy) {
            if (errorMsgEl) {
                errorMsgEl.textContent = "Nothing to copy.";
                errorMsgEl.style.display = 'inline-block';
                 if (successMsgEl) successMsgEl.style.display = 'none';
                setTimeout(() => { errorMsgEl.style.display = 'none'; }, 3000);
            }
            return;
        }

        if (successMsgEl) successMsgEl.style.display = 'none';
        if (errorMsgEl) errorMsgEl.style.display = 'none';

        try {
            await navigator.clipboard.writeText(textToCopy);
            if (successMsgEl) {
                successMsgEl.textContent = "Copied!";
                successMsgEl.style.display = 'inline-block';
                setTimeout(() => { successMsgEl.style.display = 'none'; }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text using navigator.clipboard: ', err);
            // Fallback method
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed"; // Prevent scrolling to bottom
                textArea.style.opacity = "0"; // Make it invisible
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successMsgEl) {
                    successMsgEl.textContent = "Copied (fallback)!";
                    successMsgEl.style.display = 'inline-block';
                    setTimeout(() => { successMsgEl.style.display = 'none'; successMsgEl.textContent = "Copied!"; }, 2000);
                }
            } catch (fallbackErr) {
                console.error('Fallback copy method failed:', fallbackErr);
                if (errorMsgEl) {
                    errorMsgEl.textContent = "Failed to copy!";
                    errorMsgEl.style.display = 'inline-block';
                    setTimeout(() => { errorMsgEl.style.display = 'none'; }, 3000);
                }
            }
        }
    }

    /**
     * Creates a tooltip span element.
     * @param {string} text - The text content for the tooltip.
     * @returns {HTMLSpanElement} The created tooltip span element.
     */
    function createTooltip(text) {
        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.textContent = text;
        return tooltipSpan;
    }

    /**
     * Creates an info icon span element.
     * This version adds a specific class to the inner <i> tag for better CSS targeting of the SVG.
     * @returns {HTMLSpanElement} The created info icon span element.
     */
    function createInfoIcon() {
        const infoIconSpan = document.createElement('span');
        // This class provides the circular background and general sizing for the container
        infoIconSpan.className = 'info-icon'; 
        
        const iTag = document.createElement('i');
        iTag.setAttribute('data-lucide', 'info');
        // This class is for the Lucide icon itself. w-3 h-3 sets its size.
        // 'info-icon-svg-tag' is added for more specific CSS targeting if needed.
        iTag.className = 'w-3 h-3 info-icon-svg-tag'; 
        
        infoIconSpan.appendChild(iTag);
        return infoIconSpan;
    }

    /**
     * Sets up an accordion functionality for a given header, content, and arrow element.
     * @param {HTMLElement} headerEl - The accordion header element.
     * @param {HTMLElement} contentEl - The accordion content element.
     * @param {HTMLElement} arrowEl - The accordion arrow element (optional).
     */
    function setupAccordion(headerEl, contentEl, arrowEl) {
        if (headerEl && contentEl) {
            headerEl.addEventListener('click', () => {
                const isOpen = contentEl.classList.toggle('open');
                headerEl.setAttribute('aria-expanded', isOpen.toString());
                if (arrowEl) {
                    arrowEl.classList.toggle('open', isOpen);
                    const icon = arrowEl.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-right');
                        initLucideIcons(); // Re-render the changed icon
                    }
                }
                if (isOpen) { // If opening, ensure icons inside are rendered
                    setTimeout(() => initLucideIcons(), 0); // Slight delay for transition
                }
            });
            // Set initial ARIA state
            headerEl.setAttribute('aria-expanded', contentEl.classList.contains('open').toString());
            if (arrowEl) { // Set initial arrow state
                 const icon = arrowEl.querySelector('i');
                 if(icon) icon.setAttribute('data-lucide', contentEl.classList.contains('open') ? 'chevron-down' : 'chevron-right');
            }
        }
    }

    // --- CONFIGURATION MANAGEMENT ---

    /**
     * Retrieves saved configurations from localStorage.
     * @returns {object} The saved configurations object.
     */
    function getSavedConfigs() {
        return JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)) || {};
    }

    /**
     * Saves the current configuration data under a given name.
     * @param {string} name - The name for the configuration.
     * @param {object} data - The configuration data to save.
     */
    function saveCurrentConfig(name, data) {
        const configs = getSavedConfigs();
        configs[name] = data;
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
        populateConfigSelect();
        showConfigFeedback(`Configuration "${name}" saved.`, true);
    }

    /**
     * Loads a saved configuration by name and applies it to the form.
     * @param {string} name - The name of the configuration to load.
     */
    function loadConfig(name) {
        const configs = getSavedConfigs();
        if (configs[name]) {
            const data = configs[name];
            const targetTabId = data._tabId; // Get the tab this config was saved for

            if (!targetTabId) {
                showConfigFeedback("Configuration is missing tab information. Cannot load.", false);
                return;
            }

            // Ensure the correct tab is active
            const activeTabButton = document.querySelector(`.tab-button[data-tab="${targetTabId}"]`);
            if (!activeTabButton || !activeTabButton.classList.contains('active')) {
                 showConfigFeedback(`Please switch to the '${targetTabId.replace("Tab", "")}' tab to load this configuration.`, false);
                return;
            }
            
            Object.keys(data).forEach(elementId => {
                if (elementId === '_tabId') return; // Skip the tab identifier itself

                const element = document.getElementById(elementId);
                if (element) {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        element.checked = data[elementId];
                    } else if (element.tagName === 'SELECT') {
                        element.value = data[elementId];
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        element.value = data[elementId];
                    }
                    if (element.type === 'text' || element.type === 'url' || element.tagName === 'TEXTAREA' || element.type === 'search') {
                         element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (element.type === 'checkbox') {
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });

            if (targetTabId === 'ga4Tab' && typeof ga4Builder !== 'undefined' && ga4Builder.isInitialized()) ga4Builder.generateUrl();
            else if (targetTabId === 'googleAdsTab' && typeof googleAdsBuilder !== 'undefined' && googleAdsBuilder.isInitialized()) googleAdsBuilder.generateTrackingString();
            else if (targetTabId === 'microsoftAdsTab' && typeof microsoftAdsBuilder !== 'undefined' && microsoftAdsBuilder.isInitialized()) microsoftAdsBuilder.generateTrackingString();
            else if (targetTabId === 'metaAdsTab' && typeof metaAdsBuilder !== 'undefined' && metaAdsBuilder.isInitialized()) metaAdsBuilder.buildUrl();

            showConfigFeedback(`Configuration "${name}" loaded.`, true);
        } else {
            showConfigFeedback(`Configuration "${name}" not found.`, false);
        }
    }

    /**
     * Deletes a saved configuration by name.
     * @param {string} name - The name of the configuration to delete.
     */
    function deleteConfig(name) {
        const configs = getSavedConfigs();
        if (configs[name]) {
            delete configs[name];
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
            populateConfigSelect();
            showConfigFeedback(`Configuration "${name}" deleted.`, true);
        } else {
            showConfigFeedback(`Configuration "${name}" not found.`, false);
        }
    }

    /**
     * Populates the "Load Configuration" dropdown with saved configurations.
     */
    function populateConfigSelect() {
        if (!loadConfigSelect) return;
        const configs = getSavedConfigs();
        loadConfigSelect.innerHTML = '<option value="">Select a configuration...</option>'; // Reset
        Object.keys(configs).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            loadConfigSelect.appendChild(option);
        });
    }

    /**
     * Shows feedback messages for configuration actions.
     * @param {string} message - The message to display.
     * @param {boolean} success - True if the action was successful, false otherwise.
     */
    function showConfigFeedback(message, success) {
        if (!configActionFeedback) return;
        configActionFeedback.textContent = message;
        configActionFeedback.className = `mt-2 text-sm h-5 ${success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
        setTimeout(() => { configActionFeedback.textContent = ''; }, 3000);
    }

    /**
     * Collects form data from the currently active tab.
     * @returns {object|null} An object containing form data, or null if no active tab.
     */
    function collectFormDataForActiveTab() {
        const activeTabContent = document.querySelector('.tab-content.active');
        if (!activeTabContent) return null;
        const data = {};
        activeTabContent.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.id) { 
                if (el.type === 'checkbox' || el.type === 'radio') {
                    data[el.id] = el.checked;
                } else {
                    data[el.id] = el.value;
                }
            }
        });
        return data;
    }


    // --- GA4 UTM BUILDER (with URL Analyzer) ---
    const ga4Builder = (() => {
        const channelSelect = document.getElementById("ga4-channel");
        const channelDesc = document.getElementById("ga4-channel-description");
        const channelCond = document.getElementById("ga4-channel-conditions");
        const channelInfoWrapper = document.getElementById("ga4-channel-info-wrapper");
        const finalUrlTextarea = document.getElementById("ga4-final-url");
        const copyBtn = document.getElementById("ga4-copy-url");
        const copyMessageEl = document.getElementById("ga4-copy-message");
        const copyErrorEl = document.getElementById("ga4-copy-error");
        const baseUrlInput = document.getElementById("ga4-base-url");
        const baseUrlError = document.getElementById("ga4-base-url-error");
        const forceLowercaseToggle = document.getElementById("ga4-force-lowercase");
        const coreUtmInputsContainer = document.getElementById('ga4-core-utm-inputs-container');
        const optionalUtmInputsContainer = document.getElementById('ga4-optional-utm-inputs-container');
        const ga4InputsContainer = document.getElementById('ga4-ga4-inputs-container');
        const toggleOptionalParamsBtn = document.getElementById('ga4-toggle-optional-params');
        const optionalParamsSection = document.getElementById('ga4-optional-parameters-section');
        const toggleArrowSpan = document.getElementById('ga4-toggle-arrow'); 
        const complianceFeedbackEl = document.getElementById('ga4-compliance-feedback');
        const analyzeUrlInput = document.getElementById("ga4-analyze-url-input");
        const predictFromUrlBtn = document.getElementById("ga4-predict-from-url-btn");
        const analyzedUrlFeedbackEl = document.getElementById("ga4-analyzed-url-prediction-feedback");
        let builderInitialized = false;

        const utmParamsConfig = [
            { id: "utm_source", label: "Campaign Source (utm_source)", tooltip: "Identify the advertiser, site, publication, etc. that is sending traffic to your property, for example: google, newsletter4, billboard.", placeholder: "e.g., google, facebook", required: true, core: true, isSearchable: true },
            { id: "utm_medium", label: "Campaign Medium (utm_medium)", tooltip: "The advertising or marketing medium, for example: cpc, banner, email newsletter.", placeholder: "e.g., cpc, email, social", required: true, core: true, isSearchable: true },
            { id: "utm_campaign", label: "Campaign Name (utm_campaign)", tooltip: "The individual campaign name, slogan, promo code, etc. for a product.", placeholder: "e.g., spring_sale", required: true, core: true },
            { id: "utm_content", label: "Campaign Content (utm_content)", tooltip: "Used to differentiate similar content, or links within the same ad. For example, if you have two call-to-action links within the same email message, you can use utm_content and set different values for each so you can tell which version is more effective.", placeholder: "e.g., logolink, text_ad", required: false, core: false },
            { id: "utm_term", label: "Campaign Term (utm_term)", tooltip: "Identify paid search keywords. If you're manually tagging paid keyword campaigns, you should also use utm_term to specify the keyword.", placeholder: "e.g., running+shoes", required: false, core: false },
            { id: "utm_id", label: "Campaign ID (utm_id)", tooltip: "The campaign ID is used to identify a specific campaign or promotion. This is a required key for GA4 data import.", placeholder: "e.g., abc.123", required: false, core: false },
        ];
        const ga4ParamsConfig = [
             { id: "utm_source_platform", label: "Source Platform (utm_source_platform)", tooltip: "The platform where the marketing activity is managed (e.g., 'Google Ads', 'Manual', 'DV360', 'Search Ads 360'). This parameter is collected automatically for Google Ads if auto-tagging is enabled, but can be manually overridden.", placeholder: "e.g., Google Ads", required: false },
             { id: "utm_creative_format", label: "Creative Format (utm_creative_format)", tooltip: "The type of creative (e.g., 'display', 'video', 'search', 'native', 'social_post'). For example, 'display', 'native', 'video', 'search'.", placeholder: "e.g., display_banner_300x250", required: false },
             { id: "utm_marketing_tactic", label: "Marketing Tactic (utm_marketing_tactic)", tooltip: "The targeting criteria applied to a campaign (e.g., 'remarketing', 'prospecting', 'lookalike_audience'). For example, 'remarketing', 'prospecting'.", placeholder: "e.g., remarketing_dynamic", required: false },
        ];
        const allParamIds = [...utmParamsConfig.map(p => p.id), ...ga4ParamsConfig.map(p => p.id)];

        const channels = { 
            "Direct": {
                description: "Users who typed your site's URL directly or used bookmarks.",
                condition: 'Source exactly matches "(direct)" AND Medium is one of ("(not set)", "(none)")',
                ga4RecommendedMediums: ["(not set)", "(none)"],
                ga4RecommendedSources: ["(direct)"]
            },
            "Cross-network": {
                description: "Users from ads on various networks (e.g., Performance Max, Smart Shopping, Demand Gen).",
                condition: "Campaign Name contains 'cross-network' OR Medium is one of ('cross-network', 'demand gen', 'performance max', 'smart shopping')",
                ga4RecommendedMediums: ["cross-network", "demand gen", "performance max", "smart shopping"],
                ga4RecommendedSources: ["google", "microsoft", "facebook", "instagram", "youtube", "demandbase", "linkedin", "criteo", "taboola", "outbrain"] 
            },
            "Paid Shopping": {
                description: "Users from paid ads on shopping platforms.",
                condition: "(Source matches a list of shopping sites OR Campaign Name matches regex ^(.*(([^a-df-z]|^)shop|shopping).*)$) AND Medium matches regex ^(.*cp.*|ppc|retargeting|paid.*)$",
                targetSourceCategory: "SOURCE_CATEGORY_SHOPPING",
                ga4RecommendedMediums: [
                    "cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc",
                    "ppc", "retargeting", "paid", "paidshopping", "paid_shopping", "paid-shopping",
                ]
            },
            "Paid Search": {
                description: "Users from paid search engine ads.",
                condition: "Source matches a list of search sites AND Medium matches regex ^(.*cp.*|ppc|retargeting|paid.*)$",
                targetSourceCategory: "SOURCE_CATEGORY_SEARCH",
                ga4RecommendedMediums: [
                    "cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc",
                    "ppc", "retargeting", "paid", "paidsearch", "paid_search", "paid-search",
                    "paidsearches",
                ]
            },
            "Paid Social": {
                description: "Users from paid ads on social media.",
                condition: "Source matches a regex list of social sites AND Medium matches regex ^(.*cp.*|ppc|retargeting|paid.*)$",
                targetSourceCategory: "SOURCE_CATEGORY_SOCIAL",
                ga4RecommendedMediums: [
                    "cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc",
                    "ppc", "retargeting", "paid", "paidsocial", "paid_social", "paid-social",
                ]
            },
            "Paid Video": {
                description: "Users from paid video ads.",
                condition: "Source matches a list of video sites AND Medium matches regex ^(.*cp.*|ppc|retargeting|paid.*)$",
                targetSourceCategory: "SOURCE_CATEGORY_VIDEO",
                ga4RecommendedMediums: [
                    "cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc",
                    "ppc", "retargeting", "paid", "paidmedia", "paid_media", "paid-media",
                    "paidvideo", "paid_video", "paid-video",
                ]
            },
            "Display": {
                description: "Users from display ads.",
                condition: "Medium is one of ('display', 'banner', 'expandable', 'interstitial', 'cpm')",
                ga4RecommendedMediums: ["display", "banner", "expandable", "interstitial", "cpm"],
                ga4RecommendedSources: ["google", "criteo", "adroll", "taboola", "outbrain", "linkedin", "facebook", "instagram", "twitter", "bing", "yahoo"] 
            },
            "Paid Other": {
                description: "Users from other paid ads not fitting other categories.",
                condition: "Medium matches regex ^(.*cp.*|ppc|retargeting|paid.*)$",
                ga4RecommendedMediums: [
                    "cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc",
                    "ppc", "retargeting", "paid", "paid_other", "paid-other"
                ]
            },
            "Organic Shopping": {
                description: "Users from unpaid links on shopping platforms.",
                condition: "Source matches a list of shopping sites OR Campaign name matches regex ^(.*(([^a-df-z]|^)shop|shopping).*)$",
                targetSourceCategory: "SOURCE_CATEGORY_SHOPPING",
                ga4RecommendedMediums: ["shop", "shopping", "organic-shopping", "feed", "product_listing_organic"]
            },
            "Organic Social": {
                description: "Users from unpaid links on social media.",
                condition: "Source matches a regex list of social sites OR Medium is one of ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media')",
                targetSourceCategory: "SOURCE_CATEGORY_SOCIAL",
                ga4RecommendedMediums: ["social", "social-network", "social-media", "sm", "social network", "social media", "social_organic", "organic_social"]
            },
            "Organic Video": {
                description: "Users from unpaid links on video platforms.",
                condition: "Source matches a list of video sites OR Medium matches regex ^(.*video.*)$",
                targetSourceCategory: "SOURCE_CATEGORY_VIDEO",
                ga4RecommendedMediums: ["video", "organic-video", "video_organic", "user_generated_video"]
            },
            "Organic Search": {
                description: "Users from unpaid search engine results.",
                condition: "Source matches a list of search sites (SOURCE_CATEGORY_SEARCH) OR Medium exactly matches 'organic'",
                targetSourceCategory: "SOURCE_CATEGORY_SEARCH",
                ga4RecommendedMediums: ["organic"]
            },
            "Referral": {
                description: "Users from links on other websites.",
                condition: "Medium is one of ('referral', 'app', 'link')",
                ga4RecommendedMediums: ["referral", "link", "app"]
            },
            "Email": {
                description: "Users from links in emails.",
                condition: "Source matches regex for email OR Medium matches regex for email",
                ga4RecommendedMediums: ["email", "e-mail", "e_mail", "e mail", "newsletter"],
                ga4RecommendedSources: ["email", "newsletter", "klaviyo", "mailchimp", "hubspot", "activecampaign", "pardot", "sendgrid", "constantcontact"] 
            },
            "Affiliates": {
                description: "Users from links on affiliate websites.",
                condition: "Medium = 'affiliate'",
                ga4RecommendedMediums: ["affiliate", "affiliates", "partner"],
                ga4RecommendedSources: ["shareasale", "impact", "cj", "rakutenadvertising", "partnerstack", "awin", "pepperjam"] 
            },
            "Audio": {
                description: "Users from audio ads or content.",
                condition: "Medium exactly matches 'audio'",
                ga4RecommendedMediums: ["audio", "podcast_ad", "streaming_audio_ad"],
                ga4RecommendedSources: ["spotify", "pandora", "iheartradio", "soundcloud", "tunein", "google_audio_ads"] 
            },
            "SMS": {
                description: "Users from links in text messages.",
                condition: "Source exactly matches 'sms' OR Medium exactly matches 'sms'",
                ga4RecommendedMediums: ["sms", "text_message"],
                ga4RecommendedSources: ["sms", "attentive", "postscript", "twilio", "voyage", "klaviyo_sms", "manychat_sms"] 
            },
            "Mobile Push Notifications": {
                description: "Users from mobile app push notifications.",
                condition: "Medium ends with 'push' OR Medium contains 'mobile' or 'notification' OR Source exactly matches 'firebase'",
                ga4RecommendedMediums: ["push", "mobile", "notification", "mobile_push", "app_notification", "web_push"],
                ga4RecommendedSources: ["firebase", "onesignal", "clevertap", "iterable", "braze", "urbanairship"] 
            },
            "Unassigned": {
                description: "Traffic that doesn't match any other channel definition.",
                condition: "None of the other rules match.",
                ga4RecommendedMediums: []
            }
        };
        const sourceCategoryMap = { 
            "360.cn": "SOURCE_CATEGORY_SEARCH", "43things": "SOURCE_CATEGORY_SOCIAL", "43things.com": "SOURCE_CATEGORY_SOCIAL", "51.com": "SOURCE_CATEGORY_SOCIAL", "5ch.net": "SOURCE_CATEGORY_SOCIAL", "google shopping": "SOURCE_CATEGORY_SHOPPING", "hatena": "SOURCE_CATEGORY_SOCIAL", "igshopping": "SOURCE_CATEGORY_SHOPPING", "imageshack": "SOURCE_CATEGORY_SOCIAL", "aax-us-east.amazon-adsystem.com": "SOURCE_CATEGORY_SHOPPING", "aax.amazon-adsystem.com": "SOURCE_CATEGORY_SHOPPING", "academia.edu": "SOURCE_CATEGORY_SOCIAL", "activerain": "SOURCE_CATEGORY_SOCIAL", "activerain.com": "SOURCE_CATEGORY_SOCIAL", "activeworlds": "SOURCE_CATEGORY_SOCIAL", "activeworlds.com": "SOURCE_CATEGORY_SOCIAL", "addthis": "SOURCE_CATEGORY_SOCIAL", "addthis.com": "SOURCE_CATEGORY_SOCIAL", "airg.ca": "SOURCE_CATEGORY_SOCIAL", "alibaba": "SOURCE_CATEGORY_SHOPPING", "alibaba.com": "SOURCE_CATEGORY_SHOPPING", "alice": "SOURCE_CATEGORY_SEARCH", "allnurses.com": "SOURCE_CATEGORY_SOCIAL", "allrecipes.com": "SOURCE_CATEGORY_SOCIAL", "alumniclass": "SOURCE_CATEGORY_SOCIAL", "alumniclass.com": "SOURCE_CATEGORY_SOCIAL", "amazon": "SOURCE_CATEGORY_SHOPPING", "amazon.co.uk": "SOURCE_CATEGORY_SHOPPING", "amazon.com": "SOURCE_CATEGORY_SHOPPING", "ameba.jp": "SOURCE_CATEGORY_SOCIAL", "ameblo.jp": "SOURCE_CATEGORY_SOCIAL",
            "americantowns": "SOURCE_CATEGORY_SOCIAL", "americantowns.com": "SOURCE_CATEGORY_SOCIAL", "amp.reddit.com": "SOURCE_CATEGORY_SOCIAL", "ancestry.com": "SOURCE_CATEGORY_SOCIAL", "anobii": "SOURCE_CATEGORY_SOCIAL", "anobii.com": "SOURCE_CATEGORY_SOCIAL", "answerbag": "SOURCE_CATEGORY_SOCIAL", "answerbag.com": "SOURCE_CATEGORY_SOCIAL", "answers.yahoo.com": "SOURCE_CATEGORY_SOCIAL", "aol": "SOURCE_CATEGORY_SEARCH", "aolanswers": "SOURCE_CATEGORY_SOCIAL", "aolanswers.com": "SOURCE_CATEGORY_SOCIAL", "apps.facebook.com": "SOURCE_CATEGORY_SOCIAL", "apps.shopify.com": "SOURCE_CATEGORY_SHOPPING", "ar.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "ar.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "artstation.com": "SOURCE_CATEGORY_SOCIAL", "ask": "SOURCE_CATEGORY_SEARCH", "askubuntu": "SOURCE_CATEGORY_SOCIAL", "askubuntu.com": "SOURCE_CATEGORY_SOCIAL", "asmallworld.com": "SOURCE_CATEGORY_SOCIAL", "at.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "athlinks": "SOURCE_CATEGORY_SOCIAL", "athlinks.com": "SOURCE_CATEGORY_SOCIAL", "au.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "auone": "SOURCE_CATEGORY_SEARCH", "avg": "SOURCE_CATEGORY_SEARCH", "away.vk.com": "SOURCE_CATEGORY_SOCIAL", "awe.sm": "SOURCE_CATEGORY_SOCIAL", "b.hatena.ne.jp": "SOURCE_CATEGORY_SOCIAL", "baby-gaga": "SOURCE_CATEGORY_SOCIAL",
            "baby-gaga.com": "SOURCE_CATEGORY_SOCIAL", "babyblog.ru": "SOURCE_CATEGORY_SOCIAL", "babylon": "SOURCE_CATEGORY_SEARCH", "badoo": "SOURCE_CATEGORY_SOCIAL", "badoo.com": "SOURCE_CATEGORY_SOCIAL", "baidu": "SOURCE_CATEGORY_SEARCH", "bebo": "SOURCE_CATEGORY_SOCIAL", "bebo.com": "SOURCE_CATEGORY_SOCIAL", "beforeitsnews": "SOURCE_CATEGORY_SOCIAL", "beforeitsnews.com": "SOURCE_CATEGORY_SOCIAL", "bharatstudent": "SOURCE_CATEGORY_SOCIAL", "bharatstudent.com": "SOURCE_CATEGORY_SOCIAL", "biglobe": "SOURCE_CATEGORY_SEARCH", "biglobe.co.jp": "SOURCE_CATEGORY_SEARCH", "biglobe.ne.jp": "SOURCE_CATEGORY_SEARCH", "biip.no": "SOURCE_CATEGORY_SOCIAL", "bing": "SOURCE_CATEGORY_SEARCH", "biswap.org": "SOURCE_CATEGORY_SOCIAL", "bit.ly": "SOURCE_CATEGORY_SOCIAL", "blackcareernetwork.com": "SOURCE_CATEGORY_SOCIAL", "blackplanet": "SOURCE_CATEGORY_SOCIAL", "blackplanet.com": "SOURCE_CATEGORY_SOCIAL", "blip.fm": "SOURCE_CATEGORY_SOCIAL", "blog.com": "SOURCE_CATEGORY_SOCIAL", "blog.feedspot.com": "SOURCE_CATEGORY_SOCIAL", "blog.goo.ne.jp": "SOURCE_CATEGORY_SOCIAL", "blog.naver.com": "SOURCE_CATEGORY_SOCIAL", "blog.twitch.tv": "SOURCE_CATEGORY_VIDEO", "blog.yahoo.co.jp": "SOURCE_CATEGORY_SOCIAL", "blogg.no": "SOURCE_CATEGORY_SOCIAL", "bloggang.com": "SOURCE_CATEGORY_SOCIAL",
            "blogger": "SOURCE_CATEGORY_SOCIAL", "blogger.com": "SOURCE_CATEGORY_SOCIAL", "blogher": "SOURCE_CATEGORY_SOCIAL", "blogher.com": "SOURCE_CATEGORY_SOCIAL", "bloglines": "SOURCE_CATEGORY_SOCIAL", "bloglines.com": "SOURCE_CATEGORY_SOCIAL", "blogs.com": "SOURCE_CATEGORY_SOCIAL", "blogsome": "SOURCE_CATEGORY_SOCIAL", "blogsome.com": "SOURCE_CATEGORY_SOCIAL", "blogspot": "SOURCE_CATEGORY_SOCIAL", "blogspot.com": "SOURCE_CATEGORY_SOCIAL", "blogster": "SOURCE_CATEGORY_SOCIAL", "blogster.com": "SOURCE_CATEGORY_SOCIAL", "blurtit": "SOURCE_CATEGORY_SOCIAL", "blurtit.com": "SOURCE_CATEGORY_SOCIAL", "bookmarks.yahoo.co.jp": "SOURCE_CATEGORY_SOCIAL", "bookmarks.yahoo.com": "SOURCE_CATEGORY_SOCIAL", "br.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "br.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "brightkite": "SOURCE_CATEGORY_SOCIAL", "brightkite.com": "SOURCE_CATEGORY_SOCIAL", "brizzly": "SOURCE_CATEGORY_SOCIAL", "brizzly.com": "SOURCE_CATEGORY_SOCIAL", "business.facebook.com": "SOURCE_CATEGORY_SOCIAL", "buzzfeed": "SOURCE_CATEGORY_SOCIAL", "buzzfeed.com": "SOURCE_CATEGORY_SOCIAL", "buzznet": "SOURCE_CATEGORY_SOCIAL", "buzznet.com": "SOURCE_CATEGORY_SOCIAL", "ca.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "cafe.naver.com": "SOURCE_CATEGORY_SOCIAL", "cafemom": "SOURCE_CATEGORY_SOCIAL",
            "cafemom.com": "SOURCE_CATEGORY_SOCIAL", "camospace": "SOURCE_CATEGORY_SOCIAL", "camospace.com": "SOURCE_CATEGORY_SOCIAL", "canalblog.com": "SOURCE_CATEGORY_SOCIAL", "care.com": "SOURCE_CATEGORY_SOCIAL", "care2": "SOURCE_CATEGORY_SOCIAL", "care2.com": "SOURCE_CATEGORY_SOCIAL", "caringbridge.org": "SOURCE_CATEGORY_SOCIAL", "catster": "SOURCE_CATEGORY_SOCIAL", "catster.com": "SOURCE_CATEGORY_SOCIAL", "cbnt.io": "SOURCE_CATEGORY_SOCIAL", "cellufun": "SOURCE_CATEGORY_SOCIAL", "cellufun.com": "SOURCE_CATEGORY_SOCIAL", "centerblog.net": "SOURCE_CATEGORY_SOCIAL", "centrum.cz": "SOURCE_CATEGORY_SEARCH", "ch.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "chat.zalo.me": "SOURCE_CATEGORY_SOCIAL", "checkout.shopify.com": "SOURCE_CATEGORY_SHOPPING", "checkout.stripe.com": "SOURCE_CATEGORY_SHOPPING", "chegg.com": "SOURCE_CATEGORY_SOCIAL", "chicagonow": "SOURCE_CATEGORY_SOCIAL", "chicagonow.com": "SOURCE_CATEGORY_SOCIAL", "chiebukuro.yahoo.co.jp": "SOURCE_CATEGORY_SOCIAL", "cl.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "classmates": "SOURCE_CATEGORY_SOCIAL", "classmates.com": "SOURCE_CATEGORY_SOCIAL", "classquest": "SOURCE_CATEGORY_SOCIAL", "classquest.com": "SOURCE_CATEGORY_SOCIAL", "cn.bing.com": "SOURCE_CATEGORY_SEARCH", "cnn": "SOURCE_CATEGORY_SEARCH", "co.pinterest.com": "SOURCE_CATEGORY_SOCIAL",
            "co.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "cocolog-nifty": "SOURCE_CATEGORY_SOCIAL", "cocolog-nifty.com": "SOURCE_CATEGORY_SOCIAL", "comcast": "SOURCE_CATEGORY_SEARCH", "conduit": "SOURCE_CATEGORY_SEARCH", "copainsdavant.linternaute.com": "SOURCE_CATEGORY_SOCIAL", "couchsurfing.org": "SOURCE_CATEGORY_SOCIAL", "cozycot": "SOURCE_CATEGORY_SOCIAL", "cozycot.com": "SOURCE_CATEGORY_SOCIAL", "cr.shopping.naver.com": "SOURCE_CATEGORY_SHOPPING", "cr2.shopping.naver.com": "SOURCE_CATEGORY_SHOPPING", "crackle": "SOURCE_CATEGORY_VIDEO", "crackle.com": "SOURCE_CATEGORY_VIDEO", "cross.tv": "SOURCE_CATEGORY_SOCIAL", "crunchyroll": "SOURCE_CATEGORY_SOCIAL", "crunchyroll.com": "SOURCE_CATEGORY_SOCIAL", "curiositystream": "SOURCE_CATEGORY_VIDEO", "curiositystream.com": "SOURCE_CATEGORY_VIDEO", "cyworld": "SOURCE_CATEGORY_SOCIAL", "cyworld.com": "SOURCE_CATEGORY_SOCIAL", "cz.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "d.hatena.ne.jp": "SOURCE_CATEGORY_SOCIAL", "d.tube": "SOURCE_CATEGORY_VIDEO", "dailymotion": "SOURCE_CATEGORY_VIDEO", "dailymotion.com": "SOURCE_CATEGORY_VIDEO", "dailystrength.org": "SOURCE_CATEGORY_SOCIAL", "dashboard.twitch.tv": "SOURCE_CATEGORY_VIDEO", "daum": "SOURCE_CATEGORY_SEARCH", "daum.net": "SOURCE_CATEGORY_SEARCH", "de.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "deluxe.com": "SOURCE_CATEGORY_SOCIAL",
            "deviantart": "SOURCE_CATEGORY_SOCIAL", "deviantart.com": "SOURCE_CATEGORY_SOCIAL", "dianping": "SOURCE_CATEGORY_SOCIAL", "dianping.com": "SOURCE_CATEGORY_SOCIAL", "digg": "SOURCE_CATEGORY_SOCIAL", "digg.com": "SOURCE_CATEGORY_SOCIAL", "diigo": "SOURCE_CATEGORY_SOCIAL", "diigo.com": "SOURCE_CATEGORY_SOCIAL", "discover.hubpages.com": "SOURCE_CATEGORY_SOCIAL", "disneyplus": "SOURCE_CATEGORY_VIDEO", "disneyplus.com": "SOURCE_CATEGORY_VIDEO", "disqus": "SOURCE_CATEGORY_SOCIAL", "disqus.com": "SOURCE_CATEGORY_SOCIAL", "dk.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "dogpile": "SOURCE_CATEGORY_SEARCH", "dogpile.com": "SOURCE_CATEGORY_SEARCH", "dogster": "SOURCE_CATEGORY_SOCIAL", "dogster.com": "SOURCE_CATEGORY_SOCIAL", "dol2day": "SOURCE_CATEGORY_SOCIAL", "dol2day.com": "SOURCE_CATEGORY_SOCIAL", "doostang": "SOURCE_CATEGORY_SOCIAL", "doostang.com": "SOURCE_CATEGORY_SOCIAL", "doppir": "SOURCE_CATEGORY_SOCIAL", "dopplr.com": "SOURCE_CATEGORY_SOCIAL", "douban": "SOURCE_CATEGORY_SOCIAL", "douban.com": "SOURCE_CATEGORY_SOCIAL", "draft.blogger.com": "SOURCE_CATEGORY_SOCIAL", "draugiem.lv": "SOURCE_CATEGORY_SOCIAL", "drugs-forum": "SOURCE_CATEGORY_SOCIAL", "drugs-forum.com": "SOURCE_CATEGORY_SOCIAL", "duckduckgo": "SOURCE_CATEGORY_SEARCH",
            "dzone": "SOURCE_CATEGORY_SOCIAL", "dzone.com": "SOURCE_CATEGORY_SOCIAL", "ebay": "SOURCE_CATEGORY_SHOPPING", "ebay.co.uk": "SOURCE_CATEGORY_SHOPPING", "ebay.com": "SOURCE_CATEGORY_SHOPPING", "ebay.com.au": "SOURCE_CATEGORY_SHOPPING", "ebay.de": "SOURCE_CATEGORY_SHOPPING", "ecosia.org": "SOURCE_CATEGORY_SEARCH", "edublogs.org": "SOURCE_CATEGORY_SOCIAL", "elftown": "SOURCE_CATEGORY_SOCIAL", "elftown.com": "SOURCE_CATEGORY_SOCIAL", "email.seznam.cz": "SOURCE_CATEGORY_SEARCH", "eniro": "SOURCE_CATEGORY_SEARCH", "epicurious.com": "SOURCE_CATEGORY_SOCIAL", "es.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "espanol.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "etsy": "SOURCE_CATEGORY_SHOPPING", "etsy.com": "SOURCE_CATEGORY_SHOPPING", "everforo.com": "SOURCE_CATEGORY_SOCIAL", "exalead.com": "SOURCE_CATEGORY_SEARCH", "exblog.jp": "SOURCE_CATEGORY_SOCIAL", "excite.com": "SOURCE_CATEGORY_SEARCH", "extole": "SOURCE_CATEGORY_SOCIAL", "extole.com": "SOURCE_CATEGORY_SOCIAL", "facebook": "SOURCE_CATEGORY_SOCIAL", "facebook.com": "SOURCE_CATEGORY_SOCIAL", "faceparty": "SOURCE_CATEGORY_SOCIAL", "faceparty.com": "SOURCE_CATEGORY_SOCIAL", "fandom.com": "SOURCE_CATEGORY_SOCIAL", "fanpop": "SOURCE_CATEGORY_SOCIAL", "fanpop.com": "SOURCE_CATEGORY_SOCIAL",
            "fark": "SOURCE_CATEGORY_SOCIAL", "fark.com": "SOURCE_CATEGORY_SOCIAL", "fast.wistia.net": "SOURCE_CATEGORY_VIDEO", "fb": "SOURCE_CATEGORY_SOCIAL", "fb.me": "SOURCE_CATEGORY_SOCIAL", "fc2": "SOURCE_CATEGORY_SOCIAL", "fc2.com": "SOURCE_CATEGORY_SOCIAL", "feedspot": "SOURCE_CATEGORY_SOCIAL", "feministing": "SOURCE_CATEGORY_SOCIAL", "feministing.com": "SOURCE_CATEGORY_SOCIAL", "fi.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "filmaffinity": "SOURCE_CATEGORY_SOCIAL", "filmaffinity.com": "SOURCE_CATEGORY_SOCIAL", "firmy.cz": "SOURCE_CATEGORY_SEARCH", "flickr": "SOURCE_CATEGORY_SOCIAL", "flickr.com": "SOURCE_CATEGORY_SOCIAL", "flipboard": "SOURCE_CATEGORY_SOCIAL", "flipboard.com": "SOURCE_CATEGORY_SOCIAL", "folkdirect": "SOURCE_CATEGORY_SOCIAL", "folkdirect.com": "SOURCE_CATEGORY_SOCIAL", "foodservice": "SOURCE_CATEGORY_SOCIAL", "foodservice.com": "SOURCE_CATEGORY_SOCIAL", "forums.androidcentral.com": "SOURCE_CATEGORY_SOCIAL", "forums.crackberry.com": "SOURCE_CATEGORY_SOCIAL", "forums.imore.com": "SOURCE_CATEGORY_SOCIAL", "forums.nexopia.com": "SOURCE_CATEGORY_SOCIAL", "forums.webosnation.com": "SOURCE_CATEGORY_SOCIAL", "forums.wpcentral.com": "SOURCE_CATEGORY_SOCIAL", "fotki": "SOURCE_CATEGORY_SOCIAL", "fotki.com": "SOURCE_CATEGORY_SOCIAL", "fotolog": "SOURCE_CATEGORY_SOCIAL",
            "fotolog.com": "SOURCE_CATEGORY_SOCIAL", "foursquare": "SOURCE_CATEGORY_SOCIAL", "foursquare.com": "SOURCE_CATEGORY_SOCIAL", "fr.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "free.facebook.com": "SOURCE_CATEGORY_SOCIAL", "friendfeed": "SOURCE_CATEGORY_SOCIAL", "friendfeed.com": "SOURCE_CATEGORY_SOCIAL", "fruehstueckstreff.org": "SOURCE_CATEGORY_SOCIAL", "fubar": "SOURCE_CATEGORY_SOCIAL", "fubar.com": "SOURCE_CATEGORY_SOCIAL", "gaiaonline": "SOURCE_CATEGORY_SOCIAL", "gaiaonline.com": "SOURCE_CATEGORY_SOCIAL", "gamerdna": "SOURCE_CATEGORY_SOCIAL", "gamerdna.com": "SOURCE_CATEGORY_SOCIAL", "gather.com": "SOURCE_CATEGORY_SOCIAL", "geni.com": "SOURCE_CATEGORY_SOCIAL", "getpocket.com": "SOURCE_CATEGORY_SOCIAL", "glassboard": "SOURCE_CATEGORY_SOCIAL", "glassboard.com": "SOURCE_CATEGORY_SOCIAL", "glassdoor": "SOURCE_CATEGORY_SOCIAL", "glassdoor.com": "SOURCE_CATEGORY_SOCIAL", "globo": "SOURCE_CATEGORY_SEARCH", "go.mail.ru": "SOURCE_CATEGORY_SEARCH", "godtube": "SOURCE_CATEGORY_SOCIAL", "godtube.com": "SOURCE_CATEGORY_SOCIAL", "goldenline.pl": "SOURCE_CATEGORY_SOCIAL", "goldstar": "SOURCE_CATEGORY_SOCIAL", "goldstar.com": "SOURCE_CATEGORY_SOCIAL", "goo.gl": "SOURCE_CATEGORY_SOCIAL", "gooblog": "SOURCE_CATEGORY_SOCIAL", "goodreads": "SOURCE_CATEGORY_SOCIAL",
            "goodreads.com": "SOURCE_CATEGORY_SOCIAL", "google": "SOURCE_CATEGORY_SEARCH", "google+": "SOURCE_CATEGORY_SOCIAL", "google-play": "SOURCE_CATEGORY_SEARCH", "googlegroups.com": "SOURCE_CATEGORY_SOCIAL", "googleplus": "SOURCE_CATEGORY_SOCIAL", "govloop": "SOURCE_CATEGORY_SOCIAL", "govloop.com": "SOURCE_CATEGORY_SOCIAL", "gowalla": "SOURCE_CATEGORY_SOCIAL", "gowalla.com": "SOURCE_CATEGORY_SOCIAL", "gree.jp": "SOURCE_CATEGORY_SOCIAL", "groups.google.com": "SOURCE_CATEGORY_SOCIAL", "gulli.com": "SOURCE_CATEGORY_SOCIAL", "gutefrage.net": "SOURCE_CATEGORY_SOCIAL", "habbo": "SOURCE_CATEGORY_SOCIAL", "habbo.com": "SOURCE_CATEGORY_SOCIAL", "help.hulu.com": "SOURCE_CATEGORY_VIDEO", "help.netflix.com": "SOURCE_CATEGORY_VIDEO", "hi5": "SOURCE_CATEGORY_SOCIAL", "hi5.com": "SOURCE_CATEGORY_SOCIAL", "hk.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "hootsuite": "SOURCE_CATEGORY_SOCIAL", "hootsuite.com": "SOURCE_CATEGORY_SOCIAL", "houzz": "SOURCE_CATEGORY_SOCIAL", "houzz.com": "SOURCE_CATEGORY_SOCIAL", "hoverspot": "SOURCE_CATEGORY_SOCIAL", "hoverspot.com": "SOURCE_CATEGORY_SOCIAL", "hr.com": "SOURCE_CATEGORY_SOCIAL", "hu.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "hubculture": "SOURCE_CATEGORY_SOCIAL", "hubculture.com": "SOURCE_CATEGORY_SOCIAL",
            "hubpages.com": "SOURCE_CATEGORY_SOCIAL", "hulu": "SOURCE_CATEGORY_VIDEO", "hulu.com": "SOURCE_CATEGORY_VIDEO", "hyves.net": "SOURCE_CATEGORY_SOCIAL", "hyves.nl": "SOURCE_CATEGORY_SOCIAL", "ibibo": "SOURCE_CATEGORY_SOCIAL", "ibibo.com": "SOURCE_CATEGORY_SOCIAL", "id.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "id.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "id.twitch.tv": "SOURCE_CATEGORY_VIDEO", "identi.ca": "SOURCE_CATEGORY_SOCIAL", "ig": "SOURCE_CATEGORY_SOCIAL", "imageshack.com": "SOURCE_CATEGORY_SOCIAL", "imageshack.us": "SOURCE_CATEGORY_SOCIAL", "imvu": "SOURCE_CATEGORY_SOCIAL", "imvu.com": "SOURCE_CATEGORY_SOCIAL", "in.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "in.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "incredimail": "SOURCE_CATEGORY_SEARCH", "insanejournal": "SOURCE_CATEGORY_SOCIAL", "insanejournal.com": "SOURCE_CATEGORY_SOCIAL", "instagram": "SOURCE_CATEGORY_SOCIAL", "instagram.com": "SOURCE_CATEGORY_SOCIAL", "instapaper": "SOURCE_CATEGORY_SOCIAL", "instapaper.com": "SOURCE_CATEGORY_SOCIAL", "internations.org": "SOURCE_CATEGORY_SOCIAL", "interpals.net": "SOURCE_CATEGORY_SOCIAL", "intherooms": "SOURCE_CATEGORY_SOCIAL", "intherooms.com": "SOURCE_CATEGORY_SOCIAL", "iq.com": "SOURCE_CATEGORY_VIDEO", "iqiyi": "SOURCE_CATEGORY_VIDEO",
            "iqiyi.com": "SOURCE_CATEGORY_VIDEO", "irc-galleria.net": "SOURCE_CATEGORY_SOCIAL", "is.gd": "SOURCE_CATEGORY_SOCIAL", "it.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "italki": "SOURCE_CATEGORY_SOCIAL", "italki.com": "SOURCE_CATEGORY_SOCIAL", "jammerdirect": "SOURCE_CATEGORY_SOCIAL", "jammerdirect.com": "SOURCE_CATEGORY_SOCIAL", "jappy.com": "SOURCE_CATEGORY_SOCIAL", "jappy.de": "SOURCE_CATEGORY_SOCIAL", "jobs.netflix.com": "SOURCE_CATEGORY_VIDEO", "justin.tv": "SOURCE_CATEGORY_VIDEO", "kaboodle.com": "SOURCE_CATEGORY_SOCIAL", "kakao": "SOURCE_CATEGORY_SOCIAL", "kakao.com": "SOURCE_CATEGORY_SOCIAL", "kakaocorp.com": "SOURCE_CATEGORY_SOCIAL", "kaneva": "SOURCE_CATEGORY_SOCIAL", "kaneva.com": "SOURCE_CATEGORY_SOCIAL", "kin.naver.com": "SOURCE_CATEGORY_SOCIAL", "kvasir": "SOURCE_CATEGORY_SEARCH", "l.facebook.com": "SOURCE_CATEGORY_SOCIAL", "l.instagram.com": "SOURCE_CATEGORY_SOCIAL", "l.messenger.com": "SOURCE_CATEGORY_SOCIAL", "last.fm": "SOURCE_CATEGORY_SOCIAL", "lens.google.com": "SOURCE_CATEGORY_SEARCH", "librarything": "SOURCE_CATEGORY_SOCIAL", "librarything.com": "SOURCE_CATEGORY_SOCIAL", "lifestream.aol.com": "SOURCE_CATEGORY_SOCIAL", "line": "SOURCE_CATEGORY_SOCIAL", "line.me": "SOURCE_CATEGORY_SOCIAL", "linkedin": "SOURCE_CATEGORY_SOCIAL",
            "linkedin.com": "SOURCE_CATEGORY_SOCIAL", "listal": "SOURCE_CATEGORY_SOCIAL", "listal.com": "SOURCE_CATEGORY_SOCIAL", "listography": "SOURCE_CATEGORY_SOCIAL", "listography.com": "SOURCE_CATEGORY_SOCIAL", "lite.qwant.com": "SOURCE_CATEGORY_SEARCH", "livedoor.com": "SOURCE_CATEGORY_SOCIAL", "livedoorblog": "SOURCE_CATEGORY_SOCIAL", "livejournal": "SOURCE_CATEGORY_SOCIAL", "livejournal.com": "SOURCE_CATEGORY_SOCIAL", "lm.facebook.com": "SOURCE_CATEGORY_SOCIAL", "lnkd.in": "SOURCE_CATEGORY_SOCIAL", "lycos": "SOURCE_CATEGORY_SEARCH", "m.alibaba.com": "SOURCE_CATEGORY_SHOPPING", "m.baidu.com": "SOURCE_CATEGORY_SEARCH", "m.blog.naver.com": "SOURCE_CATEGORY_SOCIAL", "m.cafe.naver.com": "SOURCE_CATEGORY_SOCIAL", "m.facebook.com": "SOURCE_CATEGORY_SOCIAL", "m.kin.naver.com": "SOURCE_CATEGORY_SOCIAL", "m.naver.com": "SOURCE_CATEGORY_SEARCH", "m.search.naver.com": "SOURCE_CATEGORY_SEARCH", "m.shopping.naver.com": "SOURCE_CATEGORY_SHOPPING", "m.sogou.com": "SOURCE_CATEGORY_SEARCH", "m.twitch.tv": "SOURCE_CATEGORY_VIDEO", "m.vk.com": "SOURCE_CATEGORY_SOCIAL", "m.yelp.com": "SOURCE_CATEGORY_SOCIAL", "music.youtube.com": "SOURCE_CATEGORY_VIDEO", "mail.rambler.ru": "SOURCE_CATEGORY_SEARCH", "mail.yandex.ru": "SOURCE_CATEGORY_SEARCH", "malaysia.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "mbga.jp": "SOURCE_CATEGORY_SOCIAL",
            "medium.com": "SOURCE_CATEGORY_SOCIAL", "meetin.org": "SOURCE_CATEGORY_SOCIAL", "meetup": "SOURCE_CATEGORY_SOCIAL", "meetup.com": "SOURCE_CATEGORY_SOCIAL", "meinvz.net": "SOURCE_CATEGORY_SOCIAL", "meneame.net": "SOURCE_CATEGORY_SOCIAL", "menuism.com": "SOURCE_CATEGORY_SOCIAL", "mercadolibre": "SOURCE_CATEGORY_SHOPPING", "mercadolibre.com": "SOURCE_CATEGORY_SHOPPING", "mercadolibre.com.ar": "SOURCE_CATEGORY_SHOPPING", "mercadolibre.com.mx": "SOURCE_CATEGORY_SHOPPING", "message.alibaba.com": "SOURCE_CATEGORY_SHOPPING", "messages.google.com": "SOURCE_CATEGORY_SOCIAL", "messages.yahoo.co.jp": "SOURCE_CATEGORY_SOCIAL", "messenger": "SOURCE_CATEGORY_SOCIAL", "messenger.com": "SOURCE_CATEGORY_SOCIAL", "mix.com": "SOURCE_CATEGORY_SOCIAL", "mixi.jp": "SOURCE_CATEGORY_SOCIAL", "mobile.facebook.com": "SOURCE_CATEGORY_SOCIAL", "mocospace": "SOURCE_CATEGORY_SOCIAL", "mocospace.com": "SOURCE_CATEGORY_SOCIAL", "mouthshut": "SOURCE_CATEGORY_SOCIAL", "mouthshut.com": "SOURCE_CATEGORY_SOCIAL", "movabletype": "SOURCE_CATEGORY_SOCIAL", "movabletype.com": "SOURCE_CATEGORY_SOCIAL", "msearch.shopping.naver.com": "SOURCE_CATEGORY_SHOPPING", "msn": "SOURCE_CATEGORY_SEARCH", "msn.com": "SOURCE_CATEGORY_SEARCH", "mubi": "SOURCE_CATEGORY_SOCIAL", "mubi.com": "SOURCE_CATEGORY_SOCIAL", "music.youtube.com": "SOURCE_CATEGORY_VIDEO",
            "mx.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "my.opera.com": "SOURCE_CATEGORY_SOCIAL", "myanimelist.net": "SOURCE_CATEGORY_SOCIAL", "myheritage": "SOURCE_CATEGORY_SOCIAL", "myheritage.com": "SOURCE_CATEGORY_SOCIAL", "mylife": "SOURCE_CATEGORY_SOCIAL", "mylife.com": "SOURCE_CATEGORY_SOCIAL", "mymodernmet": "SOURCE_CATEGORY_SOCIAL", "mymodernmet.com": "SOURCE_CATEGORY_SOCIAL", "myspace": "SOURCE_CATEGORY_SOCIAL", "myspace.com": "SOURCE_CATEGORY_SOCIAL", "najdi": "SOURCE_CATEGORY_SEARCH", "naver": "SOURCE_CATEGORY_SEARCH", "naver.com": "SOURCE_CATEGORY_SEARCH", "netflix": "SOURCE_CATEGORY_VIDEO", "netflix.com": "SOURCE_CATEGORY_VIDEO", "netvibes": "SOURCE_CATEGORY_SOCIAL", "netvibes.com": "SOURCE_CATEGORY_SOCIAL", "news.google.com": "SOURCE_CATEGORY_SEARCH", "news.ycombinator.com": "SOURCE_CATEGORY_SOCIAL", "newsshowcase": "SOURCE_CATEGORY_SOCIAL", "nexopia": "SOURCE_CATEGORY_SOCIAL", "ngopost.org": "SOURCE_CATEGORY_SOCIAL", "niconico": "SOURCE_CATEGORY_SOCIAL", "nicovideo.jp": "SOURCE_CATEGORY_SOCIAL", "nightlifelink": "SOURCE_CATEGORY_SOCIAL", "nightlifelink.com": "SOURCE_CATEGORY_SOCIAL", "ning": "SOURCE_CATEGORY_SOCIAL", "ning.com": "SOURCE_CATEGORY_SOCIAL", "nl.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "nl.search.yahoo.com": "SOURCE_CATEGORY_SEARCH",
            "nl.shopping.net": "SOURCE_CATEGORY_SHOPPING", "no.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "no.shopping.net": "SOURCE_CATEGORY_SHOPPING", "ntp.msn.com": "SOURCE_CATEGORY_SEARCH", "nz.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "odnoklassniki.ru": "SOURCE_CATEGORY_SOCIAL", "odnoklassniki.ua": "SOURCE_CATEGORY_SOCIAL", "offer.alibaba.com": "SOURCE_CATEGORY_SHOPPING", "okwave.jp": "SOURCE_CATEGORY_SOCIAL", "old.reddit.com": "SOURCE_CATEGORY_SOCIAL", "one.walmart.com": "SOURCE_CATEGORY_SHOPPING", "onet": "SOURCE_CATEGORY_SEARCH", "onet.pl": "SOURCE_CATEGORY_SEARCH", "oneworldgroup.org": "SOURCE_CATEGORY_SOCIAL", "onstartups": "SOURCE_CATEGORY_SOCIAL", "onstartups.com": "SOURCE_CATEGORY_SOCIAL", "opendiary": "SOURCE_CATEGORY_SOCIAL", "opendiary.com": "SOURCE_CATEGORY_SOCIAL", "order.shopping.yahoo.co.jp": "SOURCE_CATEGORY_SHOPPING", "oshiete.goo.ne.jp": "SOURCE_CATEGORY_SOCIAL", "out.reddit.com": "SOURCE_CATEGORY_SOCIAL", "over-blog.com": "SOURCE_CATEGORY_SOCIAL", "overblog.com": "SOURCE_CATEGORY_SOCIAL", "paper.li": "SOURCE_CATEGORY_SOCIAL", "partners.shopify.com": "SOURCE_CATEGORY_SHOPPING", "partyflock.nl": "SOURCE_CATEGORY_SOCIAL", "pe.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "ph.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "photobucket": "SOURCE_CATEGORY_SOCIAL", "photobucket.com": "SOURCE_CATEGORY_SOCIAL", "pinboard": "SOURCE_CATEGORY_SOCIAL",
            "pinboard.in": "SOURCE_CATEGORY_SOCIAL", "pingsta": "SOURCE_CATEGORY_SOCIAL", "pingsta.com": "SOURCE_CATEGORY_SOCIAL", "pinterest": "SOURCE_CATEGORY_SOCIAL", "pinterest.at": "SOURCE_CATEGORY_SOCIAL", "pinterest.ca": "SOURCE_CATEGORY_SOCIAL", "pinterest.ch": "SOURCE_CATEGORY_SOCIAL", "pinterest.cl": "SOURCE_CATEGORY_SOCIAL", "pinterest.co.kr": "SOURCE_CATEGORY_SOCIAL", "pinterest.co.uk": "SOURCE_CATEGORY_SOCIAL", "pinterest.com": "SOURCE_CATEGORY_SOCIAL", "pinterest.com.au": "SOURCE_CATEGORY_SOCIAL", "pinterest.com.mx": "SOURCE_CATEGORY_SOCIAL", "pinterest.de": "SOURCE_CATEGORY_SOCIAL", "pinterest.es": "SOURCE_CATEGORY_SOCIAL", "pinterest.fr": "SOURCE_CATEGORY_SOCIAL", "pinterest.it": "SOURCE_CATEGORY_SOCIAL", "pinterest.jp": "SOURCE_CATEGORY_SOCIAL", "pinterest.nz": "SOURCE_CATEGORY_SOCIAL", "pinterest.ph": "SOURCE_CATEGORY_SOCIAL", "pinterest.pt": "SOURCE_CATEGORY_SOCIAL", "pinterest.ru": "SOURCE_CATEGORY_SOCIAL", "pinterest.se": "SOURCE_CATEGORY_SOCIAL", "pixiv.net": "SOURCE_CATEGORY_SOCIAL", "pl.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "pl.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "play.google.com": "SOURCE_CATEGORY_SEARCH", "playahead.se": "SOURCE_CATEGORY_SOCIAL", "player.twitch.tv": "SOURCE_CATEGORY_VIDEO", "player.vimeo.com": "SOURCE_CATEGORY_VIDEO", "plurk": "SOURCE_CATEGORY_SOCIAL",
            "plurk.com": "SOURCE_CATEGORY_SOCIAL", "plus.google.com": "SOURCE_CATEGORY_SOCIAL", "plus.url.google.com": "SOURCE_CATEGORY_SOCIAL", "pocket.co": "SOURCE_CATEGORY_SOCIAL", "posterous": "SOURCE_CATEGORY_SOCIAL", "posterous.com": "SOURCE_CATEGORY_SOCIAL", "pro.homeadvisor.com": "SOURCE_CATEGORY_SOCIAL", "pulse.yahoo.com": "SOURCE_CATEGORY_SOCIAL", "qapacity": "SOURCE_CATEGORY_SOCIAL", "qapacity.com": "SOURCE_CATEGORY_SOCIAL", "quechup": "SOURCE_CATEGORY_SOCIAL", "quechup.com": "SOURCE_CATEGORY_SOCIAL", "quora": "SOURCE_CATEGORY_SOCIAL", "quora.com": "SOURCE_CATEGORY_SOCIAL", "qwant": "SOURCE_CATEGORY_SEARCH", "qwant.com": "SOURCE_CATEGORY_SEARCH", "qzone.qq.com": "SOURCE_CATEGORY_SOCIAL", "rakuten": "SOURCE_CATEGORY_SEARCH", "rakuten.co.jp": "SOURCE_CATEGORY_SEARCH", "rambler": "SOURCE_CATEGORY_SEARCH", "rambler.ru": "SOURCE_CATEGORY_SEARCH", "ravelry": "SOURCE_CATEGORY_SOCIAL", "ravelry.com": "SOURCE_CATEGORY_SOCIAL", "reddit": "SOURCE_CATEGORY_SOCIAL", "reddit.com": "SOURCE_CATEGORY_SOCIAL", "redux": "SOURCE_CATEGORY_SOCIAL", "redux.com": "SOURCE_CATEGORY_SOCIAL", "renren": "SOURCE_CATEGORY_SOCIAL", "renren.com": "SOURCE_CATEGORY_SOCIAL", "researchgate.net": "SOURCE_CATEGORY_SOCIAL", "reunion": "SOURCE_CATEGORY_SOCIAL",
            "reunion.com": "SOURCE_CATEGORY_SOCIAL", "reverbnation": "SOURCE_CATEGORY_SOCIAL", "reverbnation.com": "SOURCE_CATEGORY_SOCIAL", "rtl.de": "SOURCE_CATEGORY_SOCIAL", "ryze": "SOURCE_CATEGORY_SOCIAL", "ryze.com": "SOURCE_CATEGORY_SOCIAL", "s3.amazonaws.com": "SOURCE_CATEGORY_SHOPPING", "salespider": "SOURCE_CATEGORY_SOCIAL", "salespider.com": "SOURCE_CATEGORY_SOCIAL", "scoop.it": "SOURCE_CATEGORY_SOCIAL", "screenrant": "SOURCE_CATEGORY_SOCIAL", "screenrant.com": "SOURCE_CATEGORY_SOCIAL", "scribd": "SOURCE_CATEGORY_SOCIAL", "scribd.com": "SOURCE_CATEGORY_SOCIAL", "scvngr": "SOURCE_CATEGORY_SOCIAL", "scvngr.com": "SOURCE_CATEGORY_SOCIAL", "se.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "se.shopping.net": "SOURCE_CATEGORY_SHOPPING", "search-results": "SOURCE_CATEGORY_SEARCH", "search.aol.co.uk": "SOURCE_CATEGORY_SEARCH", "search.aol.com": "SOURCE_CATEGORY_SEARCH", "search.google.com": "SOURCE_CATEGORY_SEARCH", "search.smt.docomo.ne.jp": "SOURCE_CATEGORY_SEARCH", "search.ukr.net": "SOURCE_CATEGORY_SEARCH", "secondlife": "SOURCE_CATEGORY_SOCIAL", "secondlife.com": "SOURCE_CATEGORY_SOCIAL", "secureurl.ukr.net": "SOURCE_CATEGORY_SEARCH", "serverfault": "SOURCE_CATEGORY_SOCIAL", "serverfault.com": "SOURCE_CATEGORY_SOCIAL", "seznam": "SOURCE_CATEGORY_SEARCH", "seznam.cz": "SOURCE_CATEGORY_SEARCH",
            "sg.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "shareit": "SOURCE_CATEGORY_SOCIAL", "sharethis": "SOURCE_CATEGORY_SOCIAL", "sharethis.com": "SOURCE_CATEGORY_SOCIAL", "shop.app": "SOURCE_CATEGORY_SHOPPING", "shopify": "SOURCE_CATEGORY_SHOPPING", "shopify.com": "SOURCE_CATEGORY_SHOPPING", "shopping.naver.com": "SOURCE_CATEGORY_SHOPPING", "shopping.yahoo.co.jp": "SOURCE_CATEGORY_SHOPPING", "shopping.yahoo.com": "SOURCE_CATEGORY_SHOPPING", "shopzilla": "SOURCE_CATEGORY_SHOPPING", "shopzilla.com": "SOURCE_CATEGORY_SHOPPING", "shvoong.com": "SOURCE_CATEGORY_SOCIAL", "simplycodes.com": "SOURCE_CATEGORY_SHOPPING", "sites.google.com": "SOURCE_CATEGORY_SOCIAL", "skype": "SOURCE_CATEGORY_SOCIAL", "skyrock": "SOURCE_CATEGORY_SOCIAL", "skyrock.com": "SOURCE_CATEGORY_SOCIAL", "slashdot.org": "SOURCE_CATEGORY_SOCIAL", "slideshare.net": "SOURCE_CATEGORY_SOCIAL", "smartnews.com": "SOURCE_CATEGORY_SOCIAL", "snapchat": "SOURCE_CATEGORY_SOCIAL", "snapchat.com": "SOURCE_CATEGORY_SOCIAL", "so.com": "SOURCE_CATEGORY_SEARCH", "social": "SOURCE_CATEGORY_SOCIAL", "sociallife.com.br": "SOURCE_CATEGORY_SOCIAL", "socialvibe": "SOURCE_CATEGORY_SOCIAL", "socialvibe.com": "SOURCE_CATEGORY_SOCIAL", "sogou": "SOURCE_CATEGORY_SEARCH", "sogou.com": "SOURCE_CATEGORY_SEARCH", "sp-web.search.auone.jp": "SOURCE_CATEGORY_SEARCH",
            "spaces.live.com": "SOURCE_CATEGORY_SOCIAL", "spoke": "SOURCE_CATEGORY_SOCIAL", "spoke.com": "SOURCE_CATEGORY_SOCIAL", "spruz": "SOURCE_CATEGORY_SOCIAL", "spruz.com": "SOURCE_CATEGORY_SOCIAL", "ssense.com": "SOURCE_CATEGORY_SOCIAL", "stackapps": "SOURCE_CATEGORY_SOCIAL", "stackapps.com": "SOURCE_CATEGORY_SOCIAL", "stackexchange": "SOURCE_CATEGORY_SOCIAL", "stackexchange.com": "SOURCE_CATEGORY_SOCIAL", "stackoverflow": "SOURCE_CATEGORY_SOCIAL", "stackoverflow.com": "SOURCE_CATEGORY_SOCIAL", "stardoll.com": "SOURCE_CATEGORY_SOCIAL", "startsiden": "SOURCE_CATEGORY_SEARCH", "startsiden.no": "SOURCE_CATEGORY_SEARCH", "stickam": "SOURCE_CATEGORY_SOCIAL", "stickam.com": "SOURCE_CATEGORY_SOCIAL", "store.shopping.yahoo.co.jp": "SOURCE_CATEGORY_SHOPPING", "stripe": "SOURCE_CATEGORY_SHOPPING", "stripe.com": "SOURCE_CATEGORY_SHOPPING", "studivz.net": "SOURCE_CATEGORY_SOCIAL", "suche.aol.de": "SOURCE_CATEGORY_SEARCH", "suomi24.fi": "SOURCE_CATEGORY_SOCIAL", "superuser": "SOURCE_CATEGORY_SOCIAL", "superuser.com": "SOURCE_CATEGORY_SOCIAL", "sweeva": "SOURCE_CATEGORY_SOCIAL", "sweeva.com": "SOURCE_CATEGORY_SOCIAL", "t.co": "SOURCE_CATEGORY_SOCIAL", "t.me": "SOURCE_CATEGORY_SOCIAL", "tagged": "SOURCE_CATEGORY_SOCIAL", "tagged.com": "SOURCE_CATEGORY_SOCIAL",
            "taggedmail": "SOURCE_CATEGORY_SOCIAL", "taggedmail.com": "SOURCE_CATEGORY_SOCIAL", "talkbiznow": "SOURCE_CATEGORY_SOCIAL", "talkbiznow.com": "SOURCE_CATEGORY_SOCIAL", "taringa.net": "SOURCE_CATEGORY_SOCIAL", "techmeme": "SOURCE_CATEGORY_SOCIAL", "techmeme.com": "SOURCE_CATEGORY_SOCIAL", "ted": "SOURCE_CATEGORY_VIDEO", "ted.com": "SOURCE_CATEGORY_VIDEO", "tencent": "SOURCE_CATEGORY_SOCIAL", "tencent.com": "SOURCE_CATEGORY_SOCIAL", "terra": "SOURCE_CATEGORY_SEARCH", "th.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "tiktok": "SOURCE_CATEGORY_SOCIAL", "tiktok.com": "SOURCE_CATEGORY_SOCIAL", "tinyurl": "SOURCE_CATEGORY_SOCIAL", "tinyurl.com": "SOURCE_CATEGORY_SOCIAL", "toolbox": "SOURCE_CATEGORY_SOCIAL", "toolbox.com": "SOURCE_CATEGORY_SOCIAL", "touch.facebook.com": "SOURCE_CATEGORY_SOCIAL", "tr.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "tr.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "travellerspoint": "SOURCE_CATEGORY_SOCIAL", "travellerspoint.com": "SOURCE_CATEGORY_SOCIAL", "tripadvisor": "SOURCE_CATEGORY_SOCIAL", "tripadvisor.com": "SOURCE_CATEGORY_SOCIAL", "trombi": "SOURCE_CATEGORY_SOCIAL", "trombi.com": "SOURCE_CATEGORY_SOCIAL", "trustpilot": "SOURCE_CATEGORY_SOCIAL", "tudou": "SOURCE_CATEGORY_SOCIAL", "tudou.com": "SOURCE_CATEGORY_SOCIAL",
            "tuenti": "SOURCE_CATEGORY_SOCIAL", "tuenti.com": "SOURCE_CATEGORY_SOCIAL", "tumblr": "SOURCE_CATEGORY_SOCIAL", "tumblr.com": "SOURCE_CATEGORY_SOCIAL", "tut.by": "SOURCE_CATEGORY_SEARCH", "tw.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "tweetdeck": "SOURCE_CATEGORY_SOCIAL", "tweetdeck.com": "SOURCE_CATEGORY_SOCIAL", "twitch": "SOURCE_CATEGORY_VIDEO", "twitch.tv": "SOURCE_CATEGORY_VIDEO", "twitter": "SOURCE_CATEGORY_SOCIAL", "twitter.com": "SOURCE_CATEGORY_SOCIAL", "twoo.com": "SOURCE_CATEGORY_SOCIAL", "typepad": "SOURCE_CATEGORY_SOCIAL", "typepad.com": "SOURCE_CATEGORY_SOCIAL", "uk.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "uk.shopping.net": "SOURCE_CATEGORY_SHOPPING", "ukr": "SOURCE_CATEGORY_SEARCH", "unblog.fr": "SOURCE_CATEGORY_SOCIAL", "urbanspoon.com": "SOURCE_CATEGORY_SOCIAL", "us.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "ushareit.com": "SOURCE_CATEGORY_SOCIAL", "ushi.cn": "SOURCE_CATEGORY_SOCIAL", "utreon": "SOURCE_CATEGORY_VIDEO", "utreon.com": "SOURCE_CATEGORY_VIDEO", "vampirefreaks": "SOURCE_CATEGORY_SOCIAL", "vampirefreaks.com": "SOURCE_CATEGORY_SOCIAL", "vampirerave": "SOURCE_CATEGORY_SOCIAL", "vampirerave.com": "SOURCE_CATEGORY_SOCIAL", "veoh": "SOURCE_CATEGORY_VIDEO", "veoh.com": "SOURCE_CATEGORY_VIDEO",
            "vg.no": "SOURCE_CATEGORY_SOCIAL", "viadeo.journaldunet.com": "SOURCE_CATEGORY_SOCIAL", "video.ibm.com": "SOURCE_CATEGORY_VIDEO", "vimeo": "SOURCE_CATEGORY_VIDEO", "vimeo.com": "SOURCE_CATEGORY_VIDEO", "virgilio": "SOURCE_CATEGORY_SEARCH", "vk.com": "SOURCE_CATEGORY_SOCIAL", "vkontakte.ru": "SOURCE_CATEGORY_SOCIAL", "vn.search.yahoo.com": "SOURCE_CATEGORY_SEARCH", "wakoopa": "SOURCE_CATEGORY_SOCIAL", "wakoopa.com": "SOURCE_CATEGORY_SOCIAL", "walmart": "SOURCE_CATEGORY_SHOPPING", "walmart.com": "SOURCE_CATEGORY_SHOPPING", "wap.sogou.com": "SOURCE_CATEGORY_SEARCH", "wattpad": "SOURCE_CATEGORY_SOCIAL", "wattpad.com": "SOURCE_CATEGORY_SOCIAL", "web.facebook.com": "SOURCE_CATEGORY_SOCIAL", "web.skype.com": "SOURCE_CATEGORY_SOCIAL", "webmaster.yandex.ru": "SOURCE_CATEGORY_SEARCH", "websearch.rakuten.co.jp": "SOURCE_CATEGORY_SEARCH", "webshots": "SOURCE_CATEGORY_SOCIAL", "webshots.com": "SOURCE_CATEGORY_SOCIAL", "wechat": "SOURCE_CATEGORY_SOCIAL", "wechat.com": "SOURCE_CATEGORY_SOCIAL", "weebly": "SOURCE_CATEGORY_SOCIAL", "weebly.com": "SOURCE_CATEGORY_SOCIAL", "weibo": "SOURCE_CATEGORY_SOCIAL", "weibo.com": "SOURCE_CATEGORY_SOCIAL", "wer-weiss-was.de": "SOURCE_CATEGORY_SOCIAL", "weread": "SOURCE_CATEGORY_SOCIAL", "weread.com": "SOURCE_CATEGORY_SOCIAL",
            "whatsapp": "SOURCE_CATEGORY_SOCIAL", "whatsapp.com": "SOURCE_CATEGORY_SOCIAL", "wiki.answers.com": "SOURCE_CATEGORY_SOCIAL", "wikihow.com": "SOURCE_CATEGORY_SOCIAL", "wikitravel.org": "SOURCE_CATEGORY_SOCIAL", "wistia": "SOURCE_CATEGORY_VIDEO", "wistia.com": "SOURCE_CATEGORY_VIDEO", "woot.com": "SOURCE_CATEGORY_SOCIAL", "wordpress": "SOURCE_CATEGORY_SOCIAL", "wordpress.com": "SOURCE_CATEGORY_SOCIAL", "wordpress.org": "SOURCE_CATEGORY_SOCIAL", "xanga": "SOURCE_CATEGORY_SOCIAL", "xanga.com": "SOURCE_CATEGORY_SOCIAL", "xing": "SOURCE_CATEGORY_SOCIAL", "xing.com": "SOURCE_CATEGORY_SOCIAL", "yahoo": "SOURCE_CATEGORY_SEARCH", "yahoo-mbga.jp": "SOURCE_CATEGORY_SOCIAL", "yahoo.co.jp": "SOURCE_CATEGORY_SEARCH", "yahoo.com": "SOURCE_CATEGORY_SEARCH", "yammer": "SOURCE_CATEGORY_SOCIAL", "yammer.com": "SOURCE_CATEGORY_SOCIAL", "yandex": "SOURCE_CATEGORY_SEARCH", "yandex.by": "SOURCE_CATEGORY_SEARCH", "yandex.com": "SOURCE_CATEGORY_SEARCH", "yandex.com.tr": "SOURCE_CATEGORY_SEARCH", "yandex.fr": "SOURCE_CATEGORY_SEARCH", "yandex.kz": "SOURCE_CATEGORY_SEARCH", "yandex.ru": "SOURCE_CATEGORY_SEARCH", "yandex.ua": "SOURCE_CATEGORY_SEARCH", "yandex.uz": "SOURCE_CATEGORY_SEARCH", "yelp": "SOURCE_CATEGORY_SOCIAL",
            "yelp.co.uk": "SOURCE_CATEGORY_SOCIAL", "yelp.com": "SOURCE_CATEGORY_SOCIAL", "youku": "SOURCE_CATEGORY_VIDEO", "youku.com": "SOURCE_CATEGORY_VIDEO", "youroom.in": "SOURCE_CATEGORY_SOCIAL", "youtube": "SOURCE_CATEGORY_VIDEO", "youtube.com": "SOURCE_CATEGORY_VIDEO", "za.pinterest.com": "SOURCE_CATEGORY_SOCIAL", "zalo": "SOURCE_CATEGORY_SOCIAL", "zen.yandex.ru": "SOURCE_CATEGORY_SEARCH", "zoo.gr": "SOURCE_CATEGORY_SOCIAL", "zooppa": "SOURCE_CATEGORY_SOCIAL", "zooppa.com": "SOURCE_CATEGORY_SOCIAL"
        };
        const paidMediumRegex = /^(cpc|cpa|cpv|cpl|cpp|cpd|cpn|ecpc|ppc|retargeting|.*paid.*)$/i;
        const emailSourceMediumRegex = /^(email|e[-_\s]?mail)$/i;
        const campaignShopRegex = /^(shop|shopping|.*shop.*|.*shopping.*|organic-shopping|product_listing_organic|feed)$/i;
        const organicVideoMediumRegex = /^(video|.*video.*|organic-video|video_organic|user_generated_video)$/i;
        const organicSocialMediums = ['social', 'social-network', 'social-media', 'sm', 'social network', 'social media', 'social_organic', 'organic_social'];
        const referralMediums = ['referral', 'app', 'link'];
        const displayMediums = ['display', 'banner', 'expandable', 'interstitial', 'cpm'];
        const crossNetworkMediums = ['cross-network', 'demand gen', 'performance max', 'smart shopping'];
        
        const genericSearchSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SEARCH').join('|')})$`, 'i');
        const genericShoppingSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SHOPPING').join('|')})$`, 'i');
        const genericSocialSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SOCIAL').join('|')})$`, 'i');
        const genericVideoSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_VIDEO').join('|')})$`, 'i');

        const mediumSuggestionsBySourceCategory = { 
          "SOURCE_CATEGORY_SEARCH": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidsearch", "paid_search", "paid-search", "paidsearches", "paidmedia", "paid_media", "paid-media", "organic"],
          "SOURCE_CATEGORY_SOCIAL": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidsocial", "paid_social", "paid-social", "paidmedia", "paid_media", "paid-media", "organic-social", "social-paid", "social-organic", "post", "story", "boost", "social_ad", "sm", "social-network", "social-media", "promoted_post", "social_ads", "social", "social network", "social media"],
          "SOURCE_CATEGORY_VIDEO": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidvideo", "paid_video", "paid-video", "video", "video_ad", "instream", "outstream", "trueview", "bumper_ad", "video_ads", "organic-video", "video_organic", "user_generated_video"],
          "SOURCE_CATEGORY_SHOPPING": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidshopping", "paid_shopping", "paid-shopping", "shopping", "product_listing_ad", "pla", "feed", "merchant_center", "shopping_ads", "organic-shopping", "product_listing_organic", "shop"],
          "DEFAULT": ["cpc", "ppc", "paid", "email", "e-mail", "e_mail", "e mail", "social", "referral", "link", "app", "display", "banner", "expandable", "interstitial", "cpm", "organic", "qr_code", "push", "notification", "mobile", "mobile_push", "app_notification", "partner", "podcast", "audio", "sms", "retargeting", "video", "shopping", "affiliate", "cross-network", "demand gen", "performance max", "smart shopping", "(not set)", "(none)"]
        };
        const mediumSuggestionsBySourceOverride = { 
            "google": ["cpc", "organic", "display", "video", "shopping", "youtube_ad", "discovery_ad", "performance_max", "feed", "paidsearch", "ppc", "paid", "search_ads", "video_ads", "shopping_ads"],
            "facebook": ["cpc", "social", "paid-social", "paidsocial", "post", "story", "boost", "lead_ad", "messenger_ad", "ppc", "paid", "social_ads"],
            "facebook.com": ["cpc", "social", "paid-social", "paidsocial", "post", "story", "boost", "lead_ad", "messenger_ad", "ppc", "paid", "social_ads"],
            "instagram": ["cpc", "social", "paid-social", "paidsocial", "post", "story", "ig_shopping_ad", "ppc", "paid", "social_ads"],
            "instagram.com": ["cpc", "social", "paid-social", "paidsocial", "post", "story", "ig_shopping_ad", "ppc", "paid", "social_ads"],
            "linkedin": ["cpc", "social", "paid-social", "paidsocial", "sponsored_content", "sponsored_inmail", "text_ad", "ppc", "paid", "social_ads"],
            "linkedin.com": ["cpc", "social", "paid-social", "paidsocial", "sponsored_content", "sponsored_inmail", "text_ad", "ppc", "paid", "social_ads"],
            "youtube": ["video", "cpc", "display", "social", "video_ad", "instream", "outstream", "masthead", "organic-video", "paid-video", "trueview_in-stream_ad", "trueview_discovery_ad", "bumper_ad", "ppc", "paid", "video_ads"],
            "youtube.com": ["video", "cpc", "display", "social", "video_ad", "instream", "outstream", "masthead", "organic-video", "paid-video", "trueview_in-stream_ad", "trueview_discovery_ad", "bumper_ad", "ppc", "paid", "video_ads"],
            "newsletter": ["email", "newsletter_link", "e-mail", "e_mail", "e-newsletter"],
            "email": ["email", "blast", "automated_email", "transactional_email", "e-mail", "e_mail", "e-blast"],
            "bing": ["cpc", "organic", "paidsearch", "ppc", "paid", "search_ads"],
            "duckduckgo": ["organic", "cpc", "paidsearch", "ppc", "paid", "search_ads"],
            "twitter": ["social", "cpc", "tweet", "paidsocial", "promoted_tweet", "ppc", "paid", "social_ads"],
            "twitter.com": ["social", "cpc", "tweet", "paidsocial", "promoted_tweet", "ppc", "paid", "social_ads"],
            "pinterest": ["social", "cpc", "pin", "promoted_pin", "paidsocial", "ppc", "paid", "social_ads"],
            "pinterest.com": ["social", "cpc", "pin", "promoted_pin", "paidsocial", "ppc", "paid", "social_ads"],
            "tiktok": ["social", "cpc", "video", "paidsocial", "video_ad", "ppc", "paid", "social_ads"],
            "tiktok.com": ["social", "cpc", "video", "paidsocial", "video_ad", "ppc", "paid", "social_ads"],
            "reddit": ["social", "cpc", "post", "paidsocial", "promoted_post", "ppc", "paid", "social_ads"],
            "reddit.com": ["social", "cpc", "post", "paidsocial", "promoted_post", "ppc", "paid", "social_ads"],
            "amazon": ["cpc", "sponsored_products", "display", "shopping", "marketplace", "pla", "ppc", "paid", "shopping_ads"],
            "amazon.com": ["cpc", "sponsored_products", "display", "shopping", "marketplace", "pla", "ppc", "paid", "shopping_ads"],
        };
        
        /**
         * Predicts the GA4 channel based on source, medium, and campaign name.
         * Follows GA4's channel grouping logic in the specified order.
         * @param {string} source - The utm_source value.
         * @param {string} medium - The utm_medium value.
         * @param {string} campaign - The utm_campaign value.
         * @returns {string} The predicted GA4 channel name.
         */
        function predictGa4Channel(source, medium, campaign) {
            source = source ? source.toLowerCase().trim() : "";
            medium = medium ? medium.toLowerCase().trim() : "";
            campaign = campaign ? campaign.toLowerCase().trim() : "";

            const sourceIsDirect = source === "(direct)";
            const mediumIsNoneOrNotSet = medium === "(not set)" || medium === "(none)";
            const isPaid = paidMediumRegex.test(medium);
            const sourceCat = sourceCategoryMap[source.replace(/^www\./, '')] || sourceCategoryMap[source];

            // 1. Direct (As per GA4 documentation, this is typically evaluated first)
            if (sourceIsDirect && mediumIsNoneOrNotSet) return "Direct";

            // 2. Cross-network
            if (campaign.includes("cross-network") || crossNetworkMediums.includes(medium)) return "Cross-network";
            
            // 3. Paid Shopping
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SHOPPING" || genericShoppingSitesRegex.test(source) || campaignShopRegex.test(campaign))) return "Paid Shopping";
            
            // 4. Paid Search
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SEARCH" || genericSearchSitesRegex.test(source))) return "Paid Search";
            
            // 5. Paid Social
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SOCIAL" || genericSocialSitesRegex.test(source))) return "Paid Social";
            
            // 6. Paid Video
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_VIDEO" || genericVideoSitesRegex.test(source))) return "Paid Video";
            
            // 7. Paid Other (This is a catch-all for paid traffic if not matched above)
            if (isPaid) return "Paid Other"; 
            
            // 8. Display
            if (displayMediums.includes(medium)) return "Display";
            
            // 9. Organic Shopping (Must come after paid checks and display)
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SHOPPING" || genericShoppingSitesRegex.test(source) || campaignShopRegex.test(campaign))) return "Organic Shopping";
            
            // 10. Organic Social
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SOCIAL" || genericSocialSitesRegex.test(source) || organicSocialMediums.includes(medium))) return "Organic Social";
            
            // 11. Organic Video
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_VIDEO" || genericVideoSitesRegex.test(source) || organicVideoMediumRegex.test(medium))) return "Organic Video";
            
            // 12. Organic Search
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SEARCH" || genericSearchSitesRegex.test(source) || medium === "organic")) return "Organic Search";
            
            // 13. Email
            if (emailSourceMediumRegex.test(source) || emailSourceMediumRegex.test(medium)) return "Email";
            
            // 14. Affiliates
            if (medium === "affiliate" || medium === "affiliates" || medium === "partner") return "Affiliates";
            
            // 15. Referral (GA4 docs place this after Affiliates)
            if (referralMediums.includes(medium)) return "Referral";
            
            // 16. Audio
            if (medium === "audio" || medium === "podcast_ad" || medium === "streaming_audio_ad") return "Audio";
            
            // 17. SMS
            if (source === "sms" || medium === "sms" || medium === "text_message") return "SMS";
            
            // 18. Mobile Push Notifications
            if (medium.endsWith("push") || medium.includes("mobile") || medium.includes("notification") || source === "firebase" || medium === "web_push") return "Mobile Push Notifications";

            // 19. Unassigned (Default fallback)
            return "Unassigned";
        }


        /**
         * Creates an HTML input field for a UTM or GA4 parameter.
         * @param {string} id - The base ID for the parameter (e.g., "utm_source").
         * @param {string} labelText - The display label for the input.
         * @param {string} tooltipText - The text for the tooltip.
         * @param {string} placeholder - The placeholder text for the input.
         * @param {boolean} isRequired - Whether the field is required.
         * @param {boolean} isSearchable - Whether the input should have combobox functionality.
         * @returns {string} HTML string for the input field.
         */
        function createUtmInput(id, labelText, tooltipText, placeholder, isRequired = false, isSearchable = false) {
            const inputId = `ga4-${id}`; 
            const isRequiredClass = isRequired ? 'required' : '';
            const requiredAttr = isRequired ? 'required' : '';
            const warningIconId = `${inputId}-warning`;
            const warningTooltipTextId = `${warningIconId}-tooltip`;
            let inputHtml;

            if (isSearchable) {
                inputHtml = `
                <div class="combobox-container">
                    <input type="text" id="${inputId}" data-original-id="${id}" placeholder="${placeholder}" ${requiredAttr} autocomplete="off"
                           class="utm-input w-full">
                    <div id="${inputId}-dropdown" class="combobox-dropdown hidden"></div>
                </div>`;
            } else {
                inputHtml = `
                <input type="text" id="${inputId}" data-original-id="${id}" placeholder="${placeholder}" ${requiredAttr}
                       class="utm-input w-full">`;
            }

            return `
            <div class="form-group space-y-1">
                <label for="${inputId}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 ${isRequiredClass}">
                    ${labelText}
                    <span class="tooltip text-blue-500 dark:text-blue-400">
                        <i data-lucide="info" class="inline-block w-4 h-4"></i>
                        <span class="tooltiptext">${tooltipText}</span>
                    </span>
                    <span class="utm-warning-trigger tooltip" style="border-bottom: none;">
                        <svg id="${warningIconId}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle utm-warning-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        <span id="${warningTooltipTextId}" class="tooltiptext utm-warning-tooltiptext">Contains spaces. Consider replacing with underscores (_) or hyphens (-).</span>
                    </span>
                 </label>
                ${inputHtml}
            </div>`;
        }

        function renderInputs() {
            if (coreUtmInputsContainer) {
                coreUtmInputsContainer.innerHTML = utmParamsConfig
                    .filter(p => p.core)
                    .map(p => createUtmInput(p.id, p.label, p.tooltip, p.placeholder, p.required, p.isSearchable))
                    .join('');
            }
            if (optionalUtmInputsContainer) {
                optionalUtmInputsContainer.innerHTML = utmParamsConfig
                    .filter(p => !p.core)
                    .map(p => createUtmInput(p.id, p.label, p.tooltip, p.placeholder, p.required, false)) 
                    .join('');
            }
            if (ga4InputsContainer) {
                ga4InputsContainer.innerHTML = ga4ParamsConfig
                    .map(p => createUtmInput(p.id, p.label, p.tooltip, p.placeholder, p.required, false))
                    .join('');
            }
            addInputListeners(); 
            initLucideIcons(); 
        }

        function populateChannelDropdown() { 
            if (!channelSelect) return;
            while (channelSelect.options.length > 1) {
                channelSelect.remove(1);
            }
            if (typeof channels !== 'undefined' && channels) {
                Object.keys(channels).sort().forEach(channel => {
                    const option = document.createElement("option");
                    option.value = channel;
                    option.textContent = channel;
                    channelSelect.appendChild(option);
                });
            } else {
                console.error("GA4 Builder: 'channels' object is not defined or empty.");
            }
        }

        function updateChannelInfo() { 
            if (!channelSelect || !channelDesc || !channelCond || !channelInfoWrapper) return;
            const selectedChannelName = channelSelect.value;
            const selectedChannelData = channels[selectedChannelName];

            if (selectedChannelData && selectedChannelName !== "") {
                channelDesc.textContent = selectedChannelData.description;
                channelCond.textContent = "GA4 Condition: " + selectedChannelData.condition;
                channelInfoWrapper.classList.remove('hidden');
                channelInfoWrapper.classList.add('channel-info-highlight');
            } else {
                channelDesc.textContent = "";
                channelCond.textContent = "";
                channelInfoWrapper.classList.add('hidden');
                channelInfoWrapper.classList.remove('channel-info-highlight');
            }
            const sourceInput = document.getElementById('ga4-utm_source');
            if (sourceInput) populateSourceDropdown(sourceInput.value);
            const mediumInput = document.getElementById('ga4-utm_medium');
            if (mediumInput) populateMediumDropdown(mediumInput.value);
            updateComplianceFeedback();
        }

        function validateBaseUrl() { 
            if (!baseUrlInput || !baseUrlError) return true; 
            const url = baseUrlInput.value.trim();
            const isValid = url === '' || url.startsWith('http://') || url.startsWith('https://');
            if (isValid) {
                baseUrlError.style.display = 'none';
                baseUrlInput.classList.remove('border-red-500', 'dark:border-red-500');
            } else {
                baseUrlError.style.display = 'block';
                baseUrlInput.classList.add('border-red-500', 'dark:border-red-500');
            }
            return isValid;
         }

        function checkUtmInputForSpaces(inputElement) { 
            if (!inputElement) return;
            const value = inputElement.value;
            const warningIcon = document.getElementById(`${inputElement.id}-warning`);
            const formGroup = inputElement.closest('.form-group'); 
            const warningTrigger = formGroup ? formGroup.querySelector('.utm-warning-trigger') : null;

            if (warningIcon && warningTrigger) {
                 const hasSpace = /\s/.test(value);
                 warningIcon.style.display = hasSpace ? 'inline-block' : 'none';
                 warningTrigger.style.borderBottom = hasSpace ? '1px dotted #f59e0b' : 'none';
                 warningTrigger.style.cursor = hasSpace ? 'help' : 'default';
            }
        }

        function populateSourceDropdown(filter = '') { 
            const sourceInput = document.getElementById('ga4-utm_source');
            const dropdown = document.getElementById('ga4-utm_source-dropdown');
            if (!sourceInput || !dropdown) return;

            dropdown.innerHTML = ''; 
            const filterLower = filter.toLowerCase().trim();
            let count = 0;
            let sourceSuggestions = [];
            const selectedChannelName = channelSelect.value;
            const selectedChannelData = channels[selectedChannelName];

            if (selectedChannelData && selectedChannelName !== "") {
                if (Array.isArray(selectedChannelData.ga4RecommendedSources) && selectedChannelData.ga4RecommendedSources.length > 0) {
                    sourceSuggestions = selectedChannelData.ga4RecommendedSources;
                } else if (selectedChannelData.targetSourceCategory) {
                    sourceSuggestions = Object.keys(sourceCategoryMap).filter(
                        source => sourceCategoryMap[source] === selectedChannelData.targetSourceCategory
                    );
                } else { 
                     sourceSuggestions = Object.keys(sourceCategoryMap).sort();
                }
            } else { 
                sourceSuggestions = Object.keys(sourceCategoryMap).sort();
            }

            const uniqueSortedSuggestions = [...new Set(sourceSuggestions)]
                .filter(source => !filterLower || source.toLowerCase().includes(filterLower));

            uniqueSortedSuggestions.forEach(source => {
                const item = document.createElement('div');
                item.classList.add('combobox-dropdown-item');
                item.textContent = source;
                item.addEventListener('mousedown', () => { 
                    sourceInput.value = source;
                    dropdown.classList.add('hidden');
                    const mediumInput = document.getElementById('ga4-utm_medium'); 
                    if (mediumInput) populateMediumDropdown(mediumInput.value); 
                    generateUrl();
                    checkUtmInputForSpaces(sourceInput);
                });
                dropdown.appendChild(item);
                count++;
            });

            if (count > 0 && document.activeElement === sourceInput) {
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        }

        function populateMediumDropdown(filter = '') { 
            const mediumInput = document.getElementById('ga4-utm_medium');
            const dropdown = document.getElementById('ga4-utm_medium-dropdown');
            if (!mediumInput || !dropdown) return;

            dropdown.innerHTML = '';
            const filterLower = filter.toLowerCase().trim();
            let count = 0;
            let mediumSuggestions = [];
            const selectedChannelName = channelSelect.value;
            const selectedChannelData = channels[selectedChannelName];

            if (selectedChannelData && selectedChannelName !== "") {
                if (Array.isArray(selectedChannelData.ga4RecommendedMediums)) {
                    mediumSuggestions = selectedChannelData.ga4RecommendedMediums;
                }
            } else { 
                const sourceInput = document.getElementById('ga4-utm_source');
                const currentSourceValue = sourceInput ? sourceInput.value.toLowerCase().trim() : "";

                if (mediumSuggestionsBySourceOverride[currentSourceValue]) {
                    mediumSuggestions = mediumSuggestionsBySourceOverride[currentSourceValue];
                } else {
                    const sourceCategory = sourceCategoryMap[currentSourceValue] || (currentSourceValue ? sourceCategoryMap[currentSourceValue.replace(/^www\./,'')] : null);
                    if (sourceCategory && mediumSuggestionsBySourceCategory[sourceCategory]) {
                        mediumSuggestions = mediumSuggestionsBySourceCategory[sourceCategory];
                    } else {
                        mediumSuggestions = mediumSuggestionsBySourceCategory["DEFAULT"] || [];
                    }
                }
            }
            const uniqueSortedSuggestions = [...new Set(mediumSuggestions)]
                .filter(medium => !filterLower || medium.toLowerCase().includes(filterLower))
                .sort();

            uniqueSortedSuggestions.forEach(medium => {
                const item = document.createElement('div');
                item.classList.add('combobox-dropdown-item');
                item.textContent = medium;
                item.addEventListener('mousedown', () => { 
                    mediumInput.value = medium;
                    dropdown.classList.add('hidden');
                    generateUrl();
                    checkUtmInputForSpaces(mediumInput);
                });
                dropdown.appendChild(item);
                count++;
            });

             if (count > 0 && document.activeElement === mediumInput) {
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        }

        function updateComplianceFeedback() { 
             if (!complianceFeedbackEl) return;
            const sourceEl = document.getElementById("ga4-utm_source");
            const mediumEl = document.getElementById("ga4-utm_medium");
            const campaignEl = document.getElementById("ga4-utm_campaign");
            const sourceVal = sourceEl ? sourceEl.value.trim() : "";
            const mediumVal = mediumEl ? mediumEl.value.trim() : "";
            const campaignVal = campaignEl ? campaignEl.value.trim() : "";
            let feedbackText = "";
            let feedbackClass = "feedback-info"; 

            if (!sourceVal && !mediumVal) {
                complianceFeedbackEl.innerHTML = "Enter at least Source and Medium to see GA4 channel prediction.";
                complianceFeedbackEl.className = "feedback-base feedback-info";
                return;
            }
            const predictedChannel = predictGa4Channel(sourceVal, mediumVal, campaignVal);
            const selectedChannelGroup = channelSelect.value; 
            feedbackText = `Predicted GA4 Channel: <strong>${predictedChannel}</strong>.`;

            if (predictedChannel === "Unassigned") {
                feedbackText += "<br>This combination might result in 'Unassigned' traffic. Review Source/Medium values for GA4 alignment.";
                feedbackClass = "feedback-warning";
            } else if (selectedChannelGroup && selectedChannelGroup !== "" && selectedChannelGroup !== predictedChannel) {
                 feedbackText += `<br><span class="font-semibold text-amber-700 dark:text-amber-400">Potential Mismatch:</span> You selected channel group '<strong>${selectedChannelGroup}</strong>', but GA4 will likely categorize this traffic as '<strong>${predictedChannel}</strong>'. Consider aligning your UTMs or channel selection.`;
                 feedbackClass = "feedback-warning";
            } else if (selectedChannelGroup && selectedChannelGroup !== "" && selectedChannelGroup === predictedChannel) {
                feedbackText += `<br>This aligns with your selected channel group '<strong>${selectedChannelGroup}</strong>'. Good job!`;
                feedbackClass = "feedback-success";
            }
            complianceFeedbackEl.innerHTML = feedbackText;
            complianceFeedbackEl.className = `feedback-base ${feedbackClass}`;
        }
        
        function generateUrl() { 
            if (!baseUrlInput || !finalUrlTextarea || !copyBtn) return;

            const isBaseUrlValid = validateBaseUrl();
            const base = baseUrlInput.value.trim(); 
            const forceLower = forceLowercaseToggle.checked;

            let allRequiredUtmFilled = true;
            utmParamsConfig.forEach(param => {
                if (param.required) {
                    const inputElement = document.getElementById(`ga4-${param.id}`);
                    if (!inputElement || !inputElement.value.trim()) {
                        allRequiredUtmFilled = false;
                    }
                }
            });

            const queryParams = allParamIds
                .map(paramId => {
                    const inputElement = document.getElementById(`ga4-${paramId}`);
                    let value = inputElement ? inputElement.value.trim() : null;
                    if (value) {
                        if (forceLower) value = value.toLowerCase();
                        return `${encodeURIComponent(paramId)}=${encodeURIComponent(value)}`;
                    }
                    return null;
                })
                .filter(Boolean);

            let urlToDisplay = ""; 
            let actualUrlToCopyIfValid = ""; 
            let canCopy = false;

            if (base && isBaseUrlValid && allRequiredUtmFilled) {
                actualUrlToCopyIfValid = base;
                if (queryParams.length > 0) {
                    actualUrlToCopyIfValid += (base.includes('?') ? '&' : '?') + queryParams.join('&');
                }
                urlToDisplay = actualUrlToCopyIfValid;
                canCopy = true;
            } else {
                canCopy = false;
                if (!base) { 
                    urlToDisplay = "Base URL is required to generate a full campaign URL.";
                    if (allRequiredUtmFilled && queryParams.length > 0) {
                         urlToDisplay += ` (Generated parameters: ?${queryParams.join('&')})`;
                    } else if (!allRequiredUtmFilled) {
                        urlToDisplay = "Base URL and required UTM parameters (Source, Medium, Campaign) must be filled.";
                    }
                } else if (!isBaseUrlValid) { 
                    urlToDisplay = "Invalid Base URL. Please correct it (e.g., start with http:// or https://).";
                } else if (!allRequiredUtmFilled) { 
                    urlToDisplay = "Please fill in all required UTM parameters (Source, Medium, Campaign).";
                    if (base) { 
                        let tempDisplayUrl = base;
                        if (queryParams.length > 0) { 
                             tempDisplayUrl += (base.includes('?') ? '&' : '?') + queryParams.join('&');
                             urlToDisplay = "Required UTMs missing. Current URL: " + tempDisplayUrl;
                        } else {
                           urlToDisplay = "Required UTMs missing. Current base: " + base;
                        }
                    }
                } else { 
                    urlToDisplay = "Please enter a valid Base URL and all required UTM parameters.";
                }
            }
            finalUrlTextarea.value = urlToDisplay;
            copyBtn.disabled = !canCopy;
            updateComplianceFeedback(); 
        }

        function toggleOptionalParameters() { 
            if (!optionalParamsSection || !toggleArrowSpan) return;
            const isHidden = optionalParamsSection.classList.toggle('hidden');
            toggleArrowSpan.classList.toggle('open', !isHidden);
            const arrowIcon = toggleArrowSpan.querySelector('i');
            if(arrowIcon) arrowIcon.setAttribute('data-lucide', !isHidden ? 'chevron-up' : 'chevron-down');
            
            if (!isHidden) { 
                initLucideIcons(); 
            }
        }

        function addInputListeners() { 
             allParamIds.forEach(paramId => {
                const inputElement = document.getElementById(`ga4-${paramId}`);
                if (inputElement) {
                    inputElement.addEventListener("input", () => {
                        generateUrl(); 
                        checkUtmInputForSpaces(inputElement);
                    });
                    if (paramId === 'utm_source' || paramId === 'utm_medium') {
                        const dropdown = document.getElementById(`${inputElement.id}-dropdown`);
                        inputElement.addEventListener('focus', () => {
                            if (paramId === 'utm_source') populateSourceDropdown(inputElement.value);
                            else populateMediumDropdown(inputElement.value);
                        });
                        inputElement.addEventListener('input', () => { 
                            if (paramId === 'utm_source') populateSourceDropdown(inputElement.value);
                            else populateMediumDropdown(inputElement.value);
                        });
                        inputElement.addEventListener('blur', () => {
                            setTimeout(() => { if (dropdown) dropdown.classList.add('hidden'); }, 150); 
                        });
                    }
                    checkUtmInputForSpaces(inputElement); 
                }
            });
            if (baseUrlInput) baseUrlInput.addEventListener("input", generateUrl); 
        }

        function handleAnalyzeUrl() {
            if (!analyzeUrlInput || !analyzedUrlFeedbackEl) {
                console.error("URL Analyzer elements not found.");
                return;
            }
            const urlString = analyzeUrlInput.value.trim();
            if (!urlString) {
                analyzedUrlFeedbackEl.innerHTML = `<span class="text-gray-500 dark:text-gray-400">Please paste a URL to analyze.</span>`;
                analyzedUrlFeedbackEl.className = "feedback-base feedback-info";
                return;
            }

            try {
                const url = new URL(urlString); 
                const source = url.searchParams.get("utm_source") || "";
                const medium = url.searchParams.get("utm_medium") || "";
                const campaign = url.searchParams.get("utm_campaign") || "";

                if (!source && !medium) {
                    analyzedUrlFeedbackEl.innerHTML = `The provided URL does not contain utm_source or utm_medium parameters for prediction.`;
                    analyzedUrlFeedbackEl.className = "feedback-base feedback-warning";
                    return;
                }

                const predictedChannel = predictGa4Channel(source, medium, campaign);
                let feedbackText = `Predicted GA4 Channel for the provided URL: <strong>${predictedChannel}</strong>.`;
                let feedbackClass = "feedback-success";

                if (predictedChannel === "Unassigned") {
                    feedbackText += "<br>This URL might result in 'Unassigned' traffic based on its UTMs.";
                    feedbackClass = "feedback-warning";
                }
                
                analyzedUrlFeedbackEl.innerHTML = feedbackText;
                analyzedUrlFeedbackEl.className = `feedback-base ${feedbackClass}`;

            } catch (error) {
                analyzedUrlFeedbackEl.innerHTML = "Invalid URL provided. Please paste a full, valid URL (e.g., https://www.example.com).";
                analyzedUrlFeedbackEl.className = "feedback-base feedback-error";
                console.error("Error parsing URL for analysis:", error);
            }
        }
        
        function init() {
            if (builderInitialized) return;
            console.log("Initializing GA4 UTM Builder & URL Analyzer");

            if (coreUtmInputsContainer && optionalUtmInputsContainer && ga4InputsContainer) {
                renderInputs();
            } else {
                console.error("GA4 Builder: Critical input containers not found. Cannot render inputs.");
                return; 
            }

            populateChannelDropdown();
            updateChannelInfo(); 
            generateUrl(); 

            if (complianceFeedbackEl) { 
                complianceFeedbackEl.innerHTML = "Enter UTM parameters to see GA4 channel prediction.";
                complianceFeedbackEl.className = "feedback-base feedback-info";
            }
            if (analyzedUrlFeedbackEl) { 
                 analyzedUrlFeedbackEl.innerHTML = `<span class="text-gray-500 dark:text-gray-400">Enter a URL above and click "Predict" to see its likely GA4 channel.</span>`;
                 analyzedUrlFeedbackEl.className = "feedback-base feedback-info";
            }
            if (predictFromUrlBtn) {
                predictFromUrlBtn.addEventListener("click", handleAnalyzeUrl);
            }

            if (channelSelect) channelSelect.addEventListener("change", updateChannelInfo);
            if (forceLowercaseToggle) forceLowercaseToggle.addEventListener("change", generateUrl);
            if (copyBtn && finalUrlTextarea) {
                copyBtn.addEventListener("click", () => {
                    if (!copyBtn.disabled && finalUrlTextarea.value) {
                        copyToClipboard(finalUrlTextarea.value, copyMessageEl, copyErrorEl);
                    }
                });
            }
            if (toggleOptionalParamsBtn) toggleOptionalParamsBtn.addEventListener("click", toggleOptionalParameters);
            
            document.addEventListener('click', function(event) {
                const ga4TabActive = document.getElementById('ga4TabContent')?.classList.contains('active');
                if (!ga4TabActive || !builderInitialized) return;

                const activeComboboxInput = document.querySelector('#ga4TabContent .combobox-container input:focus');
                document.querySelectorAll('#ga4TabContent .combobox-dropdown').forEach(dropdown => {
                    const container = dropdown.closest('.combobox-container');
                    if (container && !container.contains(event.target) &&
                        (!activeComboboxInput || container !== activeComboboxInput.closest('.combobox-container'))) {
                         dropdown.classList.add('hidden');
                    }
                });
            });

            builderInitialized = true;
            console.log("GA4 UTM Builder & URL Analyzer Initialized");
            initLucideIcons(); 
        }

        return {
            init: init,
            isInitialized: () => builderInitialized,
            generateUrl: generateUrl 
        };
    })();

    // --- GOOGLE ADS TRACKING TEMPLATE BUILDER ---
    const googleAdsBuilder = (() => {
        const utmSourceInput = document.getElementById('ads-utm_source');
        const utmMediumInput = document.getElementById('ads-utm_medium');
        const utmCampaignInput = document.getElementById('ads-utm_campaign');
        const utmTermInput = document.getElementById('ads-utm_term');
        const utmContentInput = document.getElementById('ads-utm_content');
        const generateBtn = document.getElementById('ads-generateBtn');
        const resetBtn = document.getElementById('ads-resetBtn');
        const copyBtn = document.getElementById('ads-copyBtn');
        const generatedUrlText = document.getElementById('ads-generatedUrl');
        const resultContainer = document.getElementById('ads-resultContainer');
        const copyMessageEl = document.getElementById('ads-copy-message');
        const copyErrorEl = document.getElementById('ads-copy-error');
        const generalAccordionHeader = document.getElementById('ads-generalAccordionHeader');
        const generalAccordionContent = document.getElementById('ads-generalAccordionContent');
        const generalAccordionArrow = generalAccordionHeader ? generalAccordionHeader.querySelector('.accordion-arrow') : null; 
        const industryAccordionHeader = document.getElementById('ads-industryAccordionHeader');
        const industryAccordionContent = document.getElementById('ads-industryAccordionContent');
        const industryAccordionArrow = industryAccordionHeader ? industryAccordionHeader.querySelector('.accordion-arrow') : null; 
        const generalParamsContainer = document.getElementById('ads-general-params-container');
        const networkDeviceParamsContainer = document.getElementById('ads-network-device-params-container');
        const targetingLocationParamsContainer = document.getElementById('ads-targeting-location-params-container');
        const conditionalParamsContainer = document.getElementById('ads-conditional-params-container');
        const gclidParamContainer = document.getElementById('ads-gclid-param-container');
        const shoppingParamsContainer = document.getElementById('ads-shopping-params-container');
        const videoParamsContainer = document.getElementById('ads-video-params-container');
        const hotelParamsContainer = document.getElementById('ads-hotel-params-container');
        const pmaxParamsContainer = document.getElementById('ads-pmax-params-container');
        const generalSearchInput = document.getElementById('ads-general-search');
        const industrySearchInput = document.getElementById('ads-industry-search');
        let builderInitialized = false;

        // UPDATED valueTrackParamsConfig based on the provided Google Ads documentation
        const valueTrackParamsConfig = [
            // Final URL, tracking template, or custom parameter
            { id: 'ads-vt_campaignid', paramName: 'campaignid', value: '{campaignid}', group: 'general', label: 'campaignid', tooltip: 'The campaign ID.' },
            { id: 'ads-vt_adgroupid', paramName: 'adgroupid', value: '{adgroupid}', group: 'general', label: 'adgroupid', tooltip: 'The ad group ID.' },
            { id: 'ads-vt_feeditemid', paramName: 'feeditemid', value: '{feeditemid}', group: 'general', label: 'feeditemid', tooltip: 'The ID of the feed-based or legacy asset that was clicked. Not for Display ads.' },
            { id: 'ads-vt_extensionid', paramName: 'extensionid', value: '{extensionid}', group: 'general', label: 'extensionid', tooltip: 'The ID of the asset-based or upgraded asset that was clicked. Not for Display ads.' },
            { id: 'ads-vt_targetid', paramName: 'targetid', value: '{targetid}', group: 'general', label: 'targetid', tooltip: 'ID of keyword (kwd), DSA target (dsa), remarketing list (aud), product partition (pla), or hotel group (hpi).' },
            { id: 'ads-vt_loc_interest_ms', paramName: 'loc_interest_ms', value: '{loc_interest_ms}', group: 'targeting_location', label: 'loc_interest_ms', tooltip: 'ID of location of interest.' },
            { id: 'ads-vt_loc_physical_ms', paramName: 'loc_physical_ms', value: '{loc_physical_ms}', group: 'targeting_location', label: 'loc_physical_ms', tooltip: 'ID of geographical location of click.' },
            { id: 'ads-vt_matchtype', paramName: 'matchtype', value: '{matchtype}', group: 'targeting_location', label: 'matchtype', tooltip: 'Match type: e (exact), p (phrase), b (broad).' },
            { id: 'ads-vt_network', paramName: 'network', value: '{network}', group: 'network_device', label: 'network', tooltip: 'Click source: g (Google search), s (search partners), d (Display), ytv (YouTube), vp (video partners), gtv (Google TV), x (PMax), e (ACe).' },
            { id: 'ads-vt_device', paramName: 'device', value: '{device}', group: 'network_device', label: 'device', tooltip: 'Device: m (mobile), t (tablet), c (computer).' },
            { id: 'ads-vt_devicemodel', paramName: 'devicemodel', value: '{devicemodel}', group: 'network_device', label: 'devicemodel', tooltip: 'Phone/tablet model (e.g., "Apple+iPhone"). Display Network only.' },
            { id: 'ads-vt_gclid', paramName: 'gclid', value: '{gclid}', group: 'gclid', label: 'gclid={gclid}', tooltip: 'Google Click Identifier.' },
            { id: 'ads-vt_creative', paramName: 'creative', value: '{creative}', group: 'general', label: 'creative', tooltip: 'A unique ID for your ad.' }, 
            { id: 'ads-vt_keyword', paramName: 'keyword', value: '{keyword}', group: 'targeting_location', label: 'keyword', tooltip: 'Keyword matching search query (Search) or content (Display).' },
            { id: 'ads-vt_placement', paramName: 'placement', value: '{placement}', group: 'targeting_location', label: 'placement', tooltip: 'Content site where ad was clicked or matching placement targeting criteria.' },
            { id: 'ads-vt_target', paramName: 'target', value: '{target}', group: 'targeting_location', label: 'target', tooltip: 'A placement category (placement-targeted campaigns only).' },
            { id: 'ads-vt_param1', paramName: 'param1', value: '{param1}', group: 'general', label: 'param1', tooltip: 'Creative parameter #1 (Google Ads API).' },
            { id: 'ads-vt_param2', paramName: 'param2', value: '{param2}', group: 'general', label: 'param2', tooltip: 'Creative parameter #2 (Google Ads API).' },
            { id: 'ads-vt_random_general', paramName: 'random', value: '{random}', group: 'general', label: 'random (general)', tooltip: 'Random Google-generated number (unsigned 64-bit).' }, 

            // Shopping campaigns only
            { id: 'ads-vt_shopping_adtype', paramName: 'adtype', value: '{adtype}', group: 'shopping', label: 'adtype (shopping)', tooltip: 'Shopping ad type: pla, pla_multichannel, pla_with_promotion, pla_with_pog.' },
            { id: 'ads-vt_merchant_id', paramName: 'merchant_id', value: '{merchant_id}', group: 'shopping', label: 'merchant_id', tooltip: 'Merchant Center account ID.' },
            { id: 'ads-vt_product_channel', paramName: 'product_channel', value: '{product_channel}', group: 'shopping', label: 'product_channel', tooltip: '"online" or "local".' },
            { id: 'ads-vt_product_id', paramName: 'product_id', value: '{product_id}', group: 'shopping', label: 'product_id', tooltip: 'Product ID from Merchant Center.' },
            { id: 'ads-vt_product_country', paramName: 'product_country', value: '{product_country}', group: 'shopping', label: 'product_country', tooltip: 'Country of sale for the product.' },
            { id: 'ads-vt_product_language', paramName: 'product_language', value: '{product_language}', group: 'shopping', label: 'product_language', tooltip: 'Language of product information.' },
            { id: 'ads-vt_product_partition_id', paramName: 'product_partition_id', value: '{product_partition_id}', group: 'shopping', label: 'product_partition_id', tooltip: 'Unique ID for the product group.' },
            { id: 'ads-vt_store_code', paramName: 'store_code', value: '{store_code}', group: 'shopping', label: 'store_code', tooltip: 'Unique ID of the local store (max 60 chars).' },

            // Video campaigns only
            { id: 'ads-vt_sourceid', paramName: 'sourceid', value: '{sourceid}', group: 'video', label: 'sourceid (video)', tooltip: 'ID of the source (e.g., App ID for app promotion in video campaigns).' },

            // Hotel campaigns only
            { id: 'ads-vt_hotelcenter_id', paramName: 'hotelcenter_id', value: '{hotelcenter_id}', group: 'hotel', label: 'hotelcenter_id', tooltip: 'Hotel Center account ID.' },
            { id: 'ads-vt_hotel_id', paramName: 'hotel_id', value: '{hotel_id}', group: 'hotel', label: 'hotel_id', tooltip: 'Hotel ID from hotel feed.' },
            { id: 'ads-vt_hotel_partition_id', paramName: 'hotel_partition_id', value: '{hotel_partition_id}', group: 'hotel', label: 'hotel_partition_id', tooltip: 'Unique ID of the hotel group.' },
            { id: 'ads-vt_hotel_adtype_hotel', paramName: 'hotel_adtype', value: '{hotel_adtype}', group: 'hotel', label: 'hotel_adtype', tooltip: '"Hotel" or "Room".' }, 
            { id: 'ads-vt_travel_start_day', paramName: 'travel_start_day', value: '{travel_start_day}', group: 'hotel', label: 'travel_start_day', tooltip: 'Check-in day.' },
            { id: 'ads-vt_travel_start_month', paramName: 'travel_start_month', value: '{travel_start_month}', group: 'hotel', label: 'travel_start_month', tooltip: 'Check-in month.' },
            { id: 'ads-vt_travel_start_year', paramName: 'travel_start_year', value: '{travel_start_year}', group: 'hotel', label: 'travel_start_year', tooltip: 'Check-in year.' },
            { id: 'ads-vt_travel_end_day', paramName: 'travel_end_day', value: '{travel_end_day}', group: 'hotel', label: 'travel_end_day', tooltip: 'Check-out day.' },
            { id: 'ads-vt_travel_end_month', paramName: 'travel_end_month', value: '{travel_end_month}', group: 'hotel', label: 'travel_end_month', tooltip: 'Check-out month.' },
            { id: 'ads-vt_travel_end_year', paramName: 'travel_end_year', value: '{travel_end_year}', group: 'hotel', label: 'travel_end_year', tooltip: 'Check-out year.' },
            { id: 'ads-vt_advanced_booking_window', paramName: 'advanced_booking_window', value: '{advanced_booking_window}', group: 'hotel', label: 'advanced_booking_window', tooltip: 'Days between ad click and check-in date.' },
            { id: 'ads-vt_date_type', paramName: 'date_type', value: '{date_type}', group: 'hotel', label: 'date_type', tooltip: '"default" or "selected".' },
            { id: 'ads-vt_number_of_adults', paramName: 'number_of_adults', value: '{number_of_adults}', group: 'hotel', label: 'number_of_adults', tooltip: 'Number of adults for the stay.' },
            { id: 'ads-vt_price_displayed_total', paramName: 'price_displayed_total', value: '{price_displayed_total}', group: 'hotel', label: 'price_displayed_total', tooltip: 'Total cost of room in user\'s currency.' },
            { id: 'ads-vt_price_displayed_tax', paramName: 'price_displayed_tax', value: '{price_displayed_tax}', group: 'hotel', label: 'price_displayed_tax', tooltip: 'Taxes and fees in user\'s currency.' },
            { id: 'ads-vt_user_currency', paramName: 'user_currency', value: '{user_currency}', group: 'hotel', label: 'user_currency', tooltip: 'User\'s local currency code (e.g., USD).' },
            { id: 'ads-vt_user_language', paramName: 'user_language', value: '{user_language}', group: 'hotel', label: 'user_language', tooltip: 'Display language code (e.g., en).' },
            { id: 'ads-vt_travel_adtype', paramName: 'adtype', value: '{adtype}', group: 'hotel', label: 'adtype (travel)', tooltip: 'Type of Travel ad: "travel_booking" or "travel_promoted".' }, 
            { id: 'ads-vt_rate_rule_id_hotel', paramName: 'rate_rule_id', value: '{rate_rule_id}', group: 'hotel', label: 'rate_rule_id (hotel)', tooltip: 'Identifier of special price clicked for hotels.' },

            // Performance Max
            { id: 'ads-vt_random_pmax', paramName: 'random', value: '{random}', group: 'pmax', label: 'random (PMax)', tooltip: 'Random Google-generated number for PMax.' },
             // Note: {lpurl}, {lpurl+2}, {lpurl+3}, {unescapedlpurl}, {escapedlpurl}, {escapedlpurl+2}, {escapedlpurl+3} are for tracking template structure, not individual params to append.
            // {ignore} is for Final URL only, not typically part of tracking string builder.
        ];

        const conditionalParamsConfig = [ 
            { inputId: 'ads-ifsearch_value', paramFormat: 'ifsearch=[value]', label: 'ifsearch', tooltip: 'Inserts [value] if click is from Search Network. Example: {lpurl}?source={ifsearch:google_search}', placeholder: 'e.g., search_traffic' },
            { inputId: 'ads-ifcontent_value', paramFormat: 'ifcontent=[value]', label: 'ifcontent', tooltip: 'Inserts [value] if click is from Display Network. Example: &medium={ifcontent:display}', placeholder: 'e.g., display_traffic' },
            { inputId: 'ads-ifmobile_value', paramFormat: 'ifmobile=[value]', label: 'ifmobile', tooltip: 'Inserts [value] if click is from a mobile device. Example: &devtype={ifmobile:mobile}', placeholder: 'e.g., mobile_click' },
            { inputId: 'ads-ifnotmobile_value', paramFormat: 'ifnotmobile=[value]', label: 'ifnotmobile', tooltip: 'Inserts [value] if click is NOT from a mobile device. Example: &devtype={ifnotmobile:desktop_tablet}', placeholder: 'e.g., desktop_click' }
        ];

        function createValueTrackCheckbox(config) {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            const checkbox = document.createElement('input');
            checkbox.id = config.id;
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox'; 
            checkbox.dataset.paramName = config.paramName;
            checkbox.dataset.paramValue = config.value;
            const label = document.createElement('label');
            label.htmlFor = config.id;
            label.className = 'ml-2 block text-sm text-gray-900 dark:text-gray-100';
            label.textContent = config.label + ' ';
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip';
            tooltipContainer.appendChild(createInfoIcon()); 
            tooltipContainer.appendChild(createTooltip(config.tooltip)); 
            label.appendChild(tooltipContainer);
            div.appendChild(checkbox);
            div.appendChild(label);
            return div;
        }

        function createConditionalParamInput(config) {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.htmlFor = config.inputId;
            label.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
            label.textContent = config.label + ' ';
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip';
            tooltipContainer.appendChild(createInfoIcon());
            tooltipContainer.appendChild(createTooltip(config.tooltip));
            label.appendChild(tooltipContainer);
            const input = document.createElement('input');
            input.type = 'text';
            input.id = config.inputId;
            input.className = 'mt-1 block w-full'; 
            input.placeholder = config.placeholder;
            input.dataset.paramFormat = config.paramFormat;
            div.appendChild(label);
            div.appendChild(input);
            return div;
        }

        function populateValueTrackParams() {
            [generalParamsContainer, networkDeviceParamsContainer, targetingLocationParamsContainer,
             gclidParamContainer, shoppingParamsContainer, videoParamsContainer, hotelParamsContainer,
             pmaxParamsContainer, conditionalParamsContainer].forEach(container => {
                if (container) container.innerHTML = ''; 
            });

            valueTrackParamsConfig.forEach(config => {
                const checkboxEl = createValueTrackCheckbox(config);
                let targetContainer = null;
                switch(config.group) {
                    case 'general': targetContainer = generalParamsContainer; break;
                    case 'network_device': targetContainer = networkDeviceParamsContainer; break;
                    case 'targeting_location': targetContainer = targetingLocationParamsContainer; break;
                    case 'gclid': targetContainer = gclidParamContainer; break;
                    case 'shopping': targetContainer = shoppingParamsContainer; break;
                    case 'video': targetContainer = videoParamsContainer; break;
                    case 'hotel': targetContainer = hotelParamsContainer; break;
                    case 'pmax': targetContainer = pmaxParamsContainer; break;
                }
                if (targetContainer) {
                    targetContainer.appendChild(checkboxEl);
                } else {
                    // This warning can be helpful during development if new groups are added
                    // console.warn(`Google Ads Builder: Container for group '${config.group}' not found for param '${config.id}'.`);
                }
            });

            if (conditionalParamsContainer) {
                conditionalParamsConfig.forEach(config => {
                    conditionalParamsContainer.appendChild(createConditionalParamInput(config));
                });
            }
            addInputListeners(); 
            initLucideIcons(); 
        }
        
        function isValueTrackPlaceholder(value) {
            return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
        }

        function generateTrackingString() {
            if (!generatedUrlText || !resultContainer) return;
            const baseUrl = '{lpurl}'; 
            const params = [];
            const addUtmParam = (inputElement, paramName) => {
                if (inputElement && inputElement.value.trim()) {
                    const value = inputElement.value.trim();
                    const encodedValue = isValueTrackPlaceholder(value) ? value : encodeURIComponent(value);
                    params.push(`${paramName}=${encodedValue}`);
                }
            };
            addUtmParam(utmSourceInput, 'utm_source');
            addUtmParam(utmMediumInput, 'utm_medium');
            addUtmParam(utmCampaignInput, 'utm_campaign');
            addUtmParam(utmTermInput, 'utm_term');
            addUtmParam(utmContentInput, 'utm_content');
            valueTrackParamsConfig.forEach(config => {
                const checkbox = document.getElementById(config.id);
                if (checkbox && checkbox.checked) {
                    params.push(`${config.paramName}=${config.value}`);
                }
            });
            conditionalParamsConfig.forEach(config => {
                const inputElement = document.getElementById(config.inputId);
                const value = inputElement ? inputElement.value.trim() : "";
                if (value) {
                    params.push(config.paramFormat.replace('[value]', encodeURIComponent(value)));
                }
            });
            let finalUrl = baseUrl;
            if (params.length > 0) {
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.join('&');
            }
            generatedUrlText.textContent = finalUrl;
            resultContainer.classList.remove('hidden');
        }

        function resetFields() {
            if(utmSourceInput) utmSourceInput.value = 'google';
            if(utmMediumInput) utmMediumInput.value = 'cpc';
            if(utmCampaignInput) utmCampaignInput.value = '{campaignname}';
            if(utmTermInput) utmTermInput.value = '{keyword}';
            if(utmContentInput) utmContentInput.value = '{creative}';
            valueTrackParamsConfig.forEach(config => {
                const checkbox = document.getElementById(config.id);
                if (checkbox) checkbox.checked = false;
            });
            conditionalParamsConfig.forEach(config => {
                const inputElement = document.getElementById(config.inputId);
                if (inputElement) inputElement.value = '';
            });
            if(resultContainer) resultContainer.classList.add('hidden');
            if(generatedUrlText) generatedUrlText.textContent = '';
            if(copyMessageEl) copyMessageEl.style.display = 'none';
            if(copyErrorEl) copyErrorEl.style.display = 'none';
            if(utmSourceInput) utmSourceInput.focus();
            [
                { header: generalAccordionHeader, content: generalAccordionContent, arrow: generalAccordionArrow, search: generalSearchInput },
                { header: industryAccordionHeader, content: industryAccordionContent, arrow: industryAccordionArrow, search: industrySearchInput }
            ].forEach(acc => {
                if (acc.content && acc.content.classList.contains('open')) {
                    acc.content.classList.remove('open');
                    if(acc.header) acc.header.setAttribute('aria-expanded', 'false');
                    if (acc.arrow) {
                         acc.arrow.classList.remove('open');
                         const icon = acc.arrow.querySelector('i');
                         if(icon) icon.setAttribute('data-lucide', 'chevron-right');
                    }
                }
                if(acc.search) {
                    acc.search.value = '';
                    filterAccordionItems(acc.search, acc.content); 
                }
            });
            initLucideIcons(); 
            generateTrackingString(); 
        }

        function addInputListeners() {
            const inputsToWatch = [
                utmSourceInput, utmMediumInput, utmCampaignInput,
                utmTermInput, utmContentInput
            ];
            valueTrackParamsConfig.forEach(config => {
                const checkbox = document.getElementById(config.id);
                if (checkbox) inputsToWatch.push(checkbox);
            });
            conditionalParamsConfig.forEach(config => {
                const inputEl = document.getElementById(config.inputId);
                if (inputEl) inputsToWatch.push(inputEl);
            });
            inputsToWatch.forEach(input => {
                if (input) {
                    const eventType = (input.type === 'checkbox' || input.type === 'radio') ? 'change' : 'input';
                    input.addEventListener(eventType, generateTrackingString);
                }
            });
        }
        
        function filterAccordionItems(searchInput, contentContainer) {
            if (!searchInput || !contentContainer) return;
            const filterText = searchInput.value.toLowerCase().trim();
            contentContainer.querySelectorAll('.grid > div, .flex.items-center, div > label + input').forEach(itemParent => {
                let itemToSearch = itemParent;
                if (itemParent.tagName !== 'LABEL' && !itemParent.classList.contains('flex')) { 
                    const label = itemParent.querySelector('label');
                    if (label) itemToSearch = label;
                }
                const itemText = itemToSearch.textContent.toLowerCase();
                if (itemText.includes(filterText)) {
                    itemParent.style.display = ''; 
                } else {
                    itemParent.style.display = 'none'; 
                }
            });
        }

        function init() {
            if (builderInitialized) return;
            console.log("Initializing Google Ads Builder");
            if (!generalParamsContainer || !networkDeviceParamsContainer || !targetingLocationParamsContainer ||
                !conditionalParamsContainer || !gclidParamContainer || !shoppingParamsContainer ||
                !videoParamsContainer || !hotelParamsContainer || !pmaxParamsContainer) {
                console.error("Google Ads Builder: One or more parameter containers not found. Cannot initialize.");
                return;
            }
            populateValueTrackParams();
            setupAccordion(generalAccordionHeader, generalAccordionContent, generalAccordionArrow);
            setupAccordion(industryAccordionHeader, industryAccordionContent, industryAccordionArrow);
            generateTrackingString(); 
            if(generateBtn) generateBtn.addEventListener('click', generateTrackingString);
            if(copyBtn && generatedUrlText) copyBtn.addEventListener('click', () => copyToClipboard(generatedUrlText.textContent, copyMessageEl, copyErrorEl));
            if(resetBtn) resetBtn.addEventListener('click', resetFields);
            if(generalSearchInput && generalAccordionContent) generalSearchInput.addEventListener('input', () => filterAccordionItems(generalSearchInput, generalAccordionContent));
            if(industrySearchInput && industryAccordionContent) industrySearchInput.addEventListener('input', () => filterAccordionItems(industrySearchInput, industryAccordionContent));
            builderInitialized = true;
            console.log("Google Ads Builder Initialized");
        }

        return { 
            init, 
            isInitialized: () => builderInitialized,
            generateTrackingString 
        };
    })();

    // --- MICROSOFT ADS TRACKING TEMPLATE BUILDER ---
    const microsoftAdsBuilder = (() => {
        const standardParamsContainer = document.getElementById('msads-standard-params-container');
        const checkboxParamsContainer = document.getElementById('msads-checkbox-params-container');
        const defaultValueParamsContainer = document.getElementById('msads-default-value-params-container');
        const conditionalMsParamsContainer = document.getElementById('msads-conditional-params-container'); 
        const generateBtn = document.getElementById('msads-generateBtn');
        const resetBtn = document.getElementById('msads-resetBtn');
        const copyBtn = document.getElementById('msads-copyBtn');
        const generatedUrlText = document.getElementById('msads-generatedUrl');
        const resultContainer = document.getElementById('msads-resultContainer');
        const copyMessageEl = document.getElementById('msads-copy-message');
        const copyErrorEl = document.getElementById('msads-copy-error');
        const accordionHeader = document.getElementById('msads-accordionHeader');
        const accordionContent = document.getElementById('msads-accordionContent');
        const accordionArrow = document.getElementById('msads-accordionArrow'); 
        const paramsSearchInput = document.getElementById('msads-params-search');
        let builderInitialized = false;

        const standardTrackingParamsConfig = [ 
            { idPrefix: 'msads-source',   displayLabel: 'Campaign Source (utm_source)',   defaultKey: 'utm_source', defaultValue: 'bing', valuePlaceholder: 'Parameter Value (e.g., bing or {Network})' },
            { idPrefix: 'msads-medium',   displayLabel: 'Campaign Medium (utm_medium)',   defaultKey: 'utm_medium', defaultValue: 'cpc',    valuePlaceholder: 'Parameter Value (e.g., cpc or {MatchType})' },
            { idPrefix: 'msads-campaign', displayLabel: 'Campaign Name (utm_campaign)', defaultKey: 'utm_campaign', defaultValue: '{Campaign}', valuePlaceholder: 'Parameter Value (e.g., {Campaign})' },
            { idPrefix: 'msads-term',     displayLabel: 'Campaign Term (utm_term)',     defaultKey: 'utm_term', defaultValue: '{keyword:default}', valuePlaceholder: 'Parameter Value (e.g., {keyword:default})' },
            { idPrefix: 'msads-content',  displayLabel: 'Campaign Content (utm_content)',  defaultKey: 'utm_content', defaultValue: '{AdId}', valuePlaceholder: 'Parameter Value (e.g., {AdId})' }
        ];
        const valueTrackMsParamsConfig = [ 
            { id: 'msads-p_CampaignId', defaultParamKey: 'cid', bingTag: '{CampaignId}', label: 'Campaign ID', description: 'The ID of the campaign that triggered the ad.' },
            { id: 'msads-p_Campaign', defaultParamKey: 'campaign_name', bingTag: '{Campaign}', label: 'Campaign Name', description: 'The name of the campaign that triggered the ad.' },
            { id: 'msads-p_AdGroupId', defaultParamKey: 'adgroup_id', bingTag: '{AdGroupId}', label: 'Ad Group ID', description: 'The ID of the ad group that triggered the ad.' },
            { id: 'msads-p_AdGroup', defaultParamKey: 'adgroup_name', bingTag: '{AdGroup}', label: 'Ad Group Name', description: 'The name of the ad group that triggered the ad.' },
            { id: 'msads-p_AdId', defaultParamKey: 'ad_id', bingTag: '{AdId}', label: 'Ad ID', description: 'The numeric ID of the displayed ad.' },
            { id: 'msads-p_TargetId', defaultParamKey: 'targetid', bingTag: '{TargetId}', label: 'Target ID', description: 'ID of keyword ("kwd"), remarketing/audience list ("aud"), dynamic ad target ("dat"), product partition ("pla"), or targeted location ("loc"). If multiple, order: aud, dat, kwd, pla.' },
            { id: 'msads-p_MatchType', defaultParamKey: 'matchtype', bingTag: '{MatchType}', label: 'Match Type (Actual)', description: 'The match type used to deliver an ad (e=exact, p=phrase, b=broad/expanded).' },
            { id: 'msads-p_BidMatchType', defaultParamKey: 'bidmatchtype', bingTag: '{BidMatchType}', label: 'Bid Match Type', description: 'The keyword bid match type (be=bidded exact, bp=bidded phrase, bb=bidded broad).' },
            { id: 'msads-p_OrderItemId', defaultParamKey: 'orderitemid', bingTag: '{OrderItemId}', label: 'Keyword/Product Group ID', description: 'Numeric ID for the keyword or product group ID for Shopping campaigns.' },
            { id: 'msads-p_QueryString', defaultParamKey: 'querystring', bingTag: '{QueryString}', label: 'Query String', description: 'The search query text that the user entered (URL encoded by Bing).' },
            { id: 'msads-p_Network', defaultParamKey: 'network', bingTag: '{Network}', label: 'Network', description: 'Ad network type: o=owned (Bing, AOL, Yahoo), s=syndicated (partners), a=audience.' },
            { id: 'msads-p_Device', defaultParamKey: 'device', bingTag: '{Device}', label: 'Device', description: 'Click source: m=mobile, t=tablet, c=desktop/laptop.' },
            { id: 'msads-p_msclkid', defaultParamKey: 'msclkid', bingTag: '{msclkid}', label: 'MSCLKID', description: 'Microsoft Click ID. Essential for conversion tracking. (URL encoded by Bing).' },
            { id: 'msads-p_feeditemid', defaultParamKey: 'feeditemid', bingTag: '{feeditemid}', label: 'Feed Item ID', description: 'The ID of the ad extension that was clicked.' },
            { id: 'msads-p_loc_physical_ms', defaultParamKey: 'loc_physical', bingTag: '{loc_physical_ms}', label: 'Physical Location ID', description: 'Geographical location code of the physical location of the click.' },
            { id: 'msads-p_loc_interest_ms', defaultParamKey: 'loc_interest', bingTag: '{loc_interest_ms}', label: 'Interest Location ID', description: 'Geographical location code of the location of interest that triggered the ad.' }
        ];
        const paramsWithDefaultConfig = [ 
            { idPrefix: 'msads-p_keyword', bingTagFormat: '{keyword:%default%}', label: 'Keyword: ', defaultKeyInputId: 'msads-p_keyword_default_value', description: 'Matched keyword. Provide default if substitution exceeds URL limit or keyword is empty. Default text itself is not substituted for validity, so avoid spaces in the default.', defaultParamKeyBase: 'keyword', examplePlaceholder: 'not_set' },
            { idPrefix: 'msads-p_param1', bingTagFormat: '{param1:%default%}', label: 'Param1: ', defaultKeyInputId: 'msads-p_param1_default_value', description: 'Custom parameter 1. Provide default value.', defaultParamKeyBase: 'param1', examplePlaceholder: 'p1_default'  },
            { idPrefix: 'msads-p_param2', bingTagFormat: '{param2:%default%}', label: 'Param2: ', defaultKeyInputId: 'msads-p_param2_default_value', description: 'Custom parameter 2. Provide default value.', defaultParamKeyBase: 'param2', examplePlaceholder: 'p2_default'  },
            { idPrefix: 'msads-p_param3', bingTagFormat: '{param3:%default%}', label: 'Param3: ', defaultKeyInputId: 'msads-p_param3_default_value', description: 'Custom parameter 3. Provide default value.', defaultParamKeyBase: 'param3', examplePlaceholder: 'p3_default'  }
        ];
        const msConditionalParamsConfig = [ 
            { idPrefix: 'msads-p_IfMobile', bingTagFormat: '{IfMobile:%value%}', label: 'IfMobile string: ', valueInputId: 'msads-p_IfMobile_value', description: 'Text inserted if ad is displayed on a mobile device.', defaultParamKeyBase: 'if_mobile', examplePlaceholder: 'mobile_visitor' },
            { idPrefix: 'msads-p_IfNotMobile', bingTagFormat: '{IfNotMobile:%value%}', label: 'IfNotMobile string: ', valueInputId: 'msads-p_IfNotMobile_value', description: 'Text inserted if ad is on computer, laptop, or tablet.', defaultParamKeyBase: 'if_not_mobile', examplePlaceholder: 'desktop_visitor' },
            { idPrefix: 'msads-p_IfSearch', bingTagFormat: '{IfSearch:%value%}', label: 'IfSearch string: ', valueInputId: 'msads-p_IfSearch_value', description: 'Text inserted if ad is displayed in search placements.', defaultParamKeyBase: 'if_search', examplePlaceholder: 'search_traffic' },
            { idPrefix: 'msads-p_IfNative', bingTagFormat: '{IfNative:%value%}', label: 'IfNative string: ', valueInputId: 'msads-p_IfNative_value', description: 'Text inserted if ad is displayed as a Microsoft Audience ad.', defaultParamKeyBase: 'if_native', examplePlaceholder: 'audience_ad_traffic' },
            { idPrefix: 'msads-p_IfPLA', bingTagFormat: '{IfPLA:%value%}', label: 'IfPLA string: ', valueInputId: 'msads-p_IfPLA_value', description: 'Text inserted if ad is displayed as a product ad.', defaultParamKeyBase: 'if_pla', examplePlaceholder: 'product_ad_traffic' }
        ];
        
        function createStandardParamInput(config) {
            const paramWrapperDiv = document.createElement('div');
            const mainLabel = document.createElement('label');
            mainLabel.htmlFor = `${config.idPrefix}-value`;
            mainLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
            mainLabel.textContent = config.displayLabel;
            if (config.defaultValue && config.defaultValue.includes("{") && config.defaultValue.includes("}")) {
                const indicator = document.createElement('i');
                indicator.setAttribute('data-lucide', 'variable');
                indicator.className = 'inline-block w-4 h-4 ml-1 dynamic-value-indicator'; 
                mainLabel.appendChild(indicator);
            }
            paramWrapperDiv.appendChild(mainLabel);
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = `${config.idPrefix}-value`;
            valueInput.value = config.defaultValue;
            valueInput.className = 'w-full'; 
            valueInput.placeholder = config.valuePlaceholder;
            paramWrapperDiv.appendChild(valueInput);
            return paramWrapperDiv;
        }

        function createMsAdsCheckbox(config) {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            const checkbox = document.createElement('input');
            checkbox.id = config.id;
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.dataset.bingTag = config.bingTag;
            checkbox.dataset.paramKey = config.defaultParamKey;
            const label = document.createElement('label');
            label.htmlFor = config.id;
            label.className = 'ml-2 block text-sm text-gray-900 dark:text-gray-100';
            label.textContent = config.label + ' ';
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip';
            tooltipContainer.appendChild(createInfoIcon());
            tooltipContainer.appendChild(createTooltip(`${config.description} (Adds as ${config.defaultParamKey}=${config.bingTag})`));
            label.appendChild(tooltipContainer);
            div.appendChild(checkbox);
            div.appendChild(label);
            return div;
        }

        function createMsAdsDefaultValueInput(config) {
            const div = document.createElement('div');
            div.className = 'param-field'; 
            const labelEl = document.createElement('label');
            labelEl.htmlFor = config.defaultKeyInputId;
            labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
            labelEl.textContent = config.label;
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip';
            tooltipContainer.appendChild(createInfoIcon());
            tooltipContainer.appendChild(createTooltip(config.description));
            labelEl.appendChild(tooltipContainer);
            const inputGroup = document.createElement('div');
            inputGroup.className = 'flex space-x-2 items-center';
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.id = `${config.idPrefix}-key`; 
            keyInput.value = config.defaultParamKeyBase;
            keyInput.className = 'mt-1 inline-block w-2/5'; 
            keyInput.placeholder = "Param Key";
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = config.defaultKeyInputId; 
            valueInput.className = 'mt-1 inline-block w-3/5'; 
            valueInput.placeholder = `Default (e.g., ${config.examplePlaceholder})`;
            valueInput.dataset.bingTagFormat = config.bingTagFormat;
            valueInput.dataset.paramKeyBase = config.defaultParamKeyBase; 
            div.appendChild(labelEl);
            inputGroup.appendChild(keyInput);
            inputGroup.appendChild(valueInput);
            div.appendChild(inputGroup);
            return div;
        }
        
        function createMsAdsConditionalInput(config) {
            const div = document.createElement('div');
             div.className = 'param-field'; 
            const labelEl = document.createElement('label');
            labelEl.htmlFor = config.valueInputId;
            labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
            labelEl.textContent = config.label;
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip';
            tooltipContainer.appendChild(createInfoIcon());
            tooltipContainer.appendChild(createTooltip(config.description));
            labelEl.appendChild(tooltipContainer);
            const inputGroup = document.createElement('div');
            inputGroup.className = 'flex space-x-2 items-center';
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.id = `${config.idPrefix}-key`; 
            keyInput.value = config.defaultParamKeyBase;
            keyInput.className = 'mt-1 inline-block w-2/5'; 
            keyInput.placeholder = "Param Key";
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = config.valueInputId; 
            valueInput.className = 'mt-1 inline-block w-3/5'; 
            valueInput.placeholder = `Text value (e.g., ${config.examplePlaceholder})`;
            valueInput.dataset.bingTagFormat = config.bingTagFormat;
            valueInput.dataset.paramKeyBase = config.defaultParamKeyBase; 
            div.appendChild(labelEl);
            inputGroup.appendChild(keyInput);
            inputGroup.appendChild(valueInput);
            div.appendChild(inputGroup);
            return div;
        }

        function populateMsAdsParams() {
            if (standardParamsContainer) {
                standardParamsContainer.innerHTML = '';
                standardTrackingParamsConfig.forEach(config => {
                    standardParamsContainer.appendChild(createStandardParamInput(config));
                });
            }
            if (checkboxParamsContainer) {
                checkboxParamsContainer.innerHTML = '';
                valueTrackMsParamsConfig.forEach(config => { 
                    checkboxParamsContainer.appendChild(createMsAdsCheckbox(config));
                });
            }
            if (defaultValueParamsContainer) {
                defaultValueParamsContainer.innerHTML = '';
                paramsWithDefaultConfig.forEach(config => {
                    defaultValueParamsContainer.appendChild(createMsAdsDefaultValueInput(config));
                });
            }
            if (conditionalMsParamsContainer) { 
                conditionalMsParamsContainer.innerHTML = '';
                msConditionalParamsConfig.forEach(config => {
                    conditionalMsParamsContainer.appendChild(createMsAdsConditionalInput(config));
                });
            }
            addInputListeners(); 
            initLucideIcons(); 
        }

        function isBingValueTrackPlaceholder(value) {
            return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
        }

        function generateTrackingString() {
            if (!generatedUrlText || !resultContainer) return;
            const baseUrl = '{lpurl}';
            const queryParams = [];
            standardTrackingParamsConfig.forEach(config => {
                const valEl = document.getElementById(`${config.idPrefix}-value`);
                const key = config.defaultKey; 
                const value = valEl ? valEl.value.trim() : '';
                if (key && value) {
                    const encodedValue = isBingValueTrackPlaceholder(value) ? value : encodeURIComponent(value);
                    queryParams.push(`${encodeURIComponent(key)}=${encodedValue}`);
                }
            });
            valueTrackMsParamsConfig.forEach(config => {
                const checkbox = document.getElementById(config.id);
                if (checkbox && checkbox.checked) {
                    queryParams.push(`${encodeURIComponent(checkbox.dataset.paramKey)}=${checkbox.dataset.bingTag}`);
                }
            });
            paramsWithDefaultConfig.forEach(config => {
                const defaultValueInput = document.getElementById(config.defaultKeyInputId);
                const paramKeyInput = document.getElementById(`${config.idPrefix}-key`);
                const defaultValue = defaultValueInput ? defaultValueInput.value.trim() : '';
                const paramKey = paramKeyInput ? paramKeyInput.value.trim() : '';
                if (paramKey && defaultValue) {
                    const formattedBingTag = config.bingTagFormat.replace('%default%', defaultValue); 
                    queryParams.push(`${encodeURIComponent(paramKey)}=${formattedBingTag}`);
                } else if (paramKey && config.bingTagFormat.includes('%default%') && !defaultValue) {
                    const baseTag = config.bingTagFormat.substring(0, config.bingTagFormat.indexOf(':')); 
                     if (baseTag && config.bingTagFormat.endsWith("}")) { 
                         queryParams.push(`${encodeURIComponent(paramKey)}=${baseTag}}`); 
                     }
                }
            });
            msConditionalParamsConfig.forEach(config => {
                const valueInput = document.getElementById(config.valueInputId);
                const paramKeyInput = document.getElementById(`${config.idPrefix}-key`);
                const value = valueInput ? valueInput.value.trim() : '';
                const paramKey = paramKeyInput ? paramKeyInput.value.trim() : '';
                if (paramKey && value) {
                    const formattedBingTag = config.bingTagFormat.replace('%value%', value); 
                    queryParams.push(`${encodeURIComponent(paramKey)}=${formattedBingTag}`);
                }
            });
            let finalUrl = baseUrl;
            if (queryParams.length > 0) {
                finalUrl += '?' + queryParams.join('&');
            }
            generatedUrlText.textContent = finalUrl;
            resultContainer.classList.remove('hidden');
        }

        function resetFields() {
            standardTrackingParamsConfig.forEach(config => {
                const valEl = document.getElementById(`${config.idPrefix}-value`);
                if (valEl) valEl.value = config.defaultValue;
            });
            valueTrackMsParamsConfig.forEach(config => {
                const checkbox = document.getElementById(config.id);
                if (checkbox) checkbox.checked = false;
            });
            paramsWithDefaultConfig.forEach(config => {
                const keyEl = document.getElementById(`${config.idPrefix}-key`);
                const valEl = document.getElementById(config.defaultKeyInputId);
                if (keyEl) keyEl.value = config.defaultParamKeyBase;
                if (valEl) valEl.value = '';
            });
            msConditionalParamsConfig.forEach(config => {
                const keyEl = document.getElementById(`${config.idPrefix}-key`);
                const valEl = document.getElementById(config.valueInputId);
                if (keyEl) keyEl.value = config.defaultParamKeyBase;
                if (valEl) valEl.value = '';
            });
            if(resultContainer) resultContainer.classList.add('hidden');
            if(generatedUrlText) generatedUrlText.textContent = '';
            if(copyMessageEl) copyMessageEl.style.display = 'none';
            if(copyErrorEl) copyErrorEl.style.display = 'none';
            const firstStandardValueInput = document.getElementById(`${standardTrackingParamsConfig[0].idPrefix}-value`);
            if (firstStandardValueInput) firstStandardValueInput.focus();
            if (accordionContent && accordionContent.classList.contains('open')) {
                accordionContent.classList.remove('open');
                if(accordionHeader) accordionHeader.setAttribute('aria-expanded', 'false');
                if (accordionArrow) { 
                    const icon = accordionArrow.querySelector('i');
                    if(icon) icon.setAttribute('data-lucide', 'chevron-right');
                    accordionArrow.classList.remove('open');
                }
            }
            if(paramsSearchInput) {
                 paramsSearchInput.value = '';
                 filterAccordionItems(paramsSearchInput, accordionContent);
            }
            initLucideIcons();
            generateTrackingString();
        }

        function addInputListeners() {
            const elementsToWatch = [];
            standardTrackingParamsConfig.forEach(config => {
                elementsToWatch.push(document.getElementById(`${config.idPrefix}-value`));
            });
            valueTrackMsParamsConfig.forEach(config => elementsToWatch.push(document.getElementById(config.id)));
            paramsWithDefaultConfig.forEach(config => {
                elementsToWatch.push(document.getElementById(`${config.idPrefix}-key`));
                elementsToWatch.push(document.getElementById(config.defaultKeyInputId));
            });
            msConditionalParamsConfig.forEach(config => {
                elementsToWatch.push(document.getElementById(`${config.idPrefix}-key`));
                elementsToWatch.push(document.getElementById(config.valueInputId));
            });
            elementsToWatch.forEach(el => {
                if (el) {
                    const eventType = (el.type === 'checkbox' || el.type === 'radio') ? 'change' : 'input';
                    el.addEventListener(eventType, generateTrackingString);
                }
            });
        }

        function filterAccordionItems(searchInput, contentContainer) {
            if (!searchInput || !contentContainer) return;
            const filterText = searchInput.value.toLowerCase().trim();
            contentContainer.querySelectorAll('.grid > div, .flex.items-center, .param-field').forEach(itemContainer => {
                const label = itemContainer.querySelector('label');
                const itemText = label ? label.textContent.toLowerCase() : itemContainer.textContent.toLowerCase();
                if (itemText.includes(filterText)) {
                    itemContainer.style.display = '';
                } else {
                    itemContainer.style.display = 'none';
                }
            });
        }
        
        function init() {
            if (builderInitialized) return;
            console.log("Initializing Microsoft Ads Builder");
            if (!standardParamsContainer || !checkboxParamsContainer || !defaultValueParamsContainer || !conditionalMsParamsContainer) {
                console.error("Microsoft Ads Builder: Critical parameter containers not found. Cannot initialize.");
                return;
            }
            populateMsAdsParams();
            setupAccordion(accordionHeader, accordionContent, accordionArrow); 
            generateTrackingString(); 
            if(generateBtn) generateBtn.addEventListener('click', generateTrackingString);
            if(copyBtn && generatedUrlText) copyBtn.addEventListener('click', () => copyToClipboard(generatedUrlText.textContent, copyMessageEl, copyErrorEl));
            if(resetBtn) resetBtn.addEventListener('click', resetFields);
            if(paramsSearchInput && accordionContent) paramsSearchInput.addEventListener('input', () => filterAccordionItems(paramsSearchInput, accordionContent));
            builderInitialized = true;
            console.log("Microsoft Ads Builder Initialized");
        }
        return { 
            init, 
            isInitialized: () => builderInitialized,
            generateTrackingString 
        };
    })();

    // --- META (FACEBOOK) ADS UTM BUILDER ---
    const metaAdsBuilder = (() => {
        const websiteUrlInput = document.getElementById('meta-websiteUrl');
        const websiteUrlError = document.getElementById('meta-websiteUrl-error');
        const utmSourceInput = document.getElementById('meta-utmSource');
        const utmSourceDropdown = document.getElementById('meta-utmSource-dropdown');
        const utmMediumInput = document.getElementById('meta-utmMedium');
        const utmMediumDropdown = document.getElementById('meta-utmMedium-dropdown');
        const utmCampaignInput = document.getElementById('meta-utmCampaign');
        const utmCampaignDropdown = document.getElementById('meta-utmCampaign-dropdown');
        const utmTermInput = document.getElementById('meta-utmTerm');
        const utmContentInput = document.getElementById('meta-utmContent');
        const utmContentDropdown = document.getElementById('meta-utmContent-dropdown');
        const customParamsContainer = document.getElementById('meta-customParamsContainer');
        const addCustomParamButton = document.getElementById('meta-addCustomParam');
        const generatedUrlTextarea = document.getElementById('meta-generatedUrl');
        const copyUrlButton = document.getElementById('meta-copyUrlButton');
        const copySuccessMessageEl = document.getElementById('meta-copy-message-success');
        const copyErrorMessageEl = document.getElementById('meta-copy-message-error');
        const autoParamsAccordionHeader = document.getElementById('meta-autoParamsAccordionHeader');
        const autoParamsAccordionContent = document.getElementById('meta-autoParamsAccordionContent');
        const autoParamsAccordionArrow = autoParamsAccordionHeader ? autoParamsAccordionHeader.querySelector('.accordion-arrow') : null;
        const dynamicPlaceholdersAccordionHeader = document.getElementById('meta-dynamicPlaceholdersAccordionHeader');
        const dynamicPlaceholdersAccordionContent = document.getElementById('meta-dynamicPlaceholdersAccordionContent');
        const dynamicPlaceholdersAccordionArrow = dynamicPlaceholdersAccordionHeader ? dynamicPlaceholdersAccordionHeader.querySelector('.accordion-arrow') : null;
        const siteSourceAccordionHeader = document.getElementById('meta-siteSourceAccordionHeader');
        const siteSourceAccordionContent = document.getElementById('meta-siteSourceAccordionContent');
        const siteSourceAccordionArrow = siteSourceAccordionHeader ? siteSourceAccordionHeader.querySelector('.accordion-arrow') : null;
        const placementAccordionHeader = document.getElementById('meta-placementAccordionHeader');
        const placementAccordionContent = document.getElementById('meta-placementAccordionContent');
        const placementAccordionArrow = placementAccordionHeader ? placementAccordionHeader.querySelector('.accordion-arrow') : null;
        const notesAccordionHeader = document.getElementById('meta-notesAccordionHeader');
        const notesAccordionContent = document.getElementById('meta-notesAccordionContent');
        const notesAccordionArrow = notesAccordionHeader ? notesAccordionHeader.querySelector('.accordion-arrow') : null;
        let customParamCount = 0;
        let builderInitialized = false;

        const metaDynamicValues = {
            source: ["{{site_source_name}}", "fb", "ig", "msg", "an", "facebook", "instagram"],
            medium: ["paid", "{{placement}}", "cpc", "social", "social-paid"],
            campaign: ["{{campaign.name}}", "{{campaign.id}}"],
            content: ["{{ad.name}}", "{{ad.id}}", "{{adset.name}}", "{{adset.id}}"]
        };
        
        function validateMetaBaseUrl() {
            if (!websiteUrlInput || !websiteUrlError) return true;
            const url = websiteUrlInput.value.trim();
            const isValid = url === '' || url.startsWith('http://') || url.startsWith('https://');
            if (isValid || url === '') { 
                websiteUrlError.style.display = 'none';
                websiteUrlInput.classList.remove('border-red-500', 'dark:border-red-500');
            } else {
                websiteUrlError.style.display = 'block';
                websiteUrlInput.classList.add('border-red-500', 'dark:border-red-500');
            }
            return isValid;
        }

        function buildUrl() {
            if (!websiteUrlInput || !generatedUrlTextarea) return;
            const isBaseValid = validateMetaBaseUrl(); 
            let baseUrl = websiteUrlInput.value.trim();
            if (!baseUrl) {
                generatedUrlTextarea.value = 'Please enter a Website URL.';
                if(copyUrlButton) copyUrlButton.disabled = true;
                return;
            }
            if (!isBaseValid) { 
                 generatedUrlTextarea.value = 'Website URL must start with http:// or https://';
                 if(copyUrlButton) copyUrlButton.disabled = true;
                 return;
            }
            const params = new URLSearchParams();
            const addParam = (key, valueInput) => {
                const value = valueInput ? valueInput.value.trim() : '';
                if (value) params.append(key, value);
            };
            addParam('utm_source', utmSourceInput);
            addParam('utm_medium', utmMediumInput);
            addParam('utm_campaign', utmCampaignInput);
            addParam('utm_term', utmTermInput);
            addParam('utm_content', utmContentInput);
            if (customParamsContainer) {
                customParamsContainer.querySelectorAll('.meta-custom-param-row').forEach(row => {
                    const keyInput = row.querySelector('.meta-custom-key');
                    const valueInput = row.querySelector('.meta-custom-value');
                    const key = keyInput ? keyInput.value.trim() : '';
                    const value = valueInput ? valueInput.value.trim() : '';
                    if (key && value) params.append(key, value);
                });
            }
            let queryString = params.toString();
            queryString = queryString.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');
            queryString = queryString.replace(/%7B/g, '{').replace(/%7D/g, '}');
            if (queryString) {
                generatedUrlTextarea.value = baseUrl + (baseUrl.includes('?') ? (baseUrl.endsWith('?') ? '' : '&') : '?') + queryString;
            } else {
                generatedUrlTextarea.value = baseUrl;
            }
            if(copyUrlButton) copyUrlButton.disabled = false; 
        }

        function populateMetaCombobox(inputElement, dropdownElement, suggestionsArray, filter = '') {
            if (!inputElement || !dropdownElement) return;
            dropdownElement.innerHTML = '';
            const filterLower = filter.toLowerCase().trim();
            let count = 0;
            const filteredSuggestions = suggestionsArray.filter(suggestion =>
                !filterLower || suggestion.toLowerCase().includes(filterLower)
            );
            filteredSuggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.classList.add('combobox-dropdown-item');
                item.textContent = suggestion;
                item.addEventListener('mousedown', () => { 
                    inputElement.value = suggestion;
                    dropdownElement.classList.add('hidden');
                    buildUrl(); 
                });
                dropdownElement.appendChild(item);
                count++;
            });
            if (count > 0 && document.activeElement === inputElement) {
                dropdownElement.classList.remove('hidden');
            } else {
                dropdownElement.classList.add('hidden');
            }
        }

        function setupMetaCombobox(inputElement, dropdownElement, suggestionsArray) {
            if (!inputElement || !dropdownElement) return;
            inputElement.addEventListener('focus', () => populateMetaCombobox(inputElement, dropdownElement, suggestionsArray, inputElement.value));
            inputElement.addEventListener('input', () => {
                populateMetaCombobox(inputElement, dropdownElement, suggestionsArray, inputElement.value);
                buildUrl(); 
            });
            inputElement.addEventListener('blur', () => {
                setTimeout(() => { if(dropdownElement) dropdownElement.classList.add('hidden'); }, 150); 
            });
        }

        function addCustomMetaParam() {
            if (!customParamsContainer) return;
            customParamCount++;
            const newParamRow = document.createElement('div');
            newParamRow.className = 'flex gap-2 items-center meta-custom-param-row mb-3';
            newParamRow.innerHTML = `
                <input type="text" data-id="${customParamCount}" name="meta_custom_key_${customParamCount}" placeholder="Parameter Key" class="meta-custom-key w-2/5 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <span class="text-gray-500 dark:text-gray-400">=</span>
                <input type="text" data-id="${customParamCount}" name="meta_custom_value_${customParamCount}" placeholder="Parameter Value (e.g., value or {{ad.id}})" class="meta-custom-value flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <button type="button" class="meta-remove-custom-param text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 font-semibold py-1 px-2 rounded-md text-sm" aria-label="Remove custom parameter">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            customParamsContainer.appendChild(newParamRow);
            newParamRow.querySelectorAll('input').forEach(input => input.addEventListener('input', buildUrl));
            newParamRow.querySelector('.meta-remove-custom-param').addEventListener('click', (e) => {
                e.currentTarget.closest('.meta-custom-param-row').remove();
                buildUrl();
            });
            initLucideIcons(); 
            buildUrl(); 
        }
        
        function init() {
            if (builderInitialized) return;
            console.log("Initializing Meta Ads Builder");
            if (!websiteUrlInput || !utmSourceInput || !utmMediumInput || !utmCampaignInput || !utmContentInput ||
                !customParamsContainer || !addCustomParamButton || !generatedUrlTextarea || !copyUrlButton) {
                console.error("Meta Ads Builder: Essential DOM elements missing. Cannot initialize.");
                if (generatedUrlTextarea) generatedUrlTextarea.value = "Error: Tool configuration incomplete.";
                return;
            }
            const inputsToWatchForBuildUrl = [websiteUrlInput, utmTermInput]; 
            inputsToWatchForBuildUrl.forEach(el => { if (el) el.addEventListener('input', buildUrl); });
            if(websiteUrlInput) websiteUrlInput.addEventListener('input', validateMetaBaseUrl);
            setupMetaCombobox(utmSourceInput, utmSourceDropdown, metaDynamicValues.source);
            setupMetaCombobox(utmMediumInput, utmMediumDropdown, metaDynamicValues.medium);
            setupMetaCombobox(utmCampaignInput, utmCampaignDropdown, metaDynamicValues.campaign);
            setupMetaCombobox(utmContentInput, utmContentDropdown, metaDynamicValues.content);
            if (addCustomParamButton) addCustomParamButton.addEventListener('click', addCustomMetaParam);
            if (copyUrlButton && generatedUrlTextarea) copyUrlButton.addEventListener('click', () => {
                if(!copyUrlButton.disabled && generatedUrlTextarea.value){
                    copyToClipboard(generatedUrlTextarea.value, copySuccessMessageEl, copyErrorMessageEl);
                }
            });
            setupAccordion(autoParamsAccordionHeader, autoParamsAccordionContent, autoParamsAccordionArrow);
            setupAccordion(dynamicPlaceholdersAccordionHeader, dynamicPlaceholdersAccordionContent, dynamicPlaceholdersAccordionArrow);
            setupAccordion(siteSourceAccordionHeader, siteSourceAccordionContent, siteSourceAccordionArrow);
            setupAccordion(placementAccordionHeader, placementAccordionContent, placementAccordionArrow);
            setupAccordion(notesAccordionHeader, notesAccordionContent, notesAccordionArrow);
             document.addEventListener('click', function(event) {
                const metaTabActive = document.getElementById('metaAdsTabContent')?.classList.contains('active');
                if (!metaTabActive || !builderInitialized) return;
                const activeComboboxInput = document.querySelector('#metaAdsTabContent .combobox-container input:focus');
                document.querySelectorAll('#metaAdsTabContent .combobox-dropdown').forEach(dropdown => {
                    const container = dropdown.closest('.combobox-container');
                    if (container && !container.contains(event.target) &&
                        (!activeComboboxInput || container !== activeComboboxInput.closest('.combobox-container'))) {
                         dropdown.classList.add('hidden');
                    }
                });
            });
            buildUrl(); 
            builderInitialized = true;
            console.log("Meta Ads Builder Initialized");
        }
        return { 
            init, 
            isInitialized: () => builderInitialized,
            buildUrl 
        };
    })();

    // --- TAB SWITCHING LOGIC ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.tab;
            const targetTabContentId = targetTabId + "Content";
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            const activeContent = document.getElementById(targetTabContentId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
            if (targetTabId === 'ga4Tab' && typeof ga4Builder !== 'undefined' && !ga4Builder.isInitialized()) ga4Builder.init();
            else if (targetTabId === 'googleAdsTab' && typeof googleAdsBuilder !== 'undefined' && !googleAdsBuilder.isInitialized()) googleAdsBuilder.init();
            else if (targetTabId === 'microsoftAdsTab' && typeof microsoftAdsBuilder !== 'undefined' && !microsoftAdsBuilder.isInitialized()) microsoftAdsBuilder.init();
            else if (targetTabId === 'metaAdsTab' && typeof metaAdsBuilder !== 'undefined' && !metaAdsBuilder.isInitialized()) metaAdsBuilder.init();
            initLucideIcons(); 
        });
    });

    // --- GLOBAL INITIALIZATION ---
    applySavedTheme(); 
    setCurrentDateAndYear();
    initLucideIcons(); 
    populateConfigSelect(); 
    if(saveConfigBtn && configNameInput) {
        saveConfigBtn.addEventListener('click', () => {
            const name = configNameInput.value.trim();
            const activeTabId = document.querySelector('.tab-button.active')?.dataset.tab;
            if (name && activeTabId) {
                const dataToSave = collectFormDataForActiveTab();
                if (dataToSave) {
                    dataToSave._tabId = activeTabId; 
                    saveCurrentConfig(name, dataToSave);
                    configNameInput.value = ''; 
                } else {
                    showConfigFeedback("Could not collect data from the active tab.", false);
                }
            } else if (!name) {
                showConfigFeedback("Please enter a name for the configuration.", false);
            } else {
                showConfigFeedback("No active tab found to save configuration from.", false);
            }
        });
    }

    if(loadConfigBtn && loadConfigSelect) {
        loadConfigBtn.addEventListener('click', () => {
            const selectedName = loadConfigSelect.value;
            if (selectedName) {
                const configs = getSavedConfigs();
                const configToLoad = configs[selectedName];
                if (configToLoad && configToLoad._tabId) {
                    const targetTabButton = document.querySelector(`.tab-button[data-tab="${configToLoad._tabId}"]`);
                    if (targetTabButton) {
                        if (!targetTabButton.classList.contains('active')) {
                            targetTabButton.click(); 
                            setTimeout(() => {
                                loadConfig(selectedName);
                            }, 150); 
                        } else {
                            loadConfig(selectedName); 
                        }
                    } else {
                         showConfigFeedback(`Tab "${configToLoad._tabId}" for this config not found.`, false);
                    }
                } else if (configToLoad) { 
                    loadConfig(selectedName);
                } else {
                    showConfigFeedback("Selected configuration not found.", false);
                }
            } else {
                showConfigFeedback("Please select a configuration to load.", false);
            }
        });
    }

    if(deleteConfigBtn && loadConfigSelect) {
        deleteConfigBtn.addEventListener('click', () => {
            const selectedName = loadConfigSelect.value;
            if (selectedName) {
                deleteConfig(selectedName);
            } else {
                showConfigFeedback("Please select a configuration to delete.", false);
            }
        });
    }

    const defaultActiveTab = document.querySelector('.tab-button.active');
    if (defaultActiveTab) {
        const defaultTabId = defaultActiveTab.dataset.tab;
        if (defaultTabId === 'ga4Tab' && typeof ga4Builder !== 'undefined' && !ga4Builder.isInitialized()) ga4Builder.init();
        else if (defaultTabId === 'googleAdsTab' && typeof googleAdsBuilder !== 'undefined' && !googleAdsBuilder.isInitialized()) googleAdsBuilder.init();
        else if (defaultTabId === 'microsoftAdsTab' && typeof microsoftAdsBuilder !== 'undefined' && !microsoftAdsBuilder.isInitialized()) microsoftAdsBuilder.init();
        else if (defaultTabId === 'metaAdsTab' && typeof metaAdsBuilder !== 'undefined' && !metaAdsBuilder.isInitialized()) metaAdsBuilder.init();
    } else if (tabButtons.length > 0) { 
        tabButtons[0].click();
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});

// main.js - Consolidated JavaScript for Unified Marketing URL & Tracking Builder

document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL CONSTANTS & DOM ELEMENTS ---
    // ... (theme toggle, tabs, date/year, config elements - unchanged) ...
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentDateElement = document.getElementById('currentDate');
    const currentYearElement = document.getElementById('currentYear');

    const configNameInput = document.getElementById('configName');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const loadConfigSelect = document.getElementById('loadConfigSelect');
    const loadConfigBtn = document.getElementById('loadConfigBtn');
    const deleteConfigBtn = document.getElementById('deleteConfigBtn');
    const configActionFeedback = document.getElementById('configActionFeedback');
    const CONFIG_STORAGE_KEY = 'utmBuilderConfigurations';

    // --- GLOBAL HELPER FUNCTIONS ---
    // ... (toggleTheme, applySavedTheme, updateThemeIcon, setCurrentDateAndYear, initLucideIcons, copyToClipboard, createTooltip, createInfoIcon, setupAccordion - unchanged) ...
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
        initLucideIcons();
    }
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
    function updateThemeIcon(isDark) {
        if (themeToggleIcon) {
            themeToggleIcon.innerHTML = isDark ?
                '<i data-lucide="sun"></i> Light' :
                '<i data-lucide="moon"></i> Dark';
        }
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }
    function setCurrentDateAndYear() {
        const now = new Date();
        if (currentDateElement) {
            currentDateElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        if (currentYearElement) {
            currentYearElement.textContent = now.getFullYear();
        }
    }
    function initLucideIcons() {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        } else {
            console.warn("Lucide icons library not found or createIcons method is missing.");
        }
    }
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
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed"; 
                textArea.style.opacity = "0"; 
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
    function createTooltip(text) {
        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.textContent = text;
        return tooltipSpan;
    }
    function createInfoIcon() {
        const infoIconSpan = document.createElement('span');
        infoIconSpan.className = 'info-icon'; 
        const iTag = document.createElement('i');
        iTag.setAttribute('data-lucide', 'info');
        iTag.className = 'w-4 h-4 info-icon-svg-tag'; 
        infoIconSpan.appendChild(iTag);
        return infoIconSpan;
    }
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
                        initLucideIcons(); 
                    }
                }
                if (isOpen) { 
                    setTimeout(() => initLucideIcons(), 0); 
                }
            });
            headerEl.setAttribute('aria-expanded', contentEl.classList.contains('open').toString());
            if (arrowEl) { 
                 const icon = arrowEl.querySelector('i');
                 if(icon) icon.setAttribute('data-lucide', contentEl.classList.contains('open') ? 'chevron-down' : 'chevron-right');
            }
        }
    }

    // --- CONFIGURATION MANAGEMENT ---
    // ... (getSavedConfigs, saveCurrentConfig, loadConfig, deleteConfig, populateConfigSelect, showConfigFeedback, collectFormDataForActiveTab - unchanged) ...
    function getSavedConfigs() {
        return JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)) || {};
    }
    function saveCurrentConfig(name, data) {
        const configs = getSavedConfigs();
        configs[name] = data;
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
        populateConfigSelect();
        showConfigFeedback(`Configuration "${name}" saved.`, true);
    }
    function loadConfig(name) {
        const configs = getSavedConfigs();
        if (configs[name]) {
            const data = configs[name];
            const targetTabId = data._tabId; 
            if (!targetTabId) {
                showConfigFeedback("Configuration is missing tab information. Cannot load.", false);
                return;
            }
            const activeTabButton = document.querySelector(`.tab-button[data-tab="${targetTabId}"]`);
            if (!activeTabButton || !activeTabButton.classList.contains('active')) {
                 showConfigFeedback(`Please switch to the '${targetTabId.replace("Tab", "")}' tab to load this configuration.`, false);
                return;
            }
            Object.keys(data).forEach(elementId => {
                if (elementId === '_tabId') return; 
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
    function populateConfigSelect() {
        if (!loadConfigSelect) return;
        const configs = getSavedConfigs();
        loadConfigSelect.innerHTML = '<option value="">Select a configuration...</option>'; 
        Object.keys(configs).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            loadConfigSelect.appendChild(option);
        });
    }
    function showConfigFeedback(message, success) {
        if (!configActionFeedback) return;
        configActionFeedback.textContent = message;
        configActionFeedback.className = `mt-2 text-sm h-5 ${success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
        setTimeout(() => { configActionFeedback.textContent = ''; }, 3000);
    }
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
        
        let sourceCategoryMap = {}; // Will be loaded from JSON
        let builderInitialized = false;

        const utmParamsConfig = [ /* ... Unchanged ... */ 
            { id: "utm_source", label: "Campaign Source (utm_source)", tooltip: "Identify the advertiser, site, publication, etc. that is sending traffic to your property, for example: google, newsletter4, billboard.", placeholder: "e.g., google, facebook", required: true, core: true, isSearchable: true },
            { id: "utm_medium", label: "Campaign Medium (utm_medium)", tooltip: "The advertising or marketing medium, for example: cpc, banner, email newsletter.", placeholder: "e.g., cpc, email, social", required: true, core: true, isSearchable: true },
            { id: "utm_campaign", label: "Campaign Name (utm_campaign)", tooltip: "The individual campaign name, slogan, promo code, etc. for a product.", placeholder: "e.g., spring_sale", required: true, core: true },
            { id: "utm_content", label: "Campaign Content (utm_content)", tooltip: "Used to differentiate similar content, or links within the same ad. For example, if you have two call-to-action links within the same email message, you can use utm_content and set different values for each so you can tell which version is more effective.", placeholder: "e.g., logolink, text_ad", required: false, core: false },
            { id: "utm_term", label: "Campaign Term (utm_term)", tooltip: "Identify paid search keywords. If you're manually tagging paid keyword campaigns, you should also use utm_term to specify the keyword.", placeholder: "e.g., running+shoes", required: false, core: false },
            { id: "utm_id", label: "Campaign ID (utm_id)", tooltip: "The campaign ID is used to identify a specific campaign or promotion. This is a required key for GA4 data import.", placeholder: "e.g., abc.123", required: false, core: false },
        ];
        const ga4ParamsConfig = [ /* ... Unchanged ... */ 
             { id: "utm_source_platform", label: "Source Platform (utm_source_platform)", tooltip: "The platform where the marketing activity is managed (e.g., 'Google Ads', 'Manual', 'DV360', 'Search Ads 360'). This parameter is collected automatically for Google Ads if auto-tagging is enabled, but can be manually overridden.", placeholder: "e.g., Google Ads", required: false },
             { id: "utm_creative_format", label: "Creative Format (utm_creative_format)", tooltip: "The type of creative (e.g., 'display', 'video', 'search', 'native', 'social_post'). For example, 'display', 'native', 'video', 'search'.", placeholder: "e.g., display_banner_300x250", required: false },
             { id: "utm_marketing_tactic", label: "Marketing Tactic (utm_marketing_tactic)", tooltip: "The targeting criteria applied to a campaign (e.g., 'remarketing', 'prospecting', 'lookalike_audience'). For example, 'remarketing', 'prospecting'.", placeholder: "e.g., remarketing_dynamic", required: false },
        ];
        const allParamIds = [...utmParamsConfig.map(p => p.id), ...ga4ParamsConfig.map(p => p.id)];
        const channels = { /* ... Unchanged ... */ 
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
        const paidMediumRegex = /^(cpc|cpa|cpv|cpl|cpp|cpd|cpn|ecpc|ppc|retargeting|.*paid.*)$/i;
        const emailSourceMediumRegex = /^(email|e[-_\s]?mail)$/i;
        const campaignShopRegex = /^(shop|shopping|.*shop.*|.*shopping.*|organic-shopping|product_listing_organic|feed)$/i;
        const organicVideoMediumRegex = /^(video|.*video.*|organic-video|video_organic|user_generated_video)$/i;
        const organicSocialMediums = ['social', 'social-network', 'social-media', 'sm', 'social network', 'social media', 'social_organic', 'organic_social'];
        const referralMediums = ['referral', 'app', 'link'];
        const displayMediums = ['display', 'banner', 'expandable', 'interstitial', 'cpm'];
        const crossNetworkMediums = ['cross-network', 'demand gen', 'performance max', 'smart shopping'];
        let genericSearchSitesRegex;
        let genericShoppingSitesRegex;
        let genericSocialSitesRegex;
        let genericVideoSitesRegex;

        const mediumSuggestionsBySourceCategory = { /* ... Unchanged ... */ 
          "SOURCE_CATEGORY_SEARCH": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidsearch", "paid_search", "paid-search", "paidsearches", "paidmedia", "paid_media", "paid-media", "organic"],
          "SOURCE_CATEGORY_SOCIAL": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidsocial", "paid_social", "paid-social", "paidmedia", "paid_media", "paid-media", "organic-social", "social-paid", "social-organic", "post", "story", "boost", "social_ad", "sm", "social-network", "social-media", "promoted_post", "social_ads", "social", "social network", "social media"],
          "SOURCE_CATEGORY_VIDEO": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidvideo", "paid_video", "paid-video", "video", "video_ad", "instream", "outstream", "trueview", "bumper_ad", "video_ads", "organic-video", "video_organic", "user_generated_video"],
          "SOURCE_CATEGORY_SHOPPING": ["cpc", "cpa", "cpv", "cpl", "cpp", "cpd", "cpn", "ecpc", "ppc", "retargeting", "paid", "paidshopping", "paid_shopping", "paid-shopping", "shopping", "product_listing_ad", "pla", "feed", "merchant_center", "shopping_ads", "organic-shopping", "product_listing_organic", "shop"],
          "DEFAULT": ["cpc", "ppc", "paid", "email", "e-mail", "e_mail", "e mail", "social", "referral", "link", "app", "display", "banner", "expandable", "interstitial", "cpm", "organic", "qr_code", "push", "notification", "mobile", "mobile_push", "app_notification", "partner", "podcast", "audio", "sms", "retargeting", "video", "shopping", "affiliate", "cross-network", "demand gen", "performance max", "smart shopping", "(not set)", "(none)"]
        };
        const mediumSuggestionsBySourceOverride = { /* ... Unchanged ... */ 
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

        async function loadSourceCategoryMap() {
            try {
                const response = await fetch('source_category_map.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} while fetching source_category_map.json. Ensure the file exists and is accessible.`);
                }
                sourceCategoryMap = await response.json();
                console.log("GA4 Source Category Map loaded successfully.");
                generateSourceCategoryRegexes();
                // Refresh dropdowns if they were already rendered with fallback/loading data
                if (builderInitialized) {
                    const sourceInput = document.getElementById('ga4-utm_source');
                    if (sourceInput) populateSourceDropdown(sourceInput.value);
                     const mediumInput = document.getElementById('ga4-utm_medium');
                    if (mediumInput) populateMediumDropdown(mediumInput.value);
                    updateComplianceFeedback(); // Update prediction with loaded map
                }
            } catch (error) {
                console.error("Could not load GA4 source category map:", error);
                sourceCategoryMap = {}; // Fallback to empty
                generateSourceCategoryRegexes(); // Generate empty/default regexes
                if(complianceFeedbackEl) {
                    complianceFeedbackEl.innerHTML = "<strong>Error:</strong> Could not load GA4 channel data from 'source_category_map.json'. Source/Medium suggestions and channel predictions will use limited defaults. Please ensure the JSON file is correctly placed and valid, and that you are using a local server for testing.";
                    complianceFeedbackEl.className = "feedback-base feedback-error";
                }
            }
        }
        function generateSourceCategoryRegexes() {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (Object.keys(sourceCategoryMap).length === 0) {
                console.warn("sourceCategoryMap is empty. Regexes for site categories will be empty.");
                const emptyPattern = '^()$'; // Matches nothing
                genericSearchSitesRegex = new RegExp(emptyPattern, 'i');
                genericShoppingSitesRegex = new RegExp(emptyPattern, 'i');
                genericSocialSitesRegex = new RegExp(emptyPattern, 'i');
                genericVideoSitesRegex = new RegExp(emptyPattern, 'i');
                return;
            }
            genericSearchSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SEARCH').map(escapeRegex).join('|')})$`, 'i');
            genericShoppingSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SHOPPING').map(escapeRegex).join('|')})$`, 'i');
            genericSocialSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_SOCIAL').map(escapeRegex).join('|')})$`, 'i');
            genericVideoSitesRegex = new RegExp(`^(${Object.keys(sourceCategoryMap).filter(k => sourceCategoryMap[k] === 'SOURCE_CATEGORY_VIDEO').map(escapeRegex).join('|')})$`, 'i');
        }
        function predictGa4Channel(source, medium, campaign) { /* ... Unchanged, but relies on regexes generated by generateSourceCategoryRegexes ... */ 
            source = source ? source.toLowerCase().trim() : "";
            medium = medium ? medium.toLowerCase().trim() : "";
            campaign = campaign ? campaign.toLowerCase().trim() : "";
            const sourceIsDirect = source === "(direct)";
            const mediumIsNoneOrNotSet = medium === "(not set)" || medium === "(none)";
            const isPaid = paidMediumRegex.test(medium);
            const sourceCat = (Object.keys(sourceCategoryMap).length > 0) ? (sourceCategoryMap[source.replace(/^www\./, '')] || sourceCategoryMap[source]) : undefined;
            if (!genericSearchSitesRegex) { // Ensure regexes are initialized
                generateSourceCategoryRegexes();
            }
            if (sourceIsDirect && mediumIsNoneOrNotSet) return "Direct";
            if (campaign.includes("cross-network") || crossNetworkMediums.includes(medium)) return "Cross-network";
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SHOPPING" || (genericShoppingSitesRegex && genericShoppingSitesRegex.test(source)) || campaignShopRegex.test(campaign))) return "Paid Shopping";
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SEARCH" || (genericSearchSitesRegex && genericSearchSitesRegex.test(source)))) return "Paid Search";
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_SOCIAL" || (genericSocialSitesRegex && genericSocialSitesRegex.test(source)))) return "Paid Social";
            if (isPaid && (sourceCat === "SOURCE_CATEGORY_VIDEO" || (genericVideoSitesRegex && genericVideoSitesRegex.test(source)))) return "Paid Video";
            if (isPaid) return "Paid Other"; 
            if (displayMediums.includes(medium)) return "Display";
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SHOPPING" || (genericShoppingSitesRegex && genericShoppingSitesRegex.test(source)) || campaignShopRegex.test(campaign))) return "Organic Shopping";
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SOCIAL" || (genericSocialSitesRegex && genericSocialSitesRegex.test(source)) || organicSocialMediums.includes(medium))) return "Organic Social";
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_VIDEO" || (genericVideoSitesRegex && genericVideoSitesRegex.test(source)) || organicVideoMediumRegex.test(medium))) return "Organic Video";
            if (!isPaid && (sourceCat === "SOURCE_CATEGORY_SEARCH" || (genericSearchSitesRegex && genericSearchSitesRegex.test(source)) || medium === "organic")) return "Organic Search";
            if (emailSourceMediumRegex.test(source) || emailSourceMediumRegex.test(medium)) return "Email";
            if (medium === "affiliate" || medium === "affiliates" || medium === "partner") return "Affiliates";
            if (referralMediums.includes(medium)) return "Referral";
            if (medium === "audio" || medium === "podcast_ad" || medium === "streaming_audio_ad") return "Audio";
            if (source === "sms" || medium === "sms" || medium === "text_message") return "SMS";
            if (medium.endsWith("push") || medium.includes("mobile") || medium.includes("notification") || source === "firebase" || medium === "web_push") return "Mobile Push Notifications";
            return "Unassigned";
        }
        function createUtmInput(id, labelText, tooltipText, placeholder, isRequired = false, isSearchable = false) { /* ... Unchanged ... */ 
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
                        <i id="${warningIconId}" data-lucide="alert-triangle" class="utm-warning-icon" style="display: none;"></i>
                        <span id="${warningTooltipTextId}" class="tooltiptext utm-warning-tooltiptext">Contains spaces. Consider replacing with underscores (_) or hyphens (-).</span>
                    </span>
                 </label>
                ${inputHtml}
            </div>`;
        }
        function renderInputs() { /* ... Unchanged ... */ 
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
        function populateChannelDropdown() { /* ... Unchanged ... */ 
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
        function updateChannelInfo() { /* ... Unchanged ... */ 
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
        function validateBaseUrl() { /* ... Unchanged ... */ 
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
        function checkUtmInputForSpaces(inputElement) { /* ... Unchanged ... */ 
            if (!inputElement) return;
            const value = inputElement.value;
            const warningIcon = document.getElementById(`${inputElement.id}-warning`);
            const formGroup = inputElement.closest('.form-group'); 
            const warningTrigger = formGroup ? formGroup.querySelector('.utm-warning-trigger') : null;
            if (warningIcon && warningTrigger) {
                 const hasSpace = /\s/.test(value);
                 warningIcon.style.display = hasSpace ? 'inline-block' : 'none';
                 if (hasSpace) initLucideIcons(); 
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

            if (Object.keys(sourceCategoryMap).length === 0 && !filter) { // If map is empty and no filter, show loading/error
                dropdown.innerHTML = '<div class="combobox-dropdown-item text-gray-400">Source list unavailable or loading...</div>';
                dropdown.classList.remove('hidden');
                return;
            }

            if (selectedChannelData && selectedChannelName !== "") {
                if (Array.isArray(selectedChannelData.ga4RecommendedSources) && selectedChannelData.ga4RecommendedSources.length > 0) {
                    sourceSuggestions = selectedChannelData.ga4RecommendedSources;
                } else if (selectedChannelData.targetSourceCategory && Object.keys(sourceCategoryMap).length > 0) {
                    sourceSuggestions = Object.keys(sourceCategoryMap).filter(
                        source => sourceCategoryMap[source] === selectedChannelData.targetSourceCategory
                    );
                } else if (Object.keys(sourceCategoryMap).length > 0) { 
                     sourceSuggestions = Object.keys(sourceCategoryMap).sort();
                } else { 
                    sourceSuggestions = ["(direct)", "google", "facebook", "bing", "newsletter"]; // Fallback if map still empty
                }
            } else { 
                 if (Object.keys(sourceCategoryMap).length > 0) {
                    sourceSuggestions = Object.keys(sourceCategoryMap).sort();
                 } else {
                    sourceSuggestions = ["(direct)", "google", "facebook", "bing", "newsletter"]; // Fallback if map still empty
                 }
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
        function populateMediumDropdown(filter = '') { /* ... Unchanged (relies on sourceCategoryMap indirectly via channel data or overrides) ... */ 
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
                    const sourceCategory = (Object.keys(sourceCategoryMap).length > 0) ? (sourceCategoryMap[currentSourceValue] || (currentSourceValue ? sourceCategoryMap[currentSourceValue.replace(/^www\./,'')] : null)) : null;
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
        function updateComplianceFeedback() { /* ... Unchanged ... */ 
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
                // If sourceCategoryMap is empty, this message will be overridden by the loadSourceCategoryMap error.
                if (Object.keys(sourceCategoryMap).length > 0 || (sourceCategoryMap.length === undefined && Object.keys(sourceCategoryMap).length === 0 && !complianceFeedbackEl.classList.contains('feedback-error') ) ) {
                    complianceFeedbackEl.innerHTML = "Enter at least Source and Medium to see GA4 channel prediction.";
                    complianceFeedbackEl.className = "feedback-base feedback-info";
                }
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
            // Only update if not already showing a critical load error
            if (!complianceFeedbackEl.classList.contains('feedback-error') || (Object.keys(sourceCategoryMap).length > 0) ) {
                 complianceFeedbackEl.innerHTML = feedbackText;
                 complianceFeedbackEl.className = `feedback-base ${feedbackClass}`;
            }
        }
        function generateUrl() { /* ... Unchanged ... */ 
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
        function toggleOptionalParameters() { /* ... Unchanged ... */ 
            if (!optionalParamsSection || !toggleArrowSpan) return;
            const isHidden = optionalParamsSection.classList.toggle('hidden');
            toggleArrowSpan.classList.toggle('open', !isHidden);
            const arrowIcon = toggleArrowSpan.querySelector('i');
            if(arrowIcon) arrowIcon.setAttribute('data-lucide', !isHidden ? 'chevron-up' : 'chevron-down');
            if (!isHidden) { 
                initLucideIcons(); 
            }
        }
        function addInputListeners() { /* ... Unchanged ... */ 
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
        function handleAnalyzeUrl() { /* ... Unchanged ... */ 
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
        
        async function init() {
            if (builderInitialized) return;
            console.log("Initializing GA4 UTM Builder & URL Analyzer");

            await loadSourceCategoryMap(); 

            if (coreUtmInputsContainer && optionalUtmInputsContainer && ga4InputsContainer) {
                renderInputs();
            } else {
                console.error("GA4 Builder: Critical input containers not found. Cannot render inputs.");
                return; 
            }
            populateChannelDropdown();
            updateChannelInfo(); 
            generateUrl(); 
            
            if (complianceFeedbackEl && (Object.keys(sourceCategoryMap).length > 0 || !complianceFeedbackEl.classList.contains('feedback-error'))) {
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
                if (!ga4TabActive || !ga4Builder.isInitialized()) return;
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
    // ... (googleAdsBuilder IIFE - unchanged from utm_builder_js_v3) ...
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
        const valueTrackParamsConfig = [
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
            { id: 'ads-vt_shopping_adtype', paramName: 'adtype', value: '{adtype}', group: 'shopping', label: 'adtype (shopping)', tooltip: 'Shopping ad type: pla, pla_multichannel, pla_with_promotion, pla_with_pog.' },
            { id: 'ads-vt_merchant_id', paramName: 'merchant_id', value: '{merchant_id}', group: 'shopping', label: 'merchant_id', tooltip: 'Merchant Center account ID.' },
            { id: 'ads-vt_product_channel', paramName: 'product_channel', value: '{product_channel}', group: 'shopping', label: 'product_channel', tooltip: '"online" or "local".' },
            { id: 'ads-vt_product_id', paramName: 'product_id', value: '{product_id}', group: 'shopping', label: 'product_id', tooltip: 'Product ID from Merchant Center.' },
            { id: 'ads-vt_product_country', paramName: 'product_country', value: '{product_country}', group: 'shopping', label: 'product_country', tooltip: 'Country of sale for the product.' },
            { id: 'ads-vt_product_language', paramName: 'product_language', value: '{product_language}', group: 'shopping', label: 'product_language', tooltip: 'Language of product information.' },
            { id: 'ads-vt_product_partition_id', paramName: 'product_partition_id', value: '{product_partition_id}', group: 'shopping', label: 'product_partition_id', tooltip: 'Unique ID for the product group.' },
            { id: 'ads-vt_store_code', paramName: 'store_code', value: '{store_code}', group: 'shopping', label: 'store_code', tooltip: 'Unique ID of the local store (max 60 chars).' },
            { id: 'ads-vt_sourceid', paramName: 'sourceid', value: '{sourceid}', group: 'video', label: 'sourceid (video)', tooltip: 'ID of the source (e.g., App ID for app promotion in video campaigns).' },
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
            { id: 'ads-vt_random_pmax', paramName: 'random', value: '{random}', group: 'pmax', label: 'random (PMax)', tooltip: 'Random Google-generated number for PMax.' },
        ];
        const conditionalParamsConfig = [ 
            { inputId: 'ads-ifsearch_value', paramFormat: 'ifsearch=[value]', label: 'ifsearch', tooltip: 'Inserts [value] if click is from Search Network. Example: {lpurl}?source={ifsearch:Google Search}', placeholder: 'e.g., search_traffic' },
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
    // ... (microsoftAdsBuilder IIFE - unchanged from utm_builder_js_v3) ...
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
            { idPrefix: 'msads-term',     displayLabel: 'Campaign Term (utm_term)',     defaultKey: 'utm_term', defaultValue: '{keyword:your_default_text}', valuePlaceholder: 'e.g., {keyword:your_fallback_text} or my_static_term' },
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
                if (paramKey) { 
                    if (defaultValue) { 
                        const formattedBingTag = config.bingTagFormat.replace('%default%', defaultValue); 
                        queryParams.push(`${encodeURIComponent(paramKey)}=${formattedBingTag}`);
                    } else if (config.bingTagFormat.includes('%default%')) {
                        // Omit if default value is empty for tags expecting one
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
    // ... (metaAdsBuilder IIFE - unchanged from utm_builder_js_v3) ...
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

/* ============================================
   糖康孪生 - 多语言支持模块 (i18n)
   支持：简体中文、繁体中文、英文、日文、韩文
   ============================================ */

/**
 * 国际化管理器
 */
class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('tk_language') || 'zh-CN';
        this.fallbackLang = 'zh-CN';
        this.translations = {};
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadTranslations();
        this.applyTranslations();
        this.createLanguageSwitcher();
    }

    /**
     * 加载翻译文件
     */
    loadTranslations() {
        this.translations = {
            'zh-CN': {
                // 导航
                'nav.home': '首页',
                'nav.forum': '专家论坛',
                'nav.ai': 'AI智能',
                'nav.data': '全球数据',
                'nav.personal': '个人中心',
                'nav.about': '关于我们',

                // 首页
                'home.hero.title': '糖康孪生平台',
                'home.hero.subtitle': '您的数字健康管家',
                'home.hero.desc': '基于大数据与人工智能，为您提供精准的糖尿病风险预测和个性化健康管理方案',
                'home.hero.btn1': '免费风险评估',
                'home.hero.btn2': '了解更多',

                // 功能
                'feature.risk.title': '智能风险评估',
                'feature.risk.desc': '基于XGBoost+神经网络模型，精准预测糖尿病风险',
                'feature.ai.title': 'AI健康助手',
                'feature.ai.desc': '7×24小时在线，解答您的健康疑问',
                'feature.forum.title': '专家论坛',
                'feature.forum.desc': '与权威专家在线交流，获取专业建议',
                'feature.data.title': '数据可视化',
                'feature.data.desc': '实时数据大屏，掌握健康趋势',

                // 按钮
                'btn.start': '开始使用',
                'btn.learnMore': '了解更多',
                'btn.export': '导出报告',
                'btn.import': '导入数据',
                'btn.save': '保存',
                'btn.cancel': '取消',
                'btn.confirm': '确认',
                'btn.submit': '提交',
                'btn.download': '下载',
                'btn.upload': '上传',

                // 风险等级
                'risk.low': '低风险',
                'risk.medium': '中风险',
                'risk.high': '高风险',

                // 提示
                'toast.success': '操作成功',
                'toast.error': '操作失败',
                'toast.loading': '加载中...',
                'toast.noData': '暂无数据',

                // AI助手
                'ai.title': 'AI健康助手',
                'ai.subtitle': 'Powered by DeepSeek · 国产先进大模型',
                'ai.placeholder': '输入您想咨询的健康问题...',
                'ai.quickQ1': '糖尿病前期有什么症状？',
                'ai.quickQ2': '血糖正常值是多少？',
                'ai.quickQ3': '如何预防糖尿病？',

                // 个人中心
                'profile.title': '个人中心',
                'profile.basicInfo': '基础档案',
                'profile.history': '评估历史',
                'profile.suggestions': '健康建议',
                'profile.exportData': '导出数据',
                'profile.importData': '导入数据',

                // 论坛
                'forum.title': '糖友互助社区',
                'forum.lowRisk': '低风险交流区',
                'forum.mediumRisk': '中风险交流区',
                'forum.highRisk': '高风险专区',
                'forum.expert': '专家面对面',

                // 页面标题
                'page.about': '关于我们',
                'page.contact': '联系我们',
                'page.expert': '专家团队',
                'page.consult': '专家咨询',

                // 底部
                'footer.copyright': '© 2026 糖康孪生平台 - 保留所有权利',
                'footer.privacy': '隐私保护',
                'footer.terms': '用户协议',

                // 设置
                'settings.title': '语言设置',
                'settings.zhCN': '简体中文',
                'settings.zhTW': '繁體中文',
                'settings.en': 'English',
                'settings.ja': '日本語',
                'settings.ko': '한국어'
            },

            'zh-TW': {
                'nav.home': '首頁',
                'nav.forum': '專家論壇',
                'nav.ai': 'AI智慧',
                'nav.data': '全球數據',
                'nav.personal': '個人中心',
                'nav.about': '關於我們',
                'home.hero.title': '糖康孿生平台',
                'home.hero.subtitle': '您的數位健康管家',
                'home.hero.desc': '基於大數據與人工智慧，為您提供精準的糖尿病風險預測和個人化健康管理方案',
                'home.hero.btn1': '免費風險評估',
                'home.hero.btn2': '了解更多',
                'feature.risk.title': '智慧風險評估',
                'feature.risk.desc': '基於XGBoost+神經網路模型，精準預測糖尿病風險',
                'feature.ai.title': 'AI健康助手',
                'feature.ai.desc': '7×24小時在線，解答您的健康疑問',
                'feature.forum.title': '專家論壇',
                'feature.forum.desc': '與權威專家線上交流，獲取專業建議',
                'feature.data.title': '數據視覺化',
                'feature.data.desc': '即時數據大屏，掌握健康趨勢',
                'btn.start': '開始使用',
                'btn.learnMore': '了解更多',
                'btn.export': '匯出報告',
                'btn.import': '匯入資料',
                'risk.low': '低風險',
                'risk.medium': '中風險',
                'risk.high': '高風險',
                'toast.success': '操作成功',
                'toast.error': '操作失敗',
                'ai.title': 'AI健康助手',
                'ai.subtitle': 'Powered by DeepSeek · 國產先進大模型',
                'ai.placeholder': '輸入您想諮詢的健康問題...',
                'profile.title': '個人中心',
                'forum.title': '糖友互助社區',
                'page.about': '關於我們',
                'footer.copyright': '© 2026 糖康孿生平台 - 保留所有權利',
                'settings.title': '語言設定',
                'settings.zhCN': '简体中文',
                'settings.zhTW': '繁體中文',
                'settings.en': 'English',
                'settings.ja': '日本語',
                'settings.ko': '한국어'
            },

            'en': {
                'nav.home': 'Home',
                'nav.forum': 'Expert Forum',
                'nav.ai': 'AI Assistant',
                'nav.data': 'Global Data',
                'nav.personal': 'Profile',
                'nav.about': 'About Us',
                'home.hero.title': 'Tang Kang Twin Platform',
                'home.hero.subtitle': 'Your Digital Health Assistant',
                'home.hero.desc': 'Based on big data and AI, providing accurate diabetes risk prediction and personalized health management solutions',
                'home.hero.btn1': 'Free Risk Assessment',
                'home.hero.btn2': 'Learn More',
                'feature.risk.title': 'Smart Risk Assessment',
                'feature.risk.desc': 'Based on XGBoost + Neural Network model for accurate diabetes risk prediction',
                'feature.ai.title': 'AI Health Assistant',
                'feature.ai.desc': '7×24 online service to answer your health questions',
                'feature.forum.title': 'Expert Forum',
                'feature.forum.desc': 'Connect with authoritative experts online',
                'feature.data.title': 'Data Visualization',
                'feature.data.desc': 'Real-time dashboard to track health trends',
                'btn.start': 'Get Started',
                'btn.learnMore': 'Learn More',
                'btn.export': 'Export Report',
                'btn.import': 'Import Data',
                'risk.low': 'Low Risk',
                'risk.medium': 'Medium Risk',
                'risk.high': 'High Risk',
                'toast.success': 'Success',
                'toast.error': 'Error',
                'ai.title': 'AI Health Assistant',
                'ai.subtitle': 'Powered by DeepSeek',
                'ai.placeholder': 'Ask your health question...',
                'profile.title': 'Personal Center',
                'forum.title': 'Community Forum',
                'page.about': 'About Us',
                'footer.copyright': '© 2026 Tang Kang Twin - All Rights Reserved',
                'settings.title': 'Language Settings',
                'settings.zhCN': 'Simplified Chinese',
                'settings.zhTW': 'Traditional Chinese',
                'settings.en': 'English',
                'settings.ja': 'Japanese',
                'settings.ko': 'Korean'
            },

            'ja': {
                'nav.home': 'ホーム',
                'nav.forum': '専門家フォーラム',
                'nav.ai': 'AIアシスタント',
                'nav.data': 'グローバルデータ',
                'nav.personal': 'プロフィール',
                'nav.about': '会社概要',
                'home.hero.title': '糖康ツインプラットフォーム',
                'home.hero.subtitle': 'あなたのデジタルヘルスアシスタント',
                'home.hero.desc': '大数据とAIに基づき、糖尿病リスク予測とパーソナライズされた健康管理ソリューションを提供',
                'home.hero.btn1': '無料リスク評価',
                'home.hero.btn2': '詳しく見る',
                'feature.risk.title': 'スマートリスク評価',
                'feature.risk.desc': 'XGBoost+ニューラルネットワークモデルで糖尿病リスクを正確に予測',
                'feature.ai.title': 'AI健康管理助手',
                'feature.ai.desc': '7×24時間オンライン、健康に関するご質問にお答えします',
                'btn.start': '始める',
                'btn.export': 'レポート出力',
                'risk.low': '低リスク',
                'risk.medium': '中リスク',
                'risk.high': '高リスク',
                'toast.success': '成功',
                'toast.error': 'エラー',
                'ai.title': 'AI健康管理助手',
                'ai.placeholder': '健康について質問を入力...',
                'profile.title': '個人センター',
                'footer.copyright': '© 2026 糖康ツイン - 全著作権所有',
                'settings.title': '言語設定',
                'settings.zhCN': '簡体字中国語',
                'settings.zhTW': '繁体字中国語',
                'settings.en': '英語',
                'settings.ja': '日本語',
                'settings.ko': '韓国語'
            },

            'ko': {
                'nav.home': '홈',
                'nav.forum': '전문가 포럼',
                'nav.ai': 'AI 도우미',
                'nav.data': '글로벌 데이터',
                'nav.personal': '프로필',
                'nav.about': '회사 소개',
                'home.hero.title': '당강 트윈 플랫폼',
                'home.hero.subtitle': '디지털 건강 관리 도우미',
                'home.hero.desc': '빅데이터와 AI를 기반으로 정확한 당뇨병 위험 예측 및 맞춤형 건강 관리 솔루션 제공',
                'home.hero.btn1': '무료 위험 평가',
                'home.hero.btn2': '자세히 보기',
                'feature.risk.title': '스마트 위험 평가',
                'feature.risk.desc': 'XGBoost + 신경망 모델로 정확한 당뇨병 위험 예측',
                'feature.ai.title': 'AI 건강 도우미',
                'feature.ai.desc': '7×24시간 온라인, 건강 질문에 답변',
                'btn.start': '시작하기',
                'risk.low': '저위험',
                'risk.medium': '중위험',
                'risk.high': '고위험',
                'toast.success': '성공',
                'toast.error': '오류',
                'ai.title': 'AI 건강 도우미',
                'ai.placeholder': '건강 질문 입력...',
                'profile.title': '개인 센터',
                'footer.copyright': '© 2026 당강 트윈 - 모든 권리 보유',
                'settings.title': '언어 설정',
                'settings.zhCN': '중국어 간체',
                'settings.zhTW': '중국어 번체',
                'settings.en': '영어',
                'settings.ja': '일본어',
                'settings.ko': '한국어'
            }
        };
    }

    /**
     * 获取翻译
     * @param {string} key - 翻译键
     * @param {Object} params - 替换参数
     */
    t(key, params = {}) {
        let text = this.translations[this.currentLang]?.[key]
            || this.translations[this.fallbackLang]?.[key]
            || key;

        // 替换参数
        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, v);
        });

        return text;
    }

    /**
     * 切换语言
     * @param {string} lang - 语言代码
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('tk_language', lang);
            this.applyTranslations();
            tk_showToast(this.t('settings.title') + ': ' + this.t(`settings.${lang}`));
        }
    }

    /**
     * 应用翻译到页面
     */
    applyTranslations() {
        // 翻译带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // 翻译带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // 翻译带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });

        // 更新 HTML lang 属性
        document.documentElement.lang = this.currentLang;
    }

    /**
     * 创建语言切换器
     */
    createLanguageSwitcher() {
        // 检查是否已存在
        if (document.getElementById('tk-lang-switcher')) return;

        const switcher = document.createElement('div');
        switcher.id = 'tk-lang-switcher';
        switcher.className = 'tk-lang-switcher';
        switcher.innerHTML = `
            <button class="tk-lang-btn" onclick="tkI18n.toggleMenu()">
                <i class="fas fa-globe"></i>
                <span class="tk-lang-current">${this.getLangName(this.currentLang)}</span>
            </button>
            <div class="tk-lang-menu" id="tk-lang-menu">
                <button onclick="tkI18n.setLanguage('zh-CN')">🇨🇳 简体中文</button>
                <button onclick="tkI18n.setLanguage('zh-TW')">🇭🇰 繁體中文</button>
                <button onclick="tkI18n.setLanguage('en')">🇺🇸 English</button>
                <button onclick="tkI18n.setLanguage('ja')">🇯🇵 日本語</button>
                <button onclick="tkI18n.setLanguage('ko')">🇰🇷 한국어</button>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .tk-lang-switcher {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9998;
                font-family: system-ui, sans-serif;
            }
            .tk-lang-btn {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 14px;
                color: #333;
            }
            .tk-lang-btn:hover {
                background: #f8fafc;
            }
            .tk-lang-menu {
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
                min-width: 140px;
            }
            .tk-lang-menu.show {
                display: block;
            }
            .tk-lang-menu button {
                display: block;
                width: 100%;
                padding: 10px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                color: #333;
            }
            .tk-lang-menu button:hover {
                background: #f1f5f9;
            }
            .tk-lang-menu button:first-child {
                border-radius: 8px 8px 0 0;
            }
            .tk-lang-menu button:last-child {
                border-radius: 0 0 8px 8px;
            }
            @media (max-width: 768px) {
                .tk-lang-switcher {
                    top: 90px;
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(switcher);
    }

    /**
     * 切换语言菜单显示
     */
    toggleMenu() {
        const menu = document.getElementById('tk-lang-menu');
        menu.classList.toggle('show');

        // 点击外部关闭
        const closeHandler = (e) => {
            if (!document.getElementById('tk-lang-switcher').contains(e.target)) {
                menu.classList.remove('show');
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    }

    /**
     * 获取语言名称
     */
    getLangName(code) {
        const names = {
            'zh-CN': '中文',
            'zh-TW': '繁體',
            'en': 'EN',
            'ja': '日本語',
            'ko': '한국어'
        };
        return names[code] || code;
    }
}

// 全局实例
window.tkI18n = new I18nManager();

/* ============================================
   糖康孪生 - 用户行为分析模块
   追踪用户行为、统计使用数据、为产品优化提供依据
   ============================================ */

/**
 * 用户行为分析器
 * 功能：页面访问、按钮点击、功能使用、停留时间等
 */
class UserBehaviorAnalyzer {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.startTime = Date.now();
        this.events = [];
        this.pageViews = new Map();
        this.featureUsage = new Map();
        this.scrollDepth = 0;
        this.isActive = true;

        this.init();
    }

    /**
     * 初始化追踪
     */
    init() {
        // 页面访问追踪
        this.trackPageView();

        // 用户交互追踪
        this.bindEventListeners();

        // 页面停留时间
        this.trackSessionTime();

        // 滚动深度追踪
        this.trackScrollDepth();

        // 页面可见性变化
        this.trackVisibility();

        // 离开页面时发送数据
        window.addEventListener('beforeunload', () => this.flush());

        // 心跳发送数据（每30秒）
        setInterval(() => this.heartbeat(), 30000);
    }

    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取用户ID（从localStorage或生成临时ID）
     */
    getUserId() {
        let uid = localStorage.getItem('tk_user_id');
        if (!uid) {
            uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tk_user_id', uid);
        }
        return uid;
    }

    /**
     * 追踪页面访问
     */
    trackPageView() {
        const page = {
            url: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            deviceType: this.getDeviceType()
        };

        // 更新页面访问计数
        const key = page.url;
        const count = this.pageViews.get(key) || 0;
        this.pageViews.set(key, count + 1);

        this.addEvent('page_view', page);

        // 发送到分析后端
        this.sendToBackend('page_view', page);
    }

    /**
     * 追踪用户交互
     */
    bindEventListeners() {
        // 点击事件
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track], a, button');
            if (!target) return;

            const event = {
                type: 'click',
                element: target.tagName.toLowerCase(),
                id: target.id || null,
                class: target.className || null,
                text: target.textContent?.trim().substring(0, 50) || null,
                href: target.href || null,
                timestamp: new Date().toISOString(),
                x: e.clientX,
                y: e.clientY
            };

            // 追踪特定功能使用
            if (target.dataset.track) {
                this.trackFeature(target.dataset.track);
            }

            // 追踪外部链接
            if (target.href && !target.href.startsWith(window.location.origin)) {
                event.externalLink = true;
            }

            this.addEvent('interaction', event);
        });

        // 搜索行为
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="搜索"], input[placeholder*="查询"]');
        searchInputs.forEach(input => {
            input.addEventListener('search', (e) => {
                this.trackEvent('search', {
                    query: e.target.value,
                    timestamp: new Date().toISOString()
                });
            });
        });

        // 表单提交
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.trackEvent('form_submit', {
                formId: form.id || form.name || 'unknown',
                action: form.action,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * 追踪会话时间
     */
    trackSessionTime() {
        this.sessionStart = Date.now();

        // 每10秒更新一次停留时间
        setInterval(() => {
            const duration = Math.floor((Date.now() - this.sessionStart) / 1000);
            this.trackEvent('session_duration', { duration });
        }, 10000);
    }

    /**
     * 追踪滚动深度
     */
    trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 100];
        let reached = new Set();

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                thresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !reached.has(threshold)) {
                        reached.add(threshold);
                        this.trackEvent('scroll_depth', {
                            depth: threshold,
                            url: window.location.pathname
                        });
                    }
                });
            }
        });
    }

    /**
     * 追踪页面可见性
     */
    trackVisibility() {
        document.addEventListener('visibilitychange', () => {
            const event = {
                type: document.hidden ? 'hidden' : 'visible',
                timestamp: new Date().toISOString()
            };

            if (!document.hidden) {
                // 页面重新可见，刷新开始时间
                this.lastVisible = Date.now();
            } else if (this.lastVisible) {
                // 计算隐藏时长
                event.hiddenDuration = Math.floor((Date.now() - this.lastVisible) / 1000);
            }

            this.addEvent('visibility', event);
        });
    }

    /**
     * 追踪功能使用
     */
    trackFeature(featureName) {
        const count = this.featureUsage.get(featureName) || 0;
        this.featureUsage.set(featureName, count + 1);

        const event = {
            feature: featureName,
            count: count + 1,
            timestamp: new Date().toISOString()
        };

        this.addEvent('feature_usage', event);
        this.sendToBackend('feature_usage', event);
    }

    /**
     * 追踪AI助手使用
     */
    trackAIUsage(question, responseTime, success) {
        const event = {
            type: 'ai_assistant',
            questionLength: question.length,
            responseTime,
            success,
            timestamp: new Date().toISOString()
        };

        this.addEvent('ai_usage', event);
        this.sendToBackend('ai_usage', event);
    }

    /**
     * 追踪预测模型使用
     */
    trackPrediction(inputData, result) {
        const event = {
            type: 'prediction',
            inputFeatures: Object.keys(inputData).length,
            result: result.riskLevel,
            probability: result.probability,
            modelType: result.modelType || 'ensemble',
            timestamp: new Date().toISOString()
        };

        this.addEvent('prediction', event);
        this.sendToBackend('prediction', event);
    }

    /**
     * 通用事件追踪
     */
    trackEvent(eventType, data) {
        const event = {
            type: eventType,
            ...data,
            sessionId: this.sessionId,
            userId: this.userId
        };

        this.addEvent(eventType, event);
    }

    /**
     * 添加事件
     */
    addEvent(type, data) {
        this.events.push({
            type,
            data,
            timestamp: Date.now()
        });

        // 限制内存中的事件数量
        if (this.events.length > 100) {
            this.events = this.events.slice(-50);
        }
    }

    /**
     * 发送数据到后端
     */
    sendToBackend(eventType, data) {
        const payload = {
            sessionId: this.sessionId,
            userId: this.userId,
            eventType,
            data,
            timestamp: new Date().toISOString()
        };

        // 发送到本地存储（演示用）
        this.saveToLocal(payload);

        // 实际项目中可以发送到服务器
        // fetch('/api/analytics/track', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload)
        // });
    }

    /**
     * 保存到本地存储
     */
    saveToLocal(payload) {
        try {
            const key = `tk_analytics_${payload.userId}`;
            let data = JSON.parse(localStorage.getItem(key) || '[]');
            data.push(payload);

            // 限制存储量
            if (data.length > 500) {
                data = data.slice(-200);
            }

            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Analytics localStorage error:', e);
        }
    }

    /**
     * 心跳
     */
    heartbeat() {
        if (!document.hidden) {
            this.trackEvent('heartbeat', {
                activeTime: Math.floor((Date.now() - this.startTime) / 1000),
                pageViews: this.pageViews.size,
                events: this.events.length
            });
        }
    }

    /**
     * 刷新并发送所有数据
     */
    flush() {
        const summary = {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: new Date(this.startTime).toISOString(),
            endTime: new Date().toISOString(),
            totalDuration: Math.floor((Date.now() - this.startTime) / 1000),
            pageViews: Object.fromEntries(this.pageViews),
            featureUsage: Object.fromEntries(this.featureUsage),
            eventCount: this.events.length,
            deviceType: this.getDeviceType()
        };

        this.sendToBackend('session_end', summary);
    }

    /**
     * 获取设备类型
     */
    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
            return ua.includes('tablet') ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

    /**
     * 获取分析报告（供管理员查看）
     */
    getAnalyticsReport() {
        return {
            totalSessions: this.getStoredData().length,
            popularPages: this.getTopPages(),
            topFeatures: this.getTopFeatures(),
            avgSessionDuration: this.getAvgSessionDuration()
        };
    }

    /**
     * 获取存储的数据
     */
    getStoredData() {
        try {
            const key = `tk_analytics_${this.userId}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    }

    /**
     * 获取热门页面
     */
    getTopPages() {
        const pages = {};
        this.getStoredData().forEach(item => {
            if (item.eventType === 'page_view' && item.data?.url) {
                pages[item.data.url] = (pages[item.data.url] || 0) + 1;
            }
        });
        return Object.entries(pages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * 获取热门功能
     */
    getTopFeatures() {
        const features = {};
        this.getStoredData().forEach(item => {
            if (item.eventType === 'feature_usage' && item.data?.feature) {
                features[item.data.feature] = (features[item.data.feature] || 0) + 1;
            }
        });
        return Object.entries(features)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    /**
     * 获取平均会话时长
     */
    getAvgSessionDuration() {
        const sessions = this.getStoredData().filter(item => item.eventType === 'session_end');
        if (sessions.length === 0) return 0;
        const total = sessions.reduce((sum, s) => sum + (s.data?.totalDuration || 0), 0);
        return Math.round(total / sessions.length);
    }
}

// 全局实例
window.tkAnalytics = new UserBehaviorAnalyzer();

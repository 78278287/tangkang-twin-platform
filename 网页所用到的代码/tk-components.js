/* ============================================
   糖康孪生 - 统一导航组件
   ============================================ */

/* 注入统一的导航栏 */
function tk_renderHeader() {
    const headerHTML = `
    <div class="tk-modern-header">
        <a href="index2.html" class="tk-header-logo">
            <img src="images/logo.jpg" alt="Logo" onerror="this.src='https://via.placeholder.com/42/2A64B5/ffffff?text=TK'">
            <span>糖康孪生</span>
        </a>

        <ul class="tk-header-nav">
            <li><a href="index2.html" class="active">首页</a></li>

            <li><a href="cx1.html" class="tk-nav-highlight">糖尿病风险预测系统</a></li>

            <li><a href="ai_assistant.html" class="tk-nav-highlight">AI健康助手</a></li>

            <li class="tk-nav-item">
                <span class="tk-nav-highlight">健康管理系统</span>
                <ul class="tk-dropdown">
                    <li><a href="dati1.html"><i class="fas fa-brain"></i> AI风险健康管理系统</a></li>
                    <li><a href="feature_center.html"><i class="fas fa-th-large"></i> 功能中心</a></li>
                    <li><a href="vital_signs.html"><i class="fas fa-heartbeat"></i> 血压心率</a></li>
                    <li><a href="health_reminders.html"><i class="fas fa-bell"></i> 用药提醒</a></li>
                    <li><a href="family_management.html"><i class="fas fa-users"></i> 家庭管理</a></li>
                    <li><a href="health_quiz.html"><i class="fas fa-graduation-cap"></i> 健康知识测验</a></li>
                </ul>
            </li>

            <li class="tk-nav-item">
                全球数据
                <ul class="tk-dropdown">
                    <li><a href="fenxi.html"><i class="fas fa-globe-asia"></i> 全球数据分析</a></li>
                    <li><a href="data_dashboard.html"><i class="fas fa-chart-pie"></i> 数据可视化大屏</a></li>
                    <li><a href="kepu.html"><i class="fas fa-book-medical"></i> 健康科普</a></li>
                </ul>
            </li>

            <li class="tk-nav-item">
                专家社区
                <ul class="tk-dropdown">
                    <li><a href="luntan.html"><i class="fas fa-shield-alt"></i> 预防糖尿病专区</a></li>
                    <li><a href="luntan-wenzhang.html"><i class="fas fa-smile"></i> 低风险专区</a></li>
                    <li><a href="luntan-zhuanjia.html"><i class="fas fa-user-md"></i> 中风险专区</a></li>
                    <li><a href="luntan-ask.html"><i class="fas fa-exclamation-triangle"></i> 高风险专区</a></li>
                    <li><a href="yiduiyi.html"><i class="fas fa-comments"></i> 专家面对面</a></li>
                </ul>
            </li>

            <li><a href="gerenzx.html">个人中心</a></li>
        </ul>

        <div class="tk-header-actions">
            <a href="denglu.html" class="tk-btn-login">登录</a>
            <a href="denglu.html" class="tk-btn-register">免费注册</a>
        </div>
    </div>
    `;

    // 检查是否已有header placeholder
    let header = document.getElementById('tk-header-placeholder');
    if (header) {
        header.outerHTML = headerHTML;
    }
    // 给 body 加 class 以避让 fixed 导航栏
    document.body.classList.add('tk-page-has-header');
}

/* 注入浮动快捷菜单 */
function tk_renderFloatingMenu() {
    const menuHTML = `
    <div class="tk-floating-menu tk-fab-menu" id="tkFabMenu">
        <div class="tk-fab-overlay" onclick="tk_toggleFab()"></div>
        <div class="tk-fab-items">
            <a href="index2.html" class="tk-fab-item">
                <span class="tk-fab-item-label">平台首页</span>
                <div class="tk-fab-item-icon"><i class="fas fa-home"></i></div>
            </a>
            <a href="feature_center.html" class="tk-fab-item">
                <span class="tk-fab-item-label">功能中心</span>
                <div class="tk-fab-item-icon"><i class="fas fa-th-large"></i></div>
            </a>
            <a href="vital_signs.html" class="tk-fab-item">
                <span class="tk-fab-item-label">血压/心率/体温</span>
                <div class="tk-fab-item-icon"><i class="fas fa-heartbeat"></i></div>
            </a>
            <a href="health_reminders.html" class="tk-fab-item">
                <span class="tk-fab-item-label">健康提醒</span>
                <div class="tk-fab-item-icon"><i class="fas fa-bell"></i></div>
            </a>
            <a href="family_management.html" class="tk-fab-item">
                <span class="tk-fab-item-label">家庭管理</span>
                <div class="tk-fab-item-icon"><i class="fas fa-house-heart"></i></div>
            </a>
            <a href="health_quiz.html" class="tk-fab-item">
                <span class="tk-fab-item-label">健康知识测验</span>
                <div class="tk-fab-item-icon"><i class="fas fa-brain"></i></div>
            </a>
            <a href="luntan.html" class="tk-fab-item">
                <span class="tk-fab-item-label">专家论坛</span>
                <div class="tk-fab-item-icon"><i class="fas fa-comments"></i></div>
            </a>
            <a href="ai_assistant.html" class="tk-fab-item">
                <span class="tk-fab-item-label">AI健康助手</span>
                <div class="tk-fab-item-icon"><i class="fas fa-robot"></i></div>
            </a>
            <a href="data_dashboard.html" class="tk-fab-item">
                <span class="tk-fab-item-label">数据大屏</span>
                <div class="tk-fab-item-icon"><i class="fas fa-tv"></i></div>
            </a>
            <a href="fenxi.html" class="tk-fab-item">
                <span class="tk-fab-item-label">全球数据</span>
                <div class="tk-fab-item-icon"><i class="fas fa-chart-line"></i></div>
            </a>
            <a href="yiduiyi.html" class="tk-fab-item">
                <span class="tk-fab-item-label">专家面对面</span>
                <div class="tk-fab-item-icon"><i class="fas fa-user-md"></i></div>
            </a>
            <a href="gerenzx.html" class="tk-fab-item">
                <span class="tk-fab-item-label">个人中心</span>
                <div class="tk-fab-item-icon"><i class="fas fa-user"></i></div>
            </a>
            <a href="guanyuwm.html" class="tk-fab-item">
                <span class="tk-fab-item-label">关于我们</span>
                <div class="tk-fab-item-icon"><i class="fas fa-info-circle"></i></div>
            </a>
        </div>
        <button class="tk-fab-main" onclick="tk_toggleFab()">
            <i class="fas fa-th"></i>
        </button>
    </div>
    `;

    let menu = document.getElementById('tk-fab-placeholder');
    if (menu) {
        menu.outerHTML = menuHTML;
    }
    tk_bindFabEvents();
}

/* 绑定浮动菜单事件 */
function tk_bindFabEvents() {
    const menu = document.getElementById('tkFabMenu');
    const mainBtn = document.querySelector('.tk-fab-main');
    const overlay = document.querySelector('.tk-fab-overlay');
    
    const toggleMenu = function() {
        if (menu) {
            menu.classList.toggle('active');
        }
    };
    
    if (mainBtn) {
        mainBtn.addEventListener('click', toggleMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
}

/* 切换浮动菜单（保留旧函数名兼容） */
function tk_toggleFab() {
    const menu = document.getElementById('tkFabMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

/* 注入统一页脚 */
function tk_renderFooter() {
    const footerHTML = `
    <footer class="tk-modern-footer">
        <div class="tk-footer-grid">
            <div class="tk-footer-brand">
                <h3><i class="fas fa-heartbeat"></i>糖康孪生平台</h3>
                <p>致力于通过大数据与数字孪生技术，为全球用户提供精准的糖尿病早期风险预测、个性化健康管理方案及权威的专家交流社区。</p>
                <div class="tk-footer-social">
                    <a href="#"><i class="fab fa-weixin"></i></a>
                    <a href="#"><i class="fab fa-weibo"></i></a>
                    <a href="#"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <div class="tk-footer-links">
                <h4>核心功能</h4>
                <ul>
                    <li><a href="luntan.html"><i class="fas fa-comments"></i> 专家论坛</a></li>
                    <li><a href="ai_assistant.html"><i class="fas fa-robot"></i> AI健康助手</a></li>
                    <li><a href="data_dashboard.html"><i class="fas fa-tv"></i> 数据大屏</a></li>
                    <li><a href="fenxi.html"><i class="fas fa-chart-line"></i> 全球数据</a></li>
                </ul>
            </div>
            <div class="tk-footer-links">
                <h4>支持与帮助</h4>
                <ul>
                    <li><a href="guanyuwm.html"><i class="fas fa-building"></i> 关于我们</a></li>
                    <li><a href="yiduiyi.html"><i class="fas fa-user-md"></i> 专家团队</a></li>
                    <li><a href="#"><i class="fas fa-shield-alt"></i> 隐私保护</a></li>
                    <li><a href="#"><i class="fas fa-file-contract"></i> 用户协议</a></li>
                </ul>
            </div>
            <div class="tk-footer-links tk-footer-contact">
                <h4>联系我们</h4>
                <ul>
                    <li><i class="fas fa-envelope"></i> contact@tangkang.com</li>
                    <li><i class="fas fa-phone-alt"></i> 400-123-4567</li>
                    <li><i class="fas fa-map-marker-alt"></i> 数字医疗大厦 12F</li>
                </ul>
            </div>
        </div>
        <div class="tk-footer-bottom">
            &copy; 2026 糖康孪生平台 - 保留所有权利
        </div>
    </footer>
    `;

    let footer = document.getElementById('tk-footer-placeholder');
    if (footer) {
        footer.outerHTML = footerHTML;
    }
}

/* 通用Toast提示 */
function tk_showToast(message) {
    let toast = document.getElementById('tkToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'tkToast';
        toast.className = 'tk-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/* 自动初始化 */
document.addEventListener('DOMContentLoaded', function() {
    // 注入基础CSS
    if (!document.querySelector('link[href="tk-design-system.css"]')) {
        const designLink = document.createElement('link');
        designLink.rel = 'stylesheet';
        designLink.href = 'tk-design-system.css';
        document.head.appendChild(designLink);
    }
    if (!document.querySelector('link[href="tk-floating-menu.css"]')) {
        const fabLink = document.createElement('link');
        fabLink.rel = 'stylesheet';
        fabLink.href = 'tk-floating-menu.css';
        document.head.appendChild(fabLink);
    }

    // 注入组件 - 如果没有占位符则自动创建
    let headerPlaceholder = document.getElementById('tk-header-placeholder');
    // 检查页面是否已经有内联的导航栏（modern-header 或 tk-modern-header）
    const hasInlineHeader = document.querySelector('.modern-header') || document.querySelector('.tk-modern-header');

    if (!headerPlaceholder && !hasInlineHeader) {
        headerPlaceholder = document.createElement('div');
        headerPlaceholder.id = 'tk-header-placeholder';
        document.body.insertBefore(headerPlaceholder, document.body.firstChild);
        tk_renderHeader();
    } else if (headerPlaceholder) {
        tk_renderHeader();
    }

    let footerPlaceholder = document.getElementById('tk-footer-placeholder');
    if (!footerPlaceholder) {
        footerPlaceholder = document.createElement('div');
        footerPlaceholder.id = 'tk-footer-placeholder';
        document.body.appendChild(footerPlaceholder);
    }
    tk_renderFooter();

    let fabPlaceholder = document.getElementById('tk-fab-placeholder');
    if (!fabPlaceholder) {
        fabPlaceholder = document.createElement('div');
        fabPlaceholder.id = 'tk-fab-placeholder';
        document.body.appendChild(fabPlaceholder);
    }
    tk_renderFloatingMenu();

    // 添加页面主样式
    if (!document.body.classList.contains('tk-page')) {
        document.body.classList.add('tk-page');
    }

    // 自动加载桌宠（排除登录页）
    var currentPage = window.location.pathname.split('/').pop() || 'index2.html';
    var excludedPages = ['denglu.html', 'denglv.html'];
    if (excludedPages.indexOf(currentPage) === -1) {
        if (!document.querySelector('link[href*="tk-pet.css"]')) {
            var petCSS = document.createElement('link');
            petCSS.rel = 'stylesheet';
            petCSS.href = 'tk-pet.css?v=18';
            document.head.appendChild(petCSS);
        }
        var petScript = document.createElement('script');
        petScript.src = 'tk-pet.js?v=17';
        document.body.appendChild(petScript);
    }
});

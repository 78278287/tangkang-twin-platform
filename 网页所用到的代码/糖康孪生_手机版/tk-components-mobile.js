/* ============================================
   糖康孪生 - 手机版统一组件
   简化版：只注入页脚（导航已在页面内置）
   ============================================ */

// 注入统一页脚
function tk_renderMobileFooter() {
    const footerHTML = `
    <footer class="tk-mobile-footer">
        <div class="tk-footer-brand">
            <div class="tk-footer-logo">
                <i class="fas fa-heartbeat"></i>
                <span>糖康孪生</span>
            </div>
            <p>您的数字健康管家</p>
        </div>
        <div class="tk-footer-links">
            <h4>外部链接</h4>
            <ul>
                <li><a href="ai_assistant.html" target="_blank"><i class="fas fa-robot"></i> AI健康助手</a></li>
                <li><a href="data_dashboard.html" target="_blank"><i class="fas fa-tv"></i> 数据可视化</a></li>
                <li><a href="fenxi.html" target="_blank"><i class="fas fa-globe-asia"></i> 全球数据</a></li>
                <li><a href="feature_center.html" target="_blank"><i class="fas fa-th-large"></i> 功能中心</a></li>
            </ul>
        </div>
        <div class="tk-footer-links">
            <h4>快速跳转</h4>
            <ul>
                <li><a href="luntan.html" target="_blank"><i class="fas fa-comments"></i> 专家论坛</a></li>
                <li><a href="guanyuwm.html" target="_blank"><i class="fas fa-building"></i> 关于我们</a></li>
                <li><a href="denglu.html" target="_blank"><i class="fas fa-user"></i> 登录注册</a></li>
            </ul>
        </div>
        <div class="tk-footer-bottom">
            <p>&copy; 2025 糖康孪生平台 · 数字健康管家</p>
            <p>中国计算机设计大赛参赛作品</p>
        </div>
    </footer>
    `;

    let footer = document.getElementById('tk-footer-placeholder');
    if (footer) {
        footer.outerHTML = footerHTML;
    }

    // 添加页脚样式
    addMobileFooterStyles();
}

function addMobileFooterStyles() {
    if (document.getElementById('tk-mobile-footer-style')) return;

    const style = document.createElement('style');
    style.id = 'tk-mobile-footer-style';
    style.textContent = `
        .tk-mobile-footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 2rem 1.5rem 1.5rem;
            font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
            margin-top: 2rem;
        }
        .tk-footer-brand {
            text-align: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tk-footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        .tk-footer-logo i {
            color: #3b82f6;
            font-size: 1.5rem;
        }
        .tk-footer-logo span {
            color: white;
            font-size: 1.2rem;
            font-weight: 700;
        }
        .tk-footer-brand p {
            font-size: 0.85rem;
            color: #64748b;
        }
        .tk-footer-links {
            margin-bottom: 1.5rem;
        }
        .tk-footer-links h4 {
            color: white;
            font-size: 0.95rem;
            margin: 0 0 0.8rem 0;
            font-weight: 600;
        }
        .tk-footer-links ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .tk-footer-links li {
            margin-bottom: 0.6rem;
        }
        .tk-footer-links a {
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.2s;
        }
        .tk-footer-links a:hover {
            color: white;
        }
        .tk-footer-links a i {
            color: #3b82f6;
            width: 16px;
        }
        .tk-footer-bottom {
            text-align: center;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .tk-footer-bottom p {
            font-size: 0.8rem;
            color: #475569;
            margin: 4px 0;
        }
    `;
    document.head.appendChild(style);
}

// 页面加载完成后注入页脚
document.addEventListener('DOMContentLoaded', function() {
    // 延迟注入，确保 DOM 完全就绪
    setTimeout(tk_renderMobileFooter, 100);
});

// 加载样式文件
(function() {
    const styles = [
        'tk-floating-menu.css'
    ];
    styles.forEach(function(href) {
        if (!document.querySelector('link[href="' + href + '"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });
})();

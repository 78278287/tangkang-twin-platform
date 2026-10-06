/* ============================================
   糖康孪生 - 比赛演示PPT脚本
   中国计算机设计大赛 大数据赛道
   ============================================ */

/**
 * 演示脚本管理器
 * 提供演示时的操作指引和动画控制
 */
class PresentationScript {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.init();
    }

    init() {
        this.defineSlides();
        this.bindControls();
        this.createDemoPanel();
    }

    /**
     * 定义演示幻灯片内容
     */
    defineSlides() {
        this.slides = [
            // ========== 第1页：封面 ==========
            {
                title: '封面',
                duration: 30,
                speakerNotes: `
【开场白】
尊敬的评委老师、同学们，大家好！
我是来自[学校名称]的参赛团队，今天非常荣幸能够为大家介绍我们的参赛作品——"糖康孪生"。
【过渡】请看大屏幕。
                `,
                highlight: 'logo',
                action: () => this.animateFadeIn('.hero-title, .hero-subtitle')
            },

            // ========== 第2页：项目背景 ==========
            {
                title: '项目背景',
                duration: 60,
                speakerNotes: `
【问题陈述】
糖尿病已成为全球最重要的公共卫生问题之一。
• 中国现有糖尿病患者超过1.4亿，患病率达10.9%
• 糖尿病前期人群约5亿，隐性风险巨大
• 传统筛查方法单一，难以实现个性化精准预测

【痛点分析】
1. 早期症状不明显，等发现时往往已错过最佳干预时机
2. 现有评估工具准确率有限，缺乏个性化建议
3. 患者教育不足，预防意识薄弱

【过渡】那么，我们的项目是如何解决这些问题的呢？
                `,
                highlight: '.bg-stats',
                action: () => this.animateStats()
            },

            // ========== 第3页：核心技术 ==========
            {
                title: '核心技术 - 预测模型',
                duration: 90,
                speakerNotes: `
【技术亮点】
我们采用了业界领先的集成学习方案：

1. 【XGBoost + 神经网络融合模型】
   • 60% XGBoost（梯度提升树）负责捕捉特征交互
   • 40% PyTorch MLP（多层感知机）负责深层特征表达
   • 通过加权融合，兼顾可解释性与预测精度

2. 【输入特征】
   年龄、性别、BMI、血压、空腹血糖、餐后血糖、家族病史等8项关键指标

3. 【模型性能】
   • 准确率 Accuracy: 96.8%
   • 精确率 Precision: 94.2%
   • 召回率 Recall: 95.6%
   • F1-Score: 94.9%
   • AUC: 0.982

【技术亮点】
采用5折分层交叉验证，有效防止过拟合。
                `,
                highlight: '.model-arch',
                action: () => this.animateModel()
            },

            // ========== 第4页：系统功能 ==========
            {
                title: '系统功能展示',
                duration: 120,
                speakerNotes: `
【功能模块】
我们的平台提供了6大核心功能：

1. 【一键风险评估】
   用户输入基本信息，系统30秒内给出风险等级和患病概率

2. 【AI健康助手】
   基于DeepSeek大模型，7×24小时在线解答健康疑问
   支持多轮对话，专业又贴心

3. 【专家论坛】
   分为低/中/高风险三个专区，用户可以找到与自己情况相似的伙伴
   获得专家在线答疑

4. 【数据可视化大屏】
   实时展示平台运营数据、用户健康趋势

5. 【全球数据分析】
   展示全球各国糖尿病患病情况，帮助用户建立大局观

6. 【个人健康档案】
   记录历史评估数据，追踪健康变化趋势

【演示建议】
接下来请现场演示：风险评估功能
                `,
                highlight: '.features-grid',
                action: () => this.animateFeatures()
            },

            // ========== 第5页：AI助手演示 ==========
            {
                title: 'AI健康助手演示',
                duration: 60,
                speakerNotes: `
【演示场景】
评委老师好，接下来我将演示我们的AI健康助手功能。

【现场操作】
1. 打开AI助手页面
2. 输入问题："糖尿病前期有什么症状？"
3. 展示AI的回答（包括专业建议和温馨提示）

【技术说明】
• AI基于DeepSeek国产大模型
• 经过医学知识库微调
• 回答控制在300字以内
• 涉及医疗建议时自动提醒遵医嘱

【问答预设】
如果评委提问，我们可以现场演示更多问题：
• "血糖正常值是多少？"
• "如何预防糖尿病？"
• "糖尿病患者饮食应该注意什么？"
                `,
                highlight: '.ai-chat',
                action: () => this.openPage('ai_assistant.html')
            },

            // ========== 第6页：数据可视化 ==========
            {
                title: '数据可视化大屏',
                duration: 45,
                speakerNotes: `
【数据能力】
平台实时采集和分析用户数据，包括：

1. 【用户统计】
   性别分布、年龄分布、地域分布

2. 【健康指标】
   各症状出现频率、BMI分布、血糖水平分布

3. 【风险趋势】
   不同风险等级占比变化趋势

4. 【功能使用】
   各功能模块访问量、用户留存率

【可视化技术】
• 使用Chart.js实现实时图表渲染
• 响应式设计，支持大屏和移动端
• 数据每5秒自动刷新

【数据安全】
所有数据经过脱敏处理，保护用户隐私。
                `,
                highlight: '.dashboard',
                action: () => this.openPage('data_dashboard.html')
            },

            // ========== 第7页：创新点 ==========
            {
                title: '创新与亮点',
                duration: 60,
                speakerNotes: `
【创新点总结】

1. 【模型创新】
   首创XGBoost+神经网络融合方案，兼顾准确性与可解释性

2. 【场景创新】
   数字孪生理念，为每个用户构建虚拟健康副本

3. 【交互创新】
   AI助手+专家论坛的双层服务体系

4. 【数据创新】
   整合全球糖尿病数据，提供宏观视角的健康认知

5. 【国际化】
   支持中、英、日、韩5种语言，服务全球用户

【竞争优势】
• 准确率领先行业平均水平15%以上
• 完整体验闭环：从评估到管理到跟踪
• 友好的用户体验，适合各年龄段用户
                `,
                highlight: '.innovation',
                action: () => this.animateCountUp()
            },

            // ========== 第8页：技术架构 ==========
            {
                title: '技术架构',
                duration: 45,
                speakerNotes: `
【系统架构】

前端层：
• HTML5 + CSS3（响应式设计）
• JavaScript（交互逻辑）
• Chart.js（数据可视化）

后端层：
• Python Flask（轻量级Web框架）
• PyTorch（神经网络模型）
• XGBoost（梯度提升模型）

数据层：
• SQLite（本地数据存储）
• CSV/JSON（数据导入导出）

【技术选型理由】
• Flask：轻量、灵活、易于部署
• PyTorch：深度学习首选框架，社区活跃
• XGBoost：表格数据处理的业界标准

【扩展能力】
• 支持Docker容器化部署
• 支持横向扩展应对高并发
• API设计遵循RESTful规范
                `,
                highlight: '.architecture',
                action: () => this.animateDiagram()
            },

            // ========== 第9页：未来展望 ==========
            {
                title: '未来展望',
                duration: 45,
                speakerNotes: `
【发展计划】

短期目标（3个月）：
• 接入更多AI能力，如图像识别（糖尿病视网膜病变筛查）
• 增加可穿戴设备数据接入
• 优化模型，进一步提升准确率

中期目标（6个月）：
• 与医院合作，开展临床验证
• 建立用户激励体系，提升活跃度
• 推出会员增值服务

长期愿景（1年）：
• 覆盖更多慢性病病种
• 建立健康大数据中心
• 推动"健康中国"战略落地

【社会价值】
• 提高糖尿病早期发现率
• 减轻医疗系统负担
• 提升公众健康意识
                `,
                highlight: '.roadmap',
                action: () => this.animateTimeline()
            },

            // ========== 第10页：结束语 ==========
            {
                title: '结束语',
                duration: 30,
                speakerNotes: `
【总结】
糖康孪生——用大数据和人工智能守护每一份健康。

我们相信，通过科技的力量，可以让更多人远离糖尿病的威胁。

【致谢】
感谢评委老师的聆听！
感谢团队的辛勤付出！

【联系方式】
• 邮箱：contact@tangkang.com
• 电话：400-123-4567
• 网址：www.tangkang.com

欢迎大家体验我们的产品，也期待与各位评委老师进一步交流！

【Q&A】
现在进入问答环节，请评委老师提问。
                `,
                highlight: '.thank-you',
                action: () => this.animateFadeIn('.thanks-text')
            }
        ];
    }

    /**
     * 绑定控制按钮
     */
    bindControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.prevSlide();
                    break;
                case 'Home':
                    this.goToSlide(0);
                    break;
                case 'End':
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        });
    }

    /**
     * 创建演示控制面板
     */
    createDemoPanel() {
        const panel = document.createElement('div');
        panel.id = 'demo-panel';
        panel.innerHTML = `
            <div class="demo-panel-header">
                <span>演示脚本</span>
                <button onclick="presentationScript.togglePanel()">×</button>
            </div>
            <div class="demo-panel-content">
                <div class="slide-nav">
                    <button onclick="presentationScript.prevSlide()">←</button>
                    <span id="slide-indicator">1 / ${this.slides.length}</span>
                    <button onclick="presentationScript.nextSlide()">→</button>
                </div>
                <div id="slide-content" class="slide-content"></div>
                <div id="speaker-notes" class="speaker-notes"></div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #demo-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 350px;
                max-height: 400px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 99999;
                font-family: system-ui, sans-serif;
                font-size: 13px;
                overflow: hidden;
            }
            .demo-panel-header {
                background: linear-gradient(135deg, #2A64B5, #1A3C75);
                color: white;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
            }
            .demo-panel-header button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.8;
            }
            .demo-panel-header button:hover { opacity: 1; }
            .demo-panel-content { padding: 12px; }
            .slide-nav {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            .slide-nav button {
                background: #f1f5f9;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            .slide-nav button:hover { background: #e2e8f0; }
            #slide-indicator { color: #2A64B5; font-weight: 600; }
            .slide-content {
                background: #f8fafc;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                max-height: 150px;
                overflow-y: auto;
            }
            .slide-content h4 {
                margin: 0 0 8px 0;
                color: #2A64B5;
            }
            .slide-content ul { margin: 0; padding-left: 18px; }
            .slide-content li { margin-bottom: 4px; color: #64748b; }
            .speaker-notes {
                background: #fef3c7;
                border-radius: 8px;
                padding: 12px;
                max-height: 100px;
                overflow-y: auto;
                font-size: 12px;
                white-space: pre-wrap;
                color: #92400e;
            }
            .speaker-notes::before {
                content: '📝 演讲稿：';
                font-weight: 600;
                display: block;
                margin-bottom: 4px;
            }
            #demo-panel.collapsed {
                transform: translateY(calc(100% - 50px));
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(panel);

        this.updatePanel();
    }

    /**
     * 更新面板内容
     */
    updatePanel() {
        const slide = this.slides[this.currentSlide];
        document.getElementById('slide-indicator').textContent =
            `${this.currentSlide + 1} / ${this.slides.length}`;

        const content = document.getElementById('slide-content');
        content.innerHTML = `
            <h4>第${this.currentSlide + 1}页：${slide.title}</h4>
            <ul>
                <li>建议时长：${slide.duration}秒</li>
                <li>按 → 或 空格 下一页</li>
                <li>按 ← 上一页</li>
            </ul>
        `;

        document.getElementById('speaker-notes').textContent = slide.speakerNotes.trim();
    }

    /**
     * 下一页
     */
    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updatePanel();
            const slide = this.slides[this.currentSlide];
            if (slide.action) slide.action();
        }
    }

    /**
     * 上一页
     */
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updatePanel();
            const slide = this.slides[this.currentSlide];
            if (slide.action) slide.action();
        }
    }

    /**
     * 跳转到指定页
     */
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.updatePanel();
            const slide = this.slides[this.currentSlide];
            if (slide.action) slide.action();
        }
    }

    /**
     * 切换面板显示
     */
    togglePanel() {
        document.getElementById('demo-panel').classList.toggle('collapsed');
    }

    // ========== 动画方法 ==========

    animateFadeIn(selector) {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s';
                el.style.opacity = '1';
            }, i * 200);
        });
    }

    animateStats() {
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.target || el.textContent);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + (el.dataset.suffix || '');
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current) + (el.dataset.suffix || '');
                }
            }, 30);
        });
    }

    animateModel() {
        document.querySelectorAll('.model-layer').forEach((el, i) => {
            setTimeout(() => {
                el.style.transform = 'scale(1)';
                el.style.opacity = '1';
            }, i * 300);
        });
    }

    animateFeatures() {
        document.querySelectorAll('.feature-card').forEach((el, i) => {
            setTimeout(() => {
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            }, i * 150);
        });
    }

    animateCountUp() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const duration = 2000;
            const start = performance.now();

            const animate = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = (target * eased).toFixed(1);
                if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        });
    }

    animateDiagram() {
        document.querySelectorAll('.arch-layer').forEach((el, i) => {
            setTimeout(() => {
                el.style.transform = 'translateX(0)';
                el.style.opacity = '1';
            }, i * 400);
        });
    }

    animateTimeline() {
        document.querySelectorAll('.timeline-item').forEach((el, i) => {
            setTimeout(() => {
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            }, i * 300);
        });
    }

    openPage(url) {
        window.open(url, '_blank');
    }
}

// 全局实例
window.presentationScript = new PresentationScript();

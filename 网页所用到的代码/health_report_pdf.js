/* ============================================
   糖康孪生 - 健康报告PDF导出模块
   ============================================ */

/**
 * 健康报告PDF导出功能
 * 使用 html2canvas + jsPDF 将页面内容导出为精美PDF
 */

class HealthReportExporter {
    constructor() {
        this.pdfTitle = '糖康孪生 - 个人健康报告';
        this.logoUrl = 'images/logo.jpg';
    }

    /**
     * 导出当前页面为PDF
     * @param {string} filename - 文件名（不含扩展名）
     */
    async exportCurrentPage(filename = '健康报告') {
        const timestamp = this.formatDate(new Date());
        const fullFilename = `${filename}_${timestamp}.pdf`;

        // 显示加载提示
        tk_showToast('正在生成PDF报告，请稍候...');

        try {
            // 获取页面主要内容区域
            const content = document.querySelector('.tk-container, .container, main, #main');
            if (!content) {
                throw new Error('未找到可导出的内容区域');
            }

            // 使用html2canvas截取内容
            const canvas = await html2canvas(content, {
                scale: 2, // 提高清晰度
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // 创建PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // PDF页面尺寸
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // 计算图片尺寸
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 添加标题
            pdf.setFontSize(18);
            pdf.setTextColor(42, 100, 181);
            pdf.text('糖康孪生 - 个人健康报告', pageWidth / 2, margin + 5, { align: 'center' });

            // 添加日期
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`生成时间：${new Date().toLocaleString('zh-CN')}`, pageWidth / 2, margin + 12, { align: 'center' });

            // 添加分隔线
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, margin + 15, pageWidth - margin, margin + 15);

            // 添加内容图片
            let heightLeft = imgHeight;
            let position = margin + 20;
            const imgData = canvas.toDataURL('image/png');

            // 如果内容超过一页，需要分页
            if (imgHeight + position > pageHeight - margin) {
                // 第一页
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, Math.min(imgHeight, pageHeight - position - margin));
                heightLeft -= (pageHeight - position - margin);

                // 添加后续页面
                while (heightLeft > 0) {
                    pdf.addPage();
                    position = margin;
                    pdf.addImage(imgData, 'PNG', margin, position - (imgHeight - heightLeft), imgWidth, imgHeight);
                    heightLeft -= (pageHeight - margin * 2);
                }
            } else {
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            }

            // 添加页脚
            this.addFooter(pdf);

            // 保存PDF
            pdf.save(fullFilename);

            tk_showToast('PDF报告导出成功！');
        } catch (error) {
            console.error('PDF导出失败:', error);
            tk_showToast('PDF导出失败，请重试');
        }
    }

    /**
     * 生成完整健康报告PDF（带个性化数据）
     * @param {Object} userData - 用户健康数据
     */
    async generateFullReport(userData) {
        tk_showToast('正在生成完整健康报告...');

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            let y = margin;

            // ========== 封面 ==========
            pdf.setFillColor(42, 100, 181);
            pdf.rect(0, 0, pageWidth, 60, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(28);
            pdf.text('糖康孪生', pageWidth / 2, 25, { align: 'center' });
            pdf.setFontSize(16);
            pdf.text('个人健康评估报告', pageWidth / 2, 40, { align: 'center' });

            y = 80;
            pdf.setTextColor(42, 100, 181);
            pdf.setFontSize(14);
            pdf.text(`姓名：${userData.name || '用户'}`, margin, y);
            pdf.text(`评估时间：${this.formatDate(new Date())}`, margin, y + 8);
            pdf.text(`风险等级：${userData.riskLevel || '待评估'}`, margin, y + 16);

            // ========== 风险评估结果 ==========
            y += 40;
            pdf.setFillColor(240, 246, 255);
            pdf.roundedRect(margin, y, pageWidth - margin * 2, 50, 3, 3, 'F');

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.text('📊 风险评估结果', margin + 5, y + 10);

            pdf.setFontSize(12);
            const riskColor = userData.riskLevel === '高风险' ? [220, 38, 38] :
                             userData.riskLevel === '中风险' ? [234, 179, 8] : [34, 197, 94];
            pdf.setTextColor(...riskColor);
            pdf.text(`综合风险等级：${userData.riskLevel || '低风险'}`, margin + 5, y + 25);
            pdf.setTextColor(100, 100, 100);
            pdf.setFontSize(10);
            pdf.text(`患病概率：${userData.probability || '0'}%`, margin + 5, y + 38);
            pdf.text(`建议复查时间：${userData.nextCheck || '3个月后'}`, pageWidth / 2, y + 38);

            // ========== 关键指标 ==========
            y += 65;
            pdf.setTextColor(42, 100, 181);
            pdf.setFontSize(14);
            pdf.text('📋 关键健康指标', margin, y);

            y += 10;
            const indicators = userData.indicators || [
                { name: '空腹血糖', value: '5.2 mmol/L', status: '正常' },
                { name: '餐后血糖', value: '7.8 mmol/L', status: '正常' },
                { name: 'BMI指数', value: '23.5', status: '正常' },
                { name: '血压', value: '120/80 mmHg', status: '正常' }
            ];

            indicators.forEach((item, i) => {
                const x = margin + (i % 2) * (pageWidth - margin * 2) / 2;
                const itemY = y + Math.floor(i / 2) * 18;

                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(x, itemY, (pageWidth - margin * 2) / 2 - 2, 15, 2, 2, 'F');

                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(10);
                pdf.text(item.name, x + 3, itemY + 7);
                pdf.text(`${item.value} (${item.status})`, x + 3, itemY + 12);
            });

            // ========== AI健康建议 ==========
            y += 55;
            pdf.setTextColor(42, 100, 181);
            pdf.setFontSize(14);
            pdf.text('💡 AI健康建议', margin, y);

            y += 8;
            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(10);
            const suggestions = userData.suggestions || [
                '1. 保持均衡饮食，减少高糖高脂食物摄入',
                '2. 坚持每周至少150分钟中等强度运动',
                '3. 定期监测血糖，保持健康体重',
                '4. 保证充足睡眠，避免长期熬夜'
            ];

            suggestions.forEach((s, i) => {
                pdf.text(s, margin, y + i * 7);
            });

            // ========== 页脚 ==========
            this.addFooter(pdf);

            // 保存
            const filename = `健康报告_${userData.name || '用户'}_${this.formatDate(new Date())}.pdf`;
            pdf.save(filename);

            tk_showToast('完整健康报告生成成功！');
        } catch (error) {
            console.error('报告生成失败:', error);
            tk_showToast('报告生成失败，请重试');
        }
    }

    /**
     * 添加页脚
     */
    addFooter(pdf) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('糖康孪生平台 - 您的数字健康管家 | www.tangkang.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('本报告仅供参考，不作为医疗诊断依据', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
    }
}

// 全局实例
window.healthReportExporter = new HealthReportExporter();

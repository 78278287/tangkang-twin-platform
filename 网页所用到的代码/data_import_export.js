/* ============================================
   糖康孪生 - 数据导入导出模块
   支持：JSON、CSV、Excel格式的数据导入导出
   ============================================ */

/**
 * 数据导入导出管理器
 */
class DataImportExport {
    constructor() {
        this.supportedFormats = ['json', 'csv', 'xlsx'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * 导出用户健康数据
     * @param {Object} data - 要导出的数据
     * @param {string} format - 格式：json | csv | xlsx
     */
    async export(data, format = 'json') {
        try {
            tk_showToast(`正在导出${format.toUpperCase()}格式数据...`);

            let content, filename, mimeType;

            switch (format.toLowerCase()) {
                case 'csv':
                    content = this.convertToCSV(data);
                    filename = `健康数据_${this.formatDate()}.csv`;
                    mimeType = 'text/csv;charset=utf-8';
                    this.downloadFile(content, filename, mimeType);
                    break;

                case 'xlsx':
                    // 使用SheetJS导出Excel
                    await this.exportExcel(data);
                    break;

                case 'json':
                default:
                    content = JSON.stringify(data, null, 2);
                    filename = `健康数据_${this.formatDate()}.json`;
                    mimeType = 'application/json';
                    this.downloadFile(content, filename, mimeType);
                    break;
            }

            tk_showToast('数据导出成功！');
        } catch (error) {
            console.error('导出失败:', error);
            tk_showToast('导出失败，请重试');
        }
    }

    /**
     * 导入数据
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 解析后的数据
     */
    async import(file) {
        return new Promise((resolve, reject) => {
            // 验证文件
            if (!this.validateFile(file)) {
                reject(new Error('文件格式或大小不符合要求'));
                return;
            }

            const reader = new FileReader();
            const ext = file.name.split('.').pop().toLowerCase();

            reader.onload = (e) => {
                try {
                    let data;
                    const content = e.target.result;

                    switch (ext) {
                        case 'csv':
                            data = this.parseCSV(content);
                            break;
                        case 'xlsx':
                        case 'xls':
                            data = this.parseExcel(content);
                            break;
                        case 'json':
                        default:
                            data = JSON.parse(content);
                            break;
                    }

                    // 验证数据格式
                    if (this.validateImportedData(data)) {
                        tk_showToast('数据导入成功！');
                        resolve(data);
                    } else {
                        reject(new Error('数据格式不符合要求'));
                    }
                } catch (error) {
                    console.error('解析失败:', error);
                    reject(new Error('文件解析失败：' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    /**
     * 导出用户完整档案
     */
    async exportUserProfile() {
        const profile = {
            // 基本信息
            basicInfo: {
                name: '张先生',
                age: 45,
                gender: '男',
                height: 175,
                weight: 72,
                bmi: 23.5,
                phone: '138****8888',
                registerDate: '2023-05-18'
            },

            // 健康评估记录
            assessments: await this.getAssessmentHistory(),

            // 检测记录
            testRecords: await this.getTestRecords(),

            // AI建议
            aiSuggestions: await this.getAISuggestions(),

            // 论坛互动
            forumActivity: await this.getForumActivity()
        };

        return profile;
    }

    /**
     * 导出预测数据（用于模型训练）
     */
    async exportPredictionData() {
        const data = {
            meta: {
                exportTime: new Date().toISOString(),
                platform: '糖康孪生',
                version: '2.0'
            },
            records: await this.getPredictionRecords()
        };

        return data;
    }

    /**
     * 批量导入用户数据（管理员用）
     */
    async batchImportUsers(file) {
        try {
            const data = await this.import(file);

            if (!Array.isArray(data)) {
                throw new Error('批量导入需要JSON数组格式');
            }

            // 验证每条记录
            const validRecords = [];
            const errors = [];

            data.forEach((record, index) => {
                if (this.validateUserRecord(record)) {
                    validRecords.push(record);
                } else {
                    errors.push(`第${index + 1}行数据格式错误`);
                }
            });

            return {
                success: true,
                total: data.length,
                valid: validRecords.length,
                errors
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 导出全球糖尿病数据
     */
    async exportGlobalData() {
        const globalData = {
            meta: {
                exportTime: new Date().toISOString(),
                source: '糖康孪生平台',
                description: '全球糖尿病统计数据'
            },
            countries: [
                { name: '中国', patients: 140000000, prevalence: '10.9%', trend: '上升' },
                { name: '美国', patients: 37000000, prevalence: '11.3%', trend: '稳定' },
                { name: '印度', patients: 77000000, prevalence: '5.7%', trend: '上升' },
                { name: '巴西', patients: 15000000, prevalence: '7.3%', trend: '上升' },
                { name: '日本', patients: 7000000, prevalence: '5.6%', trend: '稳定' },
                { name: '德国', patients: 6000000, prevalence: '7.2%', trend: '下降' },
                { name: '英国', patients: 4000000, prevalence: '6.0%', trend: '稳定' },
                { name: '法国', patients: 3000000, prevalence: '5.4%', trend: '下降' }
            ],
            ageDistribution: {
                '18-30': '2.1%',
                '31-45': '6.3%',
                '46-60': '14.7%',
                '61-75': '23.5%',
                '75+': '28.9%'
            },
            riskFactors: {
                obesity: '41.8%',
                hypertension: '38.9%',
                familyHistory: '35.2%',
                sedentary: '29.4%',
                smoking: '15.7%'
            }
        };

        return globalData;
    }

    // ========== 私有方法 ==========

    /**
     * 验证文件
     */
    validateFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(ext)) {
            tk_showToast('不支持的文件格式，请使用 JSON、CSV 或 Excel 文件');
            return false;
        }
        if (file.size > this.maxFileSize) {
            tk_showToast('文件过大，请确保文件小于 10MB');
            return false;
        }
        return true;
    }

    /**
     * 验证导入的数据
     */
    validateImportedData(data) {
        if (typeof data !== 'object' || data === null) return false;
        if (Array.isArray(data)) return data.length > 0;
        return true;
    }

    /**
     * 验证用户记录
     */
    validateUserRecord(record) {
        const required = ['name', 'age', 'gender'];
        return required.every(field => field in record);
    }

    /**
     * 转换为CSV
     */
    convertToCSV(data) {
        if (Array.isArray(data)) {
            const headers = Object.keys(data[0] || {});
            const rows = [headers.join(',')];
            data.forEach(item => {
                rows.push(headers.map(h => `"${item[h] || ''}"`).join(','));
            });
            return '\ufeff' + rows.join('\n'); // BOM for UTF-8
        } else {
            // 单个对象转为CSV格式
            const rows = ['字段,值'];
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                rows.push(`"${key}","${value}"`);
            });
            return '\ufeff' + rows.join('\n');
        }
    }

    /**
     * 解析CSV
     */
    parseCSV(content) {
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });
            data.push(row);
        }

        return data;
    }

    /**
     * 导出Excel
     */
    async exportExcel(data) {
        // 使用SheetJS
        const XLSX = window.XLSX;

        const worksheet = XLSX.utils.json_to_sheet(
            Array.isArray(data) ? data : [data]
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '健康数据');

        const filename = `健康数据_${this.formatDate()}.xlsx`;
        XLSX.writeFile(workbook, filename);
    }

    /**
     * 解析Excel
     */
    parseExcel(content) {
        const XLSX = window.XLSX;
        const data = new Uint8Array(content);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(firstSheet);
    }

    /**
     * 下载文件
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 格式化日期
     */
    formatDate(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
    }

    // ========== 数据获取方法（模拟）==========

    async getAssessmentHistory() {
        return [
            { date: '2023-11-10', riskLevel: '低风险', score: 78 },
            { date: '2023-10-25', riskLevel: '关注', score: 65 },
            { date: '2023-08-30', riskLevel: '良好', score: 82 }
        ];
    }

    async getTestRecords() {
        return [
            { date: '2023-11-10', type: '空腹血糖', value: '5.2 mmol/L', status: '正常' },
            { date: '2023-11-10', type: '餐后血糖', value: '7.8 mmol/L', status: '正常' },
            { date: '2023-11-10', type: 'BMI', value: '23.5', status: '正常' }
        ];
    }

    async getAISuggestions() {
        return [
            '减少精制碳水化合物摄入',
            '保持每周150分钟运动',
            '保证7-8小时充足睡眠'
        ];
    }

    async getForumActivity() {
        return {
            posts: 15,
            replies: 42,
            likes: 128
        };
    }

    async getPredictionRecords() {
        return [
            { age: 45, bmi: 23.5, bloodPressure: '正常', result: '低风险' },
            { age: 52, bmi: 27.8, bloodPressure: '偏高', result: '中风险' }
        ];
    }
}

// 全局实例
window.dataManager = new DataImportExport();

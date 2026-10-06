"""
糖尿病数据分析与预测系统（多模型版本）
数据文件：糖尿病患者数据.csv
分析字段：年龄，性别，家族糖尿病史，BMI，收缩压，舒张压，空腹血糖，餐后血糖
新增特征：妊娠糖尿病史、心血管疾病史、高血压病史
"""

import pandas as pd
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from flask import Flask, request, jsonify, current_app
from dotenv import load_dotenv
import openai
import os
import numpy as np

# 全局配置
DATA_FILE = "糖尿病患者数据.csv"
FEATURES = [
    '年龄', '性别', '家族糖尿病史', 'BMI',
    '收缩压(mmHg)', '舒张压(mmHg)',
    '空腹血糖(mmol/L)', '餐后血糖(mmol/L)',
    '妊娠糖尿病史', '心血管疾病史', '高血压病史'  # 新增特征
]
TARGET = '诊断结果'  # 假设目标变量列名为'诊断结果'（0=健康，1=糖尿病）

# 模型类型
MODEL_TYPES = {
    'random_forest': RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        class_weight='balanced',
        random_state=42
    ),
    'gradient_boosting': GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    ),
    'svm': SVC(
        probability=True,
        class_weight='balanced',
        random_state=42
    ),
    'logistic_regression': LogisticRegression(
        class_weight='balanced',
        random_state=42,
        max_iter=1000
    )
}

# 加载环境变量
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# 初始化Flask应用
app = Flask(__name__)
CORS(app)


# 数据预处理函数
def preprocess_data(df):
    """数据清洗和预处理"""
    # 处理缺失值
    df = df.copy()
    df = df.drop(columns=['患者ID', '运动强度', '吸烟情况', '饮酒情况', '睡眠质量', '睡眠时长(小时)'])  # 保留新增的三个病史特征

    # 数值型特征用中位数填充
    num_features = ['年龄', 'BMI', '收缩压(mmHg)', '舒张压(mmHg)',
                    '空腹血糖(mmol/L)', '餐后血糖(mmol/L)']
    imputer_num = SimpleImputer(strategy='median')
    df[num_features] = imputer_num.fit_transform(df[num_features])

    # 分类型特征用众数填充
    cat_features = ['性别', '家族糖尿病史', '妊娠糖尿病史', '心血管疾病史', '高血压病史']  # 新增特征
    imputer_cat = SimpleImputer(strategy='most_frequent')
    df[cat_features] = imputer_cat.fit_transform(df[cat_features])

    # 转换分类变量
    df['性别'] = df['性别'].map({'男': 1, '女': 0}).fillna(0).astype(int)

    # 统一处理所有病史特征
    history_features = ['家族糖尿病史', '妊娠糖尿病史', '心血管疾病史', '高血压病史']
    for feature in history_features:
        df[feature] = df[feature].map({
            '无': 0,
            '有': 1,
            '不确定': 2,
            '不适用': 0  # 添加对"不适用"的处理
        }).fillna(0).astype(int)  # 将缺失值填充为0

    df['诊断结果'] = df['诊断结果'].map({'糖尿病': 1, '健康': 0}).astype(int)

    return df


# 训练模型
def train_model(X, y):
    """模型训练流程"""
    # 划分数据集
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 标准化处理
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # 训练所有模型
    trained_models = {}
    for model_name, model in MODEL_TYPES.items():
        model.fit(X_train, y_train)
        trained_models[model_name] = model

    return trained_models, scaler


# 预测函数
def predict_risk(models, scaler, patient_data, model_type='random_forest'):
    """预测糖尿病风险"""
    # 转换为DataFrame保持特征顺序
    input_df = pd.DataFrame([patient_data], columns=FEATURES)

    # 预处理
    input_df['性别'] = input_df['性别'].map({'男': 1, '女': 0})

    # 处理所有病史特征
    history_features = ['家族糖尿病史', '妊娠糖尿病史', '心血管疾病史', '高血压病史']
    for feature in history_features:
        input_df[feature] = input_df[feature].map({
            '无': 0,
            '有': 1,
            '不确定': 2
        }).astype(int)

    # 标准化
    scaled_data = scaler.transform(input_df)

    # 获取指定模型
    model = models.get(model_type)
    if model is None:
        raise ValueError(f"未知模型类型: {model_type}")

    # 预测概率
    proba = model.predict_proba(scaled_data)[0][1]

    return proba * 100


def load_models():
    """加载或训练模型并存入应用上下文"""
    if not current_app.config.get('models'):
        print("\n正在加载数据并训练模型...")
        df = pd.read_csv(DATA_FILE)
        processed_df = preprocess_data(df)
        X = processed_df[FEATURES]
        y = processed_df[TARGET]
        models, scaler = train_model(X, y)
        current_app.config['models'] = models
        current_app.config['scaler'] = scaler


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # 确保模型已加载
        load_models()

        # 获取模型和scaler
        models = current_app.config['models']
        scaler = current_app.config['scaler']

        # 获取前端数据
        data = request.json

        # 获取请求的模型类型，默认为随机森林
        model_type = data.get('model_type', 'random_forest')

        # 转换为模型需要的格式
        patient_data = {
            '年龄': data['年龄'],
            '性别': data['性别'],
            '家族糖尿病史': data['家族糖尿病史'],
            'BMI': data['BMI'],
            '收缩压(mmHg)': data['收缩压(mmHg)'],
            '舒张压(mmHg)': data['舒张压(mmHg)'],
            '空腹血糖(mmol/L)': data['空腹血糖(mmol/L)'],
            '餐后血糖(mmol/L)': data['餐后血糖(mmol/L)'],
            '妊娠糖尿病史': data.get('妊娠糖尿病史', '无'),  # 新增字段，默认为"无"
            '心血管疾病史': data.get('心血管疾病史', '无'),  # 新增字段，默认为"无"
            '高血压病史': data.get('高血压病史', '无')  # 新增字段，默认为"无"
        }

        # 调用预测函数
        risk = predict_risk(models, scaler, patient_data, model_type)

        # 生成建议
        if risk < 30:
            recommendation = "低风险 - 建议保持健康生活方式"
        elif risk < 70:
            recommendation = "中风险 - 建议进行糖化血红蛋白检测"
        else:
            recommendation = "高风险 - 建议立即就医并做糖耐量试验"

        return jsonify({
            'model_type': model_type,
            'risk': round(risk, 2),
            'recommendation': recommendation
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare_models', methods=['POST'])
def compare_models():
    """比较不同模型的预测结果"""
    try:
        # 确保模型已加载
        load_models()

        # 获取模型和scaler
        models = current_app.config['models']
        scaler = current_app.config['scaler']

        # 获取前端数据
        data = request.json

        # 转换为模型需要的格式
        patient_data = {
            '年龄': data['年龄'],
            '性别': data['性别'],
            '家族糖尿病史': data['家族糖尿病史'],
            'BMI': data['BMI'],
            '收缩压(mmHg)': data['收缩压(mmHg)'],
            '舒张压(mmHg)': data['舒张压(mmHg)'],
            '空腹血糖(mmol/L)': data['空腹血糖(mmol/L)'],
            '餐后血糖(mmol/L)': data['餐后血糖(mmol/L)'],
            '妊娠糖尿病史': data.get('妊娠糖尿病史', '无'),
            '心血管疾病史': data.get('心血管疾病史', '无'),
            '高血压病史': data.get('高血压病史', '无')
        }

        # 获取所有模型的预测结果
        results = {}
        for model_name in models.keys():
            risk = predict_risk(models, scaler, patient_data, model_name)
            results[model_name] = round(risk, 2)

        # 计算平均风险
        avg_risk = np.mean(list(results.values()))

        return jsonify({
            'results': results,
            'average_risk': round(avg_risk, 2)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai_analysis', methods=['POST'])
def ai_analysis():
    """独立的AI分析端点"""
    try:
        # 获取前端数据
        patient_data = request.json

        # 调用OpenAI API
        response = openai.ChatCompletion.create(
            model="deepseek-reasoner",
            messages=[
                {
                    "role": "system",
                    "content": "作为糖尿病专家，请分析以下患者数据并提供专业建议。"
                },
                {
                    "role": "user",
                    "content": f"""患者数据：
- 年龄: {patient_data['年龄']}岁
- 性别: {patient_data['性别']}
- BMI: {patient_data['BMI']}
- 血压: {patient_data['收缩压(mmHg)']}/{patient_data['舒张压(mmHg)']} mmHg
- 空腹血糖: {patient_data['空腹血糖(mmol/L)']} mmol/L
- 餐后血糖: {patient_data['餐后血糖(mmol/L)']} mmol/L
- 家族糖尿病史: {patient_data['家族糖尿病史']}
- 妊娠糖尿病史: {patient_data.get('妊娠糖尿病史', '无')}
- 心血管疾病史: {patient_data.get('心血管疾病史', '无')}
- 高血压病史: {patient_data.get('高血压病史', '无')}

请提供：
1. 风险因素分析（特别关注新增的病史特征）
2. 具体饮食建议
3. 运动建议
4. 是否需要就医"""
                }
            ],
            temperature=0.7,
            max_tokens=500
        )

        return jsonify({
            "success": True,
            "ai_advice": response.choices[0].message.content
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    # 启动时预加载模型
    with app.app_context():
        load_models()

    app.run(host='0.0.0.0', port=8000, debug=True)
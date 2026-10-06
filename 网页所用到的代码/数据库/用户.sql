-- ============================================
-- 糖康孪生平台 数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS tangkang_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE tangkang_db;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(50) NOT NULL COMMENT '用户姓名',
  `user_email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱（登录账号）',
  `user_pwd` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `gender` ENUM('男', '女', '未设置') DEFAULT '未设置' COMMENT '性别',
  `age` INT DEFAULT NULL COMMENT '年龄',
  `height` DECIMAL(5,1) DEFAULT NULL COMMENT '身高(cm)',
  `weight` DECIMAL(5,1) DEFAULT NULL COMMENT '体重(kg)',
  `bmi` DECIMAL(4,1) DEFAULT NULL COMMENT 'BMI指数',
  `family_diabetes` ENUM('无', '有', '不确定', '未填写') DEFAULT '未填写' COMMENT '家族糖尿病史',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  INDEX `idx_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 健康评估记录表
-- ============================================
CREATE TABLE IF NOT EXISTS `health_assessment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `source` ENUM('screening', 'full_assessment') NOT NULL COMMENT '来源：screening=初筛, full_assessment=详细评估',
  `risk_level` ENUM('低风险', '中风险', '高风险') NOT NULL COMMENT '风险等级',
  `probability` DECIMAL(5,2) DEFAULT 0 COMMENT '风险概率(%)',
  `model_probability` DECIMAL(5,2) DEFAULT NULL COMMENT '模型概率(%)',
  `symptom_probability` DECIMAL(5,2) DEFAULT NULL COMMENT '症状概率(%)',
  `key_factors` JSON DEFAULT NULL COMMENT '关键风险因素（JSON数组）',
  `medical_advice` TEXT DEFAULT NULL COMMENT '医疗建议',
  `raw_data` JSON DEFAULT NULL COMMENT '原始提交数据（JSON）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评估时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_risk_level` (`risk_level`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康评估记录表';

-- ============================================
-- 3. 桌宠状态表
-- ============================================
CREATE TABLE IF NOT EXISTS `pet_state` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE COMMENT '用户ID（一对一）',
  `pet_name` VARCHAR(30) DEFAULT '糖糖' COMMENT '宠物名字',
  `pet_type` ENUM('cat', 'dog') DEFAULT 'cat' COMMENT '宠物类型',
  `collar_color` VARCHAR(20) DEFAULT '#10b981' COMMENT '项圈颜色（随风险变化）',
  `skills_config` JSON DEFAULT NULL COMMENT '技能开关配置（JSON）',
  `mood` ENUM('happy', 'thinking', 'worried', 'sleeping') DEFAULT 'happy' COMMENT '宠物心情',
  `last_reminder_time` DATETIME DEFAULT NULL COMMENT '上次提醒时间',
  `total_reminders` INT DEFAULT 0 COMMENT '累计提醒次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='桌宠状态表';

-- ============================================
-- 4. 健康提醒表
-- ============================================
CREATE TABLE IF NOT EXISTS `health_reminder` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` ENUM('medicine', 'measure', 'meal', 'exercise', 'water', 'sleep', 'custom') NOT NULL COMMENT '提醒类型',
  `title` VARCHAR(100) NOT NULL COMMENT '提醒标题',
  `time` VARCHAR(5) NOT NULL COMMENT '提醒时间 HH:MM',
  `note` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_time` (`time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康提醒表';

-- ============================================
-- 插入测试用户（密码: 123456，bcrypt加密）
-- ============================================
INSERT INTO `user` (`user_name`, `user_email`, `user_pwd`, `gender`, `age`)
VALUES ('张先生', 'test@tangkang.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJHdF1qI9a2', '男', 45);

-- 为测试用户创建桌宠
INSERT INTO `pet_state` (`user_id`, `pet_name`, `pet_type`, `skills_config`)
VALUES (1, '糖糖', 'cat', '{"sitting_reminder": true, "water_reminder": true, "medicine_reminder": true, "glucose_reminder": false, "health_tip": true}');

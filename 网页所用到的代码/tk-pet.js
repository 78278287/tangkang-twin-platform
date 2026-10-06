/**
 * 糖康孪生 - 桌宠"糖糖"核心逻辑 v2.0
 * 图片宠物 + 角色切换 + 随机走动 + 提醒放大
 */
;(function () {
  'use strict';

  var API_BASE = 'http://localhost:3001';

  /* ========== 角色配置 ========== */
  var CHARACTERS = [
    {
      id: 'piggy',
      name: '粉红猪猪',
      avatar: 'images/pet/piggy.png',
      image: 'images/pet/piggy.png',
      alertImage: 'images/pet/piggy-alert.png',
      theme: '#f472b6'
    },
    {
      id: 'doctor-dog',
      name: '医疗小狗',
      avatar: 'images/pet/doctor-dog.png',
      image: 'images/pet/doctor-dog.png',
      alertImage: 'images/pet/doctor-dog-alert.png',
      theme: '#f59e0b'
    },
    {
      id: 'water-fairy',
      name: '水滴精灵',
      avatar: 'images/pet/water-fairy.png',
      image: 'images/pet/water-fairy.png',
      alertImage: 'images/pet/water-fairy-alert.png',
      theme: '#38bdf8'
    },
    {
      id: 'candy-cat',
      name: '糖果小猫',
      avatar: 'images/pet/candy-cat.png',
      image: 'images/pet/candy-cat.png',
      alertImage: 'images/pet/candy-cat-alert.png',
      theme: '#ec4899'
    }
  ];

  /* ========== 技能配置 ========== */
  var SKILLS = [
    { id: 'sitting_reminder', name: '久坐提醒', icon: '⏰', desc: '定时提醒起身活动' },
    { id: 'water_reminder', name: '喝水提醒', icon: '💧', desc: '定时提醒补充水分' },
    { id: 'medicine_reminder', name: '吃药提醒', icon: '💊', desc: '读取健康提醒中的用药' },
    { id: 'glucose_reminder', name: '测血糖提醒', icon: '🩸', desc: '读取健康提醒中的测量' },
    { id: 'health_tip', name: '每日健康贴士', icon: '💡', desc: '点击宠物获取小知识' },
    { id: 'auto_walk', name: '桌面散步', icon: '🚶', desc: '宠物会在桌面边缘走动' },
    { id: 'ai_reminder', name: 'AI智能提醒', icon: '🤖', desc: '根据档案生成个性化糖尿病提醒' }
  ];

  /* ========== 健康贴士 ========== */
  var HEALTH_TIPS = [
    '每天步行30分钟，可降低糖尿病风险约40%',
    '控制碳水摄入量，选择全谷物替代精制米面',
    '定期监测血糖，了解自己的血糖波动规律',
    '保持充足睡眠，每晚7-8小时有助于血糖控制',
    '减轻5-7%的体重就能显著降低糖尿病发病风险',
    '饭后散步15分钟，有效降低餐后血糖峰值',
    '每天饮水1500-2000ml，有助于代谢和血糖调节',
    '压力管理很重要，长期压力会影响血糖水平',
    '选择低GI食物，如燕麦、糙米、红薯等',
    '戒烟限酒，吸烟者糖尿病风险增加30-40%'
  ];

  /* ========== 默认状态 ========== */
  var DEFAULT_PET_STATE = {
    characterId: 'piggy',
    skills: {
      sitting_reminder: true,
      water_reminder: true,
      medicine_reminder: true,
      glucose_reminder: false,
      health_tip: true,
      auto_walk: true,
      ai_reminder: true
    },
    sittingInterval: 45,  // 分钟
    waterInterval: 60,    // 分钟
    aiReminderInterval: 90, // 分钟
    lastSittingReminder: 0,
    lastWaterReminder: 0,
    lastMedicineCheck: '',
    lastGlucoseCheck: '',
    lastAIReminder: 0
  };

  /* ========== DOM 引用 ========== */
  var petEl = null;
  var petImageEl = null;
  var bubbleEl = null;
  var bubbleTextEl = null;
  var bubbleAiBtnEl = null;
  var panelEl = null;
  var panelCloseEl = null;
  var panelContentEl = null;
  var settingsBtnEl = null;

  /* ========== 状态变量 ========== */
  var bubbleTimer = null;
  var reminderTimer = null;
  var walkTimer = null;
  var alertTimer = null;
  var panelVisible = false;
  var isDragging = false;
  var hasDragged = false;
  var isGeneratingAI = false;
  var happyTimer = null;
  var expressionTimer = null;
  var isExpression = false;
  var sleepTimer = null;
  var isSleeping = false;
  var eatTimer = null;
  var isEating = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var petStartX = 0;
  var petStartY = 0;
  var currentCharacter = null;
  var previousRiskLevel = null;

  /* ========== 工具函数 ========== */
  function loadJSON(key, defaultValue) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function getPetState() {
    var saved = loadJSON('tk_pet_state_v2', null);
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_PET_STATE));
    var state = JSON.parse(JSON.stringify(DEFAULT_PET_STATE));
    for (var k in saved) {
      if (saved.hasOwnProperty(k)) state[k] = saved[k];
    }
    for (var sk in DEFAULT_PET_STATE.skills) {
      if (DEFAULT_PET_STATE.skills.hasOwnProperty(sk) && state.skills[sk] === undefined) {
        state.skills[sk] = DEFAULT_PET_STATE.skills[sk];
      }
    }
    return state;
  }

  function savePetState(state) {
    saveJSON('tk_pet_state_v2', state);
  }

  function getCharacterById(id) {
    for (var i = 0; i < CHARACTERS.length; i++) {
      if (CHARACTERS[i].id === id) return CHARACTERS[i];
    }
    return CHARACTERS[0];
  }

  /* ========== 初始化 ========== */
  function initTkPet() {
    if (document.getElementById('tk-pet')) return;

    // 清理旧版位置缓存，避免定位异常
    try {
      localStorage.removeItem('tk_pet_pos');
    } catch (e) {}

    loadCSS();
    injectHTML();

    petEl = document.getElementById('tk-pet');
    petImageEl = document.getElementById('tk-pet-image');
    bubbleEl = document.getElementById('tk-pet-bubble');
    bubbleTextEl = bubbleEl.querySelector('.tk-pet__bubble-text');
    bubbleAiBtnEl = document.getElementById('tk-pet-bubble-ai');
    panelEl = document.getElementById('tk-pet-panel');
    panelCloseEl = document.getElementById('tk-pet-panel-close');
    panelContentEl = document.getElementById('tk-pet-panel-content-settings');
    settingsBtnEl = document.getElementById('tk-pet-settings');

    var state = getPetState();
    currentCharacter = getCharacterById(state.characterId);

    restorePosition();
    renderCharacter();
    syncRiskLevel();
    renderPanel();
    bindEvents();
    startReminderSystem();
    startWalkSystem();
    tryAPISync();
  }

  function loadCSS() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href && links[i].href.indexOf('tk-pet.css') !== -1) return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'tk-pet.css?v=18';
    document.head.appendChild(link);
  }

  function injectHTML() {
    var html = '<div class="tk-pet" id="tk-pet">'
      + '<div class="tk-pet__bubble" id="tk-pet-bubble">'
      + '<span class="tk-pet__bubble-text"></span>'
      + '<button class="tk-pet__bubble-ai" id="tk-pet-bubble-ai" type="button">🤖 问糖糖 AI</button>'
      + '</div>'
      + '<img class="tk-pet__image" id="tk-pet-image" src="" alt="桌宠" draggable="false">'
      + '<div class="tk-pet__sleep" id="tk-pet-sleep"><span>z</span><span>z</span><span>z</span></div>'
      + '<div class="tk-pet__food" id="tk-pet-food">🍎</div>'
      + '<div class="tk-pet__settings-btn" id="tk-pet-settings" title="设置">⚙️</div>'
      + '<div class="tk-pet__panel" id="tk-pet-panel">'
      + '<div class="tk-pet__panel-close" id="tk-pet-panel-close"></div>'
      + '<div class="tk-pet__panel-title">我的桌宠</div>'
      + '<div class="tk-pet__panel-tabs">'
      + '<div class="tk-pet__panel-tab tk-pet__panel-tab--active" data-tab="settings">设置</div>'
      + '<div class="tk-pet__panel-tab" data-tab="ai">AI 助手</div>'
      + '</div>'
      + '<div class="tk-pet__panel-body">'
      + '<div class="tk-pet__panel-content tk-pet__panel-content--active" id="tk-pet-panel-content-settings"></div>'
      + '<div class="tk-pet__panel-content" id="tk-pet-panel-content-ai">'
      + '<div class="tk-pet__ai-messages" id="tk-pet-ai-messages"></div>'
      + '<div class="tk-pet__ai-input-wrap">'
      + '<textarea class="tk-pet__ai-input" id="tk-pet-ai-input" rows="1" placeholder="问点健康问题..."></textarea>'
      + '<button class="tk-pet__ai-send" id="tk-pet-ai-send" type="button">发送</button>'
      + '</div>'
      + '<div class="tk-pet__ai-quick" id="tk-pet-ai-quick">'
      + '<button type="button" data-q="血糖正常值是多少？">血糖</button>'
      + '<button type="button" data-q="糖尿病患者饮食应该注意什么？">饮食</button>'
      + '<button type="button" data-q="如何预防糖尿病？">预防</button>'
      + '<button type="button" data-q="饭后血糖高怎么办？">控糖</button>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstChild);
  }

  /* ========== 角色渲染 ========== */
  function renderCharacter() {
    if (!petImageEl || !currentCharacter) return;
    if (!isExpression) {
      petImageEl.src = currentCharacter.image;
    }
    petImageEl.alt = currentCharacter.name;

    // 更新角色动画类
    if (petEl) {
      for (var i = 0; i < CHARACTERS.length; i++) {
        petEl.classList.remove('tk-pet--character-' + CHARACTERS[i].id);
      }
      petEl.classList.add('tk-pet--character-' + currentCharacter.id);
    }
  }

  function setExpressionImage() {
    if (!petImageEl || !currentCharacter || !currentCharacter.alertImage) return;
    isExpression = true;
    petImageEl.src = currentCharacter.alertImage;
  }

  function restoreCharacterImage() {
    isExpression = false;
    if (!petImageEl || !currentCharacter) return;
    petImageEl.src = currentCharacter.image;
  }

  function switchCharacter(characterId) {
    var state = getPetState();
    state.characterId = characterId;
    savePetState(state);
    currentCharacter = getCharacterById(characterId);
    if (expressionTimer) {
      clearTimeout(expressionTimer);
      expressionTimer = null;
    }
    restoreCharacterImage();
    renderCharacter();
    renderPanel();
    showBubble('我是' + currentCharacter.name + '，以后陪你健康管理~');
    tryAPISaveState(state);
  }

  /* ========== 风险等级同步 ========== */
  function syncRiskLevel() {
    var level = localStorage.getItem('tk_risk_level') || '低风险';
    applyRiskLevel(level);
  }

  function applyRiskLevel(level) {
    if (previousRiskLevel !== null && previousRiskLevel !== level) {
      autoRecommendSkills(level);
    }
    previousRiskLevel = level;
  }

  function autoRecommendSkills(level) {
    var state = getPetState();
    if (level === '低风险') {
      state.skills.water_reminder = true;
      state.skills.sitting_reminder = true;
      state.skills.auto_walk = true;
    } else if (level === '中风险') {
      for (var i = 0; i < SKILLS.length; i++) {
        if (SKILLS[i].id !== 'glucose_reminder') {
          state.skills[SKILLS[i].id] = true;
        }
      }
      showBubble('检测到中等风险，' + currentCharacter.name + '帮你开启了更多提醒哦~');
    } else if (level === '高风险') {
      for (var j = 0; j < SKILLS.length; j++) {
        state.skills[SKILLS[j].id] = true;
      }
      showBubble('风险较高！' + currentCharacter.name + '会全程陪伴你管理健康~');
    }
    savePetState(state);
    renderPanel();
    tryAPISaveState(state);
  }

  /* ========== 技能面板 ========== */
  function renderPanel() {
    if (!panelContentEl) return;
    var state = getPetState();

    // 如果当前不在设置标签页，不需要渲染设置内容
    if (!panelContentEl.classList.contains('tk-pet__panel-content--active')) return;

    var html = '<div class="tk-pet__section-title">选择角色</div>'
      + '<div class="tk-pet__characters">';

    for (var i = 0; i < CHARACTERS.length; i++) {
      var char = CHARACTERS[i];
      var active = char.id === state.characterId ? ' tk-pet__character--active' : '';
      html += '<div class="tk-pet__character' + active + '" data-character="' + char.id + '">'
        + '<img class="tk-pet__character-img" src="' + char.avatar + '" alt="' + char.name + '">'
        + '<span class="tk-pet__character-name">' + char.name + '</span>'
        + '</div>';
    }

    html += '</div>';

    html += '<div class="tk-pet__section-title">健康技能</div>'
      + '<div class="tk-pet__skills">';

    for (var k = 0; k < SKILLS.length; k++) {
      var skill = SKILLS[k];
      var checked = state.skills[skill.id] ? ' checked' : '';
      html += '<div class="tk-pet__skill-item">'
        + '<span class="tk-pet__skill-icon">' + skill.icon + '</span>'
        + '<div class="tk-pet__skill-info">'
        + '<div class="tk-pet__skill-name">' + skill.name + '</div>'
        + '<div class="tk-pet__skill-desc">' + skill.desc + '</div>'
        + '</div>'
        + '<label class="tk-pet__toggle">'
        + '<input type="checkbox"' + checked + ' data-skill="' + skill.id + '" class="tk-pet__toggle-input">'
        + '<span class="tk-pet__toggle-slider"></span>'
        + '</label>'
        + '</div>';
    }

    html += '</div>';

    html += '<div class="tk-pet__section-title">提醒节奏</div>'
      + '<div class="tk-pet__time-setting">'
      + '<span class="tk-pet__time-label">久坐提醒间隔（分钟）</span>'
      + '<input type="number" class="tk-pet__time-input" data-time="sitting" value="' + state.sittingInterval + '" min="5" max="180">'
      + '</div>'
      + '<div class="tk-pet__time-setting">'
      + '<span class="tk-pet__time-label">喝水提醒间隔（分钟）</span>'
      + '<input type="number" class="tk-pet__time-input" data-time="water" value="' + state.waterInterval + '" min="5" max="180">'
      + '</div>'
      + '<div class="tk-pet__time-setting">'
      + '<span class="tk-pet__time-label">AI 智能提醒间隔（分钟）</span>'
      + '<input type="number" class="tk-pet__time-input" data-time="ai" value="' + state.aiReminderInterval + '" min="15" max="300">'
      + '</div>';

    panelContentEl.innerHTML = html;
    bindPanelEvents();
  }

  function bindPanelEvents() {
    if (!panelContentEl) return;

    var chars = panelContentEl.querySelectorAll('.tk-pet__character');
    for (var i = 0; i < chars.length; i++) {
      chars[i].addEventListener('click', function (e) {
        var id = e.currentTarget.getAttribute('data-character');
        switchCharacter(id);
      });
    }

    var toggles = panelContentEl.querySelectorAll('.tk-pet__toggle-input');
    for (var j = 0; j < toggles.length; j++) {
      toggles[j].addEventListener('change', onSkillToggle);
    }

    var timeInputs = panelContentEl.querySelectorAll('.tk-pet__time-input');
    for (var k = 0; k < timeInputs.length; k++) {
      timeInputs[k].addEventListener('change', onTimeChange);
    }
  }

  function onSkillToggle(e) {
    var skillId = e.target.getAttribute('data-skill');
    var enabled = e.target.checked;
    var state = getPetState();
    state.skills[skillId] = enabled;
    savePetState(state);
    tryAPISaveState(state);
    if (skillId === 'health_tip' && enabled) {
      showBubble('健康贴士已开启，点击' + currentCharacter.name + '获取小知识~');
    } else if (skillId === 'auto_walk' && enabled) {
      showBubble(currentCharacter.name + '要开始散步啦~');
    }
  }

  function onTimeChange(e) {
    var type = e.target.getAttribute('data-time');
    var value = parseInt(e.target.value, 10);
    var min = type === 'ai' ? 15 : 5;
    var max = type === 'ai' ? 300 : 180;
    if (isNaN(value) || value < min) value = min;
    if (value > max) value = max;
    e.target.value = value;
    var state = getPetState();
    if (type === 'sitting') state.sittingInterval = value;
    if (type === 'water') state.waterInterval = value;
    if (type === 'ai') state.aiReminderInterval = value;
    savePetState(state);
    tryAPISaveState(state);
  }

  function togglePanel() {
    panelVisible = !panelVisible;
    if (panelVisible) {
      panelEl.classList.add('tk-pet__panel--visible');
      renderPanel();
    } else {
      panelEl.classList.remove('tk-pet__panel--visible');
    }
  }

  function showPanel() {
    panelVisible = true;
    panelEl.classList.add('tk-pet__panel--visible');
    renderPanel();
  }

  function hidePanel() {
    panelVisible = false;
    panelEl.classList.remove('tk-pet__panel--visible');
  }

  /* ========== 气泡系统 ========== */
  function showBubble(text, showAIButton) {
    if (!bubbleEl || !bubbleTextEl) return;
    if (bubbleTimer) {
      clearTimeout(bubbleTimer);
      bubbleTimer = null;
    }
    bubbleTextEl.textContent = text;
    if (bubbleAiBtnEl) {
      bubbleAiBtnEl.style.display = showAIButton ? 'inline-flex' : 'none';
    }
    bubbleEl.classList.add('tk-pet__bubble--visible');
    bubbleTimer = setTimeout(function () {
      bubbleEl.classList.remove('tk-pet__bubble--visible');
      bubbleTimer = null;
    }, 5000);
  }

  function askAIWithQuestion(defaultQuestion) {
    var question = defaultQuestion || '';
    if (!question) {
      question = window.prompt('你想问糖糖 AI 什么健康问题？', '糖尿病前期有什么症状？');
    }
    if (!question || !question.trim()) return;
    window.location.href = 'ai_assistant.html?q=' + encodeURIComponent(question.trim());
  }

  /* ========== 提醒系统 ========== */
  function startReminderSystem() {
    checkReminders();
    reminderTimer = setInterval(checkReminders, 30000);
  }

  function checkReminders() {
    if (!petEl || !petImageEl) return;

    var state = getPetState();
    var now = Date.now();

    if (state.skills.sitting_reminder) {
      if (now - state.lastSittingReminder >= state.sittingInterval * 60 * 1000) {
        state.lastSittingReminder = now;
        savePetState(state);
        triggerAlert('主人，坐太久啦！起来活动一下吧~', 'sitting');
        return;
      }
    }

    if (state.skills.water_reminder) {
      if (now - state.lastWaterReminder >= state.waterInterval * 60 * 1000) {
        state.lastWaterReminder = now;
        savePetState(state);
        triggerAlert('该喝水啦！保持水分摄入很重要哦~', 'water');
        return;
      }
    }

    if (state.skills.medicine_reminder) {
      var medMsg = checkMedicineReminder();
      if (medMsg) {
        triggerAlert(medMsg, 'medicine');
        return;
      }
    }

    if (state.skills.glucose_reminder) {
      var glucoseMsg = checkGlucoseReminder();
      if (glucoseMsg) {
        triggerAlert(glucoseMsg, 'glucose');
        return;
      }
    }

    if (state.skills.ai_reminder) {
      if (now - state.lastAIReminder >= state.aiReminderInterval * 60 * 1000) {
        if (!isGeneratingAI) {
          generateAIReminder();
        }
      }
    }
  }
  function triggerAlert(message, type) {
    showBubble(message);

    // 提醒时唤醒并停止其他动作
    wakeUp();
    if (isEating) {
      isEating = false;
      petEl.classList.remove('tk-pet--eating');
      if (eatTimer) {
        clearTimeout(eatTimer);
        eatTimer = null;
      }
    }
    petEl.classList.remove('tk-pet--walking');
    petEl.classList.add('tk-pet--alert');

    if (alertTimer) {
      clearTimeout(alertTimer);
    }

    alertTimer = setTimeout(function () {
      petEl.classList.remove('tk-pet--alert');
      if (getPetState().skills.auto_walk) {
        scheduleNextWalk();
      }
    }, 6000);
  }

  /* ========== 面板标签切换 ========== */
  function switchPanelTab(tabName) {
    var tabs = panelEl.querySelectorAll('.tk-pet__panel-tab');
    var contents = panelEl.querySelectorAll('.tk-pet__panel-content');

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('tk-pet__panel-tab--active', tabs[i].getAttribute('data-tab') === tabName);
    }
    for (var j = 0; j < contents.length; j++) {
      contents[j].classList.toggle('tk-pet__panel-content--active', contents[j].id === 'tk-pet-panel-content-' + tabName);
    }

    if (tabName === 'settings') {
      renderPanel();
    } else if (tabName === 'ai') {
      scrollPetAIMessagesToBottom();
    }
  }

  /* ========== 面板内 AI 聊天 ========== */
  var petAIHistory = [];

  function getPetAISystemPrompt() {
    var profile = loadHealthProfileForAI();
    var base = '你是"糖康AI健康助手"，一位亲切的糖尿病健康管理专家。回答简洁（150字以内），重点突出，使用emoji，涉及专业术语时通俗解释。任何治疗方案都要提醒用户遵医嘱，不做最终诊断，涉及急救建议拨打120。';
    if (profile) {
      base += '\n\n当前用户健康档案：' + JSON.stringify(profile) + '\n请基于以上档案给出个性化建议。';
    }
    return base;
  }

  function addPetAIMessage(content, type) {
    var messagesDiv = document.getElementById('tk-pet-ai-messages');
    if (!messagesDiv) return;

    var msgDiv = document.createElement('div');
    msgDiv.className = 'tk-pet__ai-message tk-pet__ai-message--' + type;

    var avatar = type === 'ai'
      ? '<div class="tk-pet__ai-avatar">🤖</div>'
      : '<div class="tk-pet__ai-avatar tk-pet__ai-avatar--user">🙂</div>';

    msgDiv.innerHTML = avatar + '<div class="tk-pet__ai-bubble">' + formatPetAIMessage(content) + '</div>';
    messagesDiv.appendChild(msgDiv);
    scrollPetAIMessagesToBottom();
  }

  function formatPetAIMessage(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/【(.+?)】/g, '<span style="color: var(--tk-pet-primary); font-weight: 700;">【$1】</span>')
      .replace(/\n/g, '<br>');
  }

  function scrollPetAIMessagesToBottom() {
    var messagesDiv = document.getElementById('tk-pet-ai-messages');
    if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showPetAITyping() {
    var messagesDiv = document.getElementById('tk-pet-ai-messages');
    if (!messagesDiv) return;
    var typing = document.createElement('div');
    typing.id = 'tk-pet-ai-typing';
    typing.className = 'tk-pet__ai-message tk-pet__ai-message--ai';
    typing.innerHTML = '<div class="tk-pet__ai-avatar">🤖</div><div class="tk-pet__ai-bubble tk-pet__ai-bubble--typing"><span></span><span></span><span></span></div>';
    messagesDiv.appendChild(typing);
    scrollPetAIMessagesToBottom();
  }

  function hidePetAITyping() {
    var typing = document.getElementById('tk-pet-ai-typing');
    if (typing) typing.remove();
  }

  function sendPetAIMessage(message) {
    if (!message) return;

    addPetAIMessage(message, 'user');
    showPetAITyping();

    petAIHistory.push({ role: 'user', content: message });
    if (petAIHistory.length > 6) {
      petAIHistory = petAIHistory.slice(-6);
    }

    var messages = [
      { role: 'system', content: getPetAISystemPrompt() }
    ].concat(petAIHistory);

    fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-你的DeepSeek_API密钥'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    })
      .then(function(response) {
        if (!response.ok) throw new Error('API失败');
        return response.json();
      })
      .then(function(data) {
        hidePetAITyping();
        var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (reply) {
          addPetAIMessage(reply.trim(), 'ai');
          petAIHistory.push({ role: 'assistant', content: reply.trim() });
        } else {
          throw new Error('无内容');
        }
      })
      .catch(function() {
        hidePetAITyping();
        addPetAIMessage('抱歉，AI 助手暂时无法连接，请稍后再试或前往 AI 健康助手页面咨询。', 'ai');
      });
  }

  /* ========== AI 智能提醒 ========== */
  function generateAIReminder() {
    if (isGeneratingAI) return;
    isGeneratingAI = true;

    var state = getPetState();
    var profile = loadHealthProfileForAI();
    var hour = new Date().getHours();

    // 根据当前时间选择提醒场景
    var scenario = pickReminderScenario(hour, profile);

    var prompt = '你是一位糖尿病健康管理专家，语气亲切、简短（50字以内），适合桌面宠物气泡展示。';
    prompt += '\n当前时间：' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + '。';
    if (profile) {
      prompt += '\n用户健康档案：' + JSON.stringify(profile) + '。';
    } else {
      prompt += '\n暂无用户档案。';
    }
    prompt += '\n提醒场景：' + scenario + '。';
    prompt += '\n请生成一句温馨的、针对该场景的糖尿病健康提醒，包含一个具体可执行的小建议，可用emoji。不要出现"请咨询医生"等免责声明。';

    // 更新最后 AI 提醒时间，防止重复触发
    state.lastAIReminder = Date.now();
    savePetState(state);

    // 调用 DeepSeek API
    fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-你的DeepSeek_API密钥'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是糖尿病健康管理助手，回答简短、亲切、可操作。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 120
      })
    })
      .then(function(response) {
        if (!response.ok) throw new Error('API失败');
        return response.json();
      })
      .then(function(data) {
        var message = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (message) {
          triggerAlert(message.trim(), 'ai');
        } else {
          throw new Error('无内容');
        }
      })
      .catch(function() {
        // API 失败时使用本地兜底提醒
        triggerAlert(getLocalFallbackReminder(scenario, profile), 'ai');
      })
      .finally(function() {
        isGeneratingAI = false;
      });
  }

  function loadHealthProfileForAI() {
    try {
      var profile = {};
      var riskLevel = localStorage.getItem('tk_risk_level');
      if (riskLevel) profile.riskLevel = riskLevel;

      var assessmentRaw = localStorage.getItem('tk_last_assessment');
      if (assessmentRaw) {
        var assessment = JSON.parse(assessmentRaw);
        if (assessment.risk_level) profile.riskLevel = assessment.risk_level;
        if (assessment.key_factors) profile.keyFactors = assessment.key_factors;
      }

      var profileRaw = localStorage.getItem('tk_health_profile');
      if (profileRaw) {
        var localProfile = JSON.parse(profileRaw);
        Object.assign(profile, localProfile);
      }

      return Object.keys(profile).length > 0 ? profile : null;
    } catch (e) {
      return null;
    }
  }

  function pickReminderScenario(hour, profile) {
    // 根据时间优先选择场景
    if (hour >= 7 && hour <= 9) return '早餐时段，提醒控制碳水、监测餐后血糖';
    if (hour >= 11 && hour <= 13) return '午餐时段，提醒饮食搭配、避免高糖高油';
    if (hour >= 17 && hour <= 19) return '晚餐时段，提醒适量进食、餐后散步';
    if (hour >= 21 || hour <= 6) return '晚间/睡前，提醒避免夜宵、保持血糖稳定';

    // 根据档案补充场景
    if (profile) {
      if (profile.bmi && profile.bmi >= 24) return '日常提醒，针对超重建议运动和控制体重';
      if (profile.fastingGlucose && profile.fastingGlucose >= 6.1) return '日常提醒，针对空腹血糖偏高建议监测和饮食';
      if (profile.bloodPressure) return '日常提醒，关注血压和心血管健康';
    }

    return '日常提醒，提醒喝水、活动、监测血糖等糖尿病综合管理';
  }

  function getLocalFallbackReminder(scenario, profile) {
    var hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return '早餐时间到啦~ 选择全麦、燕麦等低GI主食，少吃油炸食品哦 🥣';
    if (hour >= 11 && hour <= 13) return '午餐注意荤素搭配，先吃蔬菜再吃肉和主食，有助于平稳血糖 🥗';
    if (hour >= 17 && hour <= 19) return '晚餐不要吃太饱，七分饱就好，饭后散步15-20分钟 🚶';
    if (hour >= 21 || hour <= 6) return '睡前避免吃夜宵，保证7-8小时睡眠，有助于血糖控制 😴';
    if (profile && profile.bmi && profile.bmi >= 24) return '你的BMI偏高，今天抽30分钟快走或慢跑，对控糖很有帮助 💪';
    if (profile && profile.fastingGlucose && profile.fastingGlucose >= 6.1) return '空腹血糖偏高，记得定时监测，少喝含糖饮料 🩸';
    return '该起来活动一下啦！久坐会影响血糖，起来喝杯水、走两步吧 💧';
  }

  function checkMedicineReminder() {
    var reminders = loadJSON('reminders', []);
    if (!Array.isArray(reminders) || reminders.length === 0) return null;

    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var key = now.getHours() + ':' + now.getMinutes();
    var state = getPetState();

    if (state.lastMedicineCheck === key) return null;

    for (var i = 0; i < reminders.length; i++) {
      var r = reminders[i];
      if (r.type === 'medicine' && r.active !== false) {
        var reminderMinutes = parseTimeToMinutes(r.time);
        if (reminderMinutes !== null && Math.abs(currentMinutes - reminderMinutes) <= 1) {
          state.lastMedicineCheck = key;
          savePetState(state);
          return '该吃药啦！' + (r.title || '记得按时服药');
        }
      }
    }
    return null;
  }

  function checkGlucoseReminder() {
    var reminders = loadJSON('reminders', []);
    if (!Array.isArray(reminders) || reminders.length === 0) return null;

    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var key = now.getHours() + ':' + now.getMinutes();
    var state = getPetState();

    if (state.lastGlucoseCheck === key) return null;

    for (var i = 0; i < reminders.length; i++) {
      var r = reminders[i];
      if (r.type === 'measure' && r.active !== false) {
        var reminderMinutes = parseTimeToMinutes(r.time);
        if (reminderMinutes !== null && Math.abs(currentMinutes - reminderMinutes) <= 1) {
          state.lastGlucoseCheck = key;
          savePetState(state);
          return '该测血糖啦！' + (r.title || '记得定时测量');
        }
      }
    }
    return null;
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    var parts = timeStr.split(':');
    if (parts.length < 2) return null;
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  /* ========== 状态控制：睡觉 / 吃东西 ========== */
  function resetIdleTimer() {
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }
    if (isSleeping) {
      wakeUp();
    }
    // 空闲 30 秒后自动入睡
    sleepTimer = setTimeout(goToSleep, 30000);
  }

  function goToSleep() {
    if (isSleeping || isDragging || isEating || petEl.classList.contains('tk-pet--alert')) return;
    isSleeping = true;
    petEl.classList.remove('tk-pet--walking');
    petEl.classList.add('tk-pet--sleeping');
    if (walkTimer) {
      clearTimeout(walkTimer);
      walkTimer = null;
    }
  }

  function wakeUp() {
    if (!isSleeping) return;
    isSleeping = false;
    petEl.classList.remove('tk-pet--sleeping');
    if (getPetState().skills.auto_walk) {
      scheduleNextWalk();
    }
  }

  function doEat() {
    if (isEating || isDragging || petEl.classList.contains('tk-pet--alert')) {
      scheduleNextWalk();
      return;
    }
    isEating = true;
    petEl.classList.add('tk-pet--eating');
    resetIdleTimer();

    if (eatTimer) clearTimeout(eatTimer);
    eatTimer = setTimeout(function () {
      isEating = false;
      petEl.classList.remove('tk-pet--eating');
      scheduleNextWalk();
    }, 3000);
  }

  /* ========== 随机走动 ========== */
  function startWalkSystem() {
    resetIdleTimer();
    scheduleNextWalk();
  }

  function scheduleNextWalk() {
    var delay = 5000 + Math.random() * 10000;
    if (walkTimer) clearTimeout(walkTimer);
    walkTimer = setTimeout(doRandomWalk, delay);
  }

  function doRandomWalk() {
    var state = getPetState();
    if (!state.skills.auto_walk || isDragging || isSleeping || isEating || petEl.classList.contains('tk-pet--alert')) {
      scheduleNextWalk();
      return;
    }

    // 约 25% 概率改为吃东西
    if (Math.random() < 0.25) {
      doEat();
      return;
    }

    var rect = petEl.getBoundingClientRect();
    var maxX = window.innerWidth - rect.width;
    var currentX = rect.left;
    var targetX = Math.max(0, Math.min(maxX, currentX + (Math.random() - 0.5) * 300));

    petEl.classList.add('tk-pet--walking');
    resetIdleTimer();

    var duration = 800 + Math.random() * 600;
    var startTime = Date.now();

    function step() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      var newX = currentX + (targetX - currentX) * ease;

      petEl.style.right = 'auto';
      petEl.style.bottom = '24px';
      petEl.style.left = newX + 'px';
      petEl.style.top = 'auto';

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        petEl.classList.remove('tk-pet--walking');
        saveJSON('tk_pet_pos_v2', { x: targetX, y: window.innerHeight - rect.height - 24 });
        scheduleNextWalk();
      }
    }

    requestAnimationFrame(step);
  }

  /* ========== 拖拽支持 ========== */
  function onDragStart(e) {
    if (e.target.closest && e.target.closest('.tk-pet__panel')) return;

    isDragging = true;
    hasDragged = false;
    petEl.classList.add('tk-pet--dragging');
    petEl.classList.remove('tk-pet--walking');
    resetIdleTimer();

    if (walkTimer) {
      clearTimeout(walkTimer);
      walkTimer = null;
    }

    var point = getPointerPoint(e);
    dragStartX = point.x;
    dragStartY = point.y;

    var pos = getCurrentPosition();
    petStartX = pos.x;
    petStartY = pos.y;

    if (e.preventDefault) e.preventDefault();
  }


  function onDragMove(e) {
    if (!isDragging) return;

    var point = getPointerPoint(e);
    var dx = point.x - dragStartX;
    var dy = point.y - dragStartY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged = true;
    }

    var newX = petStartX + dx;
    var newY = petStartY + dy;

    newX = Math.max(0, Math.min(window.innerWidth - petEl.offsetWidth, newX));
    newY = Math.max(0, Math.min(window.innerHeight - petEl.offsetHeight, newY));

    applyPosition(newX, newY);
    if (e.preventDefault) e.preventDefault();
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    petEl.classList.remove('tk-pet--dragging');
    resetIdleTimer();

    if (hasDragged) {
      var pos = getCurrentPosition();
      saveJSON('tk_pet_pos_v2', { x: pos.x, y: pos.y });
      scheduleNextWalk();
    }
  }

  function getPointerPoint(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function getCurrentPosition() {
    if (!petEl) return { x: 0, y: 0 };
    var rect = petEl.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  function applyPosition(x, y) {
    if (!petEl) return;
    petEl.style.right = 'auto';
    petEl.style.bottom = 'auto';
    petEl.style.left = x + 'px';
    petEl.style.top = y + 'px';
  }

  function restorePosition() {
    var pos = loadJSON('tk_pet_pos_v2', null);
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
      var w = petEl ? petEl.offsetWidth : 80;
      var h = petEl ? petEl.offsetHeight : 80;
      var maxX = window.innerWidth - w;
      var maxY = window.innerHeight - h;
      // 忽略非法/默认位置缓存，让 CSS 右下角定位生效
      if (pos.x <= 0 && pos.y <= 0) return;
      var x = Math.max(0, Math.min(maxX, pos.x));
      var y = Math.max(0, Math.min(maxY, pos.y));
      applyPosition(x, y);
    }
  }

  /* ========== 健康贴士 ========== */
  function showRandomTip() {
    var index = Math.floor(Math.random() * HEALTH_TIPS.length);
    var tip = HEALTH_TIPS[index];
    showBubble(tip, true);
    // 把当前贴士暂存到按钮上，方便点击时作为默认问题
    if (bubbleAiBtnEl) {
      bubbleAiBtnEl.setAttribute('data-question', tip);
    }
  }

  /* ========== 事件绑定 ========== */
  function bindEvents() {
    petEl.addEventListener('click', function (e) {
      if (hasDragged) return;
      if (e.target.closest && e.target.closest('.tk-pet__settings-btn')) return;

      resetIdleTimer();

      // 点击触发开心跳跃 + 表情变化（切换为 alert 图）
      petEl.classList.remove('tk-pet--happy');
      void petEl.offsetWidth; // 强制重绘，让动画可重复触发
      petEl.classList.add('tk-pet--happy');
      setExpressionImage();
      if (happyTimer) clearTimeout(happyTimer);
      if (expressionTimer) clearTimeout(expressionTimer);
      happyTimer = setTimeout(function () {
        petEl.classList.remove('tk-pet--happy');
      }, 600);
      expressionTimer = setTimeout(function () {
        restoreCharacterImage();
      }, 600);

      var state = getPetState();
      if (state.skills.health_tip) {
        showRandomTip();
      } else {
        togglePanel();
      }
    });


    if (bubbleAiBtnEl) {
      bubbleAiBtnEl.addEventListener('click', function (e) {
        e.stopPropagation();
        var question = bubbleAiBtnEl.getAttribute('data-question') || '';
        askAIWithQuestion(question);
      });
    }

    panelCloseEl.addEventListener('click', function (e) {
      e.stopPropagation();
      hidePanel();
      resetIdleTimer();
    });

    settingsBtnEl.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
      resetIdleTimer();
    });

    panelEl.addEventListener('click', function (e) {
      e.stopPropagation();
      resetIdleTimer();

      // 标签切换
      var tab = e.target.closest && e.target.closest('.tk-pet__panel-tab');
      if (tab) {
        switchPanelTab(tab.getAttribute('data-tab'));
        return;
      }

      // AI 快捷问题
      var quickBtn = e.target.closest && e.target.closest('.tk-pet__ai-quick button');
      if (quickBtn) {
        var q = quickBtn.getAttribute('data-q');
        if (q) sendPetAIMessage(q);
        return;
      }

      // AI 发送按钮
      if (e.target.closest && e.target.closest('#tk-pet-ai-send')) {
        var input = document.getElementById('tk-pet-ai-input');
        if (input && input.value.trim()) {
          sendPetAIMessage(input.value.trim());
          input.value = '';
        }
        return;
      }
    });

    document.addEventListener('click', function (e) {
      if (panelVisible && petEl && !petEl.contains(e.target)) {
        hidePanel();
      }
    });

    petEl.addEventListener('mouseenter', resetIdleTimer);

    petEl.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    petEl.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    window.addEventListener('storage', function (e) {
      if (e.key === 'tk_risk_level') {
        syncRiskLevel();
      }
    });

    window.addEventListener('resize', function () {
      var pos = getCurrentPosition();
      var maxX = window.innerWidth - (petEl ? petEl.offsetWidth : 80);
      var maxY = window.innerHeight - (petEl ? petEl.offsetHeight : 80);
      if (pos.x > maxX || pos.y > maxY) {
        var newX = Math.min(pos.x, maxX);
        var newY = Math.min(pos.y, maxY);
        applyPosition(newX, newY);
        saveJSON('tk_pet_pos_v2', { x: newX, y: newY });
      }
    });
  }

  /* ========== API 同步 ========== */
  function tryAPISync() {
    var token = localStorage.getItem('tk_token');
    if (!token) return;

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', API_BASE + '/api/pet/state', true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.timeout = 5000;
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var resp = JSON.parse(xhr.responseText);
            var data = resp.pet || resp;
            if (data) {
              var localState = getPetState();
              if (data.character_id) localState.characterId = data.character_id;
              if (data.pet_name) {
                for (var i = 0; i < CHARACTERS.length; i++) {
                  if (CHARACTERS[i].name === data.pet_name) {
                    localState.characterId = CHARACTERS[i].id;
                    break;
                  }
                }
              }
              var apiSkills = typeof data.skills_config === 'string' ? JSON.parse(data.skills_config) : data.skills_config;
              if (apiSkills) {
                for (var k in apiSkills) {
                  if (apiSkills.hasOwnProperty(k)) localState.skills[k] = apiSkills[k];
                }
              }
              savePetState(localState);
              currentCharacter = getCharacterById(localState.characterId);
              renderCharacter();
              renderPanel();
            }
          } catch (e) {}
        }
      };
      xhr.onerror = function () {};
      xhr.ontimeout = function () {};
      xhr.send();
    } catch (e) {}
  }

  function tryAPISaveState(state) {
    var token = localStorage.getItem('tk_token');
    if (!token) return;

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', API_BASE + '/api/pet/state', true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 5000;
      xhr.onload = function () {};
      xhr.onerror = function () {};
      xhr.ontimeout = function () {};
      xhr.send(JSON.stringify({
        pet_name: currentCharacter ? currentCharacter.name : '糖糖',
        skills_config: state.skills
      }));
    } catch (e) {}
  }

  /* ========== 自动初始化 ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTkPet);
  } else {
    initTkPet();
  }

})();

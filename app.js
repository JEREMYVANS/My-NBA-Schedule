// 获取球队LOGO
function getTeamLogo(abbreviation) {
    // 处理特殊球队的缩写
    const logoMap = {
        'NOP': 'no', // New Orleans Pelicans
        'UTAH': 'utah', // Utah Jazz (有些API用UTAH)
        'UTA': 'utah'  // Utah Jazz
    };
    
    const logoAbbr = logoMap[abbreviation.toUpperCase()] || abbreviation.toLowerCase();
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${logoAbbr}.png&h=100&w=100`;
}

// 国际化资源
const translations = {
    zh: {
        pageTitle: 'NBA赛程速览',
        selectDate: '选择日期',
        selectedLabel: '已选择：',
        schedule: '赛程',
        easternConference: '东部排名',
        westernConference: '西部排名',
        noSchedule: '该日无赛程',
        footerTitle: 'NBA赛程速览',
        footerText: '© 2026 NBA赛程应用 | 数据仅供参考',
        weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        dateFormat: 'YYYY年MM月DD日 WW'
    },
    en: {
        pageTitle: 'NBA Schedule',
        selectDate: 'Select Date',
        selectedLabel: 'Selected: ',
        schedule: 'Schedule',
        easternConference: 'Eastern Conference',
        westernConference: 'Western Conference',
        noSchedule: 'No games scheduled',
        footerTitle: 'NBA Schedule',
        footerText: '© 2026 NBA Schedule App | Data for reference only',
        weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        dateFormat: 'WW, MM DD, YYYY'
    }
};

// 当前语言
let currentLanguage = 'zh';

// 日历相关变量
let currentCalendarDate = new Date();
let selectedDate = new Date();

// 工具函数：解析日期字符串为本地日期对象
function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// 工具函数：格式化日期为本地字符串（YYYY-MM-DD）
function formatDateStr(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 获取翻译文本
function t(key) {
    return translations[currentLanguage][key] || key;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = translations[currentLanguage].weekDays;
    const weekDay = weekDays[date.getDay()];
    
    if (currentLanguage === 'zh') {
        return `${year}年${month}月${day}日 ${weekDay}`;
    } else {
        const monthNames = translations[currentLanguage].monthNames;
        return `${weekDay}, ${monthNames[date.getMonth()]} ${day}, ${year}`;
    }
}

// 切换语言
async function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('nbaLanguage', lang);
    updateUI();
    renderCalendar();
    updateSelectedDateDisplay();
    
    // 重新渲染当前赛程
    const currentSchedule = await generateSchedule(selectedDate);
    renderSchedule(currentSchedule, selectedDate);
}

// 更新UI文本
function updateUI() {
    document.getElementById('page-title').textContent = t('pageTitle');
    document.getElementById('select-date-title').textContent = t('selectDate');
    document.getElementById('selected-label').textContent = t('selectedLabel');
    document.getElementById('schedule-title').textContent = t('schedule');
    document.getElementById('footer-title').textContent = t('footerTitle');
    document.getElementById('footer-text').textContent = t('footerText');
    
    // 更新排名标题
    const easternTitle = document.getElementById('eastern-title');
    if (easternTitle) {
        easternTitle.innerHTML = `<i class="fa fa-map-marker mr-2 text-nba-secondary"></i>${t('easternConference')}`;
    }
    
    const westernTitle = document.getElementById('western-title');
    if (westernTitle) {
        westernTitle.innerHTML = `<i class="fa fa-map-marker mr-2 text-nba-primary"></i>${t('westernConference')}`;
    }
    
    document.title = t('pageTitle');
}

// 渲染日历
function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const calendarTitle = document.getElementById('calendar-title');
    
    if (!calendarDays || !calendarTitle) {
        console.error('日历元素未找到');
        return;
    }
    
    // 设置标题
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = translations[currentLanguage].monthNames;
    const weekDays = translations[currentLanguage].weekDays;
    
    if (currentLanguage === 'zh') {
        calendarTitle.textContent = `${year}年 ${monthNames[month]}`;
    } else {
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
    }
    
    // 更新星期标题
    const weekDayHeaders = document.querySelectorAll('.week-header div');
    weekDayHeaders.forEach((header, index) => {
        header.textContent = weekDays[index];
    });
    
    // 清空日历
    calendarDays.innerHTML = '';
    
    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取第一天是星期几（0 = 周日）
    const startDay = firstDay.getDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 添加上个月的填充日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'text-center py-4 text-gray-300 text-sm bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-600';
        dayDiv.textContent = prevMonthLastDay - (startDay - i - 1);
        calendarDays.appendChild(dayDiv);
    }
    
    // 添加当月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        const todayTemp = new Date();
        todayTemp.setHours(0, 0, 0, 0);
        const isToday = currentDate.getTime() === todayTemp.getTime();
        
        const selectedDateTemp = new Date(selectedDate);
        selectedDateTemp.setHours(0, 0, 0, 0);
        const isSelected = currentDate.getTime() === selectedDateTemp.getTime();
        
        let className = 'text-center py-4 rounded-lg cursor-pointer transition-all-300 hover:bg-gray-100 font-medium dark:hover:bg-gray-700 dark:text-gray-300';
        if (isSelected) {
            className = 'text-center py-4 rounded-lg cursor-pointer transition-all-300 bg-nba-primary text-white font-bold shadow-md';
        } else if (isToday) {
            className = 'text-center py-4 rounded-lg cursor-pointer transition-all-300 bg-nba-secondary bg-opacity-20 text-nba-secondary font-bold border-2 border-nba-secondary dark:bg-opacity-40';
        }
        
        dayDiv.className = className;
        dayDiv.textContent = day;
        dayDiv.dataset.date = formatDateStr(currentDate);
        dayDiv.style.fontSize = '16px';
        dayDiv.style.minHeight = '48px';
        dayDiv.style.display = 'flex';
        dayDiv.style.alignItems = 'center';
        dayDiv.style.justifyContent = 'center';
        
        dayDiv.addEventListener('click', async function(e) {
            e.stopPropagation();
            selectedDate = parseDate(this.dataset.date);
            renderCalendar();
            updateSelectedDateDisplay();
            
            // 直接加载赛程
            const newSchedule = await generateSchedule(selectedDate);
            renderSchedule(newSchedule, selectedDate);
        });
        
        calendarDays.appendChild(dayDiv);
    }
    
    // 添加下个月的填充日期 - 只显示5行（35天）
    const totalDays = startDay + lastDay.getDate();
    const remainingDays = 35 - totalDays; // 5行 * 7列
    if (remainingDays > 0) {
        for (let day = 1; day <= remainingDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'text-center py-4 text-gray-300 text-sm bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-600';
            dayDiv.textContent = day;
            calendarDays.appendChild(dayDiv);
        }
    }
    
    updateSelectedDateDisplay();
}

// 更新选中日期显示
function updateSelectedDateDisplay() {
    const display = document.getElementById('selected-date-display');
    display.textContent = formatDate(formatDateStr(selectedDate));
}

// 获取真实NBA赛程数据
async function generateSchedule(selectedDateInput) {
    const schedule = [];
    
    const targetDate = parseDate(formatDateStr(new Date(selectedDateInput)));
    
    try {
        const year = targetDate.getFullYear();
        const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const day = targetDate.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
        
        const response = await fetch(`/api/schedule?date=${formattedDate}`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.events) {
                for (const event of data.events) {
                    const localDate = new Date(event.date);
                    const timeString = localDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    let homeTeam, awayTeam, homeScore, awayScore;
                    if (event.competitions[0].competitors[0].homeAway === 'home') {
                        homeTeam = {
                            id: 0,
                            name: event.competitions[0].competitors[0].team.displayName,
                            abbreviation: event.competitions[0].competitors[0].team.abbreviation
                        };
                        awayTeam = {
                            id: 0,
                            name: event.competitions[0].competitors[1].team.displayName,
                            abbreviation: event.competitions[0].competitors[1].team.abbreviation
                        };
                        homeScore = event.competitions[0].competitors[0].score || 0;
                        awayScore = event.competitions[0].competitors[1].score || 0;
                    } else {
                        awayTeam = {
                            id: 0,
                            name: event.competitions[0].competitors[0].team.displayName,
                            abbreviation: event.competitions[0].competitors[0].team.abbreviation
                        };
                        homeTeam = {
                            id: 0,
                            name: event.competitions[0].competitors[1].team.displayName,
                            abbreviation: event.competitions[0].competitors[1].team.abbreviation
                        };
                        awayScore = event.competitions[0].competitors[0].score || 0;
                        homeScore = event.competitions[0].competitors[1].score || 0;
                    }
                    
                    const gameData = {
                        id: event.id,
                        date: formatDateStr(targetDate),
                        time: timeString,
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        homeScore: homeScore,
                        awayScore: awayScore,
                        status: event.status.type.name.toLowerCase(),
                        venue: event.competitions[0].venue?.name || '未知场馆'
                    };
                    
                    schedule.push(gameData);
                }
            }
        }
    } catch (error) {
        console.error('获取赛程失败:', error);
    }
    
    const uniqueSchedule = [];
    const gameIds = new Set();
    
    for (const game of schedule) {
        if (!gameIds.has(game.id)) {
            gameIds.add(game.id);
            uniqueSchedule.push(game);
        }
    }
    
    return uniqueSchedule;
}

// 渲染赛程
function renderSchedule(schedule, selectedDateInput) {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';
    
    // 显示日期标题
    const dateHeader = document.createElement('div');
    dateHeader.className = 'mb-6';
    dateHeader.innerHTML = `
        <h3 class="text-lg font-display font-bold mb-4 text-nba-secondary">${formatDate(formatDateStr(selectedDateInput))}</h3>
    `;
    container.appendChild(dateHeader);
    
    if (schedule.length === 0) {
        container.innerHTML += `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100 animate-fade-in dark:bg-nba-dark-gray dark:border-gray-700">
                <p class="text-center py-8 text-gray-500 dark:text-gray-400">${t('noSchedule')}</p>
            </div>
        `;
        return;
    }
    
    // 渲染每一场比赛
    schedule.forEach((game, index) => {
        const gameSection = document.createElement('div');
        gameSection.className = 'bg-gray-50 rounded-lg p-4 md:p-6 hover:shadow-md transition-all-300 border border-gray-100 hover-scale animate-slide-up dark:bg-nba-dark-gray dark:border-gray-700';
        gameSection.style.animationDelay = `${index * 0.1}s`;
        
        gameSection.innerHTML = `
            <div class="flex justify-end items-center mb-4">
                <span class="text-xs md:text-sm font-medium whitespace-nowrap">${game.time}</span>
            </div>
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="${getTeamLogo(game.awayTeam.abbreviation)}" alt="${game.awayTeam.name}" class="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" onerror="this.style.display='none'">
                        <span class="font-medium text-sm md:text-base">${game.awayTeam.name}</span>
                    </div>
                    <div class="text-xl md:text-2xl font-bold text-nba-primary">${game.awayScore}</div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="${getTeamLogo(game.homeTeam.abbreviation)}" alt="${game.homeTeam.name}" class="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" onerror="this.style.display='none'">
                        <span class="font-medium text-sm md:text-base">${game.homeTeam.name}</span>
                    </div>
                    <div class="text-xl md:text-2xl font-bold text-nba-secondary">${game.homeScore}</div>
                </div>
            </div>
        `;
        
        container.appendChild(gameSection);
    });
}

// 获取 NBA 排名数据
async function getStandings() {
    const standings = {
        eastern: [],
        western: []
    };
    
    try {
        const response = await fetch('/api/standings');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.children && data.children.length > 0) {
                for (const conference of data.children) {
                    const conferenceName = conference.name.toLowerCase().includes('east') ? 'eastern' : 'western';
                    
                    if (conference.standings && conference.standings.entries && conference.standings.entries.length > 0) {
                        for (const entry of conference.standings.entries) {
                            const team = entry.team;
                            const stats = entry.stats || [];
                            
                            const wins = stats.find(s => s.name === 'wins')?.value || 0;
                            const losses = stats.find(s => s.name === 'losses')?.value || 0;
                            const winPercent = stats.find(s => s.name === 'winPercent')?.value || 0;
                            
                            const teamData = {
                                name: team.displayName,
                                abbreviation: team.abbreviation,
                                wins: wins,
                                losses: losses,
                                percentage: winPercent
                            };
                            standings[conferenceName].push(teamData);
                        }
                    }
                }
                
                standings.eastern.sort((a, b) => b.percentage - a.percentage);
                standings.western.sort((a, b) => b.percentage - a.percentage);
            }
        }
    } catch (error) {
        console.error('获取排名失败:', error);
    }
    
    return standings;
}

// 渲染排名
function renderStandings(standings) {
    // 渲染东部排名
    const easternContainer = document.getElementById('eastern-conference');
    easternContainer.innerHTML = '';
    
    standings.eastern.forEach((team, index) => {
        const teamItem = document.createElement('div');
        teamItem.className = 'flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all-300 dark:bg-nba-dark-gray dark:hover:bg-gray-700';
        
        teamItem.innerHTML = `
            <div class="flex items-center space-x-2 flex-1 min-w-0">
                <span class="font-bold text-sm w-6 text-center text-gray-700 dark:text-gray-300 flex-shrink-0">${index + 1}</span>
                <img src="${getTeamLogo(team.abbreviation)}" alt="${team.name}" class="w-7 h-7 object-contain flex-shrink-0" onerror="this.style.display='none'">
                <span class="font-medium text-xs truncate dark:text-gray-300">${team.name}</span>
            </div>
            <span class="font-semibold text-xs text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">${team.wins}-${team.losses}</span>
        `;
        
        easternContainer.appendChild(teamItem);
    });
    
    // 渲染西部排名
    const westernContainer = document.getElementById('western-conference');
    westernContainer.innerHTML = '';
    
    standings.western.forEach((team, index) => {
        const teamItem = document.createElement('div');
        teamItem.className = 'flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all-300 dark:bg-nba-dark-gray dark:hover:bg-gray-700';
        
        teamItem.innerHTML = `
            <div class="flex items-center space-x-2 flex-1 min-w-0">
                <span class="font-bold text-sm w-6 text-center text-gray-700 dark:text-gray-300 flex-shrink-0">${index + 1}</span>
                <img src="${getTeamLogo(team.abbreviation)}" alt="${team.name}" class="w-7 h-7 object-contain flex-shrink-0" onerror="this.style.display='none'">
                <span class="font-medium text-xs truncate dark:text-gray-300">${team.name}</span>
            </div>
            <span class="font-semibold text-xs text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">${team.wins}-${team.losses}</span>
        `;
        
        westernContainer.appendChild(teamItem);
    });
}

// 切换夜间模式
function toggleDarkMode() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.toggle('dark');
    
    // 更新图标
    const icon = document.querySelector('#dark-mode-toggle i');
    if (isDark) {
        icon.className = 'fa fa-sun-o text-xl';
        localStorage.setItem('darkMode', 'true');
    } else {
        icon.className = 'fa fa-moon-o text-xl';
        localStorage.setItem('darkMode', 'false');
    }
}

// 初始化夜间模式
function initDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const htmlElement = document.documentElement;
    const icon = document.querySelector('#dark-mode-toggle i');
    
    if (savedDarkMode === 'true') {
        htmlElement.classList.add('dark');
        if (icon) {
            icon.className = 'fa fa-sun-o text-xl';
        }
    } else {
        htmlElement.classList.remove('dark');
        if (icon) {
            icon.className = 'fa fa-moon-o text-xl';
        }
    }
}

// 初始化应用
function initApp() {
    // 初始化夜间模式
    initDarkMode();
    
    // 从localStorage读取语言设置
    const savedLanguage = localStorage.getItem('nbaLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById('language-select').value = savedLanguage;
    }
    
    // 设置默认日期为今天
    const today = new Date();
    selectedDate = new Date(today);
    currentCalendarDate = new Date(today);
    
    // 更新UI文本
    updateUI();
    
    // 渲染日历
    renderCalendar();
    
    // 绑定夜间模式切换
    document.getElementById('dark-mode-toggle').addEventListener('click', function() {
        toggleDarkMode();
    });
    
    // 绑定语言选择器
    document.getElementById('language-select').addEventListener('change', async function() {
        await switchLanguage(this.value);
    });
    
    // 绑定月份切换按钮
    document.getElementById('prev-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // 生成并渲染初始赛程
    async function loadInitialSchedule() {
        try {
            const initialSchedule = await generateSchedule(today);
            renderSchedule(initialSchedule, today);
        } catch (error) {
            console.error('加载初始赛程失败:', error);
            renderSchedule([], today);
        }
    }
    
    // 加载并渲染排名
    async function loadStandings() {
        try {
            const standings = await getStandings();
            renderStandings(standings);
        } catch (error) {
            console.error('加载排名失败:', error);
        }
    }
    
    loadInitialSchedule();
    loadStandings();
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

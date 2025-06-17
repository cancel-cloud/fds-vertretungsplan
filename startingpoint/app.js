// Substitution Plan Application

// Sample data for substitutions and categories
const sampleData = {
  sampleSubstitutions: [
    {"data": ["1 - 4", "07:45-11:00", "10A BK", "BT-LF06", "B207 (A304)", "WIRM", "Raumänderung", ""], "group": "10A BK"},
    {"data": ["7 - 8", "13:15-14:45", "10A BK", "BT-LF05", "A304", "HOFF", "Entfall", ""], "group": "10A BK"},
    {"data": ["1 - 4", "07:45-11:00", "11A BZ", "BT-LF09-BZ", "A210 (A307)", "WIES (HOFF)", "Vertretung", ""], "group": "11A BZ"},
    {"data": ["5", "11:15-12:00", "11A KF", "POWI", "AE01", "DICK (DONE)", "Sondereinsatz", ""], "group": "11A KF"},
    {"data": ["3 - 4", "09:30-11:00", "12B FO", "MAT", "B102", "SCHM", "EVA", "Selbstständiges Arbeiten"], "group": "12B FO"},
    {"data": ["7 - 8", "13:15-14:45", "12A TI", "Prüfung", "A305", "MUEL", "Klausur", "Abschlussklausur"], "group": "12A TI"},
    {"data": ["5 - 6", "11:15-12:45", "13BG", "TECH", "Labor", "---", "Freisetzung", "Praktikum"], "group": "13BG"},
    {"data": ["2", "08:30-09:15", "11C FO", "ENG", "B204", "HANS", "Sonstiges", "Zusatztermin"], "group": "11C FO"}
  ],
  categories: [
    {"key": "Entfall", "label": "Entfall", "priority": 1, "color": "#C0152F"},
    {"key": "Raumänderung", "label": "Raumänderung", "priority": 2, "color": "#1FB8CD"},
    {"key": "Vertretung", "label": "Vertretung", "priority": 3, "color": "#5D878F"},
    {"key": "Sondereinsatz", "label": "Sondereinsatz", "priority": 4, "color": "#944454"},
    {"key": "EVA", "label": "EVA", "priority": 5, "color": "#FFC185"},
    {"key": "Klausur", "label": "Klausur", "priority": 6, "color": "#D2BA4C"},
    {"key": "Freisetzung", "label": "Freisetzung", "priority": 7, "color": "#13343B"},
    {"key": "Sonstiges", "label": "Sonstiges", "priority": 8, "color": "#626C71"}
  ]
};

// Global variables to store component instances
let themeManager, calendarWidget, mobileMenu, substitutionManager, legalPagesManager, welcomeManager;

// Theme management
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themes = ['system', 'light', 'dark'];
    this.currentThemeIndex = 0;
    
    if (!this.themeToggle) {
      console.error('Theme toggle button not found');
      return;
    }
    
    // Initialize theme
    const savedTheme = this.getSavedTheme();
    if (savedTheme) {
      this.setTheme(savedTheme);
      this.currentThemeIndex = this.themes.indexOf(savedTheme);
    } else {
      this.setTheme('system');
    }
    
    // Set up event listener
    this.themeToggle.addEventListener('click', () => this.cycleTheme());
  }
  
  getSavedTheme() {
    try {
      return sessionStorage.getItem('theme');
    } catch (e) {
      console.warn('Session storage not available, using default theme');
      return null;
    }
  }
  
  saveTheme(theme) {
    try {
      sessionStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Could not save theme to session storage');
    }
  }
  
  setTheme(theme) {
    // Remove existing theme attribute
    document.documentElement.removeAttribute('data-color-scheme');
    
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-color-scheme', prefersDark ? 'dark' : 'light');
    } else {
      // Set explicit theme
      document.documentElement.setAttribute('data-color-scheme', theme);
    }
    
    // Update toggle button
    if (this.themeToggle) {
      this.themeToggle.setAttribute('data-theme', theme);
    }
    this.saveTheme(theme);
  }
  
  cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const newTheme = this.themes[this.currentThemeIndex];
    this.setTheme(newTheme);
  }
}

// Calendar functionality
class CalendarWidget {
  constructor(containerId, mobileContainerId) {
    this.container = document.getElementById(containerId);
    this.mobileContainer = document.getElementById(mobileContainerId);
    this.currentMonthElement = document.getElementById('current-month');
    this.currentMonthMobileElement = document.getElementById('current-month-mobile');
    this.prevMonthButton = document.getElementById('prev-month');
    this.nextMonthButton = document.getElementById('next-month');
    this.prevMonthMobileButton = document.getElementById('prev-month-mobile');
    this.nextMonthMobileButton = document.getElementById('next-month-mobile');
    
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    
    // Event listeners
    if (this.prevMonthButton) this.prevMonthButton.addEventListener('click', () => this.previousMonth());
    if (this.nextMonthButton) this.nextMonthButton.addEventListener('click', () => this.nextMonth());
    if (this.prevMonthMobileButton) this.prevMonthMobileButton.addEventListener('click', () => this.previousMonth());
    if (this.nextMonthMobileButton) this.nextMonthMobileButton.addEventListener('click', () => this.nextMonth());
    
    // Initialize calendar
    this.renderCalendar();
  }
  
  renderCalendar() {
    if (!this.container || !this.mobileContainer) return;
    
    this.container.innerHTML = '';
    this.mobileContainer.innerHTML = '';
    
    // Set month and year in header
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    
    const monthYear = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    if (this.currentMonthElement) this.currentMonthElement.textContent = monthYear;
    if (this.currentMonthMobileElement) this.currentMonthMobileElement.textContent = monthYear;
    
    // Create day headers
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      this.container.appendChild(dayHeader);
      
      const dayHeaderMobile = dayHeader.cloneNode(true);
      this.mobileContainer.appendChild(dayHeaderMobile);
    });
    
    // Get first day of month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7 for European calendar
    
    // Get number of days in month
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Get days from previous month
    const prevMonthDays = startingDay - 1;
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    // Days from previous month
    for (let i = prevMonthDays; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      this.createDayElement(day, true, false, this.container);
      this.createDayElement(day, true, false, this.mobileContainer);
    }
    
    // Days of current month
    const today = new Date();
    const isCurrentMonth = today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;
    
    for (let i = 1; i <= totalDays; i++) {
      const isToday = isCurrentMonth && i === today.getDate();
      const isSelected = this.selectedDate.getDate() === i && 
                         this.selectedDate.getMonth() === this.currentMonth && 
                         this.selectedDate.getFullYear() === this.currentYear;
      
      this.createDayElement(i, false, isToday, this.container, isSelected);
      this.createDayElement(i, false, isToday, this.mobileContainer, isSelected);
    }
    
    // Calculate days needed from next month
    const totalCells = 42; // 6 rows of 7 days
    const nextMonthDays = totalCells - (prevMonthDays + totalDays);
    
    // Days from next month
    for (let i = 1; i <= nextMonthDays; i++) {
      this.createDayElement(i, true, false, this.container);
      this.createDayElement(i, true, false, this.mobileContainer);
    }
  }
  
  createDayElement(day, isOtherMonth, isToday, container, isSelected = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    }
    
    if (isToday) {
      dayElement.classList.add('today');
    }
    
    if (isSelected) {
      dayElement.classList.add('selected');
    }
    
    dayElement.addEventListener('click', () => {
      if (isOtherMonth) {
        // Handle clicking on previous/next month days
        if (day > 20) {
          this.previousMonth();
        } else {
          this.nextMonth();
        }
        setTimeout(() => {
          // Select the day in the new month
          this.selectDate(day);
        }, 50);
      } else {
        this.selectDate(day);
      }
    });
    
    container.appendChild(dayElement);
  }
  
  selectDate(day) {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.renderCalendar();
    
    // Dispatch event for date selection
    const event = new CustomEvent('dateSelected', {
      detail: {
        date: this.selectedDate
      }
    });
    document.dispatchEvent(event);
    
    // Update the button text
    updateButtonText(this.selectedDate);
  }
  
  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
  }
  
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }
  
  getSelectedDate() {
    return this.selectedDate;
  }
  
  formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

// Mobile Menu Management
class MobileMenu {
  constructor() {
    this.menuToggle = document.getElementById('mobile-menu-toggle');
    this.menuOverlay = document.getElementById('mobile-menu-overlay');
    this.closeButton = document.getElementById('close-mobile-menu');
    
    if (!this.menuToggle || !this.menuOverlay || !this.closeButton) {
      console.error('Mobile menu elements not found');
      return;
    }
    
    this.menuToggle.addEventListener('click', () => this.openMenu());
    this.closeButton.addEventListener('click', () => this.closeMenu());
    this.menuOverlay.addEventListener('click', (e) => {
      if (e.target === this.menuOverlay) {
        this.closeMenu();
      }
    });
  }
  
  openMenu() {
    if (this.menuOverlay) {
      this.menuOverlay.classList.remove('hidden');
      setTimeout(() => {
        this.menuOverlay.classList.add('active');
      }, 10);
    }
  }
  
  closeMenu() {
    if (this.menuOverlay) {
      this.menuOverlay.classList.remove('active');
      setTimeout(() => {
        this.menuOverlay.classList.add('hidden');
      }, 300);
    }
  }
}

// Substitution Management
class SubstitutionManager {
  constructor(data) {
    this.data = data;
    this.substitutionsGrid = document.getElementById('substitutions-grid');
    this.loadingState = document.getElementById('loading-state');
    this.errorState = document.getElementById('error-state');
    this.noResults = document.getElementById('no-results');
    this.searchResultsInfo = document.getElementById('search-results-info');
    this.contentTitle = document.getElementById('content-title');
    this.retryButton = document.getElementById('retry-button');
    
    this.allSubstitutions = [];
    this.filteredSubstitutions = [];
    this.activeFilters = new Set();
    
    // Initialize search
    this.searchInput = document.getElementById('search-input');
    this.mobileSearchInput = document.getElementById('search-input-mobile');
    
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.handleSearch());
    }
    if (this.mobileSearchInput) {
      this.mobileSearchInput.addEventListener('input', (e) => {
        if (this.searchInput) this.searchInput.value = e.target.value;
        this.handleSearch();
      });
    }
    
    // Initialize category filters
    this.initializeCategories();
    
    // Setup show substitutions buttons
    this.showSubstitutionsButton = document.getElementById('show-substitutions');
    this.showSubstitutionsMobileButton = document.getElementById('show-substitutions-mobile');
    
    if (this.showSubstitutionsButton) {
      this.showSubstitutionsButton.addEventListener('click', () => this.loadSubstitutions());
    }
    if (this.showSubstitutionsMobileButton) {
      this.showSubstitutionsMobileButton.addEventListener('click', () => {
        this.loadSubstitutions();
        if (mobileMenu) mobileMenu.closeMenu();
      });
    }
    
    if (this.retryButton) {
      this.retryButton.addEventListener('click', () => this.loadSubstitutions());
    }
    
    // Listen for date selection
    document.addEventListener('dateSelected', () => {
      if (calendarWidget) updateButtonText(calendarWidget.getSelectedDate());
    });
    
    // Initial load
    this.loadSubstitutions();
  }
  
  initializeCategories() {
    const categoryFilters = document.getElementById('category-filters');
    const mobileCategoryFilters = document.getElementById('category-filters-mobile');
    
    if (!categoryFilters || !mobileCategoryFilters) return;
    
    // Clear existing filters
    categoryFilters.innerHTML = '';
    mobileCategoryFilters.innerHTML = '';
    
    // Create category filters
    this.data.categories.forEach(category => {
      const filterButton = this.createCategoryFilter(category);
      const mobileFilterButton = this.createCategoryFilter(category);
      
      categoryFilters.appendChild(filterButton);
      mobileCategoryFilters.appendChild(mobileFilterButton);
    });
  }
  
  createCategoryFilter(category) {
    const filterButton = document.createElement('div');
    filterButton.className = 'category-filter';
    filterButton.dataset.category = category.key;
    
    const indicator = document.createElement('span');
    indicator.className = 'category-indicator';
    indicator.style.backgroundColor = category.color;
    
    const label = document.createElement('span');
    label.textContent = category.label;
    
    filterButton.appendChild(indicator);
    filterButton.appendChild(label);
    
    filterButton.addEventListener('click', () => {
      filterButton.classList.toggle('active');
      
      // Update all instances of this filter
      const allFilters = document.querySelectorAll(`.category-filter[data-category="${category.key}"]`);
      allFilters.forEach(filter => {
        filter.classList.toggle('active', filterButton.classList.contains('active'));
      });
      
      if (filterButton.classList.contains('active')) {
        this.activeFilters.add(category.key);
      } else {
        this.activeFilters.delete(category.key);
      }
      
      this.applyFilters();
    });
    
    return filterButton;
  }
  
  loadSubstitutions() {
    // Show loading state
    if (this.substitutionsGrid) this.substitutionsGrid.innerHTML = '';
    if (this.loadingState) this.loadingState.classList.remove('hidden');
    if (this.errorState) this.errorState.classList.add('hidden');
    if (this.noResults) this.noResults.classList.add('hidden');
    
    // Show loading spinner in buttons
    this.toggleLoadingButtons(true);
    
    // Simulate API request delay
    setTimeout(() => {
      try {
        // Process the sample data
        this.processSubstitutions(this.data.sampleSubstitutions);
        if (this.loadingState) this.loadingState.classList.add('hidden');
        this.toggleLoadingButtons(false);
      } catch (error) {
        console.error('Error loading substitutions:', error);
        this.showError('Es ist ein Fehler beim Laden der Vertretungen aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    }, 1000);
  }
  
  toggleLoadingButtons(isLoading) {
    const buttons = [this.showSubstitutionsButton, this.showSubstitutionsMobileButton].filter(Boolean);
    
    buttons.forEach(button => {
      const buttonText = button.querySelector('.button-text');
      const loadingSpinner = button.querySelector('.loading-spinner');
      
      if (isLoading) {
        if (buttonText) buttonText.classList.add('hidden');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        button.disabled = true;
      } else {
        if (buttonText) buttonText.classList.remove('hidden');
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        button.disabled = false;
      }
    });
  }
  
  showError(message) {
    if (this.loadingState) this.loadingState.classList.add('hidden');
    if (this.errorState) this.errorState.classList.remove('hidden');
    const errorText = document.getElementById('error-text');
    if (errorText) errorText.textContent = message;
    this.toggleLoadingButtons(false);
  }
  
  processSubstitutions(substitutions) {
    this.allSubstitutions = substitutions.map(sub => {
      return {
        hours: sub.data[0],
        time: sub.data[1],
        group: sub.data[2],
        subject: sub.data[3],
        room: sub.data[4],
        teacher: sub.data[5],
        type: sub.data[6] || 'Sonstiges',
        info: sub.data[7],
        originalData: sub
      };
    });
    
    // Sort substitutions by priority (Entfall first, then by hour)
    this.allSubstitutions.sort((a, b) => {
      // Entfall always comes first
      if (a.type === 'Entfall' && b.type !== 'Entfall') return -1;
      if (a.type !== 'Entfall' && b.type === 'Entfall') return 1;
      
      // Then sort by hour
      const hourA = parseInt(a.hours.split(' ')[0]);
      const hourB = parseInt(b.hours.split(' ')[0]);
      return hourA - hourB;
    });
    
    this.filteredSubstitutions = [...this.allSubstitutions];
    this.renderSubstitutions();
  }
  
  renderSubstitutions() {
    if (!this.substitutionsGrid) return;
    
    this.substitutionsGrid.innerHTML = '';
    
    if (this.filteredSubstitutions.length === 0) {
      if (this.noResults) this.noResults.classList.remove('hidden');
      if (this.searchResultsInfo) this.searchResultsInfo.classList.add('hidden');
      return;
    }
    
    if (this.noResults) this.noResults.classList.add('hidden');
    
    // Update search results info
    if (this.searchInput && this.activeFilters.size > 0 || (this.searchInput && this.searchInput.value)) {
      if (this.searchResultsInfo) {
        this.searchResultsInfo.textContent = `${this.filteredSubstitutions.length} von ${this.allSubstitutions.length} Ergebnissen`;
        this.searchResultsInfo.classList.remove('hidden');
      }
    } else {
      if (this.searchResultsInfo) this.searchResultsInfo.classList.add('hidden');
    }
    
    // Render each substitution card
    this.filteredSubstitutions.forEach(sub => {
      const card = this.createSubstitutionCard(sub);
      this.substitutionsGrid.appendChild(card);
    });
  }
  
  createSubstitutionCard(substitution) {
    const card = document.createElement('div');
    card.className = 'substitution-card';
    
    // Add appropriate class based on type
    const typeClass = this.getTypeClass(substitution.type);
    if (typeClass) {
      card.classList.add(typeClass);
    }
    
    // Card header with hours and group
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = `${substitution.hours} Std.`;
    
    const group = document.createElement('div');
    group.className = 'card-group';
    group.textContent = substitution.group;
    
    header.appendChild(title);
    header.appendChild(group);
    card.appendChild(header);
    
    // Type badge
    const typeBadge = document.createElement('div');
    typeBadge.className = 'card-type';
    typeBadge.textContent = substitution.type || 'Sonstiges';
    card.appendChild(typeBadge);
    
    // Card details
    const details = document.createElement('div');
    details.className = 'card-details';
    
    // Create detail items
    this.addDetailItem(details, 'Zeit', substitution.time);
    this.addDetailItem(details, 'Fach', substitution.subject);
    this.addDetailItem(details, 'Raum', substitution.room);
    this.addDetailItem(details, 'Lehrer', substitution.teacher);
    
    if (substitution.info) {
      this.addDetailItem(details, 'Info', substitution.info, 'span-2');
    }
    
    card.appendChild(details);
    
    return card;
  }
  
  addDetailItem(container, label, value, extraClass = '') {
    const item = document.createElement('div');
    item.className = `detail-item ${extraClass}`;
    
    const labelElement = document.createElement('span');
    labelElement.className = 'detail-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('span');
    valueElement.className = 'detail-value';
    valueElement.textContent = value;
    
    if (label === 'Fach' && value.includes('Entfall')) {
      valueElement.classList.add('cancel-info');
    }
    
    item.appendChild(labelElement);
    item.appendChild(valueElement);
    container.appendChild(item);
  }
  
  getTypeClass(type) {
    switch(type) {
      case 'Entfall':
        return 'cancel';
      case 'Raumänderung':
        return 'room-change';
      case 'Vertretung':
        return 'substitute';
      case 'Sondereinsatz':
        return 'special';
      case 'EVA':
        return 'eva';
      case 'Klausur':
        return 'exam';
      case 'Freisetzung':
        return 'release';
      default:
        return 'other';
    }
  }
  
  handleSearch() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    if (this.mobileSearchInput) this.mobileSearchInput.value = searchTerm;
    
    this.applyFilters(searchTerm);
  }
  
  applyFilters(searchTerm = (this.searchInput ? this.searchInput.value.toLowerCase() : '')) {
    if (!searchTerm && this.activeFilters.size === 0) {
      // No filters active, show all
      this.filteredSubstitutions = [...this.allSubstitutions];
    } else {
      this.filteredSubstitutions = this.allSubstitutions.filter(sub => {
        // First apply category filters if any are active
        if (this.activeFilters.size > 0) {
          if (!this.activeFilters.has(sub.type)) {
            return false;
          }
        }
        
        // Then apply search if present
        if (searchTerm) {
          return (
            sub.group.toLowerCase().includes(searchTerm) ||
            sub.subject.toLowerCase().includes(searchTerm) ||
            sub.room.toLowerCase().includes(searchTerm) ||
            sub.teacher.toLowerCase().includes(searchTerm) ||
            (sub.info && sub.info.toLowerCase().includes(searchTerm))
          );
        }
        
        return true;
      });
    }
    
    this.renderSubstitutions();
  }
}

// Enhanced Legal Pages Manager
class LegalPagesManager {
  constructor() {
    this.legalView = document.getElementById('legal-view');
    this.mainView = document.getElementById('main-view');
    this.legalContent = document.getElementById('legal-content');
    this.backButton = document.getElementById('back-to-main');
    
    if (this.backButton) {
      this.backButton.addEventListener('click', () => this.showMainView());
    }
  }
  
  showLegalPage(page) {
    if (this.mainView) this.mainView.classList.add('hidden');
    if (this.legalView) this.legalView.classList.remove('hidden');
    
    if (this.legalContent) {
      if (page === 'impressum') {
        this.legalContent.innerHTML = this.getEnhancedImpressumContent();
      } else if (page === 'datenschutz') {
        this.legalContent.innerHTML = this.getEnhancedDatenschutzContent();
      }
      
      // Initialize icons after content is loaded
      setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }, 100);
    }
  }
  
  showMainView() {
    if (this.legalView) this.legalView.classList.add('hidden');
    if (this.mainView) this.mainView.classList.remove('hidden');
  }
  
  getEnhancedImpressumContent() {
    return `
      <h2>Impressum</h2>
      <div class="legal-cards-grid">
        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="building-2"></i>
            </div>
            <h3 class="legal-card-title">Angaben gemäß § 5 TMG</h3>
          </div>
          <div class="legal-card-content">
            <p><strong>Dessauer Schule Limburg</strong><br>
            Mustername Musterstr. 1<br>
            65549 Limburg</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="mail"></i>
            </div>
            <h3 class="legal-card-title">Kontakt</h3>
          </div>
          <div class="legal-card-content">
            <p><strong>Vertreten durch:</strong><br>Schulleitung</p>
            <div class="contact-info">
              <div class="contact-item">
                <i data-lucide="mail" class="contact-icon"></i>
                <span class="contact-text">info@dessauer-schule-limburg.de</span>
              </div>
              <div class="contact-item">
                <i data-lucide="phone" class="contact-icon"></i>
                <span class="contact-text">+49 (0) 123 456789</span>
              </div>
            </div>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="scale"></i>
            </div>
            <h3 class="legal-card-title">Haftungsausschluss</h3>
          </div>
          <div class="legal-card-content">
            <p>Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="alert-triangle"></i>
            </div>
            <h3 class="legal-card-title">Urheberrecht</h3>
          </div>
          <div class="legal-card-content">
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
            <p>Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </div>
        </div>
      </div>
    `;
  }
  
  getEnhancedDatenschutzContent() {
    return `
      <h2>Datenschutzerklärung</h2>
      <div class="legal-cards-grid">
        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="shield-check"></i>
            </div>
            <h3 class="legal-card-title">Allgemeiner Datenschutz</h3>
          </div>
          <div class="legal-card-content">
            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
            <p>Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich.</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="cookie"></i>
            </div>
            <h3 class="legal-card-title">Cookies</h3>
          </div>
          <div class="legal-card-content">
            <p>Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren.</p>
            <p>Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Die meisten der von uns verwendeten Cookies sind so genannte "Session-Cookies".</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="server"></i>
            </div>
            <h3 class="legal-card-title">Server-Log-Files</h3>
          </div>
          <div class="legal-card-content">
            <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log Files, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
            <p>• Browsertyp und Browserversion<br>
            • verwendetes Betriebssystem<br>
            • Referrer URL<br>
            • Hostname des zugreifenden Rechners<br>
            • Uhrzeit der Serveranfrage</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="mail"></i>
            </div>
            <h3 class="legal-card-title">E-Mail Kontakt</h3>
          </div>
          <div class="legal-card-content">
            <p>Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet.</p>
            <p>Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="database"></i>
            </div>
            <h3 class="legal-card-title">API-Daten der Schule</h3>
          </div>
          <div class="legal-card-content">
            <p>Diese Anwendung greift auf offizielle Schul-APIs zu, um Vertretungsplan-Daten abzurufen. Dabei werden keine personenbezogenen Daten übertragen oder gespeichert.</p>
            <p>Die angezeigten Informationen sind öffentlich verfügbare Schulinformationen wie Klassenbezeichnungen, Raumangaben und Fächer.</p>
          </div>
        </div>

        <div class="legal-card">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="file-key"></i>
            </div>
            <h3 class="legal-card-title">Recht auf Auskunft</h3>
          </div>
          <div class="legal-card-content">
            <p>Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten.</p>
            <p>Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.</p>
          </div>
        </div>

        <div class="legal-card legal-card--full-width">
          <div class="legal-card-header">
            <div class="legal-card-icon">
              <i data-lucide="ban"></i>
            </div>
            <h3 class="legal-card-title">Widerspruch Werbe-Mails</h3>
          </div>
          <div class="legal-card-content">
            <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
            <p>Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-E-Mails, vor.</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Welcome Overlay Manager
class WelcomeManager {
  constructor() {
    this.overlay = document.getElementById('welcome-overlay');
    this.hasBeenWelcomed = this.checkWelcomedStatus();
    
    if (!this.hasBeenWelcomed) {
      // Force show welcome overlay
      setTimeout(() => {
        this.showWelcome();
      }, 500);
    }
  }
  
  checkWelcomedStatus() {
    try {
      return sessionStorage.getItem('welcomed') === 'true';
    } catch (e) {
      console.warn('Session storage not available, showing welcome');
      return false;
    }
  }
  
  showWelcome() {
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
      
      // Trigger confetti if available
      if (typeof confetti === 'function') {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }, 100);
      }
      
      try {
        sessionStorage.setItem('welcomed', 'true');
      } catch (e) {
        console.warn('Could not save welcome status to session storage');
      }
    }
  }
  
  dismissWelcome() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  }
}

// Helper function to update the button text based on selected date
function updateButtonText(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('de-DE', options);
  
  const buttonText = document.querySelectorAll('.button-text');
  buttonText.forEach(text => {
    text.textContent = `Vertretungen für ${formattedDate}`;
  });
  
  // Update content title
  const contentTitle = document.getElementById('content-title');
  
  if (contentTitle) {
    // Check if date is today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
    
    contentTitle.textContent = isToday ? 'Vertretungen für heute' : `Vertretungen für ${formattedDate}`;
  }
}

// Global function to navigate to main page (home functionality)
window.goToMainPage = () => {
  if (legalPagesManager) {
    legalPagesManager.showMainView();
  }
  if (mobileMenu) {
    mobileMenu.closeMenu();
  }
};

// Global function declarations
window.showLegalPage = (page) => {
  if (legalPagesManager) {
    legalPagesManager.showLegalPage(page);
  }
  if (mobileMenu) {
    mobileMenu.closeMenu();
  }
};

window.dismissWelcome = () => {
  if (welcomeManager) {
    welcomeManager.dismissWelcome();
  }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...');
  
  // Wait for Lucide icons to load
  const initIcons = () => {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    } else {
      setTimeout(initIcons, 100);
    }
  };
  initIcons();
  
  // Initialize components with delay to ensure DOM is ready
  setTimeout(() => {
    themeManager = new ThemeManager();
    calendarWidget = new CalendarWidget('calendar', 'calendar-mobile');
    mobileMenu = new MobileMenu();
    substitutionManager = new SubstitutionManager(sampleData);
    legalPagesManager = new LegalPagesManager();
    welcomeManager = new WelcomeManager();
    
    // Set initial button text
    updateButtonText(new Date());
    
    console.log('Application initialized successfully');
  }, 100);
});
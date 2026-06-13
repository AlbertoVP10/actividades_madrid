// Splashscreen - Ocultar después de cargar y mostrar onboarding
window.addEventListener('load', function() {
  setTimeout(function() {
    const splash = document.getElementById('splashscreen');
    const onboarding = document.getElementById('onboarding');
    if (splash) {
      splash.classList.add('hidden');
    }
    // Mostrar onboarding solo si no se ha visto antes
    if (onboarding && !localStorage.getItem('onboardingSeen')) {
      onboarding.classList.remove('hidden');
    }
  }, 2500); // Mostrar por 2.5 segundos
});

// Onboarding Logic
let currentSlide = 0;
const totalSlides = 3;

function updateSlider() {
  const slider = document.getElementById('onboardingSlider');
  const dots = document.querySelectorAll('.onboarding-dot');
  const btn = document.getElementById('onboardingBtn');
  
  if (slider) {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
  
  if (btn) {
    btn.textContent = currentSlide === totalSlides - 1 ? 'Empezar' : 'Siguiente';
  }
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlider();
  } else {
    finishOnboarding();
  }
}

function skipOnboarding() {
  finishOnboarding();
}

function finishOnboarding() {
  const onboarding = document.getElementById('onboarding');
  const preferences = document.getElementById('preferences');
  
  if (onboarding) {
    onboarding.classList.add('hidden');
  }
  localStorage.setItem('onboardingSeen', 'true');
  
  // Mostrar preferencias solo si no se han configurado antes
  if (preferences && !localStorage.getItem('preferencesSet')) {
    preferences.classList.remove('hidden');
  }
}

// Preferences Logic
let selectedPreferences = [];
let profileSettings = {
  email: '',
  gender: '',
  phone: '',
  notifications: true,
  promotionalEmails: false,
  locationAccess: false
};

function togglePreference(element, category) {
  const icon = element.querySelector('.preference-icon');
  const index = selectedPreferences.indexOf(category);
  
  if (index === -1) {
    selectedPreferences.push(category);
    icon.classList.add('selected');
  } else {
    selectedPreferences.splice(index, 1);
    icon.classList.remove('selected');
  }
}

function savePreferences() {
  // Guardar preferencias en localStorage
  localStorage.setItem('userPreferences', JSON.stringify(selectedPreferences));
  localStorage.setItem('preferencesSet', 'true');
  
  // Ocultar pantalla de preferencias
  const preferences = document.getElementById('preferences');
  if (preferences) {
    preferences.classList.add('hidden');
  }
  
  // Aplicar filtros automáticamente si hay preferencias seleccionadas
  if (selectedPreferences.length > 0) {
    applyPreferenceFilters();
  }
}

function applyPreferenceFilters() {
  // Mapeo de preferencias a categorías de la app
  const categoryMap = {
    'titeres': 'Teatro',
    'musica': 'Música',
    'talleres': 'Talleres',
    'deporte': 'Deporte',
    'cuentos': 'Cuentacuentos',
    'parques': 'Parques',
    'teatro': 'Teatro',
    'danza': 'Danza',
    'excursiones': 'Excursiones'
  };
  
  // Convertir preferencias a filtros de categoría
  const preferredCategories = selectedPreferences
    .map(pref => categoryMap[pref])
    .filter(cat => cat);
  
  if (preferredCategories.length > 0) {
    // Aquí se pueden aplicar los filtros a las actividades
    console.log('Preferencias aplicadas:', preferredCategories);
  }
}

// Cargar preferencias guardadas al iniciar
function loadPreferences() {
  const saved = localStorage.getItem('userPreferences');
  if (saved) {
    selectedPreferences = JSON.parse(saved);
  }
}

function renderActivityCard(activity) {
  const dateStr = activity.date ? activity.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha desconocida';
  return `
    <article class="activity-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg shadow-black/10 border border-surface-variant/10 cursor-pointer" onclick="showDetail('${activity.id}')">
      <div class="p-3 space-y-2">
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-semibold text-body-lg text-on-surface leading-tight flex-1">${activity.title}</h3>
          <span class="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-label-sm rounded-full">${activity.category}</span>
        </div>
        <p class="text-body-sm text-on-surface-variant">${dateStr}${activity.time ? ` • ${activity.time}` : ''}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-primary font-medium">${formatPrice(activity)}</span>
          <span class="text-on-surface-variant text-xs">${activity.location || 'Madrid'}</span>
        </div>
      </div>
    </article>
  `;
}

function renderHomeActivityCard(activity) {
  const dateStr = activity.date ? activity.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha desconocida';
  return `
    <article class="activity-card bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer" onclick="showDetail('${activity.id}')">
      <div class="p-3 space-y-2">
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-semibold text-body-lg text-on-surface leading-tight flex-1">${activity.title}</h3>
          <span class="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-label-sm rounded-full">${activity.category}</span>
        </div>
        <p class="text-body-sm text-on-surface-variant">${dateStr}${activity.time ? ` • ${activity.time}` : ''}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-primary font-medium">${formatPrice(activity)}</span>
          <span class="text-on-surface-variant text-xs">${activity.location || 'Madrid'}</span>
        </div>
      </div>
    </article>
  `;
}

function viewAllHomeSection(section) {
  if (section === 'popular') {
    setBottomTab('favorites');
  } else {
    setBottomTab('list');
  }
}

function renderHome() {
  const recommendedContainer = document.getElementById('homeRecommended');
  const popularContainer = document.getElementById('homePopular');
  const discoveriesContainer = document.getElementById('homeDiscoveries');

  const preferredCategories = selectedPreferences
    .map(pref => categoryMap[pref])
    .filter(Boolean);

  const recommended = preferredCategories.length > 0
    ? allActivities.filter(activity => preferredCategories.includes(activity.category)).slice(0, 4)
    : allActivities.slice(0, 4);

  const popular = favorites.length > 0
    ? allActivities.filter(activity => favorites.includes(activity.id)).slice(0, 4)
    : allActivities.slice(0, 4);

  const discoveries = allActivities
    .filter(activity => !favorites.includes(activity.id))
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    .slice(0, 4);

  recommendedContainer.innerHTML = recommended.length > 0
    ? recommended.map(renderHomeActivityCard).join('')
    : '<p class="text-on-surface-variant">No hay recomendaciones disponibles aún.</p>';

  popularContainer.innerHTML = popular.length > 0
    ? popular.map(renderHomeActivityCard).join('')
    : '<p class="text-on-surface-variant">No hay favoritos guardados todavía.</p>';

  discoveriesContainer.innerHTML = discoveries.length > 0
    ? discoveries.map(renderHomeActivityCard).join('')
    : '<p class="text-on-surface-variant">No hay nuevos descubrimientos por ahora.</p>';
}

function renderProfile() {
  const profilePreferences = document.getElementById('profilePreferences');
  const profileName = document.getElementById('profileName');
  const profileSubtitle = document.getElementById('profileSubtitle');

  if (profileName) {
    profileName.textContent = profileSettings.email ? 'Mi perfil' : 'Invitado';
  }
  if (profileSubtitle) {
    profileSubtitle.textContent = profileSettings.email ? profileSettings.email : 'Sin cuenta registrada';
  }

  if (!profilePreferences) return;
  profilePreferences.innerHTML = selectedPreferences.length > 0
    ? selectedPreferences.map(pref => `<span class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm">${pref}</span>`).join('')
    : '<p class="text-on-surface-variant">Aún no has seleccionado preferencias.</p>';
}

function openPreferencesEditor() {
  const preferences = document.getElementById('preferences');
  const onboarding = document.getElementById('onboarding');
  if (preferences) {
    preferences.classList.remove('hidden');
  }
  if (onboarding) {
    onboarding.classList.add('hidden');
  }
}

function setSortState(value) {
  currentFilters.sort = value;
  selectedSortOption = value;
}

function getCurrentFilterParameters() {
  return {
    category: Array.isArray(multiSelectState.category) ? [...multiSelectState.category] : [],
    district: Array.isArray(multiSelectState.district) ? [...multiSelectState.district] : [],
    audience: Array.isArray(multiSelectState.audience) ? [...multiSelectState.audience] : [],
    time: Array.isArray(multiSelectState.time) ? [...multiSelectState.time] : [],
    date: document.getElementById('dateSelect')?.value || 'all',
    search: document.getElementById('searchInput')?.value || '',
    freeOnly: document.getElementById('freeOnly')?.checked || false,
    favoritesOnly: document.getElementById('favoritesOnly')?.checked || false,
    sort: currentFilters.sort || 'recent',
    locationKey: currentFilters.locationKey || null,
    durationMin: durationFilterState.min || 1,
    durationMax: durationFilterState.max || 30,
    dateFilterMode: dateFilterState.mode,
    dateFilterShortcut: dateFilterState.shortcut,
    dateFilterPickerStart: dateFilterState.pickerStart ? dateFilterState.pickerStart.toISOString() : null,
    dateFilterPickerEnd: dateFilterState.pickerEnd ? dateFilterState.pickerEnd.toISOString() : null
  };
}

function cargarFiltrosFavoritos() {
  try {
    const saved = localStorage.getItem(SAVED_FILTERS_STORAGE_KEY);
    if (saved) {
      savedFilters = JSON.parse(saved) || [];
    } else {
      savedFilters = [];
    }
  } catch (error) {
    console.warn('No se pudieron cargar filtros guardados:', error);
    savedFilters = [];
  }
  renderSavedFilterSection();
}

function renderSavedFilterSection() {
  const section = document.getElementById('seccion-filtros-favoritos');
  if (!section) return;

  // Show/hide section based on saved filters count
  if (savedFilters.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
}

function openSaveFiltersModal() {
  const modal = document.getElementById('saveFilterModal');
  const nameInput = document.getElementById('savedFilterNameInput');
  const saveBtn = document.getElementById('saveFilterSubmitButton');
  if (!modal || !nameInput || !saveBtn) return;

  modal.classList.remove('hidden');
  nameInput.value = '';
  saveBtn.disabled = true;
  nameInput.focus();

  nameInput.oninput = () => {
    saveBtn.disabled = nameInput.value.trim().length === 0;
  };

  document.addEventListener('keydown', handleSaveFilterModalKeydown);
  modal.addEventListener('click', handleSaveFilterModalClickOutside);
}

function closeSaveFiltersModal() {
  const modal = document.getElementById('saveFilterModal');
  const nameInput = document.getElementById('savedFilterNameInput');
  const saveBtn = document.getElementById('saveFilterSubmitButton');
  if (!modal || !nameInput || !saveBtn) return;

  modal.classList.add('hidden');
  nameInput.value = '';
  saveBtn.disabled = true;

  document.removeEventListener('keydown', handleSaveFilterModalKeydown);
  modal.removeEventListener('click', handleSaveFilterModalClickOutside);
}

function handleSaveFilterModalKeydown(event) {
  if (event.key === 'Escape') {
    closeSaveFiltersModal();
  }
}

function handleSaveFilterModalClickOutside(event) {
  const modalCard = document.querySelector('#saveFilterModal .save-filter-modal');
  if (!modalCard || modalCard.contains(event.target)) return;
  closeSaveFiltersModal();
}

function guardarFiltro() {
  const nameInput = document.getElementById('savedFilterNameInput');
  if (!nameInput) return;

  const nombre = nameInput.value.trim();
  if (nombre.length === 0) return;

  const existingIndex = savedFilters.findIndex(item => item.nombre_personalizado.trim().toLowerCase() === nombre.toLowerCase());
  const filtro = {
    id: existingIndex >= 0 ? savedFilters[existingIndex].id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre_personalizado: nombre,
    parametros: getCurrentFilterParameters()
  };

  if (existingIndex >= 0) {
    savedFilters.splice(existingIndex, 1);
  }

  savedFilters.unshift(filtro);
  localStorage.setItem(SAVED_FILTERS_STORAGE_KEY, JSON.stringify(savedFilters));
  renderSavedFilterSection();
  closeSaveFiltersModal();
  syncSavedFiltersToServer(filtro);
}

async function syncSavedFiltersToServer(filtro) {
  try {
    await fetch('/api/user/filters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filtro)
    });
  } catch (error) {
    console.warn('No se pudo sincronizar el filtro con el backend:', error);
  }
}

function aplicarFiltroFavorito(filterId) {
  if (!filterId) return;

  const filtro = savedFilters.find(item => item.id === filterId);
  if (!filtro) return;

  const params = filtro.parametros || {};
  setFilterInputsFromParameters(params);
  applyFilters();
}

// Open saved filters modal
function openSavedFiltersModal() {
  const modal = document.getElementById('savedFiltersModal');
  const container = document.getElementById('savedFiltersContainer');
  if (!modal || !container) return;

  // Populate options
  container.innerHTML = '';
  
  if (savedFilters.length === 0) {
    container.innerHTML = '<p class="text-center text-on-surface-variant p-4">No tienes filtros guardados aún</p>';
    modal.classList.remove('hidden');
    return;
  }

  savedFilters.forEach(filtro => {
    const label = document.createElement('label');
    label.className = 'flex items-center justify-between p-4 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors';
    label.innerHTML = `
      <span class="text-body-lg text-on-surface">${filtro.nombre_personalizado}</span>
      <div class="w-6 h-6 rounded-full border-2 border-outline flex items-center justify-center saved-filter-check" data-value="${filtro.id}">
        <span class="material-symbols-outlined text-primary text-sm hidden">check</span>
      </div>
      <input type="radio" name="savedFilterOption" value="${filtro.id}" class="hidden">
    `;
    container.appendChild(label);
  });

  modal.classList.remove('hidden');
}

// Close saved filters modal
function closeSavedFiltersModal() {
  const modal = document.getElementById('savedFiltersModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Apply selected saved filter
function applySavedFilterSelection() {
  const selected = document.querySelector('input[name="savedFilterOption"]:checked');
  if (!selected) return;

  const filterId = selected.value;
  aplicarFiltroFavorito(filterId);
  closeSavedFiltersModal();
  
  // Close filters view and return to home
  toggleFilters();
}

// Handle saved filter radio selection
document.addEventListener('change', function(e) {
  if (e.target.name === 'savedFilterOption') {
    // Update all radio checks
    document.querySelectorAll('.saved-filter-check').forEach(check => {
      const icon = check.querySelector('.material-symbols-outlined');
      if (check.dataset.value === e.target.value) {
        icon.classList.remove('hidden');
      } else {
        icon.classList.add('hidden');
      }
    });
  }
});

function setFilterInputsFromParameters(params) {
  if (!params || typeof params !== 'object') return;

  if (Array.isArray(params.category)) {
    multiSelectState.category = [...params.category];
    setDropdownCheckboxes('category', multiSelectState.category);
  }
  if (Array.isArray(params.district)) {
    multiSelectState.district = [...params.district];
    setDropdownCheckboxes('district', multiSelectState.district);
  }
  if (Array.isArray(params.audience)) {
    multiSelectState.audience = [...params.audience];
    setDropdownCheckboxes('audience', multiSelectState.audience);
  }
  if (Array.isArray(params.time)) {
    multiSelectState.time = [...params.time];
    setDropdownCheckboxes('time', multiSelectState.time);
  }

  const dateSelect = document.getElementById('dateSelect');
  if (dateSelect && params.date) {
    dateSelect.value = params.date;
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput && typeof params.search === 'string') {
    searchInput.value = params.search;
  }
  const freeOnly = document.getElementById('freeOnly');
  if (freeOnly) {
    freeOnly.checked = !!params.freeOnly;
  }
  const favoritesOnly = document.getElementById('favoritesOnly');
  if (favoritesOnly) {
    favoritesOnly.checked = !!params.favoritesOnly;
  }
  if (params.sort) {
    setSortState(params.sort);
  }
  
  // Duration filter
  if (params.durationMin !== undefined && params.durationMax !== undefined) {
    durationFilterState.min = params.durationMin;
    durationFilterState.max = params.durationMax;
    currentFilters.durationMin = params.durationMin;
    currentFilters.durationMax = params.durationMax;
  }

  // Date filter (hybrid)
  if (params.dateFilterMode) {
    dateFilterState.mode = params.dateFilterMode;
    dateFilterState.shortcut = params.dateFilterShortcut || 'all';
    
    if (params.dateFilterPickerStart) {
      dateFilterState.pickerStart = new Date(params.dateFilterPickerStart);
    }
    if (params.dateFilterPickerEnd) {
      dateFilterState.pickerEnd = new Date(params.dateFilterPickerEnd);
    }
    
    // Actualizar select legacy para compatibilidad
    const dateSelect = document.getElementById('dateSelect');
    if (dateSelect) {
      if (dateFilterState.mode === 'shortcut') {
        const legacyMap = {
          'all': 'all',
          'today': 'today',
          'tomorrow': 'tomorrow',
          '7days': 'week'
        };
        dateSelect.value = legacyMap[dateFilterState.shortcut] || 'all';
      } else {
        dateSelect.value = 'all';
      }
    }
  }

  updateMultiSelectLabels();
}

function setDropdownCheckboxes(type, values) {
  // Handle grid-based filters (category, district, audience, time)
  const grid = document.getElementById(`${type}Grid`);
  if (grid) {
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(btn => {
      if (values.includes(btn.dataset.value)) {
        btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      }
    });
    return;
  }
  
  // Handle dropdown-based filters (legacy)
  const dropdown = document.getElementById(`${type}Dropdown`);
  if (!dropdown) return;
  const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = values.includes(checkbox.value);
  });
}

function updateMultiSelectLabels() {
  ['category', 'district', 'audience', 'time'].forEach(type => {
    const allOptions = Array.from(document.querySelectorAll(`#${type}Dropdown input[type=checkbox]`)).map(cb => cb.value);
    const selected = Array.from(document.querySelectorAll(`#${type}Dropdown input[type=checkbox]:checked`)).map(cb => cb.value);
    const label = document.getElementById(`${type}SelectLabel`);
    if (!label) return;
    if (selected.length === 0 || selected.length === allOptions.length) {
      const defaults = {
        category: 'Todas',
        district: 'Todos',
        audience: 'Todos',
        time: 'Todo el día'
      };
      label.textContent = defaults[type];
    } else if (selected.length === 1) {
      label.textContent = selected[0];
    } else {
      label.textContent = `${selected.length} seleccionados`;
    }
  });
}

function loadProfileSettings() {
  const saved = localStorage.getItem('profileSettings');
  if (saved) {
    try {
      profileSettings = Object.assign(profileSettings, JSON.parse(saved));
    } catch (error) {
      console.warn('No se pudo cargar la configuración de perfil:', error);
    }
  }
}

function updateToggleButton(buttonId, isActive) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.textContent = isActive ? 'ON' : 'OFF';
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  button.classList.toggle('bg-primary', isActive);
  button.classList.toggle('text-on-primary', isActive);
  button.classList.toggle('border-outline', !isActive);
  button.classList.toggle('bg-surface-variant', !isActive);
  button.classList.toggle('text-on-surface', !isActive);
}

function toggleProfileSetting(key) {
  profileSettings[key] = !profileSettings[key];
  renderProfileSettings();
}

function renderProfileSettings() {
  const emailInput = document.getElementById('profileEmail');
  const genderSelect = document.getElementById('profileGender');
  const phoneInput = document.getElementById('profilePhone');

  if (emailInput) emailInput.value = profileSettings.email || '';
  if (genderSelect) genderSelect.value = profileSettings.gender || '';
  if (phoneInput) phoneInput.value = profileSettings.phone || '';

  updateToggleButton('profileNotificationsButton', profileSettings.notifications);
  updateToggleButton('profileEmailsButton', profileSettings.promotionalEmails);
  updateToggleButton('profileLocationButton', profileSettings.locationAccess);
}

function openProfileSettings() {
  renderProfileSettings();
  showView('profileSettings');
}

function saveProfileSettings() {
  const emailInput = document.getElementById('profileEmail');
  const genderSelect = document.getElementById('profileGender');
  const phoneInput = document.getElementById('profilePhone');

  profileSettings.email = emailInput?.value.trim() || '';
  profileSettings.gender = genderSelect?.value || '';
  profileSettings.phone = phoneInput?.value.trim() || '';

  localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
  showView('profile');
  renderProfile();
}

function deleteAccount() {
  if (!confirm('¿Estás seguro? Esta acción eliminará todos los datos del perfil local.')) return;
  profileSettings = {
    email: '',
    gender: '',
    phone: '',
    notifications: true,
    promotionalEmails: false,
    locationAccess: false
  };
  localStorage.removeItem('profileSettings');
  showView('profile');
  renderProfile();
}

function logout() {
  profileSettings = {
    email: '',
    gender: '',
    phone: '',
    notifications: true,
    promotionalEmails: false,
    locationAccess: false
  };
  localStorage.removeItem('profileSettings');
  showView('profile');
  renderProfile();
}

function openCollaborate() {
  window.location.href = 'mailto:colabora@actividadesmadrid.com?subject=Colabora%20con%20nosotros';
}

// Swipe support for onboarding
let touchStartX = 0;
let touchEndX = 0;

const onboardingContainer = document.getElementById('onboardingContainer');
if (onboardingContainer) {
  onboardingContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  onboardingContainer.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && currentSlide < totalSlides - 1) {
      // Swipe left - next slide
      currentSlide++;
      updateSlider();
    } else if (diff < 0 && currentSlide > 0) {
      // Swipe right - previous slide
      currentSlide--;
      updateSlider();
    }
  }
}

// Global state
let allActivities = [];
let filteredActivities = [];
let favorites = (JSON.parse(localStorage.getItem('madridFavorites') || '[]') || []).map(String);
let dataSource = 'Madrid'; // 'Firebase' o 'Madrid' - se actualiza al cargar
let imagenesMap = {}; // Mapa de app_id -> url_imagen
let currentPage = 0;
let itemsPerPage = 10;
let userLocation = null;
let map = null;
let detailMap = null;
let markers = [];
let currentView = 'list';
let currentDetailId = null;
let currentFilters = {
  category: 'all',
  district: 'all',
  audience: 'all',
  date: 'all',
  time: 'all',
  search: '',
  freeOnly: false,
  favoritesOnly: false,
  nearOnly: false,
  location: null,
  locationCoords: null,
  locationKey: null,
  sort: 'recent',
  durationMin: 1,
  durationMax: 30
};

const SAVED_FILTERS_STORAGE_KEY = 'madridSavedFilterPresets';
let savedFilters = [];

// Active KPI filter state (array to allow multiple filters)
let activeKPIFilters = []; // Can contain: 'today', 'week', 'near', 'favorites'

// Consent state
let consentState = JSON.parse(localStorage.getItem('madridConsent') || 'null');

// Show consent modal if not already accepted
function showConsentModal() {
  if (!consentState) {
    document.getElementById('consentModal').classList.remove('hidden');
  }
}

// Hide consent modal
function hideConsentModal() {
  document.getElementById('consentModal').classList.add('hidden');
}

// Toggle consent settings visibility
function toggleConsentSettings() {
  const settings = document.getElementById('consentSettings');
  const configureBtn = document.getElementById('consentConfigureBtn');
  const saveBtn = document.getElementById('consentSaveBtn');
  
  settings.classList.toggle('hidden');
  
  if (settings.classList.contains('hidden')) {
    configureBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
  } else {
    configureBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
  }
}

// Accept all consent
function acceptAllConsent() {
  consentState = {
    technical: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('madridConsent', JSON.stringify(consentState));
  hideConsentModal();
  // Initialize analytics if needed
  initAnalytics();
}

// Reject all consent (except technical)
function rejectAllConsent() {
  consentState = {
    technical: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('madridConsent', JSON.stringify(consentState));
  hideConsentModal();
}

// Save custom consent settings
function saveCustomConsent() {
  const analytics = document.getElementById('consentAnalytics').checked;
  const marketing = document.getElementById('consentMarketing').checked;
  
  consentState = {
    technical: true,
    analytics: analytics,
    marketing: marketing,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('madridConsent', JSON.stringify(consentState));
  hideConsentModal();
  
  // Initialize analytics if accepted
  if (analytics) {
    initAnalytics();
  }
}

// Initialize analytics (placeholder)
function initAnalytics() {
  if (consentState && consentState.analytics) {
    console.log('Analytics initialized');
    // Here you would initialize your analytics provider (Google Analytics, etc.)
  }
}

// Show privacy policy (placeholder)
function showPrivacyPolicy() {
  alert('Política de Privacidad:\n\nEsta aplicación recopila datos de uso para mejorar la experiencia del usuario.\n\nLos datos de ubicación son opcionales y solo se utilizan para mostrar actividades cercanas.\n\nLos favoritos se almacenan localmente en tu dispositivo.\n\nPara más información, contacta con nosotros.');
}

function showTermsAndConditions() {
  alert('Términos y condiciones:\n\nUsar esta aplicación implica aceptar las condiciones de uso básicas y el tratamiento local de datos para configurar tu experiencia.\n\nLos datos personales se almacenan en tu dispositivo y el correo se usa solo para contacto interno.');
}

// Get valid favorites (that exist in allActivities and haven't expired)
function getValidFavorites() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return favorites.filter(id => {
    const activity = allActivities.find(a => String(a.id) === id);
    if (!activity) return false;
    
    // Check if activity has expired
    if (activity.date) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      if (activityDate < today) return false;
    }
    
    return true;
  });
}

// Get expired favorites (for display purposes)
function getExpiredFavorites() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return favorites.filter(id => {
    const activity = allActivities.find(a => String(a.id) === id);
    if (!activity) return true; // Consider non-existent as expired
    
    if (activity.date) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate < today;
    }
    
    return false;
  });
}

// Update favorites count badge and KPI
function updateFavCount() {
  const validFavs = getValidFavorites();
  const favCountEl = document.getElementById('favCount');
  if (favCountEl) {
    favCountEl.textContent = validFavs.length;
  }
  // document.getElementById('kpiFavorites')?.textContent = validFavs.length;
  // updateKPIFavoritesStyle();
}

// Category mapping
const categoryMap = {
  'Cine': 'cultura',
  'Teatro': 'cultura',
  'Música': 'musica',
  'Exposiciones': 'arte',
  'Talleres': 'cultura',
  'Deportes': 'deportes',
  'Danza': 'cultura',
  'Literatura': 'cultura',
  'Infantil': 'cultura',
  'Fiestas': 'ferias',
  'Destacada': 'cultura',
  'Conferencias': 'cultura',
  'Excursiones': 'cultura',
  'Campamentos': 'cultura',
  'Gastronomía': 'gastronomia',
  'Otras': 'cultura'
};

// Initialize
async function init() {
  loadPreferences();
  loadProfileSettings();
  cargarFiltrosFavoritos();
  updateFavCount();
  await loadImagenesMap(); // Cargar imágenes primero
  await loadActivities();
  setBottomTab('home');
  // Set default tab to 'recent'
  setMainTab('recent');
  // Initialize KPI Near button state
  // updateKPINearButton();
}

// Check password
function checkPassword() {
  const pwd = document.getElementById('passwordInput').value;
  if (pwd === 'abc123') {
    document.getElementById('loginModal').classList.add('hidden');
    init();
    // Show consent modal after successful login
    showConsentModal();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
}

// Configuración de Firebase Storage
const FIREBASE_CONFIG = {
  storageBucket: 'actividades-madrid-2dbb6.firebasestorage.app'
};

// URL del JSON de actividades procesadas en Firebase Storage
const FIREBASE_ACTIVIDADES_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o/actividades_procesadas.json?alt=media`;

// URL del JSON de imágenes en Firebase Storage
const FIREBASE_IMAGENES_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o/imagenes.json?alt=media`;

// URL de fallback (datos.madrid.es)
const MADRID_API_URL = 'https://datos.madrid.es/egob/catalogo/206974-0-agenda-eventos-culturales-100.json';

// Función para actualizar el label de fuente en el home
function updateHomeSourceLabel() {
  const sourceLabel = document.getElementById('homeSourceLabel');
  if (sourceLabel) {
    const icon = dataSource === 'Firebase' ? '☁️' : '🏛️';
    sourceLabel.textContent = `${icon} ${dataSource}`;
  }
}

// Función para cargar el mapa de imágenes desde Firebase
async function loadImagenesMap() {
  try {
    console.log('📥 Cargando imágenes desde Firebase...');
    const response = await fetch(FIREBASE_IMAGENES_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    imagenesMap = await response.json();
    console.log(`✅ ${Object.keys(imagenesMap).length} imágenes cargadas`);
  } catch (error) {
    console.warn('⚠️ Error cargando imágenes:', error.message);
    imagenesMap = {};
  }
}

// Load activities from Firebase Storage con fallback a datos.madrid.es
async function loadActivities() {
  // Intentar cargar desde Firebase primero
  try {
    console.log('📥 Intentando cargar desde Firebase...');
    console.log('URL:', FIREBASE_ACTIVIDADES_URL);
    
    const response = await fetch(FIREBASE_ACTIVIDADES_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      allActivities = data.map(item => ({
        id: item.id || Math.random().toString(),
        app_id: item.app_id || Math.random().toString(),
        title: item.title || 'Sin título',
        description: item.description || '',
        category: item.category || 'Otras',
        location: item.location || '',
        district: item.district || 'Desconocido',
        lat: item.lat ? parseFloat(item.lat) : null,
        lon: item.lon ? parseFloat(item.lon) : null,
        date: item.date ? new Date(item.date) : null,
        endDate: item.endDate ? new Date(item.endDate) : null,
        time: item.time || '',
        free: item.free === true,
        price: item.price || '',
        audience: item.audience || '',
        link: item.link || '',
        street: item.street || '',
        duration: item.duration || '1 día',
        date_diff: item.date_diff !== null && item.date_diff !== undefined ? item.date_diff : 1
      }));
      
      // Filter out past activities
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      allActivities = allActivities.filter(a => !a.date || a.date >= today);
      
      console.log(`✅ ${allActivities.length} actividades cargadas desde Firebase`);
      
      // Guardar fuente de datos
      dataSource = 'Firebase';
      updateHomeSourceLabel();
      
      populateFilters();
      applyFilters();
      
      document.getElementById('loadingState').classList.add('hidden');
      document.getElementById('mainContent').classList.remove('hidden');
      return; // Éxito, salimos de la función
    } else {
      throw new Error('Formato inesperado');
    }
  } catch (firebaseError) {
    console.warn('⚠️ Error cargando desde Firebase:', firebaseError.message);
    console.log('🔄 Intentando fallback a datos.madrid.es...');
  }
  
  // Fallback: cargar desde datos.madrid.es
  try {
    const response = await fetch(MADRID_API_URL);
    const data = await response.json();
    
    if (Array.isArray(data['@graph'])) {
      allActivities = data['@graph'].map(item => ({
        id: item['@id'] || Math.random().toString(),
        title: item.title || 'Sin título',
        description: item.description || '',
        category: extractCategory(item['@type']),
        location: item['event-location'] || '',
        district: extractDistrict(item['address']?.district?.['@id']),
        lat: parseFloat(item.location?.latitude),
        lon: parseFloat(item.location?.longitude),
        date: item.dtstart ? new Date(item.dtstart) : null,
        endDate: item.dtend ? new Date(item.dtend) : null,
        time: item.time || '',
        free: item.free === 1 || item.free === true,
        price: item.price || '',
        audience: item.audience || '',
        link: item.link || '',
        street: item.address?.area?.['street-address'] || ''
      }));
      
      // Filter out past activities
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      allActivities = allActivities.filter(a => !a.date || a.date >= today);
      
      console.log(`✅ ${allActivities.length} actividades cargadas desde datos.madrid.es (fallback)`);
      
      // Guardar fuente de datos
      dataSource = 'Madrid';
      updateHomeSourceLabel();
      
      populateFilters();
      applyFilters();
      
      document.getElementById('loadingState').classList.add('hidden');
      document.getElementById('mainContent').classList.remove('hidden');
    } else {
      throw new Error('Formato inesperado');
    }
  } catch (error) {
    console.error('Error loading activities:', error);
    document.getElementById('loadingState').innerHTML = `
      <p class="text-error text-body-md">Error cargando datos</p>
      <p class="text-body-sm text-on-surface-variant mt-2">${error.message}</p>
      <button onclick="loadActivities()" class="mt-4 bg-primary text-on-primary px-4 py-2 rounded-lg">Reintentar</button>
    `;
  }
}

// Extract category
function extractCategory(type) {
  if (!type) return 'Otras';
  const typeStr = String(type).toLowerCase();
  
  if (typeStr.includes('cine') || typeStr.includes('film')) return 'Cine';
  if (typeStr.includes('teatro') || typeStr.includes('theatre')) return 'Teatro';
  if (typeStr.includes('musica') || typeStr.includes('music') || typeStr.includes('concierto')) return 'Música';
  if (typeStr.includes('exposicion') || typeStr.includes('exhibition')) return 'Exposiciones';
  if (typeStr.includes('taller') || typeStr.includes('workshop')) return 'Talleres';
  if (typeStr.includes('deporte') || typeStr.includes('sport')) return 'Deportes';
  if (typeStr.includes('danza') || typeStr.includes('dance')) return 'Danza';
  if (typeStr.includes('literatura') || typeStr.includes('book')) return 'Literatura';
  if (typeStr.includes('infantil') || typeStr.includes('cuentacuentos') || typeStr.includes('circo')) return 'Infantil';
  if (typeStr.includes('fiesta') || typeStr.includes('sanisidro')) return 'Fiestas';
  if (typeStr.includes('destacada')) return 'Destacada';
  if (typeStr.includes('conferencia')) return 'Conferencias';
  if (typeStr.includes('excursion') || typeStr.includes('visita')) return 'Excursiones';
  if (typeStr.includes('campamento')) return 'Campamentos';
  
  return 'Otras';
}

// Extract district
function extractDistrict(districtUrl) {
  if (!districtUrl) return 'Desconocido';
  const parts = districtUrl.split('/');
  const name = parts[parts.length - 1];
  
  const districtMap = {
    'Fuencarral-ElPardo': 'Fuencarral - El Pardo',
    'CiudadLineal': 'Ciudad Lineal',
    'PuenteDeVallecas': 'Puente de Vallecas',
    'Moncloa-Aravaca': 'Moncloa - Aravaca',
    'SanBlas-Canillejas': 'San Blas-Canillejas',
    'VillaDeVallecas': 'Villa de Vallecas'
  };
  
  return districtMap[name] || name;
}

// Multi-select state
const multiSelectState = {
  category: [],
  district: [],
  audience: [],
  time: []
};

// Duration filter state (min/max days)
let durationFilterState = {
  min: 1,
  max: 30
};

// Date filter state (hybrid: shortcuts + picker)
let dateFilterState = {
  mode: 'shortcut',      // 'shortcut' | 'picker'
  shortcut: 'all',       // 'all' | 'today' | 'tomorrow' | 'weekend' | '7days'
  pickerStart: null,     // Date | null
  pickerEnd: null        // Date | null
};

// Calendar state
let calendarState = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selecting: false,      // true when waiting for second date
  hoverDate: null        // for visual feedback
};

let currentFilterField = null;

function openFilterField(field) {
  currentFilterField = field;
  const titles = {
    search: 'Buscar actividades',
    category: 'Filtrar por categoría',
    district: 'Filtrar por distrito',
    audience: 'Filtrar por público',
    date: 'Filtrar por fecha',
    time: 'Filtrar por horario',
    duration: 'Filtrar por duración',
    freeOnly: 'Solo gratuitas',
    favoritesOnly: 'Mis favoritos'
  };

  const title = titles[field] || 'Filtro';
  const titleElement = document.getElementById('filterFieldTitle');
  if (titleElement) titleElement.textContent = title;

  renderFilterFieldContent(field);
  showView('filterField');
  const fieldView = document.getElementById('filterFieldView');
  if (fieldView) fieldView.scrollTop = 0;
  
  // Ocultar activeFiltersBar cuando se abre filterFieldView
  const filtersBar = document.getElementById('activeFiltersBar');
  if (filtersBar) filtersBar.classList.add('hidden');
  
  // Ocultar la barra de acciones fija inferior
  const actionBar = document.getElementById('filtersActionBar');
  if (actionBar) {
    actionBar.classList.add('hidden');
  }
}

function renderFilterFieldContent(field) {
  document.querySelectorAll('#filterFieldContent .field-panel').forEach(panel => panel.classList.add('hidden'));
  const activePanel = document.getElementById(`filterField_${field}`);
  if (activePanel) activePanel.classList.remove('hidden');

  if (field === 'search') {
    const searchInput = document.getElementById('filterSearchInput');
    if (searchInput) searchInput.value = currentFilters.search || '';
  }

  if (field === 'category') {
    const grid = document.getElementById('categoryGrid');
    if (grid) {
      const selected = multiSelectState.category || [];
      grid.querySelectorAll('button').forEach(btn => {
        if (selected.includes(btn.dataset.value)) {
          btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        } else {
          btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        }
      });
    }
  }

  if (field === 'district') {
    const grid = document.getElementById('districtGrid');
    if (grid) {
      const selected = multiSelectState.district || [];
      grid.querySelectorAll('button').forEach(btn => {
        if (selected.includes(btn.dataset.value)) {
          btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        } else {
          btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        }
      });
    }
    refreshFilterFieldLabel('district');
  }

  if (field === 'audience') {
    const selectedValues = multiSelectState.audience || [];
    const buttons = document.querySelectorAll('#audienceGrid button[data-type="audience"]');
    buttons.forEach(btn => {
      const audience = btn.dataset.value;
      if (selectedValues.includes(audience)) {
        btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      }
    });
    refreshFilterFieldLabel('audience');
  }

  if (field === 'time') {
    const selectedValues = multiSelectState.time || [];
    const buttons = document.querySelectorAll('#timeGrid button[data-type="time"]');
    buttons.forEach(btn => {
      const time = btn.dataset.value;
      if (selectedValues.includes(time)) {
        btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      }
    });
    refreshFilterFieldLabel('time');
  }

  if (field === 'duration') {
    // Actualizar sliders con valores actuales
    const minSlider = document.getElementById('durationMinSlider');
    const maxSlider = document.getElementById('durationMaxSlider');
    if (minSlider) minSlider.value = durationFilterState.min;
    if (maxSlider) maxSlider.value = durationFilterState.max;
    updateDurationSlider();
    
    // Actualizar estado visual de los atajos
    updateDurationShortcutStyles();
  }

  if (field === 'date') {
    // Actualizar estado visual de los atajos de fecha
    updateDateShortcutStyles();
    
    // Inicializar/renderizar calendario
    renderCalendar();
    updateCalendarInfo();
  }
}

function updateDurationSlider() {
  const minSlider = document.getElementById('durationMinSlider');
  const maxSlider = document.getElementById('durationMaxSlider');
  const minValueEl = document.getElementById('durationMinValue');
  const maxValueEl = document.getElementById('durationMaxValue');
  const rangeLabel = document.getElementById('durationRangeLabel');
  
  if (!minSlider || !maxSlider) return;
  
  let minVal = parseInt(minSlider.value);
  let maxVal = parseInt(maxSlider.value);
  
  // Asegurar que min no sea mayor que max
  if (minVal > maxVal) {
    minVal = maxVal;
    minSlider.value = minVal;
  }
  
  // Actualizar estado
  durationFilterState.min = minVal;
  durationFilterState.max = maxVal;
  
  // Actualizar labels
  if (minValueEl) minValueEl.textContent = minVal;
  if (maxValueEl) maxValueEl.textContent = maxVal >= 30 ? '30+' : maxVal;
  if (rangeLabel) {
    const maxText = maxVal >= 30 ? '30+' : maxVal;
    rangeLabel.textContent = `${minVal} - ${maxText} días`;
  }
  
  // Actualizar estilo de atajos
  updateDurationShortcutStyles();
  
  // Aplicar filtros para actualizar contador en tiempo real
  applyFilters();
}

function updateDurationShortcutStyles() {
  const shortcuts = document.querySelectorAll('.duration-shortcut');
  shortcuts.forEach(btn => {
    const btnMin = parseInt(btn.dataset.min);
    const btnMax = parseInt(btn.dataset.max);
    
    // El atajo está activo si coincide exactamente con el rango actual
    const isActive = durationFilterState.min === btnMin && durationFilterState.max === btnMax;
    
    if (isActive) {
      btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.remove('border-outline-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.add('border-outline-variant');
    }
  });
}

function setDurationShortcut(min, max) {
  durationFilterState.min = min;
  durationFilterState.max = max;
  
  // Actualizar sliders
  const minSlider = document.getElementById('durationMinSlider');
  const maxSlider = document.getElementById('durationMaxSlider');
  if (minSlider) minSlider.value = min;
  if (maxSlider) maxSlider.value = max;
  
  updateDurationSlider();
  
  // Aplicar filtros para actualizar contador en tiempo real
  applyFilters();
}

// ==================== DATE FILTER FUNCTIONS ====================

function formatDateForInput(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function setDateShortcut(shortcut) {
  // Cambiar a modo shortcut
  dateFilterState.mode = 'shortcut';
  dateFilterState.shortcut = shortcut;
  calendarState.selecting = false;
  
  // Calcular el rango según el atajo y sincronizar con el calendario
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (shortcut) {
    case 'today':
      dateFilterState.pickerStart = new Date(today);
      dateFilterState.pickerEnd = new Date(today);
      break;
    
    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilterState.pickerStart = tomorrow;
      dateFilterState.pickerEnd = new Date(tomorrow);
      break;
    }
    
    case 'weekend': {
      const dayOfWeek = today.getDay();
      const saturday = new Date(today);
      const sunday = new Date(today);
      
      if (dayOfWeek === 0) {
        // Hoy es domingo
        saturday.setDate(today.getDate() - 1);
        sunday.setDate(today.getDate());
      } else if (dayOfWeek === 6) {
        // Hoy es sábado
        saturday.setDate(today.getDate());
        sunday.setDate(today.getDate() + 1);
      } else {
        // Día de semana
        const daysUntilSaturday = 6 - dayOfWeek;
        saturday.setDate(today.getDate() + daysUntilSaturday);
        sunday.setDate(today.getDate() + daysUntilSaturday + 1);
      }
      
      dateFilterState.pickerStart = saturday;
      dateFilterState.pickerEnd = sunday;
      break;
    }
    
    case '7days': {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 6);
      dateFilterState.pickerStart = new Date(today);
      dateFilterState.pickerEnd = weekEnd;
      break;
    }
    
    case 'all':
    default:
      dateFilterState.pickerStart = null;
      dateFilterState.pickerEnd = null;
      break;
  }
  
  // Sincronizar calendario con el mes del inicio del rango
  if (dateFilterState.pickerStart) {
    calendarState.currentMonth = dateFilterState.pickerStart.getMonth();
    calendarState.currentYear = dateFilterState.pickerStart.getFullYear();
  } else {
    calendarState.currentMonth = today.getMonth();
    calendarState.currentYear = today.getFullYear();
  }
  
  // Actualizar select legacy para compatibilidad
  const dateSelect = document.getElementById('dateSelect');
  if (dateSelect) {
    const legacyMap = {
      'all': 'all',
      'today': 'today',
      'tomorrow': 'tomorrow',
      '7days': 'week',
      'weekend': 'all'
    };
    dateSelect.value = legacyMap[shortcut] || 'all';
  }
  
  // Actualizar UI
  renderCalendar();
  updateCalendarInfo();
  updateDateShortcutStyles();
  applyFilters();
}

// ==================== CALENDAR FUNCTIONS ====================

function changeCalendarMonth(delta) {
  calendarState.currentMonth += delta;
  if (calendarState.currentMonth > 11) {
    calendarState.currentMonth = 0;
    calendarState.currentYear++;
  } else if (calendarState.currentMonth < 0) {
    calendarState.currentMonth = 11;
    calendarState.currentYear--;
  }
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const monthYearLabel = document.getElementById('calendarMonthYear');
  if (!grid || !monthYearLabel) return;
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthYearLabel.textContent = `${monthNames[calendarState.currentMonth]} ${calendarState.currentYear}`;
  
  // Calcular días del mes
  const firstDay = new Date(calendarState.currentYear, calendarState.currentMonth, 1);
  const lastDay = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Día de la semana del primer día (0=domingo, ajustar a 0=lunes)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;
  
  // Días del mes anterior para rellenar
  const prevMonthLastDay = new Date(calendarState.currentYear, calendarState.currentMonth, 0).getDate();
  
  let html = '';
  
  // Días del mes anterior (gris)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    html += `<div class="calendar-day text-on-surface-variant/30 text-center py-2 text-label-md">${day}</div>`;
  }
  
  // Días del mes actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calendarState.currentYear, calendarState.currentMonth, day);
    date.setHours(0, 0, 0, 0);
    
    const isToday = date.getTime() === today.getTime();
    const isSelected = isDateInSelection(date);
    const isStart = dateFilterState.pickerStart && date.getTime() === dateFilterState.pickerStart.getTime();
    const isEnd = dateFilterState.pickerEnd && date.getTime() === dateFilterState.pickerEnd.getTime();
    const isRange = isDateInRange(date);
    
    let classes = 'calendar-day text-center py-2 text-label-md cursor-pointer transition-all rounded-lg ';
    
    if (isStart || isEnd) {
      // Inicio o fin del rango (color primario fuerte)
      classes += 'bg-primary text-on-primary font-semibold';
    } else if (isRange) {
      // Dentro del rango (color primario suave)
      classes += 'bg-primary-container text-on-primary-container';
    } else if (isToday) {
      // Hoy (borde primario)
      classes += 'border-2 border-primary text-primary';
    } else {
      // Día normal
      classes += 'text-on-surface hover:bg-surface-variant';
    }
    
    html += `<div class="${classes}" onclick="handleCalendarDayClick(${day})" data-day="${day}">${day}</div>`;
  }
  
  // Días del mes siguiente para completar la última semana
  const totalCells = startDayOfWeek + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    html += `<div class="calendar-day text-on-surface-variant/30 text-center py-2 text-label-md">${day}</div>`;
  }
  
  grid.innerHTML = html;
}

function isDateInSelection(date) {
  if (!dateFilterState.pickerStart) return false;
  const start = dateFilterState.pickerStart.getTime();
  const end = dateFilterState.pickerEnd ? dateFilterState.pickerEnd.getTime() : start;
  const check = date.getTime();
  return check >= start && check <= end;
}

function isDateInRange(date) {
  if (!dateFilterState.pickerStart || !dateFilterState.pickerEnd) return false;
  const start = dateFilterState.pickerStart.getTime();
  const end = dateFilterState.pickerEnd.getTime();
  const check = date.getTime();
  return check > start && check < end;
}

function handleCalendarDayClick(day) {
  const clickedDate = new Date(calendarState.currentYear, calendarState.currentMonth, day);
  clickedDate.setHours(0, 0, 0, 0);
  
  // Si estamos en modo shortcut, cambiar a picker
  dateFilterState.mode = 'picker';
  
  if (!dateFilterState.pickerStart || (dateFilterState.pickerStart && dateFilterState.pickerEnd)) {
    // Primer clic o reinicio - establecer inicio
    dateFilterState.pickerStart = clickedDate;
    dateFilterState.pickerEnd = null;
    calendarState.selecting = true;
  } else if (calendarState.selecting) {
    // Segundo clic - establecer fin
    const start = dateFilterState.pickerStart;
    
    if (clickedDate < start) {
      // Si clic antes del inicio, invertir
      dateFilterState.pickerEnd = start;
      dateFilterState.pickerStart = clickedDate;
    } else {
      dateFilterState.pickerEnd = clickedDate;
    }
    calendarState.selecting = false;
  }
  
  // Actualizar UI
  renderCalendar();
  updateCalendarInfo();
  updateDateShortcutStyles();
  applyFilters();
}

function updateCalendarInfo() {
  const info = document.getElementById('calendarInfo');
  const text = document.getElementById('calendarRangeText');
  
  if (!info || !text) return;
  
  if (dateFilterState.mode === 'picker' && dateFilterState.pickerStart) {
    const start = dateFilterState.pickerStart;
    const end = dateFilterState.pickerEnd || start;
    
    const formatDate = (date) => {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };
    
    if (start.getTime() === end.getTime()) {
      text.textContent = `Fecha: ${formatDate(start)}`;
    } else {
      text.textContent = `${formatDate(start)} - ${formatDate(end)}`;
    }
    
    info.classList.remove('hidden');
  } else {
    info.classList.add('hidden');
  }
}

function clearDateFilter() {
  dateFilterState.mode = 'shortcut';
  dateFilterState.shortcut = 'all';
  dateFilterState.pickerStart = null;
  dateFilterState.pickerEnd = null;
  calendarState.selecting = false;
  
  // Reset calendar to current month
  const today = new Date();
  calendarState.currentMonth = today.getMonth();
  calendarState.currentYear = today.getFullYear();
  
  // Actualizar select legacy
  const dateSelect = document.getElementById('dateSelect');
  if (dateSelect) dateSelect.value = 'all';
  
  renderCalendar();
  updateCalendarInfo();
  updateDateShortcutStyles();
  applyFilters();
}

function updateDateShortcutStyles() {
  const shortcuts = document.querySelectorAll('.date-shortcut');
  shortcuts.forEach(btn => {
    const shortcut = btn.dataset.shortcut;
    const isActive = dateFilterState.mode === 'shortcut' && dateFilterState.shortcut === shortcut;
    
    if (isActive) {
      btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.remove('border-outline-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.add('border-outline-variant');
    }
  });
}

function getDateFilterRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateFilterState.mode === 'picker' && dateFilterState.pickerStart) {
    return {
      start: dateFilterState.pickerStart,
      end: dateFilterState.pickerEnd || dateFilterState.pickerStart
    };
  }
  
  // Modo shortcut
  switch (dateFilterState.shortcut) {
    case 'today':
      return { start: today, end: today };
    
    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { start: tomorrow, end: tomorrow };
    }
    
    case 'weekend': {
      // Sábado y domingo de esta semana
      const dayOfWeek = today.getDay(); // 0 = domingo, 6 = sábado
      const saturday = new Date(today);
      const sunday = new Date(today);
      
      if (dayOfWeek === 0) {
        // Hoy es domingo, el finde es hoy
        saturday.setDate(today.getDate() - 1);
        sunday.setDate(today.getDate());
      } else if (dayOfWeek === 6) {
        // Hoy es sábado, el finde es hoy y mañana
        saturday.setDate(today.getDate());
        sunday.setDate(today.getDate() + 1);
      } else {
        // Día de semana, calcular próximo finde
        const daysUntilSaturday = 6 - dayOfWeek;
        saturday.setDate(today.getDate() + daysUntilSaturday);
        sunday.setDate(today.getDate() + daysUntilSaturday + 1);
      }
      
      return { start: saturday, end: sunday };
    }
    
    case '7days': {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return { start: today, end: weekEnd };
    }
    
    case 'all':
    default:
      return null; // Sin filtro de fecha
  }
}

function refreshFilterFieldLabel(type) {
  const label = document.getElementById(`${type}SelectLabel`);
  if (!label) return;
  const selected = multiSelectState[type] || [];
  
  let allOptions = [];
  
  if (type === 'category') {
    const grid = document.getElementById('categoryGrid');
    allOptions = grid ? Array.from(grid.querySelectorAll('button')).map(btn => btn.dataset.value) : [];
  } else if (type === 'district') {
    const grid = document.getElementById('districtGrid');
    allOptions = grid ? Array.from(grid.querySelectorAll('button')).map(btn => btn.dataset.value) : [];
  } else if (type === 'time') {
    allOptions = ['morning', 'afternoon', 'evening', 'unspecified'];
  } else if (type === 'audience') {
    const grid = document.getElementById('audienceGrid');
    allOptions = grid ? Array.from(grid.querySelectorAll('button')).map(btn => btn.dataset.value) : ['Niños', 'Familias', 'Adultos', 'Mayores', 'Jóvenes'];
  } else {
    const dropdown = document.getElementById(`${type}Dropdown`);
    allOptions = dropdown ? Array.from(dropdown.querySelectorAll('input[type="checkbox"]')).map(cb => cb.value) : [];
  }
  
  const defaults = {
    category: 'Todas',
    district: 'Todos',
    audience: 'Todos',
    time: 'Todo el día'
  };

  if (selected.length === 0 || selected.length === allOptions.length) {
    label.textContent = defaults[type];
  } else if (selected.length === 1) {
    const timeLabels = {
      'morning': 'Mañana',
      'afternoon': 'Tarde',
      'evening': 'Noche',
      'unspecified': 'Sin especificar'
    };
    label.textContent = timeLabels[selected[0]] || selected[0];
  } else {
    label.textContent = `${selected.length} seleccionados`;
  }
  
  applyFilters();
}

// Función para el botón "Aplicar" dentro de filterFieldView
function applyFilterField() {
  // Aplicar los filtros
  applyFilters();
  // Volver a la vista de filtros principal
  openFiltersView();
}

// Función para el botón "Borrar" dentro de filterFieldView (limpia pero no cierra)
function resetFilterField() {
  if (!currentFilterField) return;

  if (currentFilterField === 'search') {
    currentFilters.search = '';
    const headerSearchInput = document.getElementById('searchInput');
    const filterSearchInput = document.getElementById('filterSearchInput');
    if (headerSearchInput) headerSearchInput.value = '';
    if (filterSearchInput) filterSearchInput.value = '';
  } else if (currentFilterField === 'date') {
    clearDateFilter();
  } else if (['freeOnly', 'favoritesOnly'].includes(currentFilterField)) {
    const checkbox = document.getElementById(currentFilterField);
    if (checkbox) checkbox.checked = false;
  } else if (currentFilterField === 'category') {
    multiSelectState.category = [];
    const grid = document.getElementById('categoryGrid');
    if (grid) {
      grid.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      });
    }
    refreshFilterFieldLabel('category');
  } else if (currentFilterField === 'time') {
    multiSelectState.time = [];
    const grid = document.getElementById('timeGrid');
    if (grid) {
      grid.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      });
    }
    refreshFilterFieldLabel('time');
  } else if (currentFilterField === 'audience') {
    multiSelectState.audience = [];
    const grid = document.getElementById('audienceGrid');
    if (grid) {
      grid.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      });
    }
    refreshFilterFieldLabel('audience');
  } else if (currentFilterField === 'district') {
    multiSelectState.district = [];
    const grid = document.getElementById('districtGrid');
    if (grid) {
      grid.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      });
    }
    refreshFilterFieldLabel('district');
  } else if (currentFilterField === 'duration') {
    durationFilterState = { min: 1, max: 30 };
    const minSlider = document.getElementById('durationMinSlider');
    const maxSlider = document.getElementById('durationMaxSlider');
    if (minSlider) minSlider.value = 1;
    if (maxSlider) maxSlider.value = 30;
    updateDurationSlider();
  } else if (currentFilterField === 'date') {
    clearDateFilter();
  }

  applyFilters();
}

// Toggle multi-select dropdown
function toggleMultiSelect(type) {
  const dropdown = document.getElementById(type + 'Dropdown');
  if (!dropdown) return; // Exit early if dropdown doesn't exist
  
  const isHidden = dropdown.classList.contains('hidden');
  
  // Close all other dropdowns
  ['district'].forEach(t => {
    const el = document.getElementById(t + 'Dropdown');
    if (el) {
      el.classList.add('hidden');
    }
  });
  
  // Toggle current
  if (isHidden) {
    dropdown.classList.remove('hidden');
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.multi-select-container')) {
    ['district'].forEach(type => {
      const dropdown = document.getElementById(type + 'Dropdown');
      if (dropdown) {
        dropdown.classList.add('hidden');
      }
    });
  }
});

// Update multi-select state and label
function updateMultiSelect(type) {
  const dropdown = document.getElementById(type + 'Dropdown');
  if (!dropdown) return; // Exit early if dropdown doesn't exist
  
  const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
  const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  
  multiSelectState[type] = selected;
  
  // Update label
  const label = document.getElementById(type + 'SelectLabel');
  if (!label) return; // Exit early if label doesn't exist
  
  const allOptions = Array.from(checkboxes).map(cb => cb.value);
  
  if (selected.length === 0 || selected.length === allOptions.length) {
    // Show default label
    const defaults = {
      category: 'Todas',
      district: 'Todos',
      audience: 'Todos',
      time: 'Todo el día'
    };
    label.textContent = defaults[type];
  } else if (selected.length === 1) {
    label.textContent = selected[0];
  } else {
    label.textContent = `${selected.length} seleccionados`;
  }
  
  applyFilters();
}

// Icon mapping for categories
const categoryIcons = {
  'Campamentos': 'camping',
  'Cine': 'movie',
  'Conferencias': 'co_present',
  'Danza': 'accessibility_new',
  'Destacada': 'star',
  'Excursiones': 'hiking',
  'Exposiciones': 'museum',
  'Fiestas': 'celebration',
  'Infantil': 'child_care',
  'Música': 'music_note',
  'Otras': 'category',
  'Talleres': 'palette'
};

// Populate filter options
function populateFilters() {
  // Categories as grid buttons
  const categories = [...new Set(allActivities.map(a => a.category))].sort();
  const categoryGrid = document.getElementById('categoryGrid');
  categoryGrid.innerHTML = '';
  
  categories.forEach(cat => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    
    // Add icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined';
    iconSpan.textContent = categoryIcons[cat] || 'category';
    button.appendChild(iconSpan);
    
    const textSpan = document.createElement('span');
    textSpan.className = 'filter-button-text';
    textSpan.textContent = cat;
    button.appendChild(textSpan);
    
    button.dataset.value = cat;
    button.dataset.type = 'category';
    button.onclick = () => toggleCategoryButton(button, cat);
    categoryGrid.appendChild(button);
  });
  
  // Districts as grid buttons
  const districts = [...new Set(allActivities.map(a => a.district))]
    .filter(d => d && d !== 'Desconocido')
    .sort();
  const districtGrid = document.getElementById('districtGrid');
  districtGrid.innerHTML = '';
  
  districts.forEach(d => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    
    // Add icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined';
    iconSpan.textContent = 'location_on';
    button.appendChild(iconSpan);
    
    const textSpan = document.createElement('span');
    textSpan.className = 'filter-button-text';
    textSpan.textContent = d;
    button.appendChild(textSpan);
    
    button.dataset.value = d;
    button.dataset.type = 'district';
    button.onclick = () => toggleDistrictButton(button, d);
    districtGrid.appendChild(button);
  });
}

function toggleCategoryButton(button, category) {
  const isSelected = multiSelectState.category.includes(category);

  if (isSelected) {
    multiSelectState.category = multiSelectState.category.filter(c => c !== category);
    button.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
  } else {
    multiSelectState.category.push(category);
    button.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
  }

  // Quitar foco del botón para evitar que el navegador móvil mantenga el estado :active/:focus
  button.blur();
  if (document.activeElement === button) {
    document.activeElement.blur();
  }
  
  // Forzar recálculo de estilos para eliminar el estado hover en móviles
  void button.offsetWidth;
  button.style.pointerEvents = 'none';
  setTimeout(() => {
    button.style.pointerEvents = '';
  }, 50);

  refreshFilterFieldLabel('category');
  applyFilters();
}

// Toggle district filter button
function toggleDistrictButton(button, district) {
  const isSelected = multiSelectState.district.includes(district);

  if (isSelected) {
    multiSelectState.district = multiSelectState.district.filter(d => d !== district);
    button.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
  } else {
    multiSelectState.district.push(district);
    button.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
  }

  // Quitar foco del botón para evitar que el navegador móvil mantenga el estado :active/:focus
  button.blur();
  if (document.activeElement === button) {
    document.activeElement.blur();
  }
  
  // Forzar recálculo de estilos para eliminar el estado hover en móviles
  void button.offsetWidth;
  button.style.pointerEvents = 'none';
  setTimeout(() => {
    button.style.pointerEvents = '';
  }, 50);

  refreshFilterFieldLabel('district');
  applyFilters();
}

// Toggle time filter button
function toggleTimeButton(button, time) {
  const isSelected = multiSelectState.time.includes(time);

  if (isSelected) {
    multiSelectState.time = multiSelectState.time.filter(t => t !== time);
    button.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
    button.classList.add('border-outline-variant');
  } else {
    multiSelectState.time.push(time);
    button.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
    button.classList.remove('border-outline-variant');
  }

  // Quitar foco del botón para evitar que el navegador móvil mantenga el estado :active/:focus
  button.blur();
  if (document.activeElement === button) {
    document.activeElement.blur();
  }
  
  // Forzar recálculo de estilos para eliminar el estado hover en móviles
  void button.offsetWidth;
  button.style.pointerEvents = 'none';
  setTimeout(() => {
    button.style.pointerEvents = '';
  }, 50);

  refreshFilterFieldLabel('time');
  applyFilters();
}

// Legacy function for backward compatibility
function toggleTimeFilter(time) {
  const buttons = document.querySelectorAll('#timeGrid button[data-type="time"]');
  const button = Array.from(buttons).find(btn => btn.dataset.value === time);
  if (button) {
    toggleTimeButton(button, time);
  }
}

// Toggle audience filter button
function toggleAudienceButton(button, audience) {
  const isSelected = multiSelectState.audience.includes(audience);

  if (isSelected) {
    multiSelectState.audience = multiSelectState.audience.filter(a => a !== audience);
    button.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
    button.classList.add('border-outline-variant');
  } else {
    multiSelectState.audience.push(audience);
    button.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
    button.classList.remove('border-outline-variant');
  }

  // Quitar foco del botón para evitar que el navegador móvil mantenga el estado :active/:focus
  button.blur();
  if (document.activeElement === button) {
    document.activeElement.blur();
  }
  
  // Forzar recálculo de estilos para eliminar el estado hover en móviles
  void button.offsetWidth;
  button.style.pointerEvents = 'none';
  setTimeout(() => {
    button.style.pointerEvents = '';
  }, 50);

  refreshFilterFieldLabel('audience');
  applyFilters();
}

// Toggle filters panel
function openFiltersView() {
  const filtersView = document.getElementById('filtersView');
  if (!filtersView) return;

  // Guarda el tab activo de la navbar (no la vista anterior)
  const activeTab = document.querySelector('.bottom-tab.bg-primary-container');
  filtersView.dataset.activeTab = activeTab ? activeTab.dataset.tab : 'home';

  showView('filters');
  filtersView.scrollTop = 0;

  // Mostrar activeFiltersBar si hay filtros activos
  updateActiveFilterChips();

  // Actualizar indicadores de filtros en la lista
  updateFilterIndicators();
  
  // Mostrar la barra de acciones fija inferior
  const actionBar = document.getElementById('filtersActionBar');
  if (actionBar) {
    actionBar.classList.remove('hidden');
  }
}

function closeFiltersView() {
  const filtersView = document.getElementById('filtersView');
  if (!filtersView) return;
  
  // Restaura el tab activo guardado
  const activeTab = filtersView.dataset.activeTab || 'home';
  setBottomTab(activeTab);
  applyFilters();
  
  // Ocultar la barra de acciones fija inferior
  const actionBar = document.getElementById('filtersActionBar');
  if (actionBar) {
    actionBar.classList.add('hidden');
  }
}

function toggleFilters() {
  const filtersView = document.getElementById('filtersView');
  if (!filtersView) return;

  if (filtersView.classList.contains('hidden')) {
    openFiltersView();
  } else {
    closeFiltersView();
  }
}

// Sort Modal functions
let selectedSortOption = 'recent';
let pendingDistanceSort = false;

function openSortModal() {
  // Get current sort value
  selectedSortOption = currentFilters.sort || 'recent';
  
  // Update UI to show current selection
  updateSortModalUI();
  
  // Show modal
  document.getElementById('sortModal').classList.remove('hidden');
  document.addEventListener('keydown', handleSortModalKeydown);
}

function closeSortModal() {
  document.getElementById('sortModal').classList.add('hidden');
  document.removeEventListener('keydown', handleSortModalKeydown);
}

function handleSortModalKeydown(event) {
  if (event.key === 'Escape') {
    closeSortModal();
  }
}

function selectSortOption(value) {
  selectedSortOption = value;
  updateSortModalUI();
}

function updateSortModalUI() {
  // Update all check indicators
  document.querySelectorAll('.sort-check').forEach(check => {
    const checkIcon = check.querySelector('.material-symbols-outlined');
    if (check.dataset.value === selectedSortOption) {
      check.classList.add('bg-white', 'border-white');
      checkIcon.classList.remove('hidden');
    } else {
      check.classList.remove('bg-white', 'border-white');
      checkIcon.classList.add('hidden');
    }
  });
  
  // Update radio inputs
  document.querySelectorAll('input[name="sortOption"]').forEach(radio => {
    radio.checked = radio.value === selectedSortOption;
  });

  const warning = document.getElementById('distanceSortWarning');
  if (warning) {
    if (selectedSortOption === 'distance' && !userLocation) {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }
}

function applySortSelection() {
  if (selectedSortOption === 'distance' && !userLocation) {
    pendingDistanceSort = true;
    closeSortModal();
    openLocationModal();
    return;
  }

  // Update current filters using the modal selection
  setSortState(selectedSortOption);

  // Show location input only if it is present in the DOM
  const locationInput = document.getElementById('locationInput');
  if (locationInput) {
    if (selectedSortOption === 'distance') {
      locationInput.classList.remove('hidden');
    } else {
      locationInput.classList.add('hidden');
    }
  }
  
  // Apply filters
  applyFilters();
  
  // Close modal
  closeSortModal();
}

// Location Modal functions
// Info Modal functions
function openInfo() {
  window.previousViewBeforeInfo = currentView;
  showView('info');

  const infoView = document.getElementById('infoView');
  if (infoView) {
    infoView.scrollTop = 0;
  }
  window.scrollTo({ top: 0, behavior: 'auto' });

  document.addEventListener('keydown', handleInfoModalKeydown);
}

function closeInfo() {
  const previousView = window.previousViewBeforeInfo || 'home';
  showView(previousView);
  updateBottomTabUI(previousView);
  document.removeEventListener('keydown', handleInfoModalKeydown);
}

function handleInfoModalKeydown(event) {
  if (event.key === 'Escape') {
    closeInfo();
  }
}

function openLocationModal() {
  document.getElementById('locationModal').classList.remove('hidden');
  document.getElementById('modalAddressInput').focus();
}

function closeLocationModal(fromSuccess = false) {
  document.getElementById('locationModal').classList.add('hidden');
  document.getElementById('modalLocationStatus').textContent = '';

  if (pendingDistanceSort && !fromSuccess) {
    pendingDistanceSort = false;
    if (!userLocation) {
      openSortModal();
      const warning = document.getElementById('distanceSortWarning');
      if (warning) {
        warning.textContent = 'Para ordenar por distancia debes añadir una ubicación.';
        warning.classList.remove('hidden');
      }
    }
  }
}

async function geocodeAddressFromModal() {
  const address = document.getElementById('modalAddressInput').value;
  const status = document.getElementById('modalLocationStatus');
  
  if (!address) {
    status.textContent = 'Introduce una dirección';
    status.className = 'text-label-sm mb-4 text-error';
    return;
  }
  
  status.textContent = 'Buscando ubicación...';
  status.className = 'text-label-sm mb-4 text-on-surface-variant';
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Madrid, España')}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      userLocation = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
      status.textContent = '✓ Ubicación encontrada';
      status.className = 'text-label-sm mb-4 text-green-600';
      
      // Update KPI to show number instead of button
      // updateKPIs();
      // updateKPINearButton();
      
      // Close modal after a short delay
      setTimeout(() => {
        closeLocationModal(true);
        // Apply distance sort (without near filter)
        setSortState('distance');

        // Update user location marker first if in map view
        if (currentView === 'map' && map) {
          // Remove old user location marker if exists
          if (window.userLocationMarker) {
            map.removeLayer(window.userLocationMarker);
          }
          // Create new user location marker
          window.userLocationMarker = L.marker([userLocation.lat, userLocation.lon], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div style="background: #F08080; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            })
          }).addTo(map).bindPopup('Tu ubicación').openPopup();
        }

        // Apply filters (this will call updateMapMarkers if in map view)
        applyFilters();

        // Center map on new location if in map view (instantáneo)
        if (currentView === 'map' && map) {
          map.setView([userLocation.lat, userLocation.lon], 14);
        }
      }, 500);
    } else {
      status.textContent = '✗ No se encontró la ubicación';
      status.className = 'text-label-sm mb-4 text-error';
    }
  } catch (error) {
    status.textContent = '✗ Error al buscar';
    status.className = 'text-label-sm mb-4 text-error';
  }
}

// Get current location from device GPS
function getCurrentLocationFromModal() {
  const status = document.getElementById('modalLocationStatus');
  
  if (!navigator.geolocation) {
    status.textContent = '✗ Geolocalización no disponible';
    status.className = 'text-label-sm mb-2 text-error';
    return;
  }
  
  status.textContent = 'Obteniendo ubicación...';
  status.className = 'text-label-sm mb-2 text-on-surface-variant';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      status.textContent = '✓ Ubicación obtenida';
      status.className = 'text-label-sm mb-2 text-green-600';
      
      // Update KPI to show number instead of button
      // updateKPIs();
      // updateKPINearButton();
      
      // Close modal after a short delay
      setTimeout(() => {
        closeLocationModal(true);
        // Apply distance sort (without near filter)
        setSortState('distance');

        // Update user location marker first if in map view
        if (currentView === 'map' && map) {
          // Remove old user location marker if exists
          if (window.userLocationMarker) {
            map.removeLayer(window.userLocationMarker);
          }
          // Create new user location marker
          window.userLocationMarker = L.marker([userLocation.lat, userLocation.lon], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div style="background: #F08080; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            })
          }).addTo(map).bindPopup('Tu ubicación').openPopup();
        }

        // Apply filters (this will call updateMapMarkers if in map view)
        applyFilters();

        // Center map on new location if in map view (instantáneo)
        if (currentView === 'map' && map) {
          map.setView([userLocation.lat, userLocation.lon], 14);
        }
      }, 500);
    },
    (error) => {
      let errorMsg = '✗ Error al obtener ubicación';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = '✗ Permiso denegado';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = '✗ Ubicación no disponible';
          break;
        case error.TIMEOUT:
          errorMsg = '✗ Tiempo agotado';
          break;
      }
      status.textContent = errorMsg;
      status.className = 'text-label-sm mb-2 text-error';
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

// Update KPI Near button based on userLocation
function updateKPINearButton() {
  const kpiNear = document.getElementById('kpiNear');
  const kpiNearLabel = document.getElementById('kpiNearLabel');
  const kpiNearContainer = document.getElementById('kpiNearContainer');
  
  if (!userLocation) {
    // Show button to add location - White background with contrast border
    kpiNear.textContent = '+';
    kpiNearLabel.textContent = 'Añadir';
    kpiNearContainer.style.background = '#ffffff';
    kpiNearContainer.style.border = '2px solid #F08080';
    kpiNearContainer.style.color = '#F08080';
    kpiNearContainer.classList.remove('text-white');
    kpiNearContainer.classList.add('text-primary');
  } else {
    // Show count - Original gradient style
    const count = filteredActivities.filter(a => a.distance && a.distance < 2).length;
    kpiNear.textContent = count;
    kpiNearLabel.textContent = 'Cerca';
    kpiNearContainer.style.background = 'linear-gradient(135deg, #F8AD9D 0%, #FBC4AB 100%)';
    kpiNearContainer.style.border = 'none';
    kpiNearContainer.style.color = '';
    kpiNearContainer.classList.remove('text-primary');
    kpiNearContainer.classList.add('text-white');
  }
}

// Update KPI Favorites visual style based on count
function updateKPIFavoritesStyle() {
  const container = document.getElementById('kpiFavoritesContainer');
  const icon = document.getElementById('kpiFavoritesIcon');
  const count = document.getElementById('kpiFavorites');
  const label = document.getElementById('kpiFavoritesLabel');
  
  // Use valid favorites count (only non-expired activities)
  const validFavs = getValidFavorites();
  
  if (validFavs.length === 0) {
    // Empty state: subtle style with outlined heart
    container.style.background = 'linear-gradient(135deg, #FBC4AB 0%, #FFDAB9 100%)';
    container.style.border = '2px solid #D06060';
    icon.textContent = 'favorite';
    icon.classList.remove('filled');
    icon.style.fontVariationSettings = "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24";
    count.classList.remove('font-black');
    count.classList.add('font-bold');
    label.style.opacity = '0.9';
  } else {
    // Active state: vibrant red/pink with filled heart
    container.style.background = 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)';
    container.style.border = 'none';
    icon.textContent = 'favorite';
    icon.classList.add('filled');
    icon.style.fontVariationSettings = "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24";
    count.classList.remove('font-bold');
    count.classList.add('font-black');
    label.style.opacity = '1';
  }
}

// Toggle KPI filter
function toggleKPIFilter(type) {
  // Check if filter is already active
  const index = activeKPIFilters.indexOf(type);

  if (index > -1) {
    // Filter is active, remove it
    activeKPIFilters.splice(index, 1);
    clearKPIFilter(type);
    return;
  }

  // Special case: 'today' and 'week' are mutually exclusive
  if (type === 'today') {
    const weekIndex = activeKPIFilters.indexOf('week');
    if (weekIndex > -1) {
      activeKPIFilters.splice(weekIndex, 1);
      clearKPIFilter('week');
    }
  } else if (type === 'week') {
    const todayIndex = activeKPIFilters.indexOf('today');
    if (todayIndex > -1) {
      activeKPIFilters.splice(todayIndex, 1);
      clearKPIFilter('today');
    }
  }

  // Add new filter
  activeKPIFilters.push(type);

  // Update visual state of KPI cards
  updateKPICardStyles();

  // Apply the filter
  applyKPIFilter(type);
}

// Handle KPI proximity click (special case)
function handleKPIProximity() {
  if (!userLocation) {
    openLocationModal();
    return;
  }
  toggleKPIFilter('near');
}

// Update KPI card visual styles based on active state
function updateKPICardStyles() {
  const kpiIds = ['kpiTodayContainer', 'kpiWeekContainer', 'kpiNearContainer', 'kpiFavoritesContainer'];

  // Remove active class from all
  kpiIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('active');
    }
  });

  // Add active class to all active filters
  const idMap = {
    'today': 'kpiTodayContainer',
    'week': 'kpiWeekContainer',
    'near': 'kpiNearContainer',
    'favorites': 'kpiFavoritesContainer'
  };

  activeKPIFilters.forEach(filter => {
    const activeId = idMap[filter];
    if (activeId) {
      const activeElement = document.getElementById(activeId);
      if (activeElement) {
        activeElement.classList.add('active');
      }
    }
  });
}

// Apply KPI filter (adds to existing filters, doesn't replace them)
function applyKPIFilter(type) {
  switch (type) {
    case 'today':
      currentFilters.date = 'today';
      document.getElementById('dateSelect').value = 'today';
      break;
    case 'week':
      currentFilters.date = 'week';
      document.getElementById('dateSelect').value = 'week';
      break;
    case 'featured':
      // For featured, we use multi-select category
      if (!multiSelectState.category.includes('Destacada')) {
        multiSelectState.category.push('Destacada');
        // Update the button in grid
        const categoryGrid = document.getElementById('categoryGrid');
        const destButton = categoryGrid.querySelector('button[data-value="Destacada"]');
        if (destButton) {
          destButton.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        }
        refreshFilterFieldLabel('category');
      }
      break;
    case 'near':
      if (userLocation) {
        currentFilters.nearOnly = true;
        setSortState('distance');
        const locationInput = document.getElementById('locationInput');
        if (locationInput) {
          locationInput.classList.remove('hidden');
        }
      }
      break;
    case 'favorites':
      currentFilters.favoritesOnly = true;
      document.getElementById('favoritesOnly').checked = true;
      break;
  }
  
  // Show list view and apply filters
  showView('list');
  applyFilters();
}

// Clear KPI filter (removes only the specified KPI filter, keeps other filters)
function clearKPIFilter(filterToClear) {
  // If no specific filter provided, clear all (backward compatibility)
  if (!filterToClear && activeKPIFilters.length > 0) {
    filterToClear = activeKPIFilters[0];
  }

  // Remove from active filters array
  const index = activeKPIFilters.indexOf(filterToClear);
  if (index > -1) {
    activeKPIFilters.splice(index, 1);
  }

  switch (filterToClear) {
    case 'today':
    case 'week':
      currentFilters.date = 'all';
      document.getElementById('dateSelect').value = 'all';
      break;
    case 'featured':
      // Remove Destacada from multi-select
      const catIndex = multiSelectState.category.indexOf('Destacada');
      if (catIndex > -1) {
        multiSelectState.category.splice(catIndex, 1);
        const categoryGrid = document.getElementById('categoryGrid');
        const destButton = categoryGrid.querySelector('button[data-value="Destacada"]');
        if (destButton) {
          destButton.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        }
        refreshFilterFieldLabel('category');
      }
      break;
    case 'near':
      currentFilters.nearOnly = false;
      setSortState('recent');
      const locationInput = document.getElementById('locationInput');
      if (locationInput) {
        locationInput.classList.add('hidden');
      }
      break;
    case 'favorites':
      currentFilters.favoritesOnly = false;
      document.getElementById('favoritesOnly').checked = false;
      break;
  }

  updateKPICardStyles();
  applyFilters();
}

// Sync KPI state with current filters (call when filters change manually)
function syncKPIStateWithFilters() {
  // Build array of matched KPIs based on current filters
  const matchedKPIs = [];

  // Check for 'today' filter
  if (currentFilters.date === 'today') {
    matchedKPIs.push('today');
  }
  // Check for 'week' filter
  else if (currentFilters.date === 'week') {
    matchedKPIs.push('week');
  }

  // Check for 'favorites' filter (can combine with date)
  if (currentFilters.favoritesOnly) {
    matchedKPIs.push('favorites');
  }

  // Check for 'near' filter (can combine with others)
  if (currentFilters.sort === 'distance' && userLocation) {
    matchedKPIs.push('near');
  }

  // Update active KPIs if changed
  const hasChanged = JSON.stringify(activeKPIFilters.sort()) !== JSON.stringify(matchedKPIs.sort());
  if (hasChanged) {
    activeKPIFilters = matchedKPIs;
    updateKPICardStyles();
  }
}

// Extract hour from time string
function extractHour(timeStr) {
  if (!timeStr) return null;
  try {
    const parts = String(timeStr).split(':');
    if (parts.length >= 2) {
      return parseInt(parts[0]);
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Geocode address
async function geocodeAddress() {
  const address = document.getElementById('addressInput').value;
  if (!address) return;
  
  const status = document.getElementById('locationStatus');
  status.textContent = 'Buscando ubicación...';
  status.className = 'text-label-sm mt-1 text-on-surface-variant';
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Madrid, España')}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      userLocation = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
      status.textContent = `✓ Ubicación encontrada`;
      status.className = 'text-label-sm mt-1 text-green-600';
      
      // Update user location marker first if in map view
      if (currentView === 'map' && map) {
        // Remove old user location marker if exists
        if (window.userLocationMarker) {
          map.removeLayer(window.userLocationMarker);
        }
        // Create new user location marker
        window.userLocationMarker = L.marker([userLocation.lat, userLocation.lon], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #F08080; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          })
        }).addTo(map).bindPopup('Tu ubicación').openPopup();
      }
      
      // Apply filters (this will call updateMapMarkers if in map view)
      applyFilters();
      
      // Center map on new location if in map view (instantáneo)
      if (currentView === 'map' && map) {
        map.setView([userLocation.lat, userLocation.lon], 14);
      }
    } else {
      status.textContent = '✗ No se encontró la ubicación';
      status.className = 'text-label-sm mt-1 text-error';
    }
  } catch (error) {
    status.textContent = '✗ Error al buscar';
    status.className = 'text-label-sm mt-1 text-error';
  }
}

// Calculate distance
// Comparar si dos fechas son el mismo día (ignorando hora)
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Apply filters
function applyFilters() {
  // Sincronizar ambos campos de búsqueda
  const headerSearchInput = document.getElementById('searchInput');
  const filterSearchInput = document.getElementById('filterSearchInput');
  
  // Detectar qué input tiene el foco para priorizar su valor
  const activeElement = document.activeElement;
  let searchValue = '';
  
  if (activeElement === filterSearchInput && filterSearchInput) {
    // El usuario está escribiendo en el input de filtros
    searchValue = filterSearchInput.value.trim();
  } else if (activeElement === headerSearchInput && headerSearchInput) {
    // El usuario está escribiendo en el input de la cabecera
    searchValue = headerSearchInput.value.trim();
  } else {
    // Ninguno tiene foco, usar el valor que tenga contenido o mantener el actual
    if (headerSearchInput && headerSearchInput.value.trim()) {
      searchValue = headerSearchInput.value.trim();
    } else if (filterSearchInput && filterSearchInput.value.trim()) {
      searchValue = filterSearchInput.value.trim();
    }
  }
  
  // Sincronizar ambos inputs
  if (headerSearchInput) headerSearchInput.value = searchValue;
  if (filterSearchInput) filterSearchInput.value = searchValue;
  
  currentFilters.search = searchValue.toLowerCase();
  // Multi-select filters - use multiSelectState
  currentFilters.category = multiSelectState.category;
  currentFilters.district = multiSelectState.district;
  currentFilters.audience = multiSelectState.audience;
  currentFilters.time = multiSelectState.time;
  currentFilters.date = document.getElementById('dateSelect').value;
  currentFilters.freeOnly = document.getElementById('freeOnly').checked;
  currentFilters.favoritesOnly = document.getElementById('favoritesOnly').checked;
  currentFilters.sort = currentFilters.sort || 'recent';
  
  // Duration filter
  currentFilters.durationMin = durationFilterState.min;
  currentFilters.durationMax = durationFilterState.max;

  // Show/hide location input only if the element exists
  const locationInput = document.getElementById('locationInput');
  if (locationInput) {
    if (currentFilters.sort === 'distance') {
      locationInput.classList.remove('hidden');
    } else {
      locationInput.classList.add('hidden');
    }
  }

  // Get all available options for each multi-select to check if all/none selected
  const allCategories = [...new Set(allActivities.map(a => a.category))];
  const allDistricts = [...new Set(allActivities.map(a => a.district))].filter(d => d && d !== 'Desconocido');
  const allAudiences = ['Niños', 'Familias', 'Adultos', 'Mayores', 'Jóvenes'];
  const allTimes = ['morning', 'afternoon', 'evening', 'unspecified'];

  // Calculate distances first if user location is available (needed for near filter)
  if (userLocation) {
    allActivities.forEach(activity => {
      if (activity.lat && activity.lon) {
        activity.distance = calculateDistance(userLocation.lat, userLocation.lon, activity.lat, activity.lon);
      } else {
        activity.distance = null;
      }
    });
  }

  filteredActivities = allActivities.filter(activity => {
    // Category filter - multi-select
    // Skip if no selection or all selected
    const categorySelected = currentFilters.category.length > 0 && currentFilters.category.length < allCategories.length;
    if (categorySelected) {
      if (!currentFilters.category.includes(activity.category)) return false;
    }

    // District filter - multi-select
    const districtSelected = currentFilters.district.length > 0 && currentFilters.district.length < allDistricts.length;
    if (districtSelected) {
      if (!currentFilters.district.includes(activity.district)) return false;
    }

    // Audience filter - multi-select
    const audienceSelected = currentFilters.audience.length > 0 && currentFilters.audience.length < allAudiences.length;
    if (audienceSelected && activity.audience) {
      const activityAudiences = activity.audience.split(',').map(a => a.trim());
      const hasMatch = activityAudiences.some(a => 
        currentFilters.audience.some(selected => 
          a.toLowerCase().includes(selected.toLowerCase())
        )
      );
      if (!hasMatch) return false;
    }

    // Date filter (hybrid: shortcuts + picker with range overlap logic)
    const dateRange = getDateFilterRange();
    if (dateRange && activity.date && activity.endDate) {
      const actStart = new Date(activity.date);
      const actEnd = new Date(activity.endDate);
      actStart.setHours(0, 0, 0, 0);
      actEnd.setHours(0, 0, 0, 0);
      
      // Evento visible si hay solapamiento con el rango de filtro
      // (inicio_evento <= fin_filtro) AND (fin_evento >= inicio_filtro)
      const overlap = actStart <= dateRange.end && actEnd >= dateRange.start;
      if (!overlap) return false;
    } else if (dateRange && activity.date) {
      // Fallback: si no hay endDate, usar date como único día
      const actDate = new Date(activity.date);
      actDate.setHours(0, 0, 0, 0);
      const inRange = actDate >= dateRange.start && actDate <= dateRange.end;
      if (!inRange) return false;
    }

    // Time filter - multi-select
    const timeSelected = currentFilters.time.length > 0 && currentFilters.time.length < allTimes.length;
    if (timeSelected) {
      let matchesTime = false;
      const hasUnspecified = currentFilters.time.includes('unspecified');
      const hasTimeSlots = currentFilters.time.some(t => ['morning', 'afternoon', 'evening'].includes(t));
      
      // Check if activity has no time and 'unspecified' is selected
      if (!activity.time && hasUnspecified) {
        matchesTime = true;
      }
      // Check time slots if activity has time
      else if (activity.time && hasTimeSlots) {
        const hour = extractHour(activity.time);
        if (hour !== null) {
          if (currentFilters.time.includes('morning') && hour >= 6 && hour < 12) matchesTime = true;
          if (currentFilters.time.includes('afternoon') && hour >= 12 && hour < 18) matchesTime = true;
          // Noche: 18:00 a 06:00 (cubre madrugada y noche)
          if (currentFilters.time.includes('evening') && (hour >= 18 || hour < 6)) matchesTime = true;
        }
      }
      
      if (!matchesTime) return false;
    }

    // Free filter
    if (currentFilters.freeOnly && !activity.free) {
      return false;
    }

    // Favorites filter - only show valid (non-expired) favorites
    if (currentFilters.favoritesOnly) {
      const validFavs = getValidFavorites();
      if (!validFavs.includes(activity.id)) {
        return false;
      }
    }

    // Near filter - only show activities within 2km
    if (currentFilters.nearOnly && userLocation) {
      if (!activity.distance || activity.distance >= 2) {
        return false;
      }
    }

    // Search filter
    if (currentFilters.search) {
      const searchIn = (activity.title + ' ' + activity.description).toLowerCase();
      if (!searchIn.includes(currentFilters.search)) return false;
    }

    // Duration filter
    const durationMin = currentFilters.durationMin || 1;
    const durationMax = currentFilters.durationMax || 30;
    const activityDuration = activity.date_diff || 1;
    
    // Si max es 30, consideramos "30+" como sin límite superior
    const effectiveMax = durationMax >= 30 ? Infinity : durationMax;
    
    if (activityDuration < durationMin || activityDuration > effectiveMax) {
      return false;
    }

    // Location filter (from map popup) - filter by exact location key
    if (currentFilters.locationKey) {
      if (!activity.lat || !activity.lon) return false;
      const activityKey = `${activity.lat.toFixed(5)},${activity.lon.toFixed(5)}`;
      if (activityKey !== currentFilters.locationKey) return false;
    }

    return true;
  });
  
  // Show location info
  if (userLocation) {
    document.getElementById('locationInfo').innerHTML = `<span class="material-symbols-outlined text-sm">straighten</span> km`;
    document.getElementById('locationInfo').classList.remove('hidden');
  }
  
  // Sort
  if (currentFilters.sort === 'recent') {
    filteredActivities.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date - b.date;
    });
  } else if (currentFilters.sort === 'oldest') {
    filteredActivities.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
    });
  } else if (currentFilters.sort === 'price') {
    filteredActivities.sort((a, b) => (b.free ? 1 : 0) - (a.free ? 1 : 0));
  } else if (currentFilters.sort === 'distance') {
    filteredActivities.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }
  
  currentPage = 0;
  // updateKPIs();
  renderActivities();
  renderStats();
  
  // Update filter result count in buttons
  const filterCountEl = document.getElementById('filterResultCount');
  if (filterCountEl) {
    filterCountEl.textContent = filteredActivities.length;
  }
  const filterCountBottomEl = document.getElementById('filterResultCountBottom');
  if (filterCountBottomEl) {
    filterCountBottomEl.textContent = filteredActivities.length;
  }
  // Update filter field result count
  const filterFieldResultCountEl = document.getElementById('filterFieldResultCount');
  if (filterFieldResultCountEl) {
    filterFieldResultCountEl.textContent = filteredActivities.length;
  }
  
  // Sync tabs with current filters
  syncTabsWithFilters();
  
  // Sync KPI state with current filters
  syncKPIStateWithFilters();

  // Update active filter chips
  updateActiveFilterChips();

  // Update filter indicators in filters list
  updateFilterIndicators();

  // Update map markers if in map view
  if (currentView === 'map' && map) {
    updateMapMarkers();
  }
  
  // Render new home sections
  if (typeof renderNewHome === 'function') {
    renderNewHome();
  }
}

// Adjust map size based on filter chips visibility
function adjustMapSize() {
  if (currentView !== 'map') return;

  const mapContainer = document.getElementById('mapView');
  const filtersBar = document.getElementById('activeFiltersBar');
  if (!mapContainer) return;

  const hasFilters = filtersBar && !filtersBar.classList.contains('hidden');
  if (hasFilters) {
    mapContainer.style.top = '110px';
    mapContainer.style.height = 'calc(100vh - 180px)';
  } else {
    mapContainer.style.top = '64px';
    mapContainer.style.height = 'calc(100vh - 140px)';
  }
}

// Sync main tabs with current filter state
function syncTabsWithFilters() {
  const sort = currentFilters.sort;
  const date = document.getElementById('dateSelect').value;
  
  // Determine which tab should be active based on filters
  let activeTab = 'recent'; // default
  
  if (sort === 'distance' && userLocation) {
    activeTab = 'nearby';
  } else if (date === 'week' && sort === 'recent') {
    activeTab = 'week';
  } else if (sort === 'recent' && date === 'all') {
    activeTab = 'recent';
  }
  
  // Update tab visuals without triggering applyFilters
  document.querySelectorAll('.main-tab').forEach(btn => {
    if (btn.dataset.tab === activeTab) {
      btn.classList.add('bg-primary-container', 'text-on-primary-container');
      btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'text-on-primary-container');
      btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
    }
  });
}

// Update KPIs
function updateKPIs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all available options for each multi-select
  const allCategories = [...new Set(allActivities.map(a => a.category))];
  const allDistricts = [...new Set(allActivities.map(a => a.district))].filter(d => d && d !== 'Desconocido');
  const allAudiences = ['Niños', 'Familias', 'Adultos', 'Mayores', 'Jóvenes'];
  const allTimes = ['morning', 'afternoon', 'evening', 'unspecified'];

  // Apply ALL current filters to determine base activities for KPIs
  let baseActivities = allActivities.filter(activity => {
    // Category filter
    const categorySelected = currentFilters.category.length > 0 && currentFilters.category.length < allCategories.length;
    if (categorySelected) {
      if (!currentFilters.category.includes(activity.category)) return false;
    }

    // District filter
    const districtSelected = currentFilters.district.length > 0 && currentFilters.district.length < allDistricts.length;
    if (districtSelected) {
      if (!currentFilters.district.includes(activity.district)) return false;
    }

    // Audience filter
    const audienceSelected = currentFilters.audience.length > 0 && currentFilters.audience.length < allAudiences.length;
    if (audienceSelected && activity.audience) {
      const activityAudiences = activity.audience.split(',').map(a => a.trim());
      const hasMatch = activityAudiences.some(a =>
        currentFilters.audience.some(selected =>
          a.toLowerCase().includes(selected.toLowerCase())
        )
      );
      if (!hasMatch) return false;
    }

    // Date filter
    if (currentFilters.date !== 'all' && activity.date) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);

      if (currentFilters.date === 'today') {
        if (activityDate.getTime() !== today.getTime()) return false;
      } else if (currentFilters.date === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (activityDate.getTime() !== tomorrow.getTime()) return false;
      } else if (currentFilters.date === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        if (activityDate > weekFromNow) return false;
      } else if (currentFilters.date === 'month') {
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        if (activityDate > monthFromNow) return false;
      }
    }

    // Time filter
    const timeSelected = currentFilters.time.length > 0 && currentFilters.time.length < allTimes.length;
    if (timeSelected) {
      let matchesTime = false;
      const hasUnspecified = currentFilters.time.includes('unspecified');
      const hasTimeSlots = currentFilters.time.some(t => ['morning', 'afternoon', 'evening'].includes(t));
      
      // Check if activity has no time and 'unspecified' is selected
      if (!activity.time && hasUnspecified) {
        matchesTime = true;
      }
      // Check time slots if activity has time
      else if (activity.time && hasTimeSlots) {
        const hour = extractHour(activity.time);
        if (hour !== null) {
          if (currentFilters.time.includes('morning') && hour >= 6 && hour < 12) matchesTime = true;
          if (currentFilters.time.includes('afternoon') && hour >= 12 && hour < 18) matchesTime = true;
          // Noche: 18:00 a 06:00 (cubre madrugada y noche)
          if (currentFilters.time.includes('evening') && (hour >= 18 || hour < 6)) matchesTime = true;
        }
      }
      
      if (!matchesTime) return false;
    }

    // Free filter
    if (currentFilters.freeOnly && !activity.free) {
      return false;
    }

    // Favorites filter
    if (currentFilters.favoritesOnly) {
      const validFavs = getValidFavorites();
      if (!validFavs.includes(activity.id)) return false;
    }

    // Near filter
    if (currentFilters.nearOnly && userLocation) {
      if (!activity.distance || activity.distance >= 2) return false;
    }

    // Search filter
    if (currentFilters.search) {
      const searchIn = (activity.title + ' ' + activity.description).toLowerCase();
      if (!searchIn.includes(currentFilters.search)) return false;
    }

    // Location filter
    if (currentFilters.locationKey) {
      if (!activity.lat || !activity.lon) return false;
      const activityKey = `${activity.lat.toFixed(5)},${activity.lon.toFixed(5)}`;
      if (activityKey !== currentFilters.locationKey) return false;
    }

    return true;
  });

  // Count for "Today" KPI
  const kpiToday = baseActivities.filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).length;

  // Count for "This Week" KPI (next 7 days)
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const kpiWeek = baseActivities.filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d >= today && d <= weekFromNow;
  }).length;

  // Count for "Near" KPI
  const kpiNear = userLocation ?
    baseActivities.filter(a => a.distance && a.distance < 2).length : 0;

  // Count for "Favorites" KPI
  const validFavs = getValidFavorites();
  const kpiFavorites = baseActivities.filter(a => validFavs.includes(a.id)).length;

  // document.getElementById('kpiToday').textContent = kpiToday;
  // document.getElementById('kpiWeek').textContent = kpiWeek;
  // document.getElementById('kpiNear').textContent = kpiNear;
  // document.getElementById('kpiFavorites').textContent = kpiFavorites;

  // Update KPI Favorites visual state
  updateKPIFavoritesStyle();

  // Update KPI Near button state
  // updateKPINearButton();
}

// Update active filter chips display
function updateActiveFilterChips() {
  const chipsContainer = document.getElementById('activeFilterChips');
  const filtersBar = document.getElementById('activeFiltersBar');
  
  if (!chipsContainer || !filtersBar) return;
  
  const chips = [];
  
  // Check for active filters and create chips
  
  // Date filters (hybrid)
  if (dateFilterState.mode === 'picker' && dateFilterState.pickerStart) {
    const start = dateFilterState.pickerStart;
    const end = dateFilterState.pickerEnd || start;
    const formatDate = (date) => date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    
    if (start.getTime() === end.getTime()) {
      chips.push({ label: `Fecha: ${formatDate(start)}`, type: 'date', value: 'picker' });
    } else {
      chips.push({ label: `Fecha: ${formatDate(start)}-${formatDate(end)}`, type: 'date', value: 'picker' });
    }
  } else if (dateFilterState.mode === 'shortcut' && dateFilterState.shortcut !== 'all') {
    const shortcutLabels = {
      'today': 'Hoy',
      'tomorrow': 'Mañana',
      'weekend': 'Este finde',
      '7days': '7 días'
    };
    chips.push({ label: shortcutLabels[dateFilterState.shortcut], type: 'date', value: dateFilterState.shortcut });
  }
  
  // Category filters - grouped into single chip
  if (multiSelectState.category.length > 0) {
    chips.push({ label: 'Categoría', type: 'category', value: '__all__' });
  }
  
  // District filters - grouped into single chip
  if (multiSelectState.district.length > 0) {
    chips.push({ label: 'Distrito', type: 'district', value: '__all__' });
  }
  
  // Audience filters - grouped into single chip
  if (multiSelectState.audience.length > 0) {
    chips.push({ label: 'Público', type: 'audience', value: '__all__' });
  }
  
  // Time filters - grouped into single chip
  if (multiSelectState.time.length > 0) {
    chips.push({ label: 'Horario', type: 'time', value: '__all__' });
  }
  
  // Free only
  if (currentFilters.freeOnly) {
    chips.push({ label: 'Gratis', type: 'free', value: true });
  }
  
  // Favorites only
  if (currentFilters.favoritesOnly) {
    chips.push({ label: 'Favoritos', type: 'favorites', value: true });
  }
  
  // Near filter (Cerca de mí) - only show chip when nearOnly is active
  if (currentFilters.nearOnly && userLocation) {
    chips.push({ label: '<2km', type: 'sort', value: 'distance' });
  }
  
  // Search text
  if (currentFilters.search) {
    chips.push({ label: `Buscar: "${currentFilters.search}"`, type: 'search', value: currentFilters.search });
  }
  
  // Duration filter
  const durationMin = currentFilters.durationMin || 1;
  const durationMax = currentFilters.durationMax || 30;
  // Solo mostrar chip si no es el rango por defecto (1-30+)
  if (durationMin > 1 || durationMax < 30) {
    const maxLabel = durationMax >= 30 ? '30+' : durationMax;
    chips.push({ label: `Duración: ${durationMin}-${maxLabel} días`, type: 'duration', value: `${durationMin}-${durationMax}` });
  }

  // Location filter (from map)
  if (currentFilters.locationKey) {
    chips.push({ label: '📍Ubicación', type: 'location', value: 'key' });
  }

  // Show/hide the filters bar (ocultar si estamos en filterFieldView)
  const filterFieldView = document.getElementById('filterFieldView');
  const isFilterFieldVisible = filterFieldView && !filterFieldView.classList.contains('hidden');
  
  if (chips.length > 0 && !isFilterFieldVisible) {
    filtersBar.classList.remove('hidden');
  } else {
    filtersBar.classList.add('hidden');
  }
  
  // Render chips
  chipsContainer.innerHTML = chips.map(chip => `
    <button onclick="removeFilterChip('${chip.type}', '${chip.value}')"
            class="filter-chip bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors">
      <span class="text-label-md">${chip.label}</span>
      <span class="material-symbols-outlined">close</span>
    </button>
  `).join('');

  // Adjust map size after updating filter chips visibility
  adjustMapSize();
}

// Remove individual filter from chip
function removeFilterChip(type, value) {
  switch (type) {
    case 'date':
      // Limpiar estado híbrido de fecha
      dateFilterState.mode = 'shortcut';
      dateFilterState.shortcut = 'all';
      dateFilterState.pickerStart = null;
      dateFilterState.pickerEnd = null;
      
      // Actualizar select legacy
      currentFilters.date = 'all';
      const dateSelect = document.getElementById('dateSelect');
      if (dateSelect) dateSelect.value = 'all';
      
      // Also clear KPI if it was set
      const todayIndex = activeKPIFilters.indexOf('today');
      const weekIndex = activeKPIFilters.indexOf('week');
      if (todayIndex > -1) {
        activeKPIFilters.splice(todayIndex, 1);
      }
      if (weekIndex > -1) {
        activeKPIFilters.splice(weekIndex, 1);
      }
      if (todayIndex > -1 || weekIndex > -1) {
        updateKPICardStyles();
      }
      break;
    case 'category':
      if (value === '__all__') {
        // Remove all category filters
        multiSelectState.category = [];
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
          categoryGrid.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
          });
        }
        refreshFilterFieldLabel('category');
      } else {
        // Remove single category filter (legacy)
        const catIndex = multiSelectState.category.indexOf(value);
        if (catIndex > -1) {
          multiSelectState.category.splice(catIndex, 1);
          const categoryGrid = document.getElementById('categoryGrid');
          const catButton = categoryGrid.querySelector(`button[data-value="${value}"]`);
          if (catButton) {
            catButton.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
          }
          refreshFilterFieldLabel('category');
        }
      }
      break;
    case 'district':
      if (value === '__all__') {
        // Remove all district filters
        multiSelectState.district = [];
        const districtGrid = document.getElementById('districtGrid');
        if (districtGrid) {
          districtGrid.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
          });
        }
        refreshFilterFieldLabel('district');
      } else {
        // Remove single district filter (legacy)
        const distIndex = multiSelectState.district.indexOf(value);
        if (distIndex > -1) {
          multiSelectState.district.splice(distIndex, 1);
          const districtGrid = document.getElementById('districtGrid');
          const distButton = districtGrid.querySelector(`button[data-value="${value}"]`);
          if (distButton) {
            distButton.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
          }
          refreshFilterFieldLabel('district');
        }
      }
      break;
    case 'audience':
      if (value === '__all__') {
        // Remove all audience filters
        multiSelectState.audience = [];
        const audienceGrid = document.getElementById('audienceGrid');
        if (audienceGrid) {
          audienceGrid.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
            btn.classList.add('border-outline-variant');
          });
        }
        refreshFilterFieldLabel('audience');
      } else {
        // Remove single audience filter (legacy)
        const audIndex = multiSelectState.audience.indexOf(value);
        if (audIndex > -1) {
          multiSelectState.audience.splice(audIndex, 1);
          const audienceGrid = document.getElementById('audienceGrid');
          const audButton = audienceGrid.querySelector(`button[data-value="${value}"]`);
          if (audButton) {
            audButton.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
            audButton.classList.add('border-outline-variant');
          }
          refreshFilterFieldLabel('audience');
        }
      }
      break;
    case 'time':
      if (value === '__all__') {
        // Remove all time filters
        multiSelectState.time = [];
        const timeGrid = document.getElementById('timeGrid');
        if (timeGrid) {
          timeGrid.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
            btn.classList.add('border-outline-variant');
          });
        }
        refreshFilterFieldLabel('time');
      } else {
        // Remove single time filter (legacy)
        const timeIndex = multiSelectState.time.indexOf(value);
        if (timeIndex > -1) {
          multiSelectState.time.splice(timeIndex, 1);
          const timeGrid = document.getElementById('timeGrid');
          const timeButton = timeGrid.querySelector(`button[data-value="${value}"]`);
          if (timeButton) {
            timeButton.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
            timeButton.classList.add('border-outline-variant');
          }
          refreshFilterFieldLabel('time');
        }
      }
      break;
    case 'free':
      currentFilters.freeOnly = false;
      document.getElementById('freeOnly').checked = false;
      break;
    case 'favorites':
      currentFilters.favoritesOnly = false;
      document.getElementById('favoritesOnly').checked = false;
      const favIndex = activeKPIFilters.indexOf('favorites');
      if (favIndex > -1) {
        activeKPIFilters.splice(favIndex, 1);
        updateKPICardStyles();
      }
      break;
    case 'sort':
      currentFilters.sort = 'recent';
      currentFilters.nearOnly = false;
      setSortState('recent');
      const locationInput = document.getElementById('locationInput');
      if (locationInput) {
        locationInput.classList.add('hidden');
      }
      const nearIndex = activeKPIFilters.indexOf('near');
      if (nearIndex > -1) {
        activeKPIFilters.splice(nearIndex, 1);
        updateKPICardStyles();
      }
      break;
    case 'search':
      currentFilters.search = '';
      const headerSearchInput = document.getElementById('searchInput');
      const filterSearchInput = document.getElementById('filterSearchInput');
      if (headerSearchInput) headerSearchInput.value = '';
      if (filterSearchInput) filterSearchInput.value = '';
      break;
    case 'duration':
      durationFilterState = { min: 1, max: 30 };
      currentFilters.durationMin = 1;
      currentFilters.durationMax = 30;
      break;
    case 'location':
      currentFilters.locationKey = null;
      break;
  }

  applyFilters();
}

// Format price display
function formatPrice(activity) {
  if (activity.free) return 'Gratis';
  if (!activity.price) return 'Consultar';
  const wordCount = activity.price.trim().split(/\s+/).length;
  if (wordCount > 2) return 'Consultar';
  return activity.price;
}

// Render activities
function renderActivities() {
  const container = document.getElementById('listView');
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const pageActivities = filteredActivities.slice(start, end);
  
  document.getElementById('resultsCount').textContent = `${filteredActivities.length} actividades`;
  
  container.innerHTML = pageActivities.map(activity => {
    // Construir string de fecha (rango si hay fecha fin diferente - comparando solo día)
    let dateStr = '';
    if (activity.date) {
      const startStr = activity.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      if (activity.endDate && !isSameDay(activity.date, activity.endDate)) {
        const endStr = activity.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        dateStr = `${startStr} - ${endStr}`;
      } else {
        dateStr = startStr;
      }
    }
    const distanceStr = activity.distance ? 
      `a ${activity.distance.toFixed(1)} km` : '';
    const isFav = favorites.includes(activity.id);
    
    return `
      <article class="activity-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg shadow-black/10 border border-surface-variant/10 cursor-pointer" onclick="showDetail('${activity.id}')">
        <div class="p-3 space-y-1">
          <div class="flex justify-between items-start gap-2">
            <h2 class="font-title-md text-title-md text-on-surface leading-tight font-bold flex-1">${activity.title}</h2>
            <button onclick="toggleFavorite(event, '${activity.id}')" class="p-1 hover:bg-surface-variant rounded-full transition-colors">
              <span class="material-symbols-outlined text-[18px] ${isFav ? 'filled text-primary' : 'text-primary'}" style="font-variation-settings: 'FILL' ${isFav ? 1 : 0};">favorite</span>
            </button>
          </div>
          <div class="flex items-center gap-1 text-on-surface-variant text-body-md leading-tight">
            <span class="material-symbols-outlined text-base text-primary flex-shrink-0">location_on</span>
            <p>${activity.location || 'Madrid'}${distanceStr ? ` • ${distanceStr}` : ''}</p>
          </div>
          <div class="flex justify-between items-center">
            ${dateStr ? `
            <div class="flex items-center gap-3 text-on-surface-variant text-body-md leading-none">
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base text-primary flex-shrink-0">calendar_today</span>
                <p>${dateStr}</p>
              </div>
              ${activity.time ? `
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base text-primary flex-shrink-0">schedule</span>
                <p>${activity.time}</p>
              </div>
              ` : ''}
            </div>
            ` : '<div></div>'}
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-label-sm font-medium rounded-full">${activity.category}</span>
              <span class="text-primary font-body-md text-body-md whitespace-nowrap">${formatPrice(activity)}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  // Update pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const pageInfoText = `${currentPage + 1} / ${Math.max(1, totalPages)}`;
  document.getElementById('pageInfo').textContent = pageInfoText;
  document.getElementById('smallPageInfo').textContent = pageInfoText;
  const prevDisabled = currentPage === 0;
  const nextDisabled = currentPage >= totalPages - 1;
  document.getElementById('prevBtn').disabled = prevDisabled;
  document.getElementById('nextBtn').disabled = nextDisabled;
  document.getElementById('smallPrevBtn').disabled = prevDisabled;
  document.getElementById('smallNextBtn').disabled = nextDisabled;
}

// Toggle favorite
function toggleFavorite(event, id, refreshDetail = false) {
  event = event || window.event;
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  
  id = String(id);
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  
  localStorage.setItem('madridFavorites', JSON.stringify(favorites));
  updateFavCount();
  
  // Always update the activity list to reflect favorite state changes
  renderActivities();
  
  // If called from detail view, also update the header button to reflect the change
  if (refreshDetail && currentDetailId === id) {
    const isFav = favorites.includes(id);
    const detailHeaderButtons = document.getElementById('detailHeaderButtons');
    if (detailHeaderButtons) {
      const favBtn = detailHeaderButtons.querySelector('button:last-child');
      if (favBtn) {
        const icon = favBtn.querySelector('span.material-symbols-outlined');
        if (icon) {
          // Update icon fill state
          if (isFav) {
            icon.classList.add('filled', 'text-red-400');
          } else {
            icon.classList.remove('filled', 'text-red-400');
          }
        }
      }
    }
  }
}

// Toggle favorito desde botones sobre la imagen
function toggleFavoriteOnImage(event, id) {
  event = event || window.event;
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  
  id = String(id);
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  
  localStorage.setItem('madridFavorites', JSON.stringify(favorites));
  updateFavCount();
  renderActivities();
  
  // Actualizar ambos botones (en imagen y en header)
  const isFav = favorites.includes(id);
  
  // Actualizar botón en imagen
  let detailImageButtonsElem = document.getElementById('detailImageButtons');
  if (detailImageButtonsElem) {
    const favBtn = detailImageButtonsElem.querySelector('button:last-child');
    if (favBtn) {
      const icon = favBtn.querySelector('span.material-symbols-outlined');
      if (icon) {
        if (isFav) {
          icon.classList.add('filled');
          favBtn.classList.add('text-red-400');
        } else {
          icon.classList.remove('filled');
          favBtn.classList.remove('text-red-400');
        }
      }
    }
  }
  
  // Actualizar botón en header
  const detailHeaderButtons = document.getElementById('detailHeaderButtons');
  if (detailHeaderButtons) {
    const favBtn = detailHeaderButtons.querySelector('button:last-child');
    if (favBtn) {
      const icon = favBtn.querySelector('span.material-symbols-outlined');
      if (icon) {
        if (isFav) {
          icon.classList.add('filled', 'text-red-400');
        } else {
          icon.classList.remove('filled', 'text-red-400');
        }
      }
    }
  }
}

// Compartir actividad
function shareActivity(id) {
  const activity = allActivities.find(a => a.id === id);
  if (!activity) return;
  
  const shareData = {
    title: activity.title,
    text: `${activity.title} - ${activity.category || 'Actividad'} en ${activity.district || 'Madrid'}`,
    url: activity.link || window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(err => console.log('Error al compartir:', err));
  } else {
    // Fallback: copiar al portapapeles
    const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Enlace copiado al portapapeles');
    }).catch(() => {
      showToast('No se pudo compartir');
    });
  }
}

// Añadir al calendario
function addToCalendar(id) {
  const activity = allActivities.find(a => a.id === id);
  if (!activity) return;
  
  // Crear evento para el calendario
  const title = encodeURIComponent(activity.title);
  const location = encodeURIComponent(`${activity.district || 'Madrid'}, ${activity.address || ''}`);
  const details = encodeURIComponent(`${activity.description || ''}\n\nMás info: ${activity.link || ''}`);
  
  let startDate, endDate;
  if (activity.date) {
    startDate = activity.date.toISOString().replace(/[-:]/g, '').split('.')[0];
    if (activity.endDate) {
      endDate = activity.endDate.toISOString().replace(/[-:]/g, '').split('.')[0];
    } else {
      // Si no hay fecha fin, sumar 1 hora
      const end = new Date(activity.date.getTime() + 60 * 60 * 1000);
      endDate = end.toISOString().replace(/[-:]/g, '').split('.')[0];
    }
  } else {
    // Si no hay fecha, usar mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDate = tomorrow.toISOString().replace(/[-:]/g, '').split('.')[0];
    const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);
    endDate = end.toISOString().replace(/[-:]/g, '').split('.')[0];
  }
  
  // URL de Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  
  // Abrir en nueva pestaña
  window.open(googleCalendarUrl, '_blank');
}

// Mostrar toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-surface-container-high text-on-surface px-4 py-2 rounded-lg shadow-lg z-[200] text-body-md';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Show detail modal
function showDetail(id, isNavigation = false) {
  const activity = allActivities.find(a => a.id === id);
  if (!activity) return;
  
  id = String(id);
  currentDetailId = id;
  
  // Construir string de fecha para el detalle (rango si aplica - comparando solo día)
  let dateStr = 'Fecha no disponible';
  let dateLabel = 'Fecha';
  if (activity.date) {
    const startStr = activity.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (activity.endDate && !isSameDay(activity.date, activity.endDate)) {
      const endStr = activity.endDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      dateStr = `De ${startStr} a ${endStr}`;
      dateLabel = 'Fechas';
    } else {
      dateStr = startStr;
    }
  }
  id = String(id);
  const isFav = favorites.includes(id);
  
  const currentIndex = filteredActivities.findIndex(a => String(a.id) === id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filteredActivities.length - 1;

  // Set image - primero buscar en imagenesMap de Firebase, luego usar default
  const defaultImageUrl = 'https://st3.depositphotos.com/1594308/13059/i/450/depositphotos_130595028-stock-photo-dynamic-friends-enjoying-party-and.jpg';
  
  // Buscar imagen en el mapa de Firebase (usando app_id o id)
  const activityId = activity.app_id;
  const firebaseImageUrl = imagenesMap[activityId];
  
  // Usar imagen de Firebase si existe, sino la default
  const imageUrlToUse = firebaseImageUrl || defaultImageUrl;
  
  if (firebaseImageUrl) {
    console.log(`🖼️ Usando imagen de Firebase para ${activityId}`);
  } else {
    console.log(`🖼️ Usando imagen default para ${activityId}`);
  }
  
  document.getElementById('detailImage').src = imageUrlToUse;
  document.getElementById('detailImage').alt = activity.title;
  document.getElementById('fullscreenImage').src = imageUrlToUse;
  const detailImage = document.getElementById('detailImage');
  
  // Reset image height on open
  const imageContainer = document.getElementById('detailImageContainer');
  if (imageContainer) {
    imageContainer.style.height = '30vh';
    imageContainer.style.backgroundColor = '#000';
    imageContainer.style.overflow = 'hidden';
  }
  
  // Setup scroll handler for image resize and header effect
  const scrollContainer = document.getElementById('detailScrollContainer');
  const stickyHeader = document.getElementById('detailStickyHeader');
  const detailImageButtonsElem = document.getElementById('detailImageButtons');
  const detailImageBackButtonElem = document.getElementById('detailImageBackButton');
  const detailBackButtonScroll = document.getElementById('detailBackButtonScroll');
  const detailTitleElem = document.getElementById('detailTitle');
  const SCROLL_THRESHOLD = 150; // Umbral para ocultar imagen completamente
  
  if (scrollContainer) {
    scrollContainer.onscroll = function() {
      const scrollTop = scrollContainer.scrollTop;
      
      // Cuando scroll pasa el umbral, ocultar imagen completamente
      if (scrollTop > SCROLL_THRESHOLD) {
        // Ocultar imagen completamente
        imageContainer.style.height = '0px';
        imageContainer.style.minHeight = '0px';
        imageContainer.style.overflow = 'hidden';
        
        // Header con color primario
        if (stickyHeader) {
          stickyHeader.classList.add('detail-header-scrolled');
        }
        // Ocultar botones en imagen
        if (detailImageButtonsElem) detailImageButtonsElem.style.opacity = '0';
        if (detailImageBackButtonElem) detailImageBackButtonElem.style.opacity = '0';
        // Mostrar botón volver en header y reducir tamaño título
        if (detailBackButtonScroll) {
          detailBackButtonScroll.classList.remove('opacity-0', 'w-0', 'overflow-hidden');
          detailBackButtonScroll.classList.add('opacity-100', 'w-auto');
        }
        if (detailTitleElem) {
          detailTitleElem.classList.remove('font-title-lg', 'text-title-lg');
          detailTitleElem.classList.add('font-title-md', 'text-title-md');
        }
      } else {
        // Mostrar imagen con altura proporcional al scroll
        const maxHeight = window.innerHeight * 0.3;
        const scrollProgress = scrollTop / SCROLL_THRESHOLD;
        const newHeight = maxHeight * (1 - scrollProgress);
        imageContainer.style.height = newHeight + 'px';
        imageContainer.style.minHeight = '0px';
        imageContainer.style.overflow = 'hidden';
        
        // Header sin color primario
        if (stickyHeader) {
          stickyHeader.classList.remove('detail-header-scrolled');
        }
        // Mostrar botones en imagen
        if (detailImageButtonsElem) detailImageButtonsElem.style.opacity = '1';
        if (detailImageBackButtonElem) detailImageBackButtonElem.style.opacity = '1';
        // Ocultar botón volver en header y restaurar tamaño título
        if (detailBackButtonScroll) {
          detailBackButtonScroll.classList.add('opacity-0', 'w-0', 'overflow-hidden');
          detailBackButtonScroll.classList.remove('opacity-100', 'w-auto');
        }
        if (detailTitleElem) {
          detailTitleElem.classList.add('font-title-lg', 'text-title-lg');
          detailTitleElem.classList.remove('font-title-md', 'text-title-md');
        }
      }
    };
  }

  const titleElement = document.getElementById('detailTitle');
  titleElement.textContent = activity.title;
  
  // Render back button on image (izquierda)
  const detailImageBackButton = document.getElementById('detailImageBackButton');
  detailImageBackButton.innerHTML = `
    <button onclick="closeDetail()" class="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center transition-colors hover:bg-black/60" title="Volver">
      <span class="material-symbols-outlined text-xl">arrow_back</span>
    </button>
  `;
  
  // Render buttons on image (favorito y compartir) - redondos con fondo semitransparente
  const detailImageButtons = document.getElementById('detailImageButtons');
  detailImageButtons.innerHTML = `
    <button onclick="shareActivity('${activity.id}')" class="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center transition-colors hover:bg-black/60" title="Compartir">
      <span class="material-symbols-outlined text-xl">share</span>
    </button>
    <button onclick="toggleFavoriteOnImage(event || window.event, '${activity.id}')" class="w-10 h-10 rounded-full bg-black/40 ${isFav ? 'text-red-400' : 'text-white'} flex items-center justify-center transition-colors hover:bg-black/60" title="Favorito">
      <span class="material-symbols-outlined text-xl ${isFav ? 'filled' : ''}">favorite</span>
    </button>
  `;
  
  // Render header buttons (share and favorite) - w-9 h-9
  const detailHeaderButtons = document.getElementById('detailHeaderButtons');
  detailHeaderButtons.innerHTML = `
    <button onclick="shareActivity('${activity.id}')" class="border border-white/40 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors" title="Compartir">
      <span class="material-symbols-outlined text-xl">share</span>
    </button>
    <button onclick="toggleFavorite(event || window.event, '${activity.id}', true)" class="text-white border border-white/40 w-9 h-9 rounded-full flex items-center justify-center transition-colors" title="Favorito">
      <span class="material-symbols-outlined text-xl ${isFav ? 'filled' : ''} ${isFav ? 'text-red-400' : ''}">favorite</span>
    </button>
  `;
  
  document.getElementById('detailContent').innerHTML = `
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-start gap-2">
          <span class="px-3 py-1 bg-primary-container text-on-primary-container text-label-lg font-medium rounded-full">${activity.category}</span>
          ${activity.free ? '<span class="px-3 py-1 text-label-lg font-medium rounded-full" style="background: linear-gradient(135deg, #F8AD9D 0%, #FBC4AB 100%); color: #5a2525;">Gratis</span>' : ''}
        </div>
        <div class="flex items-start gap-2">
          ${hasPrev ? `<button onclick="showPreviousDetail()" class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-label-lg font-medium">&lt;</button>` : `<button disabled style="visibility: hidden;" class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-label-lg font-medium">&lt;</button>`}
          ${hasNext ? `<button onclick="showNextDetail()" class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-label-lg font-medium">&gt;</button>` : `<button disabled style="visibility: hidden;" class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-label-lg font-medium">&gt;</button>`}
        </div>
      </div>
      
      <p class="text-body-lg text-on-surface-variant text-justify">${activity.description || 'Sin descripción disponible.'}</p>
      
      <div class="space-y-3 bg-surface-container-low rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">calendar_today</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">${dateLabel}</p>
            <p class="text-body-md font-medium">${dateStr}</p>
          </div>
        </div>
        
        ${activity.time ? `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">schedule</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Hora</p>
            <p class="text-body-md font-medium">${activity.time}</p>
          </div>
        </div>
        ` : ''}
        
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">location_on</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Lugar</p>
            <p class="text-body-md font-medium">${activity.location || 'No especificado'}</p>
          </div>
        </div>
        
        ${activity.district && activity.district !== 'Desconocido' ? `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">map</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Distrito</p>
            <p class="text-body-md font-medium">${activity.district}</p>
          </div>
        </div>
        ` : ''}
        
        ${activity.street ? `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">home</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Dirección</p>
            <p class="text-body-md font-medium">${activity.street}</p>
          </div>
        </div>
        ` : ''}
        
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">payments</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Precio</p>
            <p class="text-body-md font-medium">${activity.free ? 'Gratuito' : (activity.price || 'Consultar')}</p>
          </div>
        </div>
        
        ${activity.audience ? `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">people</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Público</p>
            <p class="text-body-md font-medium">${activity.audience}</p>
          </div>
        </div>
        ` : ''}
        
        ${activity.distance ? `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant">straighten</span>
          <div>
            <p class="text-label-sm text-on-surface-variant">Distancia</p>
            <p class="text-body-md font-medium">${activity.distance.toFixed(1)} km</p>
          </div>
        </div>
        ` : ''}
        
      </div>
      
      <div class="flex gap-3 pb-4">
        ${activity.link ? `
        <a href="${activity.link}" target="_blank" class="bg-primary text-on-primary py-3 px-4 rounded-lg font-label-lg text-center flex items-center justify-center gap-1 flex-shrink-0">
          <span class="material-symbols-outlined text-lg">open_in_new</span>
          Ver ficha
        </a>
        ` : ''}
        
        <button onclick="addToCalendar('${activity.id}')" class="bg-surface-container-high text-on-surface py-3 px-4 rounded-lg flex items-center justify-center gap-1 flex-shrink-0 hover:bg-surface-variant transition-colors" title="Añadir al calendario">
          <span class="material-symbols-outlined">event</span>
          <span class="text-label-lg font-medium">Calendario</span>
        </button>
        
        ${activity.lat && activity.lon ? `
        <a href="https://www.google.com/maps?q=${activity.lat},${activity.lon}" target="_blank" class="bg-surface-container-high text-on-surface w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" title="Ver en mapa">
          <span class="material-symbols-outlined">map</span>
        </a>
        ` : ''}
      </div>
      ${activity.lat && activity.lon ? `
        <div class="space-y-3">
          <h2 class="font-title-lg text-title-lg text-left px-2">Ubicación</h2>
          <p class="text-body-md">${activity.location || 'Ubicación desconocida'}${activity.distance ? ` • ${activity.distance.toFixed(1)} km` : ''}</p>
          <div id="detailLocationMap" class="w-full h-52 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden bg-surface-container-low" style="touch-action: pan-y pinch-zoom;"></div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.lat + ',' + activity.lon)}" target="_blank" class="inline-flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M320-360h80v-120h140v100l140-140-140-140v100H360q-17 0-28.5 11.5T320-520v160ZM480-80q-15 0-29.5-6T424-104L104-424q-12-12-18-26.5T80-480q0-15 6-29.5t18-26.5l320-320q12-12 26.5-18t29.5-6q15 0 29.5 6t26.5 18l320 320q12 12 18 26.5t6 29.5q0 15-6 29.5T856-424L536-104q-12 12-26.5 18T480-80ZM320-320l160 160 320-320-320-320-320 320 160 160Zm160-160Z"/></svg>            Cómo llegar
          </a>
        </div>
        ` : ''}
    </div>
  `;
  
  // Detectar si es app (Cordova) o HTML puro
  const isApp = typeof cordova !== 'undefined' || (window.webkit && window.webkit.messageHandlers);
  
  // Guardar la vista actual antes de cambiar (solo la primera vez, no al navegar entre actividades)
  if (!isNavigation) {
    window.previousViewBeforeDetail = currentView;
  }
  
  // Mostrar la vista de detalle como pantalla completa
  showView('detail');
  
  // Actualizar el hash para navegación con botón atrás (solo en app, y solo la primera vez)
  if (isApp && !isNavigation) {
    history.pushState({ view: 'detail', activityId: activity.id, previousView: window.previousViewBeforeDetail }, '', '#detail/' + activity.id);
  }
  
  // Reset scroll al inicio del contenido
  if (scrollContainer) {
    scrollContainer.scrollTop = 0;
  }
  
  // Check if title is truncated after content is rendered
  requestAnimationFrame(() => {
    const isTitleTruncated = titleElement.scrollHeight > titleElement.clientHeight;
    if (isTitleTruncated) {
      const fullTitleDiv = document.createElement('div');
      fullTitleDiv.className = 'p-3 bg-surface-container-low rounded-lg mb-4';
      fullTitleDiv.innerHTML = `
        <p class="text-label-sm text-on-surface-variant font-medium">Título completo:</p>
        <p class="text-body-md text-on-surface">${activity.title}</p>
      `;
      const contentDiv = document.getElementById('detailContent').querySelector('.space-y-4');
      const categoryDiv = contentDiv.querySelector('.flex.items-start.justify-between');
      categoryDiv.insertAdjacentElement('afterend', fullTitleDiv);
    }
  });
  
  if (activity.lat && activity.lon) {
    // Retrasar la inicialización del mapa para asegurar que el contenedor es visible
    setTimeout(() => {
      initDetailLocationMap(activity.lat, activity.lon, activity.location || 'Ubicación');
    }, 100);
  }
}

// Close detail view
function closeDetail() {
  // Detectar si es app (Cordova) o HTML puro
  const isApp = typeof cordova !== 'undefined' || (window.webkit && window.webkit.messageHandlers);
  
  if (isApp) {
    // En app: usar navegación por historial
    history.back();
  } else {
    // En HTML puro: comportamiento tradicional
    document.getElementById('detailView').classList.add('hidden');
    currentDetailId = null;
    if (detailMap) {
      detailMap.remove();
      detailMap = null;
    }
    // Restaurar UI
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    if (bottomNav) bottomNav.classList.remove('hidden');
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) mainHeader.classList.remove('hidden');
    // Volver a la vista anterior guardada
    const viewToReturn = window.previousViewBeforeDetail || 'home';
    showView(viewToReturn);
    updateBottomTabUI(viewToReturn);
    // Update filter chips visibility based on current filters
    updateActiveFilterChips();
  }
}

// Open image fullscreen
function openImageFullscreen() {
  document.getElementById('imageFullscreenModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Close image fullscreen
function closeImageFullscreen() {
  document.getElementById('imageFullscreenModal').classList.add('hidden');
  document.body.style.overflow = '';
  const fullscreenImage = document.getElementById('fullscreenImage');
  if (fullscreenImage) {
    fullscreenImage.style.transform = 'scale(1)';
    fullscreenImage.dataset.zoomScale = '1';
  }
}

const fullscreenImage = document.getElementById('fullscreenImage');
if (fullscreenImage) {
  fullscreenImage.dataset.zoomScale = '1';
  fullscreenImage.dataset.translateX = '0';
  fullscreenImage.dataset.translateY = '0';
  let pinchData = { active: false, startDistance: 0, startScale: 1 };
  let panData = { active: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };

  const getDistance = touches => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const updateTransform = () => {
    const scale = parseFloat(fullscreenImage.dataset.zoomScale || '1');
    const translateX = parseFloat(fullscreenImage.dataset.translateX || '0');
    const translateY = parseFloat(fullscreenImage.dataset.translateY || '0');
    fullscreenImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  const clampTranslate = (translate, maxTranslate) => {
    return Math.max(-maxTranslate, Math.min(maxTranslate, translate));
  };

  fullscreenImage.addEventListener('touchstart', event => {
    if (event.touches.length === 2) {
      event.preventDefault();
      panData.active = false;
      pinchData.active = true;
      pinchData.startDistance = getDistance(event.touches);
      pinchData.startScale = parseFloat(fullscreenImage.dataset.zoomScale || '1');
    } else if (event.touches.length === 1 && parseFloat(fullscreenImage.dataset.zoomScale || '1') > 1) {
      event.preventDefault();
      pinchData.active = false;
      panData.active = true;
      panData.startX = event.touches[0].clientX;
      panData.startY = event.touches[0].clientY;
      panData.translateX = parseFloat(fullscreenImage.dataset.translateX || '0');
      panData.translateY = parseFloat(fullscreenImage.dataset.translateY || '0');
    }
  }, { passive: false });

  fullscreenImage.addEventListener('touchmove', event => {
    if (pinchData.active && event.touches.length === 2) {
      event.preventDefault();
      const distance = getDistance(event.touches);
      let scale = pinchData.startScale * (distance / pinchData.startDistance);
      scale = Math.min(4, Math.max(1, scale));
      fullscreenImage.dataset.zoomScale = scale.toString();
      if (scale === 1) {
        fullscreenImage.dataset.translateX = '0';
        fullscreenImage.dataset.translateY = '0';
      }
      updateTransform();
    } else if (panData.active && event.touches.length === 1) {
      event.preventDefault();
      const deltaX = event.touches[0].clientX - panData.startX;
      const deltaY = event.touches[0].clientY - panData.startY;
      const scale = parseFloat(fullscreenImage.dataset.zoomScale || '1');
      const maxTranslateX = Math.max(0, (fullscreenImage.clientWidth * scale - fullscreenImage.clientWidth) / 2);
      const maxTranslateY = Math.max(0, (fullscreenImage.clientHeight * scale - fullscreenImage.clientHeight) / 2);
      let nextTranslateX = panData.translateX + deltaX;
      let nextTranslateY = panData.translateY + deltaY;
      nextTranslateX = clampTranslate(nextTranslateX, maxTranslateX);
      nextTranslateY = clampTranslate(nextTranslateY, maxTranslateY);
      fullscreenImage.dataset.translateX = nextTranslateX.toString();
      fullscreenImage.dataset.translateY = nextTranslateY.toString();
      updateTransform();
    }
  }, { passive: false });

  const resetGestureState = () => {
    pinchData.active = false;
    panData.active = false;
    if (parseFloat(fullscreenImage.dataset.zoomScale || '1') < 1) {
      fullscreenImage.dataset.zoomScale = '1';
    }
    if (parseFloat(fullscreenImage.dataset.zoomScale || '1') === 1) {
      fullscreenImage.dataset.translateX = '0';
      fullscreenImage.dataset.translateY = '0';
    }
    updateTransform();
  };

  fullscreenImage.addEventListener('touchend', event => {
    if (event.touches.length < 2) {
      if (pinchData.active) {
        pinchData.active = false;
      }
      if (panData.active && event.touches.length === 0) {
        panData.active = false;
      }
      if (parseFloat(fullscreenImage.dataset.zoomScale || '1') === 1) {
        fullscreenImage.dataset.translateX = '0';
        fullscreenImage.dataset.translateY = '0';
        updateTransform();
      }
    }
  }, { passive: false });

  fullscreenImage.addEventListener('touchcancel', () => {
    resetGestureState();
  }, { passive: false });
}

function initDetailLocationMap(lat, lon, locationLabel) {
  const mapContainer = document.getElementById('detailLocationMap');
  if (!mapContainer) return;
  if (detailMap) {
    detailMap.remove();
    detailMap = null;
  }

  detailMap = L.map(mapContainer, {
    attributionControl: false,
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: false
  }).setView([lat, lon], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(detailMap);

  const detailIcon = L.divIcon({
    className: 'detail-marker',
    html: `<div class="detail-marker-icon bg-primary" style="width:20px; height:20px; border-radius:50% 50% 50% 0; transform: rotate(-45deg); border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -18]
  });

  L.marker([lat, lon], { icon: detailIcon }).addTo(detailMap)
    .bindPopup(`<strong>${locationLabel}</strong>`).openPopup();
  // Invalidate size after a short delay to ensure container is visible and sized
  setTimeout(() => {
    try { detailMap.invalidateSize(); } catch (e) { /* ignore */ }
  }, 200);
}

// Navigate to previous activity
function showPreviousDetail() {
  if (!currentDetailId) return;
  const currentIndex = filteredActivities.findIndex(a => a.id === currentDetailId);
  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    const newActivity = filteredActivities[newIndex];
    const newPage = Math.floor(newIndex / itemsPerPage);
    if (newPage !== currentPage) {
      currentPage = newPage;
      renderActivities();
    }
    showDetail(newActivity.id, true); // true = navegación interna, no guardar historial
  }
}

// Navigate to next activity
function showNextDetail() {
  if (!currentDetailId) return;
  const currentIndex = filteredActivities.findIndex(a => a.id === currentDetailId);
  if (currentIndex < filteredActivities.length - 1) {
    const newIndex = currentIndex + 1;
    const newActivity = filteredActivities[newIndex];
    const newPage = Math.floor(newIndex / itemsPerPage);
    if (newPage !== currentPage) {
      currentPage = newPage;
      renderActivities();
    }
    showDetail(newActivity.id, true); // true = navegación interna, no guardar historial
  }
}

// Set main tab
function setMainTab(tab) {
  // Update visual state of tabs
  document.querySelectorAll('.main-tab').forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('bg-primary-container', 'text-on-primary-container');
      btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'text-on-primary-container');
      btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
    }
  });
  
  // Apply preset filters based on tab
  if (tab === 'nearby') {
    // Check if we have user location
    if (!userLocation) {
      // Open the same location modal used by the "Añadir" button
      openLocationModal();
      return; // Don't apply filters yet, wait for location
    }
    // If we have location, apply distance sort
    setSortState('distance');
    document.getElementById('dateSelect').value = 'all';
    currentFilters.date = 'all';
  } else if (tab === 'recent') {
    // Sort by recent, clear date filter
    setSortState('recent');
    document.getElementById('dateSelect').value = 'all';
    const locationInput = document.getElementById('locationInput');
    if (locationInput) {
      locationInput.classList.add('hidden');
    }
    currentFilters.date = 'all';
  } else if (tab === 'week') {
    // Filter next 7 days and sort by recent
    setSortState('recent');
    document.getElementById('dateSelect').value = 'week';
    const locationInput = document.getElementById('locationInput');
    if (locationInput) {
      locationInput.classList.add('hidden');
    }
    currentFilters.date = 'week';
  }
  
  applyFilters();
}



// Set bottom tab
function setBottomTab(tab) {
  // Actualizar UI de tabs
  document.querySelectorAll('.bottom-tab').forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'rounded-xl');
      btn.classList.remove('text-on-surface-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'rounded-xl');
      btn.classList.add('text-on-surface-variant');
    }
  });
  
  // Detectar si es app (Cordova) o HTML puro
  const isApp = typeof cordova !== 'undefined' || (window.webkit && window.webkit.messageHandlers);
  
  // Actualizar estado y URL
  if (tab === 'home') {
    showView('home');
    renderHome();
    if (isApp) history.pushState({ view: 'home' }, '', '#home');
  } else if (tab === 'list') {
    showView('list');
    applyFilters();
    if (isApp) history.pushState({ view: 'list' }, '', '#list');
  } else if (tab === 'map') {
    if (currentFilters.locationKey) {
      currentFilters.locationKey = null;
      applyFilters();
    }
    showView('map');
    updateActiveFilterChips();
    if (isApp) history.pushState({ view: 'map' }, '', '#map');
  } else if (tab === 'favorites') {
    showView('list');
    applyFilters();
    if (isApp) history.pushState({ view: 'favorites' }, '', '#favorites');
  } else if (tab === 'profile') {
    showView('profile');
    renderProfileSettings();
    if (isApp) history.pushState({ view: 'profile' }, '', '#profile');
  }
}

// Show view (helper for bottom tabs)
function showView(view) {
  currentView = view;
  
  document.getElementById('homeView').classList.toggle('hidden', view !== 'home');
  document.getElementById('listView').classList.toggle('hidden', view !== 'list');
  document.getElementById('mapView').classList.toggle('hidden', view !== 'map');
  document.getElementById('profileView').classList.toggle('hidden', view !== 'profile');
  document.getElementById('profileSettingsView').classList.toggle('hidden', view !== 'profileSettings');
  document.getElementById('detailView').classList.toggle('hidden', view !== 'detail');
  document.getElementById('filtersView').classList.toggle('hidden', view !== 'filters');
  document.getElementById('filterFieldView').classList.toggle('hidden', view !== 'filterField');
  document.getElementById('infoView').classList.toggle('hidden', view !== 'info');
  document.getElementById('statsView').classList.add('hidden');
  document.getElementById('pagination').classList.toggle('hidden', view !== 'list');
  
  // Hide filtered list view when switching to other views
  const filteredListView = document.getElementById('filteredListView');
  if (filteredListView && view !== 'filteredList') {
    filteredListView.classList.add('hidden');
  }

  if (view === 'profile') {
    const profileView = document.getElementById('profileView');
    if (profileView) {
      profileView.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  
  const tabNav = document.getElementById('tabNav');
  const kpiSection = document.getElementById('kpiSection');
  const resultsBar = document.getElementById('resultsBar');
  const filtersBar = document.getElementById('activeFiltersBar');
  const mainHeader = document.getElementById('mainHeader');
  const profileDonateFooter = document.getElementById('profileDonateFooter');
  const bottomNav = document.querySelector('nav.fixed.bottom-0');

  // Mostrar/ocultar bottom nav según la vista
  if (bottomNav) {
    bottomNav.classList.toggle('hidden', view === 'detail' || view === 'filterField');
  }

  // if (mainHeader) mainHeader.classList.toggle('hidden', view === 'profile');
  if (mainHeader) mainHeader.classList.toggle('hidden', view === 'home' || view === 'profile' || view === 'profileSettings' || view === 'detail' || view === 'info' || view === 'filters' || view === 'filterField');
  if (profileDonateFooter) profileDonateFooter.classList.toggle('hidden', view !== 'profile');

  if (view === 'map') {
    if (tabNav) tabNav.classList.add('hidden');
    if (kpiSection) kpiSection.classList.add('hidden');
    if (resultsBar) resultsBar.classList.add('hidden');
    if (filtersBar) filtersBar.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    adjustMapSize();
  } else if (view === 'list') {
    if (tabNav) tabNav.classList.remove('hidden');
    if (kpiSection) kpiSection.classList.remove('hidden');
    if (resultsBar) resultsBar.classList.remove('hidden');
    if (filtersBar) filtersBar.classList.remove('hidden');
    document.body.classList.remove('overflow-hidden');
    const mapContainer = document.getElementById('mapView');
    if (mapContainer) {
      mapContainer.style.top = '';
      mapContainer.style.height = '';
    }
  } else if (view === 'detail') {
    // Vista de detalle: ocultar elementos de navegación
    if (tabNav) tabNav.classList.add('hidden');
    if (kpiSection) kpiSection.classList.add('hidden');
    if (resultsBar) resultsBar.classList.add('hidden');
    if (filtersBar) filtersBar.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  } else {
    if (tabNav) tabNav.classList.remove('hidden');
    if (kpiSection) kpiSection.classList.add('hidden');
    if (resultsBar) resultsBar.classList.add('hidden');
    if (filtersBar) filtersBar.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    const mapContainer = document.getElementById('mapView');
    if (mapContainer) {
      mapContainer.style.top = '';
      mapContainer.style.height = '';
    }
  }
  
  if (view === 'map') {
    setTimeout(initMap, 100);
  }
}

// Filter by location and switch to list view
function filterByLocationAndShowList(lat, lon) {
  // Create the same key used for grouping in the map
  const key = `${parseFloat(lat).toFixed(5)},${parseFloat(lon).toFixed(5)}`;
  
  // Set location key filter (preserving other existing filters)
  currentFilters.locationKey = key;

  // Close any open popups first
  if (map) {
    map.closePopup();
  }

  // Switch to list view and update bottom tab
  setBottomTab('list');

  // Use applyFilters to respect all existing filters
  applyFilters();
}

// Initialize map
function initMap() {
  if (map) {
    map.remove();
  }
  
  const center = userLocation ? [userLocation.lat, userLocation.lon] : [40.4168, -3.7038];
  map = L.map('map').setView(center, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  // Add user location marker
  if (userLocation) {
    window.userLocationMarker = L.marker([userLocation.lat, userLocation.lon], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: `<div style="background: linear-gradient(135deg, #FBC4AB 0%, #FFDAB9 100%); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(map).bindPopup('Tu ubicación');
  }
  
  // Add activity markers
  const activitiesWithCoords = filteredActivities.filter(a => a.lat && a.lon);
  const uniqueLocations = {};
  
  activitiesWithCoords.forEach(activity => {
    const key = `${activity.lat.toFixed(5)},${activity.lon.toFixed(5)}`;
    if (!uniqueLocations[key]) {
      uniqueLocations[key] = [];
    }
    uniqueLocations[key].push(activity);
  });
  
  // Custom marker icon with palette colors
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  });
  
  // Cluster marker icon for multiple activities
  const clusterIcon = (count) => L.divIcon({
    className: 'custom-cluster',
    html: `<div style="background: linear-gradient(135deg, #D06060 0%, #F08080 100%); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${count}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  
  Object.values(uniqueLocations).forEach(group => {
    const activity = group[0];
    const locationName = activity.location || 'Ubicación';
    const popupContent = group.length === 1 ?
      `<div style="min-width: 200px; max-width: 300px;">
        <b>${activity.title}</b><br>
        ${activity.category}<br>
        ${locationName}<br><br>
        <button onclick="filterByLocationAndShowList(${activity.lat}, ${activity.lon})"
                style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500;">
          Lista
        </button>
      </div>` :
      `<div style="min-width: 200px; max-width: 300px; max-height: 300px; display: flex; flex-direction: column;">
        <b>${group.length} actividades</b>
        <div style="overflow-y: auto; flex: 1; margin: 8px 0; padding-right: 8px;">
          ${group.map(a => `• ${a.title}`).join('<br>')}
        </div>
        <button onclick="filterByLocationAndShowList(${activity.lat}, ${activity.lon})"
                style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; margin-top: 8px; flex-shrink: 0;">
          Lista
        </button>
      </div>`;

    const markerIcon = group.length === 1 ? customIcon : clusterIcon(group.length);

    L.marker([activity.lat, activity.lon], { icon: markerIcon }).addTo(map)
      .bindPopup(popupContent);
  });

}

// Update map markers without reinitializing the map
function updateMapMarkers() {
  if (!map) return;
  
  // Clear existing markers (except user location marker)
  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== window.userLocationMarker) {
      map.removeLayer(layer);
    }
  });
  
  // Add activity markers based on filtered activities
  const activitiesWithCoords = filteredActivities.filter(a => a.lat && a.lon);
  const uniqueLocations = {};
  
  activitiesWithCoords.forEach(activity => {
    const key = `${activity.lat.toFixed(5)},${activity.lon.toFixed(5)}`;
    if (!uniqueLocations[key]) {
      uniqueLocations[key] = [];
    }
    uniqueLocations[key].push(activity);
  });
  
  // Custom marker icon with palette colors
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); width: 20px; height: 20px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  });
  
  // Cluster marker icon for multiple activities
  const clusterIcon = (count) => L.divIcon({
    className: 'custom-cluster',
    html: `<div style="background: linear-gradient(135deg, #D06060 0%, #F08080 100%); width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${count}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  
  Object.values(uniqueLocations).forEach(group => {
    const activity = group[0];
    const locationName = activity.location || 'Ubicación';
    const popupContent = group.length === 1 ?
      `<div style="min-width: 200px; max-width: 300px;">
        <b>${activity.title}</b><br>
        ${activity.category}<br>
        ${locationName}<br><br>
        <button onclick="filterByLocationAndShowList(${activity.lat}, ${activity.lon})"
                style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500;">
          Lista
        </button>
      </div>` :
      `<div style="min-width: 200px; max-width: 300px; max-height: 300px; display: flex; flex-direction: column;">
        <b>${group.length} actividades</b>
        <div style="overflow-y: auto; flex: 1; margin: 8px 0; padding-right: 8px;">
          ${group.map(a => `• ${a.title}`).join('<br>')}
        </div>
        <button onclick="filterByLocationAndShowList(${activity.lat}, ${activity.lon})"
                style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; margin-top: 8px; flex-shrink: 0;">
          Lista
        </button>
      </div>`;

    const markerIcon = group.length === 1 ? customIcon : clusterIcon(group.length);

    L.marker([activity.lat, activity.lon], { icon: markerIcon }).addTo(map)
      .bindPopup(popupContent);
  });

}

// Render statistics
function renderStats() {
  // Category chart
  const catCounts = {};
  filteredActivities.forEach(a => {
    catCounts[a.category] = (catCounts[a.category] || 0) + 1;
  });
  
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCat = Math.max(...sortedCats.map(c => c[1]));
  
  document.getElementById('categoryChart').innerHTML = sortedCats.map(([cat, count]) => `
    <div class="flex items-center gap-3">
      <span class="text-body-md w-24 truncate">${cat}</span>
      <div class="flex-1 bg-surface-container-low rounded-full h-4 overflow-hidden">
        <div class="bg-primary h-full rounded-full" style="width: ${(count / maxCat * 100)}%"></div>
      </div>
      <span class="text-label-sm w-8 text-right">${count}</span>
    </div>
  `).join('');
  
  // District chart
  const distCounts = {};
  filteredActivities.forEach(a => {
    if (a.district && a.district !== 'Desconocido') {
      distCounts[a.district] = (distCounts[a.district] || 0) + 1;
    }
  });
  
  const sortedDists = Object.entries(distCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxDist = Math.max(...sortedDists.map(d => d[1]), 1);
  
  document.getElementById('districtChart').innerHTML = sortedDists.map(([dist, count]) => `
    <div class="flex items-center gap-3">
      <span class="text-body-md w-32 truncate">${dist}</span>
      <div class="flex-1 bg-surface-container-low rounded-full h-4 overflow-hidden">
        <div class="bg-secondary h-full rounded-full" style="width: ${(count / maxDist * 100)}%"></div>
      </div>
      <span class="text-label-sm w-8 text-right">${count}</span>
    </div>
  `).join('');
  
  // Free chart
  const freeCount = filteredActivities.filter(a => a.free).length;
  const paidCount = filteredActivities.length - freeCount;
  const total = filteredActivities.length || 1;
  
  document.getElementById('freeChart').innerHTML = `
    <div style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%); width: ${(freeCount / total * 100)}%"></div>
    <div style="background: linear-gradient(135deg, #D06060 0%, #F08080 100%); width: ${(paidCount / total * 100)}%"></div>
  `;
  
  document.getElementById('freeLegend').innerHTML = `
    <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full" style="background: linear-gradient(135deg, #F08080 0%, #F4978E 100%);"></span> Gratis: ${freeCount}</span>
    <span class="inline-flex items-center gap-1 ml-3"><span class="w-3 h-3 rounded-full" style="background: linear-gradient(135deg, #D06060 0%, #F08080 100%);"></span> De pago: ${paidCount}</span>
  `;
}

// Pagination
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderActivities();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  if (currentPage < totalPages - 1) {
    currentPage++;
    renderActivities();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Clear filters
function clearFilters() {
  // Reset KPI filters
  activeKPIFilters = [];
  updateKPICardStyles();
  
  // Reset multi-select state
  multiSelectState.category = [];
  multiSelectState.district = [];
  multiSelectState.audience = [];
  multiSelectState.time = [];

  // Uncheck all multi-select checkboxes with validation
  ['district', 'audience'].forEach(type => {
    const dropdown = document.getElementById(type + 'Dropdown');
    if (dropdown) {
      const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
    }
    
    // Reset labels
    const defaults = {
      district: 'Todos',
      audience: 'Todos'
    };
    const labelEl = document.getElementById(type + 'SelectLabel');
    if (labelEl) {
      labelEl.textContent = defaults[type];
    }
  });

  // Reset category grid buttons
  const categoryGrid = document.getElementById('categoryGrid');
  if (categoryGrid) {
    categoryGrid.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
    });
  }

  // Reset time grid buttons
  const timeGrid = document.getElementById('timeGrid');
  if (timeGrid) {
    timeGrid.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.add('border-outline-variant');
    });
  }

  // Reset audience grid buttons
  const audienceGrid = document.getElementById('audienceGrid');
  if (audienceGrid) {
    audienceGrid.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      btn.classList.add('border-outline-variant');
    });
  }

  currentFilters = {
    category: [],
    district: [],
    audience: [],
    date: 'all',
    time: [],
    search: '',
    freeOnly: false,
    favoritesOnly: false,
    nearOnly: false,
    location: null,
    locationCoords: null,
    locationKey: null,
    sort: 'recent',
    durationMin: 1,
    durationMax: 30
  };
  
  // Reset duration filter state
  durationFilterState = { min: 1, max: 30 };
  
  // Reset date filter state (without rendering calendar since we're clearing all)
  dateFilterState.mode = 'shortcut';
  dateFilterState.shortcut = 'all';
  dateFilterState.pickerStart = null;
  dateFilterState.pickerEnd = null;
  calendarState.selecting = false;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  const filterSearchInput = document.getElementById('filterSearchInput');
  if (filterSearchInput) filterSearchInput.value = '';
  
  const dateSelect = document.getElementById('dateSelect');
  if (dateSelect) dateSelect.value = 'all';
  
  setSortState('recent');
  
  const freeCheckbox = document.getElementById('freeOnly');
  if (freeCheckbox) freeCheckbox.checked = false;
  
  const favCheckbox = document.getElementById('favoritesOnly');
  if (favCheckbox) favCheckbox.checked = false;

  const locationInput = document.getElementById('locationInput');
  if (locationInput) {
    locationInput.classList.add('hidden');
  }
  
  // Reset main tabs to 'recent' as default
  setMainTab('recent');

  applyFilters();
  
  // Force update of active filter chips to ensure bar is hidden when empty
  updateActiveFilterChips();
}

// Update filter indicators in the filters list view
function updateFilterIndicators() {
  // Search indicator
  const searchIndicator = document.getElementById('filterIndicator_search');
  if (searchIndicator) {
    const searchValue = currentFilters.search || '';
    if (searchValue.length > 0) {
      // Truncate if too long (max 15 chars + ...)
      const displayText = searchValue.length > 15 ? searchValue.substring(0, 15) + '...' : searchValue;
      searchIndicator.textContent = `"${displayText}"`;
      searchIndicator.classList.remove('hidden');
    } else {
      searchIndicator.classList.add('hidden');
    }
  }

  // Category indicator
  const catIndicator = document.getElementById('filterIndicator_category');
  if (catIndicator) {
    const count = multiSelectState.category.length;
    if (count > 0) {
      catIndicator.textContent = count === 1 ? '1 seleccionada' : `${count} seleccionadas`;
      catIndicator.classList.remove('hidden');
    } else {
      catIndicator.classList.add('hidden');
    }
  }
  
  // District indicator
  const distIndicator = document.getElementById('filterIndicator_district');
  if (distIndicator) {
    const count = multiSelectState.district.length;
    if (count > 0) {
      distIndicator.textContent = count === 1 ? '1 seleccionado' : `${count} seleccionados`;
      distIndicator.classList.remove('hidden');
    } else {
      distIndicator.classList.add('hidden');
    }
  }
  
  // Audience indicator
  const audIndicator = document.getElementById('filterIndicator_audience');
  if (audIndicator) {
    const count = multiSelectState.audience.length;
    if (count > 0) {
      audIndicator.textContent = count === 1 ? '1 seleccionado' : `${count} seleccionados`;
      audIndicator.classList.remove('hidden');
    } else {
      audIndicator.classList.add('hidden');
    }
  }
  
  // Time indicator
  const timeIndicator = document.getElementById('filterIndicator_time');
  if (timeIndicator) {
    const count = multiSelectState.time.length;
    if (count > 0) {
      timeIndicator.textContent = count === 1 ? '1 seleccionado' : `${count} seleccionados`;
      timeIndicator.classList.remove('hidden');
    } else {
      timeIndicator.classList.add('hidden');
    }
  }
  
  // Date indicator
  const dateIndicator = document.getElementById('filterIndicator_date');
  if (dateIndicator) {
    if (dateFilterState.mode === 'picker' && dateFilterState.pickerStart) {
      const start = dateFilterState.pickerStart;
      const end = dateFilterState.pickerEnd || start;
      const formatDate = (date) => date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      
      if (start.getTime() === end.getTime()) {
        dateIndicator.textContent = formatDate(start);
      } else {
        dateIndicator.textContent = `${formatDate(start)} - ${formatDate(end)}`;
      }
      dateIndicator.classList.remove('hidden');
    } else if (dateFilterState.mode === 'shortcut' && dateFilterState.shortcut !== 'all') {
      const shortcutLabels = {
        'today': 'Hoy',
        'tomorrow': 'Mañana',
        'weekend': 'Este finde',
        '7days': '7 días'
      };
      dateIndicator.textContent = shortcutLabels[dateFilterState.shortcut] || '';
      dateIndicator.classList.remove('hidden');
    } else {
      dateIndicator.classList.add('hidden');
    }
  }
  
  // Duration indicator
  const durIndicator = document.getElementById('filterIndicator_duration');
  if (durIndicator) {
    const min = durationFilterState.min;
    const max = durationFilterState.max;
    
    // Only show if not default range (1-30)
    if (min > 1 || max < 30) {
      if (min === max) {
        durIndicator.textContent = min === 1 ? '1 día' : `${min} días`;
      } else {
        const maxText = max >= 30 ? '30+' : max;
        durIndicator.textContent = `${min}-${maxText} días`;
      }
      durIndicator.classList.remove('hidden');
    } else {
      durIndicator.classList.add('hidden');
    }
  }
}

// Close sort modal on outside click
document.getElementById('sortModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeSortModal();
  }
});

// Close saved filters modal on outside click
document.addEventListener('click', function(e) {
  const savedFiltersModal = document.getElementById('savedFiltersModal');
  if (savedFiltersModal && e.target === savedFiltersModal) {
    closeSavedFiltersModal();
  }
});

// Close login modal on Enter key
const passwordInput = document.getElementById('passwordInput');
if (passwordInput) {
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkPassword();
    }
  });
}

// Manejar navegación con botón atrás (popstate) - solo en app
window.addEventListener('popstate', function(e) {
  // Detectar si es app (Cordova) o HTML puro
  const isApp = typeof cordova !== 'undefined' || (window.webkit && window.webkit.messageHandlers);
  
  if (!isApp) return; // En HTML puro, no interceptar el botón atrás
  
  const state = e.state;
  
  if (state && state.view) {
    // Restaurar vista según el estado
    if (state.view === 'detail') {
      // Si estamos en detail y vamos atrás, cerrar detail y volver a la vista anterior
      document.getElementById('detailView').classList.add('hidden');
      currentDetailId = null;
      if (detailMap) {
        detailMap.remove();
        detailMap = null;
      }
      // Mostrar la bottom nav y header
      const bottomNav = document.querySelector('nav.fixed.bottom-0');
      if (bottomNav) bottomNav.classList.remove('hidden');
      const mainHeader = document.getElementById('mainHeader');
      if (mainHeader) mainHeader.classList.remove('hidden');
      
      // Volver a la vista anterior guardada en el estado o en variable global
      const previousView = state.previousView || window.previousViewBeforeDetail || 'home';
      showView(previousView);
      updateBottomTabUI(previousView);
    } else if (state.view === 'home') {
      showView('home');
      updateBottomTabUI('home');
    } else if (state.view === 'list') {
      showView('list');
      updateBottomTabUI('list');
    } else if (state.view === 'map') {
      showView('map');
      updateBottomTabUI('map');
    } else if (state.view === 'favorites') {
      showView('list');
      updateBottomTabUI('favorites');
    } else if (state.view === 'profile') {
      showView('profile');
      updateBottomTabUI('profile');
    }
  } else {
    // Sin estado: estamos en home, permitir que la app se cierre (no hacer nada)
    // El SO manejará el cierre de la app
  }
});

// Helper para actualizar UI de bottom tabs
function updateBottomTabUI(view) {
  const tabMap = {
    'home': 'home',
    'list': 'list',
    'map': 'map',
    'favorites': 'favorites',
    'profile': 'profile'
  };
  
  const tab = tabMap[view] || 'home';
  document.querySelectorAll('.bottom-tab').forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'rounded-xl');
      btn.classList.remove('text-on-surface-variant');
    } else {
      btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'rounded-xl');
      btn.classList.add('text-on-surface-variant');
    }
  });
}

// Inicializar estado al cargar la página (solo en app)
const isAppEnv = typeof cordova !== 'undefined' || (window.webkit && window.webkit.messageHandlers);
if (isAppEnv && !window.location.hash) {
  history.replaceState({ view: 'home' }, '', '#home');
}

// ============================================
// NEW HOME REDESIGN FUNCTIONS
// ============================================

// Default image URL (same as in detail view)
const DEFAULT_ACTIVITY_IMAGE = 'https://st3.depositphotos.com/1594308/13059/i/450/depositphotos_130595028-stock-photo-dynamic-friends-enjoying-party-and.jpg';

// Helper function to get activity image URL (same logic as detail view)
function getActivityImage(activity) {
  // Buscar imagen en el mapa de Firebase (usando app_id o id)
  const activityId = activity.app_id || activity.id;
  const firebaseImageUrl = imagenesMap[activityId];
  
  // Usar imagen de Firebase si existe
  if (firebaseImageUrl) {
    return firebaseImageUrl;
  }
  
  // Check if activity has image property
  if (activity.image) {
    return activity.image;
  }
  
  // Check if activity has image_url property
  if (activity.image_url) {
    return activity.image_url;
  }
  
  // Return default image (same as detail view)
  return DEFAULT_ACTIVITY_IMAGE;
}

// Home state
let homeQuickFilter = 'ALL'; // Changed from 'HOY' to show all activities by default
let selectedDistrict = localStorage.getItem('selectedDistrict') || 'Retiro';

// Category color mapping for icons
const categoryColors = {
  'Teatro': '#FCE4EC',
  'Títeres': '#E8D5F2',
  'Música': '#E3F2FD',
  'Talleres': '#FFF3E0',
  'Deporte': '#E8F5E9',
  'Cuentacuentos': '#E1F5FE',
  'Parques': '#F1F8E9',
  'Danza': '#F3E5F5',
  'Excursiones': '#E0F7FA',
  'Medio ambiente': '#E8F5E9',
  'default': '#F3F4F6'
};

// Emoji icon mapping for home cards (different from the existing categoryIcons)
const homeCategoryEmojis = {
  'Teatro': '🎭',
  'Títeres': '🎪',
  'Música': '🎵',
  'Talleres': '🎨',
  'Deporte': '⚽',
  'Cuentacuentos': '📚',
  'Parques': '🌳',
  'Danza': '💃',
  'Excursiones': '🏔️',
  'Medio ambiente': '🌿',
  'default': '📍'
};

// Quick filter selection
function selectQuickFilter(filter) {
  homeQuickFilter = filter;
  
  // Update UI
  document.querySelectorAll('.home-filter-chip').forEach(chip => {
    if (chip.dataset.filter === filter) {
      chip.classList.remove('inactive');
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
      chip.classList.add('inactive');
    }
  });
  
  // Re-render home sections with new filter
  renderNewHome();
}

// Get activities for a section
function getHomeSectionActivities(sectionType, limit = 6) {
  const now = new Date();
  const weekendDays = [0, 6]; // Sunday = 0, Saturday = 6
  const isWeekend = weekendDays.includes(now.getDay());
  
  let filtered = [...allActivities];
  
  // Apply quick filter date logic (only if not 'ALL')
  if (homeQuickFilter === 'HOY') {
    const today = now.toISOString().split('T')[0];
    filtered = filtered.filter(a => a.date && a.date.toISOString().split('T')[0] === today);
  } else if (homeQuickFilter === 'FINDE') {
    filtered = filtered.filter(a => {
      if (!a.date) return false;
      const day = a.date.getDay();
      return day === 0 || day === 6;
    });
  }
  
  // Apply section-specific filters
  switch (sectionType) {
    case 'featured':
      // Destacadas o Fiestas
      filtered = filtered.filter(a => 
        a.category === 'Destacadas' || 
        a.category === 'Fiestas' ||
        a.featured === true
      );
      // Sort by distance if location available, else by date
      if (userLocation) {
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      } else {
        filtered.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      }
      break;
      
    case 'family':
      // Niñas y niños o Familias
      filtered = filtered.filter(a => 
        a.audience?.includes('Niñas y niños') || 
        a.audience?.includes('Familias') ||
        a.category === 'Talleres' ||
        a.category === 'Teatro'
      );
      if (userLocation) {
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
      break;
      
    case 'personalized':
      // Based on user preferences
      const prefs = JSON.parse(localStorage.getItem('userPreferences') || '[]');
      const prefMap = {
        'titeres': 'Teatro',
        'musica': 'Música',
        'talleres': 'Talleres',
        'deporte': 'Deporte',
        'cuentos': 'Cuentacuentos',
        'parques': 'Parques',
        'teatro': 'Teatro',
        'danza': 'Danza',
        'excursiones': 'Excursiones'
      };
      const preferredCategories = prefs.map(p => prefMap[p]).filter(Boolean);
      
      if (preferredCategories.length > 0) {
        filtered = filtered.filter(a => preferredCategories.includes(a.category));
      }
      if (userLocation) {
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
      break;
      
    case 'babies':
      // 0-4 years: bebé, bebeteca, 0-3, 0 a 4, primera infancia
      const babyKeywords = ['bebé', 'bebe', 'bebeteca', '0-3', '0 a 4', '0 a 3', 'primera infancia', 'baby'];
      filtered = filtered.filter(a => {
        const text = (a.title + ' ' + (a.description || '')).toLowerCase();
        return babyKeywords.some(kw => text.includes(kw)) ||
               a.audience?.includes('Bebés') ||
               a.audience?.includes('0-4');
      });
      break;
      
    case 'outdoor':
      // Aire libre: parque, jardín, huerto, plaza, Madrid Río
      const outdoorKeywords = ['parque', 'jardín', 'jardin', 'huerto', 'plaza', 'madrid río', 'aire libre', 'exterior'];
      filtered = filtered.filter(a => {
        const text = (a.title + ' ' + (a.description || '') + ' ' + (a.location || '')).toLowerCase();
        return outdoorKeywords.some(kw => text.includes(kw)) ||
               a.category === 'Medio ambiente' ||
               a.category === 'Deporte' ||
               a.category === 'Parques';
      });
      break;
      
    case 'nearby':
      // Closest activities
      if (userLocation) {
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      } else {
        filtered.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      }
      break;
  }
  
  return {
    items: filtered.slice(0, limit),
    total: filtered.length
  };
}

// Render large card (featured)
function renderLargeCard(activity) {
  const imageUrl = getActivityImage(activity);
  const isFree = activity.price === 0 || activity.price === '0' || activity.free;
  const rating = activity.rating || (Math.random() * (5 - 4) + 4).toFixed(1); // Mock rating if not available
  
  return `
    <div class="home-card-large" onclick="showDetail('${activity.id}')">
      <img src="${imageUrl}" alt="${activity.title}" class="home-card-large-image" onerror="this.src='${DEFAULT_ACTIVITY_IMAGE}'">
      <div class="home-card-large-overlay">
        ${isFree ? '<span class="home-card-large-badge">GRATIS</span>' : ''}
        <div class="home-card-large-rating">
          <span class="material-symbols-outlined" style="font-size: 14px; color: #F59E0B;">star</span>
          ${rating}
        </div>
        <h3 class="home-card-large-title">${activity.title}</h3>
      </div>
    </div>
  `;
}

// Render medium card
function renderMediumCard(activity) {
  const imageUrl = getActivityImage(activity);
  const dateStr = activity.date ? activity.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
  const distance = activity.distance ? `${Math.round(activity.distance)} km` : '';
  
  return `
    <div class="home-card-medium" onclick="showDetail('${activity.id}')">
      <img src="${imageUrl}" alt="${activity.title}" class="home-card-medium-image" onerror="this.src='${DEFAULT_ACTIVITY_IMAGE}'">
      <div class="home-card-medium-content">
        <h3 class="home-card-medium-title">${activity.title}</h3>
        <p class="home-card-medium-meta">${dateStr} ${distance ? '• ' + distance : ''}</p>
      </div>
    </div>
  `;
}

// Render see more card
function renderSeeMoreCard(remainingCount, sectionType) {
  return `
    <div class="home-see-more-card" onclick="openFilteredList('${sectionType}')">
      <div class="home-see-more-circle">
        <span class="material-symbols-outlined" style="color: #4A90D9;">arrow_forward</span>
      </div>
      <span class="home-see-more-text">Ver más</span>
      ${remainingCount > 0 ? `<span class="home-see-more-count">${remainingCount} más</span>` : ''}
    </div>
  `;
}

// Render compact card (nearby list)
function renderCompactCard(activity) {
  const isFavorite = favorites.includes(String(activity.id));
  const icon = homeCategoryEmojis[activity.category] || homeCategoryEmojis.default;
  const bgColor = categoryColors[activity.category] || categoryColors.default;
  const timeText = activity.distance ? `🕒 ${Math.round(activity.distance * 10)} min` : '';
  const locationText = activity.district || activity.location || 'Madrid';
  
  return `
    <div class="home-card-compact" onclick="showDetail('${activity.id}')">
      <div class="home-card-compact-icon" style="background: ${bgColor};">
        <span style="font-size: 28px;">${icon}</span>
      </div>
      <div class="home-card-compact-content">
        <h3 class="home-card-compact-title">${activity.title}</h3>
        <div class="home-card-compact-meta">
          ${timeText ? `<span class="home-card-compact-time">${timeText}</span>` : ''}
          <span>📍 ${locationText}</span>
        </div>
      </div>
      <button class="home-card-compact-favorite ${isFavorite ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleHomeFavorite('${activity.id}')">
        <span class="material-symbols-outlined">${isFavorite ? 'favorite' : 'favorite_border'}</span>
      </button>
    </div>
  `;
}

// Toggle favorite from home
function toggleHomeFavorite(activityId) {
  const index = favorites.indexOf(String(activityId));
  if (index === -1) {
    favorites.push(String(activityId));
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem('madridFavorites', JSON.stringify(favorites));
  renderNewHome(); // Re-render to update UI
}

// Render carousel section
function renderCarouselSection(containerId, sectionType, cardRenderer, limit = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const { items, total } = getHomeSectionActivities(sectionType, limit);
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="home-empty-state">
        <span class="material-symbols-outlined home-empty-state-icon">search_off</span>
        <p>No hay planes disponibles</p>
      </div>
    `;
    return;
  }
  
  let html = items.map(activity => cardRenderer(activity)).join('');
  
  // Add "Ver más" card if there are more items
  if (total > limit) {
    html += renderSeeMoreCard(total - limit, sectionType);
  }
  
  container.innerHTML = html;
}

// Render the new home
function renderNewHome() {
  // Update greeting name based on user profile
  const greetingName = document.getElementById('homeGreetingName');
  const profileInitial = document.getElementById('homeProfileInitial');
  
  if (greetingName) {
    // Get user name from profile settings
    const userName = profileSettings?.email ? profileSettings.email.split('@')[0] : 'Familia';
    // Capitalize first letter
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
    greetingName.textContent = displayName;
  }
  
  if (profileInitial) {
    // Get initial from user name or default to 'F'
    const userName = profileSettings?.email ? profileSettings.email.split('@')[0] : 'F';
    profileInitial.textContent = userName.charAt(0).toUpperCase();
  }
  
  // Render sections
  renderCarouselSection('homeFeaturedCarousel', 'featured', renderLargeCard, 5);
  renderCarouselSection('homeFamilyCarousel', 'family', renderMediumCard, 6);
  renderCarouselSection('homePersonalizedCarousel', 'personalized', renderMediumCard, 6);
  renderCarouselSection('homeBabiesCarousel', 'babies', renderMediumCard, 6);
  renderCarouselSection('homeOutdoorCarousel', 'outdoor', renderMediumCard, 6);
  
  // Render nearby carousel (same format as other sections)
  renderCarouselSection('homeNearbyCarousel', 'nearby', renderMediumCard, 6);
}

// Filtered list view state
let filteredListSection = null;
let filteredListSort = 'distance';

// Open filtered list view - Now switches to list tab with applied filters
function openFilteredList(sectionType) {
  // Apply filters based on section type
  applySectionFilters(sectionType);
  
  // Switch to list tab
  setBottomTab('list');
  
  // Reset scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Also reset listView scroll if it has its own scroll container
  const listView = document.getElementById('listView');
  if (listView) {
    listView.scrollTop = 0;
  }
  
  // Reset main content scroll
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.scrollTop = 0;
  }
}

// Apply search from home search bar
function applyHomeSearch() {
  const searchInput = document.getElementById('homeSearchInput');
  if (searchInput && searchInput.value.trim()) {
    // Copy value to main search input
    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
      mainSearchInput.value = searchInput.value;
    }
    // Apply search and switch to list
    currentFilters.search = searchInput.value;
    applyFilters();
    setBottomTab('list');
  }
}

// Apply filters for a specific home section
function applySectionFilters(sectionType) {
  // First clear all existing filters
  clearFilters();
  
  const now = new Date();
  
  switch (sectionType) {
    case 'featured':
      // Destacadas: filter by category 'Destacada' or 'Fiestas'
      multiSelectState.category = ['Destacada', 'Fiestas'];
      break;
      
    case 'family':
      // Planes Familiares y de Niños: 
      // Filtro Público: "Niñas y niños" o "Familias"
      // Filtro Fecha: próximos 7 días
      multiSelectState.audience = ['Niños', 'Familias'];
      dateFilterState.mode = 'shortcut';
      dateFilterState.shortcut = '7days';
      // Calculate date range for 7 days
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 6);
      dateFilterState.pickerStart = new Date(now);
      dateFilterState.pickerEnd = weekEnd;
      break;
      
    case 'personalized':
      // Based on user preferences
      const prefs = JSON.parse(localStorage.getItem('userPreferences') || '[]');
      const prefMap = {
        'titeres': 'Teatro',
        'musica': 'Música',
        'talleres': 'Talleres',
        'deporte': 'Deporte',
        'cuentos': 'Cuentacuentos',
        'parques': 'Parques',
        'teatro': 'Teatro',
        'danza': 'Danza',
        'excursiones': 'Excursiones'
      };
      const preferredCategories = prefs.map(p => prefMap[p]).filter(Boolean);
      if (preferredCategories.length > 0) {
        multiSelectState.category = preferredCategories;
      }
      break;
      
    case 'babies':
      // Para los más Pequeños (0 a 4 años)
      // Filter by audience 'Bebés' or search keywords in title/description
      multiSelectState.audience = ['Niños']; // Base filter
      // Also add search filter for baby-related keywords
      currentFilters.search = 'bebé OR bebe OR bebeteca OR 0-3 OR 0 a 4 OR primera infancia OR baby';
      break;
      
    case 'outdoor':
      // Al Aire Libre
      // Filter by categories related to outdoor activities
      multiSelectState.category = ['Deportes', 'Excursiones'];
      // Add search filter for outdoor keywords
      currentFilters.search = 'parque OR jardín OR jardin OR huerto OR plaza OR madrid río OR aire libre OR exterior';
      break;
      
    case 'nearby':
      // Planes Cercanos - sort by distance if location available
      if (userLocation) {
        setSortState('distance');
      }
      break;
  }
  
  // Update UI to reflect new filter states
  updateUIFromFilterState();
  
  // Apply the filters
  applyFilters();
}

// Update UI elements to match current filter state
function updateUIFromFilterState() {
  // Update category grid
  const categoryGrid = document.getElementById('categoryGrid');
  if (categoryGrid) {
    categoryGrid.querySelectorAll('button').forEach(btn => {
      if (multiSelectState.category.includes(btn.dataset.value)) {
        btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
      } else {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
      }
    });
  }
  
  // Update audience grid
  const audienceGrid = document.getElementById('audienceGrid');
  if (audienceGrid) {
    audienceGrid.querySelectorAll('button').forEach(btn => {
      if (multiSelectState.audience.includes(btn.dataset.value)) {
        btn.classList.add('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('bg-primary-container', 'border-primary', 'text-on-primary-container');
        btn.classList.add('border-outline-variant');
      }
    });
  }
  
  // Update date shortcut styles
  updateDateShortcutStyles();
  
  // Update multi-select labels
  refreshFilterFieldLabel('category');
  refreshFilterFieldLabel('audience');
  refreshFilterFieldLabel('date');
  
  // Update search input
  const searchInput = document.getElementById('searchInput');
  const filterSearchInput = document.getElementById('filterSearchInput');
  if (searchInput && currentFilters.search) searchInput.value = currentFilters.search;
  if (filterSearchInput && currentFilters.search) filterSearchInput.value = currentFilters.search;
}

// Close filtered list view
function closeFilteredList() {
  document.getElementById('filteredListView').classList.add('hidden');
  document.getElementById('homeView').classList.remove('hidden');
  filteredListSection = null;
}

// Render filter chips for filtered list
function renderFilteredListChips(sectionType) {
  const container = document.getElementById('filteredListChips');
  if (!container) return;
  
  const chips = [];
  
  // Add quick filter chip
  const filterLabels = {
    'HOY': 'Hoy',
    'FINDE': 'Este finde',
    'TALLERES': 'Talleres',
    'TEATRO': 'Teatro',
    'AIRE_LIBRE': 'Aire libre'
  };
  chips.push(`<span class="filtered-list-chip">${filterLabels[homeQuickFilter] || homeQuickFilter}</span>`);
  
  // Add district chip
  chips.push(`<span class="filtered-list-chip">📍 ${selectedDistrict}</span>`);
  
  // Add section-specific chips
  const sectionChips = {
    'featured': ['Destacadas'],
    'family': ['Familias', 'Niños'],
    'personalized': ['Personalizado'],
    'babies': ['0-4 años'],
    'outdoor': ['Aire libre'],
    'nearby': ['Cercanos']
  };
  
  if (sectionChips[sectionType]) {
    sectionChips[sectionType].forEach(chip => {
      chips.push(`<span class="filtered-list-chip">${chip}</span>`);
    });
  }
  
  container.innerHTML = chips.join('');
}

// Render filtered list content
function renderFilteredList() {
  const container = document.getElementById('filteredListContent');
  if (!container || !filteredListSection) return;
  
  // Get all activities for this section (no limit)
  const { items } = getHomeSectionActivities(filteredListSection, 1000);
  
  // Apply sorting
  let sorted = [...items];
  if (filteredListSort === 'distance' && userLocation) {
    sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  } else if (filteredListSort === 'recent') {
    sorted.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  } else if (filteredListSort === 'rating') {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="home-empty-state">
        <span class="material-symbols-outlined home-empty-state-icon">search_off</span>
        <p>No se encontraron planes con estos filtros</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sorted.map(activity => renderCompactCard(activity)).join('');
}

// Sort filtered list
function sortFilteredList() {
  const select = document.getElementById('filteredListSort');
  if (select) {
    filteredListSort = select.value;
    renderFilteredList();
  }
}

// Show notifications
function showNotifications() {
  // TODO: Implement notifications view
  alert('Notificaciones: Próximamente');
}

// Override the existing renderHome function to use new design
const originalRenderHome = renderHome;
renderHome = function() {
  // Call the new home renderer
  renderNewHome();
};

// Initialize new home on load
document.addEventListener('DOMContentLoaded', function() {
  // Wait for activities to load
  const checkAndRender = setInterval(() => {
    if (allActivities.length > 0) {
      clearInterval(checkAndRender);
      renderNewHome();
    }
  }, 100);
  
  // Stop checking after 10 seconds
  setTimeout(() => clearInterval(checkAndRender), 10000);
});

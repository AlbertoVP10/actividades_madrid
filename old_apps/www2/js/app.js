/**
 * Madrid en Familia - App Principal
 * Single Page Application con navegación entre pantallas
 */

// ============================================
// ESTADO GLOBAL
// ============================================
const appState = {
    currentScreen: 'splashscreen',
    activities: [],
    filteredActivities: [],
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    preferences: JSON.parse(localStorage.getItem('preferences') || '[]'),
    filters: {
        categories: [],
        districts: [],
        audiences: [],
        times: [],
        search: '',
        kpi: null
    },
    userLocation: null,
    currentActivityIndex: 0,
    onboardingSlide: 0,
    map: null,
    markers: []
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Cargar actividades
    await loadActivities();
    
    // Verificar si es primera vez
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
        // Mostrar splashscreen y luego onboarding
        setTimeout(() => {
            showScreen('onboarding-screen');
        }, 2000);
    } else {
        // Ir directamente a home
        setTimeout(() => {
            hideSplashscreen();
            showScreen('home-screen');
            initHome();
        }, 1500);
    }
}

async function loadActivities() {
    try {
        // Intentar cargar desde la API local
        const response = await fetch('../data/actividades.json');
        if (response.ok) {
            appState.activities = await response.json();
        } else {
            // Datos de ejemplo si no hay API
            appState.activities = getSampleActivities();
        }
        appState.filteredActivities = [...appState.activities];
    } catch (error) {
        console.log('Usando datos de ejemplo');
        appState.activities = getSampleActivities();
        appState.filteredActivities = [...appState.activities];
    }
}

function getSampleActivities() {
    return [
        {
            id: 1,
            title: "Taller de títeres en el Retiro",
            description: "Taller creativo para niños donde aprenderán a hacer sus propios títeres.",
            category: "talleres",
            district: "Retiro",
            audience: "familias",
            date: new Date().toISOString().split('T')[0],
            time: "11:00",
            endTime: "13:00",
            price: 0,
            location: { lat: 40.4153, lng: -3.6844 },
            address: "Paseo del Prado, s/n, Madrid",
            image: null
        },
        {
            id: 2,
            title: "Concierto infantil en Matadero",
            description: "Concierto didáctico para toda la familia.",
            category: "musica",
            district: "Arganzuela",
            audience: "familias",
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: "17:00",
            endTime: "18:30",
            price: 0,
            location: { lat: 40.3928, lng: -3.6976 },
            address: "Plaza de Legazpi, 8, Madrid",
            image: null
        },
        {
            id: 3,
            title: "Cuentacuentos en la Biblioteca",
            description: "Sesión de cuentos para niños de 3 a 6 años.",
            category: "cuentos",
            district: "Centro",
            audience: "ninos",
            date: new Date().toISOString().split('T')[0],
            time: "10:00",
            endTime: "11:00",
            price: 0,
            location: { lat: 40.4168, lng: -3.7038 },
            address: "Calle de Alcalá, 25, Madrid",
            image: null
        }
    ];
}

// ============================================
// NAVEGACIÓN
// ============================================
function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla solicitada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    }
    
    // Inicializar pantalla específica
    if (screenId === 'home-screen') initHome();
    if (screenId === 'map-screen') initMap();
    if (screenId === 'favorites-screen') initFavorites();
    if (screenId === 'profile-screen') initProfile();
}

function navigateTo(screen) {
    switch(screen) {
        case 'home':
            showScreen('home-screen');
            break;
        case 'map':
            showScreen('map-screen');
            break;
        case 'favorites':
            showScreen('favorites-screen');
            break;
        case 'profile':
            showScreen('profile-screen');
            break;
    }
}

function hideSplashscreen() {
    const splash = document.getElementById('splashscreen');
    splash.classList.add('hidden');
}

// ============================================
// ONBOARDING
// ============================================
let onboardingInterval;

function nextOnboardingSlide() {
    const slides = document.getElementById('onboarding-slides');
    const dots = document.querySelectorAll('.onboarding-dot');
    const btn = document.getElementById('onboarding-next');
    
    if (appState.onboardingSlide < 2) {
        appState.onboardingSlide++;
        slides.style.transform = `translateX(-${appState.onboardingSlide * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === appState.onboardingSlide);
        });
        
        if (appState.onboardingSlide === 2) {
            btn.textContent = 'Comenzar';
        }
    } else {
        // Ir a preferencias
        showScreen('preferences-screen');
    }
}

function skipOnboarding() {
    localStorage.setItem('hasSeenOnboarding', 'true');
    hideSplashscreen();
    showScreen('home-screen');
    initHome();
}

// Touch/swipe support para onboarding
let touchStartX = 0;
let touchEndX = 0;

const onboardingContainer = document.getElementById('onboarding-screen');
if (onboardingContainer) {
    onboardingContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    onboardingContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && appState.onboardingSlide < 2) {
            nextOnboardingSlide();
        } else if (diff < 0 && appState.onboardingSlide > 0) {
            appState.onboardingSlide--;
            const slides = document.getElementById('onboarding-slides');
            const dots = document.querySelectorAll('.onboarding-dot');
            const btn = document.getElementById('onboarding-next');
            
            slides.style.transform = `translateX(-${appState.onboardingSlide * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === appState.onboardingSlide);
            });
            btn.textContent = 'Siguiente';
        }
    }
}

// ============================================
// PREFERENCIAS
// ============================================
function togglePreference(element) {
    const preference = element.dataset.preference;
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        if (!appState.preferences.includes(preference)) {
            appState.preferences.push(preference);
        }
    } else {
        appState.preferences = appState.preferences.filter(p => p !== preference);
    }
}

function savePreferences() {
    localStorage.setItem('preferences', JSON.stringify(appState.preferences));
    localStorage.setItem('hasSeenOnboarding', 'true');
    hideSplashscreen();
    showScreen('home-screen');
    initHome();
}

function showPreferencesScreen() {
    // Marcar preferencias guardadas
    document.querySelectorAll('.preference-item').forEach(item => {
        const pref = item.dataset.preference;
        if (appState.preferences.includes(pref)) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    showScreen('preferences-screen');
}

// ============================================
// HOME SCREEN
// ============================================
function initHome() {
    updateKPICounts();
    renderActivities();
    updateActiveFilters();
}

function updateKPICounts() {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    // Contar actividades de hoy
    const hoyCount = appState.activities.filter(a => a.date === today).length;
    document.getElementById('count-hoy').textContent = hoyCount;
    
    // Contar actividades de esta semana
    const semanaCount = appState.activities.filter(a => {
        return a.date >= today && a.date <= weekFromNow;
    }).length;
    document.getElementById('count-semana').textContent = semanaCount;
    
    // Contar cercanos (simulado - en realidad necesitaría geolocalización)
    document.getElementById('count-cercanos').textContent = appState.activities.length;
    
    // Contar gratuitos
    const gratisCount = appState.activities.filter(a => a.price === 0).length;
    document.getElementById('count-gratuitos').textContent = gratisCount;
}

function toggleKPI(kpiType) {
    const kpiBtn = document.getElementById(`kpi-${kpiType}`);
    
    // Desactivar todos los KPIs
    document.querySelectorAll('.kpi-card').forEach(card => {
        card.classList.remove('active', 'ring-2', 'ring-primary');
    });
    
    if (appState.filters.kpi === kpiType) {
        // Desactivar si ya estaba activo
        appState.filters.kpi = null;
    } else {
        // Activar nuevo KPI
        appState.filters.kpi = kpiType;
        kpiBtn.classList.add('active', 'ring-2', 'ring-primary');
    }
    
    applyFilters();
}

function handleSearch(query) {
    appState.filters.search = query.toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = [...appState.activities];
    
    // Filtro de búsqueda
    if (appState.filters.search) {
        filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(appState.filters.search) ||
            a.description.toLowerCase().includes(appState.filters.search) ||
            a.district.toLowerCase().includes(appState.filters.search)
        );
    }
    
    // Filtro KPI
    if (appState.filters.kpi) {
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        
        switch(appState.filters.kpi) {
            case 'hoy':
                filtered = filtered.filter(a => a.date === today);
                break;
            case 'semana':
                filtered = filtered.filter(a => a.date >= today && a.date <= weekFromNow);
                break;
            case 'gratuitos':
                filtered = filtered.filter(a => a.price === 0);
                break;
            case 'cercanos':
                // Ordenar por cercanía si tenemos ubicación
                if (appState.userLocation) {
                    filtered.sort((a, b) => {
                        const distA = calculateDistance(appState.userLocation, a.location);
                        const distB = calculateDistance(appState.userLocation, b.location);
                        return distA - distB;
                    });
                }
                break;
        }
    }
    
    // Filtros de categoría
    if (appState.filters.categories.length > 0) {
        filtered = filtered.filter(a => appState.filters.categories.includes(a.category));
    }
    
    // Filtros de distrito
    if (appState.filters.districts.length > 0) {
        filtered = filtered.filter(a => appState.filters.districts.includes(a.district));
    }
    
    // Filtros de público
    if (appState.filters.audiences.length > 0) {
        filtered = filtered.filter(a => appState.filters.audiences.includes(a.audience));
    }
    
    appState.filteredActivities = filtered;
    renderActivities();
}

function renderActivities() {
    const container = document.getElementById('activities-list');
    
    if (appState.filteredActivities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <p class="text-text-muted">No se encontraron actividades</p>
                <button onclick="clearFilters()" class="mt-4 text-primary font-medium">Limpiar filtros</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.filteredActivities.map((activity, index) => `
        <div class="activity-card bg-white rounded-2xl p-4 shadow-sm cursor-pointer" onclick="showActivityDetail(${activity.id}, ${index})">
            <div class="flex gap-4">
                <div class="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-3xl text-primary">${getCategoryIcon(activity.category)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm mb-1 truncate">${activity.title}</h3>
                    <p class="text-text-muted text-xs mb-2 line-clamp-2">${activity.description}</p>
                    <div class="flex items-center gap-3 text-xs text-text-muted">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">calendar_today</span>
                            ${formatDate(activity.date)}
                        </span>
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">schedule</span>
                            ${activity.time}
                        </span>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); toggleFavorite(${activity.id})" class="p-2 self-start">
                    <span class="material-symbols-outlined ${isFavorite(activity.id) ? 'filled text-red-500' : 'text-gray-400'}">
                        favorite
                    </span>
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        titeres: 'theater_comedy',
        musica: 'music_note',
        talleres: 'palette',
        deporte: 'sports_soccer',
        cuentos: 'menu_book',
        parques: 'forest',
        teatro: 'theaters',
        danza: 'accessibility_new',
        excursiones: 'hiking'
    };
    return icons[category] || 'event';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Hoy';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Mañana';
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ============================================
// FILTROS
// ============================================
function toggleFilterPanel() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        renderFilterOptions();
    }
}

function renderFilterOptions() {
    // Extraer categorías únicas
    const categories = [...new Set(appState.activities.map(a => a.category))];
    const districts = [...new Set(appState.activities.map(a => a.district))];
    const audiences = [...new Set(appState.activities.map(a => a.audience))];
    
    // Renderizar categorías
    document.getElementById('filter-categories').innerHTML = categories.map(cat => `
        <label class="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer">
            <input type="checkbox" value="${cat}" 
                ${appState.filters.categories.includes(cat) ? 'checked' : ''}
                onchange="toggleFilter('categories', '${cat}')"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary">
            <span class="capitalize">${cat}</span>
        </label>
    `).join('');
    
    // Renderizar distritos
    document.getElementById('filter-districts').innerHTML = districts.map(dist => `
        <label class="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer">
            <input type="checkbox" value="${dist}" 
                ${appState.filters.districts.includes(dist) ? 'checked' : ''}
                onchange="toggleFilter('districts', '${dist}')"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary">
            <span>${dist}</span>
        </label>
    `).join('');
    
    // Renderizar públicos
    document.getElementById('filter-audiences').innerHTML = audiences.map(aud => `
        <label class="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer">
            <input type="checkbox" value="${aud}" 
                ${appState.filters.audiences.includes(aud) ? 'checked' : ''}
                onchange="toggleFilter('audiences', '${aud}')"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary">
            <span class="capitalize">${aud}</span>
        </label>
    `).join('');
}

function toggleFilter(type, value) {
    const index = appState.filters[type].indexOf(value);
    if (index > -1) {
        appState.filters[type].splice(index, 1);
    } else {
        appState.filters[type].push(value);
    }
}

function clearFilters() {
    appState.filters = {
        categories: [],
        districts: [],
        audiences: [],
        times: [],
        search: '',
        kpi: null
    };
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.kpi-card').forEach(card => {
        card.classList.remove('active', 'ring-2', 'ring-primary');
    });
    applyFilters();
    toggleFilterPanel();
}

function updateActiveFilters() {
    const container = document.getElementById('active-filters');
    const allFilters = [
        ...appState.filters.categories.map(f => ({ type: 'cat', value: f })),
        ...appState.filters.districts.map(f => ({ type: 'dist', value: f })),
        ...appState.filters.audiences.map(f => ({ type: 'aud', value: f }))
    ];
    
    if (allFilters.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = allFilters.map(f => `
        <span class="filter-chip bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            ${f.value}
            <button onclick="removeFilter('${f.type === 'cat' ? 'categories' : f.type === 'dist' ? 'districts' : 'audiences'}', '${f.value}')" class="hover:text-primary-dark">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </span>
    `).join('');
}

function removeFilter(type, value) {
    const index = appState.filters[type].indexOf(value);
    if (index > -1) {
        appState.filters[type].splice(index, 1);
        applyFilters();
        updateActiveFilters();
    }
}

// ============================================
// DETALLE DE ACTIVIDAD
// ============================================
function showActivityDetail(activityId, index) {
    const activity = appState.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    appState.currentActivityIndex = index;
    
    const modal = document.getElementById('activity-detail');
    const content = document.getElementById('activity-detail-content');
    
    // Actualizar botones de navegación
    document.getElementById('btn-prev-activity').style.visibility = 
        index > 0 ? 'visible' : 'hidden';
    document.getElementById('btn-next-activity').style.visibility = 
        index < appState.filteredActivities.length - 1 ? 'visible' : 'hidden';
    
    content.innerHTML = `
        <div class="relative h-48 bg-primary/10">
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-primary/30">${getCategoryIcon(activity.category)}</span>
            </div>
        </div>
        <div class="p-4">
            <div class="flex items-start justify-between mb-4">
                <h2 class="text-xl font-bold flex-1 pr-4">${activity.title}</h2>
                <button onclick="toggleFavorite(${activity.id}); updateDetailFavorite(${activity.id})" class="p-2">
                    <span id="detail-favorite-icon" class="material-symbols-outlined text-2xl ${isFavorite(activity.id) ? 'filled text-red-500' : 'text-gray-400'}">
                        favorite
                    </span>
                </button>
            </div>
            
            <div class="space-y-3 mb-6">
                <div class="flex items-center gap-3 text-sm">
                    <span class="material-symbols-outlined text-text-muted">calendar_today</span>
                    <span>${formatDate(activity.date)}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                    <span class="material-symbols-outlined text-text-muted">schedule</span>
                    <span>${activity.time}${activity.endTime ? ' - ' + activity.endTime : ''}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                    <span class="material-symbols-outlined text-text-muted">location_on</span>
                    <span>${activity.address}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                    <span class="material-symbols-outlined text-text-muted">category</span>
                    <span class="capitalize">${activity.category}</span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                    <span class="material-symbols-outlined text-text-muted">euro</span>
                    <span>${activity.price === 0 ? 'Gratuito' : activity.price + '€'}</span>
                </div>
            </div>
            
            <p class="text-text-secondary text-sm mb-6 leading-relaxed">${activity.description}</p>
            
            <div class="flex gap-3">
                <button onclick="openDirections(${activity.location.lat}, ${activity.location.lng})" class="flex-1 bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">directions</span>
                    Cómo llegar
                </button>
                <button onclick="shareActivity(${activity.id})" class="px-4 py-3 border border-gray-300 rounded-xl">
                    <span class="material-symbols-outlined">share</span>
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeActivityDetail() {
    document.getElementById('activity-detail').classList.add('hidden');
}

function previousActivity() {
    if (appState.currentActivityIndex > 0) {
        const prevActivity = appState.filteredActivities[appState.currentActivityIndex - 1];
        showActivityDetail(prevActivity.id, appState.currentActivityIndex - 1);
    }
}

function nextActivity() {
    if (appState.currentActivityIndex < appState.filteredActivities.length - 1) {
        const nextActivity = appState.filteredActivities[appState.currentActivityIndex + 1];
        showActivityDetail(nextActivity.id, appState.currentActivityIndex + 1);
    }
}

function updateDetailFavorite(activityId) {
    const icon = document.getElementById('detail-favorite-icon');
    if (isFavorite(activityId)) {
        icon.classList.add('filled', 'text-red-500');
        icon.classList.remove('text-gray-400');
    } else {
        icon.classList.remove('filled', 'text-red-500');
        icon.classList.add('text-gray-400');
    }
}

function openDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

async function shareActivity(activityId) {
    const activity = appState.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: activity.title,
                text: activity.description,
                url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback: copiar al portapapeles
        const text = `${activity.title}\n${activity.description}\n${window.location.href}`;
        navigator.clipboard.writeText(text);
        alert('Enlace copiado al portapapeles');
    }
}

// ============================================
// FAVORITOS
// ============================================
function isFavorite(activityId) {
    return appState.favorites.includes(activityId);
}

function toggleFavorite(activityId) {
    const index = appState.favorites.indexOf(activityId);
    if (index > -1) {
        appState.favorites.splice(index, 1);
    } else {
        appState.favorites.push(activityId);
    }
    localStorage.setItem('favorites', JSON.stringify(appState.favorites));
    
    // Actualizar UI
    renderActivities();
    if (appState.currentScreen === 'favorites-screen') {
        initFavorites();
    }
}

function initFavorites() {
    const container = document.getElementById('favorites-list');
    const favoriteActivities = appState.activities.filter(a => appState.favorites.includes(a.id));
    
    if (favoriteActivities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">favorite_border</span>
                <p class="text-text-muted">No tienes favoritos guardados</p>
                <button onclick="navigateTo('home')" class="mt-4 text-primary font-medium">Explorar actividades</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoriteActivities.map((activity, index) => `
        <div class="activity-card bg-white rounded-2xl p-4 shadow-sm">
            <div class="flex gap-4">
                <div class="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-3xl text-primary">${getCategoryIcon(activity.category)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm mb-1 truncate">${activity.title}</h3>
                    <p class="text-text-muted text-xs mb-2 line-clamp-2">${activity.description}</p>
                    <div class="flex items-center gap-3 text-xs text-text-muted">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">calendar_today</span>
                            ${formatDate(activity.date)}
                        </span>
                    </div>
                </div>
                <button onclick="toggleFavorite(${activity.id})" class="p-2 self-start">
                    <span class="material-symbols-outlined filled text-red-500">favorite</span>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// MAPA
// ============================================
function initMap() {
    if (appState.map) {
        appState.map.remove();
    }
    
    // Crear mapa centrado en Madrid
    appState.map = L.map('map').setView([40.4168, -3.7038], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(appState.map);
    
    // Añadir marcadores
    appState.filteredActivities.forEach(activity => {
        if (activity.location) {
            const marker = L.marker([activity.location.lat, activity.location.lng])
                .addTo(appState.map)
                .bindPopup(`<b>${activity.title}</b><br>${activity.address}`);
            
            marker.on('click', () => {
                showActivityDetail(activity.id, appState.filteredActivities.indexOf(activity));
            });
            
            appState.markers.push(marker);
        }
    });
    
    // Mostrar bottom sheet
    setTimeout(() => {
        document.getElementById('map-bottom-sheet').classList.add('open');
    }, 500);
    
    // Renderizar lista en bottom sheet
    renderMapActivitiesList();
}

function renderMapActivitiesList() {
    const container = document.getElementById('map-activities-list');
    container.innerHTML = appState.filteredActivities.slice(0, 5).map((activity, index) => `
        <div class="activity-card bg-surface rounded-xl p-3 cursor-pointer" onclick="showActivityDetail(${activity.id}, ${index}); centerMapOnActivity(${activity.location.lat}, ${activity.location.lng})">
            <div class="flex gap-3">
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-xl text-primary">${getCategoryIcon(activity.category)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-sm truncate">${activity.title}</h4>
                    <p class="text-text-muted text-xs">${formatDate(activity.date)} · ${activity.time}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function centerMapOnActivity(lat, lng) {
    if (appState.map) {
        appState.map.setView([lat, lng], 16);
    }
}

function centerOnUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                appState.userLocation = { lat: latitude, lng: longitude };
                
                if (appState.map) {
                    appState.map.setView([latitude, longitude], 15);
                    
                    // Añadir marcador de usuario
                    L.circleMarker([latitude, longitude], {
                        radius: 8,
                        fillColor: '#6B4EE6',
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(appState.map).bindPopup('Tu ubicación');
                }
            },
            (error) => {
                alert('No se pudo obtener tu ubicación');
            }
        );
    }
}

function calculateDistance(loc1, loc2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ============================================
// PERFIL
// ============================================
function initProfile() {
    const container = document.getElementById('profile-preferences');
    
    if (appState.preferences.length === 0) {
        container.innerHTML = '<p class="text-text-muted text-sm">No has seleccionado preferencias</p>';
        return;
    }
    
    container.innerHTML = appState.preferences.map(pref => `
        <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium capitalize">
            ${pref}
        </span>
    `).join('');
}

function showInfo() {
    alert('Madrid en Familia v2.0\n\nDescubre actividades culturales gratuitas para niños en Madrid.');
}

function showAbout() {
    alert('Sobre la app\n\nMadrid en Familia es una aplicación para descubrir actividades culturales gratuitas para niños en Madrid.\n\nVersión 2.0');
}

function showPrivacy() {
    alert('Política de Privacidad\n\nEsta aplicación no recopila datos personales.\nLas preferencias se guardan localmente en tu dispositivo.\nNo utilizamos cookies de terceros.');
}

function showDonate() {
    alert('Gracias por tu interés!\n\nPróximamente añadiremos opciones de donación para mantener la app gratuita.');
}

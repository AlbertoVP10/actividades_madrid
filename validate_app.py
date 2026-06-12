#!/usr/bin/env python3
"""
Script para validar que la app funciona correctamente
"""

from playwright.sync_api import sync_playwright
import time

def validate_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 393, 'height': 852},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page = context.new_page()
        
        # Capturar errores de consola
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        print("🚀 Navegando a la app...")
        page.goto('http://localhost:8081', wait_until='networkidle')
        time.sleep(4)  # Esperar splashscreen
        
        # Verificar splashscreen
        splash = page.query_selector('#splashscreen')
        if splash:
            print("✅ Splashscreen presente")
        else:
            print("⚠️  No se encontró splashscreen")
        
        # Usar JavaScript para navegar rápido
        print("🔄 Navegando por la app...")
        page.evaluate('''
            // Ocultar splashscreen
            const splash = document.getElementById('splashscreen');
            if (splash) splash.classList.add('hidden');
            
            // Saltar onboarding
            const onboarding = document.getElementById('onboarding');
            if (onboarding) onboarding.classList.add('hidden');
            
            // Saltar preferencias
            const preferences = document.getElementById('preferences');
            if (preferences) preferences.classList.add('hidden');
        ''')
        time.sleep(1)
        
        # Verificar si checkPassword existe
        check_password_exists = page.evaluate('''typeof checkPassword === 'function' ''')
        print(f"🔍 checkPassword existe: {check_password_exists}")
        
        # Verificar login
        login_modal = page.query_selector('#loginModal')
        login_hidden = login_modal.evaluate('el => el.classList.contains("hidden")') if login_modal else True
        
        if login_modal and not login_hidden:
            print("✅ Login modal visible")
            
            # Hacer login con JavaScript
            print("🔑 Haciendo login...")
            result = page.evaluate('''
                try {
                    const passwordInput = document.getElementById('passwordInput');
                    if (passwordInput) passwordInput.value = 'abc123';
                    if (typeof checkPassword === 'function') {
                        checkPassword();
                        return 'success';
                    } else {
                        return 'checkPassword not found';
                    }
                } catch (e) {
                    return 'error: ' + e.message;
                }
            ''')
            print(f"   Resultado login: {result}")
            time.sleep(3)
            
            # Verificar si pasó al home
            home_view = page.query_selector('#homeView')
            home_hidden = home_view.evaluate('el => el.classList.contains("hidden")') if home_view else True
            
            if home_view and not home_hidden:
                print("✅ Login exitoso - Home visible")
            else:
                print("❌ Error: No se mostró el home después del login")
                
                # Verificar si el login modal sigue visible
                login_still_visible = login_modal.evaluate('el => !el.classList.contains("hidden")')
                if login_still_visible:
                    print("   ⚠️  El modal de login sigue visible")
                    
                    # Verificar error de contraseña
                    login_error = page.query_selector('#loginError')
                    if login_error:
                        error_visible = login_error.evaluate('el => !el.classList.contains("hidden")')
                        if error_visible:
                            print("   ❌ Error de contraseña mostrado")
                
                if console_errors:
                    print("   🐛 Errores de consola:")
                    for err in console_errors[:5]:
                        print(f"      - {err}")
                
                browser.close()
                return False
        else:
            print(f"❌ Login modal no visible (hidden: {login_hidden})")
            browser.close()
            return False
        
        # Verificar que hay actividades cargadas
        activities = page.query_selector_all('.activity-card, [onclick*="openDetail"]')
        if len(activities) > 0:
            print(f"✅ {len(activities)} actividades encontradas")
        else:
            print("⚠️  No se encontraron actividades visibles")
        
        # Abrir detalle de actividad
        print("📱 Abriendo detalle de actividad...")
        page.evaluate('''
            const cards = document.querySelectorAll('.activity-card, [onclick*="openDetail"], .home-carousel > div > div');
            if (cards.length > 0) cards[0].click();
        ''')
        time.sleep(2)
        
        # Verificar detalle
        detail_view = page.query_selector('#detailView')
        detail_hidden = detail_view.evaluate('el => el.classList.contains("hidden")') if detail_view else True
        
        if detail_view and not detail_hidden:
            print("✅ Detalle de actividad abierto")
            
            # Verificar elementos del detalle
            detail_image = page.query_selector('#detailImage')
            detail_title = page.query_selector('#detailTitle')
            detail_image_buttons = page.query_selector('#detailImageButtons')
            sticky_header = page.query_selector('#detailStickyHeader')
            
            if detail_image:
                print("✅ Imagen de detalle presente")
            else:
                print("❌ No se encontró imagen de detalle")
            
            if detail_title:
                print("✅ Título de detalle presente")
            else:
                print("❌ No se encontró título de detalle")
            
            if detail_image_buttons:
                print("✅ Botones sobre imagen presentes")
            else:
                print("❌ No se encontraron botones sobre imagen")
            
            if sticky_header:
                print("✅ Sticky header presente")
            else:
                print("❌ No se encontró sticky header")
            
            # Probar scroll
            print("📜 Probando scroll...")
            page.evaluate('document.getElementById("detailScrollContainer").scrollBy(0, 150)')
            time.sleep(1)
            
            # Verificar header scrolled
            if sticky_header:
                has_scrolled_class = sticky_header.evaluate('el => el.classList.contains("detail-header-scrolled")')
                if has_scrolled_class:
                    print("✅ Header cambió a color primario al hacer scroll")
                else:
                    print("⚠️  Header no cambió de color (puede necesitar más scroll)")
            
        else:
            print("❌ No se pudo abrir el detalle de actividad")
            browser.close()
            return False
        
        browser.close()
        print("\n✅ Validación completada exitosamente")
        return True

if __name__ == '__main__':
    success = validate_app()
    exit(0 if success else 1)

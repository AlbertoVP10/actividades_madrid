# Data Model: Android App Roadmap

## Primary Entities

### Activity
- **id**: Unique identifier for each cultural event
- **title**: Event name
- **description**: Summary of the activity
- **category**: One of Cine, Teatro, Música, Exposiciones, Talleres, Deportes, Danza, Literatura, Infantil, Fiestas, Destacada, Conferencias, Excursiones, Campamentos, Otras
- **district**: District or neighborhood string
- **date**: Event date or date range
- **time**: Start/end or time description
- **location**: Text address or venue name
- **lat** / **lon**: Coordinates for map placement
- **free**: Boolean flag for free entry
- **price**: Price description when not free
- **url**: Link to map directions or details

### FilterState
- **search**: Text search query
- **category**: Selected category filter
- **district**: Selected district filter
- **audience**: Audience filter (e.g., general, family)
- **date**: Date scope filter (e.g., all, week, today)
- **time**: Time filter (morning, afternoon, evening)
- **sort**: Sort mode identifier (`recent`, `price`, `distance`)
- **freeOnly**: Boolean for free-only events
- **favoritesOnly**: Boolean for favorites-only view

### UserPreference
- **favorites**: Array of activity ids stored in `localStorage`
- **lastLocation**: Last geocoded address or device coordinates
- **theme**: Optional `light`/`dark` state if theme toggling is supported

### AppConfig
- **packageName**: `com.myapp.id`
- **appName**: Localized app name
- **permissions**: Android runtime and manifest permissions (internet, location)
- **assets**: Bundled local assets vs remote CDN sources

## Relationships

- `FilterState` refines the visible set of `Activity` entities.
- `UserPreference.favorites` references `Activity.id` values.
- `AppConfig` defines how the app loads `index.html`, whether assets are served locally, and what Android permissions are required.

## Validation Rules

- `Activity.id` must be unique.
- `Activity.lat` and `Activity.lon` are required for map markers.
- `FilterState.sort` must be one of the supported sort modes.
- Favorite IDs must be persisted and restored consistently across sessions.
- Remote asset dependencies should degrade gracefully if unavailable.

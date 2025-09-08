# Cztery-De: Wizualizacja Przestrzeni 4D

Interaktywny projekt wizualizacji przestrzeni 4D z nawigowalnym hipercubem 4D (tesseraktem) z projekcją 3D w czasie rzeczywistym.

```bash
files-to-prompt  . -o llm-data/concat.txt -e .py -e .tsx -e .ts
```

## Obserwacje

- obecnie chyba używamy biblioteki renderującej w 3d. I siłą rzeczy rozwiązanie wireframe sprawia że czwarta współrzędna jest traktowana inaczej. Widzę 2 rozwiązania:
   - użycie wireframa, ale takiego, który byłby stosowany do wszystkich 4 współrzędnych (jak?) a nie tylko jednej wybranej
   - zrobienie jakiejś drogi (nie-euklidesowej geometrii) wizualizowania rzeczy, która 'rozszerza perspektywę' do 4 współrzędnych, starając się je wszystkie pomieścić. Poszukać czy takie coś istnieje (pokontemplować z Grokiem)
- rozrysować sobie na kartce jak dokładnie miałaby działać grawitacja (na hiperkuli). Jak ta siła miałaby ciągnąć wektorem rozbijanym na 4 kierunki itd.

## 🚀 Funkcje

- **Interaktywna Wizualizacja 4D**: Nawigacja przez przestrzeń 4D za pomocą sterowania klawiszami
- **Projekcja 3D w Czasie Rzeczywistym**: Zobacz kształty 4D projektowane w przestrzeń 3D
- **Backend FastAPI**: RESTful API do generowania kształtów 4D i transformacji
- **Frontend Next.js**: Nowoczesny frontend React z wizualizacją Three.js
- **Rozszerzalna Architektura**: Zbudowany dla łatwego rozszerzania i przyszłych ulepszeń

## 🏗️ Architektura

```
cztery-de/
├── backend/          # Backend FastAPI (Python/Poetry)
├── frontend/         # Frontend Next.js (React/TypeScript)
└── shared/           # Wspólne narzędzia i typy
```

## 🛠️ Stos Technologiczny

- **Backend**: FastAPI, Poetry, Pydantic, Uvicorn
- **Frontend**: Next.js, React, TypeScript, Three.js, Tailwind CSS
- **Rozwój**: Concurrently do uruchamiania obu usług

## 🚀 Pierwsze Kroki

### Wymagania wstępne

- Python 3.12+
- Node.js 18+
- Poetry
- npm

### Instalacja

1. **Sklonuj i skonfiguruj projekt**:
   ```bash
   git clone <repository-url>
   cd cztery-de
   ```

2. **Zainstaluj zależności**:
   ```bash
   npm install  # Instaluje concurrently i główne zależności
   npm run install  # Instaluje zależności backendu i frontendu
   ```

### Uruchamianie Aplikacji

**Tryb Rozwoju** (uruchamia zarówno frontend jak i backend):
```bash
npm run dev
```

To uruchomi:
- API backendu na `http://localhost:8000`
- Frontend na `http://localhost:3000`

**Pojedyncze Usługi**:
```bash
# Tylko backend
npm run dev:backend

# Tylko frontend
npm run dev:frontend
```

## 🎮 Sterowanie

### Ruch (Translacja)
- `WASD` - Ruch w płaszczyźnie X/Y
- `Q/E` - Ruch w górę/w dół (oś Z)
- `Z/X` - Ruch w 4. wymiarze (oś W)
- Klawisze strzałek również działają do podstawowego ruchu

### Obrót
- `I/K` - Obrót w płaszczyźnie XY
- `J/L` - Obrót w płaszczyźnie XZ
- `U/O` - Obrót w płaszczyźnie XW

## 🔧 Punkty Końcowe API

- `GET /` - Główny punkt API
- `GET /shapes/cube` - Pobierz hipercub 4D
- `POST /shapes/transform` - Zastosuj transformacje do kształtów
- `GET /health` - Sprawdzenie zdrowia

## 🏗️ Struktura Projektu

### Backend (`/backend`)
```
backend/
├── main.py           # Aplikacja FastAPI
├── pyproject.toml    # Konfiguracja Poetry
├── README.md         # Dokumentacja backendu
└── venv/            # Środowisko wirtualne
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Główna aplikacja
│   │   └── layout.tsx        # Układ aplikacji
│   ├── components/
│   │   └── FourDVisualization.tsx  # Komponent wizualizacji 4D
│   └── types/
│       └── 4d.ts             # Definicje typów TypeScript
├── package.json
└── next.config.ts
```

## 🔮 Przyszłe Rozszerzenia

- Pełna implementacja macierzy obrotu 4D
- Wielokrotne kształty 4D (sfery, cylindry, itp.)
- Animacja i interpolacja
- Wsparcie VR/AR
- Współpracująca wizualizacja wieloużytkownikowa
- Zaawansowane techniki projekcji
- Morfing i deformacja kształtów

## 📝 Rozwój

### Dodawanie Nowych Kształtów 4D

1. Dodaj logikę generowania kształtów do `backend/main.py`
2. Zaktualizuj typy TypeScript w `frontend/src/types/4d.ts`
3. Utwórz nowe punkty końcowe API w razie potrzeby

### Rozszerzanie Wizualizacji

1. Zmodyfikuj `FourDVisualization.tsx` dla nowych technik renderowania
2. Dodaj nowe kontrolki w `page.tsx`
3. Zaimplementuj dodatkowe macierze transformacji

## 🤝 Współpraca

1. Zrób fork repozytorium
2. Utwórz gałąź funkcji
3. Zrób swoje zmiany
4. Dodaj testy jeśli dotyczy
5. Prześlij pull request

## 📄 Licencja

Licencja MIT - zobacz plik LICENSE po szczegóły

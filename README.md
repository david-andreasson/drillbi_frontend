# Drillbi – Frontend (React)

**Drillbi Frontend** är en React-baserad single-page-applikation som konsumerar Drillbi-backendens REST-API och levererar hela quiz-upplevelsen: kursval, frågor i olika ordningar, svarshantering och live-statistik (poäng/felprocent) per session.

---

## Live

Produktionsmiljö: https://drillbi.se

---

## Backend

Applikationen använder **Drillbi-API:t** för all data och autentisering.  
Backendbeskrivning: se **Drillbi – Backend** https://github.com/david-andreasson/drillbi_backend


---

## Funktioner

- **Kurs & frågeflöde** – Välj kurs och ordning (`ORDER`, `RANDOM`, `REVERSE`). Hämta nästa fråga, skicka in svar och se uppdaterad statistik i realtid.  
- **Autentisering** – Frontend initierar Google OAuth2; backend utfärdar **JWT** för skyddade anrop.  
- **Sessioner & feedback** – Visar poäng och felprocent under pågående quiz-session.  
- **Adaptiv repetition** – Svarar man fel på en fråga **repeteras den automatiskt efter 5–10 (slumpat) nya frågor**.  
- **AI-förklaring vid fel svar** – Efter ett felaktigt svar kan man **begära en förklaring från AI** direkt i flödet.  
- **Integrationer via backend** – AI-generering (OpenAI/Anthropic), OCR med Tesseract (*foto-till-quiz*), Stripe för premium.  
- **Internationellt stöd (i18n)** – Grundstöd för svenska/engelska i UI-texter.

---

## Teknik i korthet

- **React 18**  
- **Vite** (build)  
- **React Router** (routing)  
- **i18n** för översättningar

---

## Licens

Detta projekt är **inte open source**. *All rights reserved.*  
Koden är publik enbart för visning i utbildnings-/portföljsyfte.  

Ingen användning, distribution eller modifiering är tillåten utan skriftligt tillstånd.  
Se `LICENSE` för fullständig text.

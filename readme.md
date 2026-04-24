# CyberSafe: A Social Engineering Attack Simulation System

> **Abstract**  
> CyberSafe is a cybersecurity awareness project that simulates social engineering attacks in a controlled learning environment. The system demonstrates how attackers manipulate people into revealing sensitive information such as usernames, passwords, and personal data through phishing-style scenarios, deceptive messages, and fake interactions. Its purpose is to help users understand common attack patterns, improve decision-making, and build stronger cybersecurity awareness through guided practice and feedback.

## Project Members
1. NEMAN NETRA CHANDRAKANT [Team Leader]
2. PATIL SAMIKSHA RAKESH
3. GAWADE DISHA GANESH

## Project Guides
1. PROF. MANSI TRIVEDI [Primary Guide]

## Subject Details
- Class: TE (AI&DS) Div A - 2025-2026
- Subject: Mini Project Lab: 2B (AI&DS) (MP 2B (A)(R19))
- Project Type: Mini Project

## Project Overview
CyberSafe is a full-stack web application that allows learners to practice identifying social engineering attacks across different difficulty levels. The system presents a mix of malicious and genuine scenarios, records user decisions, calculates scores, highlights weak areas, and provides prevention and recovery guidance. An admin dashboard is also included for monitoring learner activity and managing scenario content.

## Key Features
- User registration and login for learners and admins
- Simulation of social engineering scenarios such as phishing and deceptive communications
- Multiple difficulty levels with adaptive recommendations
- Five-scenario attempts with a mix of attack and genuine cases
- Score calculation with accuracy, feedback, and weak-area analysis
- Result history tracking for each learner
- Admin analytics dashboard
- Scenario library with create, update, and archive support
- Feedback collection after attempts

## Platform, Libraries and Frameworks Used
1. [Node.js](https://nodejs.org/)
2. [React](https://react.dev/)
3. [Vite](https://vite.dev/)
4. [Express.js](https://expressjs.com/)
5. [MongoDB](https://www.mongodb.com/)
6. [Mongoose](https://mongoosejs.com/)
7. [TypeScript](https://www.typescriptlang.org/)
8. [Zustand](https://zustand-demo.pmnd.rs/)
9. [Axios](https://axios-http.com/)

## Project Structure
```text
social-engineering-simulator/
|- client/    # React + Vite frontend
|- server/    # Express + TypeScript backend
|- readme.md
```

## Deployment Steps
Please follow the steps below to run this project locally.

1. Clone the repository and open it in your code editor.
2. Make sure `Node.js` and `MongoDB` are installed on your system.
3. Start MongoDB locally on `mongodb://127.0.0.1:27017`.
4. Open a terminal in the `server` folder and install dependencies:
   ```bash
   npm install
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
6. Open another terminal in the `client` folder and install dependencies:
   ```bash
   npm install
   ```
7. Start the frontend development server:
   ```bash
   npm run dev
   ```
8. Open the frontend URL shown by Vite in your browser, usually `http://localhost:5173`.
9. The backend runs on `http://localhost:5000` and connects to the local MongoDB database named `cyber-sim`.

## Default Configuration
- Frontend URL: `http://localhost:5173`
- Backend URL: `http://localhost:5000`
- API Base URL: `http://localhost:5000/api`
- MongoDB URL: `mongodb://127.0.0.1:27017/cyber-sim`

## Admin Access Note
The system supports admin registration using an invite code from the backend environment:

```env
ADMIN_INVITE_CODE=your-secret-code
```

If this variable is not configured, admin registration is disabled, but regular learner registration and login will still work.

## Functional Modules
- Authentication module
- Dashboard module
- Attack type selection
- Level selection
- Simulation engine
- Scoring and adaptive recommendation
- Result history and feedback
- Admin analytics dashboard
- Scenario management module

## Sample User Flow
1. Register or log in to the system.
2. Select an attack category and difficulty level.
3. Review each scenario and choose an action such as report, verify, ignore, or click.
4. Submit the attempt and view the score, explanations, prevention tips, and post-attack actions.
5. Review past scores or continue with the recommended next level.

## API Highlights
- `GET /api/simulate` - fetches simulation scenarios
- `POST /api/score` - calculates and stores attempt results
- `GET /api/results/:userId` - fetches learner score history
- `POST /api/feedback` - stores learner feedback
- `GET /api/admin/analytics` - returns admin dashboard analytics
- `GET /api/scenario` - fetches scenario library
- `POST /api/scenario` - creates a new scenario
- `PUT /api/scenario/:id` - updates a scenario
- `DELETE /api/scenario/:id` - archives a scenario
- `POST /api/login` - handles login and registration flow

## Educational Value
This project is intended for cybersecurity awareness and training purposes only. It helps learners recognize manipulation tactics, suspicious requests, urgency patterns, and spoofed communications in a safe environment.

## Future Enhancements
- Add more attack categories such as vishing, smishing, and baiting
- Introduce charts for score trends and learner progress
- Add role-based reporting and instructor views
- Support cloud deployment and environment-based configuration
- Expand the scenario dataset for more realistic simulations

## References
- [Node.js Documentation](https://nodejs.org/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Vite Documentation](https://vite.dev/guide/)

# Staff Hub

Build a modern, responsive frontend project for a **Staff Information System**. The frontend should be designed with clean UI/UX principles, using **React + TypeScript**, styled with **TailwindCSS** and **shadcn/ui** components. It must be easy to connect with a Django REST API backend.

### System Overview:

The system has two types of users:

1. **Normal Staff**

2. **Admin Staff**

### Normal Staff Features:

- Registration form to create an account (pending approval by Admin).

- Login functionality after approval.

- Ability to fill in portfolio details (role, department, image, address, LinkedIn profile).

- Ability to request leave (leave type, start date, end date, reason, days).

### Admin Staff Features:

- Login functionality.

- Dashboard for management tasks.

- Approve or reject Normal Staff registration requests.

- Full CRUD operations for:

  - User management

  - Portfolio management

  - Leave management

  - Department management

  - Role management

### Database Tables (to be reflected in frontend forms and views):

- **User**: username, fullname, gender, phone number, password, status (active/inactive)

- **Portfolio**: role (from role table), department (from department table), image, address, LinkedIn profile

- **StaffLeave**: leave type, start date, end date, reason, days, status

- **Department**: name, description

- **Role**: name, description

- **Leave**: name, description

### Requirements:

- Create separate dashboards for Normal Staff and Admin Staff.

- Use **JWT authentication** for login and session handling.

- Provide clear navigation (sidebar or top menu).

- Include forms with validation for all CRUD operations.

- Integrate Swagger/OpenAPI documentation link in the UI for developers.

- Use a professional, modern design (TailwindCSS + shadcn/ui).

- Ensure the frontend is modular and ready to connect with Django backend endpoints.

### Folder Structure (inside `src/`):

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://staff-hub-connect-43.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/94f8004c-ee92-4b22-96a6-219db32a947e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

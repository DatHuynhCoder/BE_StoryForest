# Web Manga/Novel Platform

A full-stack web application for reading and managing manga/novels, built using React.js, Express.js, MongoDB, and TailwindCSS.

## Features

- User authentication (signup/login/logout)
- Browse, search, and filter manga/novels
- Read manga/novels online
- Bookmark favorite manga/novels
- Admin panel for managing content
- Responsive UI with TailwindCSS
- AI for searching manga/novel base on description
- Cloning your voice for reading novel
- Reading manga when click on image

## Tech Stack

- **Frontend**: React.js, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **API**: MangaDex API (and custom API)

## Installation

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Clone the repository
```sh
git clone https://github.com/DatHuynhCoder/BE_StoryForest.git
cd BE_StoryForest
```

### Backend Setup
In Backend Directory(BE_StoryForest)
```sh
npm install
npm run app
```

### Frontend Setup
Please go to our Frontend project for more Infomation
- [FE_StoryForest](https://github.com/DatHuynhCoder/FE_StoryForest)

## Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=
MONGO_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
```

## Usage
- Run `npm run app` in `backend` and `npm run dev` in `frontend` directories.
- Ctrl + click on the link display in the terminal

## Our Design
- [Structure Design](https://drive.google.com/file/d/18xYJh17B0YMIHlQm0kixvrh87Uz981Zm/view?usp=sharing)
- [UI/UX Design](https://www.figma.com/design/MgHOWUFJYKD3JFOCdivLWd/StoryForest---07---NT208?node-id=4-358&t=RELcnZrUQvG86DKQ-1)
## License
This project is licensed under the MIT License.

## Contributions
Feel free to submit pull requests or report issues!

## Contact
For questions, reach out via GitHub issues or email me at [22520212@gm.uit.edu.vn].

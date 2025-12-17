# MoreForPlaying

## Our goal is to make a videogame website "Steam" alike, called: MoreForPlaying

## Development team members:

1. Paula de la Fuente Ruiz | p.delafuente.2024@alumnos.urjc.es | Paula-2704
2. Francisco García González | f.garcia.2024@alumnos.urjc.es | Fran-G-G
3. Marcos Vidal Castillo | m.vidalc.2024@alumnos.urjc.es | MarcosVC

## Funcionalities

### Entities

#### Main entity (Videogame):

Attributes:

- title
- price
- rating
- imageFilename
- developer
- editor
- release_date
- gamemods
- age_classification
- genres
- platforms
- short_description
- description
- reviews

#### Secondary entity (Review):

Attributes:

- username
- comment
- date
- rating
- imageFilename

### Images

- Entities will have associated images:
- Product: Each product can have multiple images (main, additional photos)
- Review: Reviews can include user-uploaded photos (screenshot, gameplay)

### Search, Filtering and Categorization

#### Search

- Text search: Search by name and description across all entities
- Advanced search: Combined filtering by multiple criteria

#### Filtering

- By category: Filtering based on predefined categories
- By date: Date range for creation/modification
- By status: Filter by current element status

#### Categorization

- Tag system for content classification

## Practice 1

###

### Web photos

#### Main page

![](/data/images/screenshotmain1.png)

#####

![](/data/images/screenshotmain2.png)

#####

![](/data/images/screenshotmain3.png)

#####

![](/data/images/screenshotmain4.png)

#####

![](/data/images/screenshotmain5.png)

#### Detail page

![](/data/images/screenshotsmc1.png)

#####

![](/data/images/screenshotsmc2.png)

#####

![](/data/images/screenshotsmc3.png)

#### New element page

![](/data/images/screenshotsmc4.png)

#####

![](/data/images/screenshotsmc5.png)

#####

![](/data/images/screenshotsmc6.png)

### History

#### Paula De La Fuente

- Description of my tasks during the practice:
  My main task was to develop the content for the detail page, minecraft.html. Throughout the process, I worked by combining and adjusting elements between minecraft.html and moreforplaying.css, ensuring that the visual style and structure of my section were consistent with my teammates’ work. In addition to creating the page content, I contributed several ideas to improve the overall design and collaborated on enhancing the website’s responsive behavior, making sure it adapted properly to different screen sizes and devices.

- 5 best commits:

  1. [Creo que ya añadi la pagina de detalle](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/e981ad7bca1e215afbf78c532309d0c754cba419)
  2. [Minecraft changed(14/10)](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/eee58f516925281d5edaf5b97bda5f0a44106795)
  3. [Minecraft fixed ](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/77dd61848b1f1eeba08b4787ff92ee60e83c6b87)
  4. [Minecraft changed (10/10)](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/dd12c3c090f1a64db23d5bee60e344b641b096d3)
  5. [css comment](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/914076644557927efda24015338bfc7e5800d37a)

- 5 files most participated:
  1. [Minecraft.html](./views/game.html)
  2. [MoreForPlaying.css](./public/MoreForPlaying.css)
  3. [MoreForPlaying.html](./views/index.html)
  4. [Readme.md](#moreforplaying)
  5. [CreateGame.html](./views/CreateGame.html)

#### Marcos Vidal

- Description of my tasks during the practice:
  I was in charge of creating the main page, as well as part of the style in the the css stylesheet. Firstly I divided the web in sections(Header, sidebar, content and footer) by using bootstrap. Afterwards, I decided to focus on the content since it was the main issue. Once I finished it, I worked on the style a little, added some icons, colors, links, etc. Finally, I made a few improvements and adjustments in order to make the web the as responsive as possible.

- 5 best commits:
  1. [Commit 1](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/c9da3b85f3322780f93b354e1c0b37ecac64ed9e)
  2. [Bootstrap, grid y link a Minecraft.html](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/59b432545af2740e513ea51fb94fffae1234cb16)
  3. [Content moved, sidebar added](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/c153ed8527f00d5306f99c8d965434c98b61c19b)
  4. [3x3.](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/5c18b143a48fedd9dbb9bb70f65ad3599d25bec0)
  5. [Content scroll](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/7d4c91615e7f7b91ca4fe7feb3190e37a5878c26)
- 5 files most participated:
  1. [MoreForPlaying.html](./views/index.html)
  2. [MoreForPlaying.css](./public/MoreForPlaying.css)
  3. [Readme.md](#moreforplaying)
  4. [Minecraft.html](./views/game.html)
  5. [CreateGame.html](./views/CreateGame.html)

#### Fran García

- Description of my tasks during the practice:
  I was responsible for creating the forms on the website. I started with the [CreateGame.html](./views/CreateGame.html) file, as it was the longest and most complex one. Once I finished it, I moved on to the reviews form in the [Minecraft.html](./views/game.html) file. I also made several small improvements and adjustments to other files, and contributed ideas for the website’s design to enhance the overall appearance.

- 5 best commits:
  1. [Add form file](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/259a680dd422c788c3bb64688aaa05487387b1eb)
  2. [Big changes to the form file, applying bootstrap elements](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/ebee7948065fe0907576df693345e7074882c5ad)
  3. [Improved Code](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/27793e321a66c19c55dacec6728e89a99d394daa)
  4. [Added the review form](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/bba2d6710eac8781a34f9ba9ece516df571f662f)
  5. [Changed the Minecraft form to make it prettier](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/2dd0d319cb70b99070de850c2e3350ff56542274)
- 5 files most participated:
  1. [CreateGame.html](./views/CreateGame.html)
  2. [Minecraft.html](./views/game.html)
  3. [MoreForPlaying.css](./public/MoreForPlaying.css)
  4. [MoreForPlaying.html](./views/index.html)
  5. [README.md](#moreforplaying)

## Practice 2

###

### Web video

[Video Demo](https://youtu.be/KqleKSxY0ak)

### Execution instructions

#### Requirements

- Node.js
- MongoDB
- npm

```bash
npm install
git clone https://github.com/CodeURJC-FW-2025-26/webapp10.git
cd webapp10
npm run watch
```

### Files description

#### data.json

It is the static database that is loaded when the web page starts

#### app.js

It is the central hub that brings together the Express framework, necessary external modules, and custom routing logic before finally launching the web server.

#### catalog.js

main data access module

#### load_data.js

Its main function is to initialize the application with demo data, ensuring that the system has base content each time it runs.

#### router.js

It manages the workflow of user requests, deciding what to do with them, how to interact with the data (via catalog.js), and what response to send (rendering views from views/).

#### CreateGame.html

It is the form to create a new game.

#### deleted.html

It is the page that indicates that a game or review has been deleted.

#### Error.html

This page indicates that the game has not been saved and shows the errors that were made during its creation.

#### footer.html, header.html and sidebar.html

Parts of the website common to all pages

#### game.html

general details page for all games created

#### index.html

Main page where the covers of all the games created are displayed

#### review_editor.html

Review editing form

#### Success.html

Page indicating that the review or game has been successfully saved

### History

#### Paula De La Fuente

- Description of my tasks during the practice:
  I was in charge of the details page: my job was to generalize the information on the details page, as well as implement the creation, deletion and editing of its reviews, working with game.html, editing the data.json and creating forms such as review_editor.

- 5 best commits:

  1. [static review editor added](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/ab5d4dfe12ed8849c8e70068ca35552599da145d)
  2. [reviews db](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/88edd850d3bc50f6f1dbbf4fc69b2a8f404723e8)
  3. [minecraft review stars](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/fc927e6bb05945631fd04785e6bccc33a305c4dc)
  4. [trying review](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/28f4b37594883489e2de1f3fa7acdec756203182)
  5. [id_bd](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/c4b72ad1788167a0b3f81bdefdfffb1457a790d5)

- 5 files most participated:
  1. [game.html](./views/game.html)
  2. [review_editor.html](./views/review_editor.js)
  3. [router.js](./src/router.js)
  4. [Readme.md](#moreforplaying)
  5. [data.json](./data/data.json)

#### Marcos Vidal

- Description of my tasks during the practice:
  I adapted the example exercise to our web, modified index.html into a mustache template, created files for the header, footer and sidebar, made some functions in router.js and cataloj.js in order to add pagination, filters by categories and a searchbar. Finally I helped to fix some errors.

- 5 best commits:
  1. [Db working](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/92a5091dcefe452693fe0512b63d9412a4718303)
  2. [index template](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/2719962b435e7ccb621efd6b29d536963c72796f)
  3. [rating in stars working](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/eaf900d0315cf19b9a2f91e8c11455f080b78742)
  4. [working pagination](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/2a47babad51f0b67bee3cf03678405574e6ceed6)
  5. [categories and more changes](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/10149fa915e59743f8ea2a0d9421327b152ae79e)
- 5 files most participated:
  1. [router.js](./src/router.js)
  2. [data.json](./data/data.json)
  3. [index.html](./views/index.html)
  4. [catalog.js](./src/catalog.js)
  5. [sidebar.html](./views/sidebar.html)

#### Fran García

- Description of my tasks during the practice:
  I was responsible for making the create game form work on the website. I started with the [CreateGame.html](./views/CreateGame.html) file and the [router.js](./src/router.js), as it was the principal one. I also created the [Succes.html](./views/Success.html) and the [Error.html](./views/Error.html) files. Once I finished it, I made the server validations. At the end, I also made the reviews form validations and added the descriptions to all the videogames in the [data.json](./data/data.json) file. I also made several small improvements and adjustments to other files.

- 5 best commits:

  1. [Fixed a problem with the names, and added to the data.json the info to all the other games, not only Minecraft.](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/a48b291a50adc6fe2a8a2bf82208cb96b39fe3e3)
  2. [Adding express to the form](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/b7bad7cc532a9868284a6fae67ed1d1914712c50)
  3. [Compleatly resolved the problem with the filters and the checkbox fields of the videogames. Edit game also added](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/4f5f79bfeec8f13adcc7d5444b9485cf78d31048)
  4. [New server validation options and new error page to show them](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/6dbeb8d4c417338dc40e75cd47fc2aa513cd3714)
  5. [Now the created games are being saved, but there are still thing to improve](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/89235677a711c50b246ececea7bc64967fc053a1)

- 5 files most participated:
  1. [CreateGame.html](./views/CreateGame.html)
  2. [router.js](./src/router.js)
  3. [data.json](./data/data.json)
  4. [CreateGame_editor.html](./views/CreateGame_editor.html)
  5. [Success.html](./views/Success.html)

## Practice 3

###

### Web video
[Video Demo](https://youtu.be/qpp032kf30Q)
### Execution instructions

#### Requirements

- Node.js
- MongoDB
- npm

```bash
npm install
git clone https://github.com/CodeURJC-FW-2025-26/webapp10.git
cd webapp10
npm run watch
```

### Files description

#### data.json

It is the static database that is loaded when the web page starts

#### infiniteScroll.js

It stores all the functions related to the infinite scrolling of the main page.

#### reviews.js

It is the document responsible for all functions related to the editing, creation, and deletion of reviews

#### validationsCreateGame.js

File responsible for the validations of creating and editing a game

#### app.js

It is the central hub that brings together the Express framework, necessary external modules, and custom routing logic before finally launching the web server.

#### catalog.js

main data access module

#### load_data.js

Its main function is to initialize the application with demo data, ensuring that the system has base content each time it runs.

#### router.js

It manages the workflow of user requests, deciding what to do with them, how to interact with the data (via catalog.js), and what response to send (rendering views from views/).

#### CreateGame.html

It is the form to create a new game.

#### deleted.html

It is the page that indicates that a game or review has been deleted.

#### Error.html

This page indicates that the game has not been saved and shows the errors that were made during its creation.

#### footer.html, header.html and sidebar.html

Parts of the website common to all pages

#### game.html

general details page for all games created

#### index.html

Main page where the covers of all the games created are displayed

#### review_editor.html

Review editing form

#### Success.html

Page indicating that the review or game has been successfully saved

### History

#### Paula De La Fuente

- Description of my tasks during the practice:
  In this final section, I've focused on everything related to reviews: using AJAX to create, edit, and delete reviews; transforming the review editing page to be integrated into the game's page; and enabling the use of a predefined image if the review doesn't contain one or if it's deleted. I also created the selector and implemented the AJAX function to delete a game.

- 5 best commits:

  1. [delete created](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/0b15d60b356e4591faf9293e2d69a619e77c542b)
  2. [CreateReview](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/fa58913450becf9998b7173511d7b8eb0f50831c)
  3. [form in game.html](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/47377b4c1245fda8e7ccac80020fca766f3434fa)
  4. [Deletereview with AJAX](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/45301c5f983adc4cd5c84d93c60b8e9b1f15ef71)
  5. [editreview with AJAX](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/a2ae1c1ef9e395189d7f3fa28b10eeaa823ecd8e)

- 5 files most participated:
  1. [reviews.js](./public/reviews.js)
  2. [game.html](./views/game.html)
  3. [router.js](./src/router.js)
  4. [Readme.md](#moreforplaying)
  5. [data.json](./data/data.json)

#### Marcos Vidal

- Description of my tasks during the practice:
  I was responsible for replacing the pagination from the previous practice with infinite scrolling. I created InfiniteScroll.js and adapted it to work exclusively with the content scroll. Subsequently, I implemented image previews and buttons to delete them. I also corrected several form validation errors, Bootstrap modal issues, and instances of code duplication. Finally, I added more data to the database for the demo example.

- 5 best commits:

1. [Infinite scroll + new games](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/...)
2. [Bootstrap modals unified](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/...)
3. [Spinner with styling + fixes in infiniteScroll.js](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/...)
4. [Image preview and delete buttons](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/...)
5. [Form validation corrections and code deduplication](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/...)

- 5 files most participated:
  1. [infiniteScroll.js](./public/infiniteScroll.js)
  2. [reviews.json](./public/reviews.js)
  3. [game.html](./views/game.html)
  4. [data.json](./data/data.json)
  5. [README.md](#moreforplaying)

#### Fran García

- Description of my tasks during the practice:
  I was responsible for upgrading the create game form and edit game form on the website. I started with the [validationsCreateGame.js](./public/validationsCreateGame.js) file, to add the Bootstrap validations for the client. Then I adjusted the [router.js](./src/router.js) to validate the same thing and in the same way as in the client. I also changed a little the [header.html](./views/header.html), [sidebar.html](./views/sidebar.html) and [footer.html](./views/footer.html) files to save space in the principal html's.

- 5 best commits:

  1. [Added cleanest and shotrest version of header, sidebar and footer to all html files](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/da73f81a86b8f0451650fe68b7ae8f28bba3e963)
  2. [All client validations working perfectly](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/cb671607182bdec58b91f519250861c889e2ff9e)
  3. [Bootstrap client validations. The AJAX part doesn't work correctly every time, I have to solve it.](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/92b818e1a216bb751a97b90389e4c9245790e5af)
  4. [Everything of the form working correctly. It only remains the image part](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/7737e8f753c2f76fbb337abfda4dd1a778444a02)
  5. [Adding the drag-and-drop for the image in the form (it's not finished yet)](https://github.com/CodeURJC-FW-2025-26/webapp10/commit/7bb672b5085d52b0c08b32bbc0cad40a05ad0fa2)

- 5 files most participated:
  1. [validationsCreateGame.js](./public/validationsCreateGame.js)
  2. [router.js](./src/router.js)
  3. [CreateGame.html](./views/CreateGame.html)
  4. [MoreForPlaying.css](./public/MoreForPlaying.css)
  5. [header.html](./views/header.html), [sidebar.html](./views/sidebar.html) and [footer.html](./views/footer.html)

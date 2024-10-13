# OlympicGamesStarter
The goal of this application is to provide users with a dashboard that allows them to visualize information from previous Olympic Games, such as the number of medals won by each country, among other statistics.

## Angular Version
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.3.

## **Installation**

To install OlympicGamesStarter, follow these steps: 
1. Clone the repository : https://github.com/CelineIntha/Projet2_Angular.git
2. Install dependencies: **`npm install`**
3. Build the project: **`npm run build`**
4. Start the project: **`npm start`** or **`ng serve`**

## **Usage**

To use the App, follow these steps:

1. Open the project in your favorite code editor (ex: VS Code, Sublime Text, Intellij idea).
2. Modify the source code to fit your needs.
3. Build the project: **`npm run build`**
4. Start the project: **`npm start`**
5. Use the project as desired.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## **Contributing**

If you'd like to contribute to this project, here are some guidelines:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes.
4. Write tests to cover your changes.
5. Run the tests to ensure they pass.
6. Commit your changes.
7. Push your changes to your forked repository.
8. Submit a pull request.

## Where to start

As you can see, an architecture has already been defined for the project. It is just a suggestion, you can choose to use your own. The predefined architecture includes (in addition to the default angular architecture) the following:

- `components` folder: contains every reusable components
- `pages` folder: contains components used for routing
- `core` folder: contains the business logic (`services` and `models` folders)

I suggest you to start by understanding this starter code. Pay an extra attention to the `app-routing.module.ts` and the `olympic.service.ts`.

Once mastered, you should continue by creating the typescript interfaces inside the `models` folder. As you can see I already created two files corresponding to the data included inside the `olympic.json`. With your interfaces, improve the code by replacing every `any` by the corresponding interface.

You're now ready to implement the requested features.

## **License**

Project Title is released under the MIT License. See the **[LICENSE](https://fr.wikipedia.org/wiki/Licence_MIT)** file for details.


## **Contact**

If you have any questions or comments about this project, please contact **[Céline](celine.intha@gmail.com)**.


Initial Project Setup 
1.1 Clone the Repository 
• git clone https://github.com/ma675/Procreator_Angular_Assignment.git 
1.2 Install Dependencies 
• npm install / npm install --force 
1.3 Install json-server 
• npm install -g json-server 1.4 Set Up the Mock Backend 
• The project uses json-server to simulate a REST API. 
The dbData.json file in the root directory contains the mock data for the application
Running the Project 
• To start the backend, run the following command in the root directory where dbData.json is 
• json-server --watch dbData.json --port 8080
2.1 Start the Angular Application 
• ng serve
